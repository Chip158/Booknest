#!/usr/bin/env python3
"""TV Remote: a phone remote for Google TV.

Runs on a computer on the same Wi-Fi as the TV, serves the remote web app to
your phone, and drives the TV over adb (Android network debugging).

    python3 server.py                 # then open http://<this computer>:8765 on your phone
    python3 server.py --tv 192.168.1.50

Standard library only. Needs `adb` (brew install android-platform-tools).
"""
import argparse
import json
import os
import re
import shlex
import socket
import subprocess
import threading
import urllib.parse
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
STATIC = ROOT / "static"
CONFIG_PATH = ROOT / "config.json"
ADB = os.environ.get("ADB", "adb")

KEYS = {
    "up": "DPAD_UP", "down": "DPAD_DOWN", "left": "DPAD_LEFT", "right": "DPAD_RIGHT",
    "select": "DPAD_CENTER", "back": "BACK", "home": "HOME", "menu": "MENU",
    "settings": "SETTINGS", "search": "SEARCH", "assistant": "ASSIST",
    "vol_up": "VOLUME_UP", "vol_down": "VOLUME_DOWN", "mute": "VOLUME_MUTE",
    "power": "POWER", "wake": "WAKEUP", "sleep": "SLEEP",
    "play_pause": "MEDIA_PLAY_PAUSE", "play": "MEDIA_PLAY", "pause": "MEDIA_PAUSE",
    "stop": "MEDIA_STOP", "ff": "MEDIA_FAST_FORWARD", "rew": "MEDIA_REWIND",
    "next": "MEDIA_NEXT", "prev": "MEDIA_PREVIOUS",
    "ch_up": "CHANNEL_UP", "ch_down": "CHANNEL_DOWN", "guide": "GUIDE",
    "input": "TV_INPUT", "captions": "CAPTIONS", "delete": "DEL", "enter": "ENTER",
}

# search: URL template the app opens for "play X on <app>"; {q} is URL-encoded.
APPS = [
    {"id": "youtube", "name": "YouTube", "package": "com.google.android.youtube.tv",
     "color": "#ff0033", "aliases": ["youtube", "you tube"],
     "search": "https://www.youtube.com/results?search_query={q}"},
    {"id": "netflix", "name": "Netflix", "package": "com.netflix.ninja",
     "color": "#e50914", "aliases": ["netflix"]},
    {"id": "disney", "name": "Disney+", "package": "com.disney.disneyplus",
     "color": "#113ccf", "aliases": ["disney plus", "disney+", "disney"]},
    {"id": "prime", "name": "Prime Video", "package": "com.amazon.amazonvideo.livingroom",
     "color": "#00a8e1", "aliases": ["prime video", "amazon prime", "prime", "amazon"]},
    {"id": "max", "name": "Max", "package": "com.wbd.stream",
     "color": "#002be7", "aliases": ["hbo max", "hbo", "max"]},
    {"id": "hulu", "name": "Hulu", "package": "com.hulu.livingroomplus",
     "color": "#1ce783", "aliases": ["hulu"]},
    {"id": "youtubetv", "name": "YouTube TV", "package": "com.google.android.youtube.tvunplugged",
     "color": "#cc0000", "aliases": ["youtube tv", "you tube tv", "live tv"]},
    {"id": "spotify", "name": "Spotify", "package": "com.spotify.tv.android",
     "color": "#1db954", "aliases": ["spotify", "music"], "search": "spotify:search:{q}"},
    {"id": "appletv", "name": "Apple TV", "package": "com.apple.atve.androidtv.appletv",
     "color": "#6e6e73", "aliases": ["apple tv", "apple"]},
    {"id": "paramount", "name": "Paramount+", "package": "com.cbs.ott",
     "color": "#0064ff", "aliases": ["paramount plus", "paramount+", "paramount"]},
    {"id": "peacock", "name": "Peacock", "package": "com.peacocktv.peacockandroid",
     "color": "#7a5cff", "aliases": ["peacock"]},
    {"id": "plex", "name": "Plex", "package": "com.plexapp.android",
     "color": "#e5a00d", "aliases": ["plex"]},
    {"id": "twitch", "name": "Twitch", "package": "tv.twitch.android.app",
     "color": "#9146ff", "aliases": ["twitch"]},
    {"id": "tubi", "name": "Tubi", "package": "com.tubitv",
     "color": "#fa541c", "aliases": ["tubi"]},
    {"id": "pluto", "name": "Pluto TV", "package": "tv.pluto.android",
     "color": "#fff200", "aliases": ["pluto tv", "pluto"]},
    {"id": "playstore", "name": "Play Store", "package": "com.android.vending",
     "color": "#01875f", "aliases": ["play store", "app store", "google play"]},
    {"id": "settings", "name": "Settings", "package": "com.android.tv.settings",
     "color": "#5f6368", "aliases": ["settings"], "action": "android.settings.SETTINGS"},
]
APPS_BY_ID = {a["id"]: a for a in APPS}


def load_config():
    try:
        return json.loads(CONFIG_PATH.read_text())
    except (OSError, ValueError):
        return {}


def save_config(cfg):
    CONFIG_PATH.write_text(json.dumps(cfg, indent=2))


class TVError(Exception):
    pass


class TV:
    """One Google TV reached over adb at host:5555."""

    def __init__(self, host):
        self.host = host
        self.serial = host if ":" in host else f"{host}:5555"
        self.lock = threading.Lock()

    def _adb(self, args, timeout=10):
        try:
            return subprocess.run([ADB, *args], capture_output=True, timeout=timeout)
        except FileNotFoundError:
            raise TVError("adb isn't installed on this computer (brew install android-platform-tools)")
        except subprocess.TimeoutExpired:
            raise TVError("The TV took too long to answer")

    def connect(self):
        out = self._adb(["connect", self.serial]).stdout.decode(errors="replace")
        return self.state() == "device", out.strip()

    def state(self):
        r = self._adb(["-s", self.serial, "get-state"], timeout=5)
        if r.returncode == 0:
            return r.stdout.decode().strip()
        err = r.stderr.decode(errors="replace")
        return "unauthorized" if "unauthorized" in err else "disconnected"

    def shell(self, command, binary=False, timeout=10):
        """Run an adb shell command, reconnecting once if the link dropped."""
        with self.lock:
            for attempt in range(2):
                args = ["-s", self.serial, "exec-out" if binary else "shell", command]
                r = self._adb(args, timeout=timeout)
                if r.returncode == 0:
                    return r.stdout if binary else r.stdout.decode(errors="replace")
                err = r.stderr.decode(errors="replace")
                if "unauthorized" in err:
                    raise TVError("Approve the 'Allow debugging?' prompt on the TV")
                if attempt == 0:
                    self._adb(["connect", self.serial])
            raise TVError(f"Can't reach the TV at {self.host}: {err.strip() or 'no response'}")

    def key(self, name, count=1):
        code = KEYS.get(name)
        if not code:
            raise TVError(f"Unknown button: {name}")
        self.shell("input keyevent " + " ".join([f"KEYCODE_{code}"] * max(1, min(count, 50))))

    def text(self, value):
        # `input text` treats %s as a space and can't take raw spaces.
        self.shell("input text " + shlex.quote(value.replace(" ", "%s")))

    def launch(self, app):
        if app.get("action"):
            self.shell(f"am start -a {app['action']}")
            return
        pkg = shlex.quote(app["package"])
        out = self.shell(f"monkey -p {pkg} -c android.intent.category.LEANBACK_LAUNCHER 1")
        if "No activities found" in out:
            out = self.shell(f"monkey -p {pkg} -c android.intent.category.LAUNCHER 1")
            if "No activities found" in out:
                raise TVError(f"{app['name']} isn't installed on the TV")

    def open_url(self, url, package=None):
        cmd = f"am start -a android.intent.action.VIEW -d {shlex.quote(url)}"
        if package:
            cmd += f" {shlex.quote(package)}"
        self.shell(cmd)

    def search(self, query):
        self.shell("am start -a android.search.action.GLOBAL_SEARCH --es query " + shlex.quote(query))

    def set_volume(self, level):
        self.shell(f"cmd media_session volume --show --stream 3 --set {int(level)}")

    def status(self):
        info = {"host": self.host, "state": self.state()}
        if info["state"] != "device":
            ok, _ = self.connect()
            info["state"] = self.state() if not ok else "device"
        if info["state"] != "device":
            return info
        try:
            power = self.shell("dumpsys power | grep -m1 mWakefulness=")
            info["awake"] = "Awake" in power
            top = self.shell("dumpsys activity activities | grep -m1 -E 'mResumedActivity|topResumedActivity'")
            m = re.search(r"\s([\w.]+)/", top)
            pkg = m.group(1) if m else None
            app = next((a for a in APPS if a["package"] == pkg), None)
            info["current"] = app["name"] if app else pkg
            vol = self.shell("cmd media_session volume --stream 3 --get")
            m = re.search(r"volume is (\d+) in range \[(\d+)\.\.(\d+)\]", vol)
            if m:
                info["volume"], info["volume_max"] = int(m.group(1)), int(m.group(3))
        except TVError:
            pass
        return info

    def installed(self):
        out = self.shell("pm list packages")
        return {line.split(":", 1)[1].strip() for line in out.splitlines() if line.startswith("package:")}

    def screenshot(self):
        return self.shell("screencap -p", binary=True, timeout=15)


# --- Plain-English commands -------------------------------------------------

NUMBERS = {w: i for i, w in enumerate(
    "zero one two three four five six seven eight nine ten eleven twelve thirteen "
    "fourteen fifteen sixteen seventeen eighteen nineteen twenty".split())}
ALIASES = sorted(((alias, app) for app in APPS for alias in app["aliases"]), key=lambda x: -len(x[0]))


def find_app(text):
    for alias, app in ALIASES:
        if re.search(rf"(?<![\w+]){re.escape(alias)}(?![\w+])", text):
            return app
    return None


def number(word, default=1):
    if word is None:
        return default
    return int(word) if word.isdigit() else NUMBERS.get(word, default)


NUM = r"(\d+|" + "|".join(NUMBERS) + r")"


def parse_clause(c):
    """Turn one clause like 'volume up 3' into (action dict, description)."""
    c = re.sub(r"^(please |can you |could you |hey |ok |okay )+", "", c).strip()
    c = re.sub(r"( please| for me| on the tv| on tv)$", "", c).strip()
    if not c:
        return None

    if re.fullmatch(r"(turn|switch|shut) (the )?(tv |television )?off|(turn|switch|shut) off( the)?( tv| television)?|power off|sleep|go to sleep|off", c):
        return {"do": "key", "key": "sleep"}, "Turning the TV off"
    if re.fullmatch(r"(turn|switch) (the )?(tv |television )?on|(turn|switch) on( the)?( tv| television)?|power on|wake( up)?|on", c):
        return {"do": "key", "key": "wake"}, "Turning the TV on"

    if m := re.fullmatch(rf"(?:set |change |put )?(?:the )?volume (?:to |at )?{NUM}(?: percent| %)?", c):
        return {"do": "volume", "level": number(m.group(1))}, f"Setting volume to {number(m.group(1))}"
    if m := re.fullmatch(rf"(?:turn (?:it|the volume|the sound) |volume |sound )(up|down)(?: by)?(?: {NUM})?(?: notches| steps| clicks)?", c) \
            or re.fullmatch(rf"(?:turn )?(?:the )?volume (up|down)(?: by)?(?: {NUM})?", c):
        n = number(m.group(2), 2)
        return {"do": "key", "key": "vol_up" if m.group(1) == "up" else "vol_down", "count": n}, f"Volume {m.group(1)} {n}"
    if re.fullmatch(r"(make it |a bit |a little )?(louder|turn it up)", c):
        return {"do": "key", "key": "vol_up", "count": 3}, "Louder"
    if re.fullmatch(r"(make it |a bit |a little )?(quieter|softer|turn it down)", c):
        return {"do": "key", "key": "vol_down", "count": 3}, "Quieter"
    if re.fullmatch(r"(un)?mute( (it|the tv|the sound|sound))?|silence", c):
        return {"do": "key", "key": "mute"}, "Toggling mute"

    if re.fullmatch(r"pause( it| this| the (show|movie|video))?|hold on|wait", c):
        return {"do": "key", "key": "pause"}, "Pausing"
    if re.fullmatch(r"(resume|unpause|continue|keep playing|play)( it| this)?", c):
        return {"do": "key", "key": "play"}, "Playing"
    if re.fullmatch(r"stop( it| playing| this)?", c):
        return {"do": "key", "key": "stop"}, "Stopping"
    if re.fullmatch(r"(fast ?forward|skip ahead|forward)", c):
        return {"do": "key", "key": "ff"}, "Fast-forwarding"
    if re.fullmatch(r"(rewind|go back a bit|skip back)", c):
        return {"do": "key", "key": "rew"}, "Rewinding"
    if re.fullmatch(r"(next( episode| song| track| video)?|skip( this)?)", c):
        return {"do": "key", "key": "next"}, "Next"
    if re.fullmatch(r"(previous|last)( episode| song| track| video)?", c):
        return {"do": "key", "key": "prev"}, "Previous"
    if re.fullmatch(r"(turn on |turn off |toggle |show |hide )?(captions|subtitles|cc)( on| off)?", c):
        return {"do": "key", "key": "captions"}, "Toggling captions"

    if re.fullmatch(r"(go )?home( screen)?|go to (the )?home( screen)?", c):
        return {"do": "key", "key": "home"}, "Going home"
    if re.fullmatch(r"(go )?back", c):
        return {"do": "key", "key": "back"}, "Going back"
    if m := re.fullmatch(rf"(?:go |move |press )?(up|down|left|right)(?: {NUM})?(?: times)?", c):
        n = number(m.group(2))
        return {"do": "key", "key": m.group(1), "count": n}, f"{m.group(1).title()} ×{n}" if n > 1 else m.group(1).title()
    if re.fullmatch(r"(press )?(ok|okay|select|enter|click( it)?|choose (it|that))", c):
        return {"do": "key", "key": "select"}, "Select"
    if re.fullmatch(r"(switch |change )?(the )?(input|source|hdmi)( \d)?", c):
        return {"do": "key", "key": "input"}, "Opening inputs"
    if re.fullmatch(r"(open |talk to |ask )?(the )?(google )?assistant|(open )?gemini", c):
        return {"do": "key", "key": "assistant"}, "Opening Google Assistant on the TV"

    if m := re.fullmatch(r"type (.+)", c):
        return {"do": "text", "text": m.group(1)}, f"Typing “{m.group(1)}”"

    if m := re.fullmatch(r"(?:play|watch|put on|find|search for|search|look up)\s+(.+?)\s+(?:on|in|from)\s+(.+)", c):
        app = find_app(m.group(2))
        if app:
            return {"do": "app_search", "app": app["id"], "query": m.group(1)}, f"Looking for “{m.group(1)}” on {app['name']}"

    if m := re.fullmatch(r"(?:open|launch|start|go to|switch to|put on|show me|bring up|pull up|watch|play)?\s*(?:the )?(.+?)(?: app)?", c):
        app = find_app(m.group(1))
        if app and len(m.group(1)) <= len(next(a for a in app["aliases"] if a in m.group(1))) + 4:
            return {"do": "launch", "app": app["id"]}, f"Opening {app['name']}"

    if m := re.fullmatch(r"(?:search(?: for)?|find|look up|play|watch|put on|show me)\s+(.+)", c):
        return {"do": "search", "query": m.group(1)}, f"Searching for “{m.group(1)}”"
    return None


def parse_command(text):
    """Split 'open youtube then volume up' into steps. Returns (steps, unknown_clauses)."""
    t = text.lower().strip()
    t = re.sub(r"[“”\"!?.]+", "", t).replace("’", "'")
    clauses = re.split(r",? (?:and then|then|after that|and also)\s+|, |; ", t)
    steps, unknown = [], []
    for c in clauses:
        parsed = parse_clause(c.strip())
        (steps.append(parsed) if parsed else unknown.append(c.strip())) if c.strip() else None
    return steps, unknown


def run_action(tv, action):
    do = action["do"]
    if do == "key":
        tv.key(action["key"], action.get("count", 1))
    elif do == "text":
        tv.text(action["text"])
    elif do == "volume":
        tv.set_volume(action["level"])
    elif do == "launch":
        tv.launch(APPS_BY_ID[action["app"]])
    elif do == "search":
        tv.search(action["query"])
    elif do == "app_search":
        app = APPS_BY_ID[action["app"]]
        if app.get("search"):
            tv.open_url(app["search"].format(q=urllib.parse.quote(action["query"])), app["package"])
        else:
            tv.search(f"{action['query']} {app['name']}")
    else:
        raise TVError(f"Unknown action {do}")


# --- HTTP ---------------------------------------------------------------------

CONTENT_TYPES = {".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
                 ".json": "application/json", ".webmanifest": "application/manifest+json",
                 ".png": "image/png", ".svg": "image/svg+xml"}


class State:
    tv = None


def set_tv(host):
    State.tv = TV(host) if host else None


class Handler(BaseHTTPRequestHandler):
    server_version = "TVRemote/1.0"

    def log_message(self, fmt, *args):
        if "/api/" in self.path and not self.path.startswith("/api/status"):
            print(f"[{self.address_string()}] {fmt % args}")

    def send_json(self, data, status=200):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def body(self):
        n = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(n) if n else b""
        if not raw:
            return {}
        try:
            return json.loads(raw)
        except ValueError:
            # Siri Shortcuts may send plain text.
            return {"text": raw.decode(errors="replace")}

    def tv(self):
        if not State.tv:
            raise TVError("Set up your TV first")
        return State.tv

    def do_GET(self):
        path = urllib.parse.urlparse(self.path).path
        try:
            if path == "/api/status":
                if not State.tv:
                    return self.send_json({"configured": False})
                return self.send_json({"configured": True, **State.tv.status()})
            if path == "/api/apps":
                apps = [{k: a[k] for k in ("id", "name", "color", "package")} for a in APPS]
                try:
                    have = self.tv().installed()
                    for a in apps:
                        a["installed"] = a["package"] in have
                except TVError:
                    pass
                return self.send_json({"apps": apps})
            if path == "/api/screenshot":
                png = self.tv().screenshot()
                self.send_response(200)
                self.send_header("Content-Type", "image/png")
                self.send_header("Cache-Control", "no-store")
                self.send_header("Content-Length", str(len(png)))
                self.end_headers()
                self.wfile.write(png)
                return
        except TVError as e:
            return self.send_json({"ok": False, "error": str(e)}, 502)
        self.serve_static(path)

    def serve_static(self, path):
        rel = "index.html" if path in ("/", "") else path.lstrip("/")
        f = (STATIC / rel).resolve()
        if STATIC not in f.parents or not f.is_file():
            self.send_error(404)
            return
        data = f.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", CONTENT_TYPES.get(f.suffix, "application/octet-stream"))
        self.send_header("Cache-Control", "no-cache")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        path = urllib.parse.urlparse(self.path).path
        data = self.body()
        try:
            if path == "/api/setup":
                host = str(data.get("host", "")).strip()
                if not re.fullmatch(r"[\w.\-]+(:\d+)?", host):
                    return self.send_json({"ok": False, "error": "That doesn't look like an IP address"}, 400)
                set_tv(host)
                ok, detail = State.tv.connect()
                save_config({**load_config(), "tv": host})
                state = State.tv.state()
                return self.send_json({"ok": ok, "state": state, "detail": detail})
            if path == "/api/key":
                self.tv().key(data.get("key", ""), int(data.get("count", 1)))
                return self.send_json({"ok": True})
            if path == "/api/text":
                self.tv().text(str(data.get("text", "")))
                return self.send_json({"ok": True})
            if path == "/api/app":
                app = APPS_BY_ID.get(data.get("id"))
                if not app:
                    return self.send_json({"ok": False, "error": "Unknown app"}, 400)
                self.tv().launch(app)
                return self.send_json({"ok": True, "message": f"Opening {app['name']}"})
            if path == "/api/command":
                text = str(data.get("text", "")).strip()
                steps, unknown = parse_command(text)
                if not steps:
                    return self.send_json({"ok": False, "error": f"Sorry, I didn't understand “{text}”. Try “open Netflix” or “volume up 3”."})
                tv = self.tv()
                done = []
                for action, desc in steps:
                    run_action(tv, action)
                    done.append(desc)
                msg = " → ".join(done)
                if unknown:
                    msg += f" (skipped: {', '.join(unknown)})"
                return self.send_json({"ok": True, "message": msg, "steps": done})
        except TVError as e:
            return self.send_json({"ok": False, "error": str(e)}, 502)
        self.send_error(404)


def lan_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("10.255.255.255", 1))
        return s.getsockname()[0]
    except OSError:
        return "localhost"
    finally:
        s.close()


def main():
    p = argparse.ArgumentParser(description="Phone remote for Google TV")
    p.add_argument("--tv", help="TV IP address (saved for next time)")
    p.add_argument("--port", type=int, default=8765)
    args = p.parse_args()

    cfg = load_config()
    if args.tv:
        cfg["tv"] = args.tv
        save_config(cfg)
    set_tv(cfg.get("tv"))
    if State.tv:
        ok, detail = State.tv.connect()
        print(f"TV {State.tv.host}: {'connected' if ok else State.tv.state()} ({detail})")
        if not ok:
            print("  If the TV shows 'Allow debugging?', choose Always allow, then reload the remote.")
    else:
        print("No TV set yet. Enter its IP address in the remote on your phone.")

    server = ThreadingHTTPServer(("0.0.0.0", args.port), Handler)
    print(f"\n  Open this on your phone:  http://{lan_ip()}:{args.port}\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass


if __name__ == "__main__":
    main()

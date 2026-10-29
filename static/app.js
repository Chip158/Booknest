(() => {
  const $ = (s) => document.querySelector(s);
  const SUGGESTIONS = ["Open YouTube", "Pause", "Volume up 3", "Play lofi beats on YouTube", "Go home", "Turn off the TV"];
  let status = {};
  let apps = [];

  // ---------- API ----------
  async function api(path, body) {
    try {
      const res = await fetch(path, body === undefined ? {} : {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.ok === false) throw new Error(data.error || `Error ${res.status}`);
      return data;
    } catch (e) {
      const msg = e.message === "Failed to fetch" || e.message === "Load failed"
        ? "Can't reach the remote server. Is it running on your computer?" : e.message;
      toast(msg, true);
      throw e;
    }
  }
  const sendKey = (key, count = 1) => api("/api/key", { key, count }).catch(() => {});

  // ---------- Toast ----------
  let toastTimer;
  function toast(text, err = false) {
    const t = $("#toast");
    t.textContent = text;
    t.className = "toast" + (err ? " err" : "");
    t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => (t.hidden = true), err ? 4200 : 2200);
  }

  // ---------- Buttons: tap, hold-to-repeat ----------
  function bindKeys(root = document) {
    root.querySelectorAll("[data-key]").forEach((btn) => {
      if (btn.closest("#dpad") || btn.dataset.bound) return;
      btn.dataset.bound = "1";
      let timer, interval;
      const stop = () => { clearTimeout(timer); clearInterval(interval); btn.classList.remove("pressed"); };
      btn.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        btn.classList.add("pressed");
        sendKey(btn.dataset.key);
        if ("repeat" in btn.dataset) {
          timer = setTimeout(() => (interval = setInterval(() => sendKey(btn.dataset.key), 140)), 420);
        }
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => btn.addEventListener(ev, stop));
      btn.addEventListener("contextmenu", (e) => e.preventDefault());
    });
  }

  // ---------- D-pad: tap a direction, hold to repeat, or swipe anywhere ----------
  function bindDpad() {
    const pad = $("#dpad");
    let start, btn, timer, interval, moved;
    const clear = () => {
      clearTimeout(timer); clearInterval(interval);
      pad.querySelectorAll(".pressed").forEach((b) => b.classList.remove("pressed"));
      start = null;
    };
    pad.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      pad.setPointerCapture(e.pointerId);
      start = { x: e.clientX, y: e.clientY };
      moved = false;
      btn = e.target.closest("[data-key]");
      if (btn) {
        btn.classList.add("pressed");
        if ("repeat" in btn.dataset) {
          timer = setTimeout(() => {
            if (moved) return;
            sendKey(btn.dataset.key);
            interval = setInterval(() => sendKey(btn.dataset.key), 140);
          }, 420);
        }
      }
    });
    pad.addEventListener("pointermove", (e) => {
      if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 22) moved = true;
    });
    pad.addEventListener("pointerup", (e) => {
      if (!start) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      const repeating = !!interval;
      if (moved) {
        const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : (dy > 0 ? "down" : "up");
        sendKey(dir);
        const b = pad.querySelector(`.${dir}`);
        b.classList.add("pressed");
        setTimeout(() => b.classList.remove("pressed"), 160);
      } else if (btn && !repeating) {
        sendKey(btn.dataset.key);
      }
      clear();
    });
    pad.addEventListener("pointercancel", clear);
    pad.addEventListener("contextmenu", (e) => e.preventDefault());
  }

  // ---------- Apps ----------
  function tile(app) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "app-tile" + (app.installed === false ? " missing" : "");
    b.setAttribute("role", "listitem");
    b.style.setProperty("--c", app.color);
    if (app.id === "pluto") b.style.setProperty("--fg", "#111");
    b.textContent = app.name;
    b.dataset.app = app.id;
    b.addEventListener("click", () => openApp(app));
    return b;
  }
  async function openApp(app) {
    if (app.installed === false) return toast(`${app.name} isn't installed on the TV`, true);
    try {
      await api("/api/app", { id: app.id });
      toast(`Opening ${app.name}`);
      closeSheets();
      setTimeout(refreshStatus, 1500);
    } catch {}
  }
  async function loadApps() {
    try { ({ apps } = await api("/api/apps")); } catch { return; }
    apps.sort((a, b) => (a.installed === false) - (b.installed === false));
    for (const id of ["#appsStrip", "#appsGrid", "#appsSheetGrid"]) {
      const el = $(id);
      el.replaceChildren(...apps.filter((a) => id !== "#appsStrip" || a.installed !== false).map(tile));
    }
    markCurrent();
  }
  function markCurrent() {
    document.querySelectorAll(".app-tile").forEach((t) => {
      const app = apps.find((a) => a.id === t.dataset.app);
      t.classList.toggle("current", !!app && app.name === status.current);
    });
  }

  // ---------- Status ----------
  async function refreshStatus() {
    let s;
    try { s = await (await fetch("/api/status")).json(); }
    catch { setDot("off", "Remote server not reachable"); return; }
    status = s;
    if (!s.configured) { setDot("off", "Tap to connect your TV"); openSheet("setupSheet"); return; }
    if (s.state === "unauthorized") return setDot("asleep", "Approve “Allow debugging” on the TV");
    if (s.state !== "device") return setDot("off", `Can't reach TV at ${s.host}`);
    const parts = [];
    if (s.awake === false) parts.push("Asleep");
    else if (s.current) parts.push(s.current);
    if (s.volume != null) parts.push(`Vol ${s.volume}`);
    setDot(s.awake === false ? "asleep" : "on", parts.join(" · ") || "Connected");
    if (s.volume != null && s.volume_max) $("#volFill").style.width = `${(100 * s.volume) / s.volume_max}%`;
    markCurrent();
  }
  function setDot(cls, text) {
    $("#dot").className = "dot " + cls;
    $("#nowPlaying").textContent = text;
  }

  // ---------- Commands & voice ----------
  async function runCommand(text) {
    text = text.trim();
    if (!text) return;
    $("#cmdInput").value = "";
    $("#cmdInput").blur();
    try {
      const r = await api("/api/command", { text });
      toast(r.message);
      log(text, r.message);
      setTimeout(refreshStatus, 1500);
    } catch (e) {
      log(text, e.message, true);
    }
  }
  function log(said, result, err = false) {
    const item = document.createElement("div");
    item.className = "log-item" + (err ? " err" : "");
    const s = document.createElement("span");
    s.className = "said";
    s.textContent = `“${said}”`;
    item.append(s, result);
    const el = $("#log");
    el.prepend(item);
    while (el.children.length > 4) el.lastChild.remove();
  }

  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  let rec, listening = false, voiceBroken = !Recognition;
  function listen() {
    if (voiceBroken) {
      $("#cmdInput").focus();
      return toast("Tap the 🎤 on your keyboard and say what you want");
    }
    if (listening) return rec.stop();
    rec = new Recognition();
    rec.lang = navigator.language || "en-US";
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    let final = "";
    rec.onstart = () => { listening = true; $("#micBtn").classList.add("listening"); $("#cmdInput").placeholder = "Listening…"; };
    rec.onresult = (e) => {
      const text = Array.from(e.results).map((r) => r[0].transcript).join(" ");
      $("#cmdInput").value = text;
      if (e.results[e.results.length - 1].isFinal) final = text;
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        voiceBroken = true;
        $("#cmdInput").focus();
        toast("Use the 🎤 on your keyboard to dictate (or set up the Siri shortcut)");
      }
    };
    rec.onend = () => {
      listening = false;
      $("#micBtn").classList.remove("listening");
      $("#cmdInput").placeholder = "Tell the TV what to do…";
      const text = final || $("#cmdInput").value;
      if (text) runCommand(text);
    };
    try { rec.start(); } catch { voiceBroken = true; listen(); }
  }

  // ---------- Sheets ----------
  function openSheet(id) {
    const s = document.getElementById(id);
    if (!s.hidden) return;
    s.hidden = false;
    const input = s.querySelector("input");
    if (input && id !== "appsSheet") setTimeout(() => input.focus(), 250);
  }
  function closeSheets() { document.querySelectorAll(".sheet").forEach((s) => (s.hidden = true)); }
  document.querySelectorAll(".sheet").forEach((s) => {
    s.addEventListener("click", (e) => { if (e.target === s || e.target.closest("[data-close]")) s.hidden = true; });
  });

  // ---------- Wire up ----------
  bindKeys();
  bindDpad();
  $("#cmdForm").addEventListener("submit", (e) => { e.preventDefault(); runCommand($("#cmdInput").value); });
  $("#micBtn").addEventListener("click", listen);
  $("#appsBtn").addEventListener("click", () => openSheet("appsSheet"));
  $("#kbBtn").addEventListener("click", () => openSheet("kbSheet"));
  $("#tvName").addEventListener("click", () => {
    $("#ipInput").value = status.host || "";
    openSheet("setupSheet");
  });
  $("#kbForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = $("#kbInput").value;
    if (!text) return;
    try { await api("/api/text", { text }); $("#kbInput").value = ""; toast("Sent"); } catch {}
  });
  $("#setupForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = $("#setupMsg");
    msg.className = "hint";
    msg.textContent = "Connecting… look at the TV for an “Allow debugging?” prompt.";
    try {
      const r = await api("/api/setup", { host: $("#ipInput").value.trim() });
      if (r.state === "device") {
        msg.className = "hint ok";
        msg.textContent = "Connected!";
        setTimeout(closeSheets, 700);
        loadApps();
      } else if (r.state === "unauthorized") {
        msg.innerHTML = "Almost there — choose <b>Always allow</b> on the TV, then tap the arrow again.";
      } else {
        msg.className = "hint err";
        msg.textContent = "Couldn't reach the TV. Check the IP and that Network debugging is on.";
      }
      refreshStatus();
    } catch (err) {
      msg.className = "hint err";
      msg.textContent = err.message;
    }
  });
  $("#previewBtn").addEventListener("click", () => {
    const img = $("#previewImg");
    img.hidden = false;
    img.src = `/api/screenshot?t=${Date.now()}`;
    img.onerror = () => { img.hidden = true; toast("Couldn't grab the TV screen", true); };
  });
  $("#chips").replaceChildren(...SUGGESTIONS.map((s) => {
    const c = document.createElement("button");
    c.type = "button"; c.className = "chip"; c.textContent = s;
    c.addEventListener("click", () => runCommand(s));
    return c;
  }));

  refreshStatus().then(loadApps);
  setInterval(() => { if (!document.hidden) refreshStatus(); }, 6000);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) refreshStatus(); });
})();

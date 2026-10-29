# TV Remote

A phone remote for Google TV that works with the phone folded or unfolded. It has a D-pad you can tap, hold or swipe, one-tap app launching, plain-English commands, voice, and typing.

A small server runs on a computer on the same Wi-Fi as the TV. Your phone opens the remote in a browser, and the server sends the commands to the TV over adb.

## Setup (one time)

1. **TV:** Open Settings → System → About and click *Android TV OS build* 7 times. Then open Settings → System → Developer options and turn on **Network debugging** (on some TVs it's called USB debugging).
2. **Computer (Mac):**
   ```
   brew install android-platform-tools
   cd tv-remote
   python3 server.py --tv <TV IP address>
   ```
   On the TV, choose **Always allow** when it asks "Allow network debugging?".
3. **Phone:** Open the address the server prints, for example `http://192.168.1.20:8765`. In Safari, tap Share → **Add to Home Screen** so it opens full-screen like an app.

If you start the server without `--tv`, the remote asks for the TV's IP the first time it opens. The IP is saved in `config.json`.

## Things you can say or type

- open Netflix / launch YouTube TV / put on Hulu
- play lofi beats on YouTube / play Taylor Swift on Spotify
- search for The Office
- pause / play / next episode / rewind / turn on captions
- volume up 3 / louder / set volume to 10 / mute
- go home / back / down 3 / ok
- type hello
- turn off the TV / turn on the TV / switch input
- To chain steps, use "then": *open YouTube then volume down 2*

## Voice

- **Mic button:** Tap it and speak. If Safari blocks the mic (it often does on a plain `http://` page), the button focuses the text box instead, and you can use the 🎤 key on the iPhone keyboard.
- **"Hey Siri, TV":** Open the Shortcuts app and create a new shortcut with two actions:
  1. **Dictate Text**
  2. **Get Contents of URL**, set to `http://<computer IP>:8765/api/command`. Set Method to **POST**, Request Body to **JSON**, and add a field `text` = *Dictated Text*.

  Name the shortcut "TV". Then say "Hey Siri, TV" followed by "open Netflix".

## Keep it running

To start the server automatically when the computer boots, add `server.py` as a Login Item, or ask Claude or Cowork to set up a `launchd` job for it.

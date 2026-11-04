# Controls v2: "Cozy camera" (owner feedback, Nov 2, 1:45 PM PT)
Owner (Jesse) on phone: "the control isn't very good... having to swipe... it's more swiveling around I was having trouble with."
Apply in the PRE-PUBLISH pass right after the batch 3 workflow (wwvfrmr4r) ends, before publishing batch 3.

## Root causes in the current walk mode (line numbers from the merged batch 3 file, ~1.47MB)
1. Auto-swing (updateYou, ~L4900): while moving with jy<.35, camS.yaw eases toward YOU.yaw+PI at dt*(.5+|jx|*1.6)*m. The joystick is camera-relative, so pushing sideways makes the walker circle while the view keeps turning (the classic spiral). This is the "fighting the camera" feeling.
2. Manual turning is imprecise: the right #look stick is RATE-based with a squared response (yaw dt*2.8, pitch dt*1.4); a one-finger canvas drag (~L4945) changes yaw AND pitch together (diagonal swipes wobble the tilt); two-finger also twists, pinches and tilts at once.
3. Swipe conflicts: the left 45% of the canvas (below 28% height) spawns a floating stick, so swipes there move instead of turn; elsewhere a swipe turns. Inconsistent.

## Design (default = Cozy; Settings toggle keeps a fixed-up Free mode)
COZY (default, Animal Crossing-like third person):
- Fixed camera heading in walk mode; NO auto-swing. Up on the stick always walks up the screen. Tilt fixed at a cozy angle (pitch ~0.62, slightly lower when zoomed in); pinch/wheel/zoom buttons still zoom.
- Turning is optional and discrete: two round 52px buttons (rotate left / rotate right) in the HUD 'look' slot (replace the #look stick): each tap eases the view 45 degrees over ~0.35 s (smoothstep). A quick horizontal one-finger flick on the world (>= 60 px, mostly horizontal, < 400 ms) also steps 45 degrees. Double-tapping either rotate button (or a small compass chip) resets to the default heading for that area.
- One-finger slow drag on the world does nothing to the camera in Cozy (taps still tap-to-go; long-press still works). Two fingers: pinch zoom only (no twist, no tilt).
- Keyboard: Q/E step 45 degrees; arrows/WASD screen-relative.
- The movement basis uses the TARGET heading (snapped), not the mid-ease yaw, so the walker never curves during a rotate.
- Walking indoors: the CAM stack room camera (B12) still takes over; on exit, return to the last Cozy heading.
FREE (Settings: Camera "Cozy (fixed angle)" / "Free (look around)"):
- Keep orbit, but: no auto-swing while the stick is pushed sideways (only a gentle realign after 1.5 s of walking straight ahead, never while turning); one-finger drag = yaw only, 1:1 feel (sens .0075); tilt only via a deliberate two-finger vertical drag; two-finger twist kept; the right look stick becomes horizontal-only yaw with a linear response.
- Persist the choice in SET (saveSet). Default 'cozy' for everyone (including existing saves).
## Must not break
- Watch (follow) mode camera, the CAM stack layers (room, talk, deco, hangout), zoom limits, tap-to-go, the floating stick on the left, seats/doors, decorate mode gestures (B27 owns its own gestures while body.deco), the talk card hiding sticks, HUD slot layout in all 4 viewports, keyboard on desktop.
- __mocha hooks: add __mocha.ctl() -> {scheme, heading, easing, lookBtns} and __mocha.rot(dir) for tests.
## Tests (write /tmp/harness/test-controls.js; touch emulation with Playwright hasTouch + CDP Input.dispatchTouchEvent)
- Cozy: hold the stick right for 3 s: the walker's path is a straight line in world space (heading change < 3 degrees), camera yaw unchanged.
- Rotate button: yaw changes by exactly 45 degrees (+-0.5) after the ease; walking up afterwards moves up the screen.
- Flick on the world: steps 45 degrees; a slow drag does not change yaw or pitch.
- Pinch zooms without changing yaw or pitch in Cozy.
- Free mode: drag changes yaw only; sideways stick does not swing the camera.
- Setting persists across reload; smoke 15 and 1 OK; B11/B12/B23/B27 tests still pass.

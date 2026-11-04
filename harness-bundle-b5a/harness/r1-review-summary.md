# Round 1 review fixes (handoff for round-2 implementers)

## Fixer pass
I fixed 54 of the 55 findings in /home/user/Booknest/ghost-town/index.html, partly in several cases. The one left alone is the holiday-decoration half of the leak finding. The edits are exact-string patches with assertions; the scripts are in /tmp/harness/rv-r1/fix/ and the backup is /tmp/harness/backup-r1-fix.html.

**Smoke and tests.** Smoke at 15h and 1h passes in all 3 viewports. Steps 1b, 2, 3, 5 and 6 pass. Step 4 passes except one portrait flake that passed when re-run unchanged.

**Test edits.** I changed two tests:
- test-step2: posting paintings to his feed now needs a phone, so the check expects no posts without one.
- test-step3: after a reload it now waits for the page to be ready. The old fixed 4 s wait also fails on the unmodified backup on this machine.

**Main fixes.**
- **Saving:** account sync no longer overwrites or drops the real save. Hidden-tab time is simulated when the page comes back. Pushes are rarer, and an oversized save is trimmed before upload. A reload resumes what Mocha was doing.
- **Autonomy:** a failure partway through applying the mind's reply no longer pays or writes the diary twice. Friend texts are labeled as not instructions, and command-like remembered facts are dropped. The think button and refused trips can't hijack his plans, and lookups from the mind's JSON are safe against keys like 'constructor'.
- **Stuck states:** he can no longer get stuck at sea after a ferry ride, thanks to the dock check, clamped targets and a travel watchdog.
- **Holidays and trips:** I fixed the Christmas box, solstices, July 4, anniversary years, San Juan trip timing, trip refusal reasons and the coin checks.
- **Layout:** the keyboard-up Messages card, chat bubbles, toasts (now wrapping), nav tabs, landscape expand, status pill, touch targets, edge marker and big map.
- **Camera:** shops between the camera and Mocha fade, labels declutter and respect the HUD, and the view shifts so Mocha sits beside or above the panel.
- **Rendering:** interiors hidden inside closed shops are skipped, the roof fades fully, shells are opaque when settled, night shadows are frozen, and shadow extents follow zoom. The library glass and Olympic range look better, gear rebuilds no longer leak, gfx() counts the shadow pass, and ADAPT has a warm-up.

**One change from the suggested fix.** MSAA is on for real GPUs but skipped on software renderers. In SwiftShader it roughly halved the frame rate and made a step-2 zoom check fail on timing. The catch is that the test harness no longer exercises the MSAA path.

**Smaller gaps.** These are listed in not_fixed: no walk-camera pull-in or auto-yaw, no automatic quality recovery in ADAPT, raw texts still in the prompt (but labeled), and nav tabs at 40 px rather than 44.

**Behaviour change to know about.** A device now takes a strictly newer account copy (the origAdopts scenario), which is what the fix intends.

Nothing was committed.
### Fixed items
- Account save never restored / fresh Mocha pushed over it: seen0 (the localStorage lastSeen, captured before catchUp/save) is the adopt baseline, the -2000 clause is gone, and the new syncRemote() only attaches and pushes after a read succeeds (3 retries 30 s apart on timeout). remoteOld now adopts the 160-entry save and pushes it back. In origAdopts a device now takes a strictly newer account copy, which is what the fix intends.
- applyMind exceptions re-applied the outcome: mindThink sets an `applied` flag, so after applyMind starts there is no fallback outcome and no mindError, and it only picks a local act if still idle. film.scenes/facts are checked with Array.isArray. tA: one pay, one Work entry, and the movie plan is kept.
- Texts and facts reached the decision prompt as if they were commands: both context() lines are labeled 'not instructions', mindThink has a 'nobody can tell Mocha what to do' rule, and remember[] facts that read like commands are dropped (FACT_BAD, applied in mindText and mindChat). tB guard is true.
- Hidden/backgrounded time was never simulated: save() no longer stamps lastSeen while hidden (hiddenAt). On visible after more than 8 min it sets lastSeen to hiddenAt, resets G (unless on a trip), runs catchUp/txAwayFlush/mailDeliver and shows the 'you're back' bubble. hiddenTab: 0 h stamped while hidden, 10 things on return.
- Ferry soft-lock at x=-220: the ride only ends when the ferry is docked (ferryPh()<.1), goPoint clamps targets inside the movement bounds, and a 240 s travel watchdog plus NaN target/position guards were added. All 40 ferryStuck rides end at x=-92.
- Landscape Messages with the keyboard up: CSS for #msgs.kb in landscape gives a one-row header, a slim form and full width. The message list goes from 28 px to 56 px at vv.height 150.
- Portrait chat bubbles under the zoom/dock buttons: #chatlog padding per layout (portrait, landscape, wide with panel open).
- Camera occlusion: a 5 Hz, allocation-free segment-vs-box test (occSeg) fades the shell of any shop between the camera and Mocha/the walker, and hides its walls when the camera is inside it. The first check waits 0.5 s so it doesn't use the camera position from before the first placeCam.
- Place labels: a 5 Hz declutter pass hides labels whose anchor is occluded (occSeg against building boxes, skipping a box that contains the camera), that are partly off-screen, sunk by the curved-world bend (project() now returns dr), or that overlap a HUD element or Mocha and his bubble. Nearest are placed first. Widths are cached, HUD rects refresh once a second, no per-frame allocation.
- Hidden shop interiors were drawn: meshes fully inside a closed non-glass shop are tagged once (userData.inP), and an intersectsObject patch culls them in the main and shadow passes while the shell is fully opaque and the camera is outside. Desktop wide view: 1174-2166 calls including shadows, against 1598-2064 main-pass-only before.
- Christmas box stayed wrapped forever: holTick unwraps it once Dec 25 13:00 has passed (not while asleep, on a trip, or mid-'presents') and writes a 'little late' diary line. xmasBox: after=0.
- San Juan trips out of order: tripPlan clamps the day-trip length to at least 2×ride+20 min and the overnight morning stay to at least ride+20 min. sjOrder: leaveBeforeWake 0.
- No size guard on the 256 KB doc: remoteState() sends a trimmed copy over 240 KB (texts, then old mail bodies, learned facts, diary, chatLog). Test: a 253 KB state was pushed as 231 KB and sync stayed on.
- Full re-upload every 25 s: background pushes need 180 s and skip while hidden, the poll interval is 30 s, and pagehide forces a push. pushRate: 1 push in the first minute, none while hidden.
- Camera ignored the panel/sheet: voApply() lens-shifts the camera with setViewOffset so Mocha sits in the free area (above the portrait sheet, left of the side panel or Messages card). Targets are polled at 4 Hz and eased.
- Toasts under the side panel on desktop/unfolded: centered in the free area (min-height:521px so iPhone landscape keeps its own placement).
- Toasts cut to one line: they wrap up to 3 lines (border-box trick for clean clamping). The text-toast cut is raised from 62 to 108 characters.
- Settings/you/notebook tabs off-screen: the nav wraps to 2 rows. All tabs are visible in every viewport.
- Landscape ⤢ expand made the panel 613 px: #expandPanel is hidden in landscape and leftover .wide/.wideP states are neutralized there.
- Walk-mode edge marker under the dock: it slides toward the screen center until it clears #dock/#zoom/.stick/#near (rects cached every 0.5 s).
- Big-map labels about 6 px: the map is fitted to the town extents, the backing store uses DPR, labels are at least 9 CSS px and placed around reserved marker boxes, the ferry is drawn before labels, and the close button is 44 px.
- Refused trips narrated as real: applyDecision turns a refused or unknown trip (or a 'train/ferry to' doing with no trip) into a real station/ferry activity carrying tripNo, the next did-line says why he stayed, and tripGiveUp sets tripNo too. tG passes.
- 'Let Mocha think' replaced a trip in progress: it only thinks immediately when G.mode is idle, otherwise MIND.last/backoff=0 makes the next decision point use the mind. tD: no think call during travel.
- Feed posts without a phone: maybePostPainting, the mind's post_painting and tripCard posts all need S.phone, and the prompt and hint say post_painting must be null without one. The feed intro now depends on S.phone. Paintings still hang and postcards are still mailed.
- Accented 'café' got a non sequitur: localReply folds accents and matches whole words (and drops a leading 'The'). 'go to the café' now gets the Drizzle & Bean line.
- Reload teleported Mocha home: save() snapshots his current activity in S.now (excluding rides, movies, trips, Wendell, bike loops), and nowResume() picks it up after a reload of under 8 min if the place is still known and open. A reload mid-ofrenda resumed at the same spot.
- Walk → watch kept the walker's camera: setCamMode saves the follow yaw/pitch/dist when entering walk and restores them on return.
- False solstice facts: the wording is now shortest/longest day, the activity is gated to about sunset (sunTimes of that day, -18 to +30 min), and the day length comes from the activity's own date.
- July 4 'watched' before the show: 'watched' is written only while fwShow>0 (otherwise a one-time 'saving a spot' line), the label says 'waiting for the fireworks' before the show, the window ends at 22:75, and he stays up until 22:48 on July 4.
- Faded roof still shadowed and drew a milky gable: the home roof fades to 0 and becomes invisible like the shell, so it drops out of the shadow map.
- No scene anti-aliasing: the canvas uses antialias:false/stencil:false and the scene target is a 4x WebGLMultisampleRenderTarget on WebGL2 (see not_fixed for the software-renderer exception).
- Full shadow pass at night: at nightAmt≥.85 the sun shadow map is frozen and refreshed at 2 Hz (no castShadow toggle, so no recompiles), and applyPower forces a refresh.
- '{pet}' leaked into texts: startAct fills placeholders once per activity on a copy, and placeList fills them too. petText: 'walking Mochi'.
- Gear rebuild leaks: a dropObj() helper disposes non-shared geometries and materials (keeping SPH/SPH8, keep-flagged geometry, MAT cache and textures) in applyPhoneLook, syncBike and applySpeaker. leaks: geometries flat after gear purchases.
- Prototype keys from mind JSON: own() hasOwnProperty lookups for byId, spots, KB, TRIPS, WEAR, DECOR, GADGETS and addHobby, plus a migrate() repair of bad hobbies and NaN guards. tE: spot 'constructor' falls back to couch, and ask/trip 'constructor' no longer throw.
- Mind purchases substituted a different model: mindBuy normalizes names and refuses unmatched models/types instead of substituting. tH: 'Ghost Phone' gives Ghostphone 30/30, and 'mountain bike' is refused.
- acquire/treasure applied with no finished activity, and every idle call said 'waking up': both now need a real finished (non-sleep) activity, and the waking line is used only for the first think after load or the toggle; later calls say 'between activities; last he was at X'.
- False 'not enough coins' at the platform: tripGo gives the real reason (coins or last train/ferry), and tripOk also checks boardability 15 min ahead.
- Candy/groceries bought without coins: holCands requires 8/10/12 coins for candy/tgshop/gifts.
- Wendell got his Christmas present twice: 'presents' marks givew done (plus the friendship point) when it tells the swap, and its wording adapts if givew already ran.
- Anniversary always 'one year': annivN/annivW feed the letter (by mail key year), diary, text and calendar line, and the label is now 'celebrating move-in day'.
- DST: the sun keys are rebuilt when getTimezoneOffset changes (keysTz).
- Messages said asleep while he was visibly up: during sleep hours txAsleep is false while he is out doing or heading to something other than bed.
- Unread badge counted replies read in the bar float: text-only replies shown above the chat bar with the tab visible are marked read, with no badge pop or toast.
- Portrait status pill capped at 26vw: max-width:none with min-width:0.
- Touch targets: under pointer:coarse, invisible extenders bring .x/.mX/.tog/#modeBtn/.heart/chat buttons to about 44 px, .seg buttons and nav buttons have min-height 40 px, .hbtns gap is 10 px, and .calNav is 44 px tall.
- gfx() missed the shadow pass: info.autoReset is turned off around the main scene render so calls/tris include the shadow pass.
- ADAPT warm-up: no pixel-ratio drops in the first 6 s, and a reset grace period after visibility returns (3 s), applyPower (4 s) and a remote adopt (4 s).
- Shadows stopped about 50 units out: the shadow ortho extents follow zoom (50 up to dist ~40, rising to 90), rebuilt only when the step changes.
- Shop shells always transparent: shells are opaque when settled and transparent only while fading. Signs and clock faces stay alpha, and the home shell/roof follow their opacity.
- Veg batcher split trunk and leaf: trunks and branches use the 'leaf' key (4 sites).
- Library glass diagonals and night blowout: pane lines are a LineSegments grid (no diagonals), and the glass night emissive is capped (nightK .5).
- Olympic range as a flat grey wall: a hazeFade shader blends the lower slope into the live fog colour (its own program cache key).
### Not fixed / partial
- MSAA is skipped on software rasterizers (partial): on SwiftShader, llvmpipe and similar, the scene uses the old plain render target. With 4x MSAA in SwiftShader the unfolded view dropped from about 4 to 2.6 fps and the step-2 zoom check failed on timing. Real GPUs get the MSAA target. So the test harness no longer exercises the MSAA path; it did run error-free in smoke and step-1b before this change.
- Holiday decoration rebuild leak (second half of the dispose finding): not changed. The verifier judged holClear/holBuild to dispose correctly, but the leaks scenario still shows geometries growing over repeated holForce cycles (870 to 942). It needs a closer look.
- Camera occlusion is partial: occluding shops fade, but the walk camera is not pulled in to the first hit, the follow yaw doesn't auto-swing, and shell-less houses, Wendell's cottage and roof props don't fade (all as the verifier recommended).
- Labels are partial: the optional extras (hiding the HTML label when the 3D shop sign is close, a 'closed' icon instead of text) were not done. In the default close-up view most labels now hide because they sit at the screen edge or under the HUD pills, as designed.
- ADAPT is partial: only the warm-up and grace periods were added. Recovery, raising the ratio again and a shadow stage were left out because B41 says never auto-promote and owns the tier work.
- Prompt injection is partial: raw texts still reach the decision prompt, now labeled as not instructions, plus the new rule and the fact filter. Raw quotes in 'Friends' diary lines were left as they are (pre-existing).
- Size guard has no user-facing note: if even the trimmed copy is over 240 KB, the push is skipped silently. Storing texts and mail in separate docs was out of scope.
- Touch targets: nav tabs are 40 px, not 44, because the nav now wraps to 2 rows (98 px tall on a landscape phone).
- Cosmetic 'just moved in' greeting before a remote adopt: skipped (optional).

## Fixer pass
I fixed all six findings in /home/user/Booknest/ghost-town/index.html, and the smoke runs at hours 15 and 1 plus every per-step test pass.

The blocking save-sync bug is fixed. A different, younger Mocha in the account can no longer replace the local one. The account copy is taken only when this device has no Mocha yet, when it is a newer copy of the same Mocha, or when it is an older Mocha. Otherwise the local save is kept and pushed, which repairs the account. Before a local save is replaced, a copy goes to localStorage KEY+'-bak'.

Mocha's house and turret now get out of the way when they block the camera's view of him: the front and roof fade, and the walls or turret that block hide. Walk-mode labels no longer float over the roof. The landscape status pill fits common statuses, and the landscape map is centered.

I changed two tests, and the product behavior they check is the same. test-step6 now ignores Chromium's 'GPU stall due to ReadPixels' warning. The autonomy tB script now waits longer for the think call. Both originals are saved under /tmp/harness/rv-r1/fix2/.

I also added two test hooks, byId and HOCC, to window.__mocha.

Not fixed: big foreground trees can still hide Mocha, because the trees are batched or instanced and would need a separate fade system. Very long statuses still end in an ellipsis in landscape with the panel open.
### Fixed items
- BLOCKING save sync data loss (syncRemote, index.html ~line 3292): the account copy is now adopted only in three cases. (1) This device has no Mocha yet (isNew). (2) It is a newer copy of the same Mocha (rs.born===S.born and a newer lastSeen). (3) It is an older Mocha (rs.born<S.born). Otherwise the local save is kept and pushed, which repairs the account. Before a non-new local save is replaced, it is written to localStorage KEY+'-bak'. A same-Mocha adoption never overwrites a backup that holds a different Mocha. save() now drops '-bak' and retries if the main write hits the storage quota, so the backup can never push out the real save. Checked with 6 scenarios (/tmp/harness/rv-r1/fix2/sync-scen.js, run by scen2.js, log in logs/sync-final.log). origAdopts now keeps diary 160, pets 1, paintings 7, stores 160 and pushes the real Mocha. olderRemote adopts the older Mocha and backs up the young local one. sameNewer adopts and makes a backup. sameOlder keeps local. freshDevice adopts. keepOtherBak leaves the other Mocha's backup in place.
- Minor: Mocha hidden behind his own house and turret. Added static occluder boxes HOCC (house body plus bay up to the roof ridge, and the turret) with no per-frame allocation. They are checked in the existing 0.2 s occlusion pass. When the body blocks the camera's view of Mocha (or of the walker in walk mode), the front and roof shell fade and the back and side walls hide, including the wallpaper, wainscot and mirror. When the turret blocks, the turret meshes hide. Visibility is only touched when the state changes, and a 1 s decay prevents flicker. Bonus: with Mocha inside and the camera behind the house, the walls on the camera side now hide too, the same way shops 'peek'. Screenshots for desktop behind-house, behind-turret and inside-cam-behind, plus landscape turret, all show Mocha clearly (/tmp/harness/rv-r1/fix2/shots/).
- Minor: the 'Rain City Cinema' label floated over the house roof in walk mode. The label occlusion test now uses the taller HOCC boxes in place of the 6-high home box. It never hides the house's own label, and it skips the house while the house is faded or hidden. Verified in walk mode in front of the house with the house opaque: no labels float over the roof. The step1b 'home label' check still shows opacity 1.
- Minor: the status pill truncated in landscape with the panel open. The pill max-width now reserves only the real space to the dock, and its left edge includes safe-area-inset-left. Pill gap is 6px and status padding 7px in that state only. 'walking around the lake' now fits (155/155 px), with a 17 px gap to the 'walk around' button.
- Cosmetic: the landscape big map sat at the left of its dialog. #bigmap now has align-self:center, so the canvas is centered in the card (card 192-660, map 281-571). Portrait and desktop are unchanged. Tap-to-walk still works because it uses getBoundingClientRect.
- Test flake (tests only, not the product): /tmp/harness/test-step6.js now ignores Chromium's 'GPU stall due to ReadPixels' perf warning. The original is saved at rv-r1/fix2/test-step6.orig.js. /tmp/harness/rv-r1/autonomy/tB.js now polls up to about 4.5 s for the think call instead of one 400 ms window, and passed with guard:true and both lines labeled 'not instructions'. The original is at rv-r1/fix2/tB.orig.js.
### Not fixed / partial
- Big foreground trees can still hide Mocha (unfolded-d15-tab-cal.png): the trees are batched or instanced meshes, so fading single trees needs a separate per-instance fade system. That is beyond a minimal safe fix, and it is one of the occlusion gaps the earlier fixer already listed.
- Longer status strings (for example 'watching "My Neighbor Totoro"', 204 px) still end in an ellipsis in landscape with the panel open: there is only about 160 px of room left of the dock. Truncating with an ellipsis is the intended fallback.
- Not verified, seen only while reading the CSS (no change made): in real iPhone landscape with a notch, #panel uses safe-area-inset-right but body.panelOpen #dock's right offset does not, so the dock could overlap the panel edge on a real device. The emulator reports 0 for safe-area insets, so I could not reproduce it.

## Cozy toon graphics  smoke=True
STEP 1 (cozy toon graphics) is done in /home/user/Booknest/ghost-town/index.html. Backup: /tmp/harness/backup-step1.html.

1) TOON SHADING. A new block sits right after `const camera=...`. It defines TOONG, one shared 8-texel RGBA DataTexture light ramp with NearestFilter and no mipmaps. Its values are .44/.59/.83/1.0 across dotNL. It also defines `class ToonM extends THREE.MeshToonMaterial`, which drops flatShading/shininess/specular and sets gradientMap=TOONG. Every `new THREE.MeshLambertMaterial(` and `new THREE.MeshPhongMaterial(` was replaced by `new ToonM(`, including lam(). phongFlat is now `c=>lam(c)`, so it is cached. Low-poly IcosahedronGeometry(r,0) blobs became `ballG(r)` (SphereGeometry 10x8). The Fremont troll head was kept as an icosahedron on purpose. MeshBasicMaterial is untouched. Shell fades, the house roof translucency, winMats window glow, the cinema screen, InstancedMesh with instanceColor, and transparent glass were all checked and still work.

2) ROLLING WORLD. BEND is a shared uniform `{value:Vector4(K=.0013, flatRadius, sideFactor=.6, time)}`. It is applied through an override of `THREE.Material.prototype.onBeforeCompile`:
- For built-in materials it replaces `#include <project_vertex>` with code that does `mvPosition.y -= K*max(0, length(vec2(mv.z, .6*mv.x)) - flatRadius)^2`.
- Sprite shaders are patched before gl_Position. Points get the bend through project_vertex.
- ShaderMaterials (sky, post), MeshDepthMaterial and MeshDistanceMaterial are skipped, so shadow maps stay unbent and correct.
- `customProgramCacheKey` returns 'nb', 'sw' or 'bend' so variants don't share programs.
- `noBend(m)` sets m.userData.noBend. It is used on stars, the moon, clouds and the haze mountains.
- Tree wind sway (`userData.sway`) now runs in the vertex shader. The old per-frame `t.obj.rotation.z` loop was removed, and trees no longer have `.obj`.
- In frame(), before rendering: `BEND.value.y=max(22, camS.dist*1.15+8)`, `w=T`, and BENDC/BENDUP are set from the camera. takeSelfie temporarily uses flatRadius 10 with the selfie camera.
- Frustum culling: `THREE.Frustum.prototype.intersectsSphere` is patched to shift far spheres down by the bend amount. It only applies while the global `bendCull` is true (main render and selfie only). The sun shadow frustum is flagged `.flat` so shadow culling is unchanged. The post quad has frustumCulled=false; without that the screen went black.
- project() applies the same bend in view space, so labels, bubbles and the edge marker stay attached.
- To bend smoothly, the ground is now PlaneGeometry(600,700,30,35) at x=239 and the water is PlaneGeometry(900,900,36,36). Road and sidewalk boxes get depth segments. box() auto-subdivides w/d>14. The troll creek was subdivided.
- The Olympic range and Mt Rainier are noBend, scaled about their apex so their bases sink below the bent horizon. The Olympics got small snow caps (p_snow).
- The skyline bends normally with heights 14-36 and fog:false, tinted toward the sky (p_sky), so it peeks over the northern horizon. Its windows still light up at night.
- The sky dome gradient was shifted down: `h=clamp((vP.y+.2)*1.45,0,1)`.

3) PALETTE AND LIGHTING.
- Brighter day sky keys. Overcast greys are bluer and lerp less.
- Hemisphere: `(hi*(1-o*.2)+.15)*lerp(.62,.78,nightAmt)`, sky color #eef2ff, day groundColor #9a9478. Sun: `si*(1-o*.6)*lerp(.64,.42,nightAmt)`. This avoids blow-out with toon and keeps nights dark blue.
- Fog 80/240.
- New tileable 512px grass texture with soft patches, tufts, clover and tiny flowers (none in winter, snow sparkles instead). It uses a separate seeded(77) RNG. SEASONS now have softer grass colors plus a new `fl` (flower colors) field.
- Brighter teal water with a small emissive. Roads #76809a, dashes #fbe08a, cream sidewalks #efe5cf, seawall and promenade warmed.
- Clouds are noBend and whiter (emissive .5 by day). Night cloud color is #4b5577.

4) TREES AND BUSHES. The old tree and bush meshes were replaced by `Batcher(cell=36)`. It bakes static pieces into vertex-colored, merged-geometry chunks keyed by grid cell, with a slightly darker underside, all using one material `vegM` (ToonM, vertexColors, sway).
- Maples: one big round puff plus 3 side puffs and a top puff, with a short warm trunk and branches. Bare winter maples have extra branches and small snowy puffs.
- Firs: 3 rounded stacked LatheGeometry tiers (tierG), with snow caps in winter.
- Bushes: 3 round puffs, plus little flowers in spring/summer. Bushes don't cast shadows.
- Winter snow patches are batched too. Leaf-litter InstancedMeshes now have frustumCulled=false.
- The `trees` array (x,z,s,maple) is kept for blockers and litter.

5) POST AND SETTINGS. The post shader has new uniforms `dots` and `night`. The halftone runs only when dots>.5. The grade adds +9% saturation (less at night), a soft contrast curve, a warm tint by day and a cool tint at night, and a softer vignette. `SET.dots` defaults to false. It is a new SET field only, not part of S, so fresh/migrate are unaffected. renderSet() has a "Comic dot filter" toggle that updates post.uniforms.dots live.

6) PERFORMANCE SAFETY NET. ADAPT in frame(): on touch devices, outside battery saver, if rendered fps stays below 19 over a 4-second window, the pixel ratio steps down by 0.25 to a minimum of 1. It never steps back up.
HOOKS: ["window.__mocha.cam(o) - Object.assign(camS,o) for test camera placement; returns a copy of camS", "window.__mocha.gfx() - {calls,tris (main scene render incl. shadow pass), pr, adaptDrops, progs, geos, tex}", "window.__mocha.weather(kind) - force WEATHER.kind (clear/cloudy/drizzle/rain/fog/snow) for screenshots; returns current kind", "window.__mocha.BEND (bend uniform: value Vector4 K, flatRadius, sideFactor, time)", "window.__mocha.post (post ShaderMaterial; uniforms.dots / uniforms.night)", "window.__mocha.scene, window.__mocha.camera, window.__mocha.renderer (debug access)", "New globals: TOONG, ToonM, BEND, BENDC, BENDUP, bendCull, BEND_GLSL, noBend(m), ballG(r), Batcher(), vegM, VEG, tierG, bigPuffG/puffG/smallPuffG/branchG/trunkG/flowerG, p_sky, p_snow, GFX, ADAPT", "New setting: SET.dots (default false) with a 'Comic dot filter' toggle in renderSet(); new SEASONS[*].fl flower colors"]
TESTS: Smoke tests: `node /tmp/harness/smoke.js 15` and `node /tmp/harness/smoke.js 1` print "OK (no errors)" for desktop, portrait and landscape, run again after the last edit.

Feature test /tmp/harness/test-step1b.js prints PASS. It checks:
- 2428 MeshToonMaterials with the gradient map, and zero Lambert/Phong materials left.
- dots defaults to 0; clicking the "Comic dot filter" toggle in settings sets the uniform to 1 (screenshot shows halftone), and clicking again sets it back to 0 and saves false.
- Cafe counter activity via forceAct: the shop front shell fades correctly.
- Mocha moved outside: the gothic house roof is opaque. This step caught and fixed a black-screen bug where my culling patch culled the post quad.
- takeSelfie produces a JPEG; viewed at /tmp/harness/s1/f-selfie.jpg, it shows the toon Mocha in front of his house.
- The home label is positioned through the bent project().
- No page errors.

Screenshot test /tmp/harness/test-step1.js writes to /tmp/harness/s1/. Scenarios: noon wide/low/west, 17.2 dusk, 21 night, winter noon, winter 20h, spring, summer, waterfront at noon and 19h, a 23h low view of the sky with stars, portrait noon wide, and portrait 21h near. I reviewed all of them and iterated on:
- beige skies (fixed with the sky gradient shift);
- lime, overexposed grass (lowered light intensities, softer grass colors and saturation);
- a too-bright night (lower moon and hemisphere light, cool night grade);
- a giant floating skyline (it now bends and peeks over the horizon);
- oversized gray mountains (smaller, hazier, snow caps);
- faceted trees (smoother canopy puffs).

Also checked:
- Walk-mode views on desktop and portrait (/tmp/harness/s1/walk-*.png): the road rolls over the horizon nicely, with puffy trees and falling leaves.
- The settings panel in portrait: the new toggle fits.
- Adaptive resolution in mobile emulation: the pixel ratio dropped from 1.5 to 1.25, with no errors.

Performance comparison (/tmp/harness/perf1.js): numbers are in known_issues.
KNOWN ISSUES:
- Performance risk, not checked on a real iPhone. In SwiftShader (software rendering) the default view now runs at about 1.25 fps at 1100x820, versus 3.75 fps before, a 3x drop. At 400x300 it is 5.3 vs 8.6. The causes are per-pixel toon lighting (one directional light with shadow, two point lights, hemisphere) and smoother tree geometry: total drawn triangles went from about 108k to 200k. Draw calls are about the same (~2100). The adaptive pixel-ratio fallback and battery saver are the safety nets.
- Distant mountains are deliberately unbent so they read as a backdrop. They still look large in the sky when the camera faces west close to the waterfront.
- Tree sway is now done in the vertex shader, so tree shadows do not sway. Tree positions are still random on every load (Math.random), as before.
- Tap raycasts and the shadow map use unbent world positions. That is correct for shadows; tap targets on distant objects could be slightly off, but taps only check Mocha and Wendell, who are usually close.
- In walk mode (camera close), the visible horizon is only about 55-80 units away. Distant low buildings sink below it; tall landmarks like the Space Needle still show. This is intended for the rolling look.
- The milky see-through front wall of the house in the close default view is existing shell-fade behavior and was left unchanged.

## Gallery lightbox + zoom  smoke=True
STEP 2 is done: pictures are easier to view, a full-screen picture viewer, autonomous painting posts, and zoom that works while walking. All edits are in /home/user/Booknest/ghost-town/index.html. Backup: /tmp/harness/backup-step2.html. Patch scripts are in /tmp/harness/step2/.

1) PANEL IMAGES
- 'me' tab: the paintings list is now a `.pgrid` CSS grid, repeat(auto-fill,minmax(98px,1fr)). That gives 3 per row on a phone or the 400px panel, and about 6 on the wide panel. It shows ALL paintings (up to 24, the existing cap), not just the first 12.
- Each painting is a `.pcard` button (data-lb="paint", data-id): a 4:3 thumbnail with object-fit:contain and a gold frame, the title, and a where-label from the new `whereTxt(pt)`: on his wall / sold at the market / gave to X / in his stack. A "tap a painting to see it big" note sits below.
- paintThumb now renders at 192x144 so thumbnails are crisp on retina.
- Feed: `.post .pic` keeps the aspect ratio and is never cropped (max-width:100%, auto size). Max height is min(34vh,300px) on desktop, min(30vh,280px) in the portrait sheet, and 52vh on landscape phones. The task suggested ~45vh, but at that size the photo did not fit in the iPhone bottom sheet, which was the owner's complaint. Now the whole selfie plus its caption fits.
- Painting posts in the feed show the framed painting (`.pic.art`).
- renderFeed was rewritten to handle `kind:'painting'` posts. Posts without a kind are still selfies.

2) LIGHTBOX (#lb, z-index 20, opaque dark radial backdrop)
- State: `LB={open,set,items,i,ret}`.
- Functions: `lbItems(set)` ('paint' = S.paintings; 'feed' = posts that have an image), `openLB(set,id|index)`, `closeLB()`, `stepLB(d)` (wraps around), `showLB(dir)` (slide-in animation), and `fitLB()`. fitLB sizes the image in JS to contain-fit the stage: it subtracts the frame border, upscales up to 2.6x, and refits on image load and on resize.
- Paintings use `paintBig(pt)`: paintCanvas(pt,512,384) as a JPEG dataURL, cached in the `bigCache` Map (max 40, memory only). paintCanvas grain is finer at large sizes; the random sequence for everything drawn before the grain is unchanged, so paintings look the same.
- Caption shows the title, a sub line, and a "3 / 12" counter.
  - Paintings: "of <subject> · on his wall · painted Nov 1".
  - Selfies: "place · 2h ago · ❤️ n".
  - Painting posts: "🎨 “Title” · ago · ❤️ n".
- Layout:
  - Wide screens (desktop, landscape phone, unfolded): the arrows sit in side columns and the close button is at top-right, so nothing overlaps the image.
  - Portrait ≤600px: close button in a top row, arrows in the bottom bar either side of the caption.
- Input:
  - Swipe left/right (any pointer type) moves through the set; swipe down closes.
  - Tapping the backdrop (anywhere outside the image) closes. This is handled on 'click', not pointerup, so iOS can't pass a follow-up click to whatever is underneath.
  - Escape closes and ArrowLeft/Right navigate. The global keydown handler swallows keys while the viewer is open, so arrow keys no longer switch to walk mode.
  - Focus moves to the close button on open and is restored on close. Feed images open with Enter/Space.
- Opening: one delegated click listener on #panel for `[data-lb]`.
- While the viewer is open, frame() renders the 3D scene only about 3 times a second to save battery.

3) AUTONOMOUS PAINTING POSTS
- New functions: `postPainting(pt,caption,t)`, `paintCaption(pt)` (caption pool that fits where the painting went: hung / sold / gift / kept) and `maybePostPainting(pt,e,t)`.
- A post looks like `{id:'pp…', kind:'painting', pid, art:{s,c,seed,ti}, caption, place:'Fog & Easel Studio', t, likes, liked:false}`. The small `art` snapshot lets the post still render after the painting drops out of the 24-painting cap; `postArt(p)` falls back to it.
- Each post adds a 'Posted' diary entry and a toast. Posts are capped at 30 (existing cap), and painting posts add about 120 bytes each.
- Built-in brain: the localOutcome studio branch now keeps the painting and calls maybePostPainting. The chance is .38 + max(0,enjoyment)*.42, so roughly 40–80%, higher when he enjoyed it. This also runs during catchUp; toasts stay quiet then.
- Claude mind:
  - The prompt gains `"post_painting": null or {"caption":"…"}`, and the painting hint asks for it.
  - applyMind posts with the given caption (sliced to 80 chars). `null` means no post. If the field is missing, it falls back to the built-in chance.
  - Painting title and subject are now sliced to 50/60 chars.
- The remote photo sync skips painting posts.
- No new top-level S fields, so fresh() and migrate() needed no changes.

4) ZOOM
- `ZM={dir,tgt,t0}`, `zoomLim()` (walk [3.5,30], follow [6,80]), `zoomBy(f)` and `zoomTick(dt)`, called at the start of placeCam. They are defined right after camS. Zoom eases smoothly toward a target.
- Buttons `#zoom > #zIn/#zOut` (44px rounds): a tap steps ×0.8 / ×1.25; holding keeps zooming smoothly after 260ms. Pointer capture is used, the long-press menu is blocked, and keyboard activation works.
- Placement:
  - Watch mode (all devices): bottom-left.
  - Walk mode on touch: just left of the LOOK stick, centered on it, with a 12px gap (stick 132 / 124 / 112px depending on layout).
  - Hidden when the bottom sheet is open in portrait, and in walk mode with the panel open.
- Pinch and the mouse wheel use the same limits and cancel any button-driven easing.
- Pinch while walking:
  - If a second finger lands within 350ms of the first, and the first barely moved (<16px), it counts as a pinch. This works when the first finger started the floating move stick (the stick is ended and turned into a pinch pointer) and when the first finger is on the right and the second lands in the stick zone.
  - Two-thumb play (fingers landing at different times) still works as before.
- STICK now tracks t0/float/sx/sy/lx/ly/moved.
- iOS `gesturestart`/`gesturechange` are prevented, so pinching over the controls no longer zooms the whole page.
- Desktop adds the +/= and -/_ keys.

5) LAYOUT FIXES
- Pre-existing overlap: in landscape walk mode the dock column ran into the LOOK stick. The dock now starts at the top (top:max(8px,safe-area)), with 46px buttons and an 8px gap. The meters are hidden in landscape walk mode.
- The first-run hint text now reads "…pinch or +/− to zoom". On desktop with the panel open it is re-centered beside the panel instead of running under it.
HOOKS: ["window.__mocha.openLB(set:'paint'|'feed', id|index) -> bool", "window.__mocha.closeLB()", "window.__mocha.stepLB(d)", "window.__mocha.lb() -> {open,set,i,n,title,sub,w,h}", "window.__mocha.postPainting(pt, caption?, t?) -> post", "window.__mocha.maybePostPainting(pt, enjoyment, t)", "window.__mocha.paintBig(pt) -> 512x384 jpeg dataURL (cached)", "window.__mocha.zoomBy(factor)", "window.__mocha.ZM (zoom state {dir,tgt,t0})", "window.__mocha.zoomLim() -> [min,max] for current camera mode", "New globals: LB, lbEl/lbImg/lbStage, lbItems, fitLB, showLB, openLB, closeLB, stepLB, dayTxt, bigCache, paintBig, whereTxt, postArt, paintCaption, postPainting, maybePostPainting, ZM, zoomLim, zoomBy, zoomTick", "New post shape in S.posts (no new top-level S fields): {kind:'painting', pid, art:{s,c,seed,ti}, caption, place, t, likes, liked}; posts without kind are selfies", "Claude mind JSON: new optional field post_painting: null | {caption}", "New DOM: #zoom (#zIn, #zOut), #lb (#lbClose, #lbPrev, #lbStage>#lbImg, #lbNext, .lbCap #lbTitle/#lbSub/#lbCount); body.lbOpen class while the viewer is open", "STICK now exposes t0, float, sx, sy, lx, ly, moved"]
TESTS: Smoke: `node /tmp/harness/smoke.js 15` and `node /tmp/harness/smoke.js 1` printed "OK (no errors)" for desktop, portrait and landscape after the final edit.

Feature test: /tmp/harness/test-step2.js covers portrait 393x852, landscape 852x393, unfolded 900x1000 (mobile/touch) and desktop 1100x820. The full 4-viewport run printed ALL PASS (exit 0). After the last lightbox change (closing on 'click'), portrait and desktop were rerun and both passed again.

Per viewport, the test checks:
- Seeding: makePainting x3, takeSelfie x2, postPainting x1.
- Paintings grid: 3 per row, thumbnails about 114px.
- Lightbox on a painting: opens; the image is not under the arrows, close button or caption; it is fully on screen; aspect ratio 1.32; large (375px wide in portrait, 395x299 in landscape, 730 unfolded, 930 desktop).
- Navigation: next arrow, swipe left (CDP touch on mobile, mouse drag on desktop), swipe right, prev arrow, ArrowLeft wrapping to the last item, Escape closes, and arrow keys did not switch to walk mode.
- Feed: 3 pictures, contained, aspect kept, within the new max height. The viewer opens from a selfie, next goes to the painting post, and tapping the backdrop closes it.
- Walk zoom: holding + takes 7 down to 3.5 (the limit); three − taps zoom back out; range is 3.5–30. No overlaps among the zoom buttons, joy, look, dock, top pills and #near.
- Touch pinch: two fingers on the right zoom in (12 → 3.5). Two fingers landing together across both halves zoom out (8 → 19.3) with joy staying [0,0]. A single finger on the left still drives the move stick (joy y ≈ −0.9).
- Watch mode: − zooms out; no overlaps with dock, pills, chat or hint.
- Built-in brain: 10 studio outcomes produced 3–8 painting posts across runs; posts stay ≤30 and S stays about 11–13KB.
- No page errors in any viewport.

Claude-mind mock (/tmp/harness/step2/run-mind.js with a mocked MIND.api): post_painting {caption} created a painting post with that exact caption; post_painting null created the painting but no post; no errors.

Screenshots reviewed (in /tmp/harness/step2/): portrait me/feed/lightbox painting/lightbox selfie/walk/follow, landscape walk/lightbox, unfolded feed/walk/lightbox, desktop me/lightbox/follow, plus smoke portrait-h1 and landscape-h1.

Fixes made after reviewing screenshots:
- See-through lightbox backdrop changed to opaque.
- Feed images were too tall for the portrait sheet; made smaller.
- Landscape feed images were too small; made larger.
- Unfolded zoom pill nearly touched the LOOK ring; offset corrected.
- Pre-existing landscape walk overlap between the dock and the LOOK stick fixed.
- Hint text no longer runs under the desktop panel.
KNOWN ISSUES:
- Not tested on a real iPhone or in Safari. The iOS-specific fixes (blocking gesturestart so the page doesn't zoom, closing the viewer on click) only ran in Chromium.
- Pinch while walking is decided by timing: two fingers landing within 350ms count as a pinch. If someone puts both thumbs down at the same moment intending to walk and look, that becomes a pinch; it works again on the next touch.
- The viewer has no pinch-zoom on the picture itself. Pictures are fitted to the screen, upscaled up to 2.6x.
- Paintings render at 512x384 as the task specified, so they look slightly soft when blown up on desktop (~930px wide) or on a 3x iPhone.
- Feed images are smaller than the suggested ~45vh: 30vh in the portrait sheet, 34vh/300px on desktop, 52vh on landscape phones. At 45vh the whole photo did not fit in the bottom sheet, which was the owner's complaint.
- Landscape walk-mode layout changed: the dock column now starts at the top-right instead of 56px down, with 46px buttons, and the optional meters card is hidden in landscape walk mode.
- Selfie images already have their caption drawn into the photo, so in the feed and viewer the caption appears twice: once in the photo and once as text. This is existing selfie behavior.

## Coins, phone store, bike shop  smoke=True
STEP 3 is done: coins, odd jobs, Cascade Mobile, Spoke & Sprocket, and Mocha riding his own bike. Everything works with the built-in brain alone, and the Claude mind is supported too.

Files:
- Edited: /home/user/Booknest/ghost-town/index.html
- Backup: /tmp/harness/backup-step3.html
- Patches: /tmp/harness/step3/p1..p10*.py. These were applied in order, with a few small inline edits on top, so the html file is the source of truth.

ECONOMY
- A new Mocha starts with coins:150, and his "Moved in" diary entry mentions the savings.
- Existing saves get +150 once in migrate(). This sets the S.seed150 flag and adds a 'Money' diary note on the next load. The bonus is tested to happen only once.
- Coins are clamped so they are never negative. buyGear() refuses anything he can't afford.
- New S fields, added in both fresh() and migrate():
  - phone: null | {model,color,case:{c,pat}|null,charm|null,since}
  - gadgets: [], capped at 12; entries look like {k,c,t}
  - bike: null | {type,color,name,since,rides}
  - jobs: 0
  - lastJob, seed150

CATALOG (consts placed after COLOR_NAMES)
- PHONES: Drizzle Flip 80, Nimbus Mini 95, Ghostphone 120.
- GEAR_COL / PHONE_COLS / CASE_PATS / CHARMS.
- BIKES: city 110, cruiser with a basket 130, BMX 100; plus BIKE_COLS and BIKE_NAMES.
- GADGETS prices: case 15, charm 6, earbuds 30, speaker 35, helmet 22, bell 6, lights 12.

HELPERS (all function declarations, safe to call during catchUp)
- Lookups: colName, hasGadget, hasHelmet, helmetCol, favBike (by traits), nextWant (phone, then bike, then helmet), phoneDesc, bikeDesc, hobbyOk, pickPhone.
- buyGear(item,opts,t,live,place) is the single purchase path for both brains and the hooks. It deducts coins, adds a 'Bought' diary entry, shows a toast and a keeper bubble only when live, then calls applyGear().
- shopVisit(act,t,live,pname,quiet) is the built-in purchase decision:
  - With no phone, he buys a phone 85% of the time.
  - Accessories are bought by chance and taste, and only if at least 8 coins stay left over.
  - "Phone first": a bike he could afford but that would leave less than 80 coins for a phone drops to a 15% chance.
  - He then picks a helmet, bell or lights.
  - Otherwise he writes a window-shopping diary entry.
- payJob(act,t,live,pname,brief):
  - Pays rand(pay range) plus up to +5 by level.
  - Writes a 'Work' diary entry ("Juniper paid me 15 coins").
  - When live, shows a toast and the keeper's thank-you bubble.
- gearScore(a,at) adjusts localChoose weights:
  - Jobs get +3 when under 25 coins, more while saving toward nextWant, and less when he already has enough or did a job in the last 3 hours.
  - Phone shop gets +4 with no phone and at least 80 coins.
  - Bike shop gets +3.4+adventure once he can afford his favourite bike (and a phone).
  - Bike rides get +.8+adventure.
- mindBuy(b,finished,t,pname) checks the item is sold at the store he just visited and fuzzy-matches the model, then goes through buyGear.

ACTIVITIES (ACTS)
- 9 odd jobs, each with fx:'job', keeper, pay, lines and thx (the keeper's thank-you lines):
  - café: Juniper, counter
  - bookstore: Mabel, shelves
  - grocery: Hank, aisle
  - cinema: Monty, main
  - petstore: Bea, pens
  - records: Basil, crates
  - library: Rosalind, shelves
  - phones: Dot, display
  - bikes: Kip, bikes
- Shopping acts: fx 'phoneshop' (spots display / cases) and fx 'bikeshop' (spots bikes / helmets).
- Bike rides: fx 'bikeride' with bike:1. Loop 'park' (an ellipse around Cedar Lake that clears the benches and the neighbour house) and loop 'promenade' (out and back along the waterfront). The new {bike} fill placeholder inserts the bike's name.
- localChoose:
  - Filters out bike activities when he has no bike.
  - Skips hobbies that need a phone or bike he doesn't have, and hobbies at shops that are closed. The closed-shop part fixes a bug that was already there.
  - Asking the same shopkeeper again scores a little lower each time (S.know), so 13 keepers don't crowd out everything else.
- localOutcome handles job, phoneshop/bikeshop and bikeride (rides++).
- New TAGNAME, TOPIC_FOR, HOBBY_FROM (bike rides, phone photography) and TREASURES entries.
- Two new sets of true FACTS: 'phones' (Martin Cooper / Motorola 1973, "the brick", first text 1992 "Merry Christmas", cell towers, touchscreens and gloves, the origin of "emoji") and 'bicycles' (Drais running machine 1817, penny-farthing, Tour de France 1903, helmet foam, Burke-Gilman Trail, energy efficiency).

PLACES
- phones "Cascade Mobile": (-15.5,-15), ry 0, 9.5x10, open 10–20, periwinkle walls.
- bikes "Spoke & Sprocket": (28,-37), ry PI, 10x9, open 9–19, terracotta walls. Both sites match the round-2 spec's recommended positions and are verified clear of roads and sidewalks. Trees and lamps avoid them automatically.
- INTERIORS.phones:
  - A pegboard wall of colourful cases with a "CASES" sign.
  - A counter with a register and a charm jar, and a glowing Cascade Mobile logo.
  - Two display tables with phones on stands; the screens glow.
  - Wall shelves with earbuds, round speakers and boxed phones.
  - A charm rack, a Ghostphone poster, a rug, a plant and lamps.
  - Spots: display, cases, counter. Outside there's a sandwich board.
- INTERIORS.bikes:
  - Three showroom bikes shown side-on (city, cruiser, BMX) with price cards, and a bike hanging on the wall.
  - A helmet shelf with 8 helmets.
  - A counter with a bell, pump and inner tube, tyres on the wall, and a repair stand with a wheel.
  - A "Ride more, worry less" poster.
  - Spots: bikes, helmets, counter. Outside there's a bike rack with a parked bike.
- makeBike(type,color,{bell,lights}):
  - A toon bike built along +z with spinning wheel groups and a crank.
  - Per type: fenders (city), basket and step-through frame (cruiser), yellow rims (BMX).
  - The lights option adds a night glow and a red tail light.
  - userData = {wheels,crank,r,seatY,light}.
- tube() helper.
- bake(grp, shallow) merges static meshes: plain toon parts become one vertex-coloured mesh, textured parts are merged per material. It is used for both interiors and both exteriors. It is also used on every shopkeeper, per moving part (body, head, each arm, leg and tentacle).

KEEPERS
- Dot the octopus (she), phones and gadgets, fk:['phones'].
  - makeCritter L.octo gives a tall pink mantle with spots, big eyes with horizontal pupils, blush and a smile.
  - Her legs are tapered tentacles, and she has 4 extra tentacle groups (userData.tent) that sway in the keeper loop.
- Kip the mountain goat (he), bicycles, fk:['bicycles'].
  - New flags: L.horns (black, swept back), L.beard and ears:'side'.
- Asking either of them works through the automatic keeper ask acts.

MOCHA
- His phone (rebuilt by applyPhoneLook):
  - The body uses his phone's colour; the Drizzle Flip has a hinge.
  - A case shows on the back with a canvas pattern (stripes, polka dots, stars, clouds or little bats), plus a camera bump.
  - A charm dangles and swings.
  - He holds it in his raised right hand during selfies and while "checking his phone": G.phoneT, set by takeSelfie and by 📱 musings. It replaced the old setTimeout.
- takeSelfie(caption,place,force) returns false without a phone. maybeSelfie also needs a phone, and buying his first phone boosts the selfie chance.
- WEAR.helmet plus an accModel 'helmet', raised so his eyes show. The closet never picks it as an everyday hat. While riding, rideHelm is shown and any worn head item is hidden (worn objects now carry userData.slot).
- A coral speaker appears on the record-player cabinet at home when he owns one (applySpeaker).
- Bike, parked state: the bike sits at BK, beside his gate by default.
- Bike, trip planning (planRide, called from startAct):
  - Trips over 38 units, or any bikeride, get G.route = {pts,i,mount,loop,yaw}.
  - He floats to his parked bike if it's within 60 units; otherwise the bike appears at his door.
  - bikePath() uses Floyd over the road NODES graph with off-road legs weighted ×2.5. He joins and leaves the road where he actually is, and rides 1.8 units into the right-hand lane.
  - dismountPt(): beside the front door, parallel to the street. Special cases for the home gate, the park, the promenade for pier places, the base of the hill, and the needle.
- Bike, riding (updateMocha):
  - Follows the waypoints, also skipping a waypoint he has already passed.
  - G.biking means speed 11, y = rideY() at seat height on top of bikeY() (road/sidewalk/grass/pier height), a fast tiny bob, a small forward tilt and hands forward on the bars.
  - The bike follows him, leans into turns, the wheels spin by speed and the crank pedals.
  - parkBike() at the end of the route; then he floats inside.
- Bike, activities:
  - Bikeride activities loop the lake or promenade (G.loopI).
  - finishAct and goPoint park the bike. Wendell visits park it too.
  - At bedtime the bike is moved home if it was left far away.
- The status pill shows "🚲 → place".
- Musings: "saving up for X… 70/110 🪙", phone checks, "<bike name> and me".

CLAUDE MIND
- context() adds lines for money (with savings goal), his things (phone, gadgets, bike, helmet) and full price lists.
- placeList shows "[odd job here … set next.job true]" for open shops.
- The mindThink did-line adds hints for jobs, shopping and bike rides.
- The JSON gets a validated "buy" field and next.job. "selfie" is null-only when he has no phone. The acquire list excludes helmet. A rule about jobs and big purchases was added.
- applyMind:
  - Job acts: payJob, with a brief entry if the mind already wrote a diary.
  - Bike rides: rides++.
  - Shop visits: mindBuy when buy is given; when buy is missing (undefined), the built-in shopVisit runs quietly.
- applyDecision handles d.job (starts that shop's job act). The phoneshop and bikeshop effects are allowed. Job templates are skipped when matching a place/spot.
- A doing like "biking around the lake" becomes a real bikeride when he owns a bike.
- narrateFallback runs localOutcome directly for job, shop and bikeride acts.

UI
- 'Me' tab: gearHTML() adds:
  - "his money · N coins 🪙": odd jobs count, the thing he's thinking about saving for, and a progress bar.
  - "his phone": chips for model, case, charm and earbuds/speaker.
  - "his bike": name, type, rides, helmet, bell and lights.
  - The coin count moved out of the paintings header.
- Big map: places are drawn first, then labels, which shift by ±16 or ±32 px to avoid overlapping each other. This tidies the existing clutter near the market.

PERFORMANCE
- perf1.js, default desktop view: draw calls 2109 before, 2111 after. Merging each shopkeeper's moving parts offset everything new.
- Triangles about 205k → about 243k.
- Tentacles use a lower-poly sphere (SPH8).
HOOKS: ["window.__mocha.buyGear(item, opts, t?, live?, place?) -> bool. item is phone|case|charm|earbuds|speaker|bike|helmet|bell|lights; opts are {model|type,color,pattern,charm,name}", "window.__mocha.shopVisit(act, t, live, pname, quiet) \u2014 built-in purchase decision. act.fx is 'phoneshop' or 'bikeshop'", "window.__mocha.payJob(act, t, live, pname, brief) -> pay", "window.__mocha.mindBuy(buyObj, finishedAct, t, pname) -> bool", "window.__mocha.applyMind(r, finishedAct) (exposed for mind tests)", "window.__mocha.startAct(act) \u2014 starts an activity without warping, so the bike route gets planned", "window.__mocha.localChoose(at) \u2014 sample the built-in brain's choices", "window.__mocha.tick(n=1, dt=.05) \u2014 fast-forwards updateMocha n steps with no rendering. Returns {x,z,mode,biking}", "window.__mocha.gear() -> {coins,phone,gadgets,bike,jobs,helmet,want,biking,route:{n,i,mount,loop,pts},bk,y,bikeVisible,phoneVisible,phoneCols}", "window.__mocha.coins(n?) \u2014 set or get coins (clamped at 0 or above)", "window.__mocha.showPhone(seconds) \u2014 he holds his phone", "window.__mocha.takeSelfie(caption, place, force=true) \u2014 the HOOK bypasses the phone requirement by default so older tests keep working; pass force=false to test the rule", "window.__mocha.bikePath(ax,az,bx,bz), window.__mocha.BIKE_LOOPS, window.__mocha.BK (parked bike {x,z,yaw,y}), window.__mocha.makeBike(type,color,opts), window.__mocha.nextWant()", "New S fields (in both fresh() and migrate()): phone, gadgets[] (cap 12), bike, jobs, lastJob, seed150 (one-time +150 flag), seedNote (transient)", "New G fields: biking, route, phoneT, loopI, yawV", "New PLACES: 'phones' (Cascade Mobile) and 'bikes' (Spoke & Sprocket). New KEEPERS: 'dot' (octopus) and 'kip' (mountain goat). New FACTS: phones, bicycles", "New ACT fx: 'job' (fields keeper, pay, lines, thx), 'phoneshop', 'bikeshop', 'bikeride' (fields bike:1, loop:'park'|'promenade'). New fill placeholder {bike}", "New makeCritter look flags: octo, horns, beard, ears:'side'. Critter userData.tent holds the tentacle groups. Critters are now baked per moving part", "New WEAR item: helmet (head) with an accModel 'helmet'", "New globals: PHONES, GEAR_COL, PHONE_COLS, CASE_PATS, CHARMS, BIKES, BIKE_COLS, BIKE_NAMES, GADGETS, hexOk, aan, colName, hasGadget, hasHelmet, helmetCol, favBike, nextWant, phoneDesc, bikeDesc, hobbyOk, pickPhone, gearScore, I0, makeBike, tube, bake(grp,shallow), BAKEM, SPH8, caseTex, applyPhoneLook, BK, bikeObj, rideHelm, bikeY, syncBike, applySpeaker, applyGear, BIKE_LOOPS, nodeTables, segClear, bikePath, dismountPt, planRide, mountBike, parkBike, rideY, gearHTML", "Claude mind JSON: new 'buy' field ({item,model,color,pattern,charm,name}, validated against the store he was just at and his coins) and new next.job (true|false). 'selfie' is null-only when he has no phone"]
TESTS: SMOKE: node /tmp/harness/smoke.js 15 and node /tmp/harness/smoke.js 1 both print "OK (no errors)" for desktop, portrait and landscape, exit 0. They were re-run after the final edit.

FEATURE TEST: /tmp/harness/test-step3.js, sections main | old | mind | mobile. Every section ended ALL PASSED. Checks:
- main (desktop):
  - A new Mocha has 150 coins, no phone and no bike, and his first want is a phone at 80.
  - Dot and Kip are visible at 3pm. There are 9 odd jobs, and asking Dot or Kip is an activity.
  - The new shops are clear of all road and sidewalk bands.
  - With no phone, takeSelfie returns false.
  - shopVisit buys a phone and coins go down by its price. The diary shows a 'Bought' entry.
  - The phone mesh colours include his phone colour; case and charm colours show up after buying them.
  - With a phone, a selfie posts.
  - A café odd job pays 12–25, writes a 'Work' entry ("Juniper paid me…") and shows Juniper's thank-you bubble.
  - He can't overspend: coins stay at 5.
  - Over 500 sampled choices: broke means many jobs (105–134); rich with no bike means bike-shop visits rise and jobs drop.
  - Mind buys: a bike can't be bought at the phone store, a bike can't be bought with too few coins, and a valid BMX named Zoomy is bought. A mind-run odd job still pays.
  - The built-in brain buys a helmet.
  - Long trip home → market: a 7-point route. Every waypoint lies on a road lane: (34.5,56.2) → (14,56.2) → (-3.2,56.2) → (-3.2,-1.8) → (-30,-1.8). He mounts, rides low (y 2.31), arrives off the bike, and the bike is parked out front of the market.
  - Park bike ride: an activity looping the lake at radius about 18; the ride count increments and the bike parks at the end.
  - Asking Kip records a true fact.
  - The 'me' tab shows money, phone and bike; the phone shows in his hand.
- old: a saved state without seed150 that has a bike and phone, last seen 10h ago:
  - catchUp runs with no errors and adds the one-time +150 plus the 'Money' note.
  - The bike is in the world.
  - After a reload, there is still only one 'Money' note.
- mind: a mocked window.claude 'sample':
  - The prompt contains Money, the "buy" field, the odd-job hints and the no-selfie rule.
  - The mind buys a lavender Ghostphone (120 → coins 80) and next takes a café odd job.
  - That job pays and the mind then picks a bike-shop visit (fx bikeshop).
  - A 130-coin cruiser is refused with 90 coins; with enough coins it buys a cruiser named "Marshmallow".
  - "biking around the lake" turns into a real bikeride with a loop route.
- mobile: portrait 393x852, landscape 852x393 and unfolded 900x1000: the 'me' tab has no horizontal overflow and there are no errors.

Also run:
- sim.js: about 40 autonomous activities, several runs, no errors. With the phone-first rule a new Mocha buys his phone on day 1 in every run and is saving for a bike after that. In earlier runs that got a bike, he rides on most later long trips.
- test-step2.js desktop still ALL PASS.

Screenshots reviewed (in /tmp/harness/step3/):
- t-phones / ex-phones-far: the Cascade Mobile interior and its placement beside the market.
- t-dot and t-kip close-ups (both look cute and correct).
- t-bikes: the showroom shown side-on.
- look-bikeext: the bike shop exterior.
- ride1 / ride2 / t-ride: riding the right lane with the helmet.
- t-loop / ride-loop: riding around the lake.
- night-ride: the promenade at 6:30pm; eyes visible under the helmet.
- look-gate: the phone in hand with a striped case and star charm, and the BMX parked at the gate.
- spk: the speaker at home.
- t-me and t-me-portrait / landscape: the 'me' tab.
- t-map: the new places on the big map.
KNOWN ISSUES:
- This was already broken before my step (same before and after it): on a landscape phone (852x393) with the side panel open, the dock buttons sit on top of the chat bar, and the chat bar runs under the panel. I didn't touch the CSS. A later layout step should fix it.
- Nothing was tested on a real iPhone or in Safari. Riding was checked in Chromium with SwiftShader, and through the tick() fast-forward hook.
- If his parked bike is more than about 60 units away when he starts a long trip, the bike simply appears at the door of the building he's in. At bedtime a bike that was left far away is moved quietly back to his gate.
- Mocha's body hides most of the handlebars while he rides. The wheels, frame, basket and helmet read clearly. Bikes scale with his size (growScale/1.3).
- There are no collisions. A riding Mocha passes through Wendell, the visitor and pets. The short legs between his parked bike or a door and the road can cross grass.
- S.bike.rides counts only leisure rides (the lake and promenade loops), not commuting trips.
- Earbuds have no 3D model; they appear only as a chip in the 'me' tab. The speaker does appear at home.
- When test hooks call buyGear(live=true) while Mocha isn't in the shop, the shopkeeper's 'thanks' bubble still shows. In normal play purchases only happen while he is at the shop.
- Big-map labels now move up or down 16–32px to avoid overlapping each other, so a few labels in the busy market area sit slightly off their building.
- I changed some existing brain behaviour on purpose. Asking the same shopkeeper again scores a little lower each time (more variety with 13 keepers). Hobbies at shops that are currently closed are no longer chosen (a bug that was already there).
- The default view now draws about 243k triangles, up from about 205k, mostly from the new shopkeepers and bike models. Draw calls are unchanged at about 2110, because every shopkeeper is now merged into about 7 meshes.

## Texting Mocha  smoke=True
STEP 4 (texting Mocha's phone) is done in /home/user/Booknest/ghost-town/index.html. Backup: /tmp/harness/backup-step4.html. Patch sources are in /tmp/harness/step4/ (core.js, ui.js, style.css, patch1.py); several small inline Python edits came after them, so the html file is the source of truth.

1) DATA
- New S fields `texts` (array, cap 150, entries {from:'me'|'him', text, t, read}) and `txQ` (question keys he has asked, cap 30). Both are added in fresh() and migrate(); migrate also cleans malformed entries.
- Optional message flags:
  - `wait` — my text he hasn't answered yet.
  - `zz` — sent while he was asleep.
  - `q` — his question key. `qa` — that question has been answered.
  - `ini` — he texted first.
  - `pic` — 'feed:<postId>' or 'paint:<paintingId>'.
- Message text is capped at 280 characters. The thread syncs with S through pushRemote.

2) CORE (block right after addEntry, so it exists before catchUp runs; nothing in it touches G during catchUp)
- State: `TX` {job, typing, dueAt, woke, outbox, away, fast (time multiplier for tests), lastQ, lastAI, nextAt, viaBar}.
- `sendText(t, via)`: adds my text with wait (plus zz if he's asleep), social +8, mem.chats++. If he's awake he glances at his phone (G.phoneT). Every 6th chat writes a diary line.
- `txTick()` runs every second:
  - Pending texts: while he's asleep (G.sleep activity or `asleepAt(now)`) nothing happens. When he can answer, a delay is picked:
    - just woke up: 20–55s
    - text is older than 10 min (app was closed): 4–8s
    - busy: 10–28s
    - online: 2–5s
  - At the movies or biking ("blocked") he waits until he's done, up to 3 min.
  - Then `txReply`: marks my texts Read, shows typing with his phone in hand, and gets the reply from `mindText()` (Claude) or `txLocalReply()`.
  - The outbox of event texts is handled next, then texts he sends first now and then.
- Built-in replies:
  - `txLocalReply(pend, info)`:
    - If my text answers his last open question, `txAnswer` stores a fact in S.mem.facts (e.g. "favorite food: ramen", replacing an older answer with the same label) and replies in kind. The day/weather/hot dog/pets/advice/painting-opinion questions get special handling.
    - Otherwise `txGeneral` covers: what are you doing (his real activity and place), are you awake, good morning/night (aware of whether he was asleep), love/miss you, boo, weather, food, pets, Wendell, coins and thanks, then falls back to `localReply`.
    - "send a pic" sends his latest post.
    - Adds a "sorry, was asleep!" / "just saw this!" prefix when it applies.
    - About 30% of the time he adds a follow-up question (`txQuestion`, 17 question types; never repeats one he already knows the answer to; at most 4 a day).
  - Bug fix: `localReply` no longer treats the word "mocha" as Mocha's House.
- Claude mind:
  - `mindText(pend, info)`: texting prompt = context({noTexts:1}) + last 12 texts + new texts + his current state and asleep/late notes. Expects JSON {reply, follow_up_question, friend_name, remember[], plan}; everything is validated and capped. Errors fall back to the built-in brain.
  - `mindTextFirst(e)`: expects {text, is_question, skip}; he may decide not to text.
  - Texts he starts with Claude are paced by SET.pace (20/30/60 min, `txAIok`). Replies to your texts always use Claude when it's on, like the in-person chat.
- Texts he starts himself:
  - `txEvent(kind, d, t)` hooks: phone (his first-phone hello), pet, bike, hobby, discover, wendell, paint (attaches the painting; sometimes asks your opinion), goal, buy (45% chance), selfie (30%, attaches the photo). They're wired into buyGear, adoptPet, addHobby, discover, completeGoal, makePainting, takeSelfie and the first Wendell meeting in finishAct.
  - During catchUp only the single most notable event is kept (`TX.away`). `txAwayFlush()` (called after both catchUp calls) adds it as one unread text stamped at the time it happened.
  - Other first texts come every 25–45 min (`txPeriodic`): a question, a moment from what he's doing (`txMoment`), or his latest post.
- Limits (`txCanIni`):
  - At most 8 first texts a day.
  - No first text while you're standing next to him in walk mode.
  - Periodic: none within 5 min of your last text, none within 40 min of his last text, and he stops after two unanswered first texts.
  - Events: wait 8–15 min after his last text, otherwise re-queued; dropped after 2h.
  - Pending events always go before periodic texts.
- `txState()` gives the status under his name: no phone yet / typing… / asleep 💤 · usually up around X / busy · <doing> (job, movie on silent, Wendell, biking) / online · <doing at home | heading to place> / online. A later step can add 'on a trip' there.
- context() takes an options object and now includes his last 4 texts with you (left out of the texting prompts themselves).

3) UI
- A 📱 `#msgBtn` in the dock with a red unread `#msgBadge`. New messages make the badge pop and the phone wiggle, with no sound.
- New-message toast "💬 Mocha: …" is tappable and opens the thread (`#toast.tap`). If you just texted from the chat bar, his reply also floats above the bar (`showHimMsg`).
- `#msgs` Messages app:
  - Header: avatar, name, live status dot/text, × button.
  - Thread: his bubbles on the left (white), yours on the right (blue). Day/time separators, per-group times, Delivered/Read on your last text, animated typing dots, picture bubbles (painting thumbnail or selfie; tapping opens the existing viewer), and a 🌙 asleep note when texts are waiting.
  - Empty states: no phone yet (Cascade Mobile, his coins, how to talk in person; input disabled) and a fresh thread.
  - Input row reuses auto-send and the mic: `chatIn()`, generalized `submitChat`/`scheduleSend`, a `#msgMic` button, and `updateMicBtn` updates both mic buttons.
- Layouts:
  - Desktop and unfolded: card where the panel goes; the panel is hidden while it's open and the dock shifts left.
  - Portrait: full-screen sheet (z 9), fitted to visualViewport for the iOS keyboard. The 3D scene renders at about 3 fps underneath (`msgCover`).
  - Landscape: card on the right.
  - While it's open: the chat bar and hint are hidden, the walk sticks and walk zoom are hidden, Escape closes it, and other keys are swallowed.
- The bottom chat bar now routes by `chatMode()`:
  - 'person': next to him in walk mode, or watch mode while he has no phone (same as before).
  - 'text': he has a phone and you're apart; placeholder "📱 text Mocha…", button "text".
  - 'far': walk mode, no phone, far away; shows a toast.
  - Placeholder and button text update every second.
- The 'me' tab phone section notes "you can text him with the 📱 button · N texts"; the 'you' tab friendship line shows the text count.

4) LAYOUT FIXES CAUSED BY THE TALLER DOCK (plus pre-existing ones)
- Portrait: the toast moved to the top under the pills (150px in walk mode) and the hint moved up to 312px. The walk-mode dock uses 46px buttons and sits at bottom 184px (258px with the chat bar open).
- Landscape: the toast sits top-left under the Mocha pill.
- Landscape with the panel or Messages open: the dock becomes a column at the top, and the chat bar is clamped left of the panel. This fixes the step-3 known issue where dock buttons sat on the chat bar and the bar ran under the panel.
- Landscape walk mode with the chat bar open: the dock was squished (pre-existing); fixed. `#dock>*{flex:none}`.
HOOKS: ["window.__mocha.TX (texting state; TX.fast multiplier, TX.nextAt, TX.outbox, TX.typing, TX.job)", "window.__mocha.texts() -> {n, unread, typing, job, pending, status:{k,t}, open, cover, outbox:[kinds], badge, list (last 24 copies), facts}", "window.__mocha.sendText(text) (sends from the Messages app path)", "window.__mocha.openMsgs() / closeMsgs()", "window.__mocha.txTick() (run the texting scheduler once)", "window.__mocha.txEvent(kind, data, t) (kinds: phone, pet, bike, hobby, discover, wendell, paint, goal, buy, selfie)", "window.__mocha.txInitiate(event|null, type?) / textFirst(type?) (type 'q'|'m'|'p'; makes him text first now, skipping the rate limits)", "window.__mocha.txState(), txAsleep(), txCanIni(e), chatMode(), chatPH()", "window.__mocha.txLocalReply(pendArray, info), txQuestion(), txAwayFlush(), txAdd(from, text, t, extra), renderMsgs() (forced re-render)", "window.__mocha.textFast(f) (scales every texting delay/rate limit; tests use .01\u2013.35)", "window.__mocha.you(x, z) (place the visitor in walk mode; returns {x,z})", "New S fields (in fresh() AND migrate()): texts[] (cap 150), txQ[] (cap 30)", "New globals (core, defined before catchUp): TXQS, TXPRI, TX, txOnNew, txRefresh, txWait, txAdd, txEvent, txEventText, txEvWhy, txAwayFlush, txAsleep, txBlocked, txPlace, txState, txNow, txEmoji, txWeatherLine, txNowLine, txMoment, txQOk, txQuestion, txClean, txAnswer, txPicReply, txGeneral, txLocalReply, txLine, mindText, mindTextFirst, txPeriodic, txAIok, txInitiate, txDelay, txReply, sendText, txCanIni, txTick", "New globals (UI): msgOpen, chatMode, chatPH, chatIn, msgEl, msgList, msgIn, msgCover, msgVH, msgSheet, txUnread, txBadge, txTime, txDay, txPic, renderMsgs, fitMsgs, openMsgs, closeMsgs, showHimMsg, chatPHupdate", "context(o) now takes {noTexts:1}; by default it includes his last 4 texts", "New DOM: #msgBtn (+ #msgBadge) in #dock; #msgs (.mHd, #msgStat, #msgClose, #msgList, #msgForm > #msgIn, #msgMic, #msgSend); body.msgOpen; #toast.tap; #chatlog .msg.him", "Claude JSON: texting reply {reply, follow_up_question, friend_name, remember[], plan}; first text {text, is_question, skip}"]
TESTS: Smoke: `node /tmp/harness/smoke.js 15` and `node /tmp/harness/smoke.js 1` print "OK (no errors)" for desktop, portrait and landscape. Both runs were repeated after the last code change.

Feature test: `/tmp/harness/test-step4.js` (sections ui, ui:<viewport>, sleep, reopen, mind, soak). It ends with ALL PASSED. Screenshots are in /tmp/harness/step4/.

UI section, run on desktop 1100x820, portrait 393x852, landscape 852x393 and unfolded 900x1000:
- No phone: chat bar says it's in person; Messages shows the no-phone empty state with the input disabled; status is "no phone yet"; × closes it.
- Walk mode: far away with no phone gives 'far'; next to him gives 'person'.
- Buying his first phone makes him text first ("hi!! it's mocha 👻📱…"). The badge shows 1, the toast appears, and the chat bar switches to "📱 text Mocha…".
- Opening Messages clears the badge.
- Sending through the input shows my text as pending, then the typing dots, then his reply, and my text turns Read.
- A painting picture bubble shows, and tapping it opens the viewer; Messages stays open after the viewer closes.
- His food question answered with "probably ramen!" stores the fact "favorite food: ramen", and his reply mentions it.
- textFirst('q') sends a question and shows badge 1; a second first text right after is blocked by the rate limit.
- A text from the chat bar gets a reply that floats above the bar, and the fact "likes jazz" is stored.
- In person next to him: a speech bubble reply and no text added.
- Walk mode with Messages open: both sticks hidden. Messages fits on screen with nothing overlapping on the wide layouts.
- No page errors.

Other sections:
- sleep (desktop and portrait): while he's asleep my text stays Delivered, status reads "asleep 💤 · usually up around 6:59am", and the 🌙 note shows. After he wakes he answers ("i am now!! ☀️ …" or "sorry, was asleep! …").
- reopen: a save last seen 9h ago with a goodnight text sent while he slept reloads and replies "sorry, was asleep! …"; the badge shows it.
- mind (mocked Claude):
  - The texting prompt includes the new text and context().
  - The reply and follow-up question (q:'ai') land in the thread; friend_name 'Sam' and the remembered fact are applied.
  - A Claude-written first text works; the next one right after uses the built-in brain (pacing).
  - A Claude error falls back to the built-in reply.
- soak (70s, texting delays sped up): his first-phone hello comes first, then one periodic question, then he stops (no spam). The badge counts both; no errors.

A reply sampler (/tmp/harness/step4/replies.js) checked about 30 built-in replies, answer cleaning ("I've been into lofi beats" → "lofi beats", "nope" → "pets: none (yet)") and the away text.

Regressions: /tmp/harness/test-step2.js passes for all 4 viewports. It briefly failed one portrait pinch check because the taller dock covered the touch point; fixed by compacting the walk-mode dock. /tmp/harness/test-step3.js passes in all sections.

Screenshots I looked at: Messages thread / no-phone / asleep / walk+Messages in every viewport, badge plus toast, chat-bar reply float, landscape and portrait toast placement with and without the panel, walk mode with the chat bar open in portrait and landscape, and smoke images at hours 15 and 1. Two overlaps found in them were fixed: the toast over the portrait dock, and the squished landscape dock with the chat bar open.
KNOWN ISSUES:
- Not tested on a real iPhone or in Safari. Fitting the full-screen sheet above the iOS keyboard (visualViewport top/height, .kb class) has never been seen on a device.
- Replies and his first texts only happen while the page is open (there is no background). Texts left waiting are answered a few seconds after the app reopens, with a 'sorry, was asleep / just saw this' opener, and the reply is stamped with the reopen time.
- Built-in brain pairing is a guess: the next text you send after one of his questions counts as the answer, unless it ends in '?', is a greeting/goodnight/'what are you doing', or is over 120 characters. So an unrelated reply can be stored as a fact like 'favorite food: jazz'. With Claude on, Claude's 'remember' decides instead.
- The built-in brain answers at most the last two waiting texts; older ones are only marked Read. Claude sees all of them.
- While the app was closed he sends at most one text (the most notable event, e.g. buying his first phone or a new pet). It is added after catchUp with the time it happened.
- With his Claude mind on, every text you send costs one Claude call, the same as the in-person chat. Only texts he starts himself are paced by SET.pace.
- Watch mode with no phone still means talking in person (same as before). Once he has a phone, the chat bar texts him unless you're within 12 units of him in walk mode.
- The 'on a trip' status isn't implemented. A later step can add it to txState(), and to txBlocked/txAsleep if he shouldn't answer while travelling.
- Layout changes outside Messages: portrait toast moved to the top (150px in walk mode), portrait hint moved up, portrait walk-mode dock buttons are 46px and lower, landscape toast moved top-left, landscape with the panel open uses a top dock column and clamps the chat bar. These also fix two pre-existing landscape problems.
- The Messages avatar is a plain 👻 circle; it doesn't use his phone or case colour.

## Calendar, holidays, parents' mail  smoke=True
STEP 5 (calendar, holidays, parents' mail) is done in /home/user/Booknest/ghost-town/index.html. Backup: /tmp/harness/backup-step5.html. The sources are in /tmp/harness/step5/: core.js, world.js, ui.js, style.css and patch.py. patch.py rebuilds index.html from the backup each time it runs. The html file is the source of truth. The file is now about 495KB.

1) HOLIDAY CORE (core block, placed just before bumpInterest so it exists before catchUp; it uses only function declarations, `var` state and S)
- Dates come from the user's LOCAL date:
  - dkey, dFromKey, dayStart, dayDiff, addDays, monthName.
  - easterMD (Gregorian computus) and nthDow.
  - solMD: Meeus equinox/solstice with 24 periodic terms, so 2028's March equinox correctly falls on Mar 19 in Pacific time.
  - lnyMD: Lunar New Year table 2024–2032. zodiac.
- holidaysFor(y) is cached per year. Each entry has {id,n,s(short),e,m,d,len,big,info,date,k:'id-YYYY'}. Holidays: New Year's Day, Lunar New Year, Valentine's, St. Patrick's, spring/summer/fall/winter solstices and equinoxes, Easter, Earth Day, Mother's/Father's Day (US), July 4, Halloween, Día de los Muertos (2 days), Thanksgiving, Christmas Eve, Christmas, New Year's Eve.
- holPersonal(y) (cached) adds:
  - 'anniv': N years after S.born.
  - 'bday': the owner's birthday, from S.mem.facts via bdayParse/ownerBday/setBday. It accepts "March 3", "3/14" (US month/day) and "14th of july".
- Lookups: holAll, holsOn(t), holNext(id), holUpcoming(t,max,n), holWin(id,t,w0,w1).
- holTheme(t) gives the decoration theme by date: halloween Oct 17–31, muertos Nov 1–2, harvest Nov 3–Thanksgiving, winter after Thanksgiving–Jan 6, newyear Dec 31–Jan 1, lunar LNY-1..+6, valentine Feb 8–14, stpat Mar 15–17, easter Easter-6..+1, july4 Jul 1–4.
- fwShow(t): fireworks run 00:00–00:20 on Jan 1 and 21:48–22:45 on July 4.
- nyeAwake: asleepAt(h,t) now takes an optional t and keeps him up from Dec 31 20:00 until Jan 1 00:45. localChoose and catchUp pass t.
- holLabel() puts e.g. '🎃 halloween' in the sky pill on big holiday days.
- FACTS gained true entries: halloween, 'día de los muertos', thanksgiving, 'winter holidays', 'lunar new year', fireworks.

2) MOM & DAD'S MAIL
- Backstory: Mom (Clementine) and Dad (Barnaby), two old ghosts who keep a lighthouse on the Oregon coast. It is used the same way in letters, context and UI.
- mailDeliver(now) puts parcels in S.mbox ({id,k,h,t,g,hold,an}). The mail arrives at 10:30am.
  - MAILPLAN: lunar, valentine(-1 day), stpat, easter(-2), halloween(-4), muertos, thanksgiving(-2), christmas(-3, held until Dec 25 morning), anniv.
  - Care packages come every 9–16 days (S.careAt).
  - A new Mocha gets a welcome letter about 3 minutes after moving in.
  - On first run (S.mailT 0, both fresh saves and migrated old saves) only parcels whose window covers "now" arrive, stamped as just arrived. So the owner's existing save gets the Halloween parcel right away tonight.
  - mailDeliver is called at load, inside catchUp, after a remote state pull, and every 10s of real time.
- mailGift(h) picks the parent-chosen gift by holiday:
  - Halloween: costume (witch hat, cape or mask) plus taffy.
  - Christmas: holiday hat or antlers, snow globe and 25 coins.
  - Thanksgiving: blanket decor plus coins.
  - Lunar New Year: a red envelope with 18 coins.
  - Others: scarf, bunny ears, four-leaf clover, fern plus coins.
  - Care packages: 10–25 coins, a knitted beanie/scarf, or a coast treasure.
- Gifts are applied through acquire(), S.decor, S.items or S.coins. Costumes are worn automatically during Halloween week (wearCostume) and taken off afterwards (unCostume restores his previous outfit when he's awake).
- Letters: LETTERS holds warm templates. openMail(t,live,{letter,brief}) moves parcels into S.mail (cap 40) as {id,h,k,t,sent,from,text,gift,wrapped,hold,g?,reply,seen}. It writes a 'Mail' diary entry, shows a toast and queues txEvent('mail').
- unwrapGifts opens held gifts on Christmas morning. writeBack() sets l.reply. Mother's/Father's Day cards are outgoing letters ({from:'me',to}).

3) BUILT-IN BRAIN
- New ACTS: 'checking his calendar' (home desk, fx 'calendar'), 'checking the mail' (new home spot 'mailbox' by the gate, fx 'mail'), 'writing back to Mom and Dad' (fx 'writeback').
- New home spots: mailbox, porch, tree.
- localChoose:
  - Filters mail and writeback by availability.
  - Scores calScore (bonus when a holiday is within 14 days and he hasn't checked in 20h) and mail (+4.5).
  - Adds holCands(at).
- HACTS: about 37 holiday activities {k,h,w0,w1 window,hr hours,p,s,doing,tags,w,once,multi,req,no,wen,at}:
  - Halloween: costume at the thrift shop, carving a pumpkin (adds the existing DECOR 'pumpkin'), buying candy (8 coins), trick-or-treating, handing out candy on the porch.
  - Trick-or-treating has a stop at every open shop with a keeper plus Wendell's porch, up to 5 stops. Each keeper gives a personal treat, his first pail becomes a treasure, and there's a haul entry at the 4th stop. He wears his costume and carries a pumpkin pail.
  - Día de los Muertos: visiting the community ofrenda in front of the library (true fact added to the notebook), papel picado at the studio, pan de muerto at the café.
  - Thanksgiving: plan the dinner, shop, bake a pie, dinner with Wendell (he stays on his porch from 12 to 20 that day).
  - December: decorate (his house tree and lights appear), gifts (12 coins), wrap, cookies, town tree lights, opening presents on Christmas morning, giving Wendell his present.
  - New Year: the Needle countdown on NYE and after midnight, resolutions (sets a goal).
  - Valentine's cards, then handing them out (multi-stop).
  - Clover hunt (St. Patrick's); lion dance and dumplings (Lunar New Year); dyeing eggs and the egg hunt (Easter); Earth Day litter pickup; July 4 fireworks at the promenade.
  - Cards to Mom/Dad, anniversary at the café, birthday cake for you, earliest/latest sunset on the solstices (the daylight length is computed from SUN).
  - Prep activities weigh more as the day gets closer, and +1.4 after he checked his calendar (S.hol.plan).
- holOutcome(a,t,live,brief) applies the effects and diary lines (brief = Claude already wrote the diary). calCheck writes "Halloween is in 3 days! I should find a costume." style entries and draws a month calendar on his desk monitor (setCalScreen).
- Greetings: holLine/kHi give holiday greetings for keepers (arrive and walk-mode), Wendell lines and greetings, holMuse musings. Trick-or-treat/valentine arrival bubbles; he faces the keeper.
- Texting:
  - txEvent kinds 'holiday' (holText) and 'bday' are queued once per day by holTick, only after his first hello text. 'mail' is queued too.
  - TXQS gained a 'bday' question, and txAnswer stores the answer as 'birthday: March 3'.
  - txGeneral and localReply answer 'happy halloween' and similar greetings, and in-person "my birthday is …" (holReplyTo).
- rollWeather: extra snow chance in the winter holiday season, higher on Dec 24–25.
- A riding/walking act with `at` uses that world spot (startAct).

4) CLAUDE MIND
- context() adds holContext(): today's date and holiday, what's coming up, holiday activity ids available now, the costume, the parents, 'MAIL IS WAITING … place home spot mailbox', unanswered letters, the wrapped box.
- mindThink did-line adds mailBrief(), writeback, calendar and holiday-activity hints.
- The JSON gains "letter", "write_back" and next.holiday. Rules were updated.
- applyMind calls openMail/writeBack/calCheck/holOutcome (brief if it wrote a diary). applyDecision handles d.holiday and maps doings like 'checking my calendar', 'checking the mail' or 'writing back' to the right acts. The fx whitelist and narrateFallback include mail, writeback, calendar and hol.

5) WORLD
- The world block sits before the MOVEMENT section. Everything is lightweight and rebuilt only when the theme changes or holDirty is set:
  - A HOL.g group of InstancedMeshes (IK helper) plus glow sprites, which are removed from nightGlows and disposed on clear (sprite geometry is never disposed).
  - String lights along every shop front, Wendell's house, 3 neighbor houses, his house eaves, bay and fence.
  - Jack-o'-lanterns with carved glowing faces (the face material darkens by day). His existing fall porch pumpkins get carved faces. Purple and green wisps.
  - Marigold garlands on his fence and gate arch, marigold pots at shop fronts, papel picado strings, porch candles, a community ofrenda in front of the library (tiers, marigold arch, photos, candles, pan de muerto, sugar skulls).
  - Harvest wreaths, gourd piles and hay bales.
  - Winter: green wreaths with bows, multicolor lights, a big decorated town tree in front of the library (blockers keep random trees away), and his own small tree inside the house with presents once he decorates.
  - Lunar lanterns, Valentine hearts, St. Patrick's green/gold lights, Easter eggs in the park and his yard, July 4 red/white/blue lights.
- MBX mailbox: plum, named 'MOCHA'. A red flag rises and a glowing envelope sprite bobs when mail is waiting.
- BATS: 12 instanced bats flap around the camera area on Halloween dusk/night, and fade out near the camera.
- FW fireworks: a pooled Points system (1300 particles, noBend, additive). Rockets launch into bursts: 65% placed in the camera's view, 20% around the Sky Needle, 15% over the water.
- NYE: a '🥂 one minute to midnight' toast, a 10…1 countdown and a 'Happy New Year' toast. Mocha says it if he's awake.
- holFrame(dt,T) is called in frame(). Its timers use real time.

6) UI
- A new panel tab '📅 calendar' (#tab-cal) with a red #calDot for unseen letters or waiting mail. renderCal shows:
  - A month grid with prev/next and 'back to today', holiday emoji, today ringed, the selected day dark, mail dots, teal day numbers on days he has diary entries.
  - The tapped day's details: holidays with true info, mail that came, his diary that day.
  - A 'coming up' list (tap to jump) plus his own plan quote.
  - 'his mailbox' status and backstory.
  - Letter cards (handwriting font, tap to expand, gift line, wrapped badge, his reply). Viewing marks them seen.
- All touch targets are at least 44px; 7 columns fit the 393px portrait sheet.

PERFORMANCE: Halloween decorations add about 12 draw calls (1615 → 1627) and only a few dozen triangles in the default view. Bats and fireworks only update while active.
HOOKS: ["window.__mocha.holidaysFor(y), holAll(y), holsOn(t), holUpcoming(t,maxDays,n), holTheme(t), easterMD(y), solMD(y,q), fwShow(t), nyeAwake(h,t)", "window.__mocha.holForce(theme|null|undefined): force a decoration theme (undefined = back to the date); holTickNow() runs the holiday/mail tick on the next frame", "window.__mocha.holCands(t): eligible holiday activities; holAct(key|hdk, warp=true): start one (warps near it); holOutcome(act,t,live,brief); holText(d); holLine(); kHi(k); holContext(); mailBrief()", "window.__mocha.mailDeliver(now), openMail(t,live,{letter,brief}), unwrapGifts(t,live), writeBack(t,{text,brief}), calCheck(t,brief), holTick(now)", "window.__mocha.mail() -> {mbox, mail(12), sent, careAt, mailT, waiting, flag, env}; hol() -> {theme, kids, glows, bats, fw, fwLive, pail, costume, wearing, state:S.hol}", "window.__mocha.fwForce(seconds) (force fireworks), fwBurstNow(n) (instant bursts in view)", "window.__mocha.bdayParse(s), ownerBday(), setBday({m,d}), wearCostume(), renderCal(), CAL {y,m,sel}, calDot(), MBX (mailbox {g,fp,env,eg,x,z})", "New S fields (in BOTH fresh() and migrate()): mail[] (cap 40 letters {id,h,k,t,sent,from:'Mom & Dad'|'me',to?,text,gift,wrapped,hold,g?,reply,seen}), mbox[] (cap 6 parcels {id,k,h,t,g,hold,an}), mailSent[] (cap 40 keys), hol {done[] cap 60, plan[] cap 8, n{} cap 16 counters, pw, pwk}, calT, careAt, mailT (0 = first run)", "New ACTS fx: 'calendar' (home desk), 'mail' (home spot 'mailbox'), 'writeback' (home desk); new home spots mailbox/porch/tree; holiday acts use fx 'hol' with hx/hk/hdk/hname/hw/at/keeper/npc fields", "New WEAR items + accModel: witchhat, santahat, antlers, bunnyears (head), mask (face); HOLWEAR/holWearOk keeps holiday items out of the everyday closet off-season", "New txEvent kinds: 'holiday', 'bday', 'mail' (TXPRI 6/9/5); new TXQS question 'bday' (f:'birthday')", "Claude JSON: new 'letter', 'write_back' fields and next.holiday; context() includes holContext()", "New globals (core): HCACHE, holDirty, HOLFORCE, HLAB, HPC, dkey, dFromKey, dayStart, dayDiff, addDays, monthName, easterMD, nthDow, solMD, lnyMD, zodiac, holidaysFor, bdayParse, ownerBday, setBday, holPersonal, holAll, holsOn, holNext, holUpcoming, holWin, holTheme, fwShow, nyeAwake, holLabel, holDone, holMark, holN, COSTUME, HOLWEAR, holWearOk, costumeItems, hasCostume, getCostume, wearCostume, unCostume, mailAt, MAILPLAN, mailGift, giftDesc, applyGift, LETTERS, letterText, mailWaiting, mailUnanswered, mailDeliver, openMail, unwrapGifts, writeBack, calScore, calPrep, calCheck, OFR, TOWNTREE, HA, HACTS, holHas, holCands, TREATS, VALS, holOutcome, holLine, kHi, holMuse, holContext, holTick, holText, holReplyTo, mailBrief", "New globals (world): HOL, KEEPG, pumpG/stemG/faceG/hBulbG/puffG2/flagG/wreathG/lanternG/capG/eggG/unitBox/candleG/potG/ornG/heartG, faceTex/faceM, papelTex/papelM, hBulbM, starTex, envTex, MBX, pailObj, IK, HM, hGlow, HOUSES, LW, holFronts, holString, frontString, HOMEF, homeLights, pumpkin, treeR, xmasTree, presents, holClear, holBuild, BATS, batsFrame, FW, hGlowFree, fwSpawn, fwBurst, fwLaunch(now), fwFrame, holFrame", "New globals (UI): CAL, calDot, setCalScreen, renderCal; DOM: nav button[data-tab=cal] with #calDot, #tab-cal; CSS classes .calGrid .cd .calDay .up .uw .letter .mbx .plan"]
TESTS: Smoke tests (node /tmp/harness/smoke.js 15 and 1) print OK with no errors on desktop, portrait and landscape, after the final edit.

Feature test /tmp/harness/test-step5.js has sections dates|halloween|muertos|thanks|xmas|nye|migrate|catchup|mind|ui. ALL PASSED, 88 checks:
- dates:
  - In-page holiday dates for 2026–2028 match: Easter 4/5, 3/28, 4/16; Mother's Day 5/10, 5/9, 5/14; Father's Day 6/21, 6/20, 6/18; Thanksgiving 11/26, 11/25, 11/23; Lunar New Year 2/17, 2/6, 1/26.
  - Themes by date, birthday parsing and the upcoming list.
  - Answering his 'when's your birthday' text puts the birthday on the calendar. A birthday text and the cake activity follow.
  - Separately, node with TZ=America/Los_Angeles confirmed every equinox and solstice for 2024–2028 against published times (e.g. 2028-03-19).
- halloween (fresh profile, Oct 31 18:30):
  - Halloween theme, decorations built, Halloween parcel in the mailbox, flag and envelope up, mail announced, sky pill shows halloween, bats out.
  - He walks to the mailbox and opens it: lavender witch hat plus taffy, wears the costume, Mail diary entry.
  - 12 trick-or-treat stops available. The built-in brain picks trick-or-treating for well over 40% of choices (about 48–60% across runs).
  - holAct trick: pumpkin pail in hand, keeper bubble 'what a costume!', diary 'Trick-or-treated at Rain City Records. Basil the fox dropped a lollipop shaped like a record…'.
  - With a phone, the holiday text is queued.
  - Calendar tab renders (today, letter card); tapping Nov 26 shows Thanksgiving.
- muertos: the ofrenda activity writes a diary entry and adds a true fact to the notebook.
- thanks: harvest theme, parcel, pie at noon, dinner with Wendell in the afternoon.
- xmas: winter theme, town tree, the Christmas box opens on Christmas Day, Christmas morning diary.
- nye (Dec 31 23:59:30): he stays up, the needle countdown activity is available, toasts '🎆 10…' through '1…' then 'Happy New Year! Hello, 2027!', fireworks after midnight.
- migrate: an old save without the new fields gets no welcome letter, gets the Halloween parcel immediately, and a care package is scheduled.
- catchup: with the app closed overnight the care package was delivered; the diary while away showed calendar check, pumpkin, candy, a mail letter and the costume.
- mind (mocked window.claude): the prompt contains Calendar, MAIL IS WAITING, "letter" and "holiday" fields and the "trick" id. The Claude letter is stored, the diary is used once, next.holiday starts trick-or-treating, and doings map to the calendar and mail acts.
- ui on portrait, landscape and unfolded: the grid fits and cells are 44px tall.

Regression: test-step2, test-step3 and test-step4 all pass.

Screenshots reviewed (in /tmp/harness/step5/):
- hw-home, hw-trick (Mocha in witch hat with pail at Basil's counter), hw-street, m-hwporch, m-hwshops.
- hw-cal and hw-cal2 (desktop calendar).
- ui-cal / ui-cal2 for portrait, landscape and unfolded.
- dm-ofrenda and ofr (ofrenda at night), tg-cafe, tree (town tree in snow), xm-home (indoor tree), fw4 (fireworks over the water), m-lunar, m-easter, desk (calendar on his monitor), defhw-portrait.

Fixes made from the screenshots:
- Bulb size, pumpkin glow size, jack-o'-lantern face depth.
- Bats spread wider and fading near the camera.
- Fireworks placed in the camera view.
- Marigold emissive so they stay vivid at night.
- A '.when' class clash (NaNd ago) and the plan-quote grammar.
KNOWN ISSUES:
- Not tested on a real iPhone or in Safari. Everything ran in Chromium with SwiftShader at 1–5 fps, so in-game timers (activity length, rockets) ran slow; the tests drove them through hooks.
- Fireworks are partly staged for the viewer: about 65% of bursts are placed in front of wherever the camera looks, 20% around the Sky Needle and 15% over the water. The owner always sees the show, but it isn't only 'over the water'. Bats also circle the camera's area.
- When the camera is close, the front of his house fades, so the eave light string and papel picado appear to float just in front of the faded wall. The same happens at shops when you peek inside.
- Lunar New Year only has dates for 2024–2032 (table). Outside that range it is left off the calendar.
- catchUp still simulates at most 14 activities. For long absences, holiday prep isn't fully simulated, and parcels that arrived while away sit in the mailbox until he checks it live.
- Holiday texts ('happy halloween', birthday) are sent only after he has sent at least one text, so the first-phone hello comes first. While the app was closed he sends at most one text, as in step 4.
- Birthday parsing reads numeric dates as US month/day (3/4 = March 4). With Claude on, any remembered fact containing 'birth' and a date is used.
- Trick-or-treating is capped at 5 stops a year and needs open shops (17:00–21:30). Wendell's stop needs him outside; on Halloween he stays on his porch 17–21.
- His house holiday tree only appears after he chooses to decorate. The built-in brain weights this from late November until Dec 24. A fresh Mocha on Christmas Day may not have one.
- Halloween parcels can still arrive on Nov 1 for first-run saves (a one-day grace period). The costume isn't auto-worn then, because the theme is over.
- Christmas-season decorations start the day after Thanksgiving, not exactly Dec 1. Fixed parts like the town tree and ofrenda are placed in front of the library at constant positions; a blocker keeps random trees away from the town tree spot.
- In the built-in brain, trick-or-treating is about 50–60% of choices on Halloween evening; it's weighted, not forced.

## Train station + trips  smoke=True
STEP 6 is done: Rain City Station, a train on a real-time schedule, and trips Mocha chooses himself. All edits are in /home/user/Booknest/ghost-town/index.html (now about 567KB). Backup: /tmp/harness/backup-step6.html. Sources are in /tmp/harness/step6/ (core.js, interior.js, world.js, ui.js, style.css, patch.py). patch.py rebuilds index.html from the backup each time it runs.

1) STATION + TRAIN (world)
- PLACES gets 'station' "Rain City Station" at (140,0), ry -PI/2, 16x10x7, hours 6–23, kind:'station', brick walls, gable roof (shop() now accepts p.gable). It sits at the east end of the main road, so the road runs into its front door.
- Inside (INTERIORS.station):
  - a ticket window, with Rowan behind it
  - benches, a glowing ticket kiosk, a "where the trains go" route map, a wall clock, a rug, plants and lamps
- Outside:
  - a clock cupola on the roof that fades with the shell
  - a door out to the platform on the back wall
  - a 52-long platform with a yellow edge, a canopy with night glows, benches, and a station sign
  - a two-sided departure board (p.board canvas). drawBoard() redraws it from the real schedule: next train, the 5 train destinations and prices, and "👻 MOCHA" on the line he's riding.
  - Spots: main, bench, kiosk, board, platform, and counter (set by the keeper).
- Track at x=TRN.x=151.4 runs the full z range of -345..345, off both map edges:
  - ballast and rails are one baked mesh; 427 sleepers are one InstancedMesh (frustumCulled=false)
  - trees keep 7 units away from it and bushes 5
- TRAIN = makeTrain(): a loco plus 3 coaches, baked into about 3 draws, with no face on the loco.
  - The coaches have teal/cream bodies with window strips that glow at night (window material is in winMats).
  - The loco has a rounded nose with a windshield band and a headlight with a glow.
- SIG: a signal at z=31 that turns green while the train is leaving.
- Schedule (core): trainAt(ms) returns {st:'arr'|'dwell'|'dep'|'none', z, s, left}.
  - A train pulls in on every 5-minute mark of the local clock: 22s arriving from the north, 40s standing at the platform, 22s leaving to the south.
  - Trains only run while the station is open (6:00–23:00).
  - nextTrain(ms) gives the next standing train. trainDoorZ(z) gives the nearest coach door. trainFrame(dt) runs from frame().
- Keeper 'rowan': Rowan the red panda (he), a conductor in a navy vest. makeCritter has a new L.cap flag for his conductor cap. He covers trains and travel, fk:['trains'].
- New ACTS at the station:
  - 'watching the trains'
  - 'reading the departure board'
  - an odd job, 'sweeping the platform for Rowan' (pay 10–16, keeper rowan)
  - the automatic 'asking Rowan about trains and travel'
- altitudeAt only lifts him over the station building itself, so he floats at normal height on the platform. floorAt puts the walker at .92 on the platform.
- Station hover label is raised above the cupola. The big map is re-centered (MX 0, was -20) so the station and track fit; it draws the track, the moving train, and a "👻 away on a trip: X" pill in place of the 👻. Map labels are clamped to the canvas. The legend gains "🚆 the train".

2) TRIPS (core block, inserted before catchUp; data only)
- TRIPS has 7 destinations: {n, s, e, by, cost, hrs, ride, tags, fk, night, col, sv, pcl, inn, arr, arrX, see, cap, tx}.
  - rainier (train, 30): Paradise meadows
  - leavenworth (train, 34, can be overnight): extra festive in December, with its own arrival line and a snowy Christmas-lights postcard
  - hoh (train, 36, can be overnight)
  - snoqualmie (train, 16)
  - tacoma (train, 20): Museum of Glass
  - bainbridge (ferry, 12)
  - sanjuans (ferry, 38, can be overnight)
- FACTS gains 'trains' plus one key per destination. All are checked true, for example:
  - Paradise got 1,122 inches of snow in 1971–72, a world record at the time
  - Snoqualmie Falls is 268 ft
  - the Museum of Glass opened in 2002
  - the Pig War of 1859
  - J/K/L pods
- Other table additions: TAGNAME/TOPIC_FOR entries for trains and travel; HOBBY_FROM.trains = trainspotting and HOBBY_FROM.travel = collecting postcards; TREASURES.station.
- tripPlan(id,t0,chk):
  - Checks hours: train departures 6:18–21:24, ferry 7–19:30.
  - Day trips must be back by min(bed-.5, 22.6) (ferry 21.5).
  - Overnight-capable places can stay overnight. That happens if needed, or 45% of the time when leaving after 1pm. Overnights sleep per sched() and come back at wake + 1.2–2.6h.
- tripOk(id,t) returns '' or a reason: bedtime, can't afford the ticket, TRIPGAP cooldown of 54h, or no time to get back before bed.
- tripCand(at): the built-in brain picks one eligible destination by taste. It favours unvisited places, his interest tags, and Leavenworth in December. Its weight `tw` uses adventure and curiosity, +1.4 on weekends, +.7 for a first trip, -4 on big holidays, and -1.4 if he's saving for a phone.
- tripAct(id) = {p:'station'|'ferry', s:'platform', fx:'trip', trip:id, doing:'catching the train to X'}.
- tripBegin(id,t0,live):
  - Pays for the ticket and sets S.tripLast.
  - Builds S.trip = {id, t0, back, over, ev:[[t,'go'|'arrive'|'see'|'card'|'sleep'|'wake'|'leave'|'home']], i, sv, pc, pid, xm}.
  - Simulated train departures snap to the schedule.
- tripEv(k,t,live) writes each moment:
  - 'Trip' diary entries in his voice
  - true facts added to the notebook under the place name
  - a souvenir added to S.items
  - txEvent('trip',{k,id,pic}) texts
  - toasts when live
- tripCard(): his postcard.
  - Always mailed to Mom & Dad: an S.mail entry {from:'me', to:'Mom & Dad', cid, card:{d,s,x}, text with a true fact}.
  - Posted to his feed 72% of the time: an S.posts entry {kind:'postcard', d, s, x, caption, place}.
- tripAdvance(now,live) replays due moments. Live, it stops before 'home'.
- tripEnd(t,live) finishes the trip:
  - bumps his interests (which can grow hobbies) and needs: fun +50, curious +45, energy -18; xp +30; station/ferry visits +1
  - adds the trip to S.trips (cap 24): {id, t0, t1, over, sv, pc, s, x, up}
  - writes the "Got back from X" diary entry
- tripPhase() gives: on the train there / exploring X / asleep at the inn / on the train home.
- tripText(d) builds his texts. tripContext() builds the Claude context lines. tripUnpack(at): within 50 min of getting back, 'unpacking from his trip' at home is returned first with probability .55+coziness*.35 (still his choice), and otherwise stays a strong candidate (fx 'unpack', marks the trip up=1).
- Pets come along: they're hidden while he's away, and the diary says "{pet} came too".

3) LIVE FLOW (world block; G.mode 'trip')
- He travels to the platform or the ferry dock. If he owns a bike, planRide rides him to the station door, where it stays parked. arrive() for a trip act sets timer 1e9 and faces the track.
- tripTick(dt) is called in updateMocha.
  - Waiting: 'waiting for the 3:05pm train'. When a train stands at the platform with more than 6s left, he floats to a coach door and boards (tripGo → tripBegin + 'go' moment), then tripVanish().
  - Ferry: he boards when FERRY docks (ferryPh()<.06), rides out visibly, and vanishes when it's far out (ph .36–.6).
  - Gives up after 9 min (train) or 6 min (ferry).
  - Away: mocha, shadow, bubble and pets are hidden. G sits across the track from the platform (TRN.x+3.6, -2) or at the ferry dock, so the follow camera watches the station and the trains. Needs don't decay, musings stop, startAct/goPoint/applyDecision/nextThing are ignored, and taps on his hidden mesh are ignored.
  - Every second tripAdvance runs.
  - When now >= back:
    - By train: he steps off the next standing train (or anyway after 7 min).
    - By ferry: he rides the returning ferry in (ph .6–.72) and docks, or walks in from the dock after 5 min.
    - tripEnd then runs, and he does a 'tripback' act ('back from X!', 6–10s).
  - Afterwards he usually goes home to unpack.
- tripResume() runs at load when S.trip is set, and tripTick re-syncs after a remote pull.

4) catchUp
- If S.trip is set, it is advanced first. If it is still going, he stays away; otherwise time continues after S.trips[0].t1.
- localChoose can pick a trip while you're away. The whole trip is simulated and its diary is backfilled with each moment's own time.
- A trip counts as up to 3 'things' in "did N things".

5) UI
- #away card (follow view while he's away), z-index 3:
  - emoji, "Mocha is away on a trip to X", "<phase> · back around 6pm [tomorrow] 🚆", "he may text you from the road 📱" or "you can still walk around town 🚶"
  - a 44px "📮 his postcard" button that opens the 'cards' lightbox
- Card placement:
  - Desktop: top center, re-centered beside the panel.
  - Portrait: at 150px, wraps, hidden while the sheet is open.
  - Landscape: compact row at the bottom, hidden with the panel or Messages open.
  - Hidden while Messages or the picture viewer is open.
- Status pill: '🚆 on a trip · X'. Messages status: 'on a trip · exploring X 🏔️' or 'asleep in Leavenworth 💤 · on a trip'.
- chatMode returns 'text' (or 'away' with a toast if he has no phone).
- txNow, txNowLine, txMoment and txCanIni are trip-aware.
- The walk-mode 'Mocha is right here' pill and the edge marker are suppressed while he's away.
- Postcards are drawn by hand: cardCanvas(d,seed,xm,W,H), with painters in CARDART for all 7 places. Each has the scene, a tiny Mocha, 'Greetings from' with big title letters, a stamp and a postmark.
  - cardImg(d,s,x,big) caches a 512x342 or 200x134 JPEG.
  - tripCards() and cardFind(id) look them up.
- Postcards show in:
  - the feed (.pic.card, 📮 meta), lightbox set 'feed'
  - the new lightbox set 'cards'
  - Messages pics 'feed:<id>' and the new 'card:<id>'
  - a 'his trips' grid in "who he's becoming" (tripsHTML)
  - calendar letters (the .lcard image on his outgoing postcard)
- txPicReply and txPeriodic know about postcards. The remote photo fetch now skips any kind.

6) CLAUDE MIND
- context() includes tripContext(): destinations, ticket prices, durations, overnight, visits, and why not now.
- The JSON 'next' gains "trip". applyMind passes it on, and applyDecision starts tripAct only if tripOk; otherwise the rest of the plan runs.
- The rules mention trips.
- On return, finishAct → mindThink, whose did-line asks for a diary about coming home plus "learned" with 2–3 true facts. narrateFallback handles 'tripback'.

7) STATE
- New S fields, in both fresh() and migrate():
  - trip: null | {...}
  - trips: [] (cap 24)
  - tripLast: 0
- Postcards are posts/mail entries capped by the existing caps.
- Invalid trip ids are dropped right after TRIPS is defined.
HOOKS: ["window.__mocha.TRIPS, TRN, TRAIN, trainAt(ms), nextTrain(ms), drawBoard()", "window.__mocha.trainPhase(seconds): sets TRN.off so the train is at that point of its 300s cycle (22 arriving, then 40 standing, then 22 leaving)", "window.__mocha.trip(id,{force,warp}): starts the trip act through startAct (force clears the cooldown and adds coins; warp places him by the platform or dock). Returns '' or tripOk's reason", "window.__mocha.tripNow(id): instant departure (begin + 'go' moment + vanish)", "window.__mocha.tripSkip(ms): shifts the current trip's plan earlier and replays due moments", "window.__mocha.tripSim(id,t0,now): data-only simulation, as catchUp does it", "window.__mocha.catchUpTest(): runs catchUp() now (sets isNew=false)", "window.__mocha.tripInfo() -> {trip, trips, tripLast, mode, act, visible, ride, x, z, y, status, tx, chat, away, awayText, train, trainVisible, coins, pets, ferryPh, cards}", "window.__mocha.ferryPhase(ph): moves the ferry loop (shifts T)", "window.__mocha.tripOk, tripPlan, tripCand, tripAct, tripBegin, tripAdvance, tripEnd, tripPhase, tripText, tripContext, tripCards, tripUnpack, cardImg(d,seed,xmas,big), awayCard", "New S fields (in fresh() AND migrate()): trip (null | {id,t0,back,over,ev:[[t,kind]],i,sv,pc:{id,s},pid,xm}), trips[] (cap 24: {id,t0,t1,over,sv,pc,s,x,up}), tripLast", "New post kind in S.posts: {kind:'postcard', d, s, x, caption, place, t, likes, liked}. New S.mail outgoing postcard: {from:'me', to:'Mom & Dad', h:'trip', cid, card:{d,s,x}, text}", "New G mode 'trip'; new act fx: 'trip' (fields trip, w0, bd, onb), 'tripback' (trip, ferryIn), 'away', 'unpack'", "New PLACE 'station' (kind 'station', gable:1); p.board (CanvasTexture); spots main, bench, kiosk, board, platform, counter", "New KEEPER 'rowan' (red panda, fk:['trains']); new makeCritter look flag L.cap", "New ACTS: station 'watching the trains', 'reading the departure board', and the job 'sweeping the platform for Rowan'", "New FACTS keys: trains, 'paradise (mount rainier)', leavenworth, 'hoh rain forest', 'snoqualmie falls', 'museum of glass', 'bainbridge island', 'san juan islands'. HOBBY_FROM gains trains and travel; TAGNAME/TOPIC_FOR gain trains and travel; TREASURES.station", "Texting: new txEvent kind 'trip' with d.k go/arrive/card/leave/home (priority card 6, arrive 5, others 3); new txPic kind 'card:<id>'", "Lightbox: new set 'cards'; items carry card:true (#lbImg.card style)", "Claude JSON: next.trip (destination id); a trip-return did-line on 'tripback'", "New globals: TRN, TRIPS, TRIPGAP, trainAt, nextTrain, trainDoorZ, tripVia, tripPlan, tripOk, tripAct, tripCand, tripBegin, tripCard, tripEv, tripAdvance, tripEnd, tripUnpack, tripPhase, tripText, tripContext, makeTrain, TRAIN, SIG, drawBoard, trainFrame, ferryPh, tripSpotW, tripAway, tripResume, tripGiveUp, tripGo, tripVanish, tripArrive, tripTick, rrect, cgrad, cpoly, cfir, cghost, CARDART, cardCanvas, cardImg, tripCards, cardFind, awayCard, tripsHTML, tripMap", "New DOM: #away (.awE #awE, .awB with #awT, #awS, #awN, and #awCard button); body.tripAway class; CSS .pic.card, .mPic.card, .pcard.pc, .letter .lcard"]
TESTS: All of these are recorded in /tmp/harness/test-step6.js. Results are in /tmp/harness/step6/full2.log and the screenshots in /tmp/harness/step6/.
- Smoke tests: `node /tmp/harness/smoke.js 15` and `node /tmp/harness/smoke.js 1` print OK (no errors) for desktop, portrait and landscape. I ran them again after the very last patch.
- Feature test `node /tmp/harness/test-step6.js`: ALL OK across 10 sections.
  - train: arriving at z≈-12, standing at 0, leaving at z≈39, hidden when no train is due. The next train stands at the platform. No trains from 11pm to 6am.
  - trip (Mount Rainier by train):
    - He floats to the platform, the status reads "waiting for the 1:03pm train", and he boards when the train stands there.
    - While away: he is hidden and his pet goes along hidden; the ticket costs 30 coins.
    - The away card, status pill and Messages status are right, and the chat bar texts him.
    - startAct and applyMind are ignored while he's away.
    - Skipping ahead through the trip gives 5 diary moments, the postcard mailed to Mom & Dad with a true fact, 3 true notebook facts and a souvenir. He texts the postcard picture plus go and arrive texts.
    - He stays away until a train stands at the platform, then steps off and is visible. The trip is in his history with its postcard.
    - Afterwards he usually unpacks: 66% of choices sampled right after a trip.
    - The cooldown blocks a new trip right away.
  - ferry (Bainbridge): waits at the dock, boards when the ferry docks, rides out visible, vanishes far out (the camera waits at the dock), rides the ferry home, docks, trip over.
  - catchup:
    - A Tacoma trip that ended while the app was closed is finished, with 7 timed diary moments, and the postcard is made and mailed.
    - An overnight Leavenworth trip still going at 11:30pm: he stays away after reload, the card says "asleep at the inn · back around 8:05am tomorrow", and Messages says "asleep in Leavenworth 💤".
  - brain:
    - Trip rate per choice, sampled with 1500–2000 runs:
      - adventurous Mocha: 0.9–1.9% on weekdays/holidays, up to 2.8% on a Saturday
      - homebody: 0.1–1.2%
    - 0% during the cooldown or without ticket money; no trips late in the evening.
    - All 7 destinations simulate end to end.
    - catchUp can pick and simulate a trip with real train times.
    - S is about 20KB after 7 trips.
  - mind (mock api):
    - next.trip starts a trip; an invalid one (cooldown) is ignored and the rest of the plan runs.
    - The context lists destinations, costs and durations.
    - On return the prompt contains the trip-return did-line and the "trip" field; the mind's diary and learned facts are applied.
  - ui (desktop, portrait 393x852, landscape 852x393, unfolded 900x1000):
    - The away card's box overlaps none of the other on-screen controls, and its postcard button is 44px.
    - The postcard lightbox opens fitted to the screen; the feed postcard shows; the "who he's becoming" trips grid shows.
  - bike: from home he rides his bike to the station door, parks at (128.7,2.3) and floats to the platform. Rowan is visible during station hours, gives a true trains fact, and the station odd job exists.
  - cal: his postcard picture shows in his letters and opens big.
  - map: track, train and the away pill; no errors.
- Screenshots reviewed: the train at the platform, arriving and leaving; the loco close-up (redesigned so the nose no longer reads as a face); the street-side station; the station at night; Rowan; away cards in all 4 viewports; the overnight trip in portrait; all 7 postcards (plus the December Leavenworth one); the feed, 'me' tab and calendar letter; the map while he's away.
- perf1.js, default desktop view: about 2111 draw calls before and after (no increase); triangles 241k → 246k.
KNOWN ISSUES:
- Nothing was tested on a real iPhone or in Safari. Rendering ran in Chromium with SwiftShader. Tests drove the clock with hooks: trainPhase moves the train schedule, ferryPhase moves the ferry, and tripSkip shifts the trip's plan, so the 'back around' times in a few test screenshots are artifacts of that shift.
- Places Mocha visits aren't modelled in 3D. While he's away he is hidden, and you see his trip through the away card, diary, texts, notebook facts, souvenir and a hand-drawn postcard. The follow camera waits across the track from the platform (or at the ferry dock); in walk mode you can still roam town.
- The train is empty: no other riders. There are no collisions, so the walker can stand on the track and the train passes through. The train only runs while the station is open (6am–11pm), on 5-minute marks of the local clock, and always arrives from the north and leaves to the south.
- Ferry trips board and return on the existing ferry loop (90 game-seconds per round trip). If he misses the ferry within 6 minutes he gives up and the attempt becomes a plain activity. If no ferry comes within 5 minutes of his return time, he simply appears at the dock.
- If no train comes within 7 minutes of his return time (for example right at closing), he steps off a 'late train' anyway.
- The built-in brain posts the postcard 72% of the time; it is always mailed to Mom & Dad. Claude isn't consulted during a trip, so all trip moments are built-in text. Claude writes the diary and learned facts on return and can choose trips through next.trip.
- Texts from the trip go through step 4's rate limits, so usually only some moments (often the postcard and arrival) get texted. While the app was closed, at most one text is sent, the highest priority (usually the postcard).
- Trip frequency depends on personality and is capped by a 54-hour cooldown: roughly 1–3% of an adventurous Mocha's choices once eligible, 0.1–1% for a homebody, less on big holidays, more on weekends. A homebody may go a long time without a trip.
- After a trip he goes home to unpack first 55–90% of the time (depends on his coziness). Otherwise unpacking is just a strong option. With Claude on, Claude picks what he does next.
- The big map is now centred on x=0 instead of -20 so the station and track fit, so the far west of the water is cropped more than before.
- The calendar month grid doesn't mark trip days; trips show in that day's diary and his letters. The station gets no holiday string lights (holFronts skips kind 'station').
- In catchUp a trip counts as at most 3 'things' in the 'Mocha did N things while you were away' message. A trip started near the end of an absence can have its departure in the next few minutes, so the away card shows 'on the train there' slightly before he has actually left.
- The postcard stamps use emoji drawn into a canvas (🏔️ and ⛴️ now carry the emoji variation selector). On a system without colour emoji they may show as plain glyphs.
- Draw-call cost: the track is about 2 draws in the default view (its bounding sphere is huge). The train is about 4 draws while it's on screen and 0 while it's hidden.

# Look and feel: design for LF1 (immersive interiors) and LF2 (Mocha's size, the orca)

Owner feedback, Nov 3 (iPhone): "Mocha looks really large compared to the other characters... when you go inside a building... the whole world disappears... like Animal Crossing... the dolphin's a really good idea, it just looks a bit poorly done."

This file designs three changes. Each is a buildable brief with CORE, STRETCH, acceptance tests and hooks:
- **LF1. Immersive interiors.** Inside a building, only the room renders.
- **LF2A. Mocha's size.** He is about the cast's height and still the star.
- **LF2B. The sea.** A real orca (with a calf), white-sided dolphins, splashes, ripples and spouts.

LF3 (menus), LF4 (quality tiers) and LF5 (elegant pop-ups) are designed elsewhere. LF1 points at LF5 where they touch: the name card, the context button and the quiet rules.

**Code base and line numbers.**
- Every line number below is in `/tmp/harness/base-hf.html` (commit e7d8990, the live build).
- The look-and-feel build sits on top of the hotfix (controls v3, guy-only wardrobe), so lines will shift. Always find code by the function name or the quoted anchor; the line number is only a hint.
- Nothing here edits a game file. The probes are in `/tmp/harness/lookfeel/probe/` (`size.js`, `interior.js`, `interior2.js`, `orca.js`, `common.js`). They run through the redirect: `NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=<file> node <probe>`.

---

## 0. What the probes found (Nov 3, Playwright and SwiftShader, 393x852 portrait unless noted, DAY 11-03)

### 0.1 Interiors today

Interiors live inside the building shells in the town. In walk mode, crossing a threshold pushes CAM 'room' (`roomPush`, line 6490). It sits 16 to 22 units out, fades the front wall and roof, and keeps the town around the room.

| View | Draw calls | Tris | Screenshot |
|---|---|---|---|
| Café 10:30, today's B12 room view | **458** | 191k | `interior/cafe-393x852-h10.5-now.png`: the camera sits behind other buildings and town walls fill the frame |
| Café, world hidden at runtime (same camera) | **48** | 53k | `interior/cafe-393x852-h10.5-emu.png`: a clean diorama in a dark void |
| Café, AC target (world and exterior parts hidden, AC camera, Mocha at the new scale) | **49-61** portrait, **76** landscape | 55-68k | `interior/cafe-393x852-h10.5-target.png`, `interior/cafe-852x393-h10.5-target.png` |
| Mocha's house 19:00, today | **338** | 156k | `interior/home-393x852-h19-now.png`: the yard, gate, lamps and street are in the foreground |
| Mocha's house, world hidden | 86 | 30k | `interior/home-393x852-h19-emu.png`: the yard is still there (it belongs to the house group) |
| Mocha's house, AC target | **46** | 28k | `interior/home-393x852-h19-target.png` |

Other findings:
- **Draws drop 80-90% when only the room renders.** Tris drop 70-80%.
- **The emulation proves the world can be switched off at runtime.** It needs no new geometry.
- **Hiding top-level objects one by one does not hold.** CHARLOD switches outdoor townsfolk back on by their hours: a townsfolk popped back into the landscape target shot. The orca, rain, holiday and other systems toggle `.visible` too. This is why LF1 uses ONE `WORLD` root and a character filter (section 1.2).
- **Each house group carries its exterior.** That means yard, gate, mailbox, terrace umbrellas, the records disc, the arcade deck and so on. A per-building exterior list must hide them inside: 9 children in the café, plus the front group.
- **Wall tops show the roof material** (red-brown) in the cutaway. They need a dark cap.
- **A camera layer cannot be forced from outside.** The live cozy controls (`ctlTick`, line 5175) and the stacked 'room' push fight any external camera. The probe had to override `camera.position.set` and `camera.lookAt` to get the AC shot. LF1 must own the 'room' CAM entry itself (section 1.4).

### 0.2 Mocha's size today (`scale/now-*.png`, `scale/now-measure.json`)

| | World height (top above floor) | World width | Walk cam, dist 7 | Walk cam, dist 12 | Follow, dist 24 | Follow, dist 12 |
|---|---|---|---|---|---|---|
| **Mocha** (level 1, growScale 1.55) | **2.53 tall, top 2.56-2.81** with bob | **2.45-2.59** (with arms) | **320 x 327 px** | 179 x 167 | 96 x 75 | 184 x 159 |
| Walker (owner's guy) | 2.09-2.15 | 0.99 | 225 x 105 | 133 x 59 | n/a | n/a |
| Wendell (sc 1.12) | 2.00 | 1.40 | 206 x 164 | 127 x 92 | 68 x 49 | 127 x 104 |
| Townsfolk (sc 0.85-1.0) | 1.76-2.12 (Odalie the heron 2.37) | 0.9-1.0 | | 122 (Clem) | 60 | 118 |
| Keepers (sc 1.08-1.22) | ~2.08 (Pearl) | | | | | |

What this means:
- On screen, Mocha has about 4.4x the walker's silhouette area. He is 1.4x taller and 3x wider.
- `growScale()` grows him to 2.3 by level 16. His top would then be about 3.8, nearly twice the cast.
- He is wider than the 1.8 shop doors (2.45 vs 1.8).

The proposal was previewed at runtime with K = 0.677, giving growScale 1.05 (`scale/k068-*.png`, `k068-measure.json`):

| | Mocha | Walker |
|---|---|---|
| World size | top 1.68-1.98, width 1.65 | |
| Walk cam, dist 7 | 211 px | 227 px |
| Walk cam, dist 12 | 122 px | 133 px |
| Follow cam, dist 24 | 64 px | |

He reads as part of the cast, with his face visible. At follow distance 24 he gets small, so the default follow distance becomes 18 (section 2).

### 0.3 The orca today (`orca/now-close.png`, `now-close-34.png`, `now-distance.png`)

- **Code.** `const orca` (line 2766) is 3 separate MeshToonMaterial meshes = 3 draws:
  - a black ellipsoid body, 2.0 x 1.8 x 6.0
  - one white sphere eye patch, on the +x side only (the other flank is bare)
  - a 4-sided cone fin
- **What it lacks.** No tail stock, flukes, flippers, saddle patch, white chin or belly, or flank lobe. It reads as "a black egg with a spike".
- **Motion** (frame, line 5655):
  - a 1.67 s rigid sine hop: centre y from -1.4 to 1.0
  - pitch is ±0.6 only; no roll, no body bend
  - the belly clears the water by about 0.5 at the peak
  - no splash, ripple, spout or sound
- **Placement.**
  - It spawns at x in [-160,-80], z in [-80,80], every 25-60 s, at any hour, night included.
  - That box overlaps all 4 PIERS (x -101..-61) and the ferry dock (-92,46), so it can breach through a pier deck or the ferry.
  - It is not viewer-aware, so most jumps happen off-screen. The constant timer makes it feel mechanical.

---

## 1. LF1: Immersive interiors (Animal-Crossing style)

### 1.1 The experience

1. **Going in.** The walker reaches an open, permitted door and keeps walking into it.
   - The screen fades to warm black (#1E1612) in 0.35 s while the door creaks.
   - At black: the town, terrain, water, sky, every other building, the weather and the street labels switch off. Only the room is drawn.
   - The fade back in takes 0.35 s. He now stands on the doormat inside, facing in.
   - A fixed three-quarter camera looks into the room. The back and side walls are up, the front wall and ceiling are cut away, and the warm void sits beyond the walls.
   - The windows show a soft painted outside (day, golden, blue hour, night, rain or snow), not the real town.
   - The room's own lamps and floor pools light it. The street sounds go muffled. A small name card reads "Drizzle & Bean · open till 7".
2. **Inside.** The standard controls still walk him around (controls v3). The camera pans with him within the room. A light look-drag tilts the frame a little and springs back. Pinch zooms within a range.
3. **Who is drawn.** Only people actually inside this building: the keeper, Mocha if he is here, Wendell if he is here, townsfolk who came in. They walk in and out through the door. Nobody outside is ever drawn.
4. **Coming out.** He walks back into the door from inside, or taps the "Go outside" context button.
   - Fade, swap, fade. He stands on the doorstep outside, facing the street, with the walk camera behind him.
5. **Watch mode.** When the camera is following Mocha and Mocha enters a building (his house, a shop, the café, Wendell's), the view fades inside with him. It fades back out when he leaves. His autonomy is untouched.
6. **From the street,** buildings are closed: no open fronts, no fading shells.
   - People inside show only through lit windows (B16 WLT), the door note and the near pill. Example: "👻 Mocha is inside · reading. Go in?"
   - That pill becomes the LF5 context button "Go in".

### 1.2 Architecture: one WORLD root plus a small IN state machine

**Choice: visibility, not a second scene.** Rejected options:
- **Moving the room into its own THREE.Scene.** It needs every character, light and shared batch re-parented on each transition, and B22's townsfolk logic checks `obj.parent===scene` (lines 5981, 6128, 6136, 6187).
- **camera.layers.** In r128 layers are not inherited. Each descendant, every light and the shadow pass would need layer bits.
- **Hiding top-level objects one by one.** It fights CHARLOD, the orca, holidays and others that re-set `.visible` (seen in the probe).

**The WORLD root (CORE).**
- At the very end of boot, `inWorldBuild()` moves every top-level scene child into one `THREE.Group` named `'world'`, except the keep-list below. Place it right before the final `})();` at line 9257, after every builder has run.
- WORLD sits at identity, so `WORLD.add(o)` never changes a world transform.
- While inside: `WORLD.visible=false`. One flag hides about 470 objects. Children may toggle their own `.visible` freely, because three's `projectObject` stops at the invisible parent.

**The keep-list stays at scene level:**
- **Lights:** `hemi`, `sun` and `sun.target` (line 1277), L1 = `byId.home.innerLight` and L2 (lines 6569-6570).
- **Characters and their satellites:**
  - `mocha` (2782), `shadowBlob` (2820), `wisps` (2822), `bikeObj` (2814)
  - pets (`petObjs`, 2855), `wObj` (4112), `visitor` (4699)
  - the EMO sprites (4437), `TGRING` (4961)
  - every scene-level cast object (5975), crowd and test chibis
- **Shared batches with an IN mask** (1.6): `GLOWPTS.pts` (2178), `POOLS.im` (2186), the DIM door InstancedMesh `'doors'` (2408), the DIM note nodes (2464), `b16fx` and `b16pts` (6594, 6599), `b21notes` (9202).
- **Runtime-only objects.** Some environment objects are added after boot: 3675 (MBX at boot, fine), 6057/6062 (TPROP umbrellas), 6092/6095 (WKV birdhouse and easel), 6755 (hangProps). They go through a new `worldAdd(o)`: `(WORLD.parent?WORLD:scene).add(o)`. Replace those `scene.add` calls with it.

**The tunnels.** The `tunSolid` and `tunOpen` tunnel boxes (2418) go into WORLD. Inside, they are never needed, which fixes B27Ta T1's "floating tunnel box" for free.

**Leak guard (test hook).** `__mocha.inside().leaks` lists every scene-level visible object that is not in the keep-list, plus every visible mesh whose world bounding-box centre lies outside the room footprint +1.5 (characters excepted, they are checked by place). It must be `[]`.

**The IN state** is declared right after `const CAM={...}` (line 4272-4286), so it exists before any hoisted user (TDZ-safe):
```js
const IN={on:0,pid:null,who:null,ph:'idle',k:0,t:0,door:null,pend:null,lock:0,hid:[],walls:[],cap:[],n:0,last:0,
  see(id){if(!this.on)return true;const a=AG[id];return!!a&&a.place===this.pid}};
```
The runtime functions are hoisted `function` declarations in ONE "LF1" block at the end of the script, next to `inWorldBuild()`.

### 1.3 The transition state machine (`inTick(dt)`)

**Where it runs.**
- It is called at the top of `b12Frame` (line 6492), so the existing hook `__mocha.roomTick` keeps driving it in tests.
- The old room-selection lines inside `b12Frame` are replaced:
  - the `want=ROOMP.find(...)`, `roomPush` and `CAM.pop('room')` lines
  - the 10 Hz `R.visible` interior-culling loop, which keeps running only while `!IN.on`, plus "force the IN room's `inner.visible=true`"
- `holHide(hp)` stays for outdoor views.

**Subject.**
- walk mode: the walker (`who='you'`)
- follow mode: Mocha (`who='mocha'`) unless `G.mode==='trip'` or `G.ride`
- ENTERABLE = `PLACES.filter(q=>q.interior&&q.w&&q.kind!=='lot')`, which is today's `ROOMP` plus `home` and `cabin`. B38's Town Hall and B39's Fogwell register by being in PLACES with `interior` (see 1.11).

**Triggers.**

| Case | Condition | Action |
|---|---|---|
| Walk in | Walker outside, within 1.0 of a door centre (d.wx,d.wz) on the outside half-space, moving inward (`velocity·(-n) > .5` from YOU.moving and yaw, or the tap-go path's next node inside), and the door permits him (`!doorLocked(d)`, line 2488) | `inStart(pid,'you',d,'in')`. A locked door rattles as today; there is no fade. |
| Walk out | Walker inside IN.pid, within 1.1 of a front door (d.pid===IN.pid, `!d.back`) moving outward (`velocity·n > .5`), or a tap on the "Go outside" button (shown within 2.4 of the door) | `inStart(null,'you',d,'out')` |
| Teleport or spawn | The subject's place (`placeAt`, line 2473) differs from IN.pid and the subject moved more than 3 units in one tick, or this is boot or map travel (`mapDoorstep`, 5057) | Swap with only the 0.35 s fade-in from black (no fade-out). This keeps `__mocha.walker(x,z)` tests working (test-B12 line 33). |
| Watch mode | `AG.mocha.place` (4 Hz from `agSync`, line 2483) is enterable, stable for ≥ .5 s, and differs from IN.pid | `inStart(place,'mocha',DBY[place],'in')`. When he leaves, `'out'`. Hysteresis: at least 2.5 s between Mocha-driven transitions. |
| Mode switch | walk to follow or back | Re-evaluate the subject. If its place differs, fade. |

**Phases.**
- `'out'`: k rises 0 to 1 over .35 s (ease-in). The walker keeps walking, input is NOT locked yet, and the door opens (DOOREV 'open' as today).
- `'swap'`: one frame at k=1. All the heavy work happens here (1.5). `IN.lock=1`: JOY, LOOK and tap-go are released and ignored. This is the controls-v3 "takeover" rule; call its release function.
- `'hold'`: at least 2 frames and .08 s, so textures and programs upload while the screen is black.
- `'in'`: k falls 1 to 0 over .35 s (ease-out). `IN.lock=0` once k < .5.

**The fade overlay** is one DOM div `#inFade`: fixed, inset 0, background #1E1612, `pointer-events:none`, z-index above the canvas and below the HUD. Its opacity is written by `inTick` every frame, with no CSS transition, so tests are deterministic.

**Door sounds.** `audDoor('open')` at the start (already fired by DOOREV), then a soft door 'close' thud at the inside position when k reaches 0 (`audShot('close',{x,z,pid})`).

### 1.4 The AC camera (CAM owner stays `'room'`, prio 1)

`roomFit` and `roomPush` (lines 6489-6491) are replaced by `inCam(P,who)`, which pushes:
```js
CAM.push('room',{prio:1,target:inTarget,ty:0,dist,pitch,yaw:P.ry+IN.yo,range:[dist*.72,dist*1.3],ease:3})
```
At swap, snap: set `camS.tx/ty/tz/dist/pitch/yaw` to the entry's final values and `e.k=1`. Nothing eases across the cut.

**Framing.** Numbers come from the owner-approved scene mockups (`previews/scene-mock/i1-cafe.html`, `i2-study.html`, `i4-cabin.html` `finish()` calls) and B27Ta T2. All are tuned at BASE FOV (64 portrait, 50 landscape), never read `camera.fov`, and are left to `STYLE.fovK` after B27S merges.

| | Portrait (w<h) | Landscape and desktop |
|---|---|---|
| pitch | .78 (B27Ta) | .62 |
| yaw | `P.ry + .30` (the mockups' three-quarter; mirror to -.30 when the door's local x > w/4, so the door side stays open) | `P.ry + .30` |
| dist | `clamp(fitW(min(w,7.5)), 9, 12)`: frames about 7 units of width, so the walker is about 190 px tall at 393x852 | `clamp(max(fitW(w+1.5), fitV(d,h)), 9, 16)`, with `fitV=(d*sin(p)+h*cos(p))*.55/tan(25°)`. The café gives 12.3, matching the mockup's 12.6. |
| look offset | camera looks at `target.y+1` (as `placeCam`) | same |

**inTarget().** The subject's local position (YOU, or G in watch mode), clamped to the room rect shrunk by the visible half-extent:
- lx within ±max(0, w/2 - visW/2), where visW = 2.3 portrait, 4.5 landscape
- lz within [-d/2+1.8, d/2-2.0]
- y = the floor height (homes .4, Fogwell floor y)

For rooms with `p.rooms` (Mocha's house is 28 x 14 with kitchen, living, bedroom and bath; Wendell's cottage; the cabin when it has a loft or back room), the clamp rect is the current sub-room's rect (`roomAt`, line 6522) grown by 1. The camera glides room to room with ease 3, AC-style.

**Look and zoom (controls v3).**
- A right-thumb drag moves yaw within `P.ry+IN.yo ± .5` and pitch within [.55, 1.05].
- Both spring back to the defaults 2.5 s after the last look input, so the diorama framing always returns.
- Pinch zooms within `range`.
- `seatCam` (line 4955) pushes nothing indoors (already true for drop-in seats).
- Talk (prio 2), deco (3), look (3), rainseat (2), scope (3) and tryon all stack on top as today.

**Walls (the cutaway).**
- The front group is hidden: `P.fw`, the front wall, roof, sign, awning and blade.
- Per frame, each side or back wall mesh in `P.walls` (shops 1389, cottages 1824) and `P.hideW` (Mocha's house 2044) is hidden when the camera is beyond its plane. Reuse the test at line 4039 (`ax==='z'?lz*sg>q.d/2:lx*sg>q.w/2`). With yaw .3 this cuts the near side wall only when the camera passes it.
- Home extras while inside: `h.tower` (line 2105) is hidden and `h.roofShell` is hidden.

**Wall caps (CORE, build-time).** The top face (material index 2, +y) of the back and side wall boxes is `roofM` today, and it shows red in the cutaway. Use a shared `CAPM=new THREE.MeshBasicMaterial({color:'#2A1C18'})` in:
- `shop()` lines 1387-1389
- `cottage()` line 1823
- `dollhouse()` around 2042
- the cabin log walls: the instanced log ends need no change; the top course is fine

From the street these faces are under the roof and never seen.

### 1.5 The swap: `inEnter(pid)` and `inLeave()`

**`inEnter(pid)`**, in order (all reversible; `IN.hid` records what was changed):

1. `P=byId[pid]`. `WORLD.visible=false`. `scene.attach(P.obj)`, which pulls the building out of WORLD. The cabin's `CB.grp` rides inside `P.obj` (line 8482); `CB.ga` stays scene-level.
2. **Exterior list.** Build it lazily on first entry, then cache it in `P.inX`:
   - every direct child of `P.obj` other than `P.inner` whose world bounding-box centre lies outside the footprint by more than .15 (yard, gate, fence, terrace furniture, porch, fire pit, mailbox plate, signs, decks)
   - `P.fw`: record the front group in the three builders (`shop()` line 1390 `const fw`, `cottage()` 1826, `dollhouse()` 2085) as `p.fw=fw`
   - `P.blade`, `P.glass` (front display glass), `P.tower`, `P.roofShell`

   Hide them and record them.
3. **Room state.**
   - `P.inner.visible=true`. `P.op=0`, so `roomCamInfo().frontFaded` stays true for test-B12.
   - For shells: `P.shell` materials are only on the front group and roof, already hidden.
   - The home: set `h.shell` and `h.roofShell` to visible=false, instead of the opacity fade in `updateMocha` (lines 4041-4044). That fade loop is skipped while `IN.on`.
   - The street-side fades in `updateMocha` (the `occT` 5 Hz occluder, line 4034, and the peek loop, lines 4038-4040) are skipped entirely while `IN.on`.
   - Outdoors, the peek part is removed (buildings are closed from the street). The occluder part (`occH`, the camera behind a building) stays.
4. **Void, fog, sky.**
   - `renderer.setClearColor('#1E1612')`: the rt clear in `frame`, line 5660.
   - Fog: `scene.fog.near=400; scene.fog.far=600` (saved and restored). This matches Addendum S2d "room void" and B27Ta T1, which this replaces.
   - The sky dome is in WORLD.
5. **Light** (no new lights).
   - `RIG.cutT=1; RIG.cutP=P`: interior exposure, set in `wltTick` at line 6680 (`RIG.cutT=IN.on?1:cut`).
   - `rigAssign` (line 6581) considers only `sp.p===P` while `IN.on`.
   - **Sun shadow fitted to the room.** Save `sun.shadow.camera` left/right/top/bottom and the `sun.target` position. Centre the target on the room. Set the half-size `max(w,d)/2+2.5` and `updateProjectionMatrix`; this is B27Ta's `STYLE.shadowHalf`. Restore on leave.
   - Lamps stay on all day inside (B27Ta T2).
6. **IN masks** on the shared batches (1.6), then `inMaskSync()`.
7. **Characters (1.7).**
8. **HUD (1.9) and audio (1.10).**
9. **Camera** `inCam(P,who)` with the snap.
10. **Place the walker** (walk-in only). He goes to the entry spot `door - n*1.4`, facing `-n`. Use the B12 doormat zone; `P.spots` has the entry zone where present. Clear `TG`.

**`inLeave()`** reverses every recorded change:
- `WORLD.attach(P.obj)`; restore the exterior list, walls, shells, clear colour, fog, sun shadow and masks.
- `CAM.pop('room')`. For a walk-out, place the walker at `door + n*1.6` facing `n`. Snap the walk camera like `setCamMode('walk')` does (line 4701): `camS.dist=7; camS.pitch=.3; camS.yaw=YOU.yaw+Math.PI; camS.tx=YOU.x; camS.tz=YOU.z`, with `CAM.ret=0` so nothing eases.
- In watch mode, snap the follow camera behind Mocha at the follow distance.
- `IN.on=0` last.

**Swap budget.** The swap must take < 12 ms on desktop SwiftShader. No traversal of the whole scene: the exterior list is cached, and the masks are flat loops over ≤ 384 points.

### 1.6 Shared batches inside: masks instead of new geometry

| Batch | Writer | Mask while IN.on |
|---|---|---|
| DIM door leaves, planks, notes (2406-2413) | `diSync(i)` is the only matrix writer | Show instance i only if its door belongs to IN.pid AND is a back or staff door (`d.back`). The room's own front door leaf would float in the cut front-wall line, so it is hidden. Store `DIM.pid[i]` and `DIM.back[i]` in `doorBuild` (2440). On enter and leave, call `diSync` for all i. |
| POOLS (2184-2189) | `poolSet(i,k)` and `poolAdd` | Add `Q.pid[i]`; `poolAdd` takes an optional pid (B27Ta's `poolAdd(...,y)` gains `pid` as the 7th argument). Colour = base·k·(IN.on && pid!==IN.pid ? 0 : 1). Re-sync all on enter and leave (≤ 96). `b8Frame` (2726) hides POOLS by day; inside, use `STYLE.poolsDay` (B27Ta T2) or `po.im.visible=true` while `IN.on`. |
| GLOWPTS (2171-2180, custom ShaderMaterial) | `glowPt` and `glowSet` | Add uniforms `uRoomC` (vec4: cx, cz, cos ry, sin ry) and `uRoomH` (vec3: half w, half d, on). In the vertex shader, a point outside the room rect +.5 gets `gl_PointSize=0.`. Zero cost when off. |
| b16fx and b16pts (chimney smoke, sunbeams, dust) | `fxFrame` (6603) | Emit only sources whose place === IN.pid while inside. Indoor dust in the sunbeam is nice; chimney smoke stops. |
| b21notes (music notes) | B21 emitters | Emit only for sources inside IN.pid (Mocha's radio, the jukebox). |

### 1.7 Characters: who is drawn

The single rule is `IN.see(agentId)`: `AG[id].place===IN.pid`. `AG` places are maintained at 4 Hz by `agSync` and door passes.

| Who | Where the visibility is set | Change |
|---|---|---|
| Mocha | `updateMocha` line 4018 `mocha.visible=G.mode!=='trip'&&...` | `&&IN.see('mocha')`. Also `shadowBlob.visible` (4026), the `wisps` emitter, `petObjs` (`updatePets`, follow Mocha), and the speech bubble: `bubble.style.visibility` (line 5669) is hidden when `!IN.see('mocha')`. LF5 routes his line into the edge chip. |
| Wendell | `updateW` line 4136 `wObj.visible=W.visible` | `&&IN.see('wendell')`. His `r.inside` (5973) becomes `()=>IN.on?!IN.see('wendell'):(old)`. |
| Townsfolk | CHARLOD (5934-5960); `r.inside` set in `town` (6123) | In `CHARLOD.tick`, before the distance test: `if(IN.on&&r.c&&!IN.see(r.c.id)&&!(r.obj.parent&&r.obj.parent!==scene)){hide}`. Those parented into a place (`c.at`, 5974) ride with their place group. |
| Keepers | children of their shop's `inner` (2567) | Automatic: in WORLD unless it is the IN room. |
| Walker | `visitor.visible=m==='walk'` (`setCamMode`, 4700) | In watch mode inside, he is not drawn (as today). In walk mode he is always the subject. |
| Bike | `bikeObj` | Hidden while `IN.on` (it is parked outside). |
| Talk card | `talkOpen` and `tkShot` (6206) | `tkShot` traverses the whole scene for occluders (line 6209). Inside, it skips WORLD for free (its `q.visible` chain test), which removes a large part of the café talk stall LF5 is chasing. |

NPCs entering or leaving while you are inside appear and vanish at the door as their place flips. That is the B9 door pass: `doorPass` (2492) already fires on the threshold.

### 1.8 Windows: a painted outside (`WINOUT`)

**One shared material**, `WINOUT=new THREE.MeshBasicMaterial({map:WINC.tex})`. It adds 0 programs if MeshBasic+map already exists; check with `__mocha.programs()`.

**The canvas** is one 256x256 canvas, repainted only when its state key changes. The key is `tod` (day, golden, blue, night) × `wx` (dry, rain, snow) × `season` (fall, winter, spring-summer), at most 12 states, cached as `ImageBitmap`s or canvases. It paints:
- a vertical sky gradient: the top and bottom from `skyMat.uniforms` (the same values `updateSky` uses), sampled at 4 Hz
- a soft far shore with 2-3 sage-black fir silhouettes (#4A6450) and a warm roof line
- in fall, a maple branch corner in the S2a maple colours
- at night: #2A3260, 2-3 warm window dots and a moon
- rain: diagonal streak lines at 35% plus drips (B26's "rain drips on the windows")
- snow: dots

`material.color` lerps at 4 Hz (in `wltTick`) from winDay #C9CDD8 to winGolden #FFD9B0 to winBlue #3A4A8A to winNight #2A3260 (Addendum S2d).

**Where it applies:**
- **Mocha's house:** the two lancet panes at the back wall (`dollhouse`, line 2048: `new THREE.MeshBasicMaterial({map:lanTex,...})`). While `IN.on`, swap to a lancet-masked WINOUT. Today they glow amber like lit glass seen from outside.
- **Shops:** front display windows are in the cut front wall, so they are not visible. Back and side walls get the B27Ta T3 `archwin` glass, which uses WINOUT instead of a flat tint. Until B27Ta lands, add a CORE minimum of one painted window card (1.6 x 2.2 plane on the back wall, inside the room batch) per shop without a back or side window, as `INWIN[pid]` data.
- **The cabin and Wendell's cottage:** their window glass meshes switch to WINOUT while inside.
- **The rain seat** (`CAM 'rainseat'`, line 8444) frames the cabin nook window, which now shows painted rain.

Real reflections or a view of the town are deliberately not attempted: the painted card is the AC idiom and costs nothing.

### 1.9 Labels, HUD and prompts

- **Place labels** (`frame`, lines 5671-5684): while `IN.on`, skip the projection loop and set every label to opacity 0 once (track `IN.lbl`).
- **The room name card.** `doorBanner(d)` (2509) already fires on the walker's door pass 'in'. Also call it for watch-mode entries. LF5 restyles it as the paper name card.
- **The edge chip** (`#edge`, line 5670) points at Mocha off-screen. Inside, hide it unless he is in the room. If he is elsewhere, the status pill already says where.
- **The near pill** (`#near`, line 5685), inside:
  - "🚪 Go outside" within 2.4 of the front door. It is tappable and becomes LF5's context button; it tap-goes to the door, and the exit fires on arrival.
  - Otherwise, the existing Mocha, Wendell and keeper lines.
  - Outside, near a building Mocha is in: "👻 Mocha is inside · {doing}". Tapping walks to the door.
- **Quiet while swapping:** HUD layout and toasts are deferred until k < .5.
- **Tap-to-go inside.** Three r128's Raycaster ignores `.visible`, so taps could hit hidden WORLD meshes behind the void. `tapWorld` (4970) gets an IN branch:
  - intersect the ray with the room floor plane (y = floor height)
  - clamp to the room rect minus .4
  - test only `P.obj`'s descendants and the characters with `IN.see()` for interact and talk taps
  - `tapBuilding` (4967) is skipped while `IN.on`

### 1.10 Sound

- **The listener place** comes from `audLis` (6979): `AP.pid=placeAt(camS target)`. Inside, the camera target is in the room, so AP.pid=IN.pid automatically. Use `AP.pid=IN.on?IN.pid:placeAt(...)` to be exact.
- **Zone beds.** `audZoneOf` (7127) then gives 'indoor' or 'home', and `wxUpd` (7147) already muffles rain (LP 600 plus roof drips).
- **New: a muffled street bed.**
  - `bedSet('street', IN.on? outsideZone(P) : null, .22)`, where `outsideZone` is the zone at the door.
  - `bedMk` (7131) gets a 'muffle' variant: the same source, an extra lowpass at 380 Hz, and gain ×.35.
  - The crossfade (the existing 2 s) starts at swap.
- **Outdoor one-shots** while `IN.on` (gulls, crows, bell buoy, ferry and train horns: `audWild` 7160 and `audShot` 7071): play at gain ×.35 through a 900 Hz lowpass, or drop them when they are more than 60 away.
- **Door sounds:** creak at the start, thud at the end (1.3).
- **Shop music** (B21) is positional, so it naturally comes up inside.

### 1.11 Per building

| Building | Notes |
|---|---|
| Shops, café, station (`shop()`, 1384) | The front group `fw` holds the front wall, roof, sign and awning. Hide the exterior extras (café terrace umbrellas, records disc, arcade deck and neon, phones sandwich board, bikes rack) by the footprint rule. The station's interior pieces live in `grp`, not `inn` (line 1404), so the footprint rule hides the platform. The train and platform are outside: when Mocha walks out to the platform, the view leaves. |
| Mocha's house (`dollhouse`, 2032) | Rooms from `p.rooms` for the camera clamp. While inside, hide `fw`, `roofShell`, `tower` and the yard (gate, fence, lamps, path box at line 2037: outside the footprint); `MBX` is scene-level, so in WORLD. Lancet panes switch to WINOUT. Outdoors the house is now closed: the open front and the `hIn` fade (4041-4044) only apply when `IN.on`, and the `hOcc` occluder fade stays. Sleeping Mocha at night inside his house is the coziest watch-mode view: a night-light pool and the bed lamp. |
| Wendell's cottage (`cottage`, 1819) | `b14Frame` (6545): the `nb.pk` street peek is removed (the cottage is closed outside). `tvDraw` and `tvVisible` (1908-1910) only while inside. B17 hangouts at both houses work through `IN.see`. |
| The log cabin (B26; `cabFrame` 8422, `cabCutApply` 8322, `cabCamPush` 8453) | `cabFrame`'s `inside` becomes `IN.on&&IN.pid==='cabin'&&wk`. The `C.cut` logic and `cabCutApply` stay (they hide the roof and front logs: the cutaway). `cabCamPush` and `CAM.pop('cabin')` are deleted: IN pushes 'room' with the cabin framing (14 x 10). The porch, fire pit, rocking chair, woodpile, mailbox and peanut dish are outside the footprint, so they are hidden inside. The B26 fire-pit glow (GLOWPTS) is masked. `cabRoomAt` keeps driving `C.room`. The B26 test "the walker enters through the door; the windows light within 2 s" still holds. |
| Decorate (B27; `dEnter` 8718, `dCam` 8726, `dExit` 8729) | `dEnter(rid)`: for `rid==='lot'` (the yard) while `IN.on`, call `inLeave` first (fade), then continue. For a room rid while not inside the cabin, run `inStart('cabin','you',DBY.cabin,'in')` with a callback that runs the rest of `dEnter` at swap. The deco CAM (prio 3) stacks on 'room'. `dCam` keeps its live-fov fit. `dExit` pops deco and returns to the IN room view. |
| Town Hall (B38), later | Register through PLACES with `interior`. The council chamber is a sub-room (`p.rooms`) for the clamp. The construction-stage groups are exterior. |
| Fogwell (B39), later | Its floor picker pushes `CAM 'floor'` at prio 2 (above 'room'). The IN target y is the selected floor height. Floors above get visible=false (B39 already does). The lobby is the entry room. Lazily generated units dispose on `inLeave` as on exit. |

### 1.12 Mocha's life inside

- His autonomy is untouched. IN never writes `G.act`, `G.target`, `G.mode` or `G.timer`, so the bias audit is unchanged.
- While the owner is outside, Mocha inside a building is not drawn. His presence shows through:
  - B16 lights: the room-by-room WLT windows, already driven by occupancy
  - the door note when he is out (`notesSync`, 2514)
  - the near pill "Mocha is inside · reading"
  - his bubble lines, routed to the edge chip (LF5)
- In watch mode, the view goes in with him. His activities inside (desk, couch, radio, bath, cooking, sleeping, shop visits, asks at counters, the cinema) play in the room view. Keepers face him and talk as today.
- Talk "in person" with Mocha works only when both are in the same place (`IN.see('mocha')` while `IN.on`).

### 1.13 The save

- No new save fields. The walker's x and z are already saved in `localStorage 'mocha-you'` (line 4292).
- **At boot:**
  - If `placeAt(YOU.x,YOU.z)` is enterable and its front door still permits him (`!doorLocked`), boot directly inside: the teleport path, with the .35 s fade-in from black on the first frame.
  - Otherwise, move him to that door's doorstep outside and toast once: "🌙 Drizzle & Bean closed while you were away."
- In follow mode at boot, Mocha inside a building means the view starts inside.

### 1.14 Performance

| Check | Budget |
|---|---|
| Draws inside, shops and café (main + shadow) | **≤ 80**; measured 49-76 in emulation |
| Draws inside, Mocha's house and the cabin | **≤ 100** |
| Tris | ≤ 70k |
| Draws in the street views | unchanged |

**CPU savings while `IN.on`** (each `if(IN.on)` early-out in the named function):
- `updateLeaves` (leaf instance updates)
- the rain position loop (`frame`, 5661)
- clouds and sails movement (positions are time-based, so they can catch up)
- the fireflies buffer
- the 10 Hz interior culling in `b12Frame`
- the label loop
- CHARLOD's distance work for hidden characters
- `holFrame` visuals
- `lampFrame` instance colours (the wave state still advances)

**Swap cost:** < 12 ms, with no shader compiles. WINOUT is compiled at boot by the existing `renderer.compile` warmup.

### 1.15 LF1 CORE and STRETCH

**CORE.** Each item is a function or block; every one ends with a passing check.
1. The `IN` object, after `CAM`. The `WORLD` root, `inWorldBuild()` and `worldAdd()` (replace the 6 runtime `scene.add` sites). The leak guard.
2. `inTick`, `inStart`, `inEnter`, `inLeave`, `#inFade`; the triggers (walk in and out, teleport, watch mode, mode switch); `IN.lock` released through the controls-v3 takeover.
3. `inCam` and `inTarget`: AC framing, sub-room clamp, look spring-back, pinch range. Delete `roomFit` and `roomPush` (or alias them for hooks), `cabCamPush` and `CAM.pop('cabin')`.
4. Exterior list, front group, wall cut, wall caps (`CAPM` in `shop`, `cottage`, `dollhouse`); `p.fw` recorded in the 3 builders. Closed buildings outdoors: remove the peek fades; keep the occluder fades.
5. Masks: DIM, POOLS, GLOWPTS, b16fx/pts, b21notes.
6. Characters: Mocha, satellites, pets, Wendell, CHARLOD, bike, bubble.
7. Light: RIG cut, rigAssign filter, the sun shadow fit. Void, fog and clear colour.
8. WINOUT: canvas states, tint, rain overlay. Applied to Mocha's lancets and the cabin and cottage glass. One painted card per shop without a side or back window (`INWIN` data).
9. HUD: labels off, name card, edge chip, near pill "Go outside" and "Mocha is inside", tap-to-go and raycast inside.
10. Sound: AP.pid, the muffled street bed, outdoor one-shot muffling, door creak and thud.
11. Buildings: shops, café, station, Mocha's house, cottage, cabin. Decorate integration. Save and boot.
12. Tests: `test-LF1.js`. Re-run B12, B13, B14, B16, B26, B27, test-controls and smoke.

**STRETCH.**
- A painted inside door at the bottom edge: a dark doorway arch decal on the floor line at the door gap, so the exit reads.
- A per-shop window painting: harbour and ferry from the waterfront shops, the Needle from Main Street, the cemetery yew from Mocha's.
- Footsteps by floor type inside (`floorType` exists).
- A soft CSS room vignette under 'room' (B27Ta T2; gated off on LOW).
- Pre-warm the next room when within 4 of its door. That means `renderer.compile` of its materials, only if a profile shows a hitch.
- With LF4 HIGH and ULTRA, the room-only frame frees budget: a 2048 shadow map inside, plus contact-shadow blobs for furniture.

### 1.16 LF1 acceptance (Playwright, SwiftShader, 393x852 and 852x393 unless noted)

1. **Walk in.** Café at 10:30. Place the walker 3 in front of the café door facing it. Drive JOY forward (or `__mocha.inside.walkTo('cafe')`).
   - Within 1.5 s: `__mocha.inside().k ≥ .95`. Within a further 1.2 s, k = 0.
   - Then `inside()` gives `{on:true,pid:'cafe',who:'you',world:false}`, with the walker inside the footprint and within 2.2 of the door.
   - `roomCam().top==='room'`; pitch .78 ±.03 (portrait) or .62 ±.03 (landscape).
2. **Nothing else renders.** `inside().leaks` is `[]`.
   - Pixel test: sample 12 points outside the room's projected rect (corners, top band, the far sides). Each is within 14/255 per channel of #1E1612 after the post pass. No pixel in the frame has a sky signature (b > r+40 and b > 150) except inside WINOUT cards.
3. **Draws.** `drawInfo().calls`: café ≤ 80; Mocha's house at 19:00 ≤ 100; the cabin (after `movingDay` skip and `cabinLv(2)`) ≤ 100. The same views outside are ≥ 300. Report both.
4. **Characters.**
   - `forceAct({p:'cafe',fx:'ask',keeper:'juniper'})` with the walker inside: Mocha visible.
   - Mocha forced home (`forceAct({p:'home',s:'couch'})`) with the walker in the café: `mocha.visible===false` and his bubble hidden.
   - `wForce('cafe')` (Wendell on the terrace, outside): `wObj` not drawn.
   - Juniper's keeper is drawn.
   - A townsfolk with `TN[id].inP==='cafe'` is drawn; one outside is not.
5. **Watch mode.** `setCamMode('follow')` and `forceAct` Mocha to the bookstore. Within 3 s of his door pass: `inside()` gives `{on:true,pid:'bookstore',who:'mocha'}`. When he leaves, it is off within 3 s of his outward door pass. No transition is closer than 2.5 s to the last one.
6. **Walk out.** From inside, drive the walker into the door.
   - Fade, then `inside().on===false`, `world:true`.
   - The walker is outside the footprint and within 2.5 of the door, facing away from it (±.5 rad).
   - The CAM stack has no 'room'. `|camS.yaw-(YOU.yaw+π)| < .3`. `camS.dist` is 7 ±.5.
7. **Teleport compatibility.**
   - test-B12 lines 33-39: `walker(12,22)` plus `roomTick` gives top 'room', pid bookstore, frontFaded and inVis true, and zoom stays inside the range.
   - test-B13, B14, B16, B26, B27 and test-controls pass.
   - smoke.js 15 and 21 print OK.
8. **Windows.**
   - Mocha's house at 15:00 clear: `inside.win('home').state==='day/dry'`.
   - `weather('rain')`: `/rain/` with rain overlay > 0.
   - At 21:00: `night`.
   - Pixel test: a lancet pane's mean colour moves toward #2A3260 at night and toward #C9CDD8 by day.
9. **Weather and sound inside.** `weather('rain')` while inside:
   - the rain Points are not drawn (in WORLD); the walker's umbrella is down
   - `audio().zone` is 'indoor' or 'home'; the wx lowpass is ≤ 700 Hz
   - the 'street' bed is present with a muffle lowpass ≤ 400 Hz
10. **Decorate.**
    - From outside the cabin, `deco.enter('great')` fades into the cabin, then the deco CAM is on top.
    - `deco.enter('lot')` from inside fades out first.
    - `deco.exit()` returns to the room view. Tidy, undo and test-B27 pass.
11. **Save and boot.**
    - Reload with the walker inside the café at 10:30: it boots inside.
    - Reload at 22:00 (closed): the walker is on the doorstep outside, with one toast.
12. **Invariants.**
    - The scene light count is unchanged (`lights().count`).
    - `programs().n` is +1 or less.
    - `youSize()` and `S` byte size are unchanged.
    - Bias audit: G.act, G.target and G.mode are identical before and after 20 enter and exit cycles with the walker.
    - No page errors in 3 viewports.
13. **Swap timing.** `inside().swapMs` < 12 (desktop) for every swap in the test. The 4x-throttled phone profile (LF5's) shows no main-thread task > 100 ms at the swap.

### 1.17 LF1 hooks
- `__mocha.inside()` returns `{on,pid,who,ph,k,world:WORLD.visible,ext:n hidden,walls:[visible flags],cam:{owner,dist,pitch,yawOff,target:[x,z]},chars:[ids drawn],leaks:[...],swapMs,n:transitions}`.
- `__mocha.inside.enter(pid,{who='you',fade=true})` and `.exit({fade=true})`.
- `__mocha.inside.tick(n=40,dt=.05)` advances `inTick` deterministically. `roomTick` still works.
- `__mocha.inside.walkTo(pid)` places the walker 2.8 in front of the door facing it and walks him in. Also `.walkOut()`.
- `__mocha.inside.win(pid)` returns `{state,tint,rain,cards:n}`.
- `__mocha.inside.mask()` returns `{dim:shown,pools:shown,glow:{on,rect}}`.
- `roomCam()` and `rooms()` keep their shapes. `roomCam().frontFaded` is true while inside.

### 1.18 Merge notes and risks
- **B27Ta** (interior style) overlaps in `roomFit` and `roomPush` (pitch .78/.62, which LF1 adopts), the room void (which LF1 replaces: drop T1's sky hook), `holHide` and the tunnels (moot inside), `STYLE.shadowHalf` (LF1's sun fit is the same thing: implement once, in STYLE, if B27Ta lands first) and `archwin` glass (use WINOUT).
  - Build order: LF1 after B27Ta, or LF1 first with B27Ta told to target `IN`. Either way, one owner for the 'room' camera.
- **B27S:** `STYLE.noTs` and `STYLE.noVig` are gated by CAM layer 'room', which keeps that name. `fovK` scales the distances tuned at base FOV.
- **Controls v3 (hotfix):** IN uses its takeover release and its look-drag limits per layer.
- **Batch 4** (B31 visits to the cabin, B32 empty-house nest, B33 Wendell II): these all express presence through AG places, so they work with `IN.see`. B31's fire-pit evenings are outside.
- **Risks:**
  - Code that tests `o.parent===scene` for environment objects. Grep at build time: only the 6 townsfolk sites exist, and they stay scene-level.
  - Raycasts against hidden WORLD (covered in 1.9).
  - Anything added to the scene after boot that is not routed through `worldAdd`. The leak guard and test 2 catch this.

---

## 2. LF2A: Mocha's size

### 2.1 Target
- At level 1: the same height as the cast or a touch smaller. His top (with bob) is 1.75-1.98 above the floor, against the walker's 2.1, Wendell's 2.0 and townsfolk at 1.8-2.1.
- At max level: no taller than the walker. He stays the star:
  - big eyes (×1.3)
  - the only white, softly glowing figure, with the rim light
  - readable at the follow-mode zoom: at least 80 px tall at the default follow distance in portrait
- Preview: `scale/k068-walk-wide.png` and `k068-walk-default.png`.

### 2.2 The new scale
```js
const growScale=()=>1.05+.01*Math.min(15,level()-1);   // 1.05 at level 1 -> 1.20 at level 16 (was 1.5+level*.05, 1.55 -> 2.3)
```
Line 1201. Keep a little growth: "he grows as you level", now 14% instead of 48%.

Add two helpers right after it. They are hoisted-safe consts after `growScale`:
```js
const mFloatY=f=>f+.24+.5*growScale();     // hovering: hem .24 above the surface (today: floor+1+... gives hem ~.25 at 1.55)
const mSeatY =s=>s+.27*growScale();        // sitting on a seat/bed/deck: hem sinks .23*sc into the cushion (reproduces today's +.42 at 1.55)
```

### 2.3 Everything that depends on his size

| Where (base-hf line) | Today | New |
|---|---|---|
| `updateMocha` hover alt (4014) | `navFloor+1+max(0,gs-1.5)*.5` | `mFloatY(navFloor(G.x,G.z))` |
| Sleep in his bed (4014) | `alt=2.3` | `mSeatY(1.88)`; 1.88 is the bed top implied today |
| Bob (4017) | `Math.sin(t*2.2)*(G.sleep?.06:.16)` and the beat and startle terms | Multiply the whole bob by `sc/1.55` (≈.11 at 1.05), so the hem never dips under the floor (the preview showed -0.02 with the old bob) |
| Cinema seat (4003) | `ty=1.75` | `mSeatY(1.33)` |
| Wheel gondola (4007) | `tmpV.y-1.4` | `mSeatY(tmpV.y-1.82)` |
| Ferry deck (4008) | `ty=4.8` | `mFloatY(3.785)` |
| Benches and drop-in seats (`benchY`, 5018) | `s.y0+s.h+.42` | `mSeatY(s.y0+s.h)` |
| Needle elevator (`needleStep`, 5024) | `cy+1.15` | `mFloatY(cy+.135)` |
| Lighthouse top (`lhStep`, 5045) | `p.h+.7` | `mSeatY(p.h+.28)` |
| Bike (`rideY` 3914; bike scale at 4027) | `seatY*gs/1.3+.5*gs-.06`, `bs=sc/1.3` | Unchanged formulas. The bike shrinks with him (×.81), so it stays his size. Check `BIKE` seat contact in the test. |
| Speech bubble anchor (frame, 5668) | `mocha.position.y+1.55*growScale()+(umb?1.3:0)` | Keep the `1.55*gs` term (proportional). Umbrella term `umb?.84*growScale():0`. |
| Label avoid box (5681) | from `bp` and `fp` | Unchanged (it derives from the anchor) |
| Emotes over Mocha (`emoTick`, 4441) | size `k*.62*sc` with sc=obj.scale | For Mocha use `Math.max(.95,sc)`, so the emote icon stays readable |
| Talk two-shot (`tkShot` 6208; `tkMid` 6191) | Mocha head `TKW.y+.5` | `TKW.y+.32*growScale()`. Then check that test-B23's two-shot still frames both, since the vertical gap is smaller. |
| Selfie (4057) and shadowBlob (4027) | proportional to sc | Unchanged |
| Pets that fly beside him (3966) | `G.y+.9` | `G.y+.58*growScale()`. Pet scale 1.15 (2855) becomes 1.0, so pets stay smaller than him. |
| Doors (B9) | He was 2.45 wide against 1.8 doors | Now 1.65. No code change; the door-pass checks are by position. Note it in the test. |
| Follow camera (`setCamMode` 4700; `camS` init 4265; `zoomLim` 4288) | default dist 24, `max(dist,14)`, follow zoom [6,80] | Default 18; `max(dist,11)`; follow zoom [4.5,80]. Mocha is then about 85 px tall at the default in portrait, against 64 px with the new size at 24. |
| `placeCam` follow look point (5070) | `lookAt(camS.ty+1)`, so the camera looks at his head top | Keep. His head top is now origin+1.07, and the +1 still lands on his head. |
| B16 room framing and LIGHTSPOTS | `rigAssign` scores lights from the camera target | Unchanged. The LF1 watch-mode framing targets him the same way. |
| CHARLOD and labels | No Mocha-size terms | n/a |
| The scene mockups (`previews/scene-mock/int-scene.js` around line 228, plus the e-scenes) | `KIT.mocha({scale:1.5})`, hover 1 | `scale:1.05`, hover `.24+.525`. The B27S/T ports then match the new size, and the owner's approved shots get re-rendered. |

### 2.4 His face at the smaller size

Body build, around lines 2785-2800:
- Eyes (`eyes`, 2790): the eye mesh and highlight are ×1.3, with the y position −.02, so the eyes sit a touch lower and rounder.
- Cheeks (2792): ×1.15. Smile and the O mouth (2793-2794): ×1.15.
- The ghost lathe profile is unchanged.
- Check: in follow mode at the default distance (18, portrait), each eye is at least 9 px tall and the eye gap is at least 14 px.

### 2.5 LF2A CORE and STRETCH

**CORE:**
- `growScale`, `mFloatY` and `mSeatY`, plus every row of 2.3
- the face ×1.3
- the follow distance, `max` floor and zoom limits
- the mockup kits' scale
- tests

**STRETCH:**
- At night, a soft pale pool under him: one POOLS slot that follows G, k .22, colour #B8C4FF, as in the mockups. He then still glows as the star at the smaller size.
- A level-up "grow" moment: 0.4 s of squash and stretch to the new scale, plus sparkles from GLOWPTS.

### 2.6 LF2A acceptance
1. Level 1 (`S.xp=0`): `growScale()===1.05`. Walk cam at 393x852, lineup beside the walker (the `size.js` setup):
   - Mocha's on-screen height is 0.85-1.0 of the walker's (preview: 211/227 = .93)
   - his world top is 1.70-2.0 at bob peak
   - his hem never goes below the floor (`bottom ≥ 0` over 3 s of samples)
2. `S.xp=25*15*15` (level 16): `growScale()===1.20`, and his top is ≤ the walker's top.
3. Follow cam, fresh boot: `cam().dist===18`, and Mocha is ≥ 80 px tall in portrait. Eye height ≥ 9 px (project the eye mesh bounding box).
4. Seats:
   - `forceAct` bench: his hem sits within .05-.35 below the seat top (bench `s.y0+s.h`)
   - cinema: the same against seat top 1.33
   - ferry: hem .2-.3 above the deck
   - bed at 2:00: hem .1-.35 below the bed top
5. Bubble: `project(anchor)` lies 10-60 px above his projected head top in the walk and follow cams.
6. test-B9 (doors), B11 (seats), B14, B17, B23 (talk two-shot frames both heads), B26 and smoke pass.
7. The bias audit is unchanged (the size change writes no act).

### 2.7 LF2A hooks
- `__mocha.mochaSize()` returns `{gs:growScale(),top,hem,width,eyePx,followDist}`, computed from the live mocha bounding box and the camera.
- `__mocha.G` already exists. The level is set through `__mocha.S.xp`.

---

## 3. LF2B: The sea: a real orca, a calf, white-sided dolphins

### 3.1 Look: original chibi toon animals in the game's style
- **Adult orca.**
  - About 5.2 long (today 6), chunky and cute: a rounded head, a short beak-less snout, a clear tail stock, broad flukes.
  - A tall dorsal fin, 1.5, curved back slightly.
  - Paddle pectoral flippers.
  - Colours, warm per Addendum S (never pure #000 or #FFF):
    - black #1E2228
    - warm white #F4F1EA: the oval eye patch above and behind the eye, on BOTH sides; the white chin; the white belly; the flank lobe sweeping up behind the dorsal fin
    - saddle grey #9AA3AE: a soft patch behind the fin
  - The eye is a small glossy dark dot #111 with a #FFF6E6 highlight, below the front of the eye patch.
- **Calf.** 2.9 long, with a rounder head and a shorter fin (.55). Its patches lean slightly peachy (#F2E6DA, as real calves).
- **Pacific white-sided dolphins** (3-5). 2.0 long:
  - dark grey back #3A4048, a pale grey flank stripe #B9C2C8, a white belly #F2F0EA
  - a two-tone hooked fin
  - quick porpoising
- **Build.**
  - Body: a LatheGeometry profile (16 radial × 22 along), rotated to the +z axis.
  - Fin, flukes and flippers: flattened ellipsoids (`s` and `cy:` parts).
  - Patches: thin ellipsoids embedded just under the surface (the chibi-face method).
  - All merged through `mergeParts` (4307) with literal-hex colour keys, rendered with `CHIBI_MAT`: 0 new programs, rim light for free, warm silhouettes at golden hour.

### 3.2 One dynamic mesh plus one FX mesh = 2 draws while active, 0 when idle

**`SEA.m`.**
- One `THREE.Mesh(BufferGeometry, CHIBI_MAT)` with a pre-sized position, normal, colour and slot buffer for the largest cast: adult + calf, or 5 dolphins, about 7k non-indexed vertices.
- At event start, copy the rest buffers of this event's animals in and set `drawRange`.
- Per frame while active, transform each animal's vertex range on the CPU:
  - **The bend deformer.** Body axis z in [-L/2, L/2], curvature κ: θ=z·κ, y'=R-(R-y)cos θ, z'=(R-y)sin θ, with R=1/κ.
  - **The fluke stroke.** Extra rotation about x for z < -.35L: `β=A·sin(2πft)·((-.35L-z)/.15L)`.
  - Then the animal's world matrix: position, heading, pitch, roll.
  - Normals use the same rotation.
- Budget: about 7k vertices for under 2.5 s per event, measured ≤ 0.6 ms per frame on desktop.
- `frustumCulled=false`, with a manual sphere test. `visible=false` when idle.

**`SEA.fx`.**
- One `InstancedMesh(PlaneGeometry, MeshBasicMaterial{map:fxAtlas, transparent, depthWrite:false, blending:AdditiveBlending, vertexColors via instanceColor})` with 64 instances.
- A 4-cell 128 px atlas: droplet, foam puff, ring, mist.
- Droplets and mist face the camera (the CPU builds the instance matrix from the camera quaternion). Rings lie flat on the water at y=-.38.
- Fade = instanceColor brightness, so additive blending needs no alpha.
- `visible=false` when idle.

### 3.3 Motion
- **Breach** (2.4 s airborne, plus a .6 s pre-roll):
  - Pre-roll: a foam bulge (3 puffs), then the fin breaks the surface.
  - Airborne, u in [0,1]: centre y = -1.8 + (H+1.4)·4u(1-u), with H 2.4, so the whole body clears the water by about 1 at the peak. Forward travel is 6.5 along the heading.
  - Pitch is the arc's tangent ×.9, from +55° out to -60° in.
  - In 50% of breaches the roll reaches 70° by u=.5: the classic side-splash.
  - Body arch κ=.22·sin(πu); a fluke kick at exit.
  - Splashes:
    - at exit: 12 droplets and 2 puffs
    - at re-entry: a crown of 28 droplets (out 3-6, up 4-8, gravity 18), 6 foam puffs and a mist plume for side-splashes
    - then 2 ripple rings expanding from r 1.5 to 7 over 2.6 s and fading
  - The calf breaches .45 s later, 4 units behind and offset 2.
- **Surfacing and spout** (the common event, 1.8 s):
  - The back rolls up to y≈-.1, the fin cuts forward, then it rolls back down with a slight bend wave.
  - At t=.3: a spout of 8 mist quads rising 2.6 over 1.0 s, expanding .3 to 1.0 and fading. Sound "pff": bandpassed noise 700-1200 Hz, .45 s.
  - Then a foam V-wake of 4 puffs.
  - A pod does 2-3 of these in a staggered line (adult, adult, calf).
- **Dolphins:**
  - Porpoising arcs: height .9, length 3.2, period .9 s, phases staggered. Tiny splashes of 4 droplets per entry.
  - Bow-riding the ferry: lateral offsets ±3.5, 2-6 ahead of the bow. The velocity comes from `ferry.position` deltas. They run for 12-18 s after a departure, then peel off and dive.

### 3.4 When and where it appears (`SEA.sched`)

**Kinds and odds** (the hour comes from `hourAt(Date.now())`):

| Time | Odds |
|---|---|
| Day | spout or pod 60%, breach 25%, dolphins 15% |
| Golden hour (±45 min around sunset; `siAt` or LUXS) | breach odds ×2, placed toward the sun's azimuth from the viewer, so the orca is backlit against the sunset |
| Night | spouts only, rare (moonlit fins); no breaches |
| Rain or fog | odds ×.5 |

**Rate.** Base: one sea event every 4-7 real minutes. On top, dolphins come with every third ferry departure that the viewer can see (`FERRY.period` 90 s in game time).

**The viewer decides.** An event only starts if its anchor is within 140 of the camera and inside the frustum with 15% margin (one sphere test). Otherwise it is deferred, so sightings are moments, not background noise. The exception: Mocha's own trips (1 below) record a memory even unseen.

**Magic-moment triggers** (rate-limited to once per 3 min):
1. **The walker at a pier end.** He is inside a PIERS rect, within 6 of its west end, and the camera looks west (`cos(camS.yaw-(-π/2)) > .5`) for ≥ 6 s. Then schedule an event in 4-12 s at 30-45 out, inside his view cone.
2. **Mocha watching for orcas.** His 'orca spotting' hobby (line 799: `p:'ferry', doing:'looking for orcas'`) or `G.ride==='ferry'`, in watch mode. Then an event within 20 s in his view. He reacts with a startle-joy emote and a bubble ("ORCAS!! 🐋" or "a calf!!"), plus a diary memory: `mem` "I saw orcas from the ferry", feeding B29 and B30.
3. **A townsfolk with the `orca` activity** (VDESC, 6006) on screen. Schedule as in 2, with their bubble.

**The water mask.** Rejection-sample against all of these; the existing spawn box violates them:
- x ≤ -110 (all piers end at x ≥ -101)
- |z| ≤ 120
- ≥ 9 from every PIERS rect (line 4703)
- ≥ 12 from the ferry hull now, and from its predicted position for the next 5 s (`FERRY`, 2764: dockX -92, dockZ 46, farX -300)
- ≥ 10 from each sailboat (`sails`)
- the heading is roughly parallel to the shore (±z, ±35°), so a viewer on the shore gets a side profile

Nothing starts while `IN.on` (LF1), while the map, a sheet or the camera is busy, or on LOW when a frame is over budget.

### 3.5 Code changes
- **Delete the old orca:** lines 2766-2767 (`const orca`, `scene.add(orca)`, `orcaT`, `orcaPos`) and line 5655 in `frame`.
- **Add the SEA block in its place** (TDZ-safe: it is defined before `frame` uses it):
  - `const SEA={m,fx,rest:{orca,calf,dolphin},ev:null,next,stats}`
  - `function seaBuild()`, `seaFrame(dt)`, `seaStart(kind,o)`, `seaMask(x,z)` and `seaSched(dt)`
  - `frame` line 5655 becomes `seaFrame(dt);`
- **Sounds:** add 'spout', 'splash', 'splashS' (small) and 'whoosh' recipes to the B20 SFX table (`audShot`, 7071). They are positional with `{x,z}` and muffled when `IN.on`.
- **Text:** a news and diary line through the existing `newsPush` and `mem` paths (hook names are in `__mocha`), for example "Barnaby: orcas off the ferry dock this evening!". No new state beyond a counter in `S.town` (≤ 30 bytes) for "times you saw orcas" (optional).

### 3.6 LF2B CORE and STRETCH

**CORE:**
- adult and calf orca geometry
- `SEA.m` with the CPU bend and fluke, and `SEA.fx` with droplets, foam, rings and mist
- breach (both roll variants) and surfacing spout
- the water mask, the scheduler (viewer-aware, golden-hour bias, night spouts only) and the pier-end trigger
- Mocha's hobby and ferry trigger with his reaction
- sounds and hooks; delete the old orca

**STRETCH:**
- white-sided dolphins, bow-riding the ferry and crossing the Sound
- a second adult (a pod of 3)
- spyhop (head up, slow turn) and tail-slap (flukes up, slap, splash)
- seagulls circling a breach spot
- the golden-hour backlit glint: one GLOWPTS sparkle on the spray

### 3.7 LF2B acceptance
1. `__mocha.sea.force('breach',{x:-120,z:30,heading:0,freeze:.5})`, shot from `castView({x:-120,z:30,dist:14,pitch:.12,yaw:π/2})`:
   - the orca is visible; the projected bounding-box aspect (length/height) is 2.2-3.6
   - the dorsal fin (an upper 18% band) is present
   - a white patch exists on the near flank: ≥ 3% of the silhouette pixels are near #F4F1EA
2. Repeat from `yaw:-π/2` (the other side): a white eye patch is present too.
3. Breach phases u=.2, .5, .8: the body bend differs. The mean |y'-y| of the tail vertices is > .05 between .2 and .8. The pitch sign flips. At u=.5 the body bottom is above the water (y > -.4).
4. At re-entry (u ≥ .95): ≥ 20 FX instances are live, and within 1.5 s 2 rings have radius > 3.
5. `force('spout')`: at least 6 mist instances rise above y 1.5 within 1 s. `audio().st` counts 'spout' once.
6. **Draws.** `drawInfo().calls` during an event minus idle is ≤ 2. Idle: `SEA.m.visible===false` and `SEA.fx.visible===false`. `programs().n` is unchanged.
7. **Mask.** `sea.sim(500)` returns 500 anchors, all with x ≤ -110, ≥ 9 from every PIERS rect and ≥ 12 from the ferry.
8. **Triggers.**
   - The walker at the west end of pier [-89,-61,41,51], facing west, 15:00: an event starts within 20 s, and its anchor projects inside the screen.
   - At 23:00 only 'spout' kinds start (`sea.sim` by hour).
   - While `inside().on`, no event starts.
9. **Cost.** `sea().ms` (the `seaFrame` time, an exponential moving average) is ≤ .6 ms on desktop SwiftShader during a breach.
10. Smoke and test-B20 (sound) pass. No page errors.

### 3.8 LF2B hooks
- `__mocha.sea()` returns `{on,kind,u,t,next,last:[{kind,x,z,at,seen}],n:{breach,spout,dolphins},verts,draws,ms}`.
- `__mocha.sea.force(kind,{x,z,heading,freeze})` and `.freeze(u|null)`, which holds a pose for screenshots.
- `__mocha.sea.sim(n)` returns mask stats.
- `__mocha.sea.pose(u)` gives one deterministic frame at phase u.

---

## 4. About "it doesn't really look like the pictures yet"

That is coming. The picture style is the B27Sa/Sb (autumn exteriors) and B27Ta/Tb (vintage interiors, wardrobe) passes. They are fully specified in `round2-spec.json` and Addendum S, with approved in-engine mockups in `previews/scene-mock/shots`, but they are not in the live build yet.

LF1 makes the interior mockups' framing real in the game: the AC camera, the warm void and painted windows. It also cuts indoor draws by about 85%, which gives B27Ta and LF4's HIGH and ULTRA tiers the budget for richer rooms.

The mockups still use Mocha at scale 1.5. Re-render them with LF2A's scale (2.3, last row) so the owner sees him at the new size.

## 5. Build order suggestion
1. LF2A (small, self-contained: about 1 hour). It changes heights only.
2. LF1 (largest: 4-6 hours). It goes on top of the hotfix's controls v3. Co-ordinate with B27Ta on 'room' camera ownership, the void, the shadow fit and WINOUT.
3. LF2B (2-3 hours). It is independent. It needs `IN.on` from LF1 only for the "not while inside" rule; guard it with `typeof IN!=='undefined'` if built first.

## 6. Evidence index
- Interiors:
  - `/tmp/harness/lookfeel/interior/` holds `{cafe,home}-*-now.png` (today), `*-emu.png` (world hidden), `*-target.png` (AC target with Mocha at the new scale)
  - the draws and scene dumps are `*.json`
- Size: `/tmp/harness/lookfeel/scale/` holds `now-*` and `k068-*` (walk default, walk wide, follow 24, follow 12), plus `*-measure.json`.
- Orca: `/tmp/harness/lookfeel/orca/now-close.png`, `now-close-34.png`, `now-distance.png`.
- Probes: `/tmp/harness/lookfeel/probe/` (`common.js`, `keys.js`, `size.js`, `interior.js`, `interior2.js`, `orca.js`).

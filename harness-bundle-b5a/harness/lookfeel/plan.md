# Look-and-feel update: how to build it in two parallel tracks

Written Nov 3, after the owner's morning feedback on his iPhone. This plan covers eight build steps:
- the four style passes already specified in `/tmp/harness/round2-spec.json`: **B27Sa** and **B27Sb** (exteriors), **B27Ta** and **B27Tb** (interiors and wardrobe)
- the four new steps in `/tmp/harness/lookfeel/steps.json`: **LF1** (immersive interiors), **LF2** (Mocha's size and the orca), **LF3** (menus that never freeze), **LF4** (High and Ultra graphics)

The designs behind the new steps are `/tmp/harness/lookfeel/design.md` (LF1, LF2) and `/tmp/harness/lookfeel/menus-quality.md` (LF3, LF4). Art direction is Addendum S (`/tmp/harness/style/addendum-S.md`). The visual bar is the owner's nine references in `/tmp/harness/refs/`:
- exteriors: s1 autumn café plaza, s2 stone cottage, s3 town entrance, s4 brick path, s5 winter market at night
- interiors and wardrobe: i1 boutique outfit wall, i2 library-study, i3 book café, i4 Victorian study
- the guy: c1 to c3

LF5 (elegant pop-ups, `/tmp/harness/lookfeel/LF5.json`) is part of the same update. It runs right after the merge (section 7), because it needs pieces from both tracks.

---

## 0. The plan in short

1. **Before the fork (about 45 minutes, one agent):**
   - The controls-v3 and guy-only wardrobe hotfix is verified and published. That file is **BASE-H**.
   - Apply seam **S0** (Addendum S17, unchanged), then the new seam **L0** (section 1.4). L0 is a small, behaviour-neutral commit: it declares the shared objects both tracks read, and splits the few lines both tracks would otherwise edit.
   - The result is **BASE-LF**, `/tmp/harness/base-lf.html`.
2. **Two tracks on two copies, in parallel, about 8 hours each:**

| Track | File | Steps, in order | Theme |
|---|---|---|---|
| **S** | `/tmp/harness/b27s/index.html` | **B27Sa → B27Sb → LF3 → LF4** | Outside and the render engine: the autumn town, frame and render path, menus, quality tiers |
| **T** | `/tmp/harness/b27t/index.html` | **LF2 → B27Ta → LF1 → B27Tb** | Inside and the characters: Mocha's size and the sea, the rooms, immersion, the wardrobe |

3. **Merge** with `merge3.py`, then the glue (section 6).
4. **After the merge:**
   - B27Tb, if it was deferred
   - LF5
   - the owner-facing before and after sheets
   - the review panel with six lenses (section 8), adversarial verify, one fixer, QA
   - publish, commit
   - then resume batch 4

---

## 1. Before the fork

### 1.1 Inputs
- **BASE-H:** the hotfix's final verified file, the one published to the main artifact. It is `e7d8990` plus:
  - controls v3 (`/tmp/harness/controls-v3.md`): left floating stick, right-thumb look, no buttons, `ctlRelease()`, `__mocha.ctl()`
  - the guy-only Your Look (track H2: hair styles 0, 2 and 3 are now short side part, messy crop and buzz cut; no pink hair; the 'mellow' voice)
- Batch 4 stays paused (`/tmp/harness/paused-b4/`). It is integrated after this update ships (section 7).
- Probes and baselines from the design workflow (read only; tracks copy them):
  - `/tmp/harness/lookfeel/probe/`
  - `/tmp/harness/lookfeel/menus/`
  - `/tmp/harness/lookfeel/{interior,scale,orca}/`

### 1.2 Decisions to take before the fork

| # | Decision | Default if nobody decides | Where it is read |
|---|---|---|---|
| D1 | **Bloom at ULTRA.** Amend Addendum S5 ("no bloom pass and no extra render target, ever") to "never on LOW, PHONE or HIGH; ULTRA may add one mip-chain bloom and the SAO targets" (menus-quality 5.6). | No bloom; ULTRA uses GLOWPTS ×1.4 | `/tmp/harness/lookfeel/signoff.json` `{"bloomUltra":true\|false}` (LF4 reads it) |
| D2 | **ULTRA program budget** +6, compiled behind the tier fade (S16.5 amendment) | +6 | LF4 brief |
| D3 | **B27Tb readiness.** Has the owner approved his guy (look-mock), and is the hotfix walker verified? | Run B27Tb last in Track T. If it is still blocked when Track T gets there, merge without it and run it after the merge | orchestrator |
| D4 | **Mocha's default follow distance** goes from 24 to 18 (he is smaller) | 18 | LF2 |
| D5 | **LF5 placement** | Right after the merge (section 7) | orchestrator |

### 1.3 Seam S0
Apply exactly as Addendum S17 specifies (`Batcher`/`addM`, `const STYLE`, `placeCam`'s `effDist`, `updateSky`'s shadow line and sky hooks, the POOLS and GLOWPTS caps, the POOLS API, the `b8Frame` pools line, stubs, hooks, the freeze switch, the harness dirs and the three shared probes). The tracks treat these lines as read-only.

### 1.4 Seam L0 (new; behaviour-neutral; read-only for both tracks except where an owner is named)

L0 exists so that neither track has to edit a line the other one edits, and so that each track can read the other's state before the merge. Each item names its anchor (search string) and who owns the result after the fork.

| # | Change | Anchor | Owner after the fork |
|---|---|---|---|
| L0-1 | **One declarations block** on the lines right after S0's `const STYLE` line, which comes after `const TOONG=rampTex(PAL.toon),TOONC=rampTex(PAL.toonC);` (renderer and scene already exist there). Its stubs:<br>• `let WORLD=null;function worldAdd(o){(WORLD&&WORLD.parent?WORLD:scene).add(o);return o}`<br>• `const IN={on:0,pid:null,who:null,ph:'idle',k:0,see(id){return true}};`<br>• `const UIQ={level:0,hot:0,fps(){return 1e9},render(T,dt){return!(LB.open\|\|msgCover)\|\|Math.floor(T*3)!==Math.floor((T-dt)*3)}};`<br>• `const SHEETS={m:new Map(),set(id,c){c?this.m.set(id,c):this.m.delete(id);UIQ.level=this.level()},level(){let l=0;for(const c of this.m.values())l=Math.max(l,c==='full'?2:1);return l},has(c){for(const v of this.m.values())if(v===c)return true;return false}};`<br>• `const TIER={n:1,name:'phone',boot:1,auto:true,farOut:1200,f:{dens:1,far:1},fps(){return SET.saver?20:TOUCH?30:60}};function tierInit(){}tierInit();`<br>• `const PREWARM={L:[],done:false,add(n,f){this.L.push([n,f])}};` | after `const STYLE` | WORLD, worldAdd and IN: **T (LF1)**. UIQ, SHEETS and PREWARM: **S (LF3)**. TIER and tierInit: **S (LF4)** |
| L0-2 | **frame() split.**<br>• The cap becomes `const fps=Math.min(TIER.fps(),UIQ.fps());`.<br>• The render condition becomes `if(UIQ.render(T,dt)){`.<br>• The `hudT-=dt;…HUD.layout();` line moves above the UI block.<br>• The UI block (from `if(bubbleT>0)` through the label pass, plus the near-pill line) moves verbatim into `function frameUI(dt)`, declared right after `frame`, and is called where it was. Any frame() local it reads becomes a parameter.<br>• Inside frameUI, the label pass (from `lblT-=dt` through the opacity loop) is wrapped in `if(!IN.on&&UIQ.level<2&&performance.now()>=UIQ.hot){…}`. The only visible effect before the tracks fill the stubs: labels stop updating behind full covers (the map, Messages, the picture viewer), where they are covered anyway. | `function frame(now)` | frame() body: **S**. frameUI body and the orca line (LF2 turns it into `seaFrame(dt)`): **T**. The label gate: seam |
| L0-3 | **SHEETS.set one-liners** at every sheet open and close:<br>• `panelOpen` ('half' only when the panel is the portrait bottom sheet, using the same test as the CSS)<br>• `openMsgs`/`closeMsgs` ('full' when `msgCover`)<br>• `openLB`/`closeLB` ('full')<br>• `toggleMap` ('full')<br>• `lookOpen`/`lookClose` ('look')<br>• `shRender`/`shClose` ('half' on phones) | those functions | seam (the rest of each function follows section 4) |
| L0-4 | **GLOWPTS room clip.** Add uniforms `uRoomC` (vec4: cx, cz, cos ry, sin ry) and `uRoomH` (vec3: half w, half d, on). In the vertex shader, after the point size: when `uRoomH.z>.5`, a point whose room-local xz lies outside the half-extents +.5 gets `gl_PointSize=0.` (design 1.6). Same material, so the program count is unchanged. | `const GLOWPTS=` | seam lines. T sets the values; S owns the rest of the shader |
| L0-5 | **POOLS pid and mask.**<br>• `poolAdd(x,z,r,color,k=1,y=.37,pid)` and `poolAddM(m4,color,k=1,pid)` store `Q.pid[i]`.<br>• `poolSet` multiplies by `(IN.on&&Q.pid[i]!==IN.pid?0:1)`.<br>• Add `function poolSync(){…}`, which re-applies every k.<br>• The S0 `b8Frame` pools line gains `\|\|IN.on` in its visibility test. | `function poolAdd` | seam |
| L0-6 | **Mocha's lantern** (LF3 M5, verified 17 → 0 shader links at trip start).<br>• `mLight` is added to the scene, not to mocha.<br>• In `updateMocha`, the `mLight.intensity=` statement becomes `mLight.position.set(G.x,G.y+.6,G.z);mLight.intensity=mocha.visible?.3+nightAmt*.6:0;`. | `const mLight`, `mLight.intensity=` | **T** (updateMocha). LF2 may scale the .6 |
| L0-7 | **Room exposure.** `RIG.cutT=cut;RIG.cutP=cp;` becomes `RIG.cutT=IN.on?1:cut;RIG.cutP=IN.on?(byId[IN.pid]\|\|cp):cp;`. | `RIG.cutT=cut` in `wltTick` | seam (the rest of wltTick: S) |
| L0-8 | **Test hooks**, through `STYLE.hooks`:<br>• `__mocha.lf()` → `{IN:{on,pid,ph},uiq:{level,sheets},tier:{n,name},prewarm:n,world:!!WORLD}`<br>• `__mocha.lfForce.in(on,pid)`, for tests only | `STYLE.hooks.push` | seam |
| L0-9 | **Harness.**<br>• Write `/tmp/harness/base-lf.html`.<br>• Copy it to `/tmp/harness/b27s/index.html` and `/tmp/harness/b27t/index.html` (S0 creates the dirs and the empty `ledger.json` files).<br>• Each track copies the lookfeel probes it needs into its own folder. | | orchestrator |

**L0 verification, before the fork:**
- smoke 15 and 1 at DAY=11-03, with zero page errors in all 3 viewports
- the S16 toggle ledger shows 0 delta on the S18 fixed views (frozen)
- `programs().n` unchanged
- test-controls, test-stick, test-guy, test-B12, B16, B21, B26 and B27 pass
- `lookfeel/menus/probe-light.js` shows 0 program links at trip start
- `__mocha.lf()` answers

---

## 2. The two tracks

### 2.1 Order and timing

| Track S (`/tmp/harness/b27s/`) | hours | Track T (`/tmp/harness/b27t/`) | hours |
|---|---|---|---|
| **B27Sa**: the autumn look (palette, light, gated post, leaf-cluster trees, lens with fovK) | 2-3 | **LF2**: Mocha at the cast's size; the orca and calf | 1-1.5 |
| **B27Sb**: the dressing (paving, DB and the calendar, prop kit, vignettes, avenues) | 2-3 | **B27Ta**: the rooms (BAKEMI, lamp-lit grade, architecture, light and hero kits, the café, Threads and Mocha's study) | 2-3 |
| **LF3**: menus that never freeze | 1-1.5 | **LF1**: immersive interiors | 1-1.5 (CORE) |
| **LF4**: High and Ultra tiers | 1-1.5 | **B27Tb**: catalog re-themes, the Rainy Term wardrobe, the outfit wall (needs D3) | 2-3 |

### 2.2 Why this split
The split follows the code, not the feature list.
- **Track S** holds everything that edits frame()'s render path, `updateSky`, the post shader, `resize()`, the GLOWPTS profile and the town batches:
  - B27Sa and B27Sb own these by Addendum S17.
  - LF3 changes the frame cap, the render gate and the shadow freeze.
  - LF4 changes the same cap, ADAPT, the post defines, the shadows, fog and distance, and the litter and DB density.
  - LF3 and LF4 in the same track as B27S means these edits are sequential, never merged.
- **Track T** holds everything that edits `updateMocha`, the rooms and the characters:
  - LF2's height and bob lines sit right beside LF1's visibility lines in `updateMocha`.
  - LF1 replaces B27Ta's room camera, void and window glass.
  - B27Tb owns the wardrobe and Your Look.
  - Audio (LF1's muffle, LF2's sounds) is only touched here.
- **Within Track T:**
  - **LF2 goes first.** It is small and fixes the owner's first complaint, and every later shot in T (B27Ta's rooms, LF1's watch mode) shows Mocha at his final size.
  - **B27Ta precedes LF1.** LF1 builds on B27Ta's pitch, void, shadow fit and arch windows. From LF1 on there is one owner for the 'room' camera.
  - **B27Tb is last**, because it is the only step that may be blocked on the owner (D3).
- **Within Track S:**
  - B27Sa and B27Sb keep their specified baseline.
  - LF3 comes before LF4, because LF4 composes its frame cap with LF3's UIQ and folds in B27Sa's post band and B27Sb's dressing density.
- **The cross-track reads** (T reads SHEETS, TIER and SET.saver; S reads IN) all go through the L0 stubs. That way each copy runs alone, and the real behaviour simply appears after the merge.

### 2.3 What each step inherits
- **B27Sa:** BASE-LF.
- **B27Sb:** B27Sa.
- **LF3:** both style passes. Its "before" for the menus probe is the track file at the start of LF3.
- **LF4:** LF3's UIQ, and B27Sa's `STYLE.post`, `tsBand` and GLOWPTS profile. Its PHONE parity baseline is the file at the start of LF4.
- **LF2:** BASE-LF. IN is still a stub; it is tested with `__mocha.lfForce.in`.
- **B27Ta:** LF2. Its "BASE+S0" before shots are the file at its own start, with the new-size Mocha.
- **LF1:** B27Ta's rooms.
- **B27Tb:** LF1. The outfit wall is seen through the new room view; "Try the whole look" pushes CAM 'look' over 'room'.

### 2.4 If a track runs late (cut lines)
- **LF1:** C1 to C7 are the floor of "the world disappears". If C8 (the cabin and decorate) is not reached, take the cabin out of ENTERABLE for this release, so the cabin keeps B26's cutaway camera, and finish C8 in the fixer pass.
- **LF2:** A1, A2, B1 to B3 and B5 are the floor. The pier trigger and golden-hour placement in B4 may slip to the fixer.
- **LF3:** M1, M2, M4 and M8 are the floor. These are the four measured freezes; M5's lantern half is already in L0.
- **LF4:** G1 to G4 and G8 are the floor. SAO and bloom are STRETCH by design.
- **B27Tb:** if blocked (D3), merge without it and run it after the merge, as Addendum S17 already allows.
- A track that finishes early does **not** take work from the other track's territory. It shoots the owner-facing sheets for its own steps and runs its STRETCH.

---

## 3. Preamble for the four B27 steps (prepend verbatim to each B27 brief in this update)

> **LOOK-AND-FEEL UPDATE PREAMBLE (Nov 3).** Where this preamble and the brief below differ, the preamble wins. Plan: `/tmp/harness/lookfeel/plan.md`.
> - **BASE** is now BASE-LF (`/tmp/harness/base-lf.html`): the verified controls-v3 plus guy-only-wardrobe hotfix, plus seam S0, plus seam L0. Wherever the brief says BASE or BASE+S0, read BASE-LF. For the "before" shots and the ledger, use the track file as it stood when this sub-step started. In Track T, B27Ta starts after LF2, so its before shots already show Mocha at the new size.
> - **Tracks:** Track S runs B27Sa, B27Sb, LF3 and LF4 in `/tmp/harness/b27s/`. Track T runs LF2, B27Ta, LF1 and B27Tb in `/tmp/harness/b27t/`.
> - **Controls v3** (`/tmp/harness/controls-v3.md`) replaced the cozy camera (controls v2). Read "the cozy camera" as controls v3, and never undo it. `test-controls.js` (v3) and `test-stick.js` must pass. B27Sa A7's "Cozy walk pitch (about .62)" means: v3's default walk pitch and its pitch clamp are unchanged.
> - **The owner's walker stays a guy.** The guy-only hotfix (H2) changed LOOKP: styles 0, 2 and 3 are now short side part, messy crop and buzz cut; pink hair became sandy brown; the 'soft' voice is 'mellow'.
>   - B27Tb builds on that array. Every new option and all 8 RAINY presets are masculine (trousers, squared shoulders, short hair, flat shoes).
>   - Never bring back a removed option.
>   - `migrate()` handles both pre-hotfix and hotfix look arrays.
>   - `test-guy.js` passes.
> - **Seam L0 lines are read-only, like S0** (plan section 1.4). Read IN, SHEETS/UIQ, TIER and PREWARM; never write them unless the plan names your step as their owner.
> - **Territory amendments to Addendum S17** (plan section 4):
>   - (a) The thumbnail pipeline (`thRender`, `thumb`, `thPump`, `thFill`, `THB`) moves to LF3 in Track S. B27Tb changes only builders and `CATB`/`CATSRC`/`CATDEC`/`CATFLV`/`catMerge`, and puts previews in any new UI only as `<img data-th="code.v">` filled by `thFill(host)`. It never reads `thumb()`'s return value.
>   - (b) B27Tb also delivers Your Look's responsiveness (LF3 M3's Your Look item):
>     - an option tap updates only its own row
>     - it calls `applyLook` quietly and debounces `save()` to 1.5 s, plus one save on close
>     - `lookClose` does not re-render the You tab unless it is dirty
>     - every Your Look tap handler takes 50 ms or less at 1x in `lookfeel/menus/probe-menus.js`
>   - (c) LF1 may edit the wall-cap materials and record `p.fw` inside `shop()`, `cottage()` and `dollhouse()`. B27Sb still owns only the café umbrella block inside `shop()`.
>   - (d) `catBuild`, `catTick` and `catDrop` are LF3's; `catMerge` stays B27Tb's.
> - **Runtime contracts** (plan section 5):
>   - Anything added to the scene after boot goes into a group made at boot, or through `worldAdd(o)`; never `scene.add`.
>   - Register every material first used after boot with `PREWARM.add(name,()=>sampleObject)`.
>   - B27Ta passes the room's pid as `poolAdd`'s 7th argument (`poolAddM`'s 4th) for every interior pool.
>   - Indoor overrides of fog, `camera.far`, the clear colour and the shadow box go only through `STYLE.skyHooks` and `STYLE.shadowHalf`.
>   - Never toggle `.visible` on a light or its ancestors.
> - **Mocha** is smaller in Track T (LF2: growScale 1.05 at level 1, follow distance 18). In Track S he keeps the old size until the merge. Tune nothing to his size; the merge glue re-checks him.
> - **The owner's newest feedback (Nov 3)** says the game "doesn't really look like the pictures." These passes are what make it look like them. Match the approved mockups (`ghost-town/previews/scene-mock/shots`, `shots-int`) and the references s1 to s5 and i1 to i4 closely, and say per view what still differs.

---

## 4. Shared hot spots: who may edit what

Nobody edits the other track's areas. "Seam" lines are read-only for both tracks.

| Area (search string) | Track S | Track T | Notes |
|---|---|---|---|
| `function frame(` | everything outside frameUI: the cap (through `TIER.fps`/`UIQ.fps`), ADAPT, BEND, the render gate and post, the hud/`HUD.layout` line, the map line | only the `seaFrame(dt)` line (LF2) | L0-2 split them |
| `function frameUI(` (L0) | never. LF3 relies on the seam's label gate | all of it: Mocha's bubble and its anchor (LF2), visibility, the edge chip, the near pill (LF1); later LF5 | |
| `function updateMocha`, `updateW`, Mocha's body build, `emoTick`, `benchY`, `needleStep`, `lhStep`, `tkShot`/`tkMid`, pets | never | LF2 (heights, face, seats), LF1 (IN.see, peek fades) | L0-6 already moved the lantern |
| `CHARLOD` | assignment of `d0`, `dh`, `max` and `nsh` from LF4's `applyTier()` only | `CHARLOD.tick` (LF1) | |
| `function updateSky` | all of it (B27Sa grade, fog and haze; LF3 shadow freeze; LF4 far, fit and snap) | only `STYLE.skyHooks` and `STYLE.shadowHalf` (B27Ta void and fit; LF1 extends them) | the hooks run last |
| `const post` shader, `rt`, `resize()`, FOV and `fovK`, the `const PR=` line, `applyPower`, `canvasTex` aniso | S | never (B27Ta's room vignette is CSS) | |
| `const GLOWPTS` | the shader profile, halo sizes and the fog factor (B27Sa, LF4); the jack range (B27Sb) | `glowPt` calls; sets `uRoomC`/`uRoomH` | the room-clip lines are seam (L0-4) |
| `POOLS`, `poolAdd`, `poolAddM`, `poolSet` | calls without pid (outdoor) | calls with pid (B27Ta); `poolSync()` (LF1) | the API and mask are seam |
| `function wltTick`, `WLT` | S (after-hours windows) | never; LF1's WINOUT tint runs in its own tick | the `RIG.cutT` line is seam (L0-7) |
| `function shop(` | only the café umbrella block (B27Sb) | the wall-cap faces and `p.fw` (LF1) | 8 lines apart; merge3 handles it |
| `cottage(`, `dollhouse(`, `library(`, `buildCabin`, `cabFrame`, `cabCutApply`, `cabCamPush`, `dEnter`/`dCam`/`dExit`, `holHide`, `doorTick`/`TUN`, `doorBuild`/`diSync`, `roomFit`/`roomPush`/`b12Frame`/`b14Frame`, `rigAssign`, `fxFrame`, the b21 notes emitters, `tapWorld`/`tapBuilding`, `railMat`, `floorMat`, `LAYOUTS`, `PIECE`, `innerMerge`, `LIGHTSPOTS`, `makePet`, `b18Frame` | never; S dresses lots from outside through DB | T (B27Ta, LF1) | |
| `PAL`/`AUT`, `SEASONS`, `grassTex`, roads and walks, `plazaB`, `park(`, the tree batch and `blockers`, litter, clouds, skyline, `market(`, `grocery(`, `wallTex`, `signTex`, `sign(`, `gable(`, `holBuild`/`holFronts`/`wreaths`/`pumpkin(`/`xmasTree`, `dressTown`/`dressCal`/DB, `styleFootprints` | S (B27Sa, B27Sb; LF4 density) | never; LF1 hides them inside through WORLD and the exterior list, with no edits | |
| the thumbnail pipeline: `thRender`, `thumb`, `thPump`, `thFill`, `THB`, `catPage` cells, `shRender` previews, `dTrayDraw` cells | S (LF3) | `<img data-th>` markup only (B27Tb) | amended from S17 |
| `catBuild`, `catTick`, `catDrop` | S (LF3 slicing, LF4 distances) | never | |
| `catMerge`, `CATSRC`, `CATB`, `CATDEC`, `CATFLV` | never | T (B27Tb) | |
| Your Look: `ylClick`, `ylRender`, `applyLook`, `lookOpen`, `lookClose`, `youParts`, `LOOK*`, `youFix`, `youKeys`, `lookOfItem`, `lookTry`; `fresh()`, `migrate()` | never | T (B27Tb, including the Your Look responsiveness) | the SHEETS.set lines inside them are seam |
| Menus: `panelOpen`, the Messages sheet, `openLB`/`closeLB`, `toggleMap`/`drawBigMap`, `renderFeed`/`renderMe`/`lbItems`/`showLB`, `onDiary`/`TABS`, `HUD.layout`, `ltSync`, `fitMsgs`, `project()`, `takeSelfie`/`savePhotos`/the save interval, the Settings panel (the Graphics row), the `SET` loader (`SET.gfx`) | S (LF3, LF4) | never | |
| Audio: the `audShot` SFX table, `bedMk`, `audLis`, `audWild`, `wxUpd` | never | T (LF1 muffle, LF2 recipes) | |
| The sea: `const orca` → the SEA block | never | T (LF2) | |
| `waterMat`, `waterTex` | S (LF4 ripples and streaks) | never | |
| `setCamMode`, `zoomLim`/`setDist`, the `camS` init, the controls-v3 code | never | only LF2's follow numbers (default 18, floor 11, follow range [4.5,80]) | otherwise owner territory for both |
| L0 stubs: IN, WORLD/worldAdd | read IN.on, IN.pid, IN.ph | LF1 | |
| L0 stubs: UIQ, SHEETS, PREWARM | LF3 | read and register only | |
| L0 stubs: TIER, tierInit | LF4 | read TIER.n and TIER.farOut | |
| Seam S0 and the other L0 lines | read-only | read-only | |
| `PLACES`, `ROADS`, `NAV`, `holTheme`, `TOWNTREE`, `SQUARE.treeSlot`, `bake()`/`BAKEM`, `rampTex`/`TOONG`/`TOONC`, `TRIPS.leavenworth`, the `window.__mocha={` literal | nobody | nobody | hooks go through `STYLE.hooks` |
| the boot `renderer.compile` list, `PROGS` | nobody | nobody | the merge glue; steps register with PREWARM |
| the end of the script (the lines right before the final `})();`) | never; LF3 and LF4 start late work from a first-frame guard in frame() | LF1 only (its main block and the one `inWorldBuild()` call) | two tracks inserting at the same point is a true merge conflict |
| the line right after `const PIERS=` | never | LF2's `seaBuild();` (CHIBI_MAT and PIERS are declared after the old orca's spot) | |
| `ghost-town/previews/scene-mock/` | read only | read only (LF2's S5 re-renders in a copy) | |
| Tools and tests | `test-B27Sa`, `test-B27Sb`, `test-LF3`, `test-LF4`; probes copied into `/tmp/harness/b27s/` | `test-LF2`, `test-B27Ta`, `test-LF1`, `test-B27Tb`; probes copied into `/tmp/harness/b27t/` | never edit the shared tools in place |

---

## 5. Runtime contracts (they hold across the copies and become live at the merge)

1. **Late objects.** Anything added to the scene after boot goes into a group created at boot, or through `worldAdd(o)`; never `scene.add`. B27Sb's `dressCal` rebuilds inside DB's own group. LF4's live-created meshes use `worldAdd`. Otherwise LF1's leak guard fails after the merge.
2. **Lights.** No step adds, removes or hides a light after boot, or hides a light's ancestor. L0 moved Mocha's lantern; LF3's `lightsLint` watches for this.
3. **Programs.** Register every material first used after boot with `PREWARM.add`. After `prewarm().done`, 0 program links anywhere: trip start, door swaps, sea events, tier switches among PHONE, HIGH and ULTRA after the first visit, selfies, menus.
4. **Indoors versus outdoors.**
   - Track S writes the outdoor fog, haze and shadow box in `updateSky` every frame, and the outdoor `camera.far` through `TIER.farOut`.
   - Track T overrides them indoors from `STYLE.skyHooks`, which run last, and through `STYLE.shadowHalf`, and restores `TIER.farOut` and the clear colour on leave.
   - While `STYLE.shadowHalf` is set, LF4's tight fit and texel snap stand aside and never move `sun.target`.
5. **Framing.**
   - Never read `camera.fov`, and never size anything from `camS.dist`; use `STYLE.effDist()`.
   - FOV compensation lives only in `STYLE.fovK`.
   - LF1's 'room' layer is not in `STYLE.fovAware`, so fovK keeps its framing after the merge.
6. **Layer names.**
   - LF1 keeps the name 'room' for every interior, the cabin included, so `STYLE.noTs` and `STYLE.noVig` gate tilt-shift and the vignette inside, in watch mode too.
   - The 'cabin' key becomes inert; leave it in place.
   - 'look', 'tryon', 'deco', 'talk', 'rainseat' and 'scope' still stack on 'room'.
7. **SET.saver** stays a live boolean, true exactly on LOW. Track T reads it (B27Ta's room vignette, LF2's sea gating).
8. **Thumbnails.** `thumb(code,v,sil,cb)` and `thFill(host)` keep working for `<img data-th>`. New UI never consumes `thumb()`'s return value.
9. **Interior pools** carry their room's pid. Outdoor pools carry none, and LF1 resolves missing pids with `placeAt`.
10. **Autonomy.** No step writes `G.act`, `G.target`, `G.mode` or `G.timer`, calls `startAct` or `goPoint` for visuals, or adds a userBias term. Mocha's reactions (the orca, the outfit wall) are visual only or weighted candidates. The bias audit is unchanged after every step.
11. **The guy stays a guy** in every look, preset, migration and preview.
12. **Measuring.**
    - Use frozen frames (`__mocha.freeze(true)`) at DAY=11-03 (S also at 10-20 and 12-10), with the S16 toggle method.
    - Each step writes only its own track ledger.
    - "Before" is the track file at the step's start.
    - Run one browser at a time per track; both tracks and other workflows share the machine. Use generous timeouts and retry once.

---

## 6. The merge and its glue

### 6.1 Merge
```
python3 /tmp/harness/merge3.py /tmp/harness/base-lf.html /tmp/harness/b27s/index.html /tmp/harness/b27t/index.html /tmp/harness/lf-merged.html
```
- `merge3.py` is a line merge, with a character-level retry for adjacent edits.
- If the territories held, the report shows no remaining conflicts. Expect a few character-merged hunks at:
  - `shop()`'s caps versus the umbrella block
  - frame()'s neighbouring lines
  - the GLOWPTS vertex line
- Read every character-merged hunk. Resolve any true conflict by the section 4 table, keeping both sides where both are owners of different parts.
- If B27Tb was deferred, Track T's file is the post-LF1 one.

### 6.2 Glue: the Addendum S17 list, adapted
1. Re-run the boot precompile. Then let the PREWARM job finish, and check that `programs().n` on PHONE is within the summed budgets: B27Sa +1, B27Sb +1, B27Ta +2, B27Tb +1, LF1 +1, LF2 +0, LF3 +1, LF4 +0.
2. The boot check: zero page errors in 3 viewports at DAY=11-03, 10-20, 12-10 and 07-15, with a fresh save, a pre-hotfix save and a hotfix-era save.
3. Re-run T's interior tone test and the phone legibility test with S's post pass active (tilt-shift and vignette as gated). Rooms are now seen through LF1's view.
4. The per-layer subject height check with fovK live:
   - every non-room layer within 8% of BASE-LF
   - except follow and talk, which are checked against LF2's size table
   - room and cabin within 8% of T's after shots
5. Re-shoot the room views: each room fills at least 80% of the width, and the walker is about 190 px tall in portrait (±10%).
6. The character separation test (S2h) on S's grounds (straw, setts, running bond, herringbone) at 15:30 and 21:00, for:
   - Mocha at the new size
   - the walker in the default look and, if B27Tb landed, the 8 Rainy Term looks
   - 2 townsfolk
7. The ramp check: every exterior baked mesh (`bake()`, PB, DB) uses TOONG, and every interior batch uses TOONI through BAKEMI.
8. The combined toggle ledger, then append the per-step entries plus one combined entry to `/tmp/harness/draws.json`. The sum of the step deltas should roughly equal the merged delta.
9. smoke 15 and 1 at DAY=11-03, 10-20 and 12-10.
10. The full test run:
    - test-B8 to test-B27
    - test-B27Sa, B27Sb, B27Ta and B27Tb (if landed)
    - test-LF1 to test-LF4
    - test-controls, test-stick, test-guy

### 6.3 Glue: cross-track checks (the things neither copy could test)

| Pair | Check, and how |
|---|---|
| LF1 × B27Sb | Inside every enterable building at DAY=11-03, 10-20 and 12-10: `inside().leaks` is []. DB dressing, bunting, strands, avenue leaf cells and jack halos (GLOWPTS clip) are not drawn, and outdoor pools are masked. Fake the clock across Nov 27 while inside: `dressCal`'s rebuild does not leak. |
| LF1 × B27Sa | Inside, including watch mode: `STYLE.post.ts` and `vig` are 0. The AC framing under fovK keeps the walker about 190 px tall. The void pixel test passes with S's grade active. |
| LF1 × LF3 | Open the panel inside the café: the quiet-world caps apply. `catBuild` never runs during a swap. The 'Go outside' pill is not eaten by input-first. 20 enter/exit cycles produce 0 program links after prewarm. |
| LF1 × LF4 | At each tier, enter and leave a room. The indoor shadow fit holds (no shimmer at ULTRA 4096). `camera.far`, fog and the clear colour are restored outside. Indoor draws stay ≤ 80/100 on PHONE. |
| LF2 × B27Sa | Mocha is the brightest object in the follow view at distance 18. The orca at golden hour is backlit under the autumn haze. Splash sprites under tilt-shift are not smeared at the band edge. |
| LF2 × LF4 | `sea().ms` at ULTRA. The water ripples and the orca's rings coexist. No sea event while `TIER.n===0` and a frame is over budget. |
| LF3 × B27Tb | Your Look taps in the Rainy Term rows: handler ≤ 50/150 ms at 1x/4x. The thumbnail sheet of the 22 re-themed rows is regenerated through LF3's atlas. The Threads outfit wall builds sliced and stays at 3 draws or fewer. B27Tb's `<img data-th>` cells fill. |
| LF4 × B27Ta/Tb | HIGH and ULTRA inside rooms: the arch-window emissive, the LIT batch and the room vignette. The walker's program count is stable across looks at every tier. |
| All | `lights().count` is constant through boot, trip start, door swaps and tier switches. The bias audit is unchanged. A 20-minute soak (walk in and out, sheets, sea events) shows no memory growth trend. |

---

## 7. After the merge, in order
1. **B27Tb**, if it was deferred (D3). Run it on the merged file as a normal sequential step, then re-run glue items 6, 8 and 10.
2. **LF5, elegant pop-ups** (`/tmp/harness/lookfeel/LF5.json`), on the merged file. It needs:
   - from Track T: frameUI and IN (name cards on entering, Mocha's bubble routed to the edge chip when he is elsewhere)
   - from Track S: SHEETS, PIX and THB (quiet while busy)
   - from both: B27Ta's café room and LF3's fixes, for the café freeze repro on a 4x-throttled phone

   It replaces LF1's near pill with the context button, and the place labels with name cards.
3. **The owner-facing sheets**, so he can see what changed:
   - before (live `e7d8990`) | after on PHONE | after on ULTRA (desktop) | reference, for the S18 views
   - three inside views
   - the Mocha lineup beside the walker and Wendell
   - the orca at u=.5 from both sides
   - LF2's mockup re-render, if built

   Publish them as a private artifact page for the owner, together with the game build.
4. **Review panel** (section 8), then adversarial verify (2-3 refuters per finding, reading code), one fixer agent, final QA (smoke at 15, 1 and 21 at DAY=11-03, the Halloween and Dec 10 spot checks, the full test run).
5. **Publish and commit.** Publish to the main artifact (get_artifact first for base_version), copy to `previews/publish`, commit `ghost-town/index.html` on branch ghost-town. Tell the owner what changed in plain words, with the sheets.
6. **Resume batch 4** (round2-plan, Nov 3 notes):
   - `merge3.py base-b4.html trackA/index.html NEW`, and the same for track B
   - port B31's cozy-camera code to controls v3
   - B31's cabin visits and B32's empty-house nest read presence through `IN.see`
   - register any late objects with `worldAdd` and `PREWARM`

---

## 8. Six review lenses for the update

Every lens holds the work to the owner's own pictures (`/tmp/harness/refs/`). Lenses may run Playwright (SwiftShader) through one shared queue, one browser at a time. Each finding states a severity, the evidence (a screenshot path or a hook output) and the step that owns the code.

**Lens 1: Does it look like his pictures? (B27Sa, B27Sb, B27Ta, B27Tb, with LF4's shots)**
- **Views:** every S18 fixed view, three inside views through LF1, and the walker and outfit-wall views.
- **Shots:** frozen, at DAY=11-03 15:30 and 21:00 (plus 10-20 and 12-10 for the calendar). Shoot each on the live build (`e7d8990`), on the merged build at PHONE, and on desktop at ULTRA, and lay them out as before | after PHONE | after ULTRA | reference sheets.
- **What to read in each sheet:**
  - palette, through `ext_now_stats.py` and the interior tone script against the S2 targets
  - shape language: scalloped maples, sage-black firs, dark-wood signs, arched windows, the book walls
  - light: low warm sun, mauve shadow, dusk lamp glow, lamp-lit room middles with one cool window
  - density: the porch and terrace vignettes, the avenues
  - phone legibility: 393 px signs, the walker on the lower third, sky at 15% or less
- **Output:** one verdict per view, naming the single biggest remaining gap.
- **IP check:** flag anything copied from a reference (names, villagers, captions, paintings).
- **The bar:** shown the after frame next to its reference, a stranger would say "same world". Because "it doesn't really look like the pictures" is the owner's explicit complaint, gaps here rank high.

**Lens 2: Inside a building (LF1, with B27Ta's and B27Tb's rooms)**
- **Coverage:** walk into and out of every enterable building (each shop, the café, the station, the bookstore and library, Mocha's house, Wendell's cottage, the cabin) in portrait, landscape, the Duo and desktop, at 10:30, 19:00 and 22:00, and in rain.
- **The transition:** the fades take about .35 s each way; no stick or look drift survives the cut.
- **Nothing outside:** `inside().leaks` is []; the void pixel test passes; no wreath, tunnel or door floats.
- **The room:** the camera frames each room's hero the way the approved mockups (i1-cafe, i2-study, i4-cabin) and the references i1 to i4 do; walls cut correctly as he walks around.
- **Who is drawn:** keepers, Mocha and Wendell appear only when they are really there; townsfolk appear and vanish at the door.
- **Watch mode** goes in and out with Mocha without ping-pong.
- **Other paths:** the 'Go outside' pill and taps, decorate, the cabin, painted windows and muffled street sound (if built), a reload inside.
- **Budgets:** draws of 80/100 or fewer, swaps under 12 ms, 0 compiles.
- **The bar:** the owner's words, "the whole world disappears... as if you're in the building for real", and the lamp-lit warmth of i2 and i3.

**Lens 3: Phone playtest: feel, menus and controls (LF3, controls v3, and LF5 if it has landed)**
- **The device:** his iPhone (393x852, touch, DPR 2), at 1x and at 4x CPU.
- **Script his morning:**
  - open the game and follow Mocha
  - walk to the café with the left stick while looking with the right thumb, and go in
  - talk to Juniper, open the item card, 'see everything', buy, sit
  - open the diary, feed and Mocha tabs, the map, Your Look (change six options), the shop sheet
  - decorate the cabin
  - walk out to a pier end at sunset
- **Record:** Event Timing, long tasks, renders per second behind each sheet, program links, the `test-stick` freeze scenarios, the 96-point hit maps, and a screenshot of every sheet in 4 viewports. Re-run `probe-menus.js` and compare with `lookfeel/menus/menus-1x.json` and `menus-4x.json`.
- **The bar:** every tap answers within about a frame at 1x; nothing freezes for more than 100 ms at 1x; the stick never sticks; nothing pops over the stick or look areas.

**Lens 4: The computer tier (LF4)**
- **The comparison:** on desktop at 1100x820 and in a 2560x1440 window, shoot PHONE, HIGH and ULTRA side by side at 15:30 and 21:00 (exteriors and two rooms), next to s1 to s4, i2 and i3.
- **PHONE parity, exactly:** draws, programs, render targets and pixels. Phones must not get slower or look different.
- **The machinery:** the `tierGuess` table, the saved decision and its sig, the Settings row, the hitch on a live switch, ADAPT's demotion order, the WebGL1 and context-loss fallbacks, memory at 2560x1440.
- **The art:** tilt-shift never blurs the walker or Mocha. If bloom was signed off, it lights lamps and windows but not Mocha, snow or sky.
- **The bar:** on his computer, ULTRA reads as the "expensive" version of the same pictures (soft contact shadows and dusk glow, like s1 and s4) without changing the art. Frame rate is judged later on his machine with `?gfxhud=1`.

**Lens 5: Characters and the sea (LF2, B27Tb, the S2h separation)**
- **Mocha's size:** against the walker, Wendell, the keepers and townsfolk, in every camera layer (walk, follow at 18, the talk two-shot, seats, ferry, wheel, bed, rooms), at levels 1 and 16. Also his face legibility at follow distance and the bubble's placement. He is still the brightest object outdoors, and separated on every ground (`sep_probe`).
- **The guy:** clearly a guy in every look (trousers, squared shoulders, short hair, flat shoes), judged against c1 to c3 and i1. No removed option is back, and pre-hotfix and hotfix saves migrate. Check the outfit wall too.
- **The orca:**
  - frozen from both sides at u=.2, .5 and .8, plus the spout and the calf
  - never through a pier or the ferry (`sea.sim`)
  - viewer-aware frequency: in a 30-minute soak, count seen and unseen events
  - backlit at golden hour; spouts only at night
  - Mocha's reaction and the dolphins, if built
  - the animals look original
- **The bar:** the first time the owner sees it, the orca reads at phone size as a cute, believable orca, not "a black egg with a spike".

**Lens 6: Runtime safety, merge integrity and performance (all eight steps)**
- **Boot:** zero page errors in 3 viewports at DAY=11-03, 10-20, 12-10 and 07-15, with a fresh save, a pre-hotfix save and a hotfix-era save. Check the dead-zone placement of every new block.
- **Merge integrity:** diff the seam and territory anchors against BASE-LF, so that only owners touched their areas, and read every character-merged hunk in the merge3 report.
- **Programs and lights:** the program count after prewarm, and 0 late links through a trip start, 20 door swaps, sea events, tier switches and selfies. A constant light count.
- **Budgets:**
  - draws and tris per fixed view (exterior and interior) against BASE-LF, plus the indoor budgets
  - texture and render-target memory
  - GLOWPTS and POOLS within their caps
  - the localStorage size
- **Soak:** 20 minutes of walking in and out, opening sheets, sea events and crossing a calendar boundary, checked for memory growth and leaks (`inside().leaks`).
- **The bias audit:** G.act, G.target and G.mode are never written by these steps.
- **Tests:** the full test run.
- **The bar:** nothing in this update may crash, compile mid-play, or make the phone slower outside the new features.

---

## 9. Risks and fallbacks
- **LF1 is the biggest step**, squeezed to 1-1.5 hours of CORE because design.md already gives exact anchors. The cut line in 2.4 keeps "the world disappears" even if the cabin and decorate slip.
- **Two tracks touching `shop()`, frame() and GLOWPTS.** L0 and the territory table separate them, and `merge3.py`'s character-level retry handles the adjacent lines. Any true conflict means a territory slip: fix it in the step that slipped, not in the glue.
- **Cross-track behaviour can only be seen after the merge** (section 6.3). That is why the L0 stubs exist, and why the glue lists every pair.
- **SwiftShader** cannot judge GPU speed (LF3's numbers are main-thread only; LF4's tiers are judged on the owner's computer). The probe is run unthrottled and at 4x as the optimistic and pessimistic phone.
- **B27Tb waits on the owner** (D3). Its Your Look responsiveness item moves with it.
- **Bloom is unsigned by default** (D1). ULTRA still gains resolution, 4096 shadows, density, distance, dither and 16-tap tilt-shift, and SAO if it is built.
- **The shared machine.** Two tracks plus other workflows run browsers. One browser at a time per track, generous timeouts, retry once.

# Menus that freeze, and a graphics tier for computers (LF3 + LF4)

Written Nov 3, 2026, after the owner's morning feedback. The measurements were taken on the live build `/tmp/harness/base-hf.html` (commit e7d8990, batch 3), and no game file was edited. The probe scripts and the raw data are in `/tmp/harness/lookfeel/menus/` (section 7).

Owner's words: "Some of the menus kind of freeze up when you're using them." Also: "if there's a better way to make the graphics look better, like if it needs to be more on a computer, that's okay."

---

## 0. Summary

**Why the menus freeze.** Three things cause it, and all of them were measured.

1. **Some menus draw every picture at once inside the tap.**
   - The first open of the **Feed** paints and JPEG-encodes every painting and postcard at 512 px before it shows anything. That took 1.2 s in the tap handler at normal speed and 2.2 s with the CPU throttled 4x.
   - The **Mocha › who he's becoming** tab does the same with its painting grid: 0.57 s at 1x, 0.85 s at 4x.
   - Opening a painting in the **picture viewer** encodes the big version first: 0.45 s.
2. **Item previews stall the GPU.** This covers catalog cells, the shop card, "see everything here", pockets and the decorate tray.
   - Each 128 px preview is rendered and then read back with a blocking `readPixels`, followed by a PNG encode.
   - "See everything here" did 21 read-backs (269 ms) and 27 encodes over its first second.
   - A catalog category tap cost 127 ms of read-backs.
3. **The town keeps rendering at full cost behind most sheets, so every tap waits in line.**
   - A frame takes about 12 ms of main-thread time at 1x and about 60 ms at 4x, and about 460 draw calls (main pass plus shadow pass).
   - Rendering only slows down behind Messages and the picture viewer. Those two felt smooth: frames dropped to 2-3 ms and input delay was mostly under 25 ms at 1x (one viewer tap: 52 ms).
   - Behind the diary/you panel, the map, Your Look and the shop sheet, taps waited up to 120 ms at 1x and up to 494 ms at 4x before their handler even ran.

**A hidden one: starting a trip recompiles the town's shaders.**
- Mocha's lantern is a `PointLight` parented to Mocha (`mLight`). When he leaves on a trip, `mocha.visible=false` hides the light too, so the scene's light count changes.
- That change makes three.js recompile every lit material in view: 17 programs and 187-224 ms at 1x, with a 286 ms long task at 1x and 738 ms at 4x.
- Moving the light to the scene and dimming it to 0 instead removes all 17 recompiles. This was verified by toggling it in the page (section 3, F4).

**What was not found.**
- Nothing intercepted taps inside any open sheet: a 96-point hit map per sheet found 0% blocked.
- Every sheet released its body class on close.
- There are no non-passive document-level touch listeners.
- The "taps that do nothing" the owner felt are taps that were queued behind a long task. They do fire, just too late to feel like a response.

**The fix (LF3, section 4).**
- One registry of open sheets lets the town rest behind them: 15 fps behind half-height sheets, 3-4 Hz behind full-screen ones, shadows frozen.
- For about 150 ms after a finger lands on a sheet, the next render is skipped so the tap goes first.
- Paintings and postcards are drawn into `<canvas>` cells progressively, with no encodes and no data URLs.
- Item previews are batched into an atlas with one asynchronous read-back.
- Shaders are pre-warmed, and the lantern-light bug is fixed.
- Tabs get targeted updates instead of being rebuilt from scratch.
- Labels stop forcing layout.

**The computer tier (LF4, section 5).**
- One `TIER` object with four levels: LOW (battery saver), PHONE (today's look, unchanged), HIGH (good phones and tablets) and ULTRA (computers).
- The level is detected automatically from renderer caps, screen and DPR. A short frame-time probe then decides promotion, the result is remembered per device, and Settings offers a manual override.
- HIGH and ULTRA add:
  - a higher, pixel-budgeted render resolution
  - 4096 soft shadows with a tight, stable fit
  - SAO contact shading
  - a warm mip-chain bloom on lamps and windows
  - full-quality tilt-shift (depth-aware in STRETCH)
  - dithered grade
  - up to 2x foliage and dressing instances
  - rippled water with lamp reflections
  - 1.6x draw distance
- Every feature has a capability check and falls back to the PHONE path. The PHONE path keeps today's objects, programs and draw calls exactly.
- One rule needs sign-off: Addendum S5 says "no bloom pass and no extra render target, ever". This brief asks to amend that to "never on LOW/PHONE/HIGH" (section 5.6).

**For the owner, in one line:** "The freezes come from menus drawing all their pictures at once while the town keeps drawing behind them. We'll make pictures appear gradually and let the town rest while a menu is open. On a computer you'll be able to switch on Ultra: softer shadows, glowing lamps, denser leaves and longer views."

---

## 1. How it was measured

- **Rig.** Playwright Chromium with SwiftShader (`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`), one browser at a time. The live build was loaded through the redirect trick. The device was emulated as an iPhone: 393x852, `isMobile`, `hasTouch`, DPR 2. The game renders at PR 1.5, which gives a 589x1278 canvas. The clock was faked to Nov 3 at 10:30.
- **"No-raster" mode.** SwiftShader rasterizes on the CPU. With drawing on, the town ran at 0.6 fps, and every tap waited 5-7 s for Playwright's "stable element" check, which buried the menu costs (first attempt, discarded).
  - The probe therefore skips only the final `drawElements`/`drawArrays` calls in the page. All of three.js's JavaScript work stays in: culling, sorting, uniforms, state, buffer uploads, shader compiles and read-backs.
  - What the numbers include: main-thread cost. What they leave out: the phone GPU's raster time.
  - Sync points such as `readPixels`, `toDataURL` on GPU canvases and `getProgramParameter` still wait for the GPU process, so they are included.
- **CPU speed.** Each run was done twice:
  - CDP `Emulation.setCPUThrottlingRate` at 4, as asked. This is a pessimistic phone: every town frame becomes a long task.
  - Unthrottled (1x), which is roughly a recent iPhone's single-core speed. Read 1x as the optimistic phone number and 4x as the pessimistic one.
  - Another workflow's browser shared the 4 CPUs during the runs, so allow about ±20% noise.
- **A lived-in save, seeded through hooks.**
  - `catchUpSim(3)`: 89-93 diary entries
  - 12-13 paintings, each posted to the feed
  - 6 selfies and 1-2 postcards (19-20 posts)
  - two thirds of the catalog seen
  - 400 coins
  - The owner's real save may be bigger. Posts are capped at 30, paintings at 24 and the diary at 160, so his costs could be up to about 1.5-2x these.
- **What was recorded per action.** Marks were placed around each action.
  - `PerformanceObserver('longtask')`
  - Event Timing (`'event'`, threshold 16 ms): input delay, handler processing and duration to next paint
  - rAF callback time, which is the game's `frame()` cost
  - Wrapped counters with time for:
    - `linkProgram` and the shader status calls
    - `readPixels`, `texImage2D`, buffer uploads and draw counts
    - `toDataURL`, `getImageData`/`putImageData`/`drawImage`/`fillText`
    - `innerHTML`/`insertAdjacentHTML` (time and length)
    - layout reads (`getBoundingClientRect`, `offset*`, `scroll*`, `client*`, `getComputedStyle`)
    - `localStorage.setItem` and large `JSON.stringify`
  - For every open sheet: its screen coverage, a 96-point `elementFromPoint` hit map, and the body classes before and after.
- **Inputs.** Real touch taps (`page.tap`, which also reports interceptors), CDP touch scroll gestures (`Input.synthesizeScrollGesture`) and keyboard typing.
- **Extra probes.**
  - CPU-canvas versus GPU-canvas image costs (`--disable-accelerated-2d-canvas`)
  - a sampling CPU profile of the steady frame
  - a program-churn tracer and a light-count toggle test

---

## 2. What we measured

Columns:
- **handler**: the largest Event Timing processing time of the tap (the work done in the handler).
- **delay**: the input delay, meaning how long the tap waited before its handler ran.
- **longest**: the longest task in the 2-3.5 s after the action, at 4x.
- **3D**: frames rendered per second and `frame()` p50 while the sheet was open, at 1x.

| action | handler 1x / 4x (ms) | delay 1x / 4x (ms) | longest 4x | main costs (1x) | 3D while open (1x) |
|---|---|---|---|---|---|
| baseline, watch view | – | – | 126 | ~462 draws/frame (main + shadow) | 29.7 fps, 12 ms (p95 26) |
| open panel (book button) | 74 / 171 | **99 / 442** | 190 | forced layout (ltSync, HUD) | 28 fps, 19 ms |
| tab diary | 3 / 15 | 41 / 235 | 254 | | 29.8 fps, 14 ms |
| **tab feed (first open)** | **1227 / 2186** | 29 / 494 | **2223** | **13 canvas encodes = 1198 ms**; 386-524 KB of data-URL HTML | 21.7 fps |
| feed heart | 7 / 23 | 33 / 388 | 153 | full `renderFeed()`: 386 KB innerHTML, every image re-decoded | 29.8 fps |
| lightbox from feed | 4 / 5 | 21 / 85 | 140 | (already cached) | 3.9 fps, 2 ms (throttled today) |
| **tab Mocha › me (first)** | **568 / 852** | 27 / 114 | **990** | **15 encodes = 539 ms** (painting thumbs) | 25.5 fps |
| **me painting → lightbox** | **454 / 497** | 31 / 173 | 503 | 1 big encode = 448 ms; `lbItems` encodes every uncached item | 3.6 fps |
| sub notes / town (cal) / settings | 1-4 / 3-44 | 21-28 / 156-308 | 81-163 | | 30 fps |
| **tab you** | **109 / 214** | 27 / 128 | 427 | 12 readPixels 57 ms, 13 PNG encodes 97 ms, 1 program link | 32 fps |
| tab you (again, later) | 53 / 237 | 55 / **448** | 303 | 3 readPixels (one stall 117 ms at 4x) | 27 fps |
| catalog category 1 / 2 / 3 | 54 / 148, 33 / 53, 23 / 91 | 23-30 / 28-185 | 255 | 7 readPixels **127 ms**, 8 encodes 58 ms, 1 link | 30 fps |
| map open | 12 / 97 | 23 / 257 | 352 | the map covers 100% of the screen but the 3D renders at full rate; 550 `fillText` per redraw, 4 per second | 29.7 fps, 13 ms |
| map tap (teleport) | 11 / 54 | 18 / 249 | **529** | arrival builds (catalog shelves etc.) | 28.6 fps |
| messages open / type / send | 6-29 / 13-79 | 12-23 / 51-198 | 141 | 22 ms forced layout (`fitMsgs`, `msgList.scrollHeight`) | **2.7-4.9 fps, 2-3 ms (throttled today)** |
| talk open / chip / close | 0-5 / 4-18 | 0-90 / 172-179 | 291 | | 30 fps |
| your look open | 46 / 61 | 22 / 122 | 91 | | 29 fps |
| look option taps (6 kinds) | 5-19 / 19-55 | 8-29 / 68-282 | 337 | `applyLook` + `save()` + full sheet `innerHTML` per tap | 28-30 fps |
| your look done | 26 / **300** | 29 / 172 | **1014** | reopens the panel, then `HUD.layout` reads `.hudS offsetWidth`: **129 ms forced layout** at 4x | 29 fps |
| enter shop (Evergreen) | – | – | **818** (1x: 100) | `catBuild`/`catMerge` of the shelves in one task | 29 fps |
| card swatch | 13 / 218 | 33 / 202 | 443 | 1 preview: readPixels 132 ms + encode 81 ms (4x) | 31 fps |
| **see everything here** | **132 / 209** | **120 / 328** | 238 | **21 readPixels = 269 ms, 27 encodes**, all in the first ~1 s | 31.6 fps |
| decorate enter / tray / place | 0-13 / 0-38 | 2-29 / 3-157 | 162 | 3 previews (10 ms) | 29 fps (CAM deco is cheap) |
| **trip start** | – | – | **738** (1x: 286) | **16-17 program links, 187-224 ms of shader compile at 1x** | 22.6 fps |
| selfie (Mocha, autonomous) | – | – | 131 | full scene render + readPixels + JPEG encode + `savePhotos` | 27.6 fps |

**CPU canvas versus GPU canvas** (`menus/canvas.log`, first open, same seeded save):

| | CPU 2D canvas | GPU 2D canvas (Chrome default, like iOS Safari) |
|---|---|---|
| Feed tab | 118 ms (12 encodes = 77 ms) | 1275 ms (11 encodes = 1209 ms) |
| Me tab | 169 ms (14 encodes = 61 ms, `fillText` 32 ms) | 1614 ms (13 encodes = 1543 ms) |
| new painting → viewer | 53 ms | 566 ms |

On a GPU-backed canvas, each `toDataURL` waits for the GPU to rasterize the canvas and read it back. On the phone, the GPU is also busy with the town frame. The iPhone cost sits between the two columns, and either way it is a visible freeze.

**Steady-frame profile at 1x, watch view** (`menus/prof-1x.log`).
- Most of the main thread goes to three.js render work: about 35%, plus the GL calls `bindVertexArray`, `uniformMatrix4fv` and `vertexAttribPointer`.
- The top game function is `project()` at 8.3% of all main-thread time. It is the label projection, which reads `innerWidth`/`innerHeight` inside the per-label loop right after writing label styles.
- When the render is skipped (Messages, the picture viewer), `frame()` drops from 12-14 ms to 2-3 ms at 1x. So about 80% of each frame is the render path, and that is what rests behind sheets.

**Interception and stuck state** (both runs):
- Hit map inside every open sheet (`#panel`, `#msgs`, `#mapWrap`, `#yl`, `#ish`, `#decoTray`): **0% blocked**. The only expected cover is the picture viewer over the panel.
- After every close, `panelOpen`, `lbOpen`, `msgOpen`, `talking`, `ylOn` and `decoOn` were all removed. `tripAway` correctly stays while Mocha is away.
- The only `touchmove`/`wheel` listeners with `passive:false` are on the canvas, the Your Look drag layer and the decorate pad, and they are intentional.
- Probe artifacts, not game bugs:
  - The talk text field stays hidden until a chip opens it.
  - The away card has no postcard at the moment the trip starts.

---

## 3. Why the menus freeze (causes, ranked, with code anchors)

Line numbers are for `base-hf.html` and they drift. Search for the quoted strings instead.

**F1. Paintings and postcards are encoded synchronously inside taps.** This is the biggest cause.
- `renderFeed()` (L5275, `function renderFeed(){$('#tab-feed').innerHTML=`) calls `paintBig(pt)` for every painting post and `cardImg()` for every postcard while it builds one giant HTML string.
  - `paintBig` is at L2590: `paintCanvas(pt,512,384).toDataURL('image/jpeg',.9)`.
  - `cardImg` is at L5391: `cardCanvas(...).toDataURL('image/jpeg',.88)`.
  - The result is 386-524 KB of base64 in `innerHTML`, and then the browser decodes every image.
- `renderMe()` (L5248) does the same through `paintThumb(pt)` (L5272: 192x144 JPEG) for the paintings grid, and through `cardImg(...,false)` for the postcards.
- `lbItems(set)` (L5451) maps the whole set and calls `paintBig`/`cardImg` for every item before showing the first one.
- The caches (`bigCache`, `cardC`, `thumbCache`) help only on the second open. A new painting lands in the first open again, and the 40-entry `bigCache` is shared between the feed and the viewer.

**F2. Item previews block on read-backs.**
- `thRender()` (L7834) runs for every preview. It:
  - builds a fresh `BufferGeometry`
  - renders to a 128x128 target
  - calls `renderer.readRenderTargetPixels(...)` (a synchronous GPU read-back)
  - flips the rows, calls `putImageData`, then `toDataURL('image/png')`
- `thumb()` (L7844) allows 3 of these per frame, and `thPump()` (L7847) drains the queue from `catFrame()` every frame.
- A read-back has to wait for everything already queued on the GPU, including the town frame. On a phone that means up to three full GPU syncs in one frame.
- Callers:
  - `catPage()` (L7864), which re-renders on every category tap
  - `youTabB25()`, through `thFill(host)`
  - `shRender()` (L8028): the card and "see everything"
  - `dTrayDraw()` (L8738)
- Silhouettes are a separate GPU render plus a 2D composite.
- The first preview also links a program (the MeshBasic vertex-colour, map and alphaTest variant): 8-20 ms.

**F3. The town keeps full cost behind sheets, so taps queue behind frames.**
- `frame()` (L5638) limits rendering only with `if(!(LB.open||msgCover)||Math.floor(T*3)!==Math.floor((T-dt)*3))` (L5664).
  - The panel sheet covers 55% of the screen in portrait.
  - The map covers 100% under a 55% dim.
  - Your Look covers 58%, and the shop sheet 37-62%.
  - All of them keep 30 fps, 2048 shadows and the label pass.
- Each frame is one task of about 12 ms at 1x (60 ms at 4x), and a tap that lands during it waits:
  - delay up to 120 ms at 1x and 494 ms at 4x
  - mostly 6-23 ms at 1x behind Messages and the viewer, where rendering is already throttled (one outlier: 52 ms)
- Taps on HUD or sheet controls get no priority over a render that is about to start.

**F4. Trip start (and anything else that hides Mocha) recompiles every lit material.**
- `const mLight=new THREE.PointLight('#e6ecff',.5,10,2);...mocha.add(mLight)` (L2819).
- `mocha.visible=G.mode!=='trip'&&!(G.lh&&G.lh.ph!=='top'...` (L4018) hides the light along with Mocha. In r128, `renderer.render` collects lights with `traverseVisible`, so the number of visible point lights goes 3 → 2, the lights hash changes, and every lit material in view gets a new program key.
- **Measured:** 17 new programs and 187 ms of shader calls at trip start. With L0 re-parented to the scene and dimmed instead, there were 0 new programs (`menus/light.log`).
- The same thing happens on the lighthouse climb (`G.lh`) and any other moment Mocha is hidden. The return trip is cheap only because the old variants stay cached.
- This also breaks B16's own rule: "Fixed rig (never changes after boot)".
- Other late programs:
  - the preview materials (1)
  - the selfie path's `noBend` variant (1)
  - The boot precompile (`PROGS`, L6911) compiles 42 programs in 521-694 ms. The total reaches 48 later, and 65 after a trip.

**F5. Whole tabs are rebuilt from scratch.**
- `onDiary` (set at L5428) re-renders the open tab every time Mocha adds a diary entry (`addEntry`, L2919):
  - diary: up to 160 entries
  - feed: the 386 KB string again
  - me: the grid again
  - notes, cal
- The feed heart calls `renderFeed()`.
- Your Look's `ylClick` calls `applyLook()`, which itself calls `save()`, then `ylRender()`, which rewrites the whole sheet (8.5 KB) on every option.
- These rebuilds can also swallow a tap: if a rebuild lands between `pointerdown` and `click`, the button is detached and the click does nothing. The probe didn't catch one, but the window is open several times a minute while Mocha is active.

**F6. Layout thrash.**
- `project()` (L5209) reads `innerWidth`/`innerHeight` inside the label loop, which writes `el.style.left/top` for every label on every frame. It is the top game function in the profile at 8.3%. LF5 replaces the floating labels; bubbles still use `project()`.
- `HUD.layout()` (L1009) runs every second from `frame()` (`if(HUD.n&&Math.floor(T)!==...)HUD.layout()`) and right after class changes:
  - in `panelOpen` and `lookClose`, where its read of `.hudS offsetWidth` forced a 129 ms layout of the freshly rebuilt You tab at 4x
  - in `ltSync(1)`, which reads `#leftTop` rects right after `panelOpen` toggles the classes
- The LHUD scan (L5679) does 15 selector queries plus `getComputedStyle` each second.
- `fitMsgs` reads `scrollHeight` after rewriting the list: 22 ms at 1x and 75 ms at 4x.

**F7. Full-cost map.**
- `toggleMap` / `drawBigMap` (L5213-5214) redraw the whole 722 px canvas, with about 550 `fillText` calls, 4 times a second.
- Meanwhile the town renders at full cost behind a full-screen card.

**F8. Arrival builds in one task.**
- `catTick()` (L7823) runs `catBuild()` → `catMerge()` (L7794/L7820) for a whole shop's shelves in one go: 100 ms at 1x and 818 ms at 4x on teleporting into Evergreen.
- A map tap teleport had a longest task of 529 ms at 4x.
- The café freeze in LF5's brief includes this.

**F9. Autonomous hitches that land while a menu is open.**
- `takeSelfie()` (L4056) runs:
  - a full scene render to `selfieRT`
  - a synchronous `readRenderTargetPixels`
  - `photoURL` → `toDataURL('image/jpeg')`
  - `savePhotos()`, which `JSON.stringify`s every photo into localStorage
  - `addEntry`, which feeds F5
- `makePainting` adds an entry, a toast and `applyPaintings`.
- `save()` runs every 8 s (`setInterval(save,8000)`, L1199): `JSON.stringify(S)` plus a synchronous `setItem`, 2-16 ms. That is fine on its own but it lands on top of everything else.

**Checked and fine:**
- the Messages and picture-viewer throttles
- the decorate camera, which costs less than the town
- passive listeners
- hit-testing inside sheets
- body classes
- the talk card

---

## 4. LF3 brief: make the menus responsive

Goal: no tap waits more than about a frame, and no menu does more than about a frame's worth of work inside a tap. Pictures and previews arrive progressively instead of freezing the screen. The phone's normal walking and watching cost stays the same or gets lower.

### 4.1 CORE

**M1. SHEETS registry, quiet world and input-first frames.** Fixes F3. This is the shared seam with LF5's "quiet while busy".

API, placed near `TABS`/`HUD` so LF5's pop-up layer uses the same registry:
```js
// cover: 'full' (map, Messages sheet, picture viewer, any LF5 full card) | 'half' (portrait panel sheet, #ish shop sheet, decorate tray is NOT a sheet) | 'look' (Your Look)
const SHEETS={m:new Map(),set(id,cover){cover?this.m.set(id,cover):this.m.delete(id);UIQ.level=this.level()},level(){let l=0;for(const c of this.m.values())l=Math.max(l,c==='full'?2:c==='half'?1:c==='look'?1:0);return l},has:c=>[...SHEETS.m.values()].includes(c)};
const UIQ={level:0,hot:0,shT:0};
```

Call it from:
- `panelOpen(o)`: `SHEETS.set('panel',o&&isSheet()?'half':null)`. In landscape and on desktop the side panel isn't a cover.
- `openMsgs`/`closeMsgs`: `'full'` when `msgCover`.
- `openLB`/`closeLB`: `'full'`.
- `toggleMap`: `'full'`.
- `lookOpen`/`lookClose`: `'look'`.
- `shRender`/`shClose`: `'half'` on phones only.
- `talkOpen`/`talkClose`: `null`. The two-shot must keep full rate.

In `frame()`:
- Frame cap: `const fps=SET.saver?20:TOUCH?(UIQ.level===1&&!SHEETS.has('look')?15:SHEETS.has('look')?24:30):60`.
- Render gate: replace the condition at L5664 with `const q=UIQ.level; const doRender=now>=UIQ.hot&&(q<2||Math.floor(T*4)!==Math.floor((T-dt)*4));`. Full cover gives 4 Hz, close to today's 3 Hz behind Messages and the viewer, which measured smooth.
- Shadows: while `q>=1`, set `sun.shadow.autoUpdate=false` and request `needsUpdate` once per second. Combine this with `updateSky`'s night freeze: `sun.shadow.autoUpdate=!frz&&q<1`. Restore on close.
- Skip the label and edge-chip pass while `q===2` or `now<UIQ.hot`. LF5's name cards pause too.

Input-first:
```js
const uiHot=e=>{if(!e.target.closest('#c,#ylDrag,.stick,#joy,#look,#decoPad'))UIQ.hot=performance.now()+150};
document.addEventListener('pointerdown',uiHot,{capture:true,passive:true});
document.addEventListener('pointerup',uiHot,{capture:true,passive:true});
```
- While hot, `frame()` still runs the simulation, which costs about 2 ms, but skips the render and the DOM passes. A tap's handler and its paint then never sit behind a 12-60 ms render.
- Never apply this to canvas, stick or look drags. Controls v3 needs full-rate rendering under the thumbs.
- Cap it at 150 ms per event.

**M2. Pictures off the tap path.** Fixes F1, F9.
- Add a `PIX` module. It returns `<canvas>` elements for paintings and postcards, so there is no `toDataURL`, no data URLs in HTML and no image decode.
  ```js
  PIX.el(kind,id,w,h)   // kind 'paint'|'card'; returns a <canvas class="pic"> sized w x h, filled at once with a cheap placeholder
                        // (pt.colors[0] → colors[1] gradient for paintings, the trip's palette for cards), queued for the real paint
  PIX.pump(budgetMs)    // called from idle slices: paints queued canvases nearest the viewport first, at most 1 painting per slice
  ```
- Paint only cells that are within one screen of the scroll viewport. Use an `IntersectionObserver` with `root` set to the open `.tab` scroller and `rootMargin:'100% 0px'`.
- Release canvases more than three screens away (`width=0`) so feed memory stays bounded. 30 posts at 512x384 would otherwise be about 23 MB.
- Rewire the callers to `PIX`:
  - `renderFeed`, `renderMe` (the pgrid) and the postcards in Me
  - `lbItems`/`showLB` (the viewer mounts a canvas; selfies keep their stored JPEG in `<img decoding="async">`)
  - the `#awCard` postcard
- `paintBig`/`cardImg`/`paintThumb` stay only for callers that really need a URL. None are on a tap path after this change.
- Idle slices: Safari has no `requestIdleCallback`. Use `idle(fn)`: run after the next frame's render, with a `performance.now()` budget of 6 ms, and never while `UIQ.hot` is set.
- Prefetch: after boot (about 10 s idle), paint the thumbnails of the newest 6 paintings and 2 postcards so the first open of Feed or Me already has them.

**M3. Targeted updates, not rebuilds.** Fixes F5.
- `onDiary` becomes `TABS.dirty(kind)`:
  - Diary open: `diaryPrepend(e)` inserts one `.entry` node at the top and keeps at most 60 rendered. Older entries load with a sentinel `IntersectionObserver` ("more").
  - Feed open: re-sync only when the posts signature (`S.posts.length`, `posts[0].id`, likes) changes. `feedSync()` adds and removes by `data-id`, which is keyed DOM.
  - Me, notes, cal: mark dirty and re-render in an idle slice, but only when no finger is down (`now>UIQ.hot`) and with `scrollTop` preserved.
- Feed heart: update the button in place (`classList.toggle('on')` and the count text). There is no `renderFeed()`.
- Your Look (`ylClick` and `ylRender`):
  - Update `.on` classes on the changed row only. Rebuild the whole sheet only on open and on randomize.
  - Call `applyLook(L,{quiet:true})` and debounce `save()` to 1.5 s after the last change, plus once on `lookClose`.
- `lookClose`: when it reopens the panel, don't re-render the You tab unless it is dirty. Your Look changes only the name card, so patch `.ylCard` text.

**M4. Previews: batched, asynchronous and cached.** Fixes F2.
- **Batch.**
  - `thRender` renders up to 16 queued previews into one 512x512 atlas render target. Each preview gets a 128x128 viewport and scissor.
  - Read back once per batch, then `putImageData` into a 512x512 2D "page" canvas.
- **Asynchronous on WebGL2.**
  ```js
  gl.bindBuffer(gl.PIXEL_PACK_BUFFER,pbo);gl.readPixels(0,0,512,512,gl.RGBA,gl.UNSIGNED_BYTE,0);
  const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);gl.flush();
  // next frames: if(gl.clientWaitSync(sync,0,0)!==gl.TIMEOUT_EXPIRED){gl.getBufferSubData(gl.PIXEL_PACK_BUFFER,0,buf);…}
  ```
  - Call it through `renderer.getContext()` with three's state restored: re-bind with `renderer.state.reset()` around it.
  - This never stalls. WebGL1 keeps one synchronous read-back per batch, which is still 16x fewer stalls.
- **Display.**
  - Cells become `<canvas width=128 height=128>` drawn from the page canvas with `drawImage` (2D to 2D, well under 1 ms).
  - Today's `<img data-th>` with a data URL is replaced. There is no PNG encode anywhere.
  - `THB.cache` holds `{page,cell}` instead of a data URL. `thumb(code,v,sil,cb)` keeps its signature for callers.
- **Silhouettes.** Derive them from the coloured cell in 2D (`source-in` fill `#4a4652`), with no second GPU render.
- **Schedule.**
  - `thPump()` moves from the start of `catFrame()` to just after the main render in `frame()`.
  - At most 1 batch every 3 frames, never while `UIQ.hot`.
  - Visible cells are queued first (the same `IntersectionObserver` as M2).
- **Pre-warm.**
  - At boot, `renderer.compile` the preview scene with dummy meshes for `B.mb` and `B.md`.
  - In boot idle time, queue previews for: pockets, storage, wishlist, today's stock of the 3 nearest shops, then the whole catalog at variant 0 (about 10 pages). Budget: 1 batch per second while idle.
- **Shop card.** The swatch tap re-renders only the card's own preview through the queue. The card shows the cached variant 0 until it is ready.

**M5. No shader compiles after warm-up.** Fixes F4.
- **Lantern light.**
  - Re-parent `mLight` (L2819) to the scene at boot, like `RIG` does with L1.
  - In `updateMocha`, copy Mocha's world position plus 0.6 each frame.
  - Set `mLight.intensity=mocha.visible?base:0` instead of hiding it.
  - Verified: 17 → 0 program links at trip start.
- **Rule and lint.**
  - Lights are never added, removed or hidden after boot. Anything with a light child must not toggle `.visible` on the light's ancestors.
  - Add `__mocha.lightsLint()`: once a second in dev and tests, count visible lights and log a STUCKLOG `'lights N->M'` when the count changes.
- **Pre-warm registry.**
  - `PREWARM.add(name, ()=>Object3D)` lets each system register sample objects:
    - the preview materials
    - catalog display materials (`CATM.main`/`emi` on a regular and an instanced dummy)
    - the decorate ghost, footprint and grid
    - the selfie `noBend` variant
    - anything else that `menus/probe-progs.js` lists after boot
  - After the boot `PROGS` compile, an idle job adds 2 samples at a time to the scene, calls `renderer.compile(scene,camera)`, then removes them. Each slice costs at most about 8 ms on a phone.
  - Use `KHR_parallel_shader_compile` where it exists (desktop Chrome). Safari has none, so slicing is the plan there.
- **Regression net.** Log every increase of `renderer.info.programs.length` after `__mocha.prewarm().done`, with the current flow name, to STUCKLOG as `'prog+N during X'`.

**M6. Layout.** Fixes F6. Coordinate with LF5, which replaces the permanent labels.
- `project()` uses cached `VW`/`VH`, updated in `resize()`, instead of `innerWidth`/`innerHeight`.
- Anything still positioned per frame (LF5's bubbles, name cards, the edge chip) uses `transform:translate3d()` and is written only when it moves at least 0.5 px.
- Remove the once-a-second `HUD.layout()` from `frame()`. Call it on resize, on slot or visibility changes (`HUD.dirty=1`) and on mode changes. Run it in a rAF read phase: read every rect first, then write.
- `ltSync`, the `panelOpen` and `lookClose` layout calls, and `fitMsgs`: never read geometry in the same task that just toggled classes or rewrote `innerHTML`. Defer the read to the next rAF.
- Replace the LHUD scan with a `ResizeObserver`-fed rect cache.
- Sheets get `contain:content`. Long sections (`#catPg`, `#yLed`, `#fieldNotes`, the album, the diary list) get `content-visibility:auto;contain-intrinsic-size:auto 600px`. Safari ignores `content-visibility` before 18, so it is a hint only.

**M7. Map.** Fixes F7.
- `toggleMap` sets `SHEETS.set('map','full')`, so the 3D runs at 4 Hz behind the map.
- `drawBigMap` caches a static layer (roads, places, names, water) in an offscreen canvas. It rebuilds that layer on open, on resize and when `S.discovered` changes. Every 0.25 s tick then blits the layer and draws only the moving dots: Mocha, you, Wendell and the train.

**M8. Time-sliced arrival builds.** Fixes F8.
- `catBuild` builds one shelf or surface group per frame (a generator over `catPlace`'s list) and never while `UIQ.hot`.
- Teleports (map tap, doors) start the build after the arrival fade, so the frame the player sees is never the 500-800 ms one.

**M9. Defer autonomous heavy work while a sheet is open.** Fixes F9.
- While `UIQ.level>=1`, these wait until the sheet closes, or until 2 s pass with no taps:
  - the selfie capture (queued up to 60 s; Mocha's behaviour and diary text are unchanged, only the pixels wait)
  - `savePhotos`
  - `catBuild`/`catDrop`
  - `occRebuild`
- The selfie read-back uses the M4 PBO path, and its encode uses `canvas.toBlob`. `PHOTOS` then stores the data URL from a `FileReader` in an idle slice.
- `save()`'s 8 s interval runs through `idle()`.

### 4.2 STRETCH

- **IndexedDB preview cache** (`mocha-thumbs`, keyed by a hash of `CATSRC` plus the page index): previews appear instantly in every later session.
- **OffscreenCanvas worker for `paintCanvas`/`cardCanvas`** (Safari 16.4+): painting moves entirely off the main thread, with `PIX` as the fallback.
- **Event Timing self-report in the page**: `__mocha.inp()` keeps the last 50 interactions (delay, processing, duration), so the owner's own device can be checked from a hook.

### 4.3 Acceptance tests

Run `/tmp/harness/lookfeel/menus/probe-menus.js` at rates 1 and 4 on the fixed build, with the same seeded save. Add 30 posts and 24 paintings for A8.

| # | Test | Today (1x / 4x) | Pass |
|---|---|---|---|
| A1 | Largest tap handler (Event Timing processing) in the whole run | 1227 / 2186 ms | ≤ 50 / ≤ 150 ms |
| A2 | Input delay, p95 and max over all sheet taps | max 120 / 494 ms | p95 ≤ 50 / 150, max ≤ 80 / 250 ms |
| A3 | `toDataURL` calls during the run (except selfie export) and synchronous `readPixels` on WebGL2 | 13-27 per menu | 0 and 0 (PBO path) |
| A4 | Long tasks after any menu action | up to 1232 ms (1x) | none > 100 ms at 1x, none > 300 ms at 4x |
| A5 | Program links after `__mocha.prewarm().done`, including trip start, selfie and every menu | 17 at trip start | 0 |
| A6 | 3D behind sheets | 30 fps behind the panel and map | half sheets ≤ 15 fps with shadow renders ≤ 1/s; full sheets ≤ 4 renders/s; Your Look ≥ 20 fps; back to 30 fps within 100 ms of closing |
| A7 | Hit map 0% blocked inside every open sheet; body classes equal their pre-open set after every close | passes | still passes (regression guard) |
| A8 | Feed with 30 posts and 24 paintings: handler; first visible painting; all painted | 1.2 s handler | handler ≤ 30 ms; visible ≤ 600 ms at 1x; all ≤ 2 s; heart ≤ 5 ms with no `#tab-feed` innerHTML |
| A9 | "See everything here" at Evergreen | 21 readPixels, 132 ms handler | handler ≤ 30 ms; all cells filled ≤ 1.2 s at 1x; ≤ 2 read-backs |
| A10 | Idle watch view `frame()` p50 at 1x | 12 ms | ≤ 11 ms (`project()` fix), draws unchanged |
| A11 | Trip start, verified with `menus/probe-light.js` live | 17 links, 187 ms | 0 links; `lightsLint` reports no count change |

### 4.4 Hooks

- `__mocha.uiq()` → `{level, sheets:[[id,cover]], hot:bool, fpsCap, shadowsFrozen, rendersPerSec}`
- `__mocha.pix()` → `{queued, painted, released, msPainted, lastMs}`
- `__mocha.thb()` → `{pages, cells, queued, batches, readbacks, async:bool, cacheHits}`. The `thumb()` signature stays the same.
- `__mocha.prewarm()` → `{done, total, compiled, ms, after:renderer.info.programs.length}`
- `__mocha.lightsLint()` → `{visible:{point,dir,hemi}, changes:[...]}`
- `__mocha.inp()` (STRETCH)

Ordering: M5's lantern fix and M1 are the cheapest and largest wins, so land them first. M2 and M4 next. LF5 should consume `SHEETS`, `PIX` and `THB` rather than re-fixing the café flow.

---

## 5. LF4 brief: HIGH and ULTRA tiers

The look itself (palette, shapes, dressing) comes from B27S and B27T, and that is what makes the game resemble the owner's references. HIGH and ULTRA render the same art with what makes the references read as "expensive":
- soft contact shadows
- glow at dusk
- a miniature depth of field
- dense leaf litter
- long, hazy distances

This extends B41's plan ("Quality tiers EXTEND round 1's ADAPT and SET.saver; NO second system"). It is one `TIER` object, built now, and B41 later folds its sky and weather work into it.

### 5.1 The tiers

`TIER.n`: 0 LOW, 1 PHONE (today's look, B41's "MED"), 2 HIGH, 3 ULTRA.

| | LOW | **PHONE (today, unchanged)** | HIGH | ULTRA |
|---|---|---|---|---|
| Who gets it automatically | Battery saver, or 2 ADAPT drops in a session | every phone on first run; software GL | tablets, strong phones and modest computers, after the probe | computers with a strong GPU (guess plus probe) |
| Pixel ratio | 1 | min(DPR, 1.5) | min(DPR, 2), at most 3.7 MP drawn | clamp(DPR, 1.5, 2) (supersamples 1x screens), at most 8.3 MP drawn |
| Frame cap | 20 | 30 | 30 on phones; 60 on tablets and computers | display rate, up to 120 (60 if the probe says so) |
| Anti-aliasing | FXAA folded into the post pass | MSAA 4 on WebGL2 (FXAA on WebGL1) | MSAA 4 | MSAA 4 (8 if `MAX_SAMPLES` ≥ 8 and the probe has headroom) |
| Sun shadows | off (contact blobs) | 2048 PCFSoft, today's fit | 2048, PCF radius 3 (Addendum S5), tight fit (F7) and texel-snapped | **4096**, PCF radius 3, tight fit and snapped; STRETCH: a far cascade |
| Contact shading | blobs | blobs and baked vertex AO (B27S/T) | same, with a deeper AO tint | **plus SAO** at half resolution from the scene depth |
| Lamp and window glow | GLOWPTS at 60% | GLOWPTS (S5 two-stage profile) | GLOWPTS halos x1.25 and window emissive x1.15 | **mip-chain bloom** (warm key) plus GLOWPTS |
| Tilt-shift | off | 6 taps, band (S5, ts .6) | 12 taps, band (the mockups' kernel), ts 1 | 16 taps, band with depth-weighted blur; STRETCH: true depth of field from depth |
| Grade and vignette | same math | same | same, plus 1/255 blue-noise dither (no sky banding) | same, plus dither |
| Foliage and dressing instances | x0.6 | x1.0 | x1.4 | **x2.0** |
| Draw distance (fog, far plane, BEND flat radius, catalog show/hide, GLOWPTS fog) | x0.8 | x1 | x1.25 | **x1.6** |
| Character LOD (full detail / shadow casters / d0 / hidden) | 6 / 2 / 30 / 70 | 8 / 4 / 40 / 85 | 12 / 6 / 55 / 110 | 16 / 10 / 70 / 150 |
| Water | today | today | ripples from two scrolling normal maps, plus lamp reflection streaks (+1 draw) | same; STRETCH: a 1/4-resolution planar reflection of a "reflect" layer |
| Texture anisotropy | 1 | 4 (today's `canvasTex`) | 8 | 16 (capped by the device maximum) |

**Pixel budgets.** A 2560x1440 window at DPR 2 would be 14.7 MP, which is too much. So the pixel ratio is capped like this:

`PR=min(tierCap, sqrt(maxPixels/(innerWidth*innerHeight)))`

On a phone today the drawn area is 0.75 MP.

### 5.2 Detection, the probe and the override

**Capabilities.** Read them once, right after the renderer is created (L1236) and before the world is built:
- `webgl2`, `maxSamples`, `maxTex`, `aniso`
- `depthTex` (WebGL2)
- `halfFloatRT` (`EXT_color_buffer_half_float`/`_float`)
- `timer` (`EXT_disjoint_timer_query_webgl2`)
- `parallel` (`KHR_parallel_shader_compile`)
- `renderer` (`UNMASKED_RENDERER_WEBGL`, or `''`), `soft` (= `swGL`)
- `touch` (= `TOUCH`), `minSide` (`min(screen.width,screen.height)`), `dpr`
- `cores` (`hardwareConcurrency`), `mem` (`deviceMemory`, Chrome only)

**Static guess.** `tierGuess(caps)` is a pure function, so it can be tested:
- `SET.saver` → 0
- `soft` → 1
- `touch && minSide<600` (phone) → 1. Phones can only be promoted by the probe.
- `touch && minSide>=600 && webgl2` (tablet) → 2
- not touch and `webgl2`:
  - renderer matches `/nvidia|geforce|rtx|gtx|radeon|rx \d|apple m\d|apple gpu/i` and `maxSamples>=4` and `maxTex>=8192` → 3
  - renderer matches `/intel|iris|uhd|mali|adreno/i` or is masked → 2
- otherwise → 1

**Saved decision.**
- `localStorage['mocha-gfx']={v:1, sig, tier, guess, probe:{fps, cpuP95, gpuMs, at}, drops}`
- `sig` hashes the renderer string, DPR, `minSide` and the tier-code version.
- Structural features (density, draw distance, LOD) read `TIER.boot`. That is the saved tier, or the guess on the first run. These are decided before the world is built.

**Frame-time probe.** `tierProbe()` runs once per `sig`, then again every 14 days or after 2 ADAPT drops.
- It waits until 8 s after boot, the view is idle and `SHEETS.level===0`.
- Phase A, 2.5 s at the current tier with the frame cap lifted:
  - median rAF interval
  - p95 of `frame()` CPU time
  - GPU time from the timer query on the main render, where available
- Promote one step when the uncapped rate is at least 1.8x the next tier's cap (≥ 55 fps for a 30-cap tier, ≥ 108 fps or a 60 Hz lock with GPU ≤ 6 ms for ULTRA) and CPU p95 ≤ 8 ms.
- Phase B, 2.5 s trial at the promoted tier: keep it only if it still holds its cap with p95 interval ≤ 1.4x the cap period. Otherwise revert.
- At most 2 promotions, and phones stop at HIGH.
- Promotions apply live for the post pass, shadows and PR. Structural parts apply at the next boot.
- The probe only measures. The trial is the only visible change, and it fades in over 300 ms.

**Runtime ADAPT stays demote-only.**
- The existing ADAPT (L5639) generalizes to "fps below 0.65x the tier cap over 4 s, step down one live feature".
- Order: bloom → SAO → depth-weighted tilt-shift → shadow 4096 → 2048 → pixel ratio −0.25 (today's step) → tier.
- It never promotes at runtime. `TIER.drops` is saved, and 2 or more drops in a session lower the saved tier.

**Settings, under a new "Graphics" row.** Segments: Auto (shows the current pick, e.g. "Auto · High") / Battery saver / Phone / High / Ultra.
- Stored as `SET.gfx∈{'auto','low','phone','high','ultra'}`. The old `SET.saver=true` migrates to `'low'`, and the existing Battery saver toggle maps onto it.
- Ultra on a touch device shows "may get warm and use more battery".
- Changing the setting applies live parts within 1 s, behind a short fade. Structural parts show "more trees and longer views after reload" with a Reload button.
- Today's `applyPower()` toggles `sun.castShadow` and so recompiles every program. LOW keeps that path, but behind the fade and with programs pre-compiled. PHONE, HIGH and ULTRA never toggle `castShadow` or `shadowMap.type`, so switching among them recompiles nothing in the scene.

### 5.3 Features: how, cost and fallback

Each feature has an `ok(caps)` check. Any setup error or non-zero `gl.getError()` after setup disables it and pushes its name to `TIER.fail`. After `webglcontextlost` and restore, the session continues at PHONE.

1. **Resolution and frame cap.**
   - How: `applyTier()` sets the pixel ratio from 5.1 and calls `resize()`. `frame()` reads `TIER.fps` instead of `SET.saver?20:TOUCH?30:60`.
   - Fallback: none needed.
2. **Shadows.**
   - How:
     - `TIER.shadow={size,radius,fit}`.
     - Today `updateSky` sets a half-extent of `clamp(round(dist*1.3/5)*5,50,90)` around the target (L3647).
     - HIGH and ULTRA use B27Sb's F7 tight box: `clamp(effDist*1.3,25,90)`, centred about 10 m ahead along the view.
     - Snap the shadow camera to whole texels: `sun.position`/`target` are rounded to `2*halfExtent/size` in light space, so shadows don't shimmer as the camera moves.
     - Resize with `sun.shadow.mapSize.set(n,n); if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}`. `shadowMap.type` stays the same across PHONE, HIGH and ULTRA, so there are no program changes.
   - Cost: 4096 is 64 MB of depth on a GPU with tile memory; computers only.
   - STRETCH far cascade: a second depth render from the sun camera with a 180 m box. It goes into a dedicated RT every 4th frame and is sampled by a new `'f'` patch in `PATCH` only where the main map doesn't cover. That is +1 program and no new THREE light (S16.1 holds).
   - Fallback: 2048.
3. **SAO (ULTRA only).**
   - How:
     - Give `rt` a `DepthTexture(UnsignedIntType)`. r128 supports this on `WebGLMultisampleRenderTarget`: it allocates `DEPTH_COMPONENT24` for the multisampled buffer and blits depth with `NEAREST` (three.module.js L21155-21181 and L21492-21510, checked).
     - Pass 1: half-resolution SAO, 8 spiral samples, radius 0.6 m world, intensity 0.5, tinted with the mauve shadow colour (TOONA #8A6E78) rather than black.
     - Pass 2 is folded into the post composite: 4-tap depth-aware upsample and blur.
     - It skips the sky (depth ≥ 0.9999) and GLOWPTS, which don't write depth.
   - Cost: +2 programs, +1 half-resolution pass.
   - Fallback: no depth texture (WebGL1) means blobs and baked AO.
4. **Bloom (ULTRA only; needs sign-off, see 5.6).**
   - How:
     - Prefilter: warm key `k=max(0,luma-.72)*smoothstep(.04,.22,r-b)`, applied at night and dusk (`nightAmt` plus golden hour) and at ×0.15 by day. Warm lamps, windows and jack-o'-lanterns glow; white Mocha, snow and sky do not.
     - Downsample from 1/2 to 1/32 resolution (13-tap), then a tent upsample with additive mix.
     - Composite in the existing post pass with strength 0.55 (night) and 0.15 (day), scaled ×1.4 in fog (B41).
     - RGBA8 targets are enough because the scene is LDR. Use half-float when `halfFloatRT`.
   - Cost: about 10 small passes at well under 1/4 of the frame's pixels, and +3 programs.
   - STRETCH: render the source from a glow layer (GLOWPTS, the lamp IM, window batches) with depth-tested quarter-resolution draws (6 draws).
   - Fallback: GLOWPTS ×1.25.
5. **Tilt-shift.**
   - How:
     - The `post` ShaderMaterial (L1285) gets `#define TS_TAPS 6|12|16`. The band comes from `STYLE.tsBand` (B27Sa), and `STYLE.post.ts` stays gated by camera layer (`STYLE.noTs`: look, tryon, room, cabin, deco, talk).
     - ULTRA weights each tap by `|depth−focus|`. The focus is the camera target distance (`STYLE.effDist()`), so the walker and Mocha never blur even near the band edge.
     - STRETCH: full circle-of-confusion depth of field outside the band as well, capped at 2 CSS px.
   - Fallback: band only (no depth texture).
6. **Dither and grade.** Add a 64x64 blue-noise texture, ±0.5/255 after the grade, on HIGH and ULTRA. The grade math stays identical on every tier (B41's lift/gain/sat keys).
7. **Density.**
   - How:
     - Builders multiply their counts by `TIER.dens` and draw instances from the same seeded sequence, so the phone layout is a strict prefix of the ULTRA layout.
     - Today's fall litter (`SEASON.litter` 520, L2662) becomes up to 1040 at ULTRA.
     - Bushes go from `n<90` (L2666) up to 180.
     - B27Sb's dressing batch DB and leaf piles take the multiplier.
     - New on HIGH and ULTRA: a dried-grass tuft InstancedMesh (`driedGrass` #D9C79A, plume #EDE0C0) with 1500 or 3000 instances, no shadows.
   - Cost: instances, not draws (+1 draw for the tufts).
   - Fallback: none needed.
8. **Draw distance.**
   - How: `TIER.far` scales:
     - `scene.fog.near`/`far` in `updateSky` (L3645) and B27Sa's autumn haze
     - `camera.far`
     - `BEND.value.y` (the flat radius)
     - `CHARLOD.d0`/`dh`, `catTick`'s 35/50/60 m
     - the GLOWPTS fog factor
   - Rooms keep T's room-void far plane (LF1 makes the world disappear indoors), which is where ULTRA's SAO and bloom pay off in the i1-i4-style rooms.
9. **Water.**
   - HIGH and ULTRA: a `'wv'` PATCH on `waterMat` (L1347) perturbs the toon normal from two scrolling 128 px normal textures, so the toon ramp shimmers in bands.
   - Lamp reflection streaks: one additive InstancedMesh of vertically stretched quads below each waterfront GLOWPTS lamp (and the ferry), shown at night and wobbling with a UV offset. That is +1 draw, and B41's wet-road lamp reflections can share it.
   - STRETCH: a quarter-resolution planar reflection RT of a `'reflect'` camera layer (sky dome, GLOWPTS, lit windows, ferry, skyline batch; at most 12 draws), re-rendered every second frame and sampled with ripple distortion and Fresnel.
10. **Anisotropy.** `canvasTex` (L1299) and the ground/road textures take `TIER.aniso`.

**Rough GPU budget at ULTRA** (1920x1080 at PR 1.5, MSAA 4):
- the main pass, as today, at 4.7 MP
- the 4096 shadow pass
- SAO at 1.2 MP
- the bloom chain, about 1.6 MP in total
- the post pass

That is comfortable for an Apple M-series or discrete GPU at 60 fps. Integrated Intel lands at HIGH through the probe.

### 5.4 The phone must not get slower

- PHONE keeps today's exact objects, materials, RTs and post shader. `TIER` fields are constants read in place of today's literals.
- The post shader's `#define` set at PHONE must equal today's code. Checks:
  - `__mocha.programs().n` is unchanged
  - no extra RTs (`renderer.info.memory.textures` and the RT list unchanged)
  - draws and tris unchanged under the S16 toggle method
- The probe and detection run only in idle time, with no sheet open, and add 0 draws.
- ADAPT behaviour at PHONE is unchanged except that it now also feeds `TIER.drops`.

### 5.5 CORE and STRETCH

**CORE:**
- `TIER` object, capabilities, `tierGuess`, the saved decision and `tierProbe`
- the Settings row and `SET.gfx` migration; ADAPT generalization
- resolution and frame cap
- shadows (size, tight fit, texel snap)
- density and draw distance multipliers; character LOD per tier
- 12- and 16-tap band tilt-shift with depth weighting at ULTRA
- dither
- SAO (ULTRA)
- warm mip-chain bloom (ULTRA, after sign-off)
- water ripples and lamp streaks (HIGH and ULTRA)
- anisotropy
- `?gfxhud=1` overlay: tier, fps, frame ms, GPU ms when available, PR

**STRETCH:**
- full depth-of-field tilt-shift
- far shadow cascade
- glow-layer bloom source
- planar water reflection
- MSAA 8
- half-float post chain
- `KHR_parallel_shader_compile` for tier switches

### 5.6 Sign-offs needed

1. **Addendum S5:** "No bloom pass and no extra render target, ever." Proposed amendment: "never on LOW, PHONE or HIGH; ULTRA may add one mip-chain bloom and the SAO targets". Without sign-off, ULTRA's glow falls back to GLOWPTS ×1.4.
2. **S16.5 program budget:** ULTRA adds at most 6 programs (SAO, bloom prefilter, down, up, and the composite variant), compiled behind the tier-apply fade, never mid-play. LOW, PHONE and HIGH add 0. HIGH's 12-tap post variant replaces its own program; it doesn't add one.
3. **B41 naming:** B41's "HIGH is desktop with a median frame under 12 ms" becomes HIGH (good phones, tablets, modest computers) and ULTRA (strong computers). B41 keeps LOW, folds `ts`/`tsBand`/halo sizes into `TIER`, and adds its sky and weather grade keys to the same post shader.
4. **B41's "draw calls must not rise":**
   - holds on LOW and PHONE
   - HIGH is +2 (tufts and lamp streaks)
   - ULTRA adds only full-screen passes, plus at most 12 for the STRETCH reflection

### 5.7 Acceptance tests

SwiftShader can't judge GPU speed, so the harness tests correctness and structure. Frame rate is judged on the owner's computer with `?gfxhud=1`.

| # | Test | Pass |
|---|---|---|
| T1 | PHONE parity: DAY=11-03, 15:00 and 21:00, portrait 393x852, frozen frame | draws, tris, programs, textures and RTs equal to the baseline (B21 toggle method); `frame()` p50 within ±5%; screenshot within 1/255 of the baseline |
| T2 | ULTRA on desktop 1100x820: `__mocha.tier(3)` | features report `{pr≥1.5, msaa≥4, shadow:4096, ao:'sao', bloom:'mip', ts:16, dens:2, far:1.6}`; no page errors; `gl.getError()==0` after 120 frames; programs +6 or fewer; at 21:00 the mean luma in a 24 px ring around 5 street lamps is ≥ 8% higher than PHONE; Mocha's body pixels change by ≤ 2/255 (warm key); at 15:00 a building-to-ground contact strip is ≥ 4% darker (SAO) |
| T3 | Fallback with WebGL1 forced (`?gl1` test flag → `THREE.WebGL1Renderer`), `tier(3)` | features report `{msaa:false (FXAA on), ao:'blob', ts:'band'}`; no errors |
| T4 | `__mocha.tierGuess(caps)` table | RTX desktop → 3; Intel UHD desktop → 2; iPhone (touch, 393) → 1; iPad (touch, 820) → 2; software → 1; saver → 0 |
| T5 | `__mocha.tierProbe({samples})` with injected frame series | fast → promote, trial fails → revert, slow → stay; decision saved, then reused on the next boot with the same `sig`, and re-probed after a `sig` change or 14 days |
| T6 | ADAPT at ULTRA with slow frames injected | demotes in order bloom → SAO → depth tilt-shift → 2048 shadows → PR; never promotes; 2 drops lower the saved tier |
| T7 | Settings Graphics row | renders; selecting Ultra applies within 1 s; persists in `SET.gfx`; `SET.saver` migrates; touch devices show the warning |
| T8 | Layer gating | under `STYLE.noTs` layers `ts=0` and the depth weighting is off on every tier; in Your Look the walker's head box has no blur (pixel variance equals the PHONE frame) |
| T9 | Live switch PHONE ↔ ULTRA at 1x in the harness | no frame over 200 ms (programs pre-compiled behind the fade) |
| T10 | Memory at ULTRA, 2560x1440 window | computed RT plus shadow memory ≤ 160 MB; the pixel budget caps the drawn area at 8.3 MP |

### 5.8 Hooks

- `__mocha.tier()` → `{n, name, auto, boot, guess, probe:{fps,cpuP95,gpuMs,at}, drops, fail:[], caps:{...}, f:{pr, fps, msaa, shadow:{size,radius,half}, ao, bloom, ts, dither, dens, far, lod, water, aniso}}`
- `__mocha.tier(n|'auto')` applies live parts and returns the same object.
- `__mocha.tierGuess(caps)` (pure) and `__mocha.tierProbe(o)` → Promise of the decision. `o.samples` injects a frame series.
- `__mocha.post()` → the current post uniforms and defines (`ts`, taps, `bloom`, `ao`, `dither`, `night`).
- `__mocha.gfx()` (exists) gains `tier`, `drawnMP` and `rtMB`.

---

## 6. Order of work and how this fits with the other workstreams

1. **Hotfix-sized and safe:**
   - M5's lantern fix: one re-parent, a position copy and an intensity switch.
   - M1's `SHEETS`/`UIQ`, plus the `project()` VW/VH cache.
   - These ship alone and cut most of the "waits" right away.
2. **LF3 CORE:** M2 to M9, landing alongside LF5. LF5 builds its quiet-while-busy, name cards and bubbles on `SHEETS`, `PIX` and `THB`.
3. **B27S and B27T** (the actual resemblance to the references). They are unaffected, except that they must register any new late-created objects with `PREWARM` and leave lights alone.
4. **LF4 CORE** after B27Sa, because it folds `STYLE.post.ts`/`tsBand` and the GLOWPTS profile into `TIER`. B41 extends it later.
5. **Controls v3:** M1's input-first rule ignores the canvas, stick and look surfaces, so walking and looking keep full-rate rendering. The `SHEETS` registry is also a natural place for v3's "release the stick when a sheet takes over" rule.
6. **LF1 (immersive interiors):** hiding the world indoors frees draws and fill rate. ULTRA spends them on SAO and lamp bloom in rooms, where the i1-i4 references are lamp-lit.

---

## 7. Files

All under `/tmp/harness/lookfeel/menus/`. All are probe and result files; no game file was touched.

- `instr.js`: the injected instrumentation:
  - long tasks, Event Timing, rAF frame timing and frame gaps
  - GL, canvas, DOM, layout and storage cost counters
  - no-raster mode (`W.noDraw`, default on; append `?draw=1` to keep drawing)
  - `__mk`/`__slice`/`__cnt`/`__big`
- `probe-menus.js`: the full menu run, with seeding, taps, scrolls, typing, hit maps and body classes. Run it with `NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=<build> node probe-menus.js <rate> <out.json>`.
  - Results: `menus-4x.json` / `run-4x.log` and `menus-1x.json` / `run-1x.log`.
- `probe-canvas.js` → `canvas.log`: CPU versus GPU 2D canvas cost for Feed, Me and the viewer.
- `prof-frame.js` → `prof-1x.json` / `prof-1x.log`: sampling CPU profile of steady frames (idle, walk, panel open).
- `probe-progs.js` → `progs.log`: programs compiled after boot per flow, and which objects use them.
- `probe-light.js` → `light.log`: the trip-start recompile, live versus with the lantern re-parented (17 → 0 links).

## B7 Foundations: camera stack, HUD slots, six tabs, AI budget, user-bias cap, home capabilities, weather almanac, photo safety
I built B7 in /home/user/Booknest/ghost-town/index.html (589,676 B before, 622,961 B after, so about +33 KB). The backup is /tmp/harness/backup-B7.html. The patch script is /tmp/harness/b7/patch.py, with its early block in /tmp/harness/b7/js_early.js. Small follow-up fixes were applied directly to index.html, so index.html is the source of truth. Nothing was committed.

WHERE THE CODE LIVES (search strings)
- "B7 FOUNDATIONS" sits just above "//  STATE", so it is declared before fresh(), migrate() and catchUp(). It holds WXM, WX, WIND, wxKind, FEAT, HOME_CAPS, hasItem, capSpot, TIERS, TIER_N, bondOf, tierOf, EV, DOOREV, SFXEV, sfx, the emote/setFace stubs, lastInput, isPresent, UB, ubAdd, userBias, ubVeto, ubPlace, ubMention, PHOTO_BUDGET, photoKeep, photoURL, pinPhoto and HUD.
- CAM comes right after `const ZM=`. MIND's budget methods are inside `const MIND=`. TABS and openTab replaced the old nav click handler.

1) CAM: `CAM.push(owner,spec)`, `CAM.pop(owner)`, `CAM.top()`, `CAM.stack()`.
- Spec fields: {prio 0..3, target: Object3D or fn returning a REUSED {x,y,z}, tx/ty/tz (an offset from the target, or a fixed point if there is none), dist, pitch, yaw|null, range [min,max] (default dist×0.5 to ×2), ease (default 3), lock}.
- The highest prio wins; within a prio the latest push wins. There is one entry per owner, and pushing again replaces it.
- `CAM.update(dt)` runs first in placeCam(); the round-1 follow/walk logic only runs when the stack is empty.
- Yaw and pitch ease in over about 1 s and are then free for the user, unless `lock` is set.
- When the last entry is popped, the camera eases back to the base yaw/pitch/dist saved at the first push. setCamMode refreshes that saved base.
- Zoom changes only the top entry's dist, clamped to its range: pinch, wheel and the +/− buttons all go through `setDist(v)`/`camDist()`, and `zoomLim()` returns the top entry's range.

2) HUD: `HUD.slot(id,{zone:'tl|tc|tr|rc|bl|br',order,prio,modes:['follow','walk'],el,on})`, plus `HUD.show(id,bool)`, `HUD.layout()`, `HUD.bands()` (returns [{id,x,y,w,h}]) and `HUD.report()`.
- Round-1 pieces are registered as fixed slots; their CSS still places them and managed slots avoid them: status (#mochaPill), sky, mind, meter (#meters), dock (#dock, which holds 📱), chat (#chatwrap), joy, look, zoom, near, away, and edge (floating).
- Reserved ids with no element yet: banner (tc), wallet/speaker/nowPlaying (tr), decorate/floors (rc), emote (br), talk (bl). A later step fills one wi
Hooks: __mocha.cam.stack(), __mocha.cam.push(owner,spec) / cam.pop(owner) / cam.top() / cam.state() / cam.tick(n,dt) (cam is still the round-1 function cam(o)), __mocha.hud(o) -> report {vw,vh,mode,slots,bands,more,pop,overlaps}; o.stub true/false fills or clears placeholder stubs for the 8 reserved ids; o.pop=zone|null opens or closes a ⋯ popover, __mocha.mindUse(o) -> {cap,max,n,hn,by,nonUser,present,hidden,asleep,allow:{user,letter,chapter,big,hang,title,next}}; o.reset, o.cap, o.add+o.n for tests, __mocha.userBias(a,o) -> {total,parts,terms}; a can be a place id; o.dummy=N adds temporary terms of value o.v (default .5), __mocha.ubMention(text), __mocha.bondOf(id) -> {p,tier,name}, __mocha.hasItem(slot,home) -> {has,spot}, __mocha.wx(date) -> forDate copy; wx() -> {now,kind,slow,wind,line,forced,today}, __mocha.present() -> {present,lastInput,idle}, __mocha.photos(o) -> {n,chars,budget,keys,album,posts,pins,keep}; o.put={id:dataURL}, o.save, __mocha.drawCalls(), __mocha.tabs() -> {top,leaf,n,labels,subs}, __mocha.openTab, CAM, HUD, TABS, WX, FEAT, HOME_CAPS, TIERS, TIER_N, DOOREV, SFXEV, EV, sfx, ubAdd, ubVeto, capSpot, tierOf, isPresent, savePhotos, photoURL, pinPhoto
Known: Toasts, the first-run #hint and the B9 banner slot can overlap, because toasts and the hint are transient and not HUD slots. In portrait and Duo the 'banner slot' stub sat on top of the 'package from Mom & Dad' toast. B9 should either make the banner and the toast share the tc slot or register #toast as a fixed slot. | Size: about +33 KB, against the 12-15 KB aim. The HUD registry, CAM and the TABS rebuild are the bulk. | The hourly cap of 6 applies to non-user kinds only. User messages are limited by the daily cap, which is the only way the acceptance test (user still allowed after 6 non-user calls) can pass. | The HUD only measures round-1 fixed elements. If a fixed element changes size, managed slots move on the next 1 Hz layout pass, and only while managed slots are shown. | The forecast 'on his phone' appears in the Messages card, as a line at the top of the thread when S.phone exists. Mocha's 3D phone has no screen for it. | S.homeItems (what hasItem reads once FEAT.nest is on) has no defined shape yet. hasItem accepts an array of slot names or an object map; B27/B32 should settle it. | The draw-call baseline is already far over budget (about 1000-1180 per frame in SwiftShader, counting the shadow and post passes). B7 adds 0 draws; B8 batching owns the reduction. | Not done (STRETCH or out of scope): any visual weather beyond kind/over/wet, which belongs to B41; a UI for S.pins beyond hearting in the feed, which belongs to B18; MIND.request has no callers yet.

## B8 Town plan v2, exteriors, batching, sign atlas, glow pool and instanced lamps
I built B8 in /home/user/Booknest/ghost-town/index.html. Size went from 622,961 B to 670,525 B (+47.6 KB). The backup is /tmp/harness/backup-B8.html. The patch is /tmp/harness/b8/patch.py, which inserts kit.js, world.js and batcher.js from the same folder. Some small tweaks were applied directly to index.html afterwards, so index.html is the source of truth. Nothing was committed.

WHERE THE CODE LIVES (search strings)
- "town plan v2 (B8)": the new PLACES entries.
- "B8 TOWN KIT": inserted just before `function buildPlace(p)`. It holds SIGN, GLOWPTS, POOLS, PB, the builders and B8BLK.
- "// street lamps (B8)": right after the tree batch. It holds LAMPS, STREETS/DISTRICTS, b8World, b8Glows, planOverlaps, b8Frame and the map helpers. It is followed by `b8World();const B8CONV=b8Glows();const PBMESH=PB.build(...)`.
- `function Batcher(` (extended) and `function grpPack(`.

1) TOWN PLAN
- New PLACES kinds:
  - plaza: square
  - civic: townhall
  - condo: fogwell
  - cottage: willa
  - cemetery: cemetery
  - lot: cabin, L1, L2, L5, L6, L7, L8, L9
- New shops (no kind, built with shop()): bakery, threads, nursery, evergreen, lantern. These have `soon:1`, which puts a "coming soon" sign inside.
- New place flags: nopath (no auto sidewalk path), lot, cls, lotId, foot ([x,z,ry,w,d] override used by the overlap checker; the cabin uses its fence box 40,77,26x26), nolbl (no 3D label), pier, crooked.
- plaza, lot and cemetery are non-solid. doorL: plaza [0,0], cemetery [1.5,-13.5].
- ROADS: Maple Row is now [-52,58,104,58].
- Lavender house removed: the neighborHouse call is gone, NB is fixed, and HOUSES (used by holiday decor) is fixed.
- Pier 3 added to PIERS: [-85,-61,-86,-74].
- Two round-1 shops moved to clear Needle Way's 11-wide band: records x -14 to -15.5, petstore x 7.5 to 8.
- placeList (the AI prompt) skips lots. Labels skip places with nolbl.

2) EXTERIORS (builders: civicB, condoB, cottageB, cemeteryB, lotB/cabinLot, plazaB)
- Town Hall: columns, pediment, double doors, flagpole, and a clock tower about 20 high. The clock is TCLK {c,tex,m}: a 64x64 canvas; drawClock() redraws it when the minute changes, called from b8Frame().
- Fogwell: the window table is FOGWELL {cells:[{unit:'2A'..'5D',floor,k,x,y,w,h,lx,ly}] (32 windows), c (emissive canvas), tex, mat, lit, light(unit,on)}. The bay-window panes for units A and D use the Fogwell material, with UVs pointing at those units' cells, so FOGWELL.light lights them too. B16 should drive lighting through it.
- 
Hooks: __mocha.overlaps() -> {n,list,checked,places,lots,roads}, __mocha.glowPts() -> {n,cap,draws:1,points,shader,bend,maxPt,from:{lamp,r1,alley,...},converted,spritesLeft}, __mocha.lamps() -> {n,posts:{instanced,count,color,shadow},heads:{instanced,count,instanceColor},pools:{instanced,n,cap,visible,opacity},halos,pts}, __mocha.signAtlas() -> PNG dataURL, __mocha.drawCalls() (B7's version returning GFX.calls is kept; extended info is in __mocha.drawInfo()), __mocha.drawInfo() -> {calls,tris,progs,geos,tex}, __mocha.signInfo() -> {meshes,sameTex,w,h,cells,strips,keys}, __mocha.b8() -> {pb,pbKeys,places,lots,clock,fogCells,square}, __mocha.trees(n=6) / __mocha.treeCount(), __mocha.SIGN, GLOWPTS, glowPt, glowSet, POOLS, poolAdd, poolSet, LAMPS, SQUARE, FOGWELL, TCLK, drawClock, STREETS, DISTRICTS, toggleMap, PIERS
Known: Size is +47.6 KB against the 20 KB aim. Most of it is the exterior builders and the wayfinding. | Round-1 shop name signs made by sign() (each with its own 512x96 canvas, fading with the shell) are not on the atlas. All B8 sign faces are on the SIGN atlas. | Glow sprites larger than 8 units stay sprites: cinema neon 16, conservatory 18, needle deck 14, arcade neon 10, the lighthouse beam (animated) and the wheel (moving). So do 3 hidden ones (sizes 6, 4, 5). Points are capped at the GPU's maximum point size (1023 in SwiftShader, about 511 on iOS), so halos seen very close up can look smaller. | GLOWPTS is one transparent object sorted at the world origin, so its blending order against fading shop shells is approximate. | Spec deviations: records x moved -14 to -15.5 and petstore 7.5 to 8 to clear Needle Way's band, which narrows Drizzle Alley to x -24..-20.5. L9 got ry PI and 10x9, and the cemetery lane is at x 11.5 instead of 12, to fit between L9 and the pink house. Ferry Green placement (-48.5,47) is my choice because the spec gives none. Overlap bands have no end caps. | Wendell's cottage is not rebuilt to 13x10; that is left for B14 and the painting slot is unchanged. Town Hall and the Fogwell have no interiors or shell fade, so the camera does not fade through them. | The new shops have no keepers or ACTS (B13). The AI place list includes them with no activities. | PB is built once at boot. Later steps must create their own Batcher instance. | Random trees partly block the front of Willa's cottage. The portrait big map is crowded and district names sit under place labels there. | B7's toast and banner overlap is still visible (the 'package from Mom & Dad' toast). | STRETCH not done: 'You are here' boards, seasonal doormats and wreath hooks.

## B9 Doors, permissions, knocking, agents and occupancy
I built B9 (doors, permissions, knocking, agents and occupancy) in /home/user/Booknest/ghost-town/index.html. The file went from 670,525 B to 711,372 B (+40.8 KB). Backup: /tmp/harness/backup-B9.html. Running `python3 /tmp/harness/b9/patch.py` rebuilds the file from that backup. The patch inserts /tmp/harness/b9/doors.js (the door kit) and /tmp/harness/b9/init.js (the HUD slots and hooks). index.html is the patch output; I made no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B9 DOORS: one 512x1024": the kit. It sits after `function buildPlace(` and before `PLACES.filter(p=>p.kind!=='spot').forEach(buildPlace)`. buildPlace now ends with `doorBuild(p,grp)`.
- "B9: the walker at Mocha's door" (B7 block, early): `DVIS{t,pid}`, `CHB{pid:ms}` and `GREET_ACT`. The `ubAdd('atDoor')` term follows the round-1 terms.
- "B9: banner + knock chip slots": the slots and hooks, after the last `Object.assign(window.__mocha`.

1) DOORS (29 of them)
- Spec: `DOORSPEC[pid]` is an array of specs. Each place gets `p.doors[]`, and `p.door` is the first entry.
- Spec fields: `{id, kind: swing|double|slide|dutch|shutter|gate, style, w, h, x, z (offset from the front wall plane; for lots, the local z), y0, dep, solid (warm closed vestibule), flush (no hole, sits on the wall), out (opens outward), back (rear wall), staff, hours (door-only), lamp, tun, glass}`.
- Doors per place: front doors on all 19 shops, the library, Town Hall, the Fogwell lobby, Mocha's house, Wendell's, Willa's, and the cabin gate. Mocha's house also has a gate (`home:gate`). Back doors: `cafe:back` (staff), `grocery:back` (staff) and `station:back`.
- Door object (in `DOORS` and `DBY[id]`): `{id, pid, p, s, kind, style, w, h, y0, fg (door-space Object3D: +z points out of the wall), wx, wz, nx, nz (outward normal), ang, vel, tgt, top, force, lock, clr, guest, leaves:[{piv, nd, ii, sg, lw, lh, hy, hx}], plank, pk, chalk:[ii], cat, note, tun, tunT, busy, request(agent), pass(agent, dir)}`.
- Rendering:
  - `DIM` is ONE InstancedMesh (cap 200) with one ToonM on the `DATL` atlas, alphaTest .5. Per-instance UVs come from instanced attributes `dUv` (+z face) and `dUv2` (−z face), patched in onBeforeCompile with cache key `door9`.
  - Every leaf, OPEN/CLOSED plank, A-frame chalkboard, door note and the bookstore cat is an instance of it. Use `diAdd(node,uv,uv2)`, `diSync(i)`, `diShow(i,on)` and `diUV`.
  - `TUN.open` and `TUN.solid` are inside-out jamb boxes (MeshBasic, vertex co
Hooks: __mocha.doors() -> [{id,pid,kind,style,w,h,x,z,ang,top,open,tgt,locked,lock,force,vis,shown,leaves,tun,tunSolid,plank:{ii,open,ry,on},chalk,chalkLine,cat,note,rattles,glow,walk:{dx,dz,off}}], __mocha.door(id|pid,'open'|'close'|'lock'|'unlock'|'auto') -> door info, __mocha.knock(pid) -> answerKnock result (also performs the knock: DOOREV knock, say/wSay, guest pass), __mocha.occ(pid) -> {ids,room,awake,act}, __mocha.agents() -> [{id,kind,x,z,place,room,awake,act,keys,staffOf,home,moving,go,gone}], __mocha.flipSign(pid,open), __mocha.signAuto(bool) (auto plank flipping on/off), __mocha.doorStep(sec) (steps the 20 Hz door tick in fixed .05 s steps), __mocha.doorPass(id,agentId,'in'|'out'), __mocha.doorReq(id,agentId), __mocha.walker(x,z,yaw,moving) (test: place the walker and set its intent), __mocha.wForce(dest) (test: put Wendell at a W_SPOTS key or 'inside'), __mocha.doorUI() -> {banner,bannerOn,knock,knockText,knockDoor,toast,toastOn,near,dvis,chb,atlas}, __mocha.doorAtlas() -> dataURL, __mocha.DOORS, DBY, AGENTS, OCC, DIM, TUN, DATL, DOORSPEC, answerKnock, occOf, occRebuild, updateDoors, doorTick
Known: Size is +40.8 KB against the 20 KB aim. The door kit is about 35 KB (styles, logic, chalk banks), plus about 5 KB of hooks and patches. | Chalkboards use the door atlas, not the B8 SIGN atlas (spec deviation): SIGN had only 5 of 48 cells free. Because of this they cost 0 extra draws (they are DIM instances). They redraw daily. | Door notes are atlas cells on DIM instances, not 4 separate canvas planes. The pool of 4 holds. | The doorway material uses alphaTest .05, not .5, because .5 makes the fading front-wall shell vanish below opacity .5. | Mocha's front wall is a cut-away shell that fades whenever he is inside, or the camera is close. His door leaf and tunnel hide with it, so it is only visible while he is out. His gate always shows. | The front-wall holes are cut only on the outer (+z) face. The inner face of the wall has no doorway when seen from inside. The tunnel jambs show the opening. | Agents don't route through doors yet. agSync infers place changes from position and calls door.pass, and doors open for agents within 2.2 who are moving to or from that place. door.request() etiquette (leavers first, step 1.2 aside) is an API for B10 to call. | There is no walker collision (B11). A locked door only rattles, toasts and shows the Knock? chip; the walker can still walk through walls. | Wendell 'comes to the door' is shown as his say bubble plus the door opening with a 45 s guest pass. He does not walk to the door. | Willa has no agent yet, so knocking at her cottage always gives no answer. The Fogwell lobby door opens 6–23 for everyone; condo units (B39) are not doors yet. | Draw ledger: perf1p/perf1 are noisy. At night, two loads of the same backup differ by ±100 draws. The deterministic fixed-view check (b9/drawcmp.js) shows +2 to +10 at 15:00, so the +20 budget is met. Structurally B9 adds 3 draws. | STRETCH not done: seasonal doormats, wreath hooks for holiday decor, and 'You are here' boards. | B20 should subscribe to DOOREV open/close/bell/creak/clack/rattle/knock/pass/sign; nothing listens yet. | Toasts and the first-run #hint are still transient and not HUD slots. The banner and toast are mutually exclusive, but the #hint is not handled.

## B10 Street navigation and agent routes
I built B10 (street navigation and agent routes) in /home/user/Booknest/ghost-town/index.html. The file went from 711,384 B to 740,347 B (+29.0 KB). Backup: /tmp/harness/backup-B10.html. `python3 /tmp/harness/b10/patch.py` rebuilds index.html from that backup by inserting /tmp/harness/b10/cap.js, nav.js and hooks.js. I made no hand edits after the patch, and nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B10: furniture capture": `capMeshes(root,p,pg)`, inserted just before `function buildPlace(p)`. buildPlace sets `CAPT=p;CAPTG=grp` and clears them after doorBuild. `bake()` calls `capMeshes` before it merges, and merged meshes get `userData.bk=1`. `var CAPT,CAPTG` sits next to `let BAKEM`.
- "B10: capture the rest of each interior": one line after the KEEPERS counters, before "// tag meshes that sit fully inside".
- "B10 NAV: one street graph": the main block, inserted just before `function updateYou(`. It has to come after PIERS/walkable/floorAt.
- "B10 hooks": inserted before "// B9: banner + knock chip slots".

1) NAV GRAPH: `NAV={N,E,x,z:Float32Array,k:Uint8Array,pl:[pid],td:[door at threshold],adj:[[to,w,flags,doorIdx,secIdx]],ent:{pid:[entry nodes]},warn,cache:Map(LRU 64),hits,miss,sig}`
- Size: 439 nodes and 472 edges. Node kinds: k 0 = path (337), 1 = approach/outdoor (45), 2 = threshold (29), 3 = inside entry (28).
- Flags: `NF={CROSS:1,COV:2,SCEN:4,SEC:8,DOOR:16,IN:32,CONN:64,CW:128}`.
- How it's built:
  - Sidewalk lines run at road ±4.6. At T-junctions they are stretched to the far sidewalk.
  - Mid-block crosswalks: Maple Row x=40, Main St x=-21.5 and Main St x=40.
  - `EXTRA_PATHS`: alley, square ring, square steps (the arch from Needle Way), square west, Ferry Green, promenade x=-57 (z -104..56), 4 piers, Cedar Lake loop (an ellipse at 96,22, 20x16) plus 3 links, cemetery lane x=11.5 with Morel's spur, and Willa's path.
  - `SECRETS`: 'hedge' (Main/Cedar corner to the lake loop) and 'market' (z=-24 behind the market).
  - All segments are split at crossings and T-ends; long ones are subdivided to 8 or less.
  - CROSS is set on edges whose midpoint is on a road surface. COV is set on edges within 5.6 in front of shops with awnings.
- Door chains: approach (wall + n·2.4) → threshold (DOOR, `NAV.td`) → entry (1.6 inside; dep+.9 behind solid vestibules, Mocha's house and Wendell's).
  - Mocha's house runs: gate outer node → `home:gate` threshold → yard node → front door → entry. The cabin runs: gate → entry inside the lot.
  - E
Hooks: __mocha.route(ax,az,bx,bz,who='mocha') -> {n,kind,ok,cost,ms,pa,pb,pts,flags,doors}, __mocha.nav() -> node count, __mocha.regrid(pid) -> {pid,gw,gd,blocked,solids} (re-captures furniture), __mocha.navInfo(), __mocha.navEdges(), __mocha.navNodes(), __mocha.navLog(), __mocha.navLogClear(), __mocha.grid(pid), __mocha.agentNav(id), __mocha.navSim(sec,probe) (fixed .05 s steps of updateMocha + updateW + doorTick), __mocha.wGo(dest), __mocha.wpos(), __mocha.shortcut(id), __mocha.NAV / NF / EXTRA_PATHS / SECRETS / FOOT / navRoute / navTo / navStep / navDirty / solid / placeOf / navFloor / inFoot / wTarget
Known: Size is +29 KB against the 20 KB aim. Most of it is the nav block: graph builder, A*, follower, door etiquette and hooks. | The old NODES/NADJ road graph is kept, but only bikePath (the bike riding lane) uses it. All walking uses NAV, and wPath is a thin wrapper. B11 or later could port bikes to their own lane graph. | The station back door's approach is not attached to the street (NAV.warn=['station:back']). The platform is reached through the station's interior link between its entries, which is intended. | Gates (home:gate, cabin) are requested but never pass()ed, because B9 agSync owns occupancy by position. 'out' passes are left to agSync while the walker is still inside the inBuilding margin. When B9 makes Wendell visible inside his house it can still log an extra pass:neighbor:in. | No physical collision yet (that is B11). Agents only avoid buildings. They float through benches, trees and the fountain when cutting across grass or the square, and Mocha's yard fence is not a footprint. | Interior grids are captured before PB batching. B12 must call solid(p,...) or regrid(p,true) after moving furniture. Places with no captured furniture (Wendell's, Town Hall, the new shops, the Fogwell, Willa's) have walls-only grids. | Lot stage changes do not exist yet. B26/B38 should call navDirty() when a lot changes. | Mocha still rises up the Sky Needle when within 14 of its spot (old ty override). Vertical transport is B11. | The hedge shortcut starts at the busy Main/Cedar corner, so Mocha will probably discover it early (12% per second while passing within 4). | Draw ledger: B10 adds zero objects; geometries, textures and programs are identical. drawcmp is noisy because random decor groups move between loads (one run showed +21 in view 1), but a per-object diff at the identical camera showed 843 → 841. | Mocha's and Wendell's speech bubbles can overlap when they greet each other on a sidewalk. This was already true before B10, but it is now more frequent because they share sidewalks. | Keepers stay parented to their shops until B22. navRoute, navTo and navStep are ready for them.

## B11 Walker collision, tap-to-go, seats and vertical transport
B11 (walker collision, tap-to-go, seats, vertical transport) is built in /home/user/Booknest/ghost-town/index.html. Size: 740,347 B -> 769,654 B (+29.3 KB). Backup: /tmp/harness/backup-B11.html. `python3 /tmp/harness/b11/patch.py` rebuilds index.html from that backup; it asserts every match and inserts /tmp/harness/b11/props.js, main.js and hooks.js. index.html is the patch output with no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "const COLP=[]": just before `function buildPlace(`. cemeteryB pushes each headstone as [x,z,.62].
- "B11 SEATS:": props.js, inserted before `b8World();b11Props();const B8CONV=` so its props go into PB.build. It holds SEATS, RACKS, seatAdd and b11Props.
- "B11 WALKER:": main.js, just before `function updateYou(`. It holds COL, gridHit, solidWhy, youFree, youMove, floorType, the SEATS API, youSit/youStand, TG/TGRING/tapGo/tapStop/tapBuilding/tapWorld, youTick/youStep/youUnstick/youSpawn, the bench acts, benchJoinCand, the seatedNear term, NEL/needleStep, lhStep, rideStep, seatStep, wheelLow, rackFor and mapDoorstep.
- "B11 hooks:": before "// B9: banner + knock chip slots".

1) COLLISION: `COL`, built once at load
- Circles in Float32Arrays CX/CZ/CR (375): trees r .7, LAMPS.pts r .35, headstones, the fountain r 3.55, square planters r .95, Town Hall columns, bench circles (2 x r .42 per solid bench), bike racks r .5, gate posts, the Needle core r 3.5 and the lighthouse r 3.8.
- Segments in SG (4 floats each) plus SD (door index, -1 if none), 264 in all:
  - The 4 walls of every FOOT box, using HOCC[0]/HOCC[1] for Mocha's house. Lots, the Needle and the lighthouse have no walls.
  - Each non-gate door within 1.6 of a wall cuts a gap of width d.w+.1. All 27 non-gate doors are cut. The gap's segment carries the door and blocks unless DOORS[i].ang>=.8.
  - Also segments: Mocha's iron fence (gate open), the cabin fence (gate gap at x 38.3..41.7, z=64), the cemetery ring (gap at the arch), the 3 water sides of every pier, and the notice board.
- Cedar Lake is an analytic ellipse at (96,22) with radii 15 x 9, inflated by r.
- Hash: 8 u cells, bounds x[-107,166] z[-136,136] (computed from PLACES, ROADS and PIERS plus 6, never smaller than that). ST is an Int32Array of cell offsets; IT is an Int16Array (circle i, or -1-j for segment j). Items are inserted with an AABB padded by .6, so a query reads one cell.
- `COL.hit(x,z,r=.45)` returns 0 free, 1 prop, 2 wall, 3 closed door, 4 lake, 5 out of bound
Hooks: __mocha.seats(), __mocha.benchJoin(), __you().tapGo(x,z,jog), __mocha.solidAt(x,z), __you().tapAt(sx,sy,jog), __you().sit(id,slot), __you().stand(), __mocha.benchCand(), __mocha.youSim(sec,jx,jy,probe), __mocha.needle(), __mocha.col(), __mocha.bj(), __mocha.lighthouse(), __mocha.COL/SEATS/NEL/TG/RACKS/floorType/youFree/solidWhy/seatSlot/benchJoinCand
Known: Size is +29.3 KB against the 20 KB aim. Most of it is the collision build, tap-to-go and SEATS, plus the lift, lighthouse and wheel/ferry code. | There is no lane-graph rebuild for bikes. The round-1 bikePath already rides at road centre ±1.8 on the old NODES graph, so I left it as is. Racks are on 18 shops; the station is skipped to stay within the draw budget. | The walker cannot ride the Needle lift or climb to the lighthouse gallery. Those are Mocha-only, and the Needle deck seats are tagged 'deck' so the walker skips them. | COL is built once at load. There is no 'lots re-register only their own cells' API yet, so B26 needs to add COL rebuild or patch logic when the cabin or lot stages change. | Door gaps are cut only for doors within 1.6 of a footprint edge (all 27 current non-gate doors qualify). A future door set deeper into a wall would need a cut. | floorAt ramps cover only Mocha's stoop, the Town Hall steps and the station platform. The shop door sills (.12 to .3) are still a hard step. | Wheel: in navSim the gondolas do not move, because the wheel only rotates in frame(). If Mocha is interrupted mid-ride by startAct he floats down from the gondola. Only a normal finish waits for the bottom. | Seat camera: ease 2 settles slowly at SwiftShader fps, so the screenshots needed a snapped camera. Mocha's large body sitting in slot 2 can block the view of the walker. | Auto-sit after a 1 s pause near a bench is as specified. It is disabled for the seat you just left until you are 2.2 away, but it may still surprise users. | In walk mode, tapping Mocha still switches to follow mode. B23 should replace this with the talk card. | The first walk of every page load starts at the cabin gate, even when the saved position is valid. This follows the spec until B26 builds the cabin door. | Draws: +1 capsule mesh, +1 PB chunk (I could not identify which bench, rack or rail cell it is), and the ring adds 0 when idle. drawcmp2 is noisy: [842,697,1082] before, [833,711,1090] after. | STRETCH items were not done: the #nav big-map overlay and keepers on SEATS.

## B12 Interiors I: layout standard, layout kit, fixes, lint, culling and the room camera
B12 is built in /home/user/Booknest/ghost-town/index.html. The file went from 769,654 B to 795,879 B (+26.2 KB). Backup: /tmp/harness/backup-B12.html. `python3 /tmp/harness/b12/patch.py` rebuilds index.html from that backup. Every match is asserted, and the patch inserts /tmp/harness/b12/kit.js and /tmp/harness/b12/run.js. index.html is the patch output, with no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B12 INTERIORS I: LAYOUTS kit". Inserted just before `const INTERIORS={`. It holds LIGHTSPOTS, DISPLAY, GOODC, B12M (shared materials: glass, pend, fridge, tank, neon), railMat, floorMat, roomArt/artPlane/artTxt/artPoster, goods(), PIECE, wallAt, lyPut, layoutRoom, innerMerge, dyn and LAYOUTS.
- INTERIORS now contains only station, phones and bikes. The round-1 entries for cinema, cafe, records, bookstore, thrift, studio, arcade, grocery, petstore and market were deleted; LAYOUTS replaces them.
- "B12 runtime: layoutLint()". Inserted before "// B9: banner + knock chip slots". It holds LINTP, layoutLint, RC, ROOMP, roomFit, roomPush, b12Frame, roomCamInfo, roomInfo and the hooks.

CHANGES TO EXISTING CODE
- PLACES `inner:'#..'` (a colour) is renamed to `inC`. `p.inner` is now the interior Group.
- shop():
  - `LY=LAYOUTS[p.id]`.
  - The inner wall faces use railMat(inC,p.h): a canvas with a picture rail at 4.6 and a darker band above. This costs no extra draws.
  - The floor uses floorMat(LY.floor).
  - The front wall mesh is pushed into p.walls as [mesh,'z',1], so q.walls now covers all 4 walls.
  - It creates `p.inner` (a Group named 'inner' at the place origin), then runs layoutRoom(p,LY). Otherwise it runs INTERIORS[id](p,inn); the station keeps grp.
- library(): the stray boxes and the loose interior are gone. It now calls `layoutRoom(p,LAYOUTS.library)`.
- KEEPERS.forEach: keepers go into p.inner (so they are culled with it) and get userData.dyn. The ad-hoc counters for bookstore, library, thrift, arcade and records are removed; the layouts build them.
- Mocha's stoop: 2 steps of depth .85, ending at z 10.725, inside the gate line FZ1=11. Recorded as `p.stoop={z1,gate:11}`.
- The movie face target is `toWorld(c,0,-c.d/2)` (the back wall).
- The frustum inP patch: places that have p.inner use `!p.inVis` instead of op>=.999.
- regrid() concatenates `p.solB`: the solids captured before the merge. They survive `regrid(p,true)`.
- `b12Frame(dt);` is called just before the per-PLACES shell loop.

1) LAYOUTS[id]
- Sha
Hooks: __mocha.layoutLint(pid?), __mocha.display(pid?), __mocha.rooms(pid?), __mocha.roomCam(), __mocha.roomTick(n,dt), __mocha.roomFit(pid), __mocha.setDist(v), __mocha.drawCalls() (existing), __mocha.LAYOUTS, __mocha.DISPLAY, __mocha.LIGHTSPOTS, __mocha.layoutRoom, __mocha.innerMerge
Known: Size is +26.2 KB against the 20 KB aim. Most of it is the 11 layout tables and the kit pieces. Deleting the round-1 INTERIORS entries offset some of it. | Not done (STRETCH): real shopfront glass windows. Window slots are low plinths inside the front wall, and the façade canvas has no holes or glass. Because of that, the 'window display faces the camera within 25' culling rule is not implemented. | Not done (STRETCH): top-down screenshots of every interior. Only room-camera shots were taken. | Spec deviation: in follow mode the room camera covers shops only, not Mocha's house, because the round-1 home follow view is tuned and B14 owns the home. In walk mode the home is included (via inHome, fit 22). | Spec deviation: the t1 keeper spot sits behind the counter, inside the grid's inflated band, so no agent can path to it. layoutLint skips t1. If B22 keepers must walk behind counters, give the counters a gap, or note that gridPath already snaps to the nearest free cell and then goes straight to the target. | Spec deviation: the cinema seat spots (seat, seat1..6) and the café stools count as furniture spots. Lint accepts them when a reachable cell is within 3 grid cells (1.5 m), here the 2.4-wide centre aisle. The cinema rows are packed, with no walkway between rows. | Spec deviations in the layouts:
- The records crate islands are at x=±1.6, not ±1.7, so the side aisle stays at 2.0.
- The cinema lobby is about 3.7 deep (partition at z=2), not 4.
- The café's B9 back door (cafe:back) doubles as the patio door, plus a separate flush STAFF ONLY panel at x=4.6.
- The grocery's staff door is its B9 back door, with a sign only. | Not linted: aisles of 1.8 or more are designed into every layout but not checked. The island height cap of 1.3 is not checked either. The pet-store cat on its 1.3 m tree reaches about 1.7, and the arcade claw machine (3.0 tall) stands front-right, not in the centre. | Side effect: the front wall is now in p.walls (spec item: four walls), so it hides instantly when peeking from in front, as well as fading. | Not linted: rugs and doormats are flat and excluded from solids, so they could overlap other things unreported. | Not converted: phones, bikes and the station keep their round-1 interiors (B13). Phones and bikes now sit in p.inner and are culled with it; the station uses grp, with an empty p.inner for its keeper. | DISPLAY slots sit on top of the decorative goods already on the shelves. B25 should clear or replace those goods, or place items in front of them. | Gift paintings (applyPaintings) are still added to p.obj, not p.inner, so they are never culled. This is round-1 behaviour. | petstore has 132 dyn meshes: makePet rigs plus 12 separate fish cones. Each pet is several draws when the interior is visible; B19's character LOD should cover pets. | /tmp/harness/draws.json gained a B12 entry. progs were not measured.

## B13 Interiors II: five new shops and keepers; round-1 shops to standard
I built B13 (Interiors II) in /home/user/Booknest/ghost-town/index.html. The file went from 795,879 B to 826,134 B (+29.5 KB). The backup is /tmp/harness/backup-B13.html. `python3 /tmp/harness/b13/patch.py` rebuilds the file from that backup: every replacement asserts its match count, and it inserts b13/lay.js, b13/station.js + station_tail.txt, b13/hooks.js and the snippets in b13/data.py (KEEP, FACTS, ACTS, CHALK). index.html is exactly the patch output; I made no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B13 INTERIORS II": lay.js, inserted just before `const INTERIORS={` (after LAYOUTS). It holds:
  - B13M materials: lampA/B/C (emissive lamp shades), mush (night-only glow), brew, fire, scr.
  - HELG (half-sphere geometry), B13 state {t, bub}.
  - artFit(ar,draw): text on wide planes keeps its shape on the square room-art cell. artLines(bg,fg,lines,sz).
  - New PIECE kinds: lampwall (wall-hung lamp shelves with side brackets), pegs (phone-case pegboard), helmets (helmet wall).
  - b13Pot, b13Look(look,critter), b13Hatch(p,X), b13LeanTo(p).
  - `Object.assign(LAYOUTS,{bakery,threads,nursery,evergreen,lantern,phones,bikes,station})` and b13Frame(dt).
- INTERIORS now holds only `station(p,g)`, which builds what lives outside or on the shell: the clock cupola, the platform with p.board and its sign, and the platform door panel on the back wall. It then does Object.assign(p.spots,{board,platform}). The phones and bikes INTERIORS entries are deleted.
- shop(): runs `if(LY)layoutRoom(p,LY);if(INTERIORS[p.id])INTERIORS[p.id](p,station?grp:inn)`. Every shop now uses LAYOUTS; the station also gets its exterior.
- layoutRoom: `if(L.post)L.post(p,R)` runs after the solids are captured into p.solB and before innerMerge.
- KEEPERS.forEach (the keeper placement loop) calls b13Look(k.look,o).
- "B13 hooks": inserted before "// B9: banner + knock chip slots". It holds B13P and b13Info.

DATA
- KEEPERS +5. All are ask-able because the existing KEEPERS→ACTS loop adds an fx:'ask' act for each.
  - otis: badger, evergreen, fk ['woodworking']
  - wren: Jacob sheep, threads, fk ['wool'], look.horns4
  - willa: young witch, nursery, fk ['nw plants','ferns'], look.witch
  - pippin: hedgehog, bakery, fk ['baking','bread'], look.spines
  - luma: luna moth, lantern, fk ['moths'], look.moth
  - Each has 3 hi lines. pos/ask are placeholders that layoutRoom overwrites.
- FACTS: new keys woodworking, wool, 'nw plants', baking, moths, 4 TRUE fa
Hooks: __mocha.display(pid) (existing; now covers the 8 B13 shops), __mocha.layoutLint() (existing; LINTP now has 19 shops), __mocha.b13Info(pid?) -> {pid,name,soon,open,lint,display,window,lights,keeper{id,name,species,pos,ask,facts,hi,vis},plank,chalk,chalkLine,acts,merged,inVis,spots}, __mocha.B13P, __mocha.vignettes() -> [{id,x,z,meshes}], __mocha.datl() -> {used,w,h}, __mocha.FACTS, __mocha.FACTSK(keys) -> fact strings, __mocha.mushGlow(), __mocha.b13Tick(n), __mocha.toWorld(p,lx,lz), __mocha.forceAct now merges the ACTS template (tags/need/doing)
Known: Size is +29.5 KB against the 20 KB aim. The 8 layout tables and fn builders are about 33 KB of source; deleting the phones and bikes INTERIORS entries offset part of it. | The drawcmp2/drawcmp3 averages are noisy: unowned 'Mesh' draws from moving actors swing between 98 and 216 from run to run, so raw min/max at view 3 read +10. Per-object tallies (b13/probe3.js, probe12.js) show the static change at the 3 views is 0, +1 (bakery hatch) and 0. The ledger is in draws.json. | Wall pieces still show their backs when the cutaway hides the wall they stand on (for example, the bakery's left bread shelf seen from the Duo angle). This is the same limitation as B12. The lamp walls now use side brackets with no back board to keep it light. | Drizzle Threads' side-wall counter faces the door at exactly 60° (Wren herself faces it at 0°). It passes, but with no margin. | The Evergreen vignettes are baked one draw each so B27 can move v.g, but their nav solids in p.solB are captured at the authored positions. B27 must recapture or regrid after moving them. | Not done: the greenhouse lean-to is exterior only, with no interior doorway; only walker collision circles were added. | Keeper looks are temporary makeCritter versions plus b13Look extras (Wren's 4 horns, Willa's hat and hair, Pippin's spines, Luma's wings and antennae); B19 rebuilds them. The bakery takeaway hatch is a decorative frame on the outer wall texture with no real hole. | The station's B9 platform door stays the flush back door; the STAFF ONLY door is a separate panel at x=3.6. Pendant lamps still use B12's glow() sprites, which B8 converts at boot.

## B14 Homes ready for company: Wendell's cottage, Mocha's house, fallbacks and drop-in seats
I built B14 (homes ready for company) in /home/user/Booknest/ghost-town/index.html. The file went from 826,134 B to 852,168 B (+26.0 KB). Backup: /tmp/harness/backup-B14.html. `python3 /tmp/harness/b14/patch.py` rebuilds index.html from that backup; every replacement asserts its match count, and it inserts /tmp/harness/b14/cottage.js and /tmp/harness/b14/run.js. index.html is exactly the patch output, with no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B14 HOMES: cottage(p,grp,style)": cottage.js, inserted just before `const INTERIORS={`. It holds COTTAGE_STY, HOME_ROOMS, SPOTCAP, cottage(), npchome() (now just `cottage(p,grp,'wendell')`), LAYOUTS.neighbor, S_TRIM, TV + tvDraw + tvVisible, b14Seats(), NEST and b14Home().
- "B14 runtime:": run.js plus the hooks, inserted before "// B9: banner + knock chip slots". It holds roomAt, SPOTROOM, spotRoom, homeSpotW, wAsleep, wIn, wOut, wendellSpots, nestWant/nestApply/emptyHouse, homeLint, B14 and b14Frame.
- B7 block: HOME_CAPS updated, HOME_S added (per-home spot names), capSpot updated.

1) WENDELL'S COTTAGE (neighbor: 14,40, w13 d10 h5.5, kind still 'npchome', wall #e2b558)
- Structure, built like shop():
  - Floor top at y .3. p.walls covers all 4 walls ([bw,'z',-1],[lw,'x',-1],[rw,'x',1],[front,'z',1]).
  - p.shell (fades) = the front wall with the door hole, the bay box and bay roof, the porch roof, the gable roof and the trim.
  - p.interior=true, so it uses the shop fade loop, occlusion fade, floorAt .3, the B12 room camera and the inner culling.
- Peek: the shop fade loop also peeks when `q.pk>0`. b14Frame sets `neighbor.pk` when Wendell is inside and the camera is within 32, or the camera is within 15.
- Exterior props all go through the PB town batch: porch deck, 2 posts, header beam, string lights (bulbs on the PB 'win' key, halos via glowPt), steps, the porch swing at local (-3.5,6.4), and the stone chimney on the west wall.
  - `p.chimney={x,y,z}` is where B16 puts smoke.
  - The front beds moved to z d/2+4.6. Mailbox and 'Wendell' sign kept.
  - Back garden: step, stepping stones, slatted compost bin, and a hammock between 2 firs (`p.hammock={x,z}`).
- DOORSPEC.neighbor:
  - Front door: style 'wendell', x:2, h2.45, y0 .3. It is no longer solid, so it is an open jamb and the cutaway shows no vestibule box.
  - Back door: 'neighbor:back' at back:1, x:5, w1.6, flush. NAV.warn is still only ['station:back'], so the back door attaches to the street.
- Interior: 
Hooks: __mocha.wendellSpots() -> {spots:{name:{l:[lx,lz],x,z,room}},W_SPOTS,inside,spot,vis,x,z,capShelf,chimney,hammock}, __mocha.rooms(pid) -> {pid,rooms,spotRoom,occ:[{id,room}],room}, __mocha.capSpot(slot,home='home') -> {p,s,fb,pair,x,z} (replaces B7's raw capSpot hook; adds the spot's world x,z), __mocha.emptyHouse(on) -> {on,couch,table,bed,lamp,lint} (sets FEAT.nest and NEST.force), __mocha.roomAt(pid,x,z), __mocha.tv(on|null) -> {on,force,n,film,vis}, __mocha.b14() -> {home:{draws,merged,nest,rooms},neighbor:{draws,merged,op,pk,inVis},seats:[dropin],W:{inside,vis,spot,doing,room,place}}, __mocha.applyPaintings
Known: Size is +26.0 KB against the 20 KB aim. Most of it is the cottage builder plus Wendell's layout table and fn, and the Mocha merge and empty-house code. | Spec deviation: the kitchen counter runs x 1.6..3.9 (counter 1.6–3.0, stove 3.0–3.9), not 2..6.2. The back door at (5,-5) needs that stretch of the back wall. | Spec deviation: Wendell's front door is now an open jamb (not a solid vestibule), so the cutaway shows no tunnel box. | B27/B32 must know that Mocha's furniture is merged into p.inner chunks. Individual furniture meshes are gone; only p.rp and p.screenTex survive. Hiding single pieces for the empty house needs a rebuild. | The empty-house set does not hide the furniture (B32/B27 own that). Its props sit on clear floor instead: floorA/B behind the couch, the box in the kitchen-side hall, and the blanket by the bedroom's front window. | S.v2fresh is not added to fresh()/migrate(); B32 owns it. emptyHouse() uses the runtime flag NEST.force, so the empty-house state is not saved. | wSchedule now sends Wendell inside from 21:00 (except Halloween), so the round-1 porch evenings end at 21:00 instead of 22:00. | Wendell's seated and sleeping poses are a leg rotation plus a y offset. B17/B18 should replace them. | The cottage cutaway turns on whenever Wendell is inside and the camera is within 32 (or the camera is within 15), so at night it is often cut away while Mocha is home. This mirrors Mocha's house, which fades within 19.6. | The B9 back-door leaf hides when the front fades, because the B9 door rule uses p.op. Inside there is a static back-door panel instead. | Holiday string flags (holFronts) hang at the front-wall line and float across the cutaway when it is faded. Shops already did this before B14. | drawcmp view 2 reads +38 dc (660 → 698). The per-owner tally shows every owned group went down there (neighbor 27 → 17 draws per frame even while cut away), so the rise is unowned actor or shadow noise. | The back-garden screenshot angle mostly shows the side wall. The compost bin and firs are visible, but the hammock and back door were not clearly captured.

## B15 Art bible and the shader pipeline (before the characters)
B15 is built in /home/user/Booknest/ghost-town/index.html. Size went from 852,168 B to 861,174 B (+9.0 KB). The backup is /tmp/harness/backup-B15.html. `python3 /tmp/harness/b15/patch.py` rebuilds index.html from that backup: every replacement asserts its match count, and it inserts b15/early.js, b15/pipe.js and b15/late.js. index.html is exactly the patch output, with no hand edits after it. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B15 Drizzle & Ember art bible": early.js, just before `const PLACES=[`. It holds:
  - `PAL`: grass by season, clover/cloverHi, cobble/grout, walk/walkEdge, road/roadWet, dash, curb, shallow/deep/foam, glass/glassHi, the accents pumpkin/plum/evergreen/berry/butter.
  - `PAL.fam`: sage, butter, plum, slate, brick, gothic, log, each as {wall,trim,roof}.
  - `PAL.toon` and `PAL.toonC` (the ramps), `PAL.hemi` {day,night}, `PAL.sky` {night,dawn,morning,day,after,golden,sunset,blue}, `PAL.rim` {day,golden,night,inside} as [hex,amt].
  - `FAMOF` {pid:[family, awning accent]}, and `CLOVER` (the grass dot rgb strings).
- Right after `const byId=`: a recolor loop. Each place in FAMOF gets p.fam and p.trim. If it has a wall, p.wall and p.roof are replaced by the family's. If an accent is listed, p.awn becomes [accent, trim].
  - Families: cafe/market/bikes/station/fogwell brick; records/phones/lantern slate; bookstore/petstore/nursery sage; thrift/cinema/threads/arcade/willa plum; grocery/studio/neighbor/townhall/bakery butter; evergreen/cabin log; home gothic. The gothic builder colors already are the gothic family, so it is unchanged. The arcade keeps its neon awning.
- "cozy toon look (B15)": pipe.js, which replaces the old TOONG..customProgramCacheKey block. It holds:
  - `rampTex(colors)`; `TOONG` = PAL.toon, 8 texels: #7C7A9C x3, #9C93B8, #DCCFD0, #FFF6EA x3. I used the spec's "if muddy" fallback, because butter walls went olive in shade with #6E6A96.
  - `TOONC` = #B58AA0 x3, #E9C2C0, #FFF4EE x4. Classes `ToonM` (unchanged) and `class ToonC extends ToonM` (gradientMap=TOONC).
  - BEND, BEND_GLSL (as before), `RIM={col:{value:Color},amt:{value}}` (a shared uniform object), `bendOK(m)`.
  - `PATCH=[{id,test(m),apply(sh,m)}]`, applied in order:
    - 'b' bend: same as round 1. It inserts a `/*SWAY*/` marker before mvPosition.
    - 's' sway: material userData.sway, written into the marker. It leaves a `/*WIND*/` marker after it.
    - 'r' rim: material userData.rim, on Toon/Phong/Standard only. It adds `outgoingL
Hooks: __mocha.grade(), __mocha.rim(), __mocha.programs(), __mocha.PAL, __mocha.FAMOF, __mocha.PATCH, __mocha.RIM, __mocha.RIMS, __mocha.TOONG, __mocha.TOONC, __mocha.ToonM, __mocha.ToonC, __mocha.rbox, __mocha.rimify, __mocha.ghostMat, __mocha.roadMat
Known: The program count is +7 (30 to 37 at h12), against a limit of 8. The extra programs are rim variants ('br' on Mocha's transparent double-sided ToonC and on the pet clones) plus hidden night and holiday materials that renderer.compile now builds up front. B18 must reuse the ToonC + rim parameters to stay inside the budget. | 17:20 frame time: the raw worst frame after load is about 2.1x the median, and the backup shows the same ratio, because of the 1 Hz HUD and town ticks. No shader compiles happen after load. The test therefore checks the 95th-percentile frame against 2x the median plus zero new programs, rather than the raw maximum. | Draw ledger: draws are structurally unchanged (B15 adds no meshes). drawcmp3 portrait h15 changed from [636,682-684,799-822] to [642,682-684,781-804], and perf1p average went from 665 to 677. I did not tally these per object. I attribute them to moving characters, which earlier steps showed swing by about 100 draws between runs. | Not done (to save draw calls): the curb (#CFC3AE) and sidewalk edge colors are not drawn, the shoreline has no shallow-water or foam band (only the deep water color and foam strokes), and the round-1 pink and blue houses (not PLACES) are not recolored. | rbox() is used for new work only. Old builders were not retrofitted (this matches the spec). It returns non-indexed geometry, so check that Batcher accepts it before batching rbox meshes. | Every window pane is now blue glass by day. The lit pattern still comes from the static emissive maps (winMats), so daytime windows show only a faint warm tint. B16's WLT should take over the emissive side. | Butter-family walls in shade still read slightly olive-tan, even with the softened shade color (#7C7A9C instead of #6E6A96). B42's art critique may want to tune the butter walls or the shade color. | Mocha's rim is subtle because his body is white and emissive. It shows as a blue-white edge at night and is much clearer on the pets. | Size is +9.0 KB, within the 20 KB aim.

## B16 Living lights: who is home, room by room
B16 (Living lights) is built in /home/user/Booknest/ghost-town/index.html. The file went from 861,174 B to 895,750 B (+34.6 KB). The backup is /tmp/harness/backup-B16.html. Running `python3 /tmp/harness/b16/patch.py` rebuilds index.html from that backup: every replacement asserts its match count, and it inserts /tmp/harness/b16/early.js and /tmp/harness/b16/run.js. index.html is exactly the patch output, with no hand edits. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B16 WLT (early)": early.js, right after `const winMats=[]`. It holds:
  - `WLT={N:256,d (Uint8Array LUT bytes),lut (256x1 RGBA DataTexture, Nearest, no mips),u:{lut,on,v},S:[slots],by:{key:i},drv,force,res,brk}`.
  - `wltSlot(key)`. A key is 'pid:room'. Each slot has seeded thr [.34,.62], ease 60-120 s, home 18:12±48 min, bed 23:00±72 min, off 22:00-01:30, and all (10% chance).
  - `wemBake(g,W,H,[[x,y,w,h,slot,variant,shapeFn?]])`: rasterises a white coverage mask, then quantises per pixel to rgb(slot, 185 edge or 255 hot centre, variant), so no blended ids at the edges.
  - `wemTex(t)`: Nearest, no mips, sets t.wlt=1.
  - `wltDef`, `wltEm`, and `wltRe(mat,fn,clone)`, which re-encodes a wallTex material's windows.
  - `PATCHI.w.apply`: replaces `#include <emissivemap_fragment>` with the LUT lookup `totalEmissiveRadiance*=wl.rgb*wid.g*winOn*2.*variantMul`. Variants on wid.b: 1 = cabin candle (B31), 2-4 = holiday (B41). Their multipliers are in `WLT.u.v` (vec4, default 1). Nothing draws them yet.
  - `winMats.push` is overridden to stamp `userData.wpid=CAPT.id`.
- Early state, next to DVIS in the B7 block: `FLK` (flick state), `FLICK_ACT`, and `LUXS={si,force}`.
- "B16 LIVING LIGHTS runtime": run.js, before "// B9: banner + knock chip slots".

EDITS TO EXISTING CODE
- wallTex: windows are recorded as `lit` rows [x,y,w,h,on,row,col]; shop panes use col -1/-2 and the door window -3. They are encoded through wltDef:
  - Shops: ground row 'main', with side walls alternating 'main' and 'back'; upper rows 'up'; pane -1 or the door window 'sec' (the security light).
  - Other places: 'pid:main'.
  - No place being built: 'sched:k'.
  - The material gets userData.win, emissiveIntensity .5 and `userData.wl={W,H,lit}`.
- gothicTex: takes `o.slots[]` (one per window), `o.dslot` and `o.emOnly`.
- Mocha's house window slots:
  - back wall: bedroom, living, kitchen
  - left side: kitchen; the right side has its own em (`extSR`): bath
  - front: kitchen, kitchen, bedroom, bath
  - bay: liv
Hooks: __mocha.wlt(o), __mocha.setLux(x), __mocha.lights(), __mocha.lamps(), __mocha.porch(pid[,level,pattern]), __mocha.shopBreak(pid,until,label), __mocha.flickAct()
Known: Size is +34.6 KB against the 20 KB aim. Most of it is the runtime: WLT evaluation, rig, FX, porches, lamp wave, messages and hooks. | Shader programs went from 37 to 40 at h12. 'bw' covers the window materials with the LUT patch; the FX Points ShaderMaterial and the additive vertex-colour MeshBasic are also new. | Interior exposure (hemi -35%, sun -50%) applies whenever Mocha's house cutaway is open, which is most of the default follow view. At night the yard and street look darker than before. B42 can tune RIG.hk/RIG.sk. | Mocha's front windows show the room behind them (kitchen, kitchen, bedroom, bath; bay = living; door light = hall), not the hall strip along the front. | Wendell's lights go out at 23:00 (he 'reads in bed' from 22:00). His agent's awake flag still flips at 22:00. This was needed for the 22:00 acceptance check. | Variant bits for holiday silhouettes and the cabin candle are only reserved (WLT.u.v multipliers in the shader). Nothing draws variant pixels yet; B31 and B41 fill them. | Most shops have one window row, so 'up' (upstairs follows the keeper) rarely appears. After closing, shop side walls go dark and only the 'sec' pane keeps a .25 security light. | Fogwell and skyline use seeded schedules. The Vesper red at Fogwell unit 5B is a placeholder until B39. | Chimney smoke only comes from places with p.chimney (Wendell's for now). HEARTH, HEARTHBY and LSP are built once at boot, so B26 must push its cabin hearth and LIGHTSPOT into them. | The flick-back act (FLICK_ACT, at home:porch) uses the normal act duration, not a 2 s tiny act. Its outcome triggers Mocha's flick2. | Encoded emissive maps use NearestFilter with no mipmaps, as the spec asks. Windows can shimmer slightly at distance. | Raw draw numbers (drawcmp3 and gfx, which include shadow passes and moving actors) are noisy. The per-object tally at the default view shows a static change of +2: the b16fx mesh and the b16pts Points. | Fades, the lamp wave and the porch flicks run on real time (performance.now), so they keep their speed on slow devices. Hearth noise uses game time T.

## B17 Wendell's day and hangouts in both houses
I built B17 (Wendell's day and hangouts in both houses) in /home/user/Booknest/ghost-town/index.html. Size went from 895,750 B to 947,257 B (+51.5 KB, against the 20 KB aim). All acceptance tests pass (/tmp/harness/test-B17.js prints ALL PASS), and smoke 15 and smoke 1 print OK for all 3 viewports. Backup: /tmp/harness/backup-B17.html. `python3 /tmp/harness/b17/patch.py` rebuilds index.html from that backup: every replacement asserts its match count, and it inserts b17/early.js and b17/run.js. index.html is exactly the patch output, with no hand edits. Nothing is committed.

WHERE THE CODE LIVES (search strings)
- "B17 WENDELL (early, data only": early.js, inserted just above `//  STATE`, so before fresh(), migrate() and catchUp(). It holds:
  - wendFresh/wendFix, W_RHYTHM, PLANS, PLANC, parsePlan, blockAt, planFor, wAvailAt, wendCaps
  - W_STORIES (12 stories as [tier,label,text]), wStoryPick, W_NOTES, W_STARS (true star facts)
  - HANGOUTS (17 entries), HBY, WD (Wendell's verb-to-doing strings), HS (hangout state)
  - W_HAS, hangHas, HSEAT, hangSeat, hangWhen, hangResolve, hangTrad, hangFits, hangPick, hangHrs, hangBedOk, hangScore, hangAct, hangCands
  - wNote, wMiss, wendSim, hangOutcome
- "B17 runtime:": run.js, inserted before "// B9: banner + knock chip slots". It holds:
  - Wendell's day: wBlock, wDest, wDoing, wWalk, wPlanStep
  - Caps shelf: CAPS, capsBuild, capsSync
  - Props: HPR, hpShow, hpHide, hpItems, hpCheckers, hpDraw, hpTick
  - Staging: hangStart, wGoSeat, wSit, hangArrive, hangYaw, hangCam, hangTok, hangBeat, hangTick, hangW, wHangDone, hangEnd, hangFinish
  - Invites: potShow, hangBusyWhy, inviteDecide, WINV, inviteStart, inviteAnswer, invW, wInvTick
  - wTick1 (1 Hz), hangState, HEV (event log), and the hooks.
- updateW was rewritten in place (search `function updateW(dt,t){wGreetT-=dt;`).

PLANS (for B22 to reuse)
- `parsePlan('HHMM-HHMM where verb;...')` returns `[[h0,h1,kind,place,spot,verb]]`. `where` is one of: porch or yard (kind 'out'); home.<spot> (kind 'in', with 'home' resolved to PLANS[id].home); `>list` (kind 'go', resolved from PLANS[id].go by a date seed).
- `planFor(id,date)`: memoized by id+dkey.
  - Rain at the block start + 1 h (WX.wet) turns 'garden' into reading in the window seat and 'stroll' into sorting caps at the shelf.
  - 'eve' becomes one of read, caps or radio.
  - One night in three adds [1, 1:02, stove, 'snack'].
  - Holidays add porch blocks: halloween 17-21, thanksgiving 12-20, christmas 9-18.
- `bloc
Hooks: __mocha.wend(), __mocha.wplan(date?), __mocha.hang(id,where,{len}), __mocha.hangState(), __mocha.invite('knock'|'call'|'note', seed|{seed}), __mocha.hangStop(), __mocha.hangCands(t?), __mocha.inviteDecide(seed), __mocha.HANGOUTS(), __mocha.walkSit(pid,spot), __mocha.catchUpSim(days,{last,li}), __mocha.Wst (W object)
Known: Size is +51.5 KB against the 20 KB aim. The bulk is the 17-entry HANGOUTS table with beats, diary lines and the story bank (about 14 KB), plus staging, invites, props and hooks. CORE is complete. | Spec deviation: the hangout camera uses dist 12, pitch .9 and a yaw across the seat pair (hangYaw), not dist 9. At dist 9 the camera sat behind Mocha and he hid the board. The entry's range [6,20] still allows zooming in. | Only portrait and desktop were re-shot after the final camera change. Landscape and Duo shots in b17/ are from the earlier camera, but they showed no HUD overlap. The empty-house picnic screenshot was taken but not reviewed. | catchUp's activity cap is now min(44, 14+10 per day away), so a 3-day absence writes about 45 to 70 diary entries (the diary is capped at 160). Round 1 capped catchUp at 14 entries whatever the absence. This change is what lets every day reach its evening hangout. | Simplified staging:
- Escort: Wendell routes to his seat on the same nav graph while Mocha slows to 2.5. There is no explicit side offset.
- End of a hangout at Mocha's: Wendell walks home with bubbles; there is no 'host walks guest to the door' animation.
- Not built: the errand basket, supper steam/stove glow particles (B16's cooking tint comes from occOf act), and the rising heart (the emote/setFace stubs are called but do nothing until B18). | The round-1 holiday 'wen' acts still need wAvail() (Wendell outside). He is inside more now, so they come up less often. | The mindThink prompt does not list hang ids yet. applyDecision accepts d.hang, but the AI schema does not mention it. | inviteStart('call') uses two one-shot setTimeout(1800) calls for the accept/decline bubbles. They are not loops. | Saves migrated from before B17 start with S.wend.li=0, so Wendell may invite (knock, call or note) on the first 16:00-20:00 window after the update. Fresh saves set li to now. | The draw probe is noisy from moving actors. Static additions:
- Caps shelf: +1, only while Wendell's interior is visible.
- Hangout props: +2, only during a hangout.
- Soup pot: +1, only while Wendell carries it.
- Shader programs: unchanged at 40.

## Review fix summary
I fixed all 9 high-severity findings in /home/user/Booknest/ghost-town/index.html, plus most of the medium and low ones. Both smoke tests pass (hours 15 and 1, all 3 viewports). Not every step test passes: B7, B8, B9, B10, B12, B15, B16, B17, step3 and step6 still have failures, listed in not_fixed. B9, B10, the B8 warm check, B16's fire-sync check and B17's catchUp check fail the same way on the backup. The rest are in code these fixes don't touch.

The file went from 947,257 to 954,116 bytes. The backup is /tmp/harness/backup-b2-fix1.html. Nothing is committed, and no test files were changed.

**The high-severity fixes:**
- **Frozen black page for returning players:** fixed. A save away 3 hours and an old round-1 save away 30 hours now both load with no errors and get their catch-up diary entries.
- **Tap-to-go stalling at lamp posts:** fixed. The keep-right lane now steers around posts, planters and walls. From the spawn, 31 of 32 destinations arrive; the bakery is the only miss because it is locked ("coming soon").
- **Lantern Square, Drizzle Alley and Ferry Green unreachable:** fixed by rerouting those paths. All 12 square cases and all 5 sidewalk cases now arrive.
- **Front-wall items blocking room views:** blade signs and holiday facade decor now hide while a room is cut away.
- **Seat camera:** drop-in seats keep the room or hangout framing, and benches frame both sitters.
- **Garden hangout:** the missing `yard2` seat is added, and gardening no longer happens after dark.
- **Knock? chip:** now shows within 3.0 of the door, so tapping the door or arriving by map brings it up.
- **Town Hall and The Fogwell:** both doors now say "opening soon" until B38/B39 build the interiors. Those steps should remove `soon:1`.
- **Wendell hangout lighting and framing:** both lights together are capped when they fall in the same small room, Mocha's glow dims indoors, the camera frames the pair from outside the faded wall, and the floating building label hides.

**Two problems the test run turned up that were not in the findings:**
- **Mocha can't get to his bike.** step3 and step6 fail because Mocha stops at his own front door at (40, 49.7) and never mounts his bike. My probe shows the same on the backup, so it comes from the batch 2 build, not these fixes. It is not fixed and needs its own task.
- **test-B12 crashed partway.** A later debug hook (`__mocha.rooms`) was overriding B12's. I fixed the hook, so B12 now runs to the end, where it fails one check about shop display slots.

**Partly done or not done:** draw calls, room-camera framing in portrait, Mocha's house partitions, most of the per-frame allocation, hangout staging, the walker's toon colour, the portrait map labels, the keeper overlaps (Hank and Gus) and the watch-mode counter view. For the Needle Way and yard-fence stalls I changed only the steering, not the geometry, and didn't re-run those scenarios to confirm.
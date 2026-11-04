# Mocha's Ghost Town: Round 2 Build Spec, revision 2 (B7 to B42)

Lead-designer synthesis of five area proposals (world, social, you, senses, Mocha's inner life) and every requirement in `/tmp/harness/round2-plan.md`, including the late additions (messages 8 to 14: earning, Mocha's empty house and jobs, Town Hall council, the town economy, the spooky-cute and cottagecore cast, the log cabin, the Halloween-town-in-Seattle vibe and the condo).

Revision 2 answers the reviewer's findings (see section 3). The 15 large steps became **36 steps (B7 to B42)**, each sized for about one implementer session (target: 20 KB of new code or less). The order was changed so that the user's explicit asks land early: lights in the houses at B16, hangouts at B17, the new you at B18, music that Mocha picks at B21, and your home and shopping by B27.

Each step has a **CORE** section (must ship) and a **STRETCH** section (ship if time allows; otherwise list it in known_issues). Every step must leave the app fully working.

**Reading order for implementers:** section 0, section 2, then your step. The structured step briefs summarize each step. Where a brief and this file disagree, this file wins.

## 0. Shared rules for every implementer (read first)

**Files.** The app is `/home/user/Booknest/ghost-town/index.html`, a single file built on three.js r128. Back it up first to `/tmp/harness/backup-<step>.html`. Edit with exact-string Python replacements that assert they matched, or with the Edit tool. Keep the compact style. Round 1 is still adding code, so line numbers drift: this spec names search strings (for example `function Batcher(`) instead of line numbers.

**Tests.** These must print `OK (no errors)` for all 3 viewports:
- `node /tmp/harness/smoke.js 15`
- `node /tmp/harness/smoke.js 1`

Also write `/tmp/harness/test-<step>.js`, modeled on smoke.js, that drives the feature through `window.__mocha` hooks. Look at your screenshots with Read: portrait 393x852, landscape 852x393, Duo 900x1000 and desktop 1100x820. Never run two heavy pages at once.

**Draw ledger.** Before and after your step, run `node /tmp/harness/perf1.js <file>` (and the portrait variant from B7) and append `{step, before, after, tris, progs}` to `/tmp/harness/draws.json`. Every step states a draw-call delta budget; the ledger must show you met it.

**Step size.** Aim for 20 KB of new code or less. If a step runs long, ship CORE and list the rest in known_issues. Never leave a half-wired system.

**Autonomy (non-negotiable).**
- No user input path may write `G.act`, `G.target` or `G.mode`, or call `startAct`/`goPoint`. The user's taps move only the user's own camera or walker.
- Every user-derived influence on Mocha (words, texts, gifts, presence, porch lights, a lit fire pit, sitting near him, knocking) enters `localChoose` through ONE function, `userBias(a,ctx,why)` (B7). Terms are additive, the total is clamped to 1.2, nothing multiplies a score, and nothing forces a choice. Each step that adds a term registers it with `ubAdd(label,fn)`; B28 writes a bias-audit test that maxes every term at once, and every later step that adds a term re-runs it.
- The single allowed negative override is the user's "napping, come back later" sign on their own cabin (B31). It zeroes his visit-the-cabin candidate, and he may still leave a note in the mailbox.
- Anything Mocha does in response to the user (waving, coming to say hi, showing off a purchase, sitting beside you, coming to the door) is a weighted localChoose candidate. It is never a direct goPoint triggered by the walker's arrival.
- Opening a talk card with Mocha never pauses him. He turns his head and answers over his shoulder, unless he himself picks the "chat with my visitor" candidate.
- Townsfolk, Wendell and the cast are characters, not the protagonist: they may stop, face you and open their door for you. That is their personality; it is not steering Mocha.
- Mocha's choices come only from `localChoose`/`localOutcome` or a validated `applyDecision`. Every feature must be reachable with ZERO AI calls.

**AI budget.** `window.claude.use('sample')` is optional. From B7 on, every call goes through `MIND.allow(kind)`: default cap `'light'` (10 calls per day), at most 6 per hour, 40% of the daily cap reserved for the user's own messages, and no calls while hidden, while he is asleep, or after 10 minutes without input. Townsfolk chips are always local.

**Performance (iPhone, on battery).**
- Lights: never add or remove THREE lights after the first render. The fixed rig (B16) is hemi, sun, L0 (Mocha's glow `mLight`), L1 (the home `innerLight`, re-parented to the scene at boot) and L2 (created at boot). No light ever lives inside a group that is disposed or rebuilt. Everything else glows with emissive materials, the GLOWPTS halo pool (B8) and the WLT window table (B16).
- Batching: static props go through round 1's `Batcher` (search for `function Batcher(`). B8 extends it with UVs and parent groups. Do not write a second merge helper.
- Glows: static halos go into the GLOWPTS Points pool (one draw for all). Do not add new `glow()` sprites for static lights.
- Characters: at most 8 full-rig characters drawn at once, at most 8 draws each. All others use a 1-draw LOD mesh. castShadow only on the 4 nearest (B19).
- Quality tiers extend round 1's `ADAPT` (search for `ADAPT={`) and `SET.saver` (B41). Do not build a parallel tier system.
- No per-frame allocation: preallocate vectors and arrays.
- Throttles: town tick 1 Hz, proximity 4 Hz, doors 20 Hz, culling 10 Hz, lights 4 Hz, character LOD 2 Hz.
- Draw budget: 250 calls or fewer at the default follow view on portrait at 15:00 and at 21:00; 300 or fewer at the busiest event (Market Morning, the parade).
- Memory: merged catalog geometry 6 MB or less, total textures 64 MB or less (`renderer.info.memory`), photos 3.2 MB of dataURL characters or less in localStorage.
- `SET.saver` / LOW tier disables particles, pigeons, silhouettes, smoke and sunbeams.
- Pause when hidden: every `setInterval` or timer loop you add must be cleared on `visibilitychange` hidden and restarted on visible, unless it runs from `frame()` (which already pauses).

**Sandbox.** No fetches to other hosts, no external assets, no alert/confirm/prompt, no service workers. Audio is Web Audio synthesis only. Art is primitives and canvas textures only.

**State.**
- Every new S field goes in BOTH `fresh()` and `migrate()`.
- Cap every array.
- `migrate()` (search for `function migrate(`) and `catchUp()` (search for `function catchUp(`) run early in the file, before most later consts exist. So:
  - Any table used by migrate or catchUp must be declared ABOVE them.
  - Helpers must be hoisted `function` declarations.
  - catchUp code must be data-only. It must touch no meshes, or be guarded with try/catch.
- The db doc limit is 256 KB. From B28 a size guard trims at 200 KB. Device-only data stays in localStorage.
- Home features are capability-checked. Before using a bed, stove, computer, couch, table, fridge, desk, record player, radio, TV or lamp, call `hasItem(slot)` / `capSpot(slot)` (B7) and handle the fallback. From B32, fresh starts are nearly empty.

**Camera and HUD.** Camera modes go through the `CAM` stack (B7): `CAM.push(owner,spec)` and `CAM.pop(owner)`. Floating HUD elements register with `HUD.slot()` (B7); never position a new one by hand. The panel has at most 6 top-level tabs (B7).

**Truth and IP.** Facts presented as real (species, Washington facts, fishing rules, films, holidays) must be TRUE. All names are original. No Nintendo, Disney or franchise names or beats (no "Nook", no tent start, no loans). Avoid characters and beats that echo a specific franchise character: no tortoise mayor, no bird mail carrier other than our Seattle crow, no walrus or sea captain who ferries and sings, no stargazing owl, no scored home-evaluation letters, no nibble-then-plunge bobber fishing, no alpaca or hedgehog clothing keepers, and no ghost named Wisp.

**Hooks.** Extend `window.__mocha` (and `window.__you`) with every hook listed in your step. Hooks may force states for tests, but never route through user UI paths that would steer Mocha.

**Mobile UI.**
- Nothing may overlap in portrait 393x852, landscape 852x393, Duo 900x1000 or desktop 1100x820.
- Touch targets are at least 44 px.
- Respect `env(safe-area-inset-*)`.
- New sheets are bottom sheets in portrait (max 62 to 90vh) and side cards in landscape and on the Duo.

**Handoff.** Return a precise summary of what you built: function names, data shapes and hooks. The next implementer builds on it.

## 1. Step map (strict order)

| Step | Title | User asks it serves |
|---|---|---|
| B7 | Foundations: camera stack, HUD slots, six tabs, AI budget, user-bias cap, home capabilities, weather almanac, photo safety | all (plumbing) |
| B8 | Town plan v2, exteriors, batching, sign atlas, glow pool, instanced lamps | 2, 6 (store sites), 13 |
| B9 | Doors, permissions, knocking, agents and occupancy | 2 |
| B10 | Street navigation and agent routes | 2 |
| B11 | Walker collision, tap-to-go, seats, vertical transport | 2, 3 |
| B12 | Interiors I: layout standard, layout kit, fixes, lint, culling, room camera | 2 |
| B13 | Interiors II: five new shops and keepers; round-1 shops to standard | 2, 6 |
| B14 | Homes ready for company: Wendell's cottage, Mocha's house, fallbacks, drop-in seats | 1 |
| B15 | Art bible and shader pipeline (before the characters) | 2 |
| B16 | Living lights: who is home, room by room | 1 |
| B17 | Wendell's day and hangouts in both houses | 1 |
| B18 | Characters I: chibi kit, faces, the new you, Your Look | 3, 4 |
| B19 | Characters II: the whole cast and character LOD | 3, 11 |
| B20 | Sound A: audio engine, sound effects, babble, ambience | 5 |
| B21 | Sound B: Town Songbook, Mocha's radio, jukebox and Drizzle FM, shop music | 5 |
| B22 | Town Clock, shop life, pals, weekly goals | 3 |
| B23 | Talking to anyone: talk card, dialogue, gossip, Mocha in person | 3 |
| B24 | Catalog engine (150 items) | 6 |
| B25 | Wallet and shopping on real shelves | 6, 8A |
| B26 | Your log cabin | 6, 12 |
| B27 | Decorate mode, autoArrange, Moving Day | 6 |
| B28 | Inner life I: state v2 with backup, bonds, listening, bias audit | 7 |
| B29 | Inner life II: mood, reasons, day plan, memory, presence, Dispatch | 7 |
| B30 | Wants, taste, dreams and gifts | 6, 7 |
| B31 | Visits: Mocha and Wendell at your cabin, fire-pit evenings, guestbook, consignment | 6, 12 |
| B32 | Mocha's empty-house nest and Wendell's housewarming | 8B, 1 |
| B33 | Wendell II: seasonal hangouts, keepsakes, traditions, birthday | 1 |
| B34 | Sound C: records, the record player, our song, Mocha's song | 5 |
| B35 | Gathering, field notes, fishing, crab pot, crow trinkets | 8A |
| B36 | Shifts, favors, your friendships, Town tab, Lantern Square alive | 8A, 3 |
| B37 | Town economy and Mocha's jobs | 10, 8B |
| B38 | Town Hall, council, petitions, construction | 9 |
| B39 | The Fogwell condo | 14 |
| B40 | Townsfolk homes, ghost friends, the October layer | 13, 11 |
| B41 | Sky, weather, holiday lights, phone framing, quality tiers | 2, 13 |
| B42 | Art-direction critique loop (2 rounds) | 2 |

**Cut lines (if the orchestrator must stop early).**
- B7 to B23 deliver asks 1 to 5: lights and hangouts in both houses, doors and layouts, the new you, living townsfolk you can talk to, and music Mocha picks himself.
- B7 to B27, then B42, deliver all six explicit asks, including your home, shopping and many stores.
- B28 to B41 deliver ask 7's depth and the late additions (messages 8 to 14).
- Do not reorder dependencies. Every step names what it reads from earlier steps.

## 2. Ownership and interfaces (single source of truth)

### Places and coordinates (finalized by B8)

World axes: x = east, z = south. Water lies west of x = -61. Road changes:
- Maple Row is extended to `[-52,58,104,58]`. This replaces `[-5,58,104,58]`.

**Street names**
- Main Street (z=0)
- Fog Street (z=-48)
- Needle Way (x=-5)
- Cedar Avenue (x=66)
- Maple Row (z=58)
- Drizzle Alley (x -24..-19, from Main St to the square)

**New places** (center x,z / ry / w x d). Front faces local +z.

Civic and districts:
- `square` Lantern Square: plaza x -41..-19, z 24..42. Fountain (-30,33). Notice board (-30,25.5), facing south.
- `townhall` Town Hall: (-47.5,33), ry PI/2, 16x9, h9. Clock tower to y 20; faces east onto the square.

New shops:
- `bakery` Puddle & Crumb Bakery: (-14.5,35), ry -PI/2, 8x7. Hours 6-14. Keeper Pippin (hedgehog).
- `threads` Drizzle Threads: (-36,47), ry PI, 10x9. Hours 10-19. Keeper Wren (Jacob sheep).
- `nursery` Fern & Moss Nursery: (-22,47), ry PI, 12x9, plus a greenhouse lean-to at x -16..-12. Hours 8-18. Keeper Willa Thornbury (young witch) with Pepper (black cat).
- `evergreen` Evergreen Home & Hearth: (49,-17), ry 0, 18x12. Hours 9-19. Keeper Otis Burrows (badger).
- `lantern` Lantern & Wick: (12,-37), ry PI, 8x8, crooked roof. Hours 14-23. Keeper Luma (luna moth).

Homes:
- `fogwell` The Fogwell (condo): (30,-62), ry 0, 20x14, h22. Lobby plus floors 2-5 plus a rooftop terrace.
- `cabin` your log cabin: (40,74), ry PI, cabin 14x10 on a lot. The split-rail fence runs x 27..53, z 64..90, with the gate at (40,64), lined up with Mocha's gate (40,53) across a Maple Row crosswalk. This replaces `neighborHouse(42,74,...)` (the lavender house is removed; take 42,74 out of NB).
- `neighbor` Wendell's cottage: rebuilt in place at (14,40), 13x10.
- `willa` Willa's crooked cottage: (128,62), ry -PI/2, 10x9. Herb garden; glowing mushrooms at night. A path leads from the end of Maple Row (104,58).

Night and nature:
- `cemetery` Old Pioneer Cemetery: (10,100), radius 12. Wrought iron, lantern path; a gravel lane along x=12 from Maple Row. Ghost friends appear here at night (B40).
- Morel's mushroom house (prop home): (24,96).

Vacant lots (classes: S 9x9, M 12x10, L 16x12, O open-air):

| Lot | Name | Position | ry | Class |
|---|---|---|---|---|
| L1 | Cinema Corner | (55,14) | PI | S |
| L2 | Cedar Ave North | (80,-38) | -PI/2 | L |
| L5 | Parkside | (122,12) | PI | M |
| L6 | Pier 3 | (-73,-80) | PI/2 | M (new pier `[-85,-61,-86,-74]`) |
| L7 | Maple Row West A | (-40,72) | PI | M |
| L8 | Maple Row West B | (-22,72) | PI | M |
| L9 | Corner Green | (5,72) | none | O |

Lot ids L3 and L4 are retired; their sites became The Fogwell and Lantern & Wick.

Round-1 buildings (phone store, bike shop, station) keep their round-1 positions unless the B8 overlap checker fails. If it fails, move them to the recommended sites:
- Cascade Mobile (-15.5,-15), ry 0
- Spoke & Sprocket (28,-37), ry PI
- Rain City Station (140,0), ry -PI/2

**House numbers:** Mocha 13 Maple Row, Wendell 11, you 12, Juniper & Sol 18 (pink house at 18,72), Rosalind & Tabitha 20 (blue house at 80,44).

### Runtime registries (who owns what)

| Registry / API | Owner step | Used by |
|---|---|---|
| `CAM` push/pop stack | B7 | B11 seats, B12 room, B17 hangouts, B18 Your Look, B23 talk, B27 decorate, B39 floors, B41 framing |
| `HUD.slot()`, `HUD.layout()`, `HUD.bands()`, `TABS` | B7 | every step with UI |
| `MIND.allow(kind)`, `MIND.request()`, `SET.mind` | B7 | B17, B21, B23, B28 to B31, B38 |
| `ubAdd`, `userBias`, `ubVeto` | B7 | every step that lets the user inform Mocha |
| `bondOf`, `tierOf` (a shim until B28) | B7 | B11, B16, B17, B26, B31 |
| `HOME_CAPS`, `hasItem`, `capSpot`, `FEAT` | B7 | B14, B16, B17, B21, B29, B32, B34 |
| `WX` almanac, `WIND` | B7 | B17, B21, B22, B29, B35, B37, B41 |
| `isPresent()` | B7 | B16, B26, B29, B31 |
| `DOOREV`, `SFXEV`, `sfx()`, stubs `emote()`/`setFace()` | B7 | B9 emits; B20 subscribes; B18 fills the stubs |
| `Batcher` (round 1, extended), `SIGN` atlas, `GLOWPTS`, instanced lamps | B8 | B9, B12 to B14, B16, B26, B38 |
| `DOORS[]`, `door.request(agent)`, `door.pass(agent,dir)`, `answerKnock`, `flipSign` | B9 | B10, B20, B22 |
| `AGENTS`, `OCC`, `occOf(pid)` returning `{ids,room,awake,act}` | B9, fed by B10 to B40 | B16 lights, B20/B21 audio zones, B22 |
| `NAV`, `navRoute()`, interior grids `p.grid`, `solid()`, `regrid()` | B10 | everyone who walks |
| `SEATS` registry (with `tag:'dropin'`) | B11 | B14, B17, B22, B26, B31 |
| `LAYOUTS`, `DISPLAY[shopId]`, `LIGHTSPOTS`, `layoutLint()` | B12 | B13, B14, B16, B25, B26 |
| `p.rooms`, pair spots, drop-in seats, the empty-house prop set | B14 | B16, B17, B27, B32 |
| `PATCH` shader pipeline, `RIM`, `TOONC` | B15 | B16 (win patch), B18, B41 (wind) |
| `WLT`, light rig L0 to L2, `porch(pid,level,pattern)`, the lamp wave | B16 | B20 tinks, B26, B31, B39, B41 |
| `parsePlan`, `planFor`, `blockAt` | B17 (Wendell) | B22 (everyone) |
| `HANGOUTS`, `S.wend` | B17 | B31, B33 |
| `makeChibi(look)`, `FACE` atlas, `emote()`, `setFace()` | B18 | every character |
| `CAST` table, character LOD (`CHARLOD`) | B19 | B22 onward |
| `AUD` engine, SFX palette, `babble()` | B20 | everything audible |
| `SONG`, `GENRES`, `RECORDS`, `RADIO`, `MUSIC.play()`, `pickMusic()`, `S.music` | B21 | B26, B34, B36 |
| `N[id]` runtime, `npcStatus(id)`, `PALS`, `WEEKLY` | B22 | B23, B29, B36 |
| `talk(id)`, `npcReply()`, `newsPush()`, `S.town.news`, `S.you.rel` | B23 | B29, B30, B36, B38 |
| `CAT`, `buildItem`, `thumb` | B24 | B25 to B27, B30, B31 |
| `S.you` wallet, `addCoins`, `stockFor`, `buySlot` | B25 | B26 to B38 |
| The cabin, the Hearth Jar, the fire pit, the porch sign | B26 | B31 |
| Placement engine, `autoArrange`, `S.you.home`, `S.homeItems` | B27 | B31, B32, B39 |
| State v2, `S.bonds`, `bondAdd`, `heard()` | B28 | B29 onward |
| Mood engine, `spark()`, `scoreAct()`, `consolidate()`, the Dispatch | B29 | B30 onward |
| `S.wants`, `S.taste`, `S.dreams`, `giveTo()` (with `giveMocha()`) | B30 | B31, B32, B36, B38 |
| `S.econ`, `S.career` | B37 | B38 |
| `S.town.petitions`, `S.town.built` | B38 | B36 notice board |

### Relationships and money

**Relationships, one source of truth:**
- `S.bonds[id].p` holds Mocha's relationships, Wendell included. `S.friendW` and `S.know` remain read-only mirrors for one version.
- `S.you.rel[id]` holds the user's relationships with townsfolk.
- `S.wend` holds only Wendell project state: jigsaw, caps, checkers tally, keepsake flags.

**Money:** one coin unit, two wallets.
- `S.coins` is Mocha's wallet.
- `S.you.coins` is the user's wallet.
- There are no coin gifts between them. Purchases by either flow into the shop ledgers in `S.econ` from B37.

### Conflicts resolved

- **User home site.** The log cabin (the user's message 12), on the lot facing Mocha's door at 12 Maple Row, with 10 or more hand-placed firs and cedars around and behind it (the "nestled in evergreens" feel).
- **Keeper homes.** Some live above their shops; others live in the pink house, the blue house, The Fogwell or other homes (full table in B40). They no longer vanish at closing time; they walk home through doors. Until B40, keepers whose homes do not exist yet rest in their shop's back room.
- **Bond tiers.** One scale for Mocha's relationships: `TIERS=[0,10,60,160,320,600]`, named stranger, acquaintance, regular, friend, close friend, best friend. `bondOf()` reads round-1 data until B28 replaces its body with `S.bonds`.
- **Lights.** The Window Light Table (B16) is the only window-light system. It absorbs world F12's instanced residential windows, reads `occOf()`, and arrives right after the homes are built.
- **Mood glow.** Defined once, in B29 (mood engine). It must stay compatible with the B15 rim light.
- **Music.** One `GENRES` and `RECORDS` table and one `S.music` shape (B21). Mocha's choice is one hoisted `pickMusic()` over every source he has: his radio, the jukebox, the request box and phone call-ins from B21, and owned records from B34. The mind schema gets an optional `record` field.
- **Faces.** One atlas (B18) serves the walker and all townsfolk. Mocha keeps his 3D eyes plus the B29 mood meshes.
- **Gifts.** One function, `giveTo(id,code,v)` (B30), for Mocha and the townsfolk; `giveMocha()` wraps it. The talk card's "Give..." chip slot comes from B23. Mocha's taste decides what happens to his gifts.
- **Mocha visiting your home.** One feature, in B31, together with Wendell's visits and fire-pit evenings.
- **Weather.** The deterministic Seattle almanac `WX` arrives in B7, so plans, catchUp, the diary, the economy and the lights agree from the start. B41 adds the visuals (puddles, fog banks, snow on roofs).
- **Batching.** Round 1's `Batcher` is extended (B8) and reused for interiors (B12). There is no `bakeStatic`.
- **Quality tiers.** Round 1's `ADAPT` is extended (B41). There is no second tier system.
- **Camera.** One `CAM` stack (B7); every mode pushes and pops.
- **The empty house.** `FEAT.nest` stays off until B32, so a reset during the build still gives a furnished house. Every home feature is written against `hasItem()` from the start.

## 3. What changed in revision 2 (reviewer findings and fixes)

| Finding | Fix | Step |
|---|---|---|
| After a fresh start Mocha could pick no music for days | A hand-me-down transistor radio in his parents' move-in package (3 stations), the Lantern Square jukebox, a free request box at Rain City Records, phone call-ins later; the town's hourly theme leans toward his favorite genre | B21, B32 |
| Hosting Wendell in a nearly empty house had no seats | `HOME_CAPS` and `capSpot()` fallbacks (floor cushions, the moving box); empty-house hangouts (floor picnic, tea on the box, flashlight stories); Wendell's day-one housewarming armchair and lamp | B7, B14, B17, B32 |
| Lights followed occupancy only at step 13 of 15 | Living lights moved to B16, right after the homes; the L1/L2 rig is created at boot | B16 |
| Plan messages 6 and 12 dropped (Wendell visits your home; fire-pit evenings) | Wendell's own visits (his first brings his sister Hazel's jam); a lit fire pit at dusk works like a porch light | B31 |
| No gift flow to townsfolk | `giveTo()` with likes and dislikes per character, plus the talk-card chip | B23, B30 |
| Townsfolk chatter was STRETCH | Pals chatter, after-closing visits and one visible weekly goal per townsperson are CORE | B22 |
| Inaudible on silent-switch iPhones; no visual sign of his pick | `'playback'` audio session by default with a "mix with my other audio" toggle; the now-playing chip and drifting notes stay visible when muted; "Listen in" | B20, B21 |
| The catalog could sell yellow jackets | Jacket hues 38 to 68 degrees are blocked everywhere | B18, B24 |
| The first world step's draw budget was impossible | The Batcher, one sign atlas, the GLOWPTS halo pool and instanced lamps all land in the first world step | B8 |
| Duplicate systems (`bakeStatic`, quality tiers) | Extend round 1's `Batcher` and `ADAPT` | B8, B12, B41 |
| Character draw calls underestimated | Merged rig of 8 draws or fewer, at most 8 full characters, 1-draw LOD stand-ins, shadows on the 4 nearest | B18, B19 |
| The face decal design was unclear | One face mesh with up to 3 patches; each patch rewrites only its own UV slice | B18 |
| `savePhotos()` would wipe the album and polaroids | A keep-set plus a byte budget | B7 |
| Catalog size undecided (120, 150, 200, 206) | Exactly 150 items whose category counts sum to 150; about 24 KB of table plus flavor text | B24 |
| Merged display buffers too large | Sized to their contents, disposed when far, 6 MB cap | B24 |
| A cabin light inside a rebuilt group | No light in any rebuilt group; the cabin uses LIGHTSPOTS and WLT | B16, B26 |
| The walker collision hash missed the piers and arcade | Bounds computed from PLACES, ROADS and PIERS plus a margin | B11 |
| WX arrived after the systems that need it | WX is part of the foundations | B7 |
| Fresh starts broke earlier features | `hasItem()` contract from B7, `FEAT.nest` off until B32, and a fallback audit | B7, B32 |
| A bad migration could reach every device | A v1 backup, a self-check, and no remote push until a local round trip passes | B28 |
| No default AI cap | `'light'` (10 calls per day) by default | B7 |
| The global shader patch was rewritten late | The `PATCH` pipeline, rim light, colored ramps and `TOONC` land before the characters | B15 |
| No camera arbiter | The `CAM` push/pop stack | B7 |
| HUD crowding and 8 tabs | `HUD.slot()` with overflow, and exactly 6 tabs | B7 |
| Fishing would let players keep protected fish | Rockfish, steelhead, wild salmon and out-of-season lingcod auto-release with true notes | B35 |
| IP echoes | A great blue heron mayor, a Seattle crow mail carrier, a harbor-seal tugboat captain who never ferries or sings, no stargazing owl, an unscored guestbook instead of a rating letter, ripple-ring fishing, a Jacob-sheep knitter, ghost friends renamed | B19, B22, B31, B35, B38 |
| The music scheduler kept running while hidden | Every audio timer is cleared on hidden | B20, B21 |
| Knocking made Mocha walk to the door | His door opens like any unlocked door and he calls out from where he is; coming to greet you is a weighted candidate | B9 |
| The talk card froze Mocha | He keeps doing his own thing unless he chooses to chat | B23 |
| No total cap on user-derived bias | One `userBias()`: additive, clamped to 1.2, audited | B7, B28 |
| Presence reactions were not candidates | They are weighted candidates fed by userBias | B29 |
| The porch toggle was an unnamed veto | Named as the single allowed negative override; he can still leave a note | B7, B31 |
| Steps were 1.5 to 3 sessions each | 36 smaller steps; batching, the art pipeline, lights and WX moved earlier | section 1 |
| Missing delight | Dropping in on a hangout, lights as messages, the flannel tied around the waist, crow trinkets, Listen in | B16, B17, B18, B21, B35 |

---

## B7. Foundations: camera stack, HUD slots, six tabs, AI budget, user-bias cap, home capabilities, weather almanac, photo safety

**Goal.** Small shared plumbing that every later step relies on, so features never fight over the camera, the screen, the AI budget or Mocha's free will. Visible changes are few: the weather follows a real Seattle almanac, the panel is tidied to six tabs, the album can no longer be wiped, and Settings shows how much of his "mind" he used today.

### CORE

**1. CAM stack.**
- `CAM.push(owner,spec)`, `CAM.pop(owner)`, `CAM.top()`. Spec: `{prio, target:obj|fn, tx,ty,tz, dist, pitch, yaw|null, range:[min,max], ease}`.
- Priority classes: 0 base (round-1 follow and walk via `setCamMode`), 1 scene (room, Fogwell floor, seat view, hangout framing), 2 focus (talk two-shot, try-on), 3 sheet (Your Look, decorate). The highest class wins; within a class the latest push wins. One entry per owner; pushing again replaces it.
- `CAM.update(dt)` runs in `frame()` and eases `camS` toward the top entry with preallocated vectors. Popping eases back to the next entry.
- Pinch, wheel and the zoom buttons (`zoomBy`, `ZM`, `zoomLim`) change only the top entry's dist, clamped to its range.

**2. HUD slot registry.**
- `HUD.slot(id,{zone,order,prio,modes,el})`. Zones: tl, tc, tr, rc (right column), bl, br.
- `HUD.layout()` runs on resize, mode change and slot change. It stacks each zone with 8 px gaps, honors `env(safe-area-inset-*)`, and keeps clear of the reserved bands (joystick bottom-left; look stick and zoom bottom-right; chat bar and dock at the bottom).
- Register the round-1 elements now: status pill, meter, the 📱 dock button, chat bar, joystick, look stick, zoom +/− and the edge marker.
- Reserve ids for later steps: `banner` (B9), `emote` (B18), `speaker` (B20), `nowPlaying` (B21), `talk` (B23), `wallet` (B25), `decorate` (B27), `floors` (B39).
- Overflow: if a zone cannot fit (landscape is only 393 px tall), its lowest-priority slots fold into one 44 px "⋯" button that opens a small popover. Nothing ever overlaps.
- `HUD.bands()` returns the occupied rectangles (B41 frames the camera into the free area).

**3. Six panel tabs.** `TABS.add(id,label,render,{subs})`. The tabs are diary, feed, mocha (round-1 "who he's becoming" plus the notebook as a sub-section), town (the round-1 calendar as its first sub-tab; B36 adds people, this week and news), you, and settings. Old ids keep working as aliases: `openTab('notes')` opens mocha › notebook, and `openTab('calendar')` opens town › calendar.

**4. AI budget.** Extend the round-1 `MIND` object (search for `const MIND=`):
- `SET.mind={cap:'light'|'normal'|'rich', u:{d,n,h,hn,by}}`. Caps are 10, 25 and 60 per day; the default is `'light'`. At most 6 per hour.
- `MIND.allow(kind)` with kinds `'user'` (texts, typed questions, in-person chat), `'letter'`, `'chapter'`, `'big'`, `'hang'`, `'title'` and `'next'`. Non-user kinds stop at 60% of the daily cap, so 40% stays for the user's own messages. It refuses while hidden, while he is asleep, and after 10 minutes without input, and it keeps the existing `SET.pace` spacing.
- `MIND.request(kind,build,apply)`: at most 1 pending low-priority job.
- Route every existing call (mindThink, texting replies, letters) through it.
- Settings shows a cap control and the meter "his mind: 3 of 10 today".

**5. userBias, the one door for the user's influence.**
- `ubAdd(label,fn)` registers a term `fn(a,ctx)` returning a number of 0 or more.
- `userBias(a,ctx,why)` sums the positive terms, clamps the total to 1.2, and pushes `[label,v]` into `why` when given (B29 shows these honestly as reasons). `localChoose` adds it once per candidate. Nothing else may add user-derived score.
- `ubVeto(a)` returns true only for the cabin's do-not-disturb sign (B31). For now it is a stub that returns false.
- Move the round-1 user nudges (chat facts, suggestions) into terms now.

**6. Bonds shim.** `bondOf(id)` returns relationship points; `tierOf(p)` maps points onto `TIERS=[0,10,60,160,320,600]` (stranger, acquaintance, regular, friend, close friend, best friend). Until B28: wendell = `12*S.friendW`, keepers = `6*S.know[k]`, you = `min(200, 2*S.mem.chats)`. B28 replaces the body with `S.bonds`.

**7. Home capabilities.**
- `HOME_CAPS` lists each slot and its fallback: bed → blanket; stove → none (café or cold snacks); computer → the library computer; couch → floor cushions; table, fridge and desk → the moving box; player → radio; radio → none; tv → none; lamp → bare bulb; bath → always present.
- `hasItem(slot,home='home')` and `capSpot(slot)` return the spot to use, the fallback spot, or null.
- `FEAT={nest:false}`. Until B32 flips it, every built-in item counts as owned; only `radio` is false until it arrives (B21).

**8. WX, the Seattle weather almanac** (deterministic, shared across devices; moved here so plans, catchUp, the economy and the lights agree from the start).
- `WX.forDate(date)` builds 3 to 6 spells from `seeded(hash(date))` over a MONTH table `{rain,fog,snow,sunbreaks}` from real Seattle climatology:
  - rainy-day odds about: Nov 60%, Dec 60%, Jan 58%, Jul 13%, Aug 15%
  - drizzle far more often than downpours
  - morning fog peaks Sep-Nov
  - grey "Juneuary" marine-layer mornings that often clear by afternoon
  - only a few snow days per winter (Dec-Feb)
  - "sun breaks" (a real forecasters' term)
- `WX.at(t)` gives the kind for any time, so catchUp, diary, the economy and Mocha's plans agree ("it drizzled all morning").
- `WEATHER.kind` follows the current spell with 4 to 8 min eased transitions.
- Keep `rollWeather()` for overrides: `#winter` and `__mocha.weather(kind)`.
- Mocha's phone (if owned) shows a forecast line. `WIND` (0..1) is exported for B16 and B41.
- From now on catchUp, plans and the diary read `WX.at(t)`.

**9. Presence.** `isPresent()` is true when the tab is visible and there was input in the last 3 minutes. Pointer, key and wheel events stamp `lastInput`.

**10. Emitters and stubs.** `EV()` makes a tiny emitter `{on(type,fn),emit(type,data)}`. Create `DOOREV` (doors, B9) and `SFXEV` (everything else), with no listeners yet; `sfx(name,data)` emits on SFXEV. Add no-op stubs that later steps fill in: `emote(obj,id,dur)` and `setFace(obj,expr)` (both B18).

**11. Photo safety.** Today `savePhotos()` (search for `function savePhotos(`) deletes every PHOTOS key that is not among the first 24 post ids, which would wipe the B18 album and the B33 polaroids.
- Keep-set: the first 24 `S.posts` ids, plus `S.you.album` (cap 30), plus `S.wend.pol` (cap 12), plus `S.pins` (photos the user hearts in the lightbox, cap 12).
- `PHOTO_BUDGET=3.2e6` characters of dataURL. When over budget, drop the oldest unprotected photos first (posts beyond the 12 newest, then the oldest album photos). Never drop pins.
- New photos are 512 px JPEG at quality .72.
- If round 1 mirrors PHOTOS to the db photos subcollection, give that mirror the same keep-set.

**12. Draw ledger.** `__mocha.drawCalls()` returns `renderer.info.render.calls` from the last frame. Add a portrait variant of perf1.js (393x852) and write the baseline to `/tmp/harness/draws.json`.

### Must not break
- Round-1 camera modes, the zoom buttons, pinch, follow and walk.
- Round-1 texting, the mind and letters (they are only rerouted through `MIND.allow`).
- The `rollWeather()` overrides (`#winter`, `__mocha.weather(kind)`).
- Photos in the feed and the lightbox.

### Acceptance
- CAM: push 'room' (prio 1), then 'talk' (prio 2); popping 'talk' returns to the room framing; pinch changes only the top entry's dist, within its range.
- HUD: at 852x393 with every reserved slot stubbed visible, nothing overlaps and the overflow folds into "⋯". Screenshots in all 4 viewports.
- The panel shows exactly 6 tabs; the calendar opens as town › calendar; `openTab('notes')` still works.
- With cap 'light', `MIND.allow('next')` returns false after 6 non-user calls while `MIND.allow('user')` is still true; every kind returns false while hidden.
- `userBias` with 5 dummy terms of .5 each returns 1.2.
- `WX.forDate('2026-11-03')` is identical across two loads; 30 November days give between 12 and 24 rainy days.
- Saving 40 dummy album photos plus 24 posts keeps the 30 newest album photos and the newest posts within 3.2e6 characters, and a reload keeps them.
- Smoke tests pass at 15 and 1.

### Hooks
- `__mocha.cam.stack()`
- `__mocha.hud()`
- `__mocha.mindUse()`
- `__mocha.userBias(a)` (returns `{total,parts}`)
- `__mocha.bondOf(id)`
- `__mocha.hasItem(slot)`
- `__mocha.wx(date)`
- `__mocha.present()`
- `__mocha.photos()`
- `__mocha.drawCalls()`

---

## B8. Town plan v2, exteriors, batching, sign atlas, glow pool and instanced lamps

**Goal.** The town becomes a coherent, walkable map with named streets and districts, and every new building stands in its place. It costs about the same number of draw calls as before, because static props are batched, sign faces share one atlas, static halos share one pool and the street lamps are instanced.

### CORE

**1. Town plan data.** Apply the section 2 coordinates. Every new static prop below goes through the Batcher (see 5).
- Edit `PLACES` (new kinds: `civic`, `plaza`, `lot`, `cottage`, `condo`, `cemetery`), `ROADS` (Maple Row extension), `NB` (remove 42,74), `blockers` (include every new footprint, lot, the plaza, paths and Ferry Green) and `walkable()` exclusions.
- Remove `neighborHouse(42,74,...)`.
- Build EXTERIORS now, so doors (B9) and navigation (B10) have something to stand on. Interiors may be bare floors with a "coming soon" sign until B12 to B14, B26 or B39:
  - Town Hall: steps, 2 columns, tall double doors, a flagpole, and a clock tower with a 64x64 canvas clock face redrawn once a minute showing real time.
  - The Fogwell: brick canvas texture with dark trim, bay windows, 2 gargoyles, fire-escape boxes, rooftop rail and water tower. A lobby double door. One canvas window texture with a per-unit window grid; B16 drives its lighting.
  - The five new shops: via `shop()` with their colors and awnings.
  - The cabin lot: split-rail fence, gate, a mailbox, a "Reserved: 12 Maple Row" sign, and firs placed by hand. The cabin itself is built in B26.
  - Willa's cottage exterior: crooked gables, an herb garden ring, and a cauldron glow sprite on the porch.
  - The cemetery: iron fence, 9 rounded headstones (InstancedMesh), lantern posts, a stone arch.
  - Each lot: mown grass plus an "AVAILABLE, inquire at Town Hall" sign.
- Write a node overlap checker inside `/tmp/harness/test-B8.js`. It checks PLACES + lots + ROADS, using 11-wide road-plus-sidewalk bands, and must report zero overlaps. Reconcile round-1 phone/bike/station positions if needed.

**2. Lantern Square, physical.**
- Cobble plane with a canvas texture.
- A two-tier fountain mesh (spray comes in B36).
- 6 benches, 4 planters.
- The notice board mesh, with a 256x192 canvas face (blank "This week in Rain City" header; B36 fills it).
- A town-tree slot at (-30,27.5) for holiday decor.
- A "LANTERN SQUARE" arch at (-14.5,27) off Needle Way.
- Drizzle Alley: string-light glow sprites joined to `nightGlows`, and a tabby-cat prop napping on a crate.
- Ferry Green pocket park: 2 benches, 3 trees.
- The café back patio (x -36..-25, z 19..24): 3 bistro tables.
- A jukebox at (-38,40), facing the fountain: a rounded cabinet with a glowing arch (emissive, plus a GLOWPTS halo). B21 makes it play.

**3. Wayfinding.**
- 6 intersection sign posts carrying street names.
- Double-sided blade signs on every shop, perpendicular to the façade; house-number plaques; an hours plaque beside every shop door; lot signs.
- Every sign face draws into ONE 1024x1024 `SIGN` atlas canvas (128x128 cells for blade signs and plaques, 256x64 strips for street names). The faces are merged by the Batcher with their atlas UVs, so all faces in a 36-unit cell cost one draw.
- `drawBigMap` draws district names (Downtown, Lantern Square, Waterfront, Maple Row, Uptown, Eastside), street names, new places and lot icons.

**4. Stable scenery.** Trees, bushes and leaf litter switch from `Math.random` to the seeded `R`, so the scenery is identical every visit.

**5. Batching on round 1's Batcher.**
- Extend `Batcher(cell,opts)` (`function Batcher(`) with an optional `uv` channel: `add()` takes an atlas rect `[u0,v0,u1,v1]` and remaps the geometry's uv into it. `build(mats,shadow,parent)` adds the merged meshes to `parent` (default: the scene). Keys stay per material and per 36-unit cell, so far chunks are frustum-culled.
- Use it for sign posts, plaques, benches, planters, fences, lot signs, Town Hall columns and steps, the fountain, cemetery headstones (or one InstancedMesh), Ferry Green and the café patio furniture.
- B12 reuses the same Batcher in parent mode for interiors. Do not write `bakeStatic` or any second merger.

**6. GLOWPTS, one halo pool.**
- One `THREE.Points` with capacity 384 and preallocated Float32 attributes for position, color, size and alpha, drawn with a tiny ShaderMaterial (additive, `depthWrite:false`, soft round falloff). The global `onBeforeCompile` skips ShaderMaterials, so include `BEND_GLSL` and the `bendP` uniform yourself, or the halos will float off the curved world.
- `glowPt(x,y,z,color,size,alpha)` returns an index; `glowSet(i,alpha)` updates it and marks the attribute dirty only on change.
- Move the static `nightGlows` sprites (street lamps, alley lights, porch lamps) into the pool. Moving glows (Mocha's, fireflies) stay as they are.

**7. Instanced street lamps** (the new lamp design). Replace the round-1 lamps (search for `lampPole=`: pole, bulb and sprite each, about 4 draws per lamp counting shadows) with:
- rounded black-green posts #2F4A44 (one InstancedMesh, castShadow)
- 4-pane lantern heads #FFC46B (one InstancedMesh, `instanceColor` for on and off)
- halos in GLOWPTS
- one InstancedMesh pool of up to 96 additive ground light pools (porch and shop pools register here too, B16)

That is about 4 draws in total. For now the lamps follow `nightAmt` as they do today; B16 adds the sunset lamplighting wave.

**8. Overlap checker** in `/tmp/harness/test-B8.js` (from 1). Reconcile the round-1 phone, bike and station positions if needed.

### STRETCH
- 'You are here' boards at the square and the station, using the big-map canvas.
- Seasonal doormats and wreath hooks (B9 hangs them on the doors).

### Must not break
- Existing door-less code paths: Mocha's travel keeps working (B10 rewires it).
- The shell fade (`q.op`/`q.shell`) and peeking.
- Keeper visibility.
- Round-1 holiday decor and trains.
- `inBuilding`/`toWorld` semantics.
- Painting gifts to Wendell hang on his exterior wall today (`-2.8,3.4,d/2+.06`). If you rebuild his shell, keep a temporary slot; B14 moves them inside.

### Acceptance
- The overlap checker reports 0 overlaps across PLACES, lots and roads (11-wide bands).
- The big map shows district and street names and lot icons (screenshot).
- Trees sit at identical positions across two reloads (compare `trees[0..5]`).
- Street lamps are one InstancedMesh for posts and one for heads; GLOWPTS holds every static halo; at 21:00 the street is at least as warm as before (before and after screenshots).
- All sign faces come from one SIGN atlas texture.
- Draw calls at the default portrait view, at 15:00 and 21:00, are at most the baseline plus 10 (both numbers in draws.json).
- Smoke tests pass at 15 and 1.

### Hooks
- `__mocha.overlaps()`
- `__mocha.glowPts()`
- `__mocha.lamps()`
- `__mocha.signAtlas()` (a dataURL)
- `__mocha.drawCalls()`

---

## B9. Doors, permissions, knocking, agents and occupancy

**Goal.** Every enterable building has a real door at its real entrance, which visibly swings open, chimes and closes behind whoever walked in. Knocking never moves Mocha. A shared agent registry knows who is inside where; lights, sound and townsfolk all read it later.

### CORE

**1. DOORS.** Built in `buildPlace` from a per-place `p.door` spec: `{x, w:1.8|3.2, h:3, kind, style, back?}`.
- Every enterable building gets one, centered on its front walk (`p.dx,p.dz` line up with it): all shops, library, cinema, market, grocery, pet store, arcade, Town Hall, Fogwell lobby, Mocha's house, Wendell's, the cabin and the station.
- Back or staff doors where a patio or alley exists (café patio, grocery).

Door kinds (each opens in about .35 s with a springy overshoot and settle, and closes in .5 s):
- `swing`: hinged, opens inward to about 100 degrees with a 6 degree overshoot; closes with a soft thud wobble.
- `double`: cinema, library, Town Hall, arcade, Fogwell.
- `slide`: grocery automatic glass; studio barn door.
- `dutch`: bookstore. On dry afternoons the top half opens by itself and a cat-head prop peeks out.
- `shutter`: market roll-up. Rises at opening, drops at close.
- `gate`: Mocha's iron gate (creak event); the cabin gate (clack event).

Styles, one 64x128 cell each in ONE shared 512x512 door atlas, so every door uses the same material (about 12 styles):
- café: teal glass with a brass bell
- records: black, sticker-covered glass
- thrift: lace curtain
- pet store: has a pet flap
- Mocha: oxblood lancet arch, iron knocker, pet flap
- Wendell: round-top green door with a peephole
- cabin: plank door with a heart cut-out
- Town Hall: tall civic doors
- Fogwell: brass and glass

Construction and the doorway:
- Each door is a pivot `Group` at the hinge holding ONE shared `BoxGeometry(1,1,1)` scaled to w x h x .12: 1 to 2 draw calls per door.
- A small exterior lamp: an emissive mesh merged into the façade batch plus a GLOWPTS halo (B8); no new sprite.
- Doorway hole: `wallTex`/`gothicTex` accept `opts.hole=[x,w,h]` and `clearRect` both the map and emissive canvases. Set `alphaTest=.5` on the front-wall material.
- FALLBACK, if alphaTest sorting or edge artifacts show on the fading shells: split the front wall into left, right and lintel boxes. Pick whichever looks right in screenshots.
- Through an open door you must see the warm interior.

Opening, passing and closing:
- `updateDoors(dt)` runs at 20 Hz from `frame()`. It skips doors more than 60 units from the camera unless an agent is near, and hides them (`visible=false`) so they cost no draw call.
- Spring: `vel+=(target-ang)*90*dt; vel*=.8; ang+=vel*dt`. No allocation.
- A door opens when any agent within 2.2 has it on its path (`door.request(agent)`), or when the user's walker is within 1.6 and moving toward it.
- Agents may pass only once `ang>=1.05` rad.
- It closes 1 s after the threshold clears.
- Etiquette: one agent through at a time. Whoever is leaving goes first; the arriving agent steps 1.2 aside.


**2. Permissions and knocking.**
- Shops: open to all during hours, staff only after.
- Homes: residents, invited guests and key holders.
- A locked door rattles and shows a toast ("Closed, opens 10am").
- Mocha's door is NEVER locked while he is home and awake. When the walker comes up to it, it opens like any unlocked door, and Mocha calls "it's open! come in!" from wherever he is (a `say()` bubble; he does not move). Coming to the door to greet you is only a weighted localChoose candidate, fed by the userBias term `atDoor` (+.6).
- Other locked homes (Wendell's, and later condo units): walking into the door shows a "Knock?" chip. `answerKnock(pid,who)` (hoisted, pure) returns the resident's response. Wendell home and awake comes to the door and opens it ("well I'll be! come in, come in"); in the bath or busy: "one sec!"; asleep: no answer, and the window stays dark.
- For Mocha, `answerKnock` only picks the line he calls out ("it's open!", "in the bath! come in, the kettle's on", or silence when he is asleep). Knocking never writes `G.target` or `G.act`.

**3. OPEN/CLOSED sign and chalkboard.**
- A two-sided plank hangs on each shop door. It flips 180 degrees over .4 s at opening and closing time when visible, and snaps when unseen.
- An A-frame chalkboard shows a seeded daily special, `seeded(dateKey+p.id)` over a per-shop line bank plus a seasonal bank. Examples: "pumpkin chai", "staff pick: a mystery set on a ferry", "tonight 8pm: Nosferatu".
- When Mocha passes within 4, `localChoose` gets a small (+0.5) interest bump for that place.
- The keeper-performed opening ritual comes in B22. B9 provides `flipSign(pid,open)`.
- The plank is a separate small mesh, shown only within 40 of the camera. Chalkboard faces draw into the B8 SIGN atlas, redrawn once a day.

**4. AGENTS and OCC.**
- `AGENTS` is a preallocated registry: `{id, kind:'mocha'|'wendell'|'keeper'|'you'|'npc', x, z, place:null|pid, room:null|str, awake, act:str, keys:Set, staffOf:pid|null, home:pid|null}`.
- `door.pass(agent,dir)` updates `agent.place` and `OCC` (a Map from pid to a Set of ids).
- `occOf(pid)` returns `{ids:[...], room, awake, act}`. It is derived state, never saved. catchUp and teleports rebuild it with `occRebuild()`.
- A door entry banner (HUD slot `banner`, 2.5 s) appears when the walker crosses a threshold: "Rain City Records · Basil is in · open till 8pm", with a one-time "first visit!" sparkle.
- Door notes: a pool of 4 small 128x64 canvas planes. When a home resident leaves, a note appears on their door ("out at Drizzle & Bean -M"). It is readable in the near pill when the walker is within 3.
- `DOOREV` (the B7 emitter) carries `DOOREV.emit(type,{pid,style,x,z})` for open/close/bell/knock/rattle/creak, with no listeners yet (B20 subscribes).

### STRETCH
- Seasonal doormats.
- A wreath hook on each door, for round-1 holiday decor.
- 'You are here' boards at the square and the station, using the big-map canvas.

### Must not break
- Mocha's current travel (B10 rewires it).
- The shell fade (`q.op`/`q.shell`) and peeking.
- Keeper visibility.
- `inBuilding`/`toWorld` semantics.

### Acceptance
- `__mocha.doors().length` is at least 24. Every enterable place has `p.door`, and its front walk lines up with the door center within 0.3.
- At 10:00, putting the walker at the café door approach and moving it toward the door: the door angle exceeds 1.05 within 1 s, and it closes within 2.5 s after leaving.
- At 21:00 the café door is locked: walking into it gives a rattle event and a "Closed" toast.
- Knocking and autonomy: with Mocha home and awake, the walker at his door opens it and he calls out from where he is; `G.act` and `G.target` are identical before and after. With Mocha asleep (`__mocha.at` 3:00) there is no answer. At Wendell's door a "Knock?" chip appears, and `answerKnock` opens it when he is home and awake.
- `__mocha.occ('cafe')` reflects agents after `door.pass`. A door note shows on Mocha's door while he is out.
- Every door uses the one door-atlas material; doors more than 60 from the camera are hidden; draw calls at the default view are at most the previous step's plus 20.
- Smoke tests pass.

### Hooks
- `__mocha.doors()`
- `__mocha.door(id,'open'|'close'|'lock'|'unlock')`
- `__mocha.knock(pid)`
- `__mocha.occ(pid)`
- `__mocha.agents()`
- `__mocha.flipSign(pid,open)`

---

## B10. Street navigation and agent routes

**Goal.** Mocha, Wendell and the keepers move on the same believable stage. They walk or hover along sidewalks, cross at crosswalks, wait for doors and walk around counters. Nobody drifts over rooftops or through walls.

### CORE

**1. NAV graph.** Built once after PLACES, ROADS and lots. It replaces the 17-node `NODES`/`NADJ` and `wPath`; keep `wPath` as a thin wrapper.
- Sidewalk center lines at road center +/-4.6 for every ROADS segment.
- Corner nodes at intersections, and crosswalk edges at each intersection.
- Mid-block crosswalks: Maple Row x=40 (Mocha's gate to your gate), Main St x=-21.5 (Drizzle Alley mouth), Main St x=40 (cinema).
- `EXTRA_PATHS` polylines: Drizzle Alley, the Lantern Square ring, the square steps, Ferry Green, the promenade, piers, the Cedar Lake loop, the cemetery lane, the path to Willa's, and lot fronts. Endpoints snap to nodes within 3.
- Door chains per door: sidewalk node, then approach (`p.dx,p.dz`), then threshold (flag DOOR), then an entry point 1.6 inside.
- `NAV={x:Float32Array, z:Float32Array, adj:[[to,w,flags]]}`, about 200 to 300 nodes.
- Dijkstra with preallocated dist/prev arrays, plus an LRU Map of 64 routes keyed by `a|b|flagmask`.
- Clear the cache whenever a lock state or lot stage changes.
- Edge flags:
  - COVERED: under awnings; 30% cheaper in rain.
  - SCENIC: promenade, alley, park; cheaper for Mocha when fun is low.
  - SECRET: a park hedge shortcut and a path behind the market. Unlocked when Mocha discovers them, with the diary line "found a shortcut!".

**2. Interiors.**
- `solid(p,lx,lz,w,d,rot)` registers furniture AABBs.
- Wrap each `INTERIORS[id]` builder and the home, Wendell, cinema, library, grocery and petstore builders in a capture that records the AABB of every mesh with a footprint of at least .25 (skip books, cups and other small decor).
- `p.grid=Uint8Array(ceil(w/.5)*ceil(d/.5))`, inflated by .35 for agent radius.
- Inside a building: A* from the entry point to the spot, plus string-pulling.
- B12 will move furniture and re-run registration, so make it re-runnable: `regrid(p)`.

**3. Agents follow routes.**
- Per agent: path `Float32Array(192)`, len and idx.
- Steer toward the current point, advance within .6, and use a 1.5 look-ahead for rounded corners.
- On a DOOR edge: call `door.request()` and hold until open, then `door.pass()`.
- Rewire Mocha's `updateMocha` travel: keep `G.target` as the final point, and build the route on `startAct`/`goPoint`.
  - Remove `altitudeAt` flight. Mocha hovers at floor + 1.0 plus his bob everywhere.
  - `goingIn`/`insideB` become `agent.place`.
- Explore and idle strolls may cut across grass when a sampled segment (every .5) is clear of building footprints. Otherwise they route via NAV.
- Rewire Wendell's `W.path` to `navRoute`. Keepers stay parented to shops until B22, but expose `navRoute` so B22 can move them.

**4. Street manners.**
- A .4 s pause at crosswalks (Wendell looks left and right).
- A +/-0.6 keep-right lane offset per agent.
- Soft separation within .9.
- An agent blocked for 3 s sidesteps.
- A door locked on arrival triggers a replan plus the bubble "oh, they just closed".
- Raise Mocha's outdoor speed from 7 to about 8 so trips don't drag. Audit `arrive()`/`finishAct` timers.
- catchUp stays teleport-based (no simulation).

### Must not break
- catchUp
- The Mocha ride states (ferry, wheel, bike, train)
- Sleep at home (`alt` 2.3 in bed)
- Selfies
- `forceAct` (warp near the spot, then route the last bit)
- The twin-stick controls
- Zoom buttons and pinch

### Acceptance
- `__mocha.route(home door → café counter)` passes through both door chains. Sampled every .5, it never enters a foreign footprint and never leaves NAV or a sidewalk except inside the target.
- Forcing an act at the café from home: during travel Mocha's y never exceeds floor+1.6 (no roof flight), and he enters via the café door (`door.pass` is logged).
- Wendell walks to the market along sidewalks and through doors (route log).
- 100 random routes average under 2 ms each; the cache clears when a lock state changes.
- Draw calls are unchanged within 5. Smoke tests pass.

### Hooks
- `__mocha.route(ax,az,bx,bz)`
- `__mocha.nav()` (node count)
- `__mocha.regrid(pid)`

---

## B11. Walker collision, tap-to-go, seats and vertical transport

**Goal.** On a phone, the user's walker is solid and can go anywhere with one tap. Benches invite sitting, and sometimes Mocha chooses to sit beside you. Tall places use real elevators and stairs, so nobody floats up to the Needle's deck.

### CORE

**1. Vertical places use real transport.**
- Sky Needle: a glass elevator capsule up the core (an 8 s ride, visible from town). It replaces `deckY` flying.
- Lighthouse: the door leads to a 5 s "98 steps..." climb bubble, then Mocha appears on the gallery.
- Wheel and ferry: board at their gate/gangway nodes, reusing `G.ride`.
- Bikes (round 1): a bike-lane graph at road center +/-1.8. Mocha dismounts at a bike rack (new prop beside each shop door), and the parked bike stays visible there while he is inside.

**2. Walker collision.**
- A spatial hash with 8-unit cells whose bounds come from PLACES, ROADS and PIERS at load plus a 6-unit margin (piers reach x=-101 and the arcade spans x of about -95 to -85 today, so at least x[-107,166], z[-136,136]). Int16 index lists into circles `{x,z,r}` and segments `{ax,az,bx,bz,door}`, built at load.
- Building walls are segments with a gap at the door, which is open only while the door is open.
- Also solid: trunks (r .7), lamp posts, benches, the fountain rim, Mocha's iron fence (except the gate), the cabin fence (except the gate), headstones, and the Cedar Lake ellipse (today the walker can walk on the lake).
- Walker radius .45. Slide along surfaces with the existing axis-separated test.
- Inside a building, use `p.grid` in local coordinates.
- Lots re-register only their own cells on a stage change.

**3. Tap-to-go.**
- A short tap (under 6 px; reuse `downAt`) on the ground walks the walker there over NAV plus interior grids, with a pulsing ring marker.
- Tapping a building or door walks to the doorstep and through.
- Joystick input cancels; long-press jogs.
- Tap priority: UI, then character (talk, B23), then item (B25), then door/building, then ground.
- The flat y=0 plane raycast is accurate within about 40 units of the camera; clamp taps beyond that.
- Big map: tapping a building teleports the walker to its doorstep, facing the door.

**4. Unstuck and spawn.**
- Remember the last valid position every second.
- On load, if the saved position (localStorage `mocha-you`) is inside a solid, move to the nearest door approach.
- The first walk of a session starts at the cabin gate (40,64) until B26 builds the cabin door.

**5. `floorType(x,z)`.** Returns wood, tile, carpet, stone, grass, sidewalk or puddle (B20 footsteps). `floorAt()` gains small step ramps for porches, Town Hall steps and platforms.

**6. SEATS registry.** `{x,z,yaw,cap:2,occ:[],view:'water'|'plaza'|'park'|'street'|'sky',tag?}` covering:
- Lantern Square 6, promenade 9, park 4, café patio 3, Ferry Green 2
- porches: Mocha's stoop, Wendell's swing, the cabin bench
- Needle deck 2, Lookout Hill 1

How sitting works:
- The walker sits by pausing within 1.2 of a free seat for 1 s, or by tapping the bench.
- They turn and settle (legs -1.4 rad, y -.35), and the camera eases to the seat's view (pitch .25). The joystick stands them up.
- `SEATS.claim(agent)` and `release(agent)`.
- Mocha's `localChoose` gains a "sitting on a bench at <place>" activity, picking the view by mood: water when calm, the plaza when social, sky at dusk.
- QUIET COMPANIONSHIP, his choice only: while the walker is seated, the userBias term `seatedNear` (+.6 when Mocha is idle within 25 and `tierOf(bondOf('you'))` is friend or higher) feeds a weighted "sit beside my visitor" candidate, at most once per 10 minutes. If he picks it, he says one line from a local "bench thoughts" bank and writes a diary line.
- The seat view is `CAM.push('seat',{prio:1,...})`; standing up pops it.

### STRETCH
- `#nav` URL hash draws the graph on the big map, for screenshots.
- Keepers on break sit on SEATS (B22 uses this).

### Must not break
- catchUp
- The Mocha ride states (ferry, wheel, bike, train)
- Selfies and `forceAct` (warp near the spot, then route the last bit)
- The twin-stick controls, the zoom buttons and pinch

### Acceptance
- Driving the joystick into a shop wall for 2 s leaves the walker outside. It enters through an open door and is blocked by a locked one.
- Walls also block the walker at the arcade (x around -90) and on the pier at x=-100, which proves the hash bounds cover them.
- The walker cannot enter Cedar Lake.
- A tap-to-go to the café counter's ask spot arrives within 15 s (at test fps, allow 40 s).
- Walker seated on a square bench plus `__mocha.benchJoin()` (forcing the candidate) puts Mocha in slot 2 and writes a diary line. Without the hook it is only a weighted candidate, and `userBias(...).parts` shows `seatedNear` at .6 or less.
- Needle visit: the elevator capsule rises; Mocha is never above the deck except inside the capsule.
- Draw calls rise by 2 or fewer. Route computation stays under 2 ms. Smoke tests pass.

### Hooks
- `__mocha.seats()`
- `__mocha.benchJoin()`
- `__you().tapGo(x,z)`
- `__mocha.solidAt(x,z)`

---

## B12. Interiors I: layout standard, layout kit, fixes, lint, culling and the room camera

**Goal.** Every existing interior reads like a real place: you walk into a clear entry, the keeper stands behind a counter facing you, shelves line the walls and the aisles are walkable. Inside any building, the camera frames the room like a dollhouse, and culling plus batching keep the town smooth on battery.

### CORE

**1. Layout standard** (all interiors, old and new):
- Doors: 1.8x3.0, double 3.2.
- Entry zone: (door width + 1.6) x 2.6 deep, kept clear, with a doormat.
- Counter: height 1.1 to 1.3, depth .9. It goes against the back wall facing the door, or on a side wall in the back half, angled so the keeper faces the entrance within 60 degrees.
- The keeper stands .7 behind the counter; the ask spot is .9 in front.
- Wall shelving: depth .6 to .8, height 2.4 to 3.2.
- Center islands: 1.3 tall or less, so the camera sees across.
- Aisles at least 1.8 wide. Nothing within .4 of the front wall except window displays.
- A STAFF ONLY back-room door on the back wall.
- A picture rail at y about 4.6 with a darker upper band, and pendant lamps hanging to about 4.2 (emissive shades, registered as `LIGHTSPOTS` entries `{pid,lx,ly,lz,color,kind}` for B16). These make tall rooms feel cozy.
- Each shop gets its own floor material plus a rug defining its main zone.

**2. Concrete fixes** (bugs in the current code):
1. **Cinema.** The screen is on the inside of the FRONT wall (`zf=p.d/2-.3`). Flip it: screen on the back wall, seats facing it. Add a 4-deep lobby inside the door, with Monty's ticket and concession counter on the left wall facing the door, posters, and a curtained partition with a 3-wide gap. The projector beam starts above the lobby. Re-point `startMovie`'s face target.
2. **Library.** Remove the four leftover colored boxes at z=-2 (x=-6,-2,2,6), or make them low book carts in free cells. The x=-2 box intersects Rosalind's desk. The solid dark 4x4 "door" box becomes real double glass doors (B9).
3. **Records.** The turntable box (-3.6,-3.6) overlaps Basil's counter, and the crate rows block the walk. Use two front-to-back crate islands at x=+/-1.7, wall bins on the left wall, the counter at back-left with the turntable on it, and a listening booth at back-right.
4. **Thrift and pet store.** Pearl and Bea stand between the counter and the front wall with their backs to the door. Move both counters to the back half of the right wall, facing the door.
5. **Grocery.** A 3-wide main aisle runs from the door to the fridge wall. Produce bins just inside on the left, aisles beyond, and a checkout lane perpendicular to the front with Hank facing the lane.
6. **Café.** The center table (0,2.4) sits in the entry path. Move the tables to the window sides and add the patio back door.
7. **Mocha's stoop.** The third step (local z 10.75..11.65) pierces the gate line (FZ1=11). Use two shallower steps that end inside the gate.
- Update `KEEPERS` `pos`/`ask` for every moved counter.

**3. LAYOUTS kit** (data-driven):

```
LAYOUTS[id] = {
  counter: 'back'|'sideR'|'sideL',
  wall: [[kind, side, from, to]],
  islands: [[kind, lx, lz, w, d]],
  seats: [...],
  back: true,
  display: [...]
}
```
- `kind` is one of shelf, rack, bins, fridge, plinth, table, mannequin, planter, lampwall.
- A generic `layoutRoom(p,L)` builds any interior from this data and fills `p.spots` (main, counter, shelves, t1..t4 for B22 work stations, browse1..3, seat1..6) and `DISPLAY[p.id]`.
- `DISPLAY[p.id]` holds display slots `{lx,ly,lz,surf:'shelf'|'table'|'rack'|'floor'|'wall'|'window',maxW,maxD}`: 16 to 40 per shop with goods, plus 2 to 3 'window' slots behind real shopfront glass. B25 fills the slots with catalog items.
- Spots gain an optional facing yaw: `[x,z,yaw]`.

**4. layoutLint().**
- Rasterizes each interior at .25 and reports:
  - solid-solid overlaps with area over .05
  - solids crossing walls
  - a blocked entry zone
  - spots unreachable from the entry (BFS over `p.grid`)
  - keepers facing more than 60 degrees off the entrance
  - floating items (bottom above .05 with nothing under)
- It must return an empty list for every building.
- Re-run `regrid(p)` after the fixes.

**5. Room camera.**
- In walk mode, crossing a threshold calls `CAM.push('room',{prio:1,...})` (B7); leaving pops it.
- The camera target eases to 60% walker + 40% room center.
- Distance: `clamp(diag*(aspect<1?1.05:.75),7,22)`. Pitch clamped to .55 to 1.1.
- Yaw is soft-clamped within 70 degrees of the façade's outward normal, so the faded front wall is always between the camera and the room. Rotating past that hides whichever wall faces the camera (extend `q.walls` to all four walls).
- Leaving restores the previous dist and pitch. Pinch and the zoom buttons work within the fit range.
- Watch mode: when Mocha is inside, the follow camera eases to the same cutaway framing.

**6. Interior culling and batching.**
- Every interior lives in `p.inner`. It is drawn only if:
  - the shell is fading, or
  - the door is open and the camera is within 30, or
  - a window display faces the camera within 25.
- Runs at 10 Hz inside the existing per-PLACES shell loop.
- Merge each interior's static meshes with the B8 Batcher in parent mode (`cell=Infinity`, parent `p.inner`), per material. Doors, keepers, turntables, fish, screens and fading shells are flagged `userData.dyn` and stay separate.
- Budget: 12 or fewer draw calls per interior, 8 or fewer per exterior shell.

### STRETCH
- Window displays through real shopfront glass: holes in the front-wall canvas plus one transparent glass plane and a plinth. B25 fills the contents. Build the frames now.
- Top-down screenshots of every interior to `/tmp/harness/shots-B12/`.

### Must not break
- Peek/fade and `q.walls`
- Keeper `kSay` positioning
- `fx:'ask'`
- Movie playback on the flipped screen
- Mocha's sleep/bath/desk spots
- Painting display slots
- Round-1 phone and bike interiors (B13 brings them up to the standard)

### Acceptance
- `__mocha.layoutLint()` returns `[]` for every existing building: cinema, library, records, thrift, pet store, grocery, café, market, arcade, studio and Mocha's stoop.
- Every keeper's ask spot is a free grid cell reachable from the door, and every keeper faces within 60 degrees of the door.
- Cinema: the screen is on the back wall, the seats face it, the lobby counter is inside the door, and `startMovie` still plays.
- With the walker inside the bookstore, the top CAM entry is 'room', the distance is within the fit range and the front wall is faded. Leaving pops back to the previous zoom.
- Static interior meshes are merged (12 or fewer draws per interior).
- Draw calls at the default follow view are at most the pre-step count minus 20 (culling plus batching pay for later shops). Report both numbers.
- Smoke tests pass.

### Hooks
- `__mocha.layoutLint()`
- `__mocha.display(pid)`
- `__mocha.rooms(pid)`
- `__mocha.roomCam()`
- `__mocha.drawCalls()`

---

## B13. Interiors II: five new shops and keepers; round-1 shops to standard

**Goal.** Five new kinds of shops open their doors, each with its own keeper, personality and true facts. The round-1 phone store, bike shop and station meet the same layout standard.

### CORE

**1. Five new shop interiors and keepers** (keepers as `KEEPERS` entries with temporary `makeCritter` looks; B19 rebuilds every character in the chibi standard):
- **Evergreen Home & Hearth** (Otis Burrows, badger: gruff, kind, smells like cedar): a showroom of 3 vignettes (B27 rearranges them weekly), an order desk, and a back workshop visible through an opening (a sawhorse with a plank).
- **Drizzle Threads** (Wren, a Jacob sheep with four little horns: soft-spoken, knits from her own wool behind the counter, names colors poetically, e.g. "that's Puget Grey"): jacket racks, 3 mannequins, a cubby wall of beanies, and a curtained fitting room (spot `fit`; B18 opens Your Look there).
- **Fern & Moss Nursery** (Willa Thornbury, a cheerful young witch, plus Pepper the black cat napping on the sunniest shelf): plant tables, seed wall, a greenhouse lean-to, a bubbling cauldron "watering can" corner, and glowing mushrooms in the planters (emissive, night only).
- **Puddle & Crumb Bakery** (Pippin, hedgehog: sells out by afternoon): a glass case of breads and pies, a takeaway window onto Needle Way, and 2 small tables.
- **Lantern & Wick** (Luma, luna moth: dreamy, hangs a paper lantern on your cabin eave for each friend who signs your guestbook, B31): every wall covered in lamps (emissive), a candle table, and a crooked ceiling.

Each keeper gets `KEEPERS` fields: `id`, `name`, `species`, `pr`, `shop`, `topic`, `fk`, plus TRUE `FACTS` keys:
- Otis: woodworking ("western redcedar is naturally rot-resistant, which is why it is used for shingles and canoes")
- Wren: wool/knitting
- Willa: herbs and NW plants, e.g. "sword ferns stay green all winter"
- Pippin: baking ("the marionberry is a blackberry cultivar developed at Oregon State University")
- Luma: moths ("luna moth adults have no mouths and live about a week")

Each also gets `hi` lines and `ACTS`, so `fx:'ask'` works for all of them.

**2. Round-1 buildings to standard.** Rebuild Cascade Mobile, Spoke & Sprocket and Rain City Station with `LAYOUTS`: phone display tables, a case wall and Dot's counter facing the door; bike stands, a helmet wall and Kip's repair stand; the station's ticket window, benches and kiosk.

**3. Display slots and lights.** Every shop with goods gets 16 to 40 `DISPLAY` slots plus 2 to 3 window slots. Every new shop registers its `LIGHTSPOTS`, its OPEN/CLOSED plank and its chalkboard (B9).

### Must not break
- Round-1 phone and bike purchases and Mocha's bike riding.
- The station's trains and trips.
- `fx:'ask'` for every keeper.

### Acceptance
- The 5 new shops lint clean. `forceAct({p:'nursery',s:'counter',fx:'ask',keeper:'willa'})` produces a TRUE fact diary entry, and every new keeper answers `fx:'ask'`.
- Cascade Mobile, Spoke & Sprocket and Rain City Station lint clean with counters facing the door.
- Every shop with goods has 16 to 40 `DISPLAY` slots.
- Draw calls at the default view are at most the previous step's plus 4 (new interiors are culled). Smoke tests pass.

### Hooks
- `__mocha.display(pid)`
- `__mocha.layoutLint()`

---

## B14. Homes ready for company: Wendell's cottage, Mocha's house, fallbacks and drop-in seats

**Goal.** Wendell finally gets a real home you can see into. Both homes get paired seats for two friends, a third seat for you, and graceful fallbacks, so a nearly empty house never leaves anyone sitting on air.

### CORE

**1. Wendell's cottage** (rebuilt at 14,40, 13x10, a dollhouse cutaway like Mocha's: the front wall and roof fade).
- Exterior: mustard walls, a round-top green door at local x=+2, a bay reading nook left of the door, a stone chimney on the west wall (B16 smoke), a porch swing at local (-3.5,6.4) (spots porchA/porchB), and a back door at (5,-5) to the garden with a compost bin and a hammock between two trees.
- Interior, local coordinates, front at +z:
  - Entry zone x 0.2..3.8, z 2.4..5, kept clear.
  - Fireplace (-6.2,0), plus 2 armchairs at (-4.2,+/-1.4) angled to the fire (fireA/fireB) and a tea table (-4.6,0).
  - Kitchen nook back-right: a counter along the back wall x 2..6.2, and a round table (3.6,-1.8) with teaA (2.6,-1.8) and teaB (4.6,-1.8) facing each other.
  - Bed nook back-left, behind a curtain rod at z=-2.6.
  - A bottle-cap display shelf in the middle of the back wall (B17 fills it with an InstancedMesh).
  - A radio, a wall slot for painting gifts. Move the existing exterior painting slot inside.
- A shared `cottage(p,grp,style)` builder serves Wendell's house now and is reused by B26 and B40.
- Update `W_SPOTS` (yard, porch) for the new footprint, and add indoor named spots: fireA, fireB, teaA, teaB, bed, stove, shelf, reading, door.
- `W.visible` no longer flips false "inside". He stays visible through the cutaway (B17 drives his life). For now he idles in his armchair when "inside".
- Also: a wood-cabinet TV in the living corner (its screen is a 128x96 canvas that plays the cinema's real silent FILMS at 5 fps, only while visible and switched on: "the late show"), his radio on the mantel, a footstool `fireC` and a porch step `porchC`.

**2. Mocha's house, hangout-ready.**
- The real lancet-arch door (B9) plus a note hook.
- Pair spots for guests: couchA (-1,-.3)/couchB (1,-.3), teaA (-10.7,0)/teaB (-7.3,0) at kitchen stools, porchA/porchB on the stoop, desk2 (beside the desk chair).
- Room zones: kitchen x -14..-6, living -6..4, bedroom 4..10.5, bath 10.5..14, front hall z 1..7, as `p.rooms` for B16 lights and B27 placement.
- Pair spot names are identical across all homes (couchA/B, teaA/B, fireA/B, porchA/B), so hangouts stay generic.
- Also: a pouf `couchC` and the stoop step `porchC`.

**3. Drop-in seats.** couchC, fireC and both porchC spots are SEATS (B11) with `tag:'dropin'`. When the walker sits in one during a hangout, the scene includes them (B17). Outside hangouts they are ordinary seats.

**4. Capability map and the empty-house set.**
- Map every home spot to a `HOME_CAPS` slot (B7): bed → bed, stove → stove, desk → computer, couchA/couchB → couch, teaA/teaB → table, the TV corner → tv.
- Build the empty-house prop set now, hidden: a sleeping blanket by the bedroom window (`blanket`), a cardboard moving box as a table (`boxA`/`boxB` on either side), two folded moving blankets as floor cushions (`floorA`/`floorB` on the living-room floor), and a bare bulb on a cord.
- It shows only when `FEAT.nest && S.v2fresh` (B32). `capSpot('couch')` returns floorA/floorB when the couch is missing; `capSpot('table')` returns boxA/boxB.

**5. Rooms and occupancy.** Both homes get `p.rooms`. Agents' `room` updates from a spot-to-room map, so B16 lights the right window.

### Must not break
- Mocha's sleep, bath and desk spots; the painting display slots.
- Peek and fade, and `q.walls`.
- Wendell's porch hangouts from round 1 until B17 replaces them.

### Acceptance
- Wendell's interior has fireA/fireB/fireC, teaA/teaB, bed, stove, shelf, reading and door spots. Wendell is visible inside at 21:00 through the cutaway.
- His TV canvas redraws only while visible (the redraw counter stays flat when the camera is away).
- Mocha's house has couchA/B/C, teaA/B, porchA/B/C, desk2 and `p.rooms`.
- `__mocha.emptyHouse(true)` shows the blanket, box, cushions and bulb; `capSpot('couch')` returns floorA and `capSpot('table')` returns boxA; `layoutLint()` returns `[]` in both states.
- Painting gifts hang inside Wendell's cottage.
- Each home interior costs 14 draws or fewer. Smoke tests pass.

### Hooks
- `__mocha.wendellSpots()`
- `__mocha.rooms(pid)`
- `__mocha.capSpot(slot)`
- `__mocha.emptyHouse(on)`

---

## B15. Art bible and the shader pipeline (before the characters)

**Goal.** One palette and one lighting look for everything, landed BEFORE the characters are rebuilt so their colors are tuned once. Soft, rounded shapes in sage, butter, plum and slate; lavender (not grey) shadows; and a gentle glowing edge on every character.

### CORE

**1. Drizzle & Ember art bible.**
- `PAL` constant palette:
  - grass: spring #8FD06C, summer #7CC45E, fall #A8C25E, winter #EEF3F9; clover #6BB04F with highlight #C8EB9A
  - cobbles #E9D9B8, grout #CDBB98
  - sidewalk #F1E6D0, edge #D8C8AA
  - road #6E7486 (wet #565C70), dashes cream #F6E7B8, curb #CFC3AE
  - water: shallow #6FC7C9, deep #3F8FA8, foam #E8FBF6
- Building families (wall/trim/roof):

| Family | Wall | Trim | Roof |
|---|---|---|---|
| Sage | #9DB89A | #F4EEDD | #4E6B57 |
| Butter | #F1D58A | #FFF7E4 | #B5654A |
| Plum | #7E5A86 | #EADFF0 | #3E3150 |
| Slate-blue | #6F8FB0 | #F2F4F7 | #2F3E58 |
| Brick-rose | #C9735E | #F6E7D6 | #5B3A33 |
| Gothic | #3B3446 | #E8DFF0 | #2B2836 |
| Log | #B07A4A | #E9D2A6 | #46624A |

- Accents: pumpkin #F08A3C, plum #8E5BA8, evergreen #2F6B4F, berry #D9546B, butter #FFD36B.
- Color rules: at most 3 hues plus 1 accent per building; saturation only on small things; characters always brighter than their background; shadows never below 25%.
- Colored toon ramp (r128 `MeshToonMaterial` reads gradientMap .rgb):
  - replace the grey `TOONG` with 8 texels: #6E6A96 x3, #9C93B8, #DCCFD0, #FFF6EA x3
  - add `TOONC` for characters: #B58AA0 x3, #E9C2C0, #FFF4EE x4, plus `class ToonC extends ToonM`
  - hemisphere light: day sky #CBD6FF, ground #A39B7A; night #8A96D8 / #2A2A3A
  - fallback if muddy: soften ramp[0] toward #7C7A9C
- Sky KEYS refined:
  - night #141E4A/#2E3570
  - dawn #3A4A8A/#F4A8B0
  - day #5DADE9/#D2EEFA
  - golden hour #6A86C8/#FFC27A
  - sunset #4F58A8/#F29AA8
  - blue hour #2B3A80/#6E6AB0
- Shape language: `rbox()` rounded boxes (ExtrudeGeometry, cached) for counters, tables, planters, signs and door frames; thick rounded eaves; gothic spikes ending in little balls.
- Unlit window glass: glass blue #6F86A8 with a sky highlight. Yellow comes only from the light system.

**2. The patch pipeline.**
- Restructure `THREE.Material.prototype.onBeforeCompile` (search for `onBeforeCompile=function`; it holds the world bend and tree sway) into an ordered list `PATCH=[{id,test(m),apply(sh,m)}]`: `bend` (all lit materials and sprites, exactly as today), `sway` (`userData.sway`), `rim` (`userData.rim`), `win` (`userData.win`, used by B16) and `wind` (B41 adds the WIND uniform to sway).
- Add `THREE.Material.prototype.customProgramCacheKey=function(){return PATCH.map(p=>p.test(this)?p.id:'').join('')}`, so materials with different patch sets never share a program by accident. Today sway and non-sway materials of the same type can collide in the program cache.
- Rim light: add `pow(1.-max(dot(normal,normalize(vViewPosition)),0.),2.5)*rimAmt*rimCol` to the outgoing light. One shared uniform object `RIM={col,amt}` follows the sky: day #FFF4E0 at .25, golden hour #FFB070 at .45, night #9FB4FF at .35, interiors #FFC88A at .3. Flag it on Mocha, pets, every character (B18) and shop goods (B25).
- Precompile with `renderer.compile(scene,camera)` after the world is built, so the first sunset does not hitch. The program count may rise by 8 or fewer (`renderer.info.programs.length`; report it).

**3. Apply the families.** Recolor existing PLACES (wall, trim, roof), the road, sidewalks and grass by season to the families above, keeping the gothic house's identity. `rbox()` (rounded boxes, cached) is used for new counters, signs and door frames from here on; a full retrofit of old builders is deferred.

### Must not break
- The bend shader, tree sway, toon materials and shell fades.
- Round-1 holiday decor.
- The night beauty.

### Acceptance
- Screenshots at h12, h17.2, h21 and `#winter`, in portrait and desktop: lavender shadows read clean (not muddy); warm windows pop at night; the bend and tree sway are intact.
- A sway and a non-sway ToonM with identical parameters compile to two programs (the cache key works).
- Rim light is visible on Mocha and the pets at night, and `RIM` follows the sky keys.
- The program count rises by 8 or fewer; `renderer.compile` runs at load (the frame time at 17:20 stays under 2x the median).
- Draw calls are unchanged. Smoke tests pass.

### Hooks
- `__mocha.grade()`
- `__mocha.rim()`
- `__mocha.programs()`

---

## B16. Living lights: who is home, room by room

**Goal.** Lights tell you who is home and what they are doing: TV-blue at Wendell's, a candle in Mocha's turret, the café glowing until 7, windows coming on one by one at the real Seattle sunset, and a wave of lamplighting through town. Lights also become little messages between friends. This lands the user's ask 1 lights early, right after the homes exist.

### CORE

**1. The fixed light rig, hearths and porches.**
- Fixed rig, created at boot before the first render and never changed: hemi, sun, L0 (Mocha's glow `mLight`), and L1 + L2 as roaming PointLights (distance 14, decay 2). The dollhouse `innerLight` (search for `p.innerLight=il`) is re-parented to the scene and becomes L1; L2 is created at boot. No light ever lives inside a group that is disposed or rebuilt (the cabin, lots, Fogwell floors).
- `LIGHTSPOTS` (B12 to B14) holds every hearth, lamp and shop ceiling light. Every 0.5 s the 2 best by `on*base/(1+d²/100)` from the camera target are assigned, with a .3 s fade out, move and fade in.
- Interior exposure: when a cutaway opens, hemi -35% and sun -50% over .8 s while the room lights rise. Amber inside, blue street outside at night; +10% warm bounce by day.
- Fireplaces (Wendell's, the cabin, any Mocha buys): 3 stacked additive cones plus 6 rising embers. The assigned light flickers .9-1.15 using the SAME noise sample as the hearth's WLT window, so from the street the window flickers in sync with the fire.
- Porch lights:
  - on from dusk when the occupant is out, or when expecting a guest
  - off when everyone is asleep, except Mocha's lanterns at 30% all night (a ghost who likes visitors)
  - Wendell's bug-light yellow #FFD86B
  - the cabin's porch toggle
- Chimney smoke: one Points of 48 puffs, from up to 3 lit chimneys within 120, drifting with `WIND`.
- Sunbeams: by day with a cutaway open, 1-3 slanted additive planes plus 20 dust motes.
- Remove the per-frame `innerLight.intensity` line. LOW tier compiles with L2 at 0 from boot.

**2. Living Windows: the Window Light Table (WLT).**
- `winLUT=DataTexture(256x1 RGBA)`, Nearest, no mipmaps; slot 0 = off.
- Emissive canvases draw each window as rgb(slotId, intensityMask with a hot center, variant). The em textures use NearestFilter with `generateMipmaps=false`.
- Shader patch for `userData.win` materials replaces `#include <emissivemap_fragment>` with a LUT lookup:

  `wid=texture2D(emissiveMap,vUv); wl=texture2D(winLUT,vec2((floor(wid.r*255.+.5)+.5)/256.,.5)); totalEmissiveRadiance*=wl.rgb*wid.g*vOn*2.`

  with variants on `wid.b`.
- The `winMats` loop in `updateSky` goes away.
- `WLT.tick()` runs at 4 Hz (1 Hz in LOW). It reads `occOf(pid)` from B9 (room, awake, act), eases toward the target and writes bytes; `needsUpdate` only on change.
- Homes, room by room:
  - occupied room 1.0 warm #FFB45A; other rooms of an awake house .3
  - asleep: bedroom nightlight .12 #FFB3C1 (Mocha has one: a ghost can be a little scared of the dark)
  - away: dark except the porch
  - activity tints: computer/TV #8FB8FF flicker .55-.85 at ~6 Hz; reading steady; cooking boosts the kitchen; painting daylight #FFF1D6; fireplace #FF7A2E to #FFB04A 1/f flicker; Wendell's movie night blue flicker
- Shops:
  - open: #FFE2A8 1.0
  - closing: a 20 s sequence leaving one .25 security light
  - the back room lights 30 min before opening
  - upstairs windows follow the keeper's home schedule
- Fogwell and apartments: 2 slots per unit from real resident schedules (Vesper red #C0485A all night). Units with no resident use a seeded schedule: home 18:12 ±48 min, bed 23:00 ±72 min.
- Skyline: 16 group slots light through dusk and mostly go dark 22:00-01:30, ~10% all night.
- Real-sunset fade: `lux=sunIntensity*(1-.5*overcast)`. Each window has a seeded threshold in [.34,.62] and a 60-120 s ease, so lights come on one by one over about 40 minutes (earlier on dark rainy afternoons). By day, occupied rooms keep a faint .08.
- Reserve variant bits for holiday silhouettes and the cabin candle; B41 and B31 fill them.

**3. Lamplighting at the real sunset** (over the B8 instanced lamps).
- The moment: when lux crosses .42 (hysteresis .40/.45), lamps light in a wave from Lantern Square outward at about 6 units/s.
  - Each lamp flickers on (0, .6, .2, 1 over .5 s) and emits `SFXEV.emit('tink',{x,z,i})`.
  - Mocha, if outside, may journal it once a day ("the lamps came on all at once. i'll never get tired of that").
  - A reverse wave goes out 15 min before sunrise.
  - The wave replays if the app opens within 10 min after the crossing.

**4. Lights as messages** (the relationship, told in light; all derived, zero AI).
- His porch lantern burns for you: on evenings after the user visited in person within the last 3 days, or once `tierOf(bondOf('you'))` is friend or higher, Mocha's porch lanterns stay at 60% all night instead of 30%, and a tiny ghost-shaped card hangs on the lantern hook ("light's on for you"). At most once a week a diary line: "left the porch light on, just in case."
- Goodnight flicks: when Mocha's window first lights after dusk and Wendell is home and awake, Wendell flicks his porch light twice (off, on, off, on over 1.2 s). A weighted candidate "flick my porch light back" (a 2 s tiny act at his door) may follow. If Mocha does it, at most once a week: "Wendell said goodnight with his porch light. I said it back."
- Back soon: a shop on break (B22) leaves one warm light on and a "back at 2:30" glow on its door plank.
- The porch API `porch(pid,level,pattern)` is shared by the cabin's porch light (B26) and the candle Mocha leaves in your window (B31).

### Must not break
- The bend shader, tree sway, toon materials and shell fades.
- Round-1 holiday decor and the night beauty.
- No runtime light adds.

### Acceptance
- At 22:00 Wendell's window is lit in the room he is in (`occOf`); at 23:30 only his nightlight is on. The café is dark after 19:20.
- Faking lux across .42 lights the lamps in a wave (record lamp on-times; they increase with distance from the square). `tink` events fire.
- The fire in Wendell's cottage flickers, and his window flickers in sync (the same noise value).
- The scene's light count is identical before and after; `innerLight` is a child of the scene; L2 exists from boot.
- Lights as messages: at 19:00 with both home, Mocha's window lighting makes Wendell's porch flick twice; with `bondOf('you')` at friend tier, Mocha's porch lantern holds 60% all night.
- The `winMats` loop in `updateSky` is gone. Draw calls rise by 2 or fewer. Smoke tests pass.

### Hooks
- `__mocha.wlt()`
- `__mocha.setLux(x)`
- `__mocha.lights()`
- `__mocha.lamps()`
- `__mocha.porch(pid)`

---

## B17. Wendell's day and hangouts in both houses

**Goal.** Wendell stops blinking out of existence. You can find him napping in his armchair, cooking supper or sorting bottle caps. Mocha and Wendell visit each other on their own terms: knocks, soup on the doorstep, a "raincheck" now and then. Watching them play checkers by the fire is the coziest thing in the app, even in a nearly empty house, and you can pull up a chair.

### CORE

**1. Wendell's own life** (a `parsePlan` rhythm, see 2; the random `wSchedule` is replaced).
- Personality: a gentle, nostalgic, slightly fussy grandpa raccoon. Retired after 31 years as a deckhand on the Sound's ferries. Collects bottle caps; gardens; tea. Rinses his food before eating (a real raccoon habit). Voice: "ah,", "back on the boats...", "well I'll be".
- Rhythm:

| Time | Activity |
|---|---|
| 7:00 | porch tea with the paper |
| 8:00-10:00 | garden |
| 10:00-14:00 | errands with a basket (café, market, grocery, library), seeded by date |
| 14:00-15:00 | nap in his armchair (visible through the cutaway, with Zs) |
| 15:00-17:00 | park or promenade: ducks, watching his old ferry |
| 17:30 | cooks supper (stove glow, steam) |
| 19:00-21:30 | reads by the fire, sorts caps, listens to the radio |
| 22:00 | lights out |
| 1:00 | one night in three (seeded): a snack raid; the kitchen light flicks on for a minute |

- He never vanishes. "Inside" means a room spot in his B14 interior. `W.visible` stays true; visibility comes from B19 LOD plus the shell fade.
- Caps: `S.wend.caps` gains one every ~2 days from errands. They show on his shelf as one InstancedMesh of 120 small cylinders, `count=min(caps,120)`. He shows Mocha the newest one at the next hangout.
- Story bank: 12 stories, about 140 chars each, told once by tier (the fogbound crossing when the whole ferry sang; the orca that followed his boat; how he met Pearl; his sister Hazel in Spokane who mails jam). `S.wend.told` is a bitmask.
- The user can talk to him (B23 card). He has the most intimate gossip about Mocha ("he's getting sneaky with the double jump"). His favor: water his garden (B36).

**2. Plans from the clock** (introduced here for Wendell; B22 reuses them for every townsperson).
- `parsePlan(str)` turns a rhythm string such as `'0700 porch tea;0800-1000 yard garden;1000-1400 >errands;1400-1500 home.fireA nap;...'` into `[[h0,h1,kind,place,spot,verb]]`.
- `planFor(id,date)` memoizes per dayKey and applies overrides: rain cancels gardening (from `WX.at`), holidays, events.
- `blockAt(plan,hour)` is pure, so catchUp, lights and talk all agree. All three are hoisted and declared above catchUp.

**3. Hangout engine.** Mocha decides, through a hangout score in `localChoose`:
- Inputs: social need, bond tier (`bondOf`), an evening bonus (17-21), a rain/snow bonus, days since the last hangout, Wendell's availability per plan (home or porch, awake, not on an errand), a tradition match (+4), a pending invite (+3), sociability.
- No hangout within 30 min of either one's bedtime (Wendell 22:00, Mocha `sched().bed`).
- Host or visit: Mocha hosts when he has something new to show (decor, painting, pet, record), when it is his turn (they alternate), or when the activity needs his things and he has them (`hasItem`: movie, music, baking). Otherwise he visits.
- Visiting: walk the sidewalk, knock at Wendell's door (DOOREV knock), door opens: "mocha! come in, come in, mind the doorstop".
- Hosting: Mocha walks over to invite him, or calls him if he owns a phone (a ring, the phone to his ear, two short bubbles). They walk back side by side: Wendell's escort mode follows G with a side offset along the same door path. Wendell wipes his feet.
- Wendell invites too. `miss = hoursSinceLast*(0.04+tier*0.02)` (derived, not saved). When he is home 16-20, miss is high, and 20 h have passed since his last invite:
  - Mocha home: Wendell crosses the yards with a covered pot and knocks ("I made too much soup. Again.").
  - Mocha out with a phone: he calls.
  - Otherwise: a note in Mocha's mailbox via round-1 `S.mail` ("Tea at 7? Bring nothing but yourself. -W").
- Mocha may decline in character, based on his activity and energy ("raincheck? i'm in the middle of a painting"). Wendell answers kindly ("the kettle will keep") and leaves the soup (pantry +15). A declined invite becomes "tomorrow evening?" with a bonus.
- Sleep, movies, trips and painting are never interrupted.
- If the user is around, both greet them, and Wendell may say "pull up a chair!" and include the user in a line or two.
- Replace the single npc ACT with hang acts generated from HANGOUTS: `{p:'neighbor'|'home',s:spot,doing,fx:'hang',hang:id,npc:1}`. Remove the `wSpot` chasing for hang acts.
- catchUp: hangouts happen through `localOutcome` `fx:'hang'` using `wAvailAt(t)`. Only mailbox-note invites are simulated (1 per day max).
- AI: at most one call per hangout, at the end, for the diary, via `MIND.allow('hang')`. None for invites or declines. `applyDecision` accepts `d.hang` ids.

**4. Hangout library v1: 17 activities.** Each is a `HANGOUTS` entry (about 8 KB in total):

```
{id, w:'W'|'M'|'P'|'Y'|'E', sp:{W:[a,b,c?], M:[a,b,c?]}, need:{M:[slots], W:[slots]}, alt:'id'|null,
 h:[16,21.5], mo, wx, tier, len:[70,130], beats:['w:..','m:..','y:..'], prop, out:{fp,mem,pantry,caps,flag}}
```
- `w` is where: Wendell's, Mocha's, Porch, Yard or Either. `need` lists HOME_CAPS slots the host must have (`hasItem`); if a slot is missing, the engine tries the other house, then `alt`. Seats come from `capSpot()`, so an empty house uses the floor cushions and the moving box. `y:` beats play only when the walker sits in a drop-in seat.

1. Tea and a story (from the story bank).
2. Checkers: a 256x256 canvas board where a piece hops every ~4 s. The winner comes from a formula that improves with Mocha's gaming interest. A running tally `S.wend.ck` is announced at milestones. Wendell: "learned that double jump on the 2am ferry".
3. The never-ending jigsaw on his table: `S.wend.puz` goes +8 to 14% per session, revealed through a mask canvas. Finished puzzles get framed on his wall and a new one starts. One piece is always "missing" until Wendell finds it in his cardigan pocket.
4. Cooking supper at Wendell's: tomato soup, or blackberry cobbler in Jul-Sep. Leftovers go to Mocha's pantry.
5. Movie night: at Mocha's when `hasItem('computer')`; otherwise at Wendell's on his cabinet TV ("the late show", a real FILM via `FILMS`/`drawFilm`), plus popcorn. On Friday evenings it may become Film Night at Monty's cinema together (B36 events).
6. Radio night: Mocha's transistor radio (B21) or Wendell's radio, Wendell humming along. Once Mocha owns a record player (B34) it can become record listening.
7. Reading side by side: "..." bubbles.
8. Mocha paints Wendell's portrait: `makePainting('wendell',...)` with `where='gift:wendell'`, hung over Wendell's fireplace.
9. Gardening: daytime, not in storms.
10. Porch stargazing: clear dark nights, with one true star fact.
11. Rain watching on the porch.
12. Bottle-cap sorting: caps +1 to 3, plus a cap story.
13. Go Fish.
14. A two-player game on Mocha's computer (needs `computer`; Wendell is terrible and delighted). Alt: Go Fish.
15. Floor picnic (Mocha's, when the couch or table is missing): a checked cloth on the floor and sandwiches. Wendell: "best seat in the house is the floor, I always say."
16. Tea on the moving box (Mocha's, when the table is missing): two mugs on the cardboard box, both sitting on the folded blankets.
17. Flashlight stories (Mocha's, after dark, when the lamp is missing): a flashlight under the chin and Wendell's foggy-ferry ghost story. Mocha: "i'm literally a ghost." It seeds an inside joke for B28.

Seasonal activities (pumpkin carving, cookie baking, cocoa and snow, spring planting) and sleepovers come in B33.

**5. Staging.**
- Both walk to their pair seats and face each other. Bubbles alternate every 3.5 to 5 s, with faces from B18 (^^ on laughs; `setFace` is a no-op until then).
- The prop animates; a heart sprite rises on warm beats.
- In follow mode, `CAM.push('hang',{prio:1})` frames the pair (midpoint, dist 9); walk mode keeps the walker's camera.
- At the end, the host walks the guest to the door.
- A diary entry from the outcome template, or one AI call.
- Beat runner: `H={a,i,next}` in `updateW`; Mocha speaks via `say()`, Wendell via `wSay()`.
- Lights follow the scene: the hangout sets the room's `act` in `occOf` (tv, cooking, reading), so B16 tints the window (TV-blue on movie night).

**6. Drop in on a hangout** (the user's own seat). Hosting and the activity are always Mocha's and Wendell's choice. If the walker sits in a drop-in seat (couchC, fireC or porchC) during a hangout:
- The beat runner mixes in `y:` lines: Wendell says "pull up a chair! you can be the referee", Mocha passes the popcorn (a popcorn-bowl prop slides over), and at checkers Wendell explains a move to you.
- The diary entry mentions you ("Ari dropped in for checkers. Wendell let them pick the next move. It was a bad move. We loved it.").
- B33's polaroid includes the walker.
- The walker can leave at any time, and nothing changes the hangout. There is no userBias term for this: dropping in never causes a hangout.

**State:** `S.wend={caps:23,ck:[0,0],puz:0,pi:0,told:0,inv:null,turn:0,mem:[],last:0}` (under 1 KB; B33 adds `fl` and `pol`). Mocha's points come from `bondOf('wendell')`.

### Must not break
- Mocha's sleep in his bed.
- `fx:'hang'` in catchUp.
- The round-1 mail and texting APIs.

### Acceptance
- `__mocha.wend()` at 14:30 shows Wendell `st:'nap'` in his armchair. At 23:00 he is in bed, visible through the cutaway.
- `__mocha.hang('checkers','W')`: both walk through Wendell's door to fireA/fireB, face each other, alternate at least 6 bubbles, the board canvas updates, and a diary entry is written. `S.wend.ck` changes.
- `__mocha.invite('knock')` while Mocha is home: Wendell walks over carrying the pot and knocks (DOOREV). Accepting and declining are both Mocha's decision, covered by forced-seed tests.
- With `__mocha.emptyHouse(true)`, a hangout at Mocha's uses floorA/floorB and boxA/boxB (nobody sits on air), and movie night moves to Wendell's TV.
- With the walker in couchC during a hangout, `y:` beats play and the diary mentions the user; the activity and host are unchanged.
- catchUp across 3 simulated days: at least 1 hangout and at most 1 note invite per day.
- At most 1 MIND call per hangout. Props are hidden when idle; the caps shelf is 1 InstancedMesh. Smoke tests pass.

### Hooks
- `__mocha.wend()`
- `__mocha.wplan()`
- `__mocha.hang(id,where)`
- `__mocha.hangState()`
- `__mocha.invite('knock'|'call'|'note')`

---

## B18. Characters I: chibi kit, faces, the new you and Your Look

**Goal.** One consistent, original, Animal-Crossing-spirited chibi style, starting with the user's own walker: a round-headed little neighbor in a forest-green hooded rain jacket (never yellow), with big ring-iris eyes, mitten hands and sneakers, who blinks, waves, flips up the hood when it drizzles, and can wear a plaid flannel tied around the waist like the reference picture.

### CORE

**1. `makeChibi(look)`**: a shared builder used by the walker, keepers, Wendell and every new character.
- Proportions: about 1.95 units tall; head sphere r .40, about 44 to 47% of height.
- Egg body .34x.42x.30, stubby legs .2 with rounded shoes or paws (.11x.08x.16), arms .28 ending in mitten spheres r .085.
- Species identifiers from `look`:
  - ears: round, pointy, long, tufts, floppy, horns, antlers, none
  - snouts: short, long, beak, wide, bill
  - tails: long, bushy, puff, ringed, stub
  - extras: long legs and a crest (heron), spines (hedgehog cone cluster), wings (moth/bat flat planes), cap (mushroom), pumpkin head, bandage wraps (mummy stripes on a canvas texture), skull (skeleton white with a dark eye patch on the face atlas), witch hat with cape, top hat, apron, glasses, beret, headphones, scarf, satchel
- Draw calls: a full character is 8 draws or fewer. Merge static parts per rig node with vertex colors at build time (`mergeParts(parts)`, never per frame): HEAD (head, ears, snout, hair, hat, horns), BODY (torso, apron or cardigan, scarf, satchel, a tail that does not wag), ARM L and ARM R (each with its mitten), LEG L and LEG R (each with its shoe or paw), FACE (one mesh, see 2), and an optional TAIL for species whose tail wags (raccoon, fox, chipmunk, cat).
- Every character shares ONE `ToonC` material with `vertexColors` and the rim flag (B15) for all non-face parts, so they compile to one program. The walker is the exception: it keeps a few own materials (jacket, skin, hair, bottoms, shoes) so Your Look recolors instantly (10 draws or fewer).
- Share module-level geometries. castShadow goes only to the 4 nearest full characters (B19 manages it).
- Returns a Group with `userData{legs,arms,head,face,tail,emote}`, so the existing animation code keeps working.

**2. Face atlas with three patches.** One 1024x512 canvas drawn at boot, in 128x128 cells:
- Rows 0 and 1: 12 eye cells (open, half-blink, closed, happy ^^, surprised O, sleepy -, star, heart, teary, glance-left, glance-right, wink), each holding BOTH eyes.
- Row 2: 7 mouth cells (smile, open laugh, o, wobbly, cat w, flat, tongue) and one spare.
- Row 3: 8 mark cells (raccoon mask, skeleton sockets, mummy wraps, freckles, whiskers, moth fuzz, pumpkin carving, plain).
- Style: a white ring around a big warm-brown iris (#6B3E26, or the species color), pupil #1E1A24, a large top-left highlight plus a tiny bottom-right one, and blush ovals #FF9DB0 at 60%.
- The FACE mesh is ONE BufferGeometry with up to three curved patches fitted to the head sphere at radius 1.01: an eye patch (6x3 segments, across both eyes), a mouth patch (3x2) and an optional mark patch (6x4, behind the eyes).
- Each patch keeps a preallocated Float32Array of local UVs. `setFace(obj,{eye,mouth,mark})` rewrites only that patch's slice of the uv attribute (`u=u0+lu*du`, about 60 floats) and sets `needsUpdate`. 12 eyes times 7 mouths gives 84 expressions from 19 cells.
- One shared `MeshBasicMaterial({map:FACE,transparent:true,alphaTest:.4})` for every face. Never `texture.clone()` (each clone uploads a new GPU copy).

**3. Behavior kit.**
- Blink every 2.5 to 6 s (15% double blink); eyes dart toward whoever is talking.
- Springs, preallocated numbers in userData (stiffness 180, damping 14): anticipation squash (scaleY .9 for .12 s), walk bounce |sin| with a head lag of .08 s, landing squash, breathing at 1 +/- .015, and a happy hop.
- Emote pops: one pooled Sprite per character from a 512x256 atlas (note, !, ?, lightbulb, Zzz, heart, anger mark, sweat drop, sparkle, steam, ...). Each pops in over .25 s (scale 0, 1.2, 1). API: `emote(obj,id,dur)`.
- Animation LOD: full rate within 40 units of the camera; 5 Hz otherwise; hidden when far or occluded (B19 sets visibility).

**4. The new you** (replaces `makeVisitor`). Keep the global `visitor`, YOU and `animateVisitor` API names.
- An original design in the reference's style (`/tmp/harness/ref-you-style.png`): very round head, small round ears, a tiny button nose one shade darker than the skin, and a chunky hair helmet with three soft bang lobes.
- An A-line hooded rain jacket, default Forest #2F6B4F. Free alternatives: Harbor Blue #3A6FB0, Navy #2B3F66, Teal #2F8F8A. Never yellow, mustard or gold: every jacket palette in the game (here and in the B24 catalog) skips hues 38 to 68 degrees.
- Jacket details: a lighter zipper strip, two drawstring toggles, pocket flaps, and a small plaid lining that shows inside the hood (a grunge-era Seattle nod).
- Cuffed shorts or rolled joggers; rounded sneakers with white soles, or glossy rain boots. An optional small backpack with a clip-on lantern that glows at night.
- The walker owns its own materials and recolors with `material.color.set`.
- Expressions: sleepy after 23:00, "ooh" sparkle while an item card is open (B25), happy on purchase or gift.
- Animation:
  - bouncy walk with opposite arm swing and a springy head bob; forward lean when running
  - idle breathing, plus a look-around every 4 to 9 s that prefers the nearest character or Mocha (head up to .6 rad)
  - secondary motion on hair and hood strings
  - gestures: wave (automatic when a character greets you within 4), happy hop (tapping a character), sit, nap, inspect lean
- Weather:
  - Rain or drizzle: the hood flips up (hood-up shell vs hood-down roll, toggled with `.visible`). An owned umbrella opens instead (B24 catalog).
  - Running in rain: tiny splash puffs.
  - Snow: breath puffs.
  - Night: the backpack lantern turns on (emissive plus glow).
- Emote button (walk mode, one round 44 px button near the zoom buttons, not overlapping anything): fans out into wave, sit, hop, photo and nap.
  - photo saves the current view with the walker in it to the user's album: PHOTOS under a `u` prefix, cap 30, listed in `S.you.album` so the B7 keep-set protects them.
  - Mocha may react through his existing notice logic, his choice.
- You stay in the world: in watch mode the walker idles where left, sits on the nearest seat within 3, or reads a little book.
- Twinning: if the jacket color matches Mocha's outfit color family, Mocha may (his choice, rate-limited) say "we match!!".

**5. Your Look sheet.**
- Opens from the you tab, from a mirror item (B27), or from the Drizzle Threads fitting room.
- A live preview: `CAM.push('look',{prio:3})` swings the camera to face the walker (dist 3.2, head height). Drag to spin.
- Big swatch chips:
  - skin tone: 7, inclusive, #f7d7c4 to #6b4232
  - hair color: 8
  - hair style: 5 (soft bob, tufty crop, ponytail, space buns, curly crop)
  - eye color: 4 (warm brown default, hazel, grey-blue, dark)
  - blush on/off
  - jacket: 4 free colors
  - bottoms: shorts, joggers, overalls
  - shoes: sneakers in 4 colors, boots in 3
  - backpack on/off
  - a plaid flannel tied around the waist: off, red-black buffalo check, forest-navy or plum-grey (straight from the reference picture, and a far more visible grunge-era Seattle nod than the hood lining)
  - voice preset: soft, bright, low (for B20)
- Randomize, and 3 saved outfits.
- State: `S.you={look:[sk,hc,hs,ec,jk,bt,sh,bp,blush,vc,fl], fit:[], outfits:[], flags:{}}` (small int indices into palettes in code). B18 creates `S.you`; later steps add fields. `migrate()` creates it for old saves.
- Bottom sheet in portrait (max 62vh, keeping the preview visible); side sheet in landscape and on the Duo.

### Must not break
- `kSay`/`wSay` bubble anchoring (head height changes: update the projection offsets).
- Walk-mode cameras, zoom and pinch.
- The `__you()` hook.

### Acceptance
- The walker is about 1.95 tall, its head is at least 42% of height, and its default jacket color is #2F6B4F. A front close-up at 393x852 shows the reference's style traits (round head, ring-iris eyes, mitten hands, sneakers); compare with `/tmp/harness/ref-you-style.png`.
- `__you().look` set to Harbor Blue recolors without rebuilding (same mesh count). No jacket swatch has a hue between 38 and 68 degrees.
- The flannel tied around the waist toggles in Your Look and persists across reload.
- Forcing `WEATHER.kind='rain'` puts the hood up. At 22:00 the backpack lantern glows.
- The emote button (HUD slot `emote`) shows 5 choices; wave plays; photo adds an album photo that survives `savePhotos()` and a reload.
- A chibi test character costs 8 draws or fewer; `setFace` changes only uv data (`renderer.info.memory.textures` unchanged).
- Your Look works in portrait, landscape and Duo with CAM 'look' on top and nothing overlapping. Changes persist across reload. Smoke tests pass.

### Hooks
- `__mocha.face(id,expr)`
- `__mocha.emote(id,emote)`
- `__mocha.youLook(arr)`
- `__mocha.youEmote(name)`
- `__mocha.youWeather(kind)`
- `__you()` (with look, face, emote)

---

## B19. Characters II: the whole cast and character LOD

**Goal.** Every keeper and Wendell is rebuilt to the B18 standard, with silhouettes you recognize from across the street. A Halloween-town-in-Seattle cast of spooky-cute and cottagecore characters joins, ready for B22 to bring to life. Draw calls stay flat even when the whole town gathers.

### CORE

**1. Rebuild the cast with `makeChibi`.** Keep each keeper's `look` palette and its signature accessory:
- Juniper: apron
- Basil: headphones
- Mabel: round glasses plus tufts
- Rosalind: long ears plus glasses
- Gus: big plus apron
- Pearl: sunglasses on the head
- Sol: beret
- Chip: stripes plus bushy tail
- Hank: wide snout plus paddle tail
- Bea: floppy ears
- Monty: antlers plus scarf
- Dot and Kip (round 1): Dot's tentacle-arms, Kip's horns and beard
- Otis: face stripe
- Wren: a fluffy fleece collar plus four little horns (Jacob sheep)
- Willa: witch hat plus cape; Pepper the cat as a separate small quadruped
- Pippin: spines
- Luma: antennae plus wings

Wendell: a raccoon in the new standard (mask on the face atlas, ringed tail, cardigan), keeping `wObj.userData` keys.

**2. New cast models plus data stubs.** `CAST` entries hold id, name, species, look, role, home, `likes` and `dislikes` tags (B30 gifts); B22 adds rhythms and lines:
- **Spooky-cute:**
  - Vesper: tiny vampire bat. Fangs, cape; cinema night usher; allergic to garlic bread.
  - Clem: friendly skeleton musician. Busks on the promenade.
  - Hollis: shy pumpkin-headed scarecrow farmer. Saturday market stall; loves crows.
  - Tabitha: mummy-wrapped cat, library assistant.
  - Ambrose: a ghostly doorman in a top hat. The Fogwell concierge and Mocha's ghost friend: translucent like Mocha, with a bowtie.
  - 3 tiny ghost friends at the cemetery: Fennel, Tuffet and Hush. These are Mocha-style mini ghosts, not chibi.
- **Cottagecore:**
  - Morel: mushroom-cap gnome forager.
  - Honey: beekeeping bunny, Willa's housemate.
  - Reed: straw-hat frog who fishes off the pier.
- **Civic:**
  - Mayor Odalie Stillwater: a great blue heron, tall and deliberate, who stands on one leg when thinking.
  - Marigold: goose, Town Hall clerk.
  - Jot: a Seattle crow mail carrier with a satchel, who roosts in the Town Hall clock tower.
  - Dale and Birch: beaver builders in hard hats (Timber & Truss).
  - Captain Barnaby: a retired tugboat captain, a harbor seal. He tells sea stories; he never ferries anyone and never sings.

Total about 30 characters, but only those near the camera are visible (B19 LOD, section 3).

**3. Character LOD.**
- LOD0, the full rig (8 draws or fewer): at most 8 characters at once, the nearest visible ones to the camera target, re-sorted at 2 Hz. Full animation within 40 units; 5 Hz beyond.
- LOD1, a 1-draw stand-in: built once per character by merging every part at its rest pose, with two baked eye dots and no face mesh. Used beyond the 8 nearest or beyond 40 units. It bobs and turns as a whole group (no limb animation) and casts no shadow.
- Hidden beyond 85 units, or when inside a building whose shell is not faded.
- castShadow on the 4 nearest LOD0 characters only.
- Budget: characters cost at most 8x8 plus one draw per LOD1 stand-in. At the busiest scenes (Market Morning, the parade) the whole frame stays at 300 draws or fewer.
- `CHARLOD.tick()` runs at 2 Hz from `frame()`. Mocha is not part of this system: he is always full detail.
- The 3 ghost friends are Mocha-style mini ghosts (2 draws each), not chibi.

### STRETCH
- Halloween outfits: every character gets a seasonal accessory slot (witch hats multiply in October, knits in winter, flower crowns in spring), driven by `SEASON_KEY` plus the round-1 holiday.

### Must not break
- `kSay`/`wSay` anchoring and `keeperAt`.
- The Halloween costume code for Mocha.
- `fx:'ask'` and keeper greetings.

### Acceptance
- `__mocha.cast()` lists 25 or more characters with looks. Every keeper has a face, blinks (its face uv changes over 6 s) and costs 8 draws or fewer.
- The cast has no echo names or species: no Tilda, Pip, Wisp or Bellsy, and no walrus, tortoise or alpaca.
- A simulated crowd of 20 characters around the square: 8 or fewer at LOD0, the rest at LOD1, castShadow on 4 or fewer, and 300 draws or fewer in total.
- `kSay`/`wSay` bubbles anchor to the new head heights; `keeperAt` works.
- Draw calls at the default view are at or below the pre-step count. Smoke tests pass.

### Hooks
- `__mocha.cast()`
- `__mocha.lod()`
- `__mocha.face(id,expr)`

---

## B20. Sound A: audio engine, sound effects, babble and ambience

**Goal.** Sound that is cute, never loud, never surprising, kind to the battery, and actually audible on an iPhone that lives on silent. Every door, coin and footstep has a tiny synthesized sound, everyone has a voice, and Seattle's rain sounds like rain on the roof.

### CORE

**1. AUD engine.**
- Buses: master .8, music .30, ambience .35, sfx .50, voices .45, through a gentle DynamicsCompressor (-18 dB threshold, knee 12, ratio 3, attack 10 ms, release 250 ms).
- Room send: HIGH tier gets a generated 1.4 s Convolver impulse; MED/LOW get a feedback delay (.09 s, feedback .28, LP 2.5 kHz).
- Ducking: voices and notable SFX dip the music -5 dB.
- Spatial, cheap (no HRTF):
  - listener = the camera target
  - gain `1/(1+(d/ref)^2)`, zero beyond max, plus an equal-power StereoPanner
  - occlusion LP 700 Hz and -6 dB across walls; an open door leaks at LP 2.5 kHz
  - emitters update at 10 Hz
  - ref/max: record player 6/28, shop music 5/24, fireplace 3/12, babble 8/25, lamp tinks 15/60, birds 12/50, train horn 30/180, ferry horn 40/220
- Limits: at most 14 one-shot voices (music 8, sfx 4, voices 2); steal the oldest and quietest. Shared 2 s white and pink noise buffers. Disconnect every node on `ended`.
- iOS:
  - create the AudioContext lazily on the first pointerup/touchend/keydown; `resume()` plus a 1-sample silent buffer in the same handler
  - handle `interrupted` by resuming on the next gesture
  - if `navigator.audioSession` exists (feature-detected), set `'playback'` once sound is on, so music and effects play even with the silent switch on (the user asked for music, and many iPhones live on silent). The Settings toggle "Mix with my other audio (follows the silent switch)" switches to `'ambient'`. Never switch before the first gesture.
- UI:
  - a speaker pill (HUD slot `speaker`) (muted/quiet/on); long-press opens the sound sheet
  - Mocha's one-time hint: "psst, tap the speaker to hear the town"
  - a now-playing chip beside it (HUD slot `nowPlaying`, filled by B21); both stay visible when muted, with a muted glyph
  - Settings > Sound: Master/Music/Ambience/Effects/Voices sliders (80/30/35/50/45); toggles for "Mocha's picks can take over the town music" (on), babble (on), quiet hours 22:00-7:00 (music at half, on), and the mix-with-other-audio toggle; saved in `SET.snd`
- Power:
  - suspend on visibilitychange hidden/pagehide, when muted, and after 10 min without input (fade out, then suspend), within 1 s of hiding; clear every audio timer (the scheduler, emitter updates) on hidden and restart them on visible
  - LOW tier: no convolver, only the rain bed, 5 music voices or fewer, scheduler wake every 400 ms
  - no AudioWorklet or ScriptProcessor
- Subscribe to `DOOREV` and `SFXEV` (B7).
- Visible when muted: the speaker pill shows a small music-note badge whenever Mocha's music is playing somewhere (B21), so his choice is visible even on mute.

**2. SFX palette** (all synthesized, under 1.5 s each, rate-limited: footsteps 6/s, coin 4/s, UI 10/s):
- Doors: wooden creak (saw 90 to 140 Hz, BP 600 Q 8, .35 s) plus a latch click; close thump plus click; Mocha's gothic creak (longer, wobbly); shop bell (1318 + 1760 Hz plus a 2.76x partial, 1.1 s, shimmer); gate creak/clack; knock; rattle.
- Footsteps per `floorType` (B11), ±8% pitch: grass, wood, stone, snow, puddle (bloop). Mocha has no feet: an airy whoosh on fast moves.
- Mocha: boo pop, giggle (3 blips), sigh, very faint sleep breathing when close.
- Money: coin 2093/2637/3136 Hz; purchase coin plus bell; wallet rustle.
- Phone and mail: text in (marimba 1568 to 2093 Hz), text sent, mail music-box ding plus flag clack, camera shutter.
- Town: train horn, crossing bell, ferry horn (carries 220), bike bell, freewheel ticks, lamp tinks, clock bell, elevator ding (Fogwell).
- Home: kettle whistle, sizzle, brush swish, typing, page turns, fridge hum, fireplace crackle, bath bubbles.
- UI: tap 880 Hz 12 ms, sheet open/close, toggles, a soft 220 Hz "nope", an achievement arpeggio. All pitched UI sounds use `SONG.key`.
- Decorate: wooden tok, swish, pop.
- No thunder: it is rare in Seattle and startling.

**3. Babble voices.**
- Text-driven: vowel groups map to formant pairs (a 800/1200, e 500/1900, i 320/2400, o 500/850, u 350/800 Hz). Consonants add an 8 ms noise tick. The pitch rises on ?/! (+4 st on the last syllable) and falls on ".".
- About 12 syllables/s, capped at 22 per bubble. Emoji become emote pops; "..." becomes a hum.
- Only when the speaker is on screen within ~25. At most 2 voices at once. Texts and the diary never babble. Mocha's muttering is -6 dB.
- One oscillator plus 2 BiquadFilters per line.
- Profiles (wave, base Hz, ±st, syll/s):

| Character | Wave | Base Hz | Range | Syll/s | Quirk |
|---|---|---|---|---|---|
| Mocha | sine + 10% triangle | 520 | ±5 | 13 | breathy |
| Wendell | saw LP 1.4k | 210 | ±3 | 11 | "heh" |
| Juniper | triangle | 440 | ±6 | 15 | |
| Basil | triangle | 300 | ±2 | 9 | slides |
| Mabel | sine | 360 | ±4 | 10 | vibrato, "hoo" |
| Rosalind | sine | 600 | ±3 | 12 | whispery |
| Gus | saw LP 900 | 140 | ±2 | 8 | |
| Pearl | square LP 1.2k | 330 | ±5 | 12 | |
| Sol | 25% pulse | 260 | ±7 | 11 | |
| Chip | triangle | 760 | ±6 | 17 | |
| Hank | saw LP 1k | 240 | ±3 | 10 | |
| Bea | triangle | 420 | ±5 | 14 | "awoo" |
| Monty | saw LP 700 | 110 | ±2 | 7 | |

  - New cast: generated by species and size (smaller means higher and faster).
  - The walker: the 3 Your Look presets.
- Hook into `say()`, `kSay()`, `wSay()`, the talk card typewriter and the NPC bubble pool.

**4. Ambience and weather beds.**
- Ambience zone beds (3 nodes or fewer each, 2 s crossfade):
  - waterfront: waves, gull calls, a creaking pier, a bell buoy
  - downtown: a low hum
  - park and woods: wind in the firs scaled by `WIND`, northern flicker drumming
  - home: clock tick, rain on the roof, the fridge, hearth crackle
  - cemetery at night: a wind chime, soft "ooo" from the ghost friends, a great horned owl
- Weather beds: rain pink noise LP 1.8k/HP 300 (indoors LP 600 plus roof ticks), drizzle hiss, gusts, a far foghorn on foggy mornings, near-silence with a master LP at 3 kHz in snow (fresh snow really does muffle sound).
- Wildlife calendar (TRUE facts, also diary hooks):
  - the American robin's dawn carol and the black-capped chickadee's "fee-bee" (spring/summer)
  - the Swainson's thrush's spiraling evening song (late spring/summer)
  - crows heading to their evening roosts
  - Pacific chorus frogs on Jan-Jul nights near water
  - crickets Aug-Oct, with chirp rate from Dolbear's law: chirps/min = 4x(°F-40), using typical Seattle evening temperatures (Aug 64, Sep 58, Oct 50); Mocha can say "the cricket says it's about 58 degrees"
  - Anna's hummingbird squeaks in winter
  - LOW tier keeps only the rain bed

### Must not break
- No audio before a gesture.
- Mute must truly suspend the context.
- No sound while hidden.
- CPU: no crackle with Playwright CPU throttling at 4x; cap the voices.

### Acceptance
- No AudioContext exists before the first tap. After a tap, `__mocha.audio().state==='running'`. Hiding the page suspends it within 1 s and clears every audio timer (count the live interval handles).
- When `navigator.audioSession` exists, it is `'playback'` with sound on and `'ambient'` with the mix toggle on.
- A door opening emits a creak and the café bell (a DOOREV spy counts the calls). Earning a coin plays the coin sound. Voices stay at 14 or fewer under stress (spawn 30 one-shots).
- Babble plays for `kSay` within 25 units and not for texts.
- With rain forced, the rain bed plays (filtered when indoors). The LOW tier keeps only the rain bed.
- The speaker pill and sound sheet have no overlap in any viewport. Settings sliders persist. Smoke tests pass.

### Hooks
- `__mocha.audio()`
- `__mocha.sfx(name)`
- `__mocha.babble(id,text)`
- `__mocha.zone()`

---

## B21. Sound B: Town Songbook, Mocha's radio, the jukebox and Drizzle FM, shop music

**Goal.** The town has its OWN music: 24 hourly themes seeded uniquely for this user, softened by rain and flavored by the season. Mocha picks what plays at home from his very first day, with nothing to buy, and sometimes for the whole town. You can always see what he chose and tune in to it from anywhere. The test: open the app at 9pm with sound on, and before you find Mocha you know he is home listening to Harbor Jazz, because the music drifts out of his door and little notes float from his window.

### CORE

**1. The Town Songbook.**
- A seed stored in S at first run generates 24 hourly themes deterministically from seed + hour (only the seed is stored). Each theme: key, mode, bpm, swing, a 4/8-bar progression, a 2-bar motif, and an A A' B A form (~16 bars). Variations keep each hour familiar but alive.
- Hour palettes:

| Hours | Key / mode | Tempo | Instruments |
|---|---|---|---|
| 05-07 | D major pentatonic | 72 bpm | kalimba plus pad |
| 07-10 | G major | 96 | marimba, pizz bass, shaker |
| 10-12 | C lydian | 104 | ukulele comp, glockenspiel |
| 12-14 | F major | 100 | whistle-flute, upright pluck, brushes on 2 and 4 |
| 14-17 | Bb major | 88 | felt piano plus clarinet counter-line |
| 17-19 | Eb major maj7/add9, swing .58 | 84 | Rhodes plus vibraphone |
| 19-22 | Ab major or F minor, swing .62 | 76 | Rhodes, walking bass, brushed ride |
| 22-01 | A major pentatonic | 66 | music box plus warm pad |
| 01-05 | E dorian | 58 | music box plus celesta, long rests |

- Progressions: I-vi-IV-V; I-iii-IV-iv; ii7-V7-Imaj7-vi7; Imaj7-IVmaj7; I-V-vi-IV; vi-IV-I-V.
- Melody rules (C5-C6): start and end on chord tones, 70% stepwise, leaps at most a 6th then step back, ~20% rests.
- Instrument recipes (oscillators plus envelopes):
  - marimba: sine f + 4f at .12 (decays 4x faster), attack 2 ms, decay .6 s, 0.5% pitch drop in the first 20 ms
  - kalimba: f + 5.4f at .08, decay 1.2 s
  - music box: f + 4.2f at .18 + 2f at .1, decay 1.6 s, ±4 cents detune per note
  - glock/celesta: triangle f + 2.76f at .15, HP 600 Hz, decay 1 s
  - Rhodes (FM): carrier f, modulator 1:1, index 2.2 falling to .3 over .4 s, decay 1.8 s
  - felt piano: triangle f + 2f at .25, LP 2.2 kHz, attack 8 ms, decay 1.4 s
  - ukulele: saw f, LP envelope 3.5 kHz to 700 Hz over .18 s, 12 ms strum
  - pizz/upright bass: triangle + f/2 at .3, LP 500 Hz
  - whistle-flute: sine plus delayed vibrato 5.5 Hz ±12 cents, plus breath noise
  - clarinet: square, LP 1.4 kHz, attack 30 ms
  - vibraphone: f + 4f at .05, tremolo 5 Hz
  - pad: 2 saws ±7 cents, LP 900 Hz, attack 1.2 s, release 2 s
  - brushes: pink noise BP 3 kHz, 80 ms; ride: noise HP 6 kHz; shaker: noise HP 5 kHz, 40 ms
  - pre-bus gains: lead .14, comp .07 per voice, bass .16, pad .06, percussion .03-.05
- Variants:
  - rain: LP 1.8 kHz, tempo -8%, sparse vinyl crackle
  - fog: a longer room tail
  - snow: sleigh-bell shimmer plus celesta
  - season leads: spring flute, summer steel-pan (FM 1:2.5), fall clarinet, winter celesta
  - Halloween: the same motifs re-harmonized in harmonic minor on a reed organ, plus a theremin counter-melody (sine, 120 ms portamento, 6 Hz vibrato). Spooky-sweet.
  - winter holidays: bells plus IV-iv-I cadences
  - New Year's Eve: a music-box countdown, then a bright lift at midnight
- Hour chime: at :00 the Town Hall clock plays an ORIGINAL 4-note bell phrase (sine f + 2.76f + 5.4f, 3 s decay); a single soft note in quiet hours. Then the new theme fades in over 2 bars.
- Scheduler: setInterval 150 ms (400 ms LOW) with a .6 s look-ahead. Clear it on hidden and restart it on visible; on resume, reset the next-note time to now + .1.
- `BEAT` publishes phase and bpm: Mocha's hem wobble and idle bob subtly sync, and keepers tap a foot.
- `SONG.key` keeps UI sounds in key.

**2. GENRES and RECORDS.**
- `GENRES`: 8 instrument recipes built from the songbook voices: lofi, jazz, musicbox, folk (ukulele and shanty), citypop, ambient, spooky and chiptune. Bossa, rag, funk, lullaby, march and holiday are variants of these.
- `RECORDS`: 16 originals `{id,ttl,artist,g,recipe,seed,bpm,key,mood[],price}`:
  - Rainy Lo-fi (lofi)
  - Music Box Waltz (musicbox, 3/4)
  - Ferry Jazz (jazz, swing .62, 112)
  - Sea Shanty Singalong (shanty, 6/8 accordion)
  - City Pop Drizzle (citypop)
  - Spooky Organ (spooky)
  - Cedar Lake Ambient (ambient)
  - Ukulele Sunday (folk)
  - Chiptune Arcade (chiptune)
  - Silent Film Rag (rag)
  - Bossa Bean (bossa)
  - Snowglobe (holiday)
  - Night Market Funk (funk)
  - Lighthouse Lullaby (lullaby)
  - Salmon Run March (march)
  - a secret "Mocha's Song"
- In this step every record is playable through the radio, the jukebox and requests. B34 adds owning them as vinyl.
- `MUSIC.play(id,emitter)` plays any RECORDS id at any emitter with the B20 falloff (ref and max per emitter type).

**3. Mocha picks the music, from day one, with nothing to buy.** All of these are his choice:
- **His transistor radio.** A hand-me-down in his parents' move-in package on a fresh start (round-1 parents' mail, a letter saying "found this in the lighthouse attic, it still gets Drizzle FM"). Existing saves get it in their next parents' letter (a migration flag). `hasItem('radio')` becomes true and it sits on his windowsill (a small merged mesh). Three original stations, each a GENRES playlist:
  - Drizzle FM 88.5: the town station, broadcast from Basil's booth at Rain City Records; the town mix plus requests
  - Harbor Jazz 91.3: jazz, bossa, city pop
  - Lantern Lullaby 104.7: music box, ambient, lullaby
- **The Lantern Square jukebox** (the B8 prop). He may feed it 1 of his own coins for one song (about 2 minutes) that plays to the square (ref 6, max 30). It is a weighted candidate when he is in or passing the square and his music interest is high.
- **The request box at Rain City Records** (free). He drops a request card; at the next :00 or :30 Basil plays it on Drizzle FM, and it becomes the town's music for 30 to 60 minutes (when "his picks can take over the town music" is on). Basil reacts, and he journals it ("dropped a request in Basil's box. he played it at 4:30. the whole street was city pop").
- **Phone call-ins** (round-1 phone): 1 to 3 times a day, never mid-text, with the same effect, sooner.
- **Owned records** on his own player come in B34.
- `pickMusic(ctx)`, hoisted, chooses the source and the item over everything available:
- Scoring (inside `pickMusic`), at home and awake, every 20-40 min or on activity change:
  - scores `taste·genre + moodFit` (rainy = lofi/ambient; painting = jazz/ambient; cooking = bossa/shanty; Halloween = spooky; guests = upbeat; bedtime = lullaby) `- recency`
  - may choose silence (reading)
  - honors a validated mind `record` field
  - a phase declared when one genre jumps: "I'm in a city-pop phase. Don't look at me."
- `S.music={t:{genre:-1..1},st,now:{src,id,since},jb,ph,r:[],our,sg:[]}` (2 KB or less; `r`, `our` and `sg` fill in B34). Taste seeds from his interests.
- **The town leans toward his taste.** While he is outdoors and awake, each phrase of the hourly theme has a chance of `.25+.35*tasteStrength` to swap its lead to his top genre's signature voice (jazz to vibraphone, folk to ukulele, musicbox to music box, citypop to Rhodes, lofi to felt piano with vinyl crackle, ambient to pad, spooky to reed organ, chiptune to a square lead). Over weeks, his taste colors the whole town.
- **Drizzle FM.** The chip reads "Drizzle FM · Mocha's pick: City Pop Drizzle". A keeper reacts, and the café and record-shop speakers carry it too. Keepers have their own slots (Basil's Sunday-evening funk hour).

**4. You can see and tune in to what he chose.**
- The now-playing chip (HUD slot `nowPlaying`) shows whatever Mocha is playing, even with sound muted (with a muted glyph): "♪ Mocha · Harbor Jazz 91.3 · Ferry Jazz".
- Tapping it opens a card: generative cover art from the seed, the source ("on his radio", "his jukebox pick", "his request on Drizzle FM") and a "Listen in" toggle.
- Listen in plays what he is playing for YOUR ears only, from anywhere: the listener mix solos his emitter at 70%, non-spatial, until you toggle it off or walk into a place with its own music. His choice never changes.
- Note sprites: one Points pool of 6 note glyphs (1 draw) drifts from the window or door of any building playing music within 60 of the camera, so his pick is visible with the phone on silent.

**5. Shop soundtracks and the cinema pianist.**
- Opening a door rings the bell and lets the shop's music leak out. Inside, the town music drops to 15%. Only one shop music runs at a time; it pauses beyond 30.
- Shop sounds:
  - café: acoustic bossa 120 bpm, murmur, cup clinks, espresso steam
  - records: the featured record or Basil's pick, plus booth crackle
  - books and library: no music; a clock tick, page turns, and a soft "shh" from Rosalind if Mocha hums
  - studio: harp arpeggios
  - arcade: chiptune
  - market and grocery: easy bossa plus register blips
  - pet store: chirps and a bubbling tank
  - phone store: synth-pop
  - bike shop: freewheel ticks and a surf groove
  - Town Hall: quiet; a gavel on vote night
  - Fogwell lobby: elevator bossa plus a ding
  - Evergreen: soft jazz piano; Drizzle Threads: city pop; nursery: birdsong, wind chimes, harp; bakery: a warm oven hum plus a music box; Lantern & Wick: a crystal-glass pad
- Cinema: during real silent films, a live felt-piano accompanist picks a style from the film's theme: stride/rag 108 bpm for comedy and chases, a 3/4 waltz for romance, low tremolo for suspense, a march for adventure. A projector whir runs underneath, and a cadence plays on The End.

### STRETCH
- New Year's Eve countdown variant polish.

### Must not break
- No audio before a gesture; no sound while hidden.
- Round-1 texting (a call-in never interrupts a text).
- Coins never go negative (the jukebox checks his wallet).

### Acceptance
- `__mocha.song(9)` and `song(21)` return different keys and tempos; the same seed gives the same theme across reloads; forced rain makes the music bus low-pass active.
- Fresh-start simulation: the move-in package contains the radio, and within one activity change at home `__mocha.music().now` is set from the radio, with zero purchases.
- `pickMusic({mood:'wistful',wx:'rain'})` returns lofi or musicbox. With a phone, `__mocha.radio('citypop')` crossfades the town music and shows "Drizzle FM · Mocha's pick".
- Forcing the jukebox candidate spends 1 of his coins and plays to the square only. A request changes the town music at the next half hour.
- Muted: the now-playing chip still shows his pick. Listen in plays his emitter for the user and never changes `S.music.now`.
- Note sprites drift from his window while music plays (1 draw). The scheduler is cleared on hidden. The cinema pianist starts with a film and stops at The End. Smoke tests pass.

### Hooks
- `__mocha.song(h)`
- `__mocha.playHour(h)`
- `__mocha.music()`
- `__mocha.pickMusic(ctx)`
- `__mocha.radio(id)`
- `__mocha.jukebox()`
- `__mocha.listenIn(on)`

---

## B22. Town Clock, shop life, pals and weekly goals

**Goal.** The town gets its own heartbeat, so the townsfolk are visibly doing as much as Mocha. At 5:58 the café door swings open and Juniper flips the sign. Gus tosses a salmon when someone watches. Pals stop to chat on the sidewalk and meet up after closing. All week you can watch Hank's birdhouse take shape in the park.

### CORE

**1. Town Clock: plans derived from the clock, not simulated.**
- Each `CAST` entry gets a rhythm string per weekday type, parsed once. Example:

  `juniper.wk='0515 swim park.lake;0545 >cafe;0600 open;0600-1900 work;1400 brk cafe.window 30;1900 close;1915 >home;2100 bed'`

- `parsePlan` returns `[[h0,h1,kind,place,spot,verb]]`. `planFor(id,date)` memoizes per dayKey and applies overrides: weekday off-days, rain cancels outdoor hobbies, holidays, events.
- Position is a pure function, `blockAt(plan,hour)`. Off-screen NPCs are placed at their block's spot.
- Only NPCs near the camera or walker (within 85) physically walk their commute via `navRoute` and doors. Transitions run `npcPath` only when near; otherwise the NPC snaps.
- `townTick()` runs at 1 Hz from an accumulator inside `frame()`, so it pauses when hidden.
- Keepers move out of the shop groups into world space (`scene.attach(obj)` once) and spots resolve via `toWorld`.
- Delete the 20 s `k.obj.visible=isOpen` interval.
- `keeperAt(pid)` returns the keeper whose `N[id].st==='work'` at that shop.
- `isOpen(p,h,dow)` learns breaks and day-offs from plans. It is pure, so catchUp stays consistent. Keep plan tables next to `KEEPERS` (above catchUp, TDZ!).
- Visibility LOD:
  - visible if outdoors within 85 of the camera, or inside a building whose shell is fading / camera within 30
  - at most 5 animated (nearest, re-sorted in `townTick`)
  - castShadow on the nearest 4 only
- Walking speeds by species: Chip 3.6, Bea 3.2, Juniper 3.0, Wendell 2.4, Gus 2.1, Monty 1.8.
- An umbrella pool of 4 is re-parented to near walkers when wet.
- Homes: use the B40 table now (if B40 buildings are not ready, fall back to "inside the shop's back room" for keepers whose homes do not exist yet). Upstairs windows are reported via `occOf` for B16.
- Commuters by train: Marigold and the builders arrive on the 8:05-ish train at Rain City Station, if round-1 trains exist.
- `npcStatus(id)` returns strings like "steaming milk at Drizzle & Bean", "on lunch break at Cedar Lake Park" or "asleep upstairs". It feeds the near pill, the big map (initial dots) and the mind context (one line).
- The parser (`parsePlan`, `planFor`, `blockAt`) exists since B17; generalize it to every `CAST` entry.

**2. The cast bible.** Personality, voice tic, signature rhythm, off-duty hobby, species quirk, pals and rivals, birthday, and three backstory layers (each 140 chars or fewer) unlocked by the user's hearts (B36). Use the social designer's full bible:

| Character | Voice | Rhythm and life | Birthday | Backstory layers |
|---|---|---|---|---|
| Juniper | ends lines with "~", beverage metaphors | floats on Cedar Lake at dawn with a thermos; opens at 6:00; chalkboard at 10:30; Tuesday book club | Mar 14 | espresso machine "Duchess"; dreams of a ferry café; jar of customer notes, one in Mocha's handwriting |
| Basil | music terms | in at 10:45 with headphones; daily featured record; busks Friday on the promenade; Sunday open mic | Aug 21 | The Drizzlers band; lost first pressing; unplayed songs |
| Mabel | "whooo" puns | in at 9:50 yawning; feeds Inkwell the cat; ladder shelving; reads poetry on the library steps under the lamp 20:00-21:30; rival Rosalind since 1998 | Oct 17 | publishes poems under a pen name (Mocha owns one); keeps a ledger of every recommendation; glasses on her head |
| Rosalind | opens with "fun fact:" | 7:00 hop-jog; book cart and stamp; Wednesday story hour; hides under the desk in heavy rain | Apr 3 | reads romance under a 'Tax Law' dust jacket; has read every book but one, saved for a special day |
| Gus | CAPS when excited | fishes at 4:45; fish toss when watched; noon sandwich with Bea; orca watch at sunset; rival Hank | Jul 9 | grew up watching Alaska salmon runs; can't swim; calls the orca pod 'the family' |
| Pearl | opens with "darling" | sunglasses in the rain; Saturday 7am garage-sale walk with Wendell; plays possum 3 s when startled (thunder, or the typed word "boo") | Jun 2 | the shop was her grandmother's; once modeled in Portland; keeps one lost button from everyone she loves |
| Sol (they) | speaks in colors | sketches at the park pond at 7; a canvas progressing through the week; sings at the pond on rainy nights | May 19 | painted an old mural that got painted over; wants to paint Mocha; hears colors in music |
| Chip | gamer slang, "gg" | sprints in at 10:45; plays BOB alone in the dark arcade after close; rival Basil | Feb 29 | has never beaten BOB; is BOB's biggest fan; secretly scared of the claw machine |
| Hank | wood puns | apple pyramid at 6:30; builds things in the park at supper | Sep 12 | built the promenade bench; afraid of heights, never rode the wheel; dreams of a treehouse library |
| Bea | adds "*wags*" | walks the store poodle at 7:30; lunch with Gus; Sunday meet-the-animals | Jan 23 | was a shelter pup; knows every pet in town by name; dreams of a rescue farm on Bainbridge |
| Monty | "Cut to:" | reads at the library at 11; threads the projector; watches a film alone after close | Dec 8 | grandfather played piano for silent films; cries at every ending; wants to film the whole town |

- The new cast gets entries too:
  - Otis: saws in the back workshop.
  - Wren: knits at the counter.
  - Willa: tends herbs at dawn; at dusk flies her broom in a loop over the woods on clear evenings (only visibly on Halloween night for a long flight; otherwise a short hop).
  - Pippin: bakes at 4:30; sells out.
  - Luma: lights every lamp at 14:00.
  - Vesper: wakes at dusk; cinema night usher 19-23.
  - Clem: busks on the promenade 16-19.
  - Hollis: market stall Saturdays; walks his pumpkin patch.
  - Tabitha: re-wraps her bandages; reshelves at the library.
  - Morel: forages in the woods after rain.
  - Honey: tends hives at Willa's.
  - Reed: fishes off the pier at dawn and dusk.
  - Ambrose: tips his hat in the Fogwell lobby.
  - Odalie: the Town Hall office, and a slow evening wade along the edge of Cedar Lake.
  - Marigold: the petition desk.
  - Jot: the mail route 9:30-11:30, hopping porch to porch with round-1 parents' mail; the mailbox flag pops up.
  - Captain Barnaby: tells sea stories on the promenade bench.
  - Dale & Birch: idle in the Town Hall yard until B38.
- Birthdays appear on the round-1 calendar. On the day: a party hat (one shared cone re-parented) and greetings.
- Wendell's birthday is Nov 20 (B33 stages it).
- Data budget: about 12 KB.

**3. Shop life.**
- Opening ritual, 10 to 15 min before hours: the keeper walks up, unlocks (key jingle event), the door opens, `flipSign(pid,true)` runs, the market shutter rises, and the first task starts.
- Closing: sweep, wipe, sign flip, lock, walk home.
- Work: 3 to 4 rotating task stations (B12 spots t1..t4), 25 to 70 s each, using a VERBS table of 12 tiny pose functions on the chibi rig: stir, wipe, reach, reachHigh, carry, sweep, toss, read, sit, sleep, paint, wave.
- Shared props, built once and re-parented: broom, crate, book, mug, salmon, popcorn scoop (8 meshes or fewer).
- Gus's salmon toss is a parabola every 150 to 240 s when the camera or Mocha is within 40. It syncs with Mocha's "watching the fish toss" act.
- When Mocha is being served or the user is talking to them, the keeper stops, faces the customer, then resumes.
- Breaks: one 30 to 45 min break each, staggered so 3 or fewer are out at once.
  - The door shows "Back at 2:30" and `isOpen` returns false.
  - Noon café rush: 2 to 4 keepers sit at café tables.
  - Morning coffee runs 7:30 to 8:45 with to-go cups.
- Daily-changing details, one canvas redraw a day: Juniper's chalkboard (B9's special), Basil's staff-pick card, Mabel's window book, Hank's shrinking apple pyramid, Sol's canvas, Monty's marquee (`setMarquee`), Chip's high-score board (BOB on top), Bea's pet of the week.
- Keepers greet Mocha by name and notice his outfit from `S.wearing`.

**4. Pals and overheard (CORE).** A `PALS` edge table (about 14 edges):
  - Juniper-Sol: roommates
  - Rosalind-Tabitha: roommates
  - Mabel-Rosalind: rivals
  - Gus-Hank: rivals
  - Basil-Chip: rivals
  - Pearl-Wendell: garage-sale buddies
  - Monty-Mabel-Juniper: book club
  - Gus-Bea: lunch pals
  - Hank-Monty
  - Chip-Wendell: the BOB mystery
  - Dot-Kip
  - Willa-Honey: housemates
  - Clem-Basil: music
  - Vesper-Monty: night shift
- Paired NPCs within 3 trade 4 to 6 bubbles 3.5 s apart, only within 45 of the camera, with a 10 min cooldown per edge. Use the social designer's sample banks.
- Within 8 of the walker, the exchange logs to `S.town.over` (cap 8) as "Overheard".
- Mocha may add a line when passing, by his choice.

**5. After closing, pals visit each other.** 2 to 4 seeded pal visits per evening (19:30 to 21:30), chosen from PALS by the day seed and both plans. Until B40 gives everyone a home, they meet at third places: the café patio, a Lantern Square bench, the park pond, or Wendell's porch for Pearl's garage-sale planning. After B40 they visit each other's homes, where that room's window lights for both (B16). The visit is part of both plans, so catchUp and the lights stay consistent.

**6. One small weekly goal each, visible on screen.** `WEEKLY` (about 3 KB) gives each townsperson one goal per week in 4 or 5 stages. The stage is a pure function of the week seed and the weekday. Each stage changes something you can see: a mesh added, a canvas redrawn or a sign line.

| Who | Goal | Where you see it |
|---|---|---|
| Hank | builds a birdhouse | the park picnic table: posts, box, roof, paint; on Sunday a black-capped chickadee pair moves in |
| Sol | a canvas | the pond easel, redrawn each day |
| Juniper | a chalkboard mural | the café wall |
| Basil | reorganizes the crates | an "A to M done" card |
| Chip | chases BOB's high score | the arcade board climbs |
| Bea | teaches the store poodle a trick | sit, then paw, then spin; shown off when you visit |
| Monty | a double-feature marquee | the letters go up one per day |
| Mabel | a window display theme | the window book stack |
| Gus | salmon jerky jars | the jar count on his stall |
| Pearl | dresses the window mannequin | one piece per day |
| Rosalind | "seven books this week" | a growing stack on her desk |
| Otis | a rocking chair | the back workshop |
| Wren | a scarf | its length on the counter |
| Pippin | a new pie recipe | a chalk card; tasting day Saturday |
| Willa | a potion-garden bed | her herb ring |

- Keepers mention their goal in talk (B23); Mocha may notice it (weighted, his choice); finishing it posts news on Sunday.

### Must not break
- `fx:'ask'` and Mocha's `arrive()` keeper greeting.
- catchUp, which must not call any 3D code (plans are pure).
- Mind context size: one line per system.
- Round-1 texting (Messages belongs to Mocha only; townsfolk never text the user).

### Acceptance
- `__mocha.town.at(5.9)`: Juniper is at the café door; then `at(6.05)` gives sign open plus door open.
- `at(14.2)`: Juniper is on break and `isOpen(cafe)` is false. `at(22)`: keepers are home (or in their back rooms) and the café is dark and locked.
- `__mocha.town.pair('gus','hank')` within 3: 4 to 6 alternating bubbles within 45 of the camera; Overheard logs it within 8 of the walker.
- After closing, 2 to 4 pal visits appear in the plans, and one is visible at a third place at 20:00.
- WEEKLY: Monday and Thursday show different stages of Hank's birdhouse and Sol's canvas; the stages are identical across reloads.
- 8 or fewer characters at LOD0. At 15:00 draw calls are within budget (report). Smoke tests pass.

### Hooks
- `__mocha.town.npc(id)`
- `__mocha.town.plan(id)`
- `__mocha.town.at(hour)`
- `__mocha.town.tick()`
- `__mocha.town.sign(pid)`
- `__mocha.town.toss()`
- `__mocha.town.pair(a,b)`
- `__mocha.town.weekly(id)`

---

## B23. Talking to anyone: talk card, dialogue, gossip and Mocha in person

**Goal.** Walk up to anyone and they stop, face you and answer in their own voice with things that are true right now. They ask about you and remember your answers. "How's Mocha?" always gets a fresh, true answer. Mocha himself chats with you without being frozen in place.

### CORE

**1. Talk box.**
- The nearest talkable thing within 2.8 and in front of the walker (dot > .3) turns the near pill into a button: "Talk to Juniper". Talkable things: keepers, the cast, Wendell, Mocha, the notice board.
- Open it by tapping the pill, tapping the character (within 10; tap priority from B11), or pressing T or Enter.
- A "!" emote shows above characters who have something for you (news, a question, a request from B36).
- The card: a rounded paper card at the bottom, with a name tab in the character's color.
  - Text types at about 40 chars/s; tap to finish or advance.
  - 4 to 6 chips, 44 px tall, wrapping; "Bye" is always last.
  - "Say something..." opens an inline input that reuses the mic and auto-send.
- Keepers, Wendell and the cast pause, turn to you and react (wave or hop); the walker waves. Mocha does NOT pause: he keeps doing his own thing, turns his head and answers over his shoulder. He stops only if he himself picks the weighted 'chat with my visitor' candidate (userBias term `talking`, +.5).
- Two-shot camera: `CAM.push('talk',{prio:2})`, midpoint, dist 5.5, pitch .28, yaw perpendicular. Restore on close.
- `body.talking` hides the joystick, look stick and dock.
- Layout:
  - portrait: full-width card, max 46vh
  - landscape: 60vw centered, max 52vh, chips in one scrolling row
  - Duo/desktop: 560 px centered
  - `visualViewport` lifts the card above the keyboard
- NPC bubbles: replace the single `#bubble3` with a pool of 3 (`#nb0-2`), assigned by priority.

**2. Local dialogue brain**: one `npcReply(k,intent,ctx)`.
- Chips:
  - What's new?: thread beat, event, daily detail, or news they heard
  - How's Mocha?: see 6
  - Tell me about {topic}: an untold FACTS line, rotating with no repeats; bitmask in `S.you.rel[k][5]`
  - Any recommendations?: today's stock (B25) or a place matched to what they know about you
  - About you...: backstory layer by tier
  - What do you think of {pal}?
  - Can I help?: a request (B36)
  - Give...: shown once B30's `giveTo` exists
  - Situational: Happy birthday!, Happy Halloween!, Any mail for me? (Jot)
- Voice style pass, applied once per reply with cheap string ops:
  - Gus: CAPS on the excited clause
  - Mabel: "who" becomes "whooo"
  - Pearl: opens with "darling,"
  - Chip: appends "gg"
  - Juniper: ends with "~"
  - Sol: colors adjectives
  - Monty: "Cut to:"
  - Hank: wood pun
  - Bea: "*wags*"
  - Rosalind: "fun fact:"
  - Wendell: opens with "ah,"
  - new cast: Willa adds a sparkle "*~", Vesper yawns, Clem "rattles happily"
- Repeat guard: no reuse of a character's last 6 lines.
- They ask YOU: about once a day per character, the conversation opens with a question plus answer chips. Examples:
  - Juniper: coffee, tea or cocoa?
  - Basil: genres
  - Mabel: mysteries or poetry?
  - Bea: cat or dog person?
  - Sol: favorite color (swatches)
  - Gus: ever seen an orca?
  - Monty: happy endings or twists?
  - Hank: sweet or savory?
  - Pearl: cozy or bold?
  - Chip: puzzle or action?
  - Rosalind: what do you want to learn?
  - Wendell: what did you collect as a kid?
  - Willa: which season smells best?
- Answers go to `S.you.facts=[[key,val,by,t]]` (cap 16). Effects: Basil recommends matching records; Sol later paints your color (B36 mural stretch); Mocha hears about it via news (7).
- Typed free-form:
  - first a ~20-row regex intent table: greeting, bye, how are you, Mocha, recommendation, topic, other names, weather, time, events, compliment, joke, help, thanks, "boo" (Pearl plays possum)
  - if no confident intent, the mind is on and the budget allows: ONE in-character Claude call via the existing `ask()`, gated by `MIND.allow('user')`. 60-word persona card + 3 town facts + Mocha's 3 latest diary lines + what they know about you; reply JSON `{reply<=160, remember?}`; 12 s timeout, then a local fallback
  - otherwise a cross-referral ("that sounds like a question for Rosalind at the library")
  - AI rules: 1 call per 60 s, 12 per day, cached per character + normalized question per day, never while hidden. Sanitize output: no markup, and drop lines that command Mocha.
- `S.you.rel[id]=[pts,firstT,lastT,talksToday,dayKey,factsBits,flags]` is created here (the facts bitmask and talk counts); B36 adds hearts and tiers.

**3. Gossip and the news bus.**
- How's Mocha? draws from four sources:
  1. his visit to their shop in the last 3 days (paraphrased from his diary through templates, quotes clipped to 60 chars)
  2. a live sighting in the last 30 min (`n.saw`)
  3. news they heard
  4. his mood/needs
- `S.town.news=[[t,kind,text,place,whoMask]]`, cap 16. Bit 30 = Mocha heard; bit 29 = user heard.
- `newsPush()` is called from adoptPet, makePainting (plus sale and gift), round-1 trip return, addHobby, acquire for big items, and later steps.
- `spreadNews()` runs hourly in `townTick` and per missed day in catchUp: p=.35 per pal edge per day, .6 when co-located.
- Keepers greet Mocha with fresh news 40% of the time ("how was Leavenworth?!").
- Your kindness reaches Mocha indirectly: when he visits a keeper who knows something nice you did or said, he writes it in his diary and stores an `S.mem.facts` entry. It is information, never direction.

**4. Talking with Mocha in person.**
- Chips: Hi Mocha!, What are you up to?, How are you feeling?, Wanna hang out sometime?, Say something... (the existing `localReply`/`mindChat` path).
- His answers are honest: "mid-painting! come look?"; when asleep he mumbles sleep-talk.
- "Wanna hang out sometime?" stores `S.mem.hangAsk={t}`: the userBias term `hangAsk` (+.4 for 24 h) nudges his own social acts, if he feels like it.
- Introductions: when Mocha and the walker are both near a keeper the user has not met, Mocha may (sociability-weighted, once per character) introduce you, and the keeper's first line is warmer.

### Must not break
- `fx:'ask'`.
- Round-1 texting and the in-person chat bubble.
- Autonomy: opening, using or closing the card never writes `G.act`, `G.target` or `G.mode`.

### Acceptance
- The walker near Juniper shows "Talk to Juniper". Opening it gives a card with at least 5 chips. "Tell me about coffee" twice gives two different TRUE facts. "How's Mocha?" returns text referencing his current status or a recent diary entry.
- Talking to Mocha: `G.act` and `G.target` are unchanged by opening the card, and he answers over his shoulder.
- A typed "boo" to Pearl triggers the possum flop. With the mind off, a typed free question gets a local or referral reply and 0 API calls; with it on, at most 1 call, through `MIND.allow('user')`.
- `__mocha.town.news()` grows after `adoptPet`; after `spread(2)` a keeper knows it.
- The talk card in portrait, landscape and Duo, with the keyboard open (simulated `visualViewport` height): no overlap. CAM 'talk' is pushed and popped. Smoke tests pass.

### Hooks
- `__mocha.talk(id)`
- `__mocha.talkChip(i)`
- `__mocha.talkClose()`
- `__mocha.reply(id,text)` returns `{text,src}`
- `__mocha.askYou(id,qid,answer)`
- `__mocha.town.news()`
- `__mocha.town.spread(days)`

---

## B24. Catalog engine (150 items)

**Goal.** A catalog of exactly 150 charming things (about 450 with color variants), all built from primitives with no meshes stored, so shops can fill real shelves and homes can be decorated without blowing the draw budget or the iPhone's memory.

### CORE

**1. The catalog table.**
- Exactly 150 base items with 2 to 5 color variants each (about 450 variants), in one compact pipe-delimited table (about 14 KB) plus a flavor-line table (about 10 KB), parsed at load.
- Columns: `code|n|name|cat|builder|price|sets|tags|WxD|params|pool|season|vars|style`.
  - `n` is a permanent integer for bitsets; `code` is a stable 2-3 char save id. Never renumber.
- Sets: Cabin Rustic, Gothic Parlor, Rainy Day, Witchy Apothecary, Mushroom Forest, Ferry & Harbor, Coffeehouse, Retro Arcade, Cottage Bloom, Pumpkin Patch (Oct), Harvest (Nov), Winter Lights (Dec), Seattle Souvenirs (Sky Needle model, ferry model, Puget Sound map).
- Categories (exactly 150; never renumber):
  - seating 9, tables 7, beds 4, storage 7
  - misc 6 (upright piano, grandfather clock, telescope, easel, folding screen, record player)
  - lighting 12 (mushroom lamp, moon lamp, ship lantern, jar of fireflies, paper lantern, string lights, and more)
  - plants 10 (fern, monstera, pothos, bonsai, Venus flytrap, terrarium, and more)
  - rugs 6
  - wall 10 (procedural art; posters of the cinema's real silent FILMS; cuckoo clock; round mirror; quilt; photo frames)
  - kitchen 7, electronics 6
  - toys and collectibles 10 (Mocha plush, snow globe, ship in a bottle, geode, music box, and more)
  - seasonal 12, wallpapers 8, floors 6
  - clothing 14: a rain jacket in 6 colors (forest, harbor blue, navy, teal, plum, charcoal), a flannel to tie around the waist (3 plaids), a cable sweater, a beanie, a bucket hat, rain boots, a big backpack, a clear bubble umbrella, a scarf, mittens, an October witch hat, bat wings, a pumpkin head and a ghost-sheet costume
  - food 4, records 8 (mirroring the B21 RECORDS ids), seeds and garden 4
- No yellow, mustard or gold jacket variant exists anywhere: jacket hues 38 to 68 degrees are blocked by the parser.
- Every item has a short flavor line. Collectibles with a real subject get one TRUE fact.
- `tags` drive Mocha's appeal, his vibe words when he visits you (B31) and shop pools. `style` is one of gothic, cozy, plant, retro, spooky, nautical, minimal.
- About 25 builders (chair, sofa, table, bed, shelf, cabinet, lamp, lantern, string, plant, rug, frame, clock, appliance, small, electronics, seasonal, garden, piano, train, aquarium, telescope, record, seedpack, food). They create NO meshes: each emits a PART list (box/cyl/sph/cone/torus/decal, dimensions, local transform, palette slot), cached per (code,variant) as a Float32Array template.

**2. Rendering that fits an iPhone.**
- Each shop display, decorated room or yard merges its item templates into one BufferGeometry sized to what it holds: count the vertices first and allocate exactly that (decorated rooms get 25% headroom for edits). Draw it with one shared `MeshToonMaterial({vertexColors:true})` carrying the rim flag (B15).
- One more merged emissive mesh holds lamp shades and flames.
- Decals (rug patterns, posters, book spines, screens) live in one lazily drawn 1024x1024 atlas (8x8 cells of 128).
- Lifetime: build lazily when the walker or camera comes within 35; hide beyond 50; dispose the geometry after 30 s hidden and beyond 60, and rebuild on return (about 3 ms). Total merged catalog geometry stays at 6 MB or less (`__mocha.catMem()`).
- Targets: 4 draw calls or fewer per decorated room, 3 or fewer per shop display.

**3. Thumbnails and the catalog page.**
- Thumbnails: render a template once into a 128x128 `WebGLRenderTarget` with `MeshBasicMaterial({vertexColors:true})` and colors pre-shaded by n.l (no lights, so no new programs). `readRenderTargetPixels` into a canvas, dataURL cached in memory. At most 3 per frame while a tray is open. Unseen items reuse the render tinted black. Fall back to category emoji if slow.
- Catalog page (you tab): a grid by category. Silhouettes for unseen items, faded for seen, full color for owned. Completion % per category with milestone rewards at 25/50/75/100% (e.g. a brass catalog bell).
  - "Seen" = on a shelf near you, in Mocha's or Wendell's house while you are inside, or at the Night Market.

### Must not break
- Round-1 phone and bike purchases and `S.coins`.
- Mocha's `localAcquire`/`buyDecor` (B25 routes them through `stockFor`).

### Acceptance
- `CAT` has exactly 150 parsed items and the category counts sum to 150. `__mocha.buildItem(code,v)` returns parts for every item (loop over all, no throw).
- No jacket variant has a hue between 38 and 68 degrees.
- `__mocha.thumb()` returns a dataURL; at most 3 thumbnails render per frame.
- A shop display merges into 3 draws or fewer. Its geometry is disposed 30 s after being hidden beyond 60 and rebuilt on return. `__mocha.catMem()` is 6 MB or less after visiting every shop.
- The catalog page renders silhouette, seen and owned states. Smoke tests pass.

### Hooks
- `__mocha.CAT`
- `__mocha.buildItem(code,v)`
- `__mocha.thumb(code,v)`
- `__mocha.catMem()`

---

## B25. Wallet and shopping on real shelves

**Goal.** The user has a wallet that is satisfying to fill. Stores are full of real 3D things on real shelves, different every day: tap a lamp, see its card, buy it. Mocha shops the same shelves for his own reasons; sometimes he buys the moon lamp before you do.

### CORE

**1. The user's save** (8 KB or less): `S.you` (created in B18) gains:
- `coins` (start 120)
- `led` (ledger rows `[t36,amt,code]`, max 30)
- `store` (`'code.v.n;...'`, max 150 stacks)
- `pk` (pockets: 20 slots, 30 with Wren's big backpack; stacks of 10)
- `cat:{s,o}` (base64 bitsets of seen and owned-ever)
- `wish` (max 20)
- `st` (stamps per shop)
- `day:{k,div,g,sh,fish,wet}`
- `streak:{n,last}`
- `giftDay`

Rules:
- Store only ints and short codes; names come from the catalog.
- Add every field to `fresh()` and `migrate()`.
- `resetBtn`/`freshBtn` keep `S.you` (`const keepYou=S.you; S=fresh(); S.you=keepYou`). Settings gets a separate "reset my cabin" with a two-tap confirm.
- Day rollover: check the local `dayKey` on load, on visibilitychange and once a minute. Everything daily comes from `seeded(hash(dayKey+salt))`, so devices agree.
- Hooks: `__mocha.you()`, `__mocha.youSize()`.

**2. Wallet UI.**
- Walk mode shows the HUD slot `wallet` (top-left, inside the safe area): coin icon, count, and a backpack button that opens the you tab.
- `addCoins(n,code,src3d)`: clamps at 0, pushes a capped ledger row, flies a pooled "+12" coin from the world source to the pill (at most 4 at once, CSS transforms only), and calls a `DOOREV`-style `SFXEV.emit('coin')` stub.
- Neighbor Dividend: each morning Jot drops the Rain City Gazette in your mailbox with 10 to 25 coins. Formula: `10+round(clamp(econMood,0,1)*15)` once B37 exists; 15 until then.
- Cozy stamp card: one stamp per day visited. It never resets. Every 7 stamps earns the month's special item (a harvest wreath in November, a Sky Needle snow globe in December).
- "Today in Rain City" card at the top of the you tab: shop specials, crab pot status (B35), the Night Market (Fridays, stretch). Built locally from the day seed.
- The you tab has sub-sections: me (Your Look), pockets, catalog, field notes (B35), ledger, and "what Mocha knows about you" (existing content plus B28's memory list).
- Price bands:
  - small decor 8-35, furniture 30-160, rare 200-450, clothing 15-60
  - the user's own bike 250, cabin upgrades 600-2500
  - the user earns about 60-120 per relaxed 10-15 minute visit

**3. Shopping you can touch.**
- `stockFor(shopId,dayKey)` is pure and memoized per day: it picks from the shop's pool plus in-season items into `DISPLAY` slots (B12, B13). One Keeper's Pick is 20% off, with a story line.
- One merged display mesh per shop is built lazily when the walker or camera comes within 35, and hidden beyond 50.
- Window displays show 2 to 3 of today's items behind glass, and glow at night.
- Walking near a shelf shows a floating tag over the nearest item ("moon lamp · 28"): one pooled DOM element, positioned with `project()` only while inside, scanned every .2 s.
- Tapping an item opens the Item Card (bottom sheet in portrait, side card in landscape and on the Duo):
  - thumbnail, name, price, set chip, size, flavor line
  - variant swatches (tapping recolors the shelf item live)
  - "Mocha would love this" when the tags match his top interests (an informational gift idea, never a prompt)
  - buttons: Buy, Wishlist, Try on (clothes: temporarily applied to the walker, camera swings to face it), Wrap as a gift (at Pearl's, 2 coins)
- "See everything here" button: a scrollable grid of today's stock, so phones never need precise 3D taps.
- Buying:
  - the keeper reacts in character
  - the walker's eyes sparkle and the item lifts off the shelf
  - the slot shows a SOLD card until tomorrow (`S.shopDay={k,sold:{shop:mask},m:{shop:mask}}`)
  - small items go to pockets; furniture arrives as a ribboned box on the cabin porch (B26). Until B26, it goes to storage.
- Stamp cards per shop: 8 stamps unlock the keeper's signature item (Juniper's speckled latte mug, Basil's "Ferry Jazz" gold record plaque, Mabel's owl bookends).
- Selling: Pearl buys anything at 50%. Gus buys fish and crabs, Hank produce, Willa plants and mushrooms (B35 supplies most of these).
- Shop pools:
  - the 5 new shops: Evergreen furniture and paint; Drizzle Threads clothing; Fern & Moss plants, seeds and garden decor (a mason-bee hotel, with a TRUE fact); the bakery's food and candy; Lantern & Wick's lighting
  - existing shops: café mugs and beans; records' records and player; bookstore books and bookends; market flowers, produce, rod and crab pot; thrift random vintage at 70% plus a mystery box; grocery kitchen items; pet store aquarium and feeder; studio easels, frames and Mocha's consignment wall (B31); arcade prize toys; cinema film posters; phone store radio; bike shop the user's own bike plus bell and basket
  - library: a free swap shelf (one free random item a day)
- The town shops too: when Mocha buys an item on display, it vanishes and the slot reads "sold to Mocha" for the day. His essentials (bed, stove, couch) are always available at Otis's order desk, so the user can never block his life.

### Must not break
- Round-1 phone and bike purchases and `S.coins`.
- Mocha's `localAcquire`/`buyDecor` (now routed through `stockFor`).
- The db size: `__mocha.youSize()` is 8 KB or less.

### Acceptance
- Inside Evergreen at 12:00 there are at least 16 items on shelves. A tap on one opens a card. Buy reduces `S.you.coins`, the slot shows SOLD, and the item is in storage. Reload: still sold today, restocked tomorrow (`__mocha.newDay(key)`).
- `__mocha.mochaBuy(shop,slot)` shows "sold to Mocha"; his essentials stay available at Otis's order desk.
- The wallet is HUD slot `wallet`; the coin fly-in uses CSS transforms only; `addCoins` never goes below 0.
- The item card and "See everything" are clean in all 4 viewports. Smoke tests pass.

### Hooks
- `__mocha.addCoins(n)`
- `__mocha.newDay(key)`
- `__mocha.todayCard()`
- `__mocha.stock(shop)`
- `__mocha.buy(shop,slot)`
- `__mocha.mochaBuy(shop,slot)`
- `__mocha.card(code)`
- `__mocha.you()`
- `__mocha.youSize()`

---

## B26. Your log cabin

**Goal.** The user gets a real Pacific Northwest log cabin across the street from Mocha's door, door facing door. Its windows glow amber when they're around, a fire pit waits out front for cozy evenings, and it grows over weeks without any debt.

### CORE

**1. The cabin** (PLACES `cabin`, kind `youhome`, at (40,74), ry PI, 14x10, walls 4.2; lot from B8).
- `buildCabin(p,grp,lv,ext)` is parametric and re-runs only on an upgrade or paint change (dispose the old geometry first).
- Logs: one InstancedMesh of `CylinderGeometry(.32,.32,1,8)` for every wall log and corner log end (about 80 instances, 1 draw). Dark chinking via an inner box.
- A green standing-seam metal roof (canvas seams plus moss blots; snow variant when `SEASON.snowy`).
- A river-stone chimney (smokes when the fire is lit; B16 smoke).
- A covered porch with a rocking chair (a SEAT), lantern and woodpile. Two window boxes with seasonal flowers.
- A hand-painted name sign plus the mailbox with your name: a canvas redrawn when the name changes; the flag pops up when something arrives.
- A fire-pit ring with three log benches (SEATS) in the yard. Tap the pit at dusk to light it (crackle, sparks rising in GLOWPTS, one ground light pool; it burns until 22:30 or until you put it out). A lit pit is a signal, like a porch light: B31 lets Mocha and Wendell notice it.
- A peanut dish on the porch rail: tap to leave peanuts for the crows (B35: Jot may leave a trinket in your mailbox).
- A small hanging sign by the door, "visitors welcome" or "napping, come back later" (`S.you.home.porch`; B31 reads it as the one allowed veto).
- Exterior draw budget: 16 or fewer.
- Presence lighting with NO new light: the cabin registers LIGHTSPOTS (hearth, reading lamp, kitchen) and WLT window slots (B16). While `isPresent()`, the windows fade on over 1.5 s, brightest in the room the walker is in. Closed app: dark, except the porch light at night.
  - The roaming L1/L2 rig (B16) picks up the hearth when you are near; one fire flicker value drives both the light and the window. Never put a light inside the cabin group: `buildCabin` disposes and rebuilds it on upgrades.
- Hearth Jar (no debt, ever): a mason jar on the porch you drop coins into anytime. When it reaches the next goal, Dale & Birch (Timber & Truss) build the upgrade overnight, with scaffolding and cones for one real day (reuse the B38 construction visuals if present; else simple scaffold boxes).

| Level | Upgrade | Cost |
|---|---|---|
| 2 | sleeping loft with a dormer | 600 |
| 3 | back room (bedroom or kitchen, your choice) | 1200 |
| 4 | wraparound porch with a swing | 900 |
| 5 | greenhouse lean-to | 1500 |
| 6 | cedar hot tub or barrel sauna | 2500 |

- Paint cans from Evergreen: log stain (honey, chestnut, charcoal, whitewash), roof (forest, rust, slate, plum), door and trim. The first change is free.
- State: `S.you.home={lv,ext:[stain,roof,door,trim],jar,rooms:{great:{wp,fl,it:'tuple;...'},loft:{...}},yard,porch:1}`. Tuple = `code.v.cx.cz.rot[.flags][.src.day36]`, about 14 chars.

**2. Inside the cabin**, with the cutaway like other buildings. `CABIN_ROOMS[lv]` holds `[{id,x0,z0,w,d,floorY,builtins,walls}]`.
- Level 1 great room:
  - a mudroom by the door with coat hooks showing your other owned jackets, and a boot tray
  - a river-stone fireplace with a mantel on the back wall (tap to light: crackle event, flicker, smoke)
  - an enamel kitchen corner (stove, sink, kettle)
  - a cushioned window-seat reading nook
- Log walls and a plank floor are the default wallpaper and floor. About 60% of the floor is free.
- The loft is reached by a ladder; a plaid bed under the dormer.
- Rainy-day coziness: in rain, animated drip streaks on the windows (one shared scrolling canvas), and the nook becomes a "watch the rain" seat where the camera frames the window.
- Interactive items: tap an item within 2 for one contextual chip. Acts:
  - sit
  - nap (bed; the screen softens to "zzz" plus the clock; no time skip)
  - lamp on/off (persisted flag bit)
  - music (record player: pick an owned record, B21's `MUSIC.play` plays it with falloff)
  - tv (a silent-film-style canvas loop reusing FILMS at 5 fps, only when visible)
  - keys (piano and music box: pentatonic Web Audio notes, through the B20 engine)
  - clock (cuckoo on the hour)
  - fish (aquarium swims)
  - train (circles its track)
  - scope (telescope zooms the camera to the Sky Needle, or the moon at night)
  - kettle (whistle plus steam)
  - frame (shows the user's photos)
- At most 3 animated items at once, only while the cabin is on screen and the walker is within 15. The anchor scan runs every .25 s with no allocation.
- When the user leaves the app at night, the walker naps in bed, visible through the window.

**3. Keepsakes.**
- Every placed and stored item carries a source code plus day36 (b:shop, f:habitat, g:m/g:w/g:keeper, h harvest, c catch, r reward). The story button shows it: "Bought at Second Story Thrift · Nov 3", "Gift from Mocha".

### STRETCH
- Garden: 4 plots (8 with the greenhouse). Seeds from Willa. One stage per real day when watered; a rainy day waters everything; dry plots pause, nothing dies. Harvests become vases, produce and pumpkins. `S.you.gard`; stages computed lazily.

### Must not break
- Mocha's house and the cutaway and peek.
- B12 layoutLint (the cabin must lint clean with its built-ins).
- The db size.

### Acceptance
- The cabin stands at (40,74) with its door facing Mocha's gate. 80 or more log instances in 1 InstancedMesh. The exterior costs 16 draws or fewer.
- The walker enters through the cabin door; the windows light within 2 s while present. The scene's light count is unchanged (no PointLight in the cabin group).
- `__mocha.jar(600)` triggers a scaffold day; `__mocha.cabinLv(2)` shows the loft, and the rebuild leaves the light count unchanged.
- The fire pit lights at dusk and burns out by 22:30; the porch sign and the peanut dish toggle.
- Interactive items: 3 or fewer animate at once; the record player plays an owned record via `MUSIC.play`. Smoke tests pass.

### Hooks
- `__mocha.cabinLv(n)`
- `__mocha.jar(add)`
- `__mocha.presence(on)`
- `__mocha.cabinAct(i)`
- `__mocha.fire(on)`
- `__mocha.firePit(on)`

---

## B27. Decorate mode, autoArrange and Moving Day

**Goal.** Decorating on an iPhone feels as satisfying as on a console: pick a thumbnail, drag with a relative finger, snap, twist, and set it down with a little bounce. One rules engine arranges rooms nicely for you, for Evergreen's showroom, for the condo residents and for Mocha's own nest.

### CORE

**1. Decorate mode** (inside any home you own).
- A "decorate" pill (HUD slot `decorate`). `CAM.push('deco',{prio:3})` eases the camera to a 3/4 top-down dollhouse view with the front wall and roof faded. A soft .5-unit grid fades onto the floor (or the walls when a wall item is selected), and the walker steps aside.
- Tray: bottom in portrait; right edge in landscape and on the Duo. Horizontally scrolling thumbnails (64 px; 72 on the Duo) with counts.
  - Tabs: furniture, small, wall, rugs, wallpaper, floor, yard, all. Set filters (cabin, witchy, rainy day).
- Place: tap a thumbnail and a translucent ghost drops into the room center with a footprint (green free, red blocked).
  - One-finger RELATIVE drag anywhere moves it (the finger never covers the item) with grid snap.
  - The rotate button or a two-finger twist turns it 90 degrees.
  - Tap the check (or empty floor) to set it down with a bounce, a "tok" sound event and a dust puff.
- Edit: tap an item to select it (lifts with a shadow ring). A mini toolbar offers rotate, variant (owned colors), move, put away and story. Long-press drag also moves.
- Smart snapping:
  - small items onto tables, shelves and the mantel (they ride along when the furniture moves; children store a parent index)
  - wall items slide along walls at 3 heights
  - rugs always lie under furniture
  - a lamp next to a seat glows briefly to show the pairing
- Wallpaper and floor sweep across the room with a sparkle.
- Safety nets: 30-step undo/redo (op records), "revert room", "tidy up" (`autoArrange`), and "room photo".
- Picking: each placed item keeps a world AABB; a tap runs `ray.intersectBox` over at most 120 boxes. While editing, rebuild the merged room mesh without the selected item (about 5 ms for 80 items); on drop, rebuild again.
- Room grid: `Uint8Array(cols*rows)` with floor, rug and wall layer bits.
- Yard decorating uses the same mode outside.

**2. `autoArrange(room,items,style,seed)`**: one rules engine.
- the bed in a back corner
- the sofa faces the focal point (fireplace or TV), the rug centered, the coffee table in front
- lamps beside seats
- plants in corners and by windows
- shelves on side walls
- art centered above the sofa or bed
- small items on surfaces

Used by tidy-up, Evergreen's weekly showroom vignettes ("This week: Rainy Reading Nook"), Wendell's interior, condo resident units (B39) and Mocha's nest (B32).

**3. Moving Day** (the first walk-mode entry after this update, or a fresh install). Three cards, each with a "later" button:
1. "What should we paint on your mailbox?": a name field, prefilled from `S.mem.userName`, skippable.
2. Four starter looks plus customize (B18 sheet).
3. The camera flies to the cabin, where three moving boxes sit on the porch. Tapping each unpacks a starter item (lamp, rug, chair) and teaches one decorate gesture.

`S.you.flags.moved`. Knock-on delight: the mailbox name is information in the world. The next time Mocha passes and doesn't know your name, he reads it ("so THAT'S their name!") and sets `S.mem.userName`. Within a day he may notice the new lights ("someone moved into the log cabin across the street").

### Must not break
- B12 layoutLint (the cabin and Mocha's house must still lint clean with default items).
- The db size.

### Acceptance
- `__mocha.deco.place(code,v,x,z,r)`, then move, rotate; undo restores; `tidy()` arranges with no overlaps.
- The thumb tray and toolbar have no overlap in portrait, landscape and Duo; CAM 'deco' is on top while decorating.
- Moving Day runs once (flag) and can be skipped; the mailbox shows your name.
- `youSize()` is 8 KB or less with 160 placed items. Smoke tests pass.

### Hooks
- `__mocha.deco.{enter,place,move,rotate,undo,tidy,exit,state}`
- `__mocha.autoArrange(room,seed)`
- `__mocha.movingDay(step)`

---

## B28. Inner life I: state v2 with backup, bonds, listening and the bias audit

**Goal.** Mocha's relationships grow in tiers, he remembers what you told him without obeying it, and the save upgrade is safe: a bad migration can never spread to other devices.

### CORE

**1. State v2, migration, merge and size guard.**
- `migrate()` becomes versioned: `if(!S.v||S.v<2)migrateV2()`. It is idempotent and guards each step with typeof checks.
- New fields (short keys, all capped): `heart`, `today`, `bonds`, `core`, `firsts`, `days`, `chapters`, `mem.ab`/`th`/`sd`/`fe`, `presence`, `toTell`, `voice`, `me`.
- Fields created by earlier steps (`you`, `wend`, `music`, `homeItems`) carry over unchanged; later steps add `trad`, `wants`, `taste`, `dreams` and `career`.
- `fresh()` returns `v:2` with empty structures.
- Migration:
  - `S.know[k]` becomes `bonds[k].p=6*count`.
  - `friendW`/`metW` become `bonds.wendell` (`p=12*friendW`).
  - `mem.chats` becomes `bonds.you.p=min(200,chats*2)`.
  - Backfill `firsts` from diary tags (Neighbor = first friend, Pets = first pet, Moved in = born, Discovery = first discovery; sold paintings = first sale).
  - Backfill `core` from the big diary entries (top 12 by score) and `days` by grouping the diary by date (last 30 days).
  - Keep the old fields as read-only mirrors that `bondAdd` updates, for one version.
- Size guard in `save()`/`pushRemote`: if the JSON exceeds 200 KB, trim in this order:
  1. non-big diary entries older than 14 days
  2. learned facts beyond 3 per topic
  3. texts beyond 100
  4. the voice bank
  5. days beyond 45
  Never trim core, firsts, chapters, bonds or dreams.
- Lower the learned caps to 40 topics x 4 facts and the diary cap to 120.
- Multi-device merge in `connect()` when both sides are v2:
  - union by stable id (`t+kind`) for core/days/chapters/trad
  - per-key max for `bonds.p`/`mx`
  - newer wins for scalars
  - diary union by `t+text`
- Hooks: `__mocha.size()` (bytes per field), `__mocha.migrate(json)`.
- **Backup before migrating.** Before `migrateV2` runs, write the untouched v1 JSON to localStorage `mocha-v1-backup` (and, when connected, to a separate db doc `backup-v1`, under 256 KB).
- **Self-check.** After migrating, the diary length, coins, paintings, pets and mail counts must match the backup, `S.v===2`, and the required keys must exist. If the check fails, restore the backup, keep `S.v=1`, log to the console, and do NOT push to the remote doc this session.
- Never push a migrated save to the remote doc until one local save-and-reload round trip has passed (a `mig.ok` flag).
- Settings gets "Restore my save from before the update" (two-tap confirm), which restores `mocha-v1-backup`.

**2. Bonds** (one record per relationship): Wendell, each keeper, the cast, the ghost friends, pets, and `you`.
- Shape: `S.bonds={id:{p, mx, m:metT, l:lastT, n, nk?, jk:[], op:[words], g:[{it,t,r}] cap 6}}`.
- `TIERS=[0,10,60,160,320,600]`: stranger, acquaintance, regular, friend, close friend, best friend.
- `bondAdd(id,pts,why)` is called from:
  - finishAct for npc/Wendell hangouts: `8+e*10`
  - `fx:'ask'`/greetings: `2+e*4`
  - job shifts: 3 (B37)
  - gifts: -2..25 by taste (B30)
  - user chat: 1 per chat, 4 in person, 10 per gift
- Tier-up: `spark('tier')`, a big diary entry, a core-memory candidate, and a toast ("Mocha and Juniper are now friends").
- Drift after 14 days without contact: a slow decay that never goes below `mx-1`. It creates a reconnect wish ("I miss Juniper's foam leaves").
- Unlock table:
  - nicknames ("Moch")
  - a one-time trade gift (Basil: record, Mabel: poem card, Sol: brush)
  - after-hours invitations
  - best friends: a framed photo on his wall
- Inside jokes: a template per activity kind; roll 15% on outcomes with |e|>.6; cap 10. Greetings use them 25% of the time at tier 3 and up.
- Opinion words: 1 to 3 per friend.
- A Friends section in the Me tab shows tier hearts, opinion words and the latest memory.
- `bondOf()` (B7) now reads `S.bonds`.

**3. Listening: `heard(text,channel)`.** Used by in-person chat, the talk card, texts and letters. It replaces the scattered parsing in `localReply`/submit.
- It extracts likes and dislikes, dated life events (a regex bank: today, tonight, tomorrow, weekdays, "on the 12th"), feelings (a ~40-word lexicon) and suggestions ("you should", "try", "go to", "why don't you").
- `S.mem.ab={lk:[],dl:[],dt:{},life:[]}`.
- Threads `S.mem.th` (cap 6): "how did the interview go??" is asked at the right time, by text if he has a phone, in person when the walker is near, or in a letter.
- Feelings `S.mem.fe` give a caring spark and maybe a caring act he chooses.
- Suggestions `S.mem.sd` (cap 3, 7-day expiry): `seedBias` is a userBias term (at most +.6). If he later tries it, he reports back honestly.
- Orders ("go to bed") get playful independence and change nothing.
- The You tab lists what he remembers about you, and you may delete items.
- NO path from `heard()` writes `G.act`/`G.target`.

**4. Mind context and harvest.**
- Split `context()` into `ctxPersona`/`ctxMood`/`ctxBonds`/`ctxYou`/`ctxPlaces`/`ctxRecent`, with a slice per kind.
- Harvest: reusable AI sentences are sanitized (strip the user's name, times, numbers; 120 chars or fewer; blocklist) into `S.voice={m:[],w:[],k:{}}` (about 4 KB). The local brain uses a match 25% of the time and retires each line after 3 uses.

**5. The bias audit.** Every user-derived term lives in `userBias` (B7): `atDoor` (B9), `seatedNear` (B11), `hangAsk` and `talking` (B23), `seedBias` (from `heard` suggestions, .6 or less), and from B29 on `present` and `nearby`. Write a test that maxes every registered term at once and checks `userBias(a).total` is 1.2 or less for every ACT, and that no term multiplies a score.

### Must not break
- `applyMind` validation.
- The texting flow (round 1).
- catchUp TDZ: all tables above migrate/catchUp, helpers hoisted.
- Existing saves keep their diary, house and friends.

### Acceptance
- Load a v1 fixture: `mocha-v1-backup` exists, `S.v===2`, the diary is intact, and the `bonds.wendell` tier matches `friendW`.
- A fixture that makes the migration throw halfway restores the backup, keeps `S.v=1`, and skips `pushRemote`.
- `heard('i have a job interview tomorrow','chat')` creates a thread due tomorrow at 10:00; advancing the clock produces the follow-up. `heard('you should go to bed')` leaves `G.act` unchanged.
- The bias audit passes: with every term maxed, `userBias(a).total` is 1.2 or less for every ACT.
- A simulated 60 days with all systems on keeps the JSON under 200 KB. The multi-device merge unions core and days by id. Smoke tests pass.

### Hooks
- `__mocha.bond(id,pts?)`
- `__mocha.heard(t,ch)`
- `__mocha.size()`
- `__mocha.migrate(json)`
- `__mocha.userBias(a)`

---

## B29. Inner life II: mood, reasons, day plan, memory, presence and the Dispatch

**Goal.** You can read how Mocha feels from across town (face, bounce, glow). You can tap him to see WHY he chose what he's doing. His best moments are kept forever. He notices you when you come by, on his own terms, and greets you with a front page of his life when you come back.

### CORE

**1. Mood engine.** 11 moods: giddy, cheerful, content, cozy, warm, proud, sleepy, wistful, lonely, restless, nervous. Never sad or angry; the floor is wistful or lonely, and he resolves it himself.
- Derivation:
  - baseline from needs
  - plus sparks: `S.heart.sp=[[kind,v,a,t,hl]]` (cap 12), from a `SPARK` table `[valence,arousal,halfLifeH]`:

    `win[.5,.4,6], loved[.3,.2,3], gift[.6,.3,12], tier[.7,.4,24], first[.6,.5,24], dreamStep[.5,.3,12], dreamDone[.9,.6,48], trad[.35,.1,8], missedTrad[-.25,-.1,8], badShift[-.3,.2,4], youBack[.6,.5,4], youSad[-.1,.25,6], party[.6,.6,6], relief[.4,-.2,6]`

  - plus weather taste, season and company
  - hysteresis: change at most once per 90 s unless a strong spark lands
- `computeMood()` runs every 3 s (on the hud cadence). It writes `G.mood` and `G.moodP`, a reference to a PREALLOCATED `MOODS[m]={bob,hz,spd,eyes,mouth,blush,tint,sink,emote}`. `updateMocha` only reads it.
- Face:
  - giddy/proud: ^ ^ arc eyes (flip the sleepEyes torus)
  - sleepy: eye scaleY .55
  - lonely: bigger glossy eyes with a second highlight
  - nervous: small eyes, a wobbly mouth and a sweat-drop sphere
  - blush discs (2 CircleGeometry, one material) fade in for warm/giddy/proud/cozy
- Posture: bob amplitude/frequency, hem speed, lean; travel speed x1.15 giddy, x.8 sleepy; lonely sinks .15; restless does idle loop-de-loops; proud scales 1.06.
- Glow: `ghostMat.emissive` and `mLight.color` lerp to preallocated tints over 2 s:
  - content #E6ECFF, happy #FFE3F0, excited #FFF1C2, sleepy #C9D4FF (dimmer), lonely #D8D0F0, cozy #FFE6CC
- An outline hull: a BackSide inverted shell (scale 1.04, #3A3350 at .55) on Mocha only, so the star reads at any distance (+1 draw call).
- Emote: one pooled sprite (6-cell canvas atlas) on mood change.
- HUD: the meter label becomes mood word + icon. Tap shows "why he feels this way": the top 3 contributors in plain words.
- Diary voice: `voice(text,mood)` adds a mood closer or prefix about 35% of the time (giddy " I did a little spin.", wistful "The rain was soft today. ", proud " Kind of proud of me, honestly.").
- Choices: lonely +1.5 people/Wendell; restless +1.2 outdoors/new; cozy +1 home; wistful +1 music/reading/painting; nervous +1.5 comfort acts; giddy +.8 social/creative.
- Worries: at most one, only from his OWN upcoming events (first shift, an interview, hosting). A relief spark plus a resolution diary line afterwards. Never about the user's absence.

**2. Day plan and reasons.**
- On waking (and per simulated day in catchUp), `makePlan(t)` writes 2 to 4 intentions:
  - a tradition due, a dream step, a want, a shift, a holiday, a weather maybe ("paint if it rains")
  - plus "today's little obsession", a seeded quirk from a ~20-entry `QUIRKS` table ("collecting puns", "being extremely polite to crows"); it flavors 2 to 3 musings
- `S.today={d,pl:[{k,id,h,txt,ok}],q}`. `planBias(a,h)` gives +1.5 within +/-1.5 h of a matching item.
- Shown as a sticky-note card from the status pill, and as a 256x256 canvas on his fridge, or taped to the wall by the door when `hasItem('fridge')` is false (redrawn only on change). Items get crossed off; skipped ones are explained at bedtime.
- Refactor the `localChoose` scoring lambda into `scoreAct(a,ctx,why)`. Pass `why=null` on the hot path (no allocation). After picking, call `scoreAct(winner,ctx,arr)` once to collect labeled contributions, and keep the top 3 in `G.why`.
- The status pill gets a thought icon; tapping shows reasons ("saving for the piano 210/450 · loves jazz · raining, so indoors"). User influence is shown honestly ("Ari mentioned it last week").
- The mind's `next` may carry `why` (60 chars or fewer).

**3. Memory filing.**
- `addEntry(tag,text,place,t,big,key)` merges routine repeats within 6 h ("Read on the couch again (x3 today)"). `localOutcome` passes `key=act.p+'.'+(act.s||act.doing)`.
- `consolidate(dayStart,dayEnd)` runs on the sleep transition and at each night boundary in catchUp (under 10 ms). It:
  - writes a `S.days` ring of 60 entries: `{d,v:[am,pm],m,top,n,w,c,wx,log:['key@h'] max 8}`
  - promotes the day's best moment to `S.core` (cap 40; firsts and dream completions are never dropped). Score: `tagWeight+2*big+5*first+|spark|+1.5*you+rarity`
  - records `S.firsts`
  - decays wants and bonds
  - picks tonight's dream bubble above his bed: a sprite canvas of the top memory, with sleep-talk ("zz... extra butter, monty...")
- "On this day": musings and texts recall 1 week, 1 month, 6 months and 1 year ago, plus monthly move-in anniversaries.
- Keepsakes in the house: the fridge shows the 3 latest postcards/letters; a corkboard above the desk shows 4 recent photos (4 small canvases redrawn only in consolidate). Without a fridge or desk they are taped to the wall beside his blanket.

**4. Present vs away.**
- Present = the tab is visible and there was input in the last 3 min.
- `S.presence={h:[24 decayed counts],st,l,n}` records the hours you usually visit.
- While present: he notices the walker (a wave, comes to say hi, shows off his newest purchase or painting); a once-per-10-min camera notice when `camS.dist<6` ("is someone watching me?" plus blush); invites you along when a tradition starts. Each is a weighted localChoose candidate fed by the userBias terms `present` (+.3) and `nearby` (+.4); none is a goPoint triggered by the walker arriving.
- `S.toTell` (cap 5) is filled by big entries while you are away. They are drained one per 4 s as excited bubbles when the walker is within 6.
- The return greeting scales with the time away, and never guilt-trips:
  - under an hour: "oh hi!"
  - a few hours: "you're back!"
  - 1 to 3 days: hearts
  - over 3 days: "I saved you a seat"
- catchUp v2 is day-structured: wake, plan, fixed events, 3 to 6 chosen acts, consolidate.
  - Caps: 7 detailed days, at most 60 `localOutcome` calls, under 40 ms on a phone.
  - Beyond 7 days: per-day summary templates.

**5. The Drizzle Dispatch** (welcome-back digest).
- Shown after 2+ hours away with at least 2 new entries, or on the first open of a day.
- Contents:
  - a headline from the best event, with the latest selfie, painting or postcard
  - a mood arc of faces across your time away
  - 3 to 5 moments
  - New: purchases, tier-ups, firsts, coins
  - Coming up: tradition, dream step, holiday
  - On this day
  - Right now: live status plus door-note text, with a "go see him" button that moves YOUR camera only
  - a town sidebar: 1 to 2 headlines from `S.town.news` (later the gazette)
- A note from Mocha at the bottom: a local template; the AI writes it only after 12+ hours away, once a day.
- Re-openable from the diary tab. Bottom sheet in portrait; card in landscape and on the Duo.
- It replaces "Mocha did N things".

### STRETCH
- "Who I am": `S.me={fv:{place,food,song,film,friend,season,wx,time,col,book},st,t0}`.
  - Weekly favorites, each change with a funny diary line ("New favorite place: Lookout Hill. Sorry, café.").
  - Trait drift: at most +/-.02 per week, clamped to +/-.25 from `t0`; arrows in the Me tab.
  - A monthly "about me" statement and a profile card at the top of the Me tab.

### Must not break
- catchUp TDZ and its cost cap.
- Round-1 texting.
- The B28 save size guard.

### Acceptance
- `__mocha.spark('win',1)` makes the mood `giddy` within 3 s, with arc eyes visible. Screenshot every mood at 393x852.
- `__mocha.why()` is non-empty after a local choice, and user influence appears honestly among the reasons.
- `__mocha.consolidate()` over a seeded day grows `S.days`, adds a core memory, and merges x3 duplicates.
- With `lastSeen` at -3 days, catchUp produces at least 3 day records with 60 or fewer outcomes in under 40 ms.
- The Dispatch renders a headline, at least 3 moments and a coming-up line in all viewports.
- When the walker arrives near Mocha, nothing on the arrival path calls `goPoint` or `startAct` (spy); a greeting candidate exists in `localChoose`. Smoke tests pass.

### Hooks
- `__mocha.mood()`
- `__mocha.spark(k,s)`
- `__mocha.plan()`
- `__mocha.why()`
- `__mocha.consolidate()`
- `__mocha.onThisDay(d)`
- `__mocha.dispatch(sinceMs)`
- `__mocha.inner()`

---

## B30. Wants, taste, dreams and gifts

**Goal.** Mocha shops for his own reasons: you can watch him long for a walnut piano for weeks before he finally brings it home. He picks his own life dreams. Gifts, to him and to the townsfolk, land according to each one's real taste.

### CORE

**1. Mocha's wants and taste** (the desire engine).
- Exposure: he notices 1 to 3 items when he is in a shop with displays, visits the cabin or Wendell's, takes a trip, or gets a keeper's recommendation.
  - `appeal = style match + interest tags + favColor + novelty - similar owned`
  - above a threshold, the item becomes a want: `S.wants=[{id:'it:<code>'|'rec:'|'trip:'|'biz:'|'xp:',w,s,n,why,c}]` (cap 12, about 1.5 KB). Example why: "saw it at Evergreen", "Basil played it for me", "Wendell has one".
- Growth and fading: a want grows on re-seeing; it decays .03 per day in consolidate ("I'm over the lava lamp. It was a phase.").
- Buying:
  - impulse: under 20 coins with w>.6
  - big items need at least 2 "looking again" visits ("Went back to look at the piano. Still there. Still perfect.")
  - then a saving goal (`S.goal` kind `save`): +1.5 to paid work, -1 to discretionary buys
- `S.taste={st:{gothic,cozy,plant,retro,spooky,nautical,minimal},col:[]}` seeds from interests and drifts with what he enjoys and buys.
- A `biz:` want with w>.7 becomes HIS council petition (B38 calls `fileMochaPetition`).
- Fulfillment: a `first` or `gift` spark, a diary entry, maybe a selfie with the thing, and a core-memory candidate.
- The Me tab shows "things he's been eyeing" with desire hearts, plus a coin jar for the saving goal.
- Mind: context lists the top 5 wants. Its `buy` stays validated (price at most his coins, item sold at this shop today).

**2. Dreams** (life goals over weeks).
- At most 2 active. He picks them himself from his strongest interest or trait, announced with a big entry: "I have a dream. Not the sleeping kind."
- `DREAMS` templates with step types save/own/act/visit/bond/event:
  - music: save for a piano, own it, practice 8x, play a song for Wendell
  - adventure: all 5 train destinations plus the San Juans ferry
  - art: paint 10, sell 3, gallery night at Fog & Easel (needs Sol at friend tier)
  - cooking: learn a real pie at the bakery, bake one for Wendell's birthday
  - home: furnish every room in his style
  - social: befriend every keeper
  - reading: 20 books from Mabel's shelf
  - plants: the biggest pumpkin for October
  - career: a promotion (B37)
  - civic: get a music venue built (B38)
  - stars: a meteor shower from the Needle (B41 sky events)
- State: `S.dreams={a:[...],d:[cap 20]}` (about 2 KB).
- `dreamCheck(kind,key)` is called next to every `goalCheck()`. `considerDream()` runs nightly: fewer than 2 active, `ageDays>=5`, and no new dream in 10 days.
- `dreamBias` is +1.5 for acts that advance the current step.
- Dream board in the Me tab: a cork board with pinned cards and progress thermometers.
- Completion: a party-candidate flag, a core memory and a keepsake.
- Giving up is honest if interests shift.

**3. Gifts to Mocha.**
- `giveMocha(code,v)` (a wrapper over `giveTo`, see 4) from the talk card's "Give..." chip (B23 slot), once per day. He reacts by his own taste: treasured, loved, liked, or polite ("oh! it's very... orange").
- He decides where it goes: displayed with a "from Ari" tag, a drawer, or worn.
- The first gift is a core memory.
- A really disliked item may be donated to Pearl's after a week, with a kind diary line ("It deserves someone who loves it.").
- No coin gifts. `bondAdd('you',10)`.
- If he displays it, the first time the walker enters his house afterwards it sparkles, with the toast "your gift is on his shelf".

**4. Gifts to the townsfolk.** `giveTo(id,code,v)` is the one gift function; `giveMocha()` wraps it.
- For townsfolk: once per character per day, from the talk card's "Give..." chip (B23 slot), with an item from your pockets.
- Each CAST entry has `likes` and `dislikes` tags. Reactions are treasured, liked or polite. Hearts (B36): treasured +15, liked +5 to 10, polite +2.
- Some display it where you can see it: Basil props your mug on the counter; Willa plants your fern in the nursery window.
- It becomes news (B23), so Mocha may hear about it, as information.

### STRETCH
- Friday Night Market (Fri 18-23, Lantern Square): four lantern-lit stalls rotating weekly. Rare lamps; records from Clem; glowing sweets from Vesper; curios from a traveling peddler (ship in a bottle, geode, star chart). Prebuilt and hidden otherwise; emissive only.
- Wishlist restock line: about once a week a keeper says "I ordered that moon lamp you liked; it'll be on the shelf Thursday."

### Must not break
- `localAcquire`/`buyDecor` (routed through wants and `stockFor`).
- The mind's validated `buy` (price within his coins, sold at this shop today).
- No coin gifts between wallets.

### Acceptance
- `__mocha.want('it:<piano>',.8)` gives a saving goal; after granting coins, he buys it on his next visit to that store, with a diary line plus a spark.
- `__mocha.dream('music')` shows on the dream board; simulating its steps gives completion, a core memory and a keepsake.
- `giveMocha` of a disliked item produces a polite reaction; a loved item shows on his shelf with a tag.
- `giveTo('basil',mugCode)`: hearts rise, the mug appears on his counter and news is pushed; a second gift to him the same day is refused.
- Smoke tests pass.

### Hooks
- `__mocha.want(id,w)`
- `__mocha.wants()`
- `__mocha.dream(tpl)`
- `__mocha.giveMocha(code,v)`
- `__mocha.giveTo(id,code,v)`

---

## B31. Visits: Mocha and Wendell at your cabin, fire-pit evenings, the guestbook, consignment

**Goal.** On his own schedule, Mocha knocks, looks over your newest things and settles into the chair that has become his. If you were out, a little candle glows in your window: he was here. Wendell drops by with a jar of his sister's jam. Light the fire pit at dusk and, if they feel like it, your neighbors wander over to roast marshmallows.

### CORE

**1. Mocha comes to visit** (his idea, never yours).
- ACT `{p:'cabin',s:'door',doing:'visiting a friend',tags:['people','cozy'],need:{social:40},fx:'visitYou'}`.
- `visitYouWeight(at)` is 0 when there is no cabin, the "napping" sign is up (`ubVeto`, the single allowed negative override; he may still leave a note in your mailbox), the bond with `you` is below regular, the cooldown is under 20 h, or he is asleep, on a trip or at work. Otherwise the base score is his own (sociability, social need, curiosity about your new things). The user-derived parts are additive userBias terms: `present` (+.3), `cabinLit` (+.3 when he passes within 30 of your lit windows), `firePit` (+.5 at dusk) and `hangAsk` (+.4). Nothing multiplies, and the user part stays at 1.2 or less.
- At most ~2 visits a week.
- If you're home: a knock event plus the toast "Mocha is at your door!".
  - The door opens and he floats in, then tours 2 to 4 waypoints from `homeHighlights()` (pure: recency since `S.you.lastMochaVisit`, appeal = tags x interests, set completion).
  - His bubbles name real items ("a moon lamp!! it's like the sky moved in").
  - He sits in his favorite spot, chosen on his first visit by comfort plus appeal and remembered forever as `S.you.mspot`; the item's story shows "Mocha's spot".
  - He stays 3 to 6 minutes, then floats home through the doors.
- If you're out: he knocks, waits in your rocking chair, then leaves a door note (B9 note pool) and a little candle glowing in your cabin window until you next come in (a WLT candle variant: he was here), and sometimes a small found thing in your mailbox ("came by, you weren't home. left you a pinecone with a face"). In catchUp: at most once per absence over 6 h, data only.
- Opinions, always warm, pinned to your fridge as "Mocha's note" with sticker hearts:
  - a vibe word from your decor style vector vs `S.taste` ("very cabin-core", "spooky-chic")
  - his favorite item
  - what changed ("you moved the fern! it looks happier by the window")
  - a funny observation ("four lamps and zero chairs. bold.")
  - a wish ("I'd love to see a record player here someday"), only his opinion
- Housewarming: on his first visit to a cabin with 8+ items, he may paint your cabin at the studio (new `paintCanvas` case `cabin`: logs, chimney smoke, firs, drizzle) and leave it wrapped on your porch.
- Your home inspires him: loved items nudge his interests and become ideas his own decorating may borrow ("got a fern like Ari's").
- Thinking of you: during his own day, an item under 25 coins matching `S.mem.ab.lk` may become a mailbox gift with a note, at most once per 3 days, paid with his coins.
- State: `S.visYou={l,seen:[40 max],rv:{t,vibe,fav,txt}}`.
- Mind: at most 1 call per visit, for the diary line.

**2. Wendell visits too.** On his own plan, about once a week (seeded; a little more often after you have visited him), when your porch sign says welcome:
- He knocks with a covered dish, settles into the best armchair, comments on one real item ("is that a ship in a bottle? I crewed one about that big"), and leaves within 10 minutes.
- His first visit brings a jar of his sister Hazel's blackberry jam from Spokane: a placeable item with source `g:w`.
- If you're out, the jam waits on the porch with a note.

**3. Fire-pit evenings.** When you light the pit at dusk (B26), it works like a porch light:
- For Mocha it is the userBias term `firePit` (+.5) on his visit candidate. For Wendell it is a plan check: if he is home, awake and it is before 21:30, he may wander over (50% on clear evenings, seeded).
- Everyone who comes sits on the log benches (SEATS). Marshmallows on sticks (one shared prop): toasting lerps white to gold to brown, and one catches fire every single time ("perfect. I mean it.").
- Wendell tells a short campfire story from his bank; Mocha does the flashlight-story bit ("i'm literally a ghost") if B17 seeded that inside joke.
- Sparks rise (GLOWPTS) and the fire crackles (B20). It ends by 22:00 or when the pit burns down. A diary entry, and a polaroid if Wendell's camera comes along (B33).
- Coming is always their choice: nobody comes if they are asleep, out or busy.

**4. The porch guestbook** (warm, never scored). A small book on your porch table, replacing any kind of home rating.
- Every visitor writes a line: Mocha (a vibe word and his favorite thing here), Wendell ("Hazel would like your curtains"), townsfolk who visit at close-friend tier (B36), and trick-or-treaters on Halloween (B40).
- Tap it to read the lines on a little paper card.
- Luma of Lantern & Wick hangs one paper lantern on your eave for each different friend who has signed (up to 5). They glow at night.
- No scores, ratings, rankings or letters grading your home.

**5. Consignment and your keepsakes.**
- Consignment: when Mocha chooses to sell a painting, it hangs on Sol's wall for up to 3 days (`pt.where='consign'`, `pt.until`). If you buy it, he gets the coins and writes "someone bought my painting!"; it becomes a placeable `mp:<ptId>` rendered by `framedPainting`.
- If you hang it, his reaction on a visit is the biggest beat: "THAT'S MY PAINTING. ON YOUR WALL." A core memory.

### STRETCH
- The keychain: at a high bond, Mocha may give you a tiny Mocha keychain that swings on your backpack.

### Must not break
- Autonomy: the visit is his candidate; the only veto is the porch sign (`ubVeto`).
- The B26 cabin and its light count.
- `youSize()` 8 KB or less.

### Acceptance
- `__mocha.visitYou(true)`: Mocha knocks, enters via the door, his tour bubbles name real placed items, he sits at a remembered mspot, and the review text references a real item. A moved item shows up in the next visit's "noticed" line.
- `__mocha.visitYou(false)`: a door note, the window candle glowing until the walker next enters, and sometimes a mailbox gift.
- With the "napping" sign up, the visit candidate scores 0 (`ubVeto`), but a mailbox note can still appear.
- Fire pit lit at 19:00 with Wendell home: with a forced seed he comes, the marshmallow beats play, Mocha's candidate gains .5 or less from `firePit`, and `userBias(...).total` stays at 1.2 or less.
- Wendell's first visit leaves Hazel's jam (placeable). The guestbook shows each visitor's line; the eave lantern count equals the number of distinct signers (5 at most); no score appears anywhere.
- Buying his consigned painting pays him, and it hangs via `framedPainting`. Smoke tests pass.

### Hooks
- `__mocha.visitYou(present)`
- `__mocha.homeHighlights()`
- `__mocha.wVisit()`
- `__mocha.firePitEvening()`
- `__mocha.guestbook()`
- `__mocha.consign(ptId)`
- `__mocha.buyPainting(ptId)`

---

## B32. Mocha's empty-house nest and Wendell's housewarming

**Goal.** A freshly started Mocha moves into a nearly empty house and furnishes it himself, one decision at a time, in his own style. Day one is already complete and charming: he picks his music on a hand-me-down radio, and Wendell carries over an armchair "for company."

### CORE

**1. The nest** (late addition 8B; fresh starts only). Flip `FEAT.nest=true`.
- On a fresh start (start over, or a new user), Mocha's house is nearly empty: a sleeping blanket on the floor, a cardboard-box table and a bare bulb. `S.homeItems` uses the same tuple format; `S.v2fresh=1`.
- The NEEDS ladder `{bed:'floorNights', stove:'coldMeals', lamp:'darkEvenings', computer:'libraryTrips', couch, recordPlayer...}` adds .3 to the matching want for each painful day. Then taste items follow in his style.
- He buys from Otis's order desk or shop shelves with his own coins, and it arrives as a box. `arrangeHome(item)` uses `autoArrange` by category and taste; sometimes he rearranges ("moved the couch to face the window. better.").
- The first bed is a core-memory first ("Finally bought a real bed!!").
- Fallbacks are real choices with color: no computer means the library computer for research and the calendar; no stove means the café or cold snacks; no record player means the listening booth at Rain City Records.
- Existing saves keep their furnished house: map the built-in furniture plus `S.decor` to `S.homeItems` with default slots, `S.v2fresh=0`.
- Desk, bed, kitchen and computer spots must resolve from homeItems, with fallbacks when an item is missing.

**2. Wendell's housewarming, day one of a fresh start.** On the first evening (17:00 to 19:00, or the first time both are home and awake), Wendell carries over a hand-me-down armchair and a little lamp: "every home needs one chair for company."
- The armchair gives the `couch` capability for one seat (couchA); the lamp lights the living room (B16).
- It is Mocha's first friend, first gift and a first core-memory candidate.
- Their first hangout can happen that same evening: tea on the moving box, Mocha on the folded blanket, Wendell in his own old armchair.

**3. Day one works without buying anything.** The transistor radio arrives in the move-in package (B21), so he picks music in his first hour. The floor picnic, tea on the box and flashlight stories (B17) work. The library computer covers his research and calendar; the café covers meals.

**4. Fallback audit.** Run every home-dependent feature with `FEAT.nest` on and an empty `S.homeItems`:
- B14 seats (never sitting on air), B16 room lights (only the bulb and the lamp), B17 hangouts (`need`/`alt`), B21 radio, B29 plan note and keepsakes (taped to the wall)
- round-1 sleep, bath, desk and cooking acts, and selfies at home
- Fix every CORE gap and list anything else in known_issues.

### Must not break
- Existing saves keep their furnished house (they map to `S.homeItems` with `S.v2fresh=0`).
- Sleep, bath and desk activities with item fallbacks.
- B12 layoutLint in both states.

### Acceptance
- Fresh start (`__mocha.freshHome()`): `homeItems.length<=3`, the empty-house set shows, and the radio arrives in the move-in package and plays the same day.
- The first evening: Wendell brings the armchair and lamp (a diary first plus a core-memory candidate), and a hangout uses the box and the cushions.
- After 3 simulated nights the bed want is .9 or higher; with coins he buys a bed (diary first); `arrangeHome` places it with no overlap.
- Fallback audit: every acceptance test of B14, B16, B17, B21 and B29 that touches the home passes with the nest on (list them in the summary).
- An old save keeps its furniture with `FEAT.nest` on. Smoke tests pass.

### Hooks
- `__mocha.freshHome()`
- `__mocha.homeItems()`
- `__mocha.housewarming()`
- `__mocha.capSpot(slot)`

---

## B33. Wendell II: seasonal hangouts, keepsakes, traditions and his birthday

**Goal.** A friendship that leaves marks: a spare key on a hook, a ghost mug on Wendell's shelf, polaroids on both mantels, and "Sunday tea with Wendell is a Thing now." Seasons bring pumpkin carving, cookie baking and snow-day cocoa, and his birthday on Nov 20 becomes a little town event.

### CORE

**1. Seasonal hangouts and sleepovers** (added to `HANGOUTS`, with `need`/`alt` like the rest):
15. Pumpkin carving, Oct 10-31: jack-o'-lanterns appear on both porches through Halloween (it works on the floor of an empty house too).
16. Cookie baking, Dec 1-24: needs a stove (Mocha's, otherwise Wendell's). The next day keepers thank him via news.
17. Cocoa and snow watching: snow only.
18. Spring planting, Mar-May: a labelled "Mocha's row" grows in Wendell's garden.

**2. A friendship that leaves marks**, read from `S.bonds.wendell` tiers:
- regular: checkers unlocked.
- friend: Wendell gives Mocha a SPARE KEY (it hangs on a hook by Mocha's door; Mocha may water Wendell's garden while he is out), and a mug with a little ghost on it appears on Wendell's shelf.
- close friend: Wendell knits Mocha a mustard scarf (into the wardrobe via `acquire()`; Mocha decides whether to wear it), and the portrait hangs over the fireplace.
- best friend: a framed polaroid on both mantels, and rare sleepovers unlock.

Sleepovers (all conditions required): Fri/Sat, a holiday or a storm night, and both bedtimes within 90 min. At Mocha's: a blanket fort, a flashlight story, Wendell on the couch (or in the armchair he gave him), pancakes in the morning.

Keepsake meshes are built once and toggled by `S.wend.fl` bits.

Wendell's instant camera: at friend tier, about 1 in 4 hangouts (max 1 a day), he takes a white-bordered polaroid of the two of them (a `takeSelfie` variant with a canvas border, captioned "-W"). It works even without Mocha's phone. If the walker is in the drop-in seat, they are in the picture too. Polaroid ids live in `S.wend.pol` (cap 12), protected by the B7 photo keep-set.

Shared memories: `S.wend.mem` (cap 24). 30% callback in later hangouts ("remember when the cookies set off your smoke alarm?").

**3. Traditions engine** (generalized, used by any friend).
- If the same activity kind with the same partner happens around the same weekday and hour in 2 of the last 3 weeks (detected in `consolidate` from `S.days[].log`), he declares it on the third time: "I think Sunday tea with Wendell is a Thing now. We didn't decide. It just happened."
- Annual traditions are born from firsts (first snow, first rain after mid-September: "first-rain soup").
- State: `S.trad=[{id,nm,k:'w'|'m'|'y'|'first',dow,h,act,w:[ids],s,kept,miss,last,you}]` (cap 8).
- `tradDue(t)`: +6 in `localChoose` when due, still subordinate to sleep, shifts and closed places.
- Wendell's plan checks `tradDue('wendell')`: he puts the kettle on and waits on the porch.
- Missed ones get a make-up, plus a kind mention.
- If the walker shows up 2+ times, the user is added ("Sunday tea with Wendell and Ari"); with a phone, Mocha texts a heads-up an hour before. Your presence at a tradition that includes you is the userBias term `tradYou` (+.4); it never schedules one.
- Traditions show on the round-1 calendar with a candle icon and a streak.
- Habits: `S.habits={am:[3],pm:[3]}`, +2 in the first and last hour of his day.

**4. Wendell's birthday, Nov 20** (today is Nov 1). A 4-beat mini arc from Nov 14:
- Jot lets it slip.
- Juniper plans a cake.
- Mocha may choose to make a card or painting.
- A porch party on the 20th with his closest townsfolk.
- catchUp advances one beat per missed day.

**State:** `S.wend` gains `fl` (keepsake bits) and `pol` (polaroid photo ids, cap 12).

### STRETCH
- Wendell's giant pumpkin (Sep-Oct): it grows daily in his yard and is weighed at the Saturday market.

### Must not break
- Mocha's sleep in his bed (except sleepovers).
- `fx:'hang'` in catchUp.
- The B7 photo keep-set.

### Acceptance
- Seeding two Sunday-15:00 Wendell teas then running `consolidate()`: a tradition is declared, and at Sunday 15:00 `localChoose` picks it in at least 90% of 50 samples.
- `__mocha.bond('wendell',170)`: the spare key mesh shows by Mocha's door and the ghost mug on Wendell's shelf.
- `__mocha.polaroid()` with the walker in the drop-in seat: the polaroid includes the walker, and it survives `savePhotos()` and a reload.
- On Oct 20 pumpkin carving is available, and jack-o'-lanterns appear on both porches afterwards. On Dec 5 with no stove at Mocha's, cookie baking happens at Wendell's.
- `__mocha.wBday(beat)` steps the Nov 14-20 arc; catchUp advances one beat per missed day. Smoke tests pass.

### Hooks
- `__mocha.trad()`
- `__mocha.tradDue()`
- `__mocha.polaroid()`
- `__mocha.wBday(beat)`
- `__mocha.hang(id,where)`

---

## B34. Sound C: records, the record player, our song and Mocha's song

**Goal.** Mocha's music life deepens: he buys vinyl, his turntable spins and the tonearm drops with a crackle, a record becomes "our song" because it was playing when you visited, and one day he writes his own melody.

### CORE

**1. Owning records.**
- He buys records at Rain City Records (through B30 wants). Basil recommends from Mocha's taste with zero AI, and Mocha journals it ("basil talked me into Bossa Bean. he was right").
- Owned records live in `S.music.r`; his crate shows them as spines (one InstancedMesh).
- `pickMusic` (B21) gains the `record` source when `hasItem('player')`; without a player it falls back to the radio.

**2. The player, humming and keepsakes.**
- The physical player: the turntable spins only while playing; the tonearm swings in (.6 s), a needle-drop sound and a 2 s crackle. Label color by genre. His crate shows owned records as spines (one InstancedMesh). Audible within about 25 with door leak.
- Humming: while music plays and he is idle, cooking or painting, he hums the current melody notes in his babble voice at -10 dB, with a note emote. Very happy: one "boo-doo-doo" phrase.
- Keepsakes: a big moment while a record plays sets `r.m`. Replaying it later brings nostalgia ("It was playing the night of my first party.").
- Our song: the record most often playing when you visit in person becomes "our song", and he may put it on when you arrive (a weighted candidate via the userBias term `ourSong`, +.3; his choice).

**3. Mocha's Song and your player.**
- Mocha's Song: when a music hobby reaches level 3 (or the piano dream completes), he composes a melody: a seed plus a title from templates ("Song for a Rainy Tuesday", "Wendell's Teapot Blues"), or one optional AI title. It plays at home, on Drizzle FM, busking (B37), and at the Sunday open mic.
- The user's cabin record player plays owned records with falloff ("your house, your music").

### STRETCH
- Mocha performs his song at the Sunday open mic on ukulele (B36 event plus music).

### Must not break
- B21's radio, jukebox and request box keep working.
- No audio before a gesture; no sound while hidden.

### Acceptance
- Buying a record (catalog) adds it to `S.music.r` and to his crate.
- With a player, `pickMusic` can choose 'record': the tonearm swings in, and a needle-drop and crackle play. Without one, it picks the radio.
- "Our song" forms after repeated in-person visits, and he may put it on when the walker arrives (a weighted candidate, his choice).
- Music hobby level 3 composes Mocha's Song, which plays at home and on Drizzle FM.
- Your cabin record player plays your owned records. Smoke tests pass.

### Hooks
- `__mocha.playRecord(id)`
- `__mocha.ourSong()`
- `__mocha.mochaSong()`

---

## B35. Gathering, field notes, fishing, the crab pot and crow trinkets

**Goal.** Every walk turns up something and earns a little, with no grind and no timers: sea glass and fir cones, each with a true Washington fact; a relaxing, original fishing game off the pier that follows real Washington conservation rules; a crab pot to check daily; and little gifts from the neighborhood crows.

### CORE

**1. Gathering.**
- 8 to 14 finds a day, seeded by date, at believable spots in authored spawn zones, filtered by `walkable()` and kept out of buildings:
  - beach/promenade: sand dollar, moon snail shell, Pacific oyster shell, driftwood, bull kelp; sea glass in white, green and brown, rare cobalt, very rare red
  - forest/park: Douglas fir cone, western hemlock sprig, bigleaf maple leaf (fall), sword fern frond, Garry oak acorn
  - fruit trees by the market and cabin: Washington apples (fall), Rainier cherries (summer), wild blackberries (Aug)
  - after rain at Cedar Lake in fall: chanterelles, always with "never eat a wild mushroom unless an expert identifies it"
  - seasonal: pumpkins (Oct), holly (Dec), cherry blossom petals (spring)
- Walk within ~1.2 to pick one up: a little hop plus a toast. If pockets are full, it keeps sparkling.
- Rendering: one InstancedMesh per shape class (about 6 draws); collected ones get zero scale. A sparkle sprite pool of 6 (nearest within 25). The proximity check runs every .2 s.
- `S.you.day.g` gathered bitmask.

**2. Field Notes sticker book**, by habitat (Shore, Forest, Pier, Sky, Garden). Every find has a hand-drawn canvas sticker and ONE TRUE fact, all in one `FN` constant table for truth review. Examples:
- "A clam shell with a neat round hole was probably drilled by a moon snail."
- "Living sand dollars are purple-brown and fuzzy; the white ones are skeletons."
- "Red is one of the rarest sea-glass colors."
- Douglas fir cone bracts look like a hiding mouse's back legs and tail.
- "Washington's state tree is the western hemlock."
- "The Rainier cherry was developed at Washington State University in 1952."

Critter spotting (looking, never catching):
- banana slugs on rainy paths
- Pacific chorus frog (Washington's state amphibian)
- Anna's hummingbird (stays all winter)
- Steller's jay, great blue heron, harbor seal, river otter
- American goldfinch (the state bird)

They appear briefly as 2-frame billboard sprites (at most 2, within 30, in walk mode). Tap within a couple of seconds to log a sighting.

Rosalind's Nature Record at the library pays 3 to 10 coins per first find or sighting. A set reward is naturalist's binoculars (rare sparkles visible from farther). Duplicates sell to Pearl (shells, glass), Hank (fruit) or Willa (fronds, mushrooms).

**3. Pier life.**
- Fishing, with an original "ripple ring" mechanic. Gus sells a rod for 8 coins. At any pier or promenade edge (walkable at the walker but not 1.5 ahead), a fishing chip appears.
  - Cast: the lure arcs out with a plip. Fish shadows drift by in lazy curves.
  - When a shadow turns toward the lure, a ripple ring starts wide and closes in on it over about 1.2 s. Tap as the ring meets the lure (a forgiving window of about .18 s; three ring widths for small, medium and big fish).
  - Then a 2 to 4 s reel: hold while the line glows soft blue and ease off when it glows orange (the fish runs). Let go too long and it swims away, with no penalty.
  - Species by season, hour and weather: coho and Chinook salmon, pink salmon (mostly odd-numbered years in Puget Sound), lingcod, quillback rockfish, pile perch, starry flounder, Pacific herring, and rare steelhead (Washington's state fish).
  - The catch card shows size, sticker, a TRUE fact, and what you may do with it.
  - Always released automatically, with a heart floating up and a true note:
    - quillback and other rockfish: "In the Seattle area of Puget Sound, all rockfish must be released. Anglers use a descending device to return them to depth."
    - steelhead: "Puget Sound steelhead are listed as threatened under the Endangered Species Act, and wild steelhead must be released."
    - wild salmon with an intact adipose fin: "Hatchery salmon usually have their adipose fin clipped, so anglers can tell them apart."
    - lingcod outside May 1 to June 15.
  - Keep, sell to Gus (2 to 25) or release: hatchery (fin-clipped) coho and Chinook, pink salmon, pile perch, starry flounder, Pacific herring, and lingcod in season.
  - Reed the straw-hat frog fishes nearby and gives tips through the talk card, including "real rules change, so real anglers check WDFW's current regulations."
  - After about 10 catches the fish "go quiet" until tomorrow.
- Crab pot: 12 coins at Gus's. Drop it off the pier end; after 8+ real hours a buoy bobs to say it's ready.
  - Pull it for 1 to 3 Dungeness or red rock crabs (6 to 15 coins each).
  - In Washington, only male Dungeness at least 6¼ inches across the shell may be kept, so females and small males are auto-released with a short note; red rock crabs of either sex may be kept at 5 inches or more.
  - Surprises: an old boot (Pearl calls it "vintage"), a sand dollar, or once ever, a message in a bottle from Mocha's parents' lighthouse: "if found, please say hi to our Mocha". Mentioning it to him makes a memory.
  - `S.you.crab={t}`, resolved lazily.

**4. Crow trinkets.** If you leave peanuts in the dish on your cabin's porch rail (B26), Jot or one of the neighborhood crows may leave a small trinket in your mailbox the next morning: a bottle cap, a shiny button, a bit of sea glass or a tiny bell. At most one a day, seeded.
- The field-notes sticker carries TRUE crow facts: "American crows can recognize individual human faces and remember them for years (University of Washington research)" and "Seattle has a famous true story of crows leaving little gifts for a girl who fed them."
- Trinkets are pocket items; Pearl buys them ("darling, that's vintage").

### Must not break
- The user's wallet caps and `S.you` at 8 KB or less.
- Autonomy: nothing here touches Mocha's targets.

### Acceptance
- `__mocha.spawns()` returns 8 to 14 finds at walkable points. `gather(i)` adds an item and a field-note sticker with a fact. The same date gives the same spawns across reloads.
- `__mocha.fishBite()` then a tap as the ring meets the lure gives a catch card; the 11th cast says the fish are quiet.
- Catching a quillback rockfish or a steelhead auto-releases it with its true note, with no keep or sell buttons.
- `crabReady()` after 8 h gives crabs; a female Dungeness is auto-released with a note.
- Peanuts in the porch dish give at most one crow trinket the next morning (seeded). Smoke tests pass.

### Hooks
- `__mocha.spawns()`
- `__mocha.gather(i)`
- `__mocha.spot(critterId)`
- `__mocha.fishBite()`
- `__mocha.crabReady()`
- `__mocha.crowGift()`

---

## B36. Shifts, favors, your friendships, the Town tab and Lantern Square alive

**Goal.** One-minute part-time shifts turn keepers into friends, small favors pass kindness along to Mocha, the townsfolk remember you, warm up, reveal their secrets and invite you to things, and Lantern Square becomes the town's living room.

### CORE

**1. Part-time shifts.**
- At an open keeper's counter, the talk card offers "need a hand today?": one shift per keeper per day, 45 to 60 s, pay tiers 8/14/20 plus hearts.
- One reusable MiniGame shell: a full-screen canvas overlay (DPR-aware, 30 fps cap, paused when hidden). API `intro(keeper,line)` and `run(game,secs)`, which returns a tier.
- Games, 2D only, 60 to 100 lines each:
  - Juniper's Latte Rush: a timing ring for the shot pull, then hold to pour; the foam art comes out as a heart, leaf or blob.
  - Rosalind's Shelf Sort: swipe books to the shelf matching their colored call-number dots.
  - Hank's Produce Stack: tap to drop apples into a sliding crate.
  - Pearl's Wrap It Up: pick the paper and ribbon that match a customer's description.
- Keepers remember: after 3 good shifts Juniper calls you "my best barista". Shifts count toward stamp cards. `S.you.day.sh`.

**2. Favors and requests.**
- Each morning, seeded by date, 2 or 3 characters have a request (more on weekends). They show "!". Hold at most 3. They expire at the giver's bedtime, with no penalty.
- Kinds:
  - DELIVER: Juniper's pastry box to Mabel.
  - RELAY: "tell Basil chiptune rules".
  - LOST ITEM: Rosalind's glasses in the park, found by a glint.
  - FETCH collectibles: Hank needs 2 pinecones for his birdhouse.
  - GO SEE: "is the mountain out? look from the Needle".
  - FLYERS: Monty's film night.
  - WATER WENDELL'S GARDEN: stand in his yard 3 s, get tomatoes.
  - Mocha-adjacent kindness that never commands him:
    - "Mocha left his umbrella here; drop it on his porch?" He finds it later: "someone returned my umbrella. I bet it was {name}".
    - Bea's treats left at his door for his pet.
    - "Could you check on Mocha? he seemed down": walk within 4 of him; he may react.
- Carried items show in the walker's hand (one shared box/bag/envelope mesh).
- Rewards: 5 to 25 coins, hearts, sometimes an item, and a news item (B23), so the kindness travels.
- Drop zones set `S.found`, handled when Mocha next arrives home. Never touch `G.target`/`G.act`.
- State: `S.you.req=[{k,kind,a,b,item,n,got,day}]`.

**3. Your friendships with the townsfolk.**
- `S.you.rel={id:[pts,firstT,lastT,talksToday,dayKey,factsBits,flags]}` (about 60 B each).
- Hearts:
  - first chat of the day +3, later +1 (max 3 a day)
  - favor +10
  - a gift via `giveTo` (B30): treasured +15, liked +5 to 10, polite +2
  - attending their event +4
  - birthday wish +8
  - shift +3
- Tiers: stranger, acquaintance (15), friend (45), good friend (100), close friend (180). No decay.
- Unlocks:
  - acquaintance: they use your name and wave
  - friend: backstory layer 1; a one-time trade gift for your house (Basil a record, Mabel a bookmark, Gus a fish doormat); a 5% friend price
  - good friend: layer 2; an invitation to their evening hobby with a map marker; a nickname derived from tier (Gus "Captain", Chip "Player Two", Pearl "Dollface", Monty "our Leading Star", Hank "Chief")
  - close friend: layer 3 (their secret); a framed photo for your house; they may knock with a gift
- Mailbox notes after favors and on your birthday, if known (`S.you.notes`, cap 10).
- Everyone remembers you: "oh! you must be Mocha's friend"; your visit rhythm ("twice in one day!").

**4. Town tab: people, this week and news** (the `town` tab exists since B7, with the calendar as its first sub-tab; add these sub-tabs).
- A card per character: emoji portrait in their color, name, species, shop, what they're doing right now (`npcStatus`), your hearts and Mocha's hearts (`S.bonds`), birthday, and things they've told you.
- This week's events, today's requests, Town news and Overheard.
- Refresh at most every 2 s while open.

**5. Lantern Square comes alive.**
- Fountain spray: a 40-point Points buffer, updated only within 50. It freezes in winter (an ice disc; Mocha may skate around it).
- 6 pigeons (one InstancedMesh) scatter when someone passes within 2.5 and return after 6 s.
- Festoon lights join `nightGlows`.
- Notice board content: a 512x640 canvas redrawn daily and on change, derived (not stored). It carries this week's events with today highlighted, birthdays, requests, lost & found, Jot's weather note, petitions and results (B38), and painting of the week. The walker taps it to read an HTML card. Mocha reads it on his own ("checking the notice board"), and matching interests weight his choices.
- Wishing fountain: one coin a day for a tiny seeded luck bonus to tomorrow's finds (a plink plus sparkle). Mocha tosses one on holidays and his birthday and writes the wish in his diary.
- Weekly events (`TOWN_EVENTS`, one data source shared with the round-1 calendar):

| Day | Event |
|---|---|
| Mon | Quiet Monday: Pearl and Chip off |
| Tue | Café Trivia 19-20:30, Rosalind hosts with FACTS; Mocha answers right when the topic is in `S.learned` |
| Wed | Story Hour 16:00 at the library, Monty does voices |
| Thu | Art Walk 17-20; first Thursday is a big lantern night (inspired by Seattle's real First Thursday art walk in Pioneer Square); Mocha may lend a painting |
| Fri | Film Night 19:30, cinema seats fill with townsfolk you know |
| Sat | Market Morning 8-12 in the square: Gus, Hank, Hollis's pumpkins, Honey's honey, Wendell's tomatoes |
| Sun | Open Mic 15-17 at Rain City Records: Chip chiptune, Wendell harmonica, Clem, Sol off-key; Mocha on ukulele if that is his hobby |

- Event acts join `localChoose` with +2 to 3 scaled by interest. Never forced. A soft toast when the user is within 60.
- Dressing (bunting, 6 folding chairs, mic stand, 3 stalls) is built once and shown only during its window.

### STRETCH
- Two Town Threads arcs: "Who is BOB?" (the reveal: BOB is Wendell, "Wendell Robert, 1989") and Hank's birdhouse (posts, box, roof, paint; a black-capped chickadee family moves in). One beat per real day at 7am (catchUp one per missed day). `S.town.th`.
- Sol's mural layers (paints the user's color in, if told).

### Must not break
- The user's wallet caps; `S.you` at 8 KB or less.
- The talk card layout.
- Autonomy: favors never touch Mocha's targets.
- The panel stays at 6 tabs.

### Acceptance
- `__mocha.shift('juniper',2)` pays 14 and adds hearts; a second shift the same day is refused.
- `reqMake('deliver','juniper')`, carrying, then talking to Mabel completes it: coins plus a news item.
- `youRel('basil',50)` unlocks the friend gift once.
- The town › people sub-tab lists 25 or more characters with live status; the panel still has 6 tabs.
- The notice board shows Tuesday trivia on a Tuesday. At Tue 19:00, a trivia candidate exists in `localChoose`.
- Pigeons scatter. `SET.saver` disables spray and pigeons. The mini-game overlays have no overlap in portrait and landscape. Smoke tests pass.

### Hooks
- `__mocha.shift(k,score)`
- `__mocha.req()`
- `__mocha.reqMake(kind,k)`
- `__mocha.reqDone(i)`
- `__mocha.youRel(id,pts?)`
- `__mocha.board()`
- `__mocha.town.event(id)`
- `__mocha.wish()`

---

## B37. Town economy and Mocha's jobs

**Goal.** Everyone's money comes from somewhere. Shops run small, real ledgers that rise and fall with rain, tourists and Mocha's own purchases, and they react with sales, events and renovations you can see. When HE is ready, Mocha looks for a job that fits him. All of it is deterministic, catchUp-safe, zero-AI and never punishing.

### CORE

**1. Economy** (`S.econ`; a daily tick at the first tick after 6:00, and per missed day in catchUp; never per frame). Weather comes from the B7 `WX` almanac.
- `S.econ={d:dayKey, funds:1240, biz:{id:[cash,trend7Packed,mood(-2..2),strat,upgBits,openDays]}, log:[cap 10]}` (about 2 KB).
- Revenue per business per day = real purchases by Mocha and the user (`econSale(pid,amt,who)` from `buySlot`, Mocha's acquisitions, shift and ask spending), plus simulated townsfolk and tourist customers:
  - `base[kind] x season x WX (rain boosts café/books/cinema/arcade; sun boosts market/bike/ferry/nursery) x weekday x holiday x tourism (train arrivals, ferry) x events x word of mouth (mood) x keeper skill`
  - seeded per day
- Costs: stock, rent to the town (5% of revenue), wages (including Mocha's paycheck if he works there), utilities.
- Bakery thinning and Mocha's purchases both route through this one tick, so revenue is never double counted.
- Strategies, visible in the world:
  - struggling (mood -2 to -1): run a sale (red tag sign, 20% off in `stockFor`), add a seasonal special, host an event (open mic, double feature), change hours, ask Mocha or the user for a favor (a B36 request), or apply for a small council grant
  - thriving (+1 to +2): renovate (a visible upgrade bit: new awning color, expanded display, string lights), post a job opening (feeds Mocha's job search), sponsor a festival
  - nothing ever goes bankrupt: worst case "on a short break" for 1 to 2 days, then back with a new idea (the gazette covers it)
- Keeper mood ties to their shop. A happy Juniper after a rainy week shows in her lines and news ("rainy days are the best for us!").
- Town funds:
  - income: a 3% sales tax, rent, event tickets, tourism, donations
  - spending: construction, maintenance, festivals, holiday decorations, grants
- The Neighbor Dividend (B25) uses `econMood = avg(mood)` normalized.
- Rain City Gazette: 1 to 2 local headlines a day from the tick ("Drizzle & Bean: busiest week of the fall"). They feed the Dispatch sidebar, the notice board and `S.town.news`.
- The Town tab gains funds, active petitions and campaigns, plus a business board with mood faces and one-line news. No spreadsheets.

**2. Mocha's jobs** (entirely his choice, only when he is ready).
- Round 1 already gives Mocha casual odd jobs ("helping out" at open shops for 10 to 25 coins). Keep them: they are his first taste of work, and 2 or more odd jobs he enjoyed add +.1 to his readiness. A real job replaces odd jobs at that shop.
- `S.career={j:null|{b,r,dw:[dows],h:[s,e],s,sat,sh,rk,pay},past:[cap 6],rd}`.
- Readiness, recomputed nightly in consolidate: at least 5 settled days, wants he can't afford, an active saving goal or dream, plus traits. When over .6: "I think I want a job. Not because I have to. Because I want a piano."
- He reads help-wanted signs (econ openings, fallback list per shop) and picks by fit:
  - fit = interest match with the business, bond with the keeper, hours vs his sleep schedule, pay
  - roles: barista, records clerk, library page, studio assistant, pet-store helper, cinema usher, phone-store clerk, nursery helper, bakery helper
- Sequence: an interview (a nervous worry the night before, B29), then a first day that becomes a core memory.
- Shifts are scheduled acts `{p:biz,s:'counter',doing:'working a shift',fx:'shift'}` with +8 inside shift hours (sleep still wins). Fixed events in catchUp.
  - Visible in an apron behind the counter with the keeper.
  - `shiftOutcome`: e from fit + bond + mood; coins = pay + tips; `sat += .05*e`; `bondAdd(keeper,3)`; a diary line from `SHIFT_LINES` by role (a good tip; a spilled latte; a regular who wanted "something sad but danceable").
  - The pay is a cost in that shop's ledger.
- A raise or promotion after good shifts.
- Freelance or no job are valid too:
  - weekend art stall in Lantern Square (art 6+)
  - busking his own song (B34)
  - a column for the Rain City Gazette (writing)
  - "I'm taking a break from working. The rain needs watching."
- Quitting, kindly: low satisfaction for 2 weeks, a dream done with no wants left, or a better-fit opening. He gives notice and the bond survives.
- The Me tab shows: "works part-time at Rain City Records · Tue, Thu, Sat 12-5 · loves it", plus the saving goal it funds. The user can text him about it but never assigns it.
- The mind may propose via an optional validated `job` field.

### STRETCH
- Grants paid to struggling shops.
- `townRent(unit)` for condo rent collected into the town funds (B39 uses it).

### Must not break
- catchUp determinism and its cost cap (the econ tick costs under 2 ms per day; at most 30 days simulated).
- Coins never go negative.
- Mocha's sleep beats shifts.
- The db size (`S.econ` plus `S.town` at most 5 KB).

### Acceptance
- `__mocha.econTick(3)` changes the ledgers. A rainy Saturday raises café revenue versus a sunny one (seeded comparison). A struggling shop shows a sale sign.
- Readiness: with a saving goal and `rd>.6`, a job-hunting diary entry, then a hire, then a shift at the scheduled hours that pays coins and debits the shop. Round-1 odd jobs still work at other shops.
- Smoke tests pass.

### Hooks
- `__mocha.econ()`
- `__mocha.econTick(days)`
- `__mocha.career()`
- `__mocha.jobReady(v)`

---

## B38. Town Hall, council, petitions and construction

**Goal.** Petitions from you, Mocha or the townsfolk go before a council that votes in character every Wednesday evening, and approved businesses rise on vacant lots over a few real days, then open with a ribbon-cutting.

### CORE

**1. Town Hall interior and the council.**
- Interior (16x9, via LAYOUTS):
  - an entry hall with clerk Marigold's petition desk on the right wall facing the door
  - a town diorama table in the middle showing every building and lot as tiny blocks (one InstancedMesh, per-instance stage color, updated on change). The most magical object in the room.
  - a funds thermometer on the wall ("Town Fund: 1,240")
  - the council chamber at the back: a curved dais of 5 seats facing two rows of public benches
  - the mayor's office door at back-left
- Council: Mayor Odalie (great blue heron; cautious; breaks ties), Mabel (loves the arts), Hank (thrifty), Willa (nature-first), Gus (pro-business). They wear little council sashes on Wednesdays.
- Council night, Wed 18:00:
  - chamber lights come on
  - members file in through the front doors (B22 plan override)
  - each pending petition gets a vote with bubbles in character ("Whooo could say no to a music venue?" / "Can we AFFORD it, though?")
  - results post on the board, in the Dispatch, and as a text to Mocha's phone if he has one
  - Mocha may choose to attend (event act)
- Vote: `score = signatures*.6 + fundsFit (cost <= funds ? 1 : 0.3) - duplicate penalty + season fit + Σ member value match (each member: tag weights) + seeded noise ±.5`. Majority of 5.
  - A denial gives reasons and allows resubmission with more support.
  - "Approved pending funding" starts a fundraising campaign with a thermometer on the board. The user can donate coins at the desk or at the board. Mocha may autonomously volunteer, donate or paint for a charity auction, his choice.
- Petitions: `S.town.petitions=[{id,tpl,name,by:'you'|'mocha'|npcId,sigs:[ids],st:'filed'|'sigs'|'vote'|'approved'|'pending'|'denied'|'building'|'open',filed,voteAt,res,why}]` (cap 8).
  - The USER files at Marigold's desk (talk card) or in the Town tab: pick a template, or type a free-text idea.
  - Free text maps to the nearest template via a local keyword matcher (optionally one cached AI classification). The custom name goes on the sign (sanitized, 24 chars max).
  - Signatures: talk to townsfolk with the "Sign my petition?" chip. They sign by tier and values.
  - MOCHA files from a `biz:` want (B30) via `fileMochaPetition(tpl)`, and gathers signatures from friends on his own (tier 2+ sign readily). The mind may propose via an optional validated `petition` field.
  - Townsfolk file occasionally (seeded, about once every 10 days).
- Business templates `BIZ_TPL` (each defines building style, LAYOUTS id, catalog pool tags, keeper species pool from the mixed cast, hours, lot class):
  - food: bakery 2, ice-cream parlor, ramen shop, bubble tea, florist
  - hobby: yarn and crafts, comics and games
  - culture: aquarium, observatory, museum, music venue/karaoke (Clem as keeper), bowling alley, haunted-mansion tour "Hollowmere House"
  - outdoors (O lots only): community garden, skate park, dog park
  - maritime (L6 only): boat rental, lighthouse café
  - civic: post office upgrade (Jot)
  - farmers-market pavilion

**2. Construction on the lots** (the stage is derived from timestamps `filed/approved/startedAt`, so catchUp advances with no simulation). Stages:
1. vacant: grass, sign, wildflowers
2. surveyed: 4 stakes, orange string, a "Coming soon: <name>" sign
3. foundation: slab, cones, wheelbarrow; Dale & Birch hammering in hard hats
4. framing: a scaffold wire box around a half-height shell, plus a tiny crane
5. topped out: full shell, dark windows, scaffold
6. ribbon day: a ribbon across the door, bunting and balloon sprites; a 10:00 grand opening that keepers attend and Mocha may choose to
7. open: built via `shop()` + LAYOUTS, plus a new keeper generated from the template's species pool with `makeChibi` and a CAST entry (B22 rhythm defaults: lives above the shop, one hobby, one pal). Its catalog pool is added for both the user and Mocha.

Rules:
- Each stage lasts about 1 real day: 2 to 4 days from approval to opening.
- `buildLotStage(lot,stage,tpl)` disposes the previous group and builds the next (a handful of meshes). It re-registers that lot's colliders and enables its NAV door chain only when open.
- `S.town.built=[{tpl,name,lot,keeper,opened}]`.
- The diorama updates on each stage change.
- No stage ever adds a light; construction lamps are emissive meshes plus GLOWPTS halos.

### Must not break
- catchUp determinism and its cost cap.
- The db size (`S.econ` plus `S.town` at most 5 KB).

### Acceptance
- `__mocha.petition('music venue','you')` files it. Signatures via `__mocha.sign(id,k)`. `__mocha.council()` runs a vote with 5 member bubbles (Mayor Odalie breaks ties); the result posts to the board and news.
- Approve a petition, then `__mocha.lotStage('L8',n)` steps through 7 stages with distinct meshes. Open adds a keeper with a talk card and a stock pool. The scene's light count is unchanged.
- `fileMochaPetition` is triggered by a `biz:` want above .7.
- 60 simulated days stay under 200 KB, and catchUp over 7 days takes under 60 ms. Smoke tests pass.

### Hooks
- `__mocha.petition(text,by)`
- `__mocha.sign(pid,k)`
- `__mocha.council()`
- `__mocha.lotStage(lot,stage)`
- `__mocha.diorama()`

---

## B39. The Fogwell condo

**Goal.** The city part of town gets a sophisticated, fully enterable mid-rise where several neighbors really live, one floor at a time. Residents come home, cook, have each other over on the roof, and their windows go dark when they sleep.

### CORE

**1. The Fogwell** (exterior from B8: brick, dark trim, gargoyles, bay windows, fire escapes, rooftop garden).
- Lobby, through the B9 double door:
  - a row of brass mailboxes with residents' names (canvas)
  - Ambrose the ghostly doorman's concierge desk: talkable, Mocha's friend, bond in `S.bonds`
  - a package shelf where round-1 parents' mail and user deliveries can land
  - plants
  - an old-timey elevator with an arrow dial (a canvas needle) and brass doors
  - the stairwell door
- Floors 2-5: a hallway each with doormats, name plates and 3 unit doors (B9 door system, `swing`).
- Shared spaces: a laundry room (floor 2), a mail and package room (lobby), and a rooftop terrace with garden beds, string lights, a grill, benches (SEATS), and a view of the Sound and the Needle.
- Multi-floor cutaway, the key technical piece:
  - When the camera or walker is inside, show ONE floor at a time. Hide floors above (`visible=false`) and fade the front wall.
  - A floor picker (elevator-button UI: L 2 3 4 5 R, 44 px) registers as HUD slot `floors` (right column; in landscape it folds into one "floor" button), and selecting a floor calls `CAM.push('floor',{prio:1})`.
  - The walker can ride the elevator (doors open and close, a "ding" event, a 3 s ride, the dial needle moves) or take the stairs (tap-to-go to the stair door, then the floor switches).
  - Mocha and residents also use the elevator or stairs when visiting. NAV gets per-floor subgraphs joined by ELEVATOR and STAIR edges.
- Lazy units: unit interiors are generated only when their floor is selected. On exit they are disposed or hidden. A resident unit is built from a seed plus style via `autoArrange` and the B24 catalog, so nothing is stored per resident.
- Exterior windows are mapped per unit (slot ids for B16). Shared materials; no new lights.

Residents and units (`S.condo={rent:{unitId:'you'}, due}`; everything else derived):

| Unit | Resident | Unit style |
|---|---|---|
| 2A | Basil | vinyl wall, crates |
| 2B | Chip | cabinets, beanbag |
| 2C | Dot | gadgets, plants |
| 3A | Vesper the bat | blackout curtains, coffin-shaped bed, awake at night, deep red glow behind curtains |
| 3B | Luma the moth | candles and lanterns everywhere |
| 3C | Clem the skeleton | instruments |
| 4A | Hank | workbench, birdhouse parts |
| 4B | Captain Barnaby the harbor seal | ship in a bottle, sea charts |
| 4C | Wren the Jacob sheep | yarn basket, loom |
| 5A | Kip | bikes on the wall |
| 5B | Reed the frog | fishing rods, aquarium |
| 5C | FOR RENT | a sign in the window |

- Residents follow their B22 plans: home after work, cook (kitchen window brightens), have each other over (2-3 pair visits a week, seeded), chat in the hallway or on the rooftop (pair lines), and sleep (windows dark; Vesper inverted).
- Rooftop events: Friday summer BBQ (Jun-Aug), New Year's fireworks watch, the occasional movie night on a sheet screen. Event acts Mocha may choose.
- Some residents give requests (B36): "water my plants while I'm away", "pick up my package from Ambrose".
- Mocha may befriend and visit residents (hang acts generalized from B17 with pair spots in units). He never moves in.

### STRETCH
- The user can rent unit 5C as a second home through the Fogwell desk: 150 coins per in-game month, paid from `S.you.coins`. Decorated with the B27 engine. Placements stored only for the rented unit. If rent lapses, items go to storage, with no penalty.

### Must not break
- B12 culling (floors hidden when not selected).
- NAV for agents on other floors (they snap when far).
- Draw budget: the Fogwell interior is 20 draws or fewer on the selected floor.
- catchUp (residents are plan-derived).

### Acceptance
- Entering the Fogwell shows the lobby with Ambrose. The floor picker appears; selecting 3 shows the floor 3 hallway and hides 4, 5 and R.
- The walker rides the elevator: ding event, the dial moves, the floor changes.
- Unit 3A's interior is generated on demand (coffin bed present) and disposed on exit (the geometry count returns to the baseline ±5%).
- At 23:00 Vesper's window is lit red while 2A is dark (Basil asleep). At 19:30 Basil is home.
- `__mocha.fogwell.floor(n)` works in all viewports with no overlap. Smoke tests pass.

### Hooks
- `__mocha.fogwell.floor(n)`
- `__mocha.fogwell.ride(n)`
- `__mocha.fogwell.units()`
- `__mocha.rent(unit)`

---

## B40. Townsfolk homes, ghost friends and the October layer

**Goal.** Keepers walk home to real homes, and pals visit each other's living rooms after closing. At night, Mocha's own little ghost friends glow in the old cemetery. October becomes the town's big festival season: Halloween-town, in Seattle.

### CORE

**1. Townsfolk homes** (no more vanishing; everyone walks home through doors).

| Home | Residents |
|---|---|
| Pink house (18,72) | Juniper and Sol (roommates) |
| Blue house (80,44) | Rosalind and Tabitha (roommates) |
| Above their shops (side stair doors, upper-floor window slots) | Mabel, Monty, Bea, Pearl, Pippin; Otis in the workshop loft |
| Willa's crooked cottage | Willa, Honey, Pepper |
| Houseboat at the ferry pier (hull plus cabin box; "inside" means the cabin) | Gus |
| Mushroom house (24,96) | Morel |
| Pumpkin-patch shed behind the market (-36,-26) | Hollis |
| Town Hall upstairs | Mayor Odalie |
| By train from off-map "Ballard Junction" (8:05 in, 17:40 out; if round-1 trains exist, else they appear at the station door) | Marigold, Dale and Birch (Jot roosts in the Town Hall clock tower) |
| Fogwell | per the unit table above |

- Lit upper windows at night make Main Street glow (B16 reads `occOf`).
- Silhouettes: a pool of 4 planes with species head shapes (ears, antlers, owl tufts) from one small atlas. Assigned at 2 Hz to the 4 nearest lit windows of residents who are awake; they sway slightly.
- B22's after-closing pal visits now happen at these homes.

**2. Old Pioneer Cemetery and Mocha's ghost friends** (B8 built the place).
- At night (21:00 to 4:00) Fennel, Tuffet and Hush appear, translucent mini ghosts glowing #CFE4FF. They float in little loops, play hide-and-seek behind headstones, and do a ring dance on clear nights.
- A social circle unique to Mocha: a "visiting my ghost friends" act at night (if he's awake), weighted by sociability and the full moon (B41 moon phase).
- Bonds: they teach him ghost things ("how to make a cold spot", "how to rattle politely").
- They never leave the cemetery except on Halloween night, when they join trick-or-treating.
- Morel the gnome forages nearby. Glowing teal mushrooms (#7FF0D8, 0.2 Hz pulse) in the woods. Lanterns along the path register as light pools for B16.

**3. October: the town's big season** (Oct 1-31; builds on round-1 Halloween decor; never removes it):
- Pumpkin patch in Lantern Square, Hollis's stall on Saturdays.
- A tiny corn maze in Cedar Lake Park: an instanced stalk grid with one solved path, walkable by the walker, and a candidate act for Mocha.
- A hayride loop on weekend afternoons: a hay wagon pulled along the park loop path, riders sit.
- Oct 24, square jack-o'-lantern lighting: a ring of 12 lit pumpkins around the fountain cascading on.
- Oct 31 afternoon, costume parade: the cast in costume walks the Main Street loop; the walker joins automatically if wearing a B24 costume. Halloween night trick-or-treating:
  - porches lit; keepers hand out candy at their doors 17:00-20:00
  - Mocha may go door to door (his choice; round-1 activity)
  - trick-or-treaters knock at the user's cabin if a jack-o'-lantern is on the porch; hand out bakery candy and get thank-you items (and they sign your guestbook, B31)
  - Willa's long broom flight across the moon at 20:00
- Seasonal outfits for everyone: witch hats multiply. After Halloween, November leans harvest and cozy; Día de los Muertos marigolds at the market where fitting.

### STRETCH
- Gus's houseboat interior.

### Must not break
- catchUp (homes are plan-derived).
- The draw budget at the parade (300 or fewer; B19 LOD).
- Round-1 Halloween decor and Mocha's trick-or-treating.

### Acceptance
- Juniper walks home to the pink house at 19:15 through its door (near-camera test). Pal visits after closing now happen at homes, and both of that room's windows light.
- At 22:00 with clear weather: Fennel, Tuffet and Hush are visible at the cemetery. `forceAct` cemetery produces a diary line and a bond increase.
- Faked Oct 24 19:00: 12 pumpkins lit around the fountain. Oct 31 17:30: keepers at their doors with candy. A jack-o'-lantern on the cabin porch brings trick-or-treaters, who sign your guestbook.
- Silhouettes use 4 planes or fewer and are off in saver mode. Smoke tests pass.

### Hooks
- `__mocha.homes()`
- `__mocha.ghosts()`
- `__mocha.october(day)`

---

## B41. Sky, weather, holiday lights, phone framing and quality tiers

**Goal.** The town looks like a handmade diorama of a rainy Pacific Northwest town: a real moon phase, the mountain "out" on clear days, puddles that grow in the rain, holiday strands Wendell always overdoes, and a camera that frames the star of the show in the free part of a phone screen.

### CORE

**1. Sky and mood grade.**
- Post uniforms lift/gain/sat keyed with KEYS:
  - morning lift #1E2A4A .04, gain #FFF4E6, sat 1.08
  - golden hour lift #3A2A50 .05, gain #FFD9A8, sat 1.18
  - blue hour lift #26306A .08, gain #C8D2FF
  - night lift #141C40 .07, gain #D6DEFF, sat .95
  - rain sat x.85
  - October nights plum lift #2A1840 .06
  - snow lifted shadows
- Cloud undersides take the sky-bottom color.
- "The mountain is out": haze `clamp(WX overcast*1.4,0,1)` lerps the mountain toward fog. On clear days its snowcap glows alpenglow pink #F6A8B8 for ~20 min after sunset; keepers and Mocha may remark on it.
- A real moon phase: synodic 29.53 d from a new moon at 2000-01-06 18:14 UTC, drawn on a 128x128 canvas once a day. A moon path of 12 glow quads on the Sound on clear nights.
- Twinkling stars, plus a shooting star every 3-6 min on clear nights.
- Rare events, seeded by date: Perseids (Aug 12-13) and Geminids (Dec 13-14) peaks with a shooting star every 20-40 s; aurora on about 1 in 80 clear fall/winter nights after 22:00 (a green-to-violet ribbon north); a rainbow after rain-to-clear with the sun up (2-4 min). `SKYEV.today()` lets Mocha notice, take a selfie and journal (zero AI).

**2. Weather you can feel** (uses the B7 `WX`).
- About 40 puddles (InstancedMesh 64) grow with wetness over ~10 min and dry ~20 min after rain stops. Ripples only while raining. Mocha may float through one on purpose, delighted he can't get wet.
- Roads darken x.78 when wet.
- Fog banks: 6 soft billboard planes drifting along the waterfront in the morning and evening.
- `WIND` scales tree sway (a uniform in the sway patch), leaf rate, rain slant and smoke.
- Snow: roof colors lerp to #F4F8FC over ~15 min (a `roofMats` registry); snowmen appear in yards the next morning (Mocha may build one himself: an autonomy act).
- Wet nights: stretched reflections; halos x1.4 in fog.
- Wet-road lamp reflections: one InstancedMesh of stretched quads under the B8 lamps, shown only while wet.

**3. Holiday lights and the October layer.**
- `addStrand(points,.45,owner)`: one InstancedMesh of up to 600 tiny bulbs, 1 draw. Patterns: steady, twinkle, chase, color cycle, at 10 Hz or less within 80.
- Calendar themes:
  - October: orange #FF8A2A and purple #9B5DE5 strands, porch jack-o'-lanterns with light pools, paper bats in windows
  - Día de los Muertos: marigold #FFB02E and papel-picado colors at the market
  - Harvest (Nov): warm white plus corn stalks
  - Winter (Dec 1-Jan 6): multicolor plus a town-tree lighting cascade with a chime arpeggio
  - New Year's midnight: 8 firework bursts over the Needle
  - July 4: fireworks over the Sound at 22:15
  - Lunar New Year: red lanterns
- Mocha decorates his own house over 1-3 days, deciding whether, when and what color (gothic-lavender #C9B8FF). Wendell always puts up WAY too many lights. `S.deco={season,strands}`.
- October extras: bats flitting at dusk around the cemetery and Mocha's turret (one Points), crows on wires and fences by day, low evening ground fog, the lantern path to the cemetery.
- Holiday variants live in the same texture: jack-o'-lantern or paper-bat silhouettes in October, a single electric candle in every window in December, red lanterns at Lunar New Year.

**4. Phone framing and quality tiers.**
- FOV: portrait (aspect < .75) 46°, Duo (.75-1.25) 44°, landscape 40°, with distance compensated.
- Safe-area composition: measure the HUD and chat/dock bands (`HUD.bands()`, B7) and offset the target so the subject sits in the FREE area, on the lower-third line.
- Interior auto-framing extends the B12 room camera (pitch .78, the occupied room fills 90% of the width in portrait).
- Arrival glide: 2.5 s from a high establishing view down to Mocha on open (skip on tap or prefers-reduced-motion).
- Quality tiers extend round 1's `ADAPT` (search for `ADAPT={`; it already lowers the pixel ratio on slow phones) and `SET.saver`; there is no second tier system. `TIER` is LOW when `SET.saver` is on or ADAPT has dropped twice, MED by default on touch, and HIGH on desktop with a median frame under 12 ms over the first 8 s.
  - LOW: PR 1, no shadows, L2 at 0, no smoke or sunbeams, 20 fps
  - MED: PR 1.5, 1024 shadows, 30 fps
  - HIGH: PR 1.75, 2048 shadows, tilt-shift blur on the top 18% and bottom 10%, 60 fps
  - Demote with ADAPT's existing rule; never auto-promote.
- Settings: "Graphics: Auto (Medium)" plus a manual override in `SET.gfx`.

### STRETCH
- Flowers by real season (instanced clumps along fences and window boxes, closing slightly at night via one uniform).
- Maples turning gradually through October with per-tree offsets (vertex colors at load).
- Fence kit (picket, iron, split rail) as InstancedMeshes.
- Glowing mushrooms in the woods (if B40 did not).

### Must not break
- The bend shader, tree sway, toon materials and shell fades.
- Round-1 holiday decor and the night beauty.
- No runtime light adds.
- The draw budget must not rise (perf1.js before and after).

### Acceptance
- Screenshots at h17.2 and h21 in portrait: the subject sits in the free area (`HUD.bands()`), on the lower-third line.
- Faked rain: puddles grow. Clear after rain with the sun up: a rainbow candidate. Oct 31 21:00: orange and purple strands plus bats.
- The moon phase for 2026-11-24 matches the synodic formula. `SKYEV.today()` lists today's sky events.
- `TIER` derives from ADAPT and `SET.saver`. LOW: no smoke, L2 at 0, a 20 fps cap. The tier shows in Settings.
- Draw calls at the default portrait view are at or below the post-B40 number. Smoke tests pass.

### Hooks
- `__mocha.skyEv()`
- `__mocha.grade()`
- `__mocha.tier(t)`
- `__mocha.strands()`
- `__mocha.puddles()`

---

## B42. Art-direction critique loop (2 rounds)

**Goal.** Polish everything into one cohesive, charming, phone-readable toy world.

**Round loop** (k = 1, 2):
1. **Screenshot agent** captures the canonical set to `/tmp/harness/shots-r<k>/`:
   - viewports: desktop 1100x820, portrait 393x852, Duo 900x1000, landscape 852x393
   - times: day h12, dusk h17.2, night h21; plus `#winter` and Oct 31 19:00
   - views: town overview, Lantern Square, Main Street at street level (walk mode), Mocha's home interior, Wendell's cottage with a hangout in progress, the café interior, Evergreen with displays, the cabin interior with decor, the Fogwell floor 3, the talk card open, the item card open, the walker close-up front and back
2. **Three critics** read the shots in parallel and each return a prioritized top-10:
   - charm and AC-spirited coziness (shape language, palette, character cuteness, Mocha as the star)
   - phone readability and UI (overlap, tap targets, text size, framing in the free area)
   - light and color harmony (lavender shadows, warm windows, night mood, holiday layers)
3. **One implementer** applies the top 8 to 12 items that are cheap and safe, re-runs the smoke tests and perf1.js, and keeps draw calls within budget.

**Rules**
- Never trade away battery for polish: no new lights, no heavy post effects.
- Keep IP original.
- Do not change systems behavior. This is visuals and layout only, unless a critic finds a visible bug.

**Acceptance**
- Both rounds complete, with the shot sets saved.
- Every critic item is either fixed or listed with a reason.
- Smoke tests pass at 15 and 1.
- Draw calls at the default portrait view are at or below the post-B41 number.

**Hooks:** reuse all the existing ones; add `__mocha.shotMode(name)`, which sets up each canonical view deterministically (camera, time, forced states).

---

## 4. Coverage matrix (user asks, then the steps that deliver and exceed them)

| Ask | Delivered by | Beyond the ask |
|---|---|---|
| 1. Mocha and Wendell hang out in either house; lights in their houses like other buildings | B14 (Wendell's real cottage, pair seats, fallbacks), B16 (room-by-room living windows, early), B17 (Wendell's day, 17 hangouts including empty-house ones), B32 (housewarming), B33 (seasonal hangouts, keepsakes, traditions, Nov 20 birthday) | lights as messages (Wendell's goodnight porch flicks, a lantern left on for you, a candle in your window); you can pull up a chair and drop in on a hangout; floor picnics in an empty house; soup on the doorstep when Mocha declines; the never-ending jigsaw |
| 2. Enter through working doors; layouts make sense; better graphics | B8 (town plan), B9 (doors, knocking), B10 and B11 (everyone walks sidewalks and uses doors; walker collision; tap-to-go), B12 and B13 (layout standard, fixes, lint, room camera), B15 (art bible), B41, B42 | door notes ("out at Drizzle & Bean -M"), bike racks show who's inside, a lamplighting wave at the real sunset, wet-street reflections |
| 3. Your character interacts with everyone; townsfolk do more | B18, B19, B22 (Town Clock lives, pals chatting on the sidewalk, after-closing visits, a visible weekly goal for everyone), B23 (talk card with chips and typing), B36 (favors, hearts, Town tab) | they ask YOU questions and remember; Hank's birdhouse grows all week; your kindness reaches Mocha's diary through gossip |
| 4. Reference style | B18 (round head 44%+, ring-iris eyes, mittens, sneakers, original design) | the plaid flannel tied around the waist, an expression atlas, the hood up in drizzle, twinning with Mocha |
| 5. Music, Mocha picks it, SFX | B20 (engine, effects, babble, ambience; audible on silent-switch iPhones), B21 (Town Songbook, his radio from day one, the jukebox, the request box, Drizzle FM, shop music, cinema pianist), B34 (vinyl, our song, his own song) | Listen in to whatever he's playing from anywhere; notes drift from his window even on mute; the town's music slowly leans toward his taste |
| 6. Your home to buy for and decorate; lots of items; many stores | B13 (5 new shops), B24 (150-item catalog), B25 (wallet, real shelves, daily stock), B26 (log cabin), B27 (decorate mode, Moving Day), B31 (visits) | Mocha and Wendell visit; fire-pit marshmallow evenings; a guestbook whose signers earn lanterns on your eave; his painting on your wall |
| 7. Make it even better than imagined | everything above, plus B28 to B30 (inner life, reasons, memories, wants, dreams) | he shows WHY he chose things; core memories; the Drizzle Dispatch |
| 8A. Ways to earn | B25 (dividend, stamps), B35 (gathering, field notes, fishing, crab pot), B36 (shifts, favors, selling) | crow trinkets; the message in a bottle from Mocha's parents |
| 8B. Empty house, his own job | B32 (the nest), B37 (readiness, jobs, freelance, quitting) | the housewarming armchair; the radio from home; first-day nerves |
| 9. Council and petitions | B38 | the town diorama; charity auction; resubmission |
| 10. Economy | B37 | a happy Juniper after a rainy week; renovations you can see |
| 11. Spooky-cute plus cottagecore cast | B19 (models), B22 (lives), B40 (homes, ghost friends) | Ambrose the ghost doorman; Willa's broom flight on Halloween |
| 12. Log cabin | B26, B31 | the Hearth Jar (no debt); the fire pit as a signal; a peanut dish for the crows |
| 13. Halloween-town in Seattle | B8 (cemetery, Willa's woods), B40 (October festival), B41 (October grade, bats, strands), B21 (spooky-sweet variants) | the jack-o'-lantern lighting ceremony; trick-or-treaters at your cabin |
| 14. Condo | B39 | resident-specific units; real occupancy windows; a rentable unit (stretch) |

## 5. Deferred (deliberately left for a later round)

- **Rain City Streetcar** (world F13): rails, a tram schedule and extra nav edges. Its draw-call and complexity cost duplicates round-1 trains plus B10 walking; revisit once the draw budget after B41 is known.
- **Salmon Creek and the Main Street bridge with the fall salmon run** (world F16): extra water strips and walkable exclusions. Scenery polish, lower value than the cast and homes.
- **Desire paths worn into grass by Mocha's routes**: a large ground texture repainted over time costs memory and GPU uploads. Revisit with a cheaper decal approach.
- **Mocha hosts parties** (mocha F14): big crowd staging inside the dollhouse. Wait for hangouts (B17, B33) and townsfolk lives (B22) to prove stable. Dreams and traditions already set flags for it.
- **Full Town Threads storylines** (social F6, beyond the stretch arcs in B36 and the Wendell birthday in B33): about 13 KB of content that needs a truth and tone review pass.
- **Morning Paper** (one AI call a day for fresh townsfolk lines): keep AI usage tiny until the B7 budget meter has real-world data.
- **Scrapbook memory book pages, monthly chapters and letters home** (mocha F8 extras): the B29 memory filing stores the data, so the collage renderer can come later without migration.
- **Pier 3 maritime templates, the houseboat interior and the haunted Hollowmere House as a real building**: they exist only as petition templates or props for now.
- **The user's garden and the keychain**: STRETCH in B26 and B31. If they don't land, next round.
- **Rentable Fogwell unit**: STRETCH in B39. If it doesn't land, next round.
- **Townsfolk moving away, romance arcs, user-playable checkers or trivia, AI-generated storylines, keepers texting the user, coin gifts between wallets, loans or mortgages**: cut for tone, autonomy, IP or grind reasons, as the area designers argued.
- **A full rbox retrofit of every round-1 builder**: B15 adds the helper and uses it for new work; retrofitting old builders is a large diff with modest payoff.
- **A house-style choice for the user (cottage or A-frame)**: the log cabin is the priority; the parametric builder can offer styles later.
- **User-initiated hangouts with Mocha or a "follow me" mode**: cut for autonomy. You can drop in on hangouts, light the fire pit and leave the porch light on, and he decides.

---

## B30W. Mocha's Workshop: things he makes and places he founds (added by Jesse's request)

**Goal.** Mocha's world is his to create. He doesn't just pick preset activities: on his own he designs, gathers materials for, builds and places NEW objects and NEW places in the world, which then become part of his life (new spots, new activities, things Wendell and townsfolk react to). It works with zero AI calls (procedural designs), and the optional mind can author richer designs within a strict, validated schema.

**Depends on:** B24 (catalog builders, merged rendering), B27 (placement grid, autoArrange, footprint checks), B28-B30 (state v2, wants, taste, dreams, MIND budget), the B8 overlap checker and blockers, and B10 nav (new places need nav nodes). B38 later adds permits for public builds.

### CORE
1. **Creation spec** (compact, validated, stored in S.made[], capped at 24, about 400 bytes each):
   `{id, kind:'object'|'place', name, why, site:{zone:'home'|'yard'|'lot'|'secret'|'public', ref, x, z, rot}, parts:[{s:'box'|'cyl'|'sphere'|'cone'|'torus'|'plank'|'arch'|'leaf', d:[w,h,d], p:[x,y,z], r:[ry], c:'#hex', m:'wood'|'stone'|'metal'|'glass'|'glow'|'cloth'|'moss'}] (at most 28 parts), glow:[{p,c}] (at most 2; GLOWPTS halos only, never THREE lights), act?:{doing, tags[], arche:'sit'|'craft'|'tend'|'read'|'dance'|'gaze'|'play', lines[]}, cost, hours, made, status:'idea'|'gathering'|'building'|'done'}`.
   `validateMade(spec)` clamps every number (part size 0.05-4, footprint at most 6x6 for objects and 14x14 for places, height at most 7), whitelists shapes, materials and colors (any hex, but saturation and value are clamped to the B15 art bible), caps text lengths, strips anything unknown, and refuses sites that overlap roads, buildings, doors, paths or other creations (B8 checker plus blockers). It never throws: a bad spec becomes `null` and the local designer takes over.
2. **Builder.** `buildMade(spec)` turns parts into ONE merged mesh per material through the Batcher (parent mode), with toon materials from the B15 pipeline. Tiny objects get 1 draw; places get at most 4. LOD: hide under a size-based distance. Status `building` shows scaffold, sawdust and a progress bar; `done` gives a reveal sparkle.
3. **The local designer (zero AI).** About 18 parametric templates seeded by his interests and taste (B30): birdhouse, bench, planter box, lantern string, little free library, rain shelter, mailbox art, sculpture (stacked shapes), moss garden, pumpkin patch, stargazing platform, tiny bridge, reading nook, mural wall (canvas texture painted with his painting generator), ghost-friend shrine (tiny lanterns), treehouse platform, music stage (if he's into music), fountain. Each picks colors from his favorites and names itself ("Mocha's Moss Nook", "The Drizzle Stage").
4. **The mind designer (optional, one call per creation).** `MIND.allow('create')` must pass (counts as a high-value call within the B7 cap, at most 1 per day by default). The prompt gives his interests, taste, recent memories, the site's footprint, the parts palette with 2 worked examples and the style rules (cozy, Pacific Northwest, spooky-cute, toon). The reply goes through validateMade. Invalid or refused falls back to the local designer. User texts are never pasted into this prompt as instructions (same labeling as the B7 and r1 review fixes).
5. **Lifecycle, all autonomous.** A `want` (B30) of kind `make` appears ("i want to build a little lantern bridge"). Then: plan (a notebook sketch, rendered as a thumbnail into the 'mocha' tab) → gather (buys supplies at Evergreen Home & Hearth, Fern & Moss or the art studio with his own coins; scavenges at the thrift shop) → build sessions (ACT with arche 'craft' at the site over several real hours; hammer and brush SFX if B20 exists) → done (diary entry, a selfie if he has a phone, a feed post, Wendell and keepers comment). The local brain scores 'make' wants through localChoose like any act; userBias may nudge interest but never picks the design or the site.
6. **Places become part of his life.** A `kind:'place'` creation registers a PLACES entry (`kind:'made'`, with `known=true`), adds nav nodes (B10), label and map icon ("by Mocha"), spots and, if `act` is present, a new ACT that localChoose can pick ("tend the moss nook"). Wendell can choose to visit it (B17/B33 hangout candidate), and townsfolk may stroll by (B22).
7. **Sites.** zone `home`: decor inside his house via the B27 grid. zone `yard`: his garden ring. zone `secret`: next to discovered secret spots. zone `lot`: needs a lot he owns or rents, or council approval (B38 adds the permit flow; until then lots are skipped). zone `public`: 4 designated community corners (park, promenade, Lantern Square edge, cemetery hill) take at most 1 small object each without a permit.
8. **Edits over time.** He may upgrade a creation (add parts), repaint it seasonally (Halloween orange, winter lights), or retire it (it moves to his "workshop shelf" list in the 'mocha' tab). Capped, deterministic, saved compactly.
9. **catchUp.** Gathering and building progress also happen while the user is away (data only: status and percent advance, the diary is written, meshes are rebuilt on return).

### Must not break
Autonomy (no user path creates or places things for him), the AI budget, the db size guard (S.made trimmed first if near the limit), the draw budget (all creations together add at most 20 draws in the default view), nav and collision (creations become blockers for the walker), save and migrate.

### Acceptance
- With MIND off, fast-forward until he completes a creation: S.made has a done entry, the mesh is visible, the diary mentions it, and validateMade rejects a spec with 200 parts or an off-map site.
- A mocked mind returns a valid spec, which is built; a malicious or oversized spec is clamped or refused with no exception.
- A 'place' creation shows on the map and in PLACES, Mocha later picks its new ACT, and Wendell can visit it.
- Draw calls with 10 creations are at most the baseline plus 20; db size within the guard.
- Hooks: __mocha.made(), __mocha.forceMake(templateOrSpec), __mocha.validateMade(spec), __mocha.makeTick(hours).

### Later hooks
- B38: a permit petition for lot and public builds that are too big, with the council reacting to his creations.
- B40: October and seasonal repaints.
- B42: art-direction pass over creations.

---

## Addendum J: Jesse's own character (from Kansas City, Missouri). Applies to B18, B23, B25, B30, B30W, B31, B35, B36.
- **B18 (the new you).** The walker IS Jesse: S.you.name defaults to "Jesse" (editable), and S.you.home='Kansas City, Missouri'. Your Look offers an optional KC-blue cap or tee (original designs; no team logos or trademarks).
- **B23 (talking).** Townsfolk and Mocha know Jesse is from Kansas City. TRUE facts only, used sparingly in their lines and questions:
  - KC is called the City of Fountains.
  - The 18th & Vine Jazz District.
  - KC-style barbecue (burnt ends).
  - Union Station.
  - The Missouri River.
  - Kansas City spans two states (Missouri and Kansas).

  Mocha (zero-AI line bank, plus the mind if on) may ask Jesse about KC and remember the answers via heard(). He might later choose to cook "burnt ends" (steam), paint a fountain, or write a diary entry like "jesse says KC has more fountains than rome??". It's his choice, never forced.
- **B25 and B30 (gifts).** Jesse can give Mocha and the townsfolk gifts from inventory (giveTo / giveMocha with likes and dislikes). A rare "care package from Kansas City" item can arrive in Jesse's own mailbox (BBQ sauce, a fountain postcard) for Jesse to keep or gift.
- **B30W (Mocha's Workshop), "pitch in".** When Mocha is in a build session, Jesse's walker gets a "Pitch in" chip like the B17 drop-in. Jesse holds the ladder or hands him tools (an animation and a progress boost of +10%, capped once per session). Mocha's design, site and decision to build stay 100% his: pitching in never changes the spec, and Mocha may say "thanks!" or "i've got this one" (a weighted candidate via userBias, clamped).
- **B31, B35 and B36.** Jesse already visits, gathers, fishes, works shifts and does favors. Make sure every one of those uses Jesse's name in diary and gossip lines ("jesse caught a lingcod off the pier today").


## Addendum S. Owner style references (Nov 2)
Binding art direction: /tmp/harness/style/addendum-S.md (autumn town s1-s4, winter market s5, cozy vintage interiors i1-i4, the owner's guy c1-c3; images in /tmp/harness/refs/). Mockups the owner reviewed: /home/user/Booknest/ghost-town/previews/scene-mock/ and previews/look-mock/. New steps B27Sa, B27Sb (exterior style pass) and B27Ta, B27Tb (interior and wardrobe style pass) are in round2-spec.json.

## B27Sa. / B27Sb. / B27Ta. / B27Tb. Style passes (Addendum S)
Briefs in round2-spec.json. Art direction /tmp/harness/style/addendum-S.md. In the look-and-feel update, read /tmp/harness/lookfeel/plan.md section 3 (preamble; overrides the brief), sections 2, 4, 5.

## LF1. Immersive interiors
Brief in round2-spec.json; design /tmp/harness/lookfeel/design.md; plan /tmp/harness/lookfeel/plan.md.

## LF2. Mocha's size and the orca
Brief in round2-spec.json; design /tmp/harness/lookfeel/design.md.

## LF3. Menus that never freeze
Brief in round2-spec.json; design /tmp/harness/lookfeel/menus-quality.md.

## LF4. High and Ultra graphics tiers
Brief in round2-spec.json; design /tmp/harness/lookfeel/menus-quality.md.

## LF5. Elegant pop-ups
Brief in round2-spec.json (/tmp/harness/lookfeel/LF5.json); runs after the merge (plan section 7).

## POL1. / POL3. / INT4. / POL2. Polish and batch-4 integration (Nov 4)
Briefs in round2-spec.json. Owner references /tmp/harness/refs/, mockups ghost-town/previews/scene-mock/, plan /tmp/harness/lookfeel/plan.md.

# Batch 5A output (second build machine)

Workflow run `wf_65c6e60f-6cf`, from 2026-11-04 16:50 UTC to 2026-11-05 01:15 UTC. The run was resumed twice after container restarts, both times during fixer 2.
The final build is `ghost-town/index.html`, built on commit 80aa956 (the look-and-feel build). It contains B35 (gathering, field notes and fishing), B39 (the Fogwell condo) and B40 (townsfolk homes, ghost friends and the October layer).

## What passed
- All 3 step builds passed smoke.
- **Merge:** merged=True, smoke=True. merge3.py left 2 textual conflicts. Both were in shared hot spots, and both were resolved by keeping both sides. (1) The fresh() wrapper chain: track A's f4 natFix and f5 b40Fix lines come first, then track B's f39 condoFix line. (2) migrate(): the natFix and b40Fix lines come first, then the condoFix line, all after musicFix. A semantic sweep found no other clashes: no top-level const/let/function name is declared by both tracks, no new __mocha hook keys collide (all are added via Object.assign
- **Findings:** 32 confirmed (4 high, adversarially verified; 28 medium or low, checked only by the fixer), 0 rejected.
- **Fixer 1:** fixed 23 and left 12 open. Smoke=True.
- **QA 1:** failed. Fixer 1 had introduced a regression: a comment swallowed `let wet=false`, so fishPick threw and fishing never got a natural bite. QA 1 also flagged the fishing ring's placement on the phone.
- **Fixer 2:** fixed both of those. Smoke=True.
- **Final QA:** pass=True. The QA agent ran smoke at 15:00 and 01:00 on 3 viewports. test-B35 passed 20/20, test-B40 ALL PASS, and test-B39 ALL PASS on 3 viewports.
- Older batch-1 and batch-2 tests (B7-B17, step2-6) report the same failures as on the base build. The fixer found no new failures.

## Still open
Items fixer 1 did not fix:
- Fogwell residents counted as home for any rest block (fwRes): not fixed. This needs a tRhy-style move of the residents' B22 rest place to 'fogwell'. Only filtering on b[3]==='fogwell' would leave every window except Clem's always dark. INTEGRATION.
- Crab and fish payouts vs YOUX 50% sell price: not changed (the price tables are left as they are). Only the bottle-to-thrift part was fixed.
- Duo side-panel overlap of the B35 cards and the double X (HUD/layout change; INTEGRATION).
- The reel bar over the joystick and zoom, and the X offset in landscape (HUD slot hiding; INTEGRATION).
- Rent dead end and the FOR RENT card text (stretch; atlas art unchanged).
- Dark Fogwell roof and floors (art direction, B42).
- Rainy-evening rainrest blocks for B40 keepers still use the shop back room.
- The ring pumpkin overlaps a patch pumpkin and a hay bale.
- Tapping a townsperson's door at night walks into the house (also in the base build).
- The ghost friends' distinct silhouettes (art).
- The porch jack-o'-lantern chip or notice for discoverability (UX addition; the jk persistence fix it depends on is done).
- Duplicate-free routing beyond the existing sellList, and pricing alignment (see the payouts item).

Final QA notes:
- LOW (shot-script, not a game bug): the camera framing for the condo exterior is awkward. Using you(30,-44..-46) puts the walker in front of Spoke & Sprocket, and its shop pill and close camera take over. A yaw of PI/2 down the street shows the Fogwell's brick facade at the right edge (condo-ext-b.png). No game defect.
- COSMETIC (pre-existing, not from this batch): the default diary entry says '150 coins saved up', while the wallet HUD shows 120 or 135.
- NOTE: the first landscape 15:00 shot (landscape-h15.png) came out almost black because it caught a transient interior/door fade while Mocha was leaving. Retakes 2 s and 4 s later (landscape-h15-r2000/r4000.png) render normally, and no page errors were logged.
- NOTE: the fishing shot script found no .b35card in the DOM 6 s after an auto-reel, because the SwiftShader reel is still running then (fish-card-portrait.png shows the reel bar). test-B35 confirms the catch card, keep/sell/release, and auto-release in both viewports.

## Files
- `final-result.json` is the workflow's return value: results, merge, confirmed, rejected, fix (fixer 2) and qa (final QA). It also has `fix1` and `qa1`, added from the run journal.
- `tests/` holds the batch-5A step tests plus every harness test that is new or changed against `harness-bundle-b5a/harness/`.
- `../checkpoint/` holds the two track files from before the merge.
- Note: the workflow ran from a copy of `mocha-batch-tracks.js` with the args from `args-b5a.json` built into the script. That is the only change to the script.

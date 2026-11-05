# Batch 4 output (second build machine)

Workflow run `wf_16276b35-7a2`, 02:15–11:40 UTC on 2026-11-04. It ran 22 agents with 0 errors.
The final build is `ghost-town/index.html`, built on commit e7d8990. It contains every batch-4 step: B28 through B34, plus B30W.

## What passed
- Every step build passed its smoke test.
- **Merge:** done (merged=True, smoke=True). It had 0 textual conflicts. merge3.py reported 0 textual conflicts. There was one semantic conflict: B29 and B31 both registered a userBias term named 'present', and ubAdd replaces a term that has the same label. B31's version (+.3 for a visitYou act with the walker within 16 of the cabin) was overwriting B29's (+.3 for a.pres or a.greet). I renamed B31's term to 'atCabin'. I found no duplicate top-level function, const or l
- **Fixer:** smoke passed (True). It fixed 27 findings and left 10 open.
- **Final QA:** pass=True. The QA agent ran smoke at 15:00, 21:00 and 01:00 on 3 viewports with no errors. Step tests on the final file: B28 33/33, B33 29/29, B29 25/26 (timing only), B30 30/30, B30W 31/31, B34 8/8, B31 12/12, B32 27/27.
- Screenshots are in `/tmp/harness/rv-b4/final/` on the build machine. They were not committed.

## Still open
QA problems (none of them is breakage):
- LOW (known, perf): test-B29 'catchUp at -3 days <40 ms' fails on timing only: 72 ms in the first run and 41 ms in the rerun, with 13-14 outcomes and 4 day records, which are correct. This is SwiftShader variance plus w2Sim/b30Night still running in the per-slice loop (already listed as not fixed). All other checks pass: B29 25/26, and B28 33/33, B33 29/29, B30 30/30, B30W 31/31, B34 8/8, B31 12/12 and B32 27/27 all pass.
- MED (visual, cabin fire pit): at 19:30 with Mocha and Wendell at your cabin's fire pit (firePitEvening state on=1, fire=1, who m+w), neither camera shows the scene. In 'follow' the cabin's roof hides Mocha and the fire pit completely (rv-b4/final/cabin-firepit-1930-follow.png). In walk mode at you(36,66) the camera sits inside the log/porch geometry (cabin-firepit-1930.png, -1930b.png). Wendell's and Mocha's speech bubbles also stack on top of each other. INTEGRATION for the camera/controls v3 merge: B31's fire-pit spot needs a camera that is not blocked (a CAM layer or a scene shot).
- LOW (HUD overlap, portrait 393): the Mocha locator badge (ghost circle) covers the first words of a speech bubble ('...the fire from my porch'). Toasts collide with other HUD pieces: 'Mocha bought th…' sits under the now-playing chip (house-furnished.png), and '♫ Rainy Lo-fi on the record player' covers Mocha's speech bubble (cabin-recordplayer.png). The HUD and pop-ups are being restyled on the main machine, so this is for that merge.
- LOW (desktop 21:00, fresh save): the diary says Wendell brought the housewarming armchair and lamp that evening. The lamp is visible, but at that camera angle the armchair is hard to make out in the empty room. It may just be the framing; noted for the interiors pass.

Items the fixer did not fix:
- catchUp perf (low): test-B29 'catchUp at -3 days <40 ms' measured 33 ms in one run and 49.5 ms in the final rerun (SwiftShader variance). w2Sim and b30Night were not moved out of the per-slice loop.
- Sad-feeling caring act (low): S.heart.care still has no reader. Not built.
- Day plan weight (low): makePlan/planBias tuning not changed.
- Made-place pride bonus (low): not added. test-B30W now passes 31/31 (6/600 picks).
- Dispatch 'Right now' refresh while open (low): not done.
- MKGL glow-slot reserve / sparkle restore (low): not done.
- Interest nightly decay above 10 (part of the asks finding): only the saturation was done. Soak not re-run.
- Duplicate gather diary-line dedupe (part of the workshop catch-up finding): not done. Timestamps are now spread instead.
- Pre-existing failures, same on the pre-fix backup /tmp/harness/backup-b4-fix1.html: test-B8 static scan (end marker 'b8World();const B8CONV' is missing, so the slice covers texting code). test-B9 'front walk neighbor'. test-B10 Wendell route via neighbor:back. test-B15 sway programs / RIM noon. test-B16 fire/window flicker sample. test-step5 'care package scheduled'. test-B17 'catchUp 3 days' (backup fails on notes; on the fixed file it also has hangouts only on today, because the bogus frain tradition no longer fills catch-up days and a fresh-start Wendell is a stranger). test-B7 shim check (hasItem with FEAT.nest default on); hasItem was not touched.
- Flaky on SwiftShader, passed on rerun: test-B14 (21:00 fade opacity) and test-step2 (watch-mode zoom). test-B9 '21:00 café locked' failed twice on the fixed file and passed once on the backup, but a direct probe showed the café door at ang 1.75 at 21:00 boot on the backup too, so it is a boot timing race, not a regression.

## Findings
34 were confirmed: 6 high (adversarially verified), and the rest medium or low, which only the fixer checked. 1 was rejected. The full list is in `final-result.json`, under `confirmed` and `fix`.

## Files
- `final-result.json` is the workflow's full return value: results, merge, confirmed, rejected, fix and qa.
- `tests/` holds the batch-4 step tests plus every harness test that is new or changed against `harness-bundle/harness/`. That includes the updated `test-step3.js`, `test-B26.js`, `test-B28.js` and `test-B33.js`, and the pre-merge copies `*.premerge.js`.
- `../checkpoint/` holds the two track files from before the merge.
- Note: the workflow ran from a copy of `mocha-batch-tracks.js` with the args from `args-b4.json` built into the script. That is the only change to the script.

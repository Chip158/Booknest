# Mocha's Ghost Town: where we paused (Thu Nov 5, 2026, ~7:50 AM PT)

## Live links
- Main game (owner's real save): https://claude.ai/artifact/91mbQv4UVYxxW5eM1CTfN3 = version 15 (1793856418-d439) = commit 7feff87: batches 1-4, controls v3, guy-only wardrobe, look-and-feel update, polish round. NOT yet batch 5.
- Test build (separate save, no AI): https://claude.ai/artifact/4ohL3vP2cVjQhq53NtuWiq v2 = everything incl. batch 5 + B42, before final review fixes.
- Mockups: guy https://claude.ai/artifact/ENvQoHs2scVxSAGGTzP6pM, scenes https://claude.ai/artifact/DeSF3gbu4CvqL5k4R1gTGG

## Code state
- Branch ghost-town, commit 9a9148b: ghost-town/index.html = ALL of round 2 built (B7-B42 + B27S/T + LF1-LF5 + POL1-3 + INT4 + INT5A) and merged, B42 two-round art critique done. NOT yet: the final review fixes.
- Branch ghost-town-b4 / ghost-town-b5a: second-machine outputs (already integrated).
- Harness bundle (this file's branch): ghost-town-harness, folder harness-bundle-final/ (specs, plan log, tests, scripts, docs; owner's reference IMAGES not included because the repo is public: ask the owner to re-send them, or work from style/addendum-S.md text).

## What is left (about 4-6 hours)
1. The 6th review lens (runtime safety/perf of the whole game) was interrupted. 5 lenses are done: civic 14, economy 12, sky 13, art 12, playtest 12 findings, saved in b5b-progress.json (keys 'review: ...').
2. Then: run the runtime lens, triage all findings, adversarially verify highs, one fixer, final QA (smoke 15/1/21 + full test run), before/after sheets (ghost-town/previews/final-sheets/), publish to the main artifact (copy index.html + three.min.js into ghost-town/previews/publish/, Artifact publish with url above), regenerate mocha-offline.html (python3 ghost-town/tools/make-offline.py), commit + push.
3. Optional after that: the owner's own playtest notes.

## How to resume in a fresh container
- git fetch origin ghost-town-harness ghost-town; mkdir -p /tmp/harness; cp -r harness-bundle-final/harness/. /tmp/harness/ (from the ghost-town-harness branch); mkdir -p /tmp/three/node_modules/three/build && cp ghost-town/three.min.js there.
- Write a small workflow: lenses = the 'runtime' lens text in scripts/mocha-batch5b-tracks.js args, plus the 5 saved lens results from b5b-progress.json; then triage/verify/fix/QA as in mocha-batch-tracks.js (the review half). The prompts reference /tmp/harness paths.
- Test harness: node /tmp/harness/smoke.js <hour>; NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=<copy> to test a copy.

## Owner preferences to keep
- Standard mobile controls (left floating stick, right-thumb look, no buttons). His walker always a guy (blue jacket, tousled brown hair). The look of his 9 pictures (autumn PNW town, cozy vintage interiors, winter market). Immersive AC-style interiors. Mocha autonomous (userBias only). Phone-friendly short replies, Pacific time.

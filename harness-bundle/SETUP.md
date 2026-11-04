# Batch 4 on a second machine: setup
1. mkdir -p /tmp/harness && cp -r harness-bundle/harness/. /tmp/harness/
2. Make the game path the harness expects exist: if the repo is not at /home/user/Booknest, run: ln -sfn "$(git rev-parse --show-toplevel)" /home/user/Booknest
3. cp /tmp/harness/base-b4.html /home/user/Booknest/ghost-town/index.html   (batch 4 starts from commit e7d8990, NOT from this branch's hotfix file)
4. mkdir -p /tmp/harness/trackA /tmp/harness/trackB && cp /tmp/harness/paused-b4/trackA-after-B28.html /tmp/harness/trackA/index.html && cp /tmp/harness/paused-b4/trackB-after-B33.html /tmp/harness/trackB/index.html && cp /tmp/harness/three.min.js /tmp/harness/trackA/ && cp /tmp/harness/three.min.js /tmp/harness/trackB/
5. mkdir -p /tmp/three/node_modules/three/build && cp /tmp/harness/three.min.js /tmp/three/node_modules/three/build/three.min.js
6. Sanity: cd /tmp/harness && node smoke.js 15  (all 3 viewports OK), and the same with NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html
7. Run the workflow script /tmp/harness/mocha-batch-tracks.js with the args in harness-bundle/args-b4.json (B28 and B33 are already built; their handoffs are in args.prior).

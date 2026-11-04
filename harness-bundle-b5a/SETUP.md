# Batch 5A on a second machine: setup
1. mkdir -p /tmp/harness && cp -r harness-bundle-b5a/harness/. /tmp/harness/
2. If the repo is not at /home/user/Booknest: ln -sfn "$(git rev-parse --show-toplevel)" /home/user/Booknest
3. cp /tmp/harness/base-b5a.html /home/user/Booknest/ghost-town/index.html   (batch 5A starts from the published look-and-feel build, commit 80aa956)
4. for t in A B; do mkdir -p /tmp/harness/track$t && cp /tmp/harness/base-b5a.html /tmp/harness/track$t/index.html && cp /tmp/harness/three.min.js /tmp/harness/track$t/; done; cp /tmp/harness/base-b5a.html /tmp/harness/base-b5a.html
5. mkdir -p /tmp/three/node_modules/three/build && cp /tmp/harness/three.min.js /tmp/three/node_modules/three/build/three.min.js
6. Sanity: cd /tmp/harness && node smoke.js 15 (3 viewports OK)
7. Run the workflow script /tmp/harness/mocha-batch-tracks.js with the args in harness-bundle-b5a/args-b5a.json.

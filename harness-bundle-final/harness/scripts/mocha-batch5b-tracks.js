export const meta = {
  name: 'mocha-batch5b-tracks',
  description: 'Build a round-2 batch of Mocha\'s Ghost Town in parallel tracks, merge them, build the after-merge steps, then review, verify, fix and QA',
  whenToUse: 'Round-2 batches 3-5',
  phases: [
    { title: 'Build', detail: 'parallel tracks, each on its own copy of the file' },
    { title: 'Merge', detail: '3-way merge plus integration wiring' },
    { title: 'Build after merge', detail: 'sequential steps on the merged file' },
    { title: 'Review', detail: 'lenses' },
    { title: 'Triage', detail: 'merge and calibrate' },
    { title: 'Verify', detail: 'adversarial check of high-severity findings' },
    { title: 'Fix', detail: 'single fixer' },
    { title: 'QA', detail: 'final tests plus one repair loop' },
  ],
}

const A = (args && args.label) ? args : {"label": "5b", "sizeKB": 2000, "steps": [{"id": "B36", "title": "Shifts, favors, your friendships, the Town tab and Lantern Square alive"}, {"id": "B37", "title": "Town economy and Mocha's jobs"}, {"id": "B38", "title": "Town Hall, council, petitions and construction"}, {"id": "B41", "title": "Sky, weather, holiday lights, phone framing and quality tiers"}, {"id": "B42", "title": "Art-direction critique loop (2 rounds)"}], "tracks": [{"name": "X", "ids": ["B36", "B37"]}, {"name": "Y", "ids": ["B38", "B41"]}], "after": ["B42"], "extra": {"B36": "Time budget about 120 minutes. The owner asked for ways to earn money if he is buying stuff; make it cozy and quick on a phone.", "B37": "Time budget about 120 minutes. The owner: 'Mocha can decide what he wants to do, he's autonomous, so he can have an empty house and then pick things and get a job when he's ready' and 'they have to figure out how they make the money to do the things that they're doing.' Integrate with batch 4's day plan and wants, and with B35's catches.", "B38": "Time budget about 120 minutes. The owner: 'there might be things that we don't have, like stores or businesses that Mocha wants later, or maybe I want later, that I can ask for, or he can ask for, but then it has to go through a city council that approves or denies.' New places use LF1 immersive interiors and the Addendum S interior kit.", "B41": "Time budget about 150 minutes. Quality tiers already exist (extend TIER, do not rebuild). The winter market follows Addendum S (s5 mood, brightened for phones), with Tamarack the larch goat and a Leavenworth-style train trip.", "B42": "Runs on the MERGED file, LAST. Time budget about 180 minutes for both rounds. The bar is the owner's 9 reference pictures (/tmp/harness/refs/) and the approved mockups: each round's critique must score views against them and the fixes must close the biggest gaps first (he said 'it doesn't really look like the pictures that I referenced')."}, "notes": "BATCH 5B, THE LAST BATCH (Nov 5). Base = /tmp/harness/base-5b.html = everything so far: batches 1-4, controls v3, the guy-only wardrobe, the look-and-feel update (autumn exteriors and cozy interiors from the owner's pictures, immersive interiors IN/WORLD/worldAdd, Mocha's size and the orca, menus SHEETS/UIQ/PREWARM, tiers TIER with real High/Ultra, LF5 pop-ups), the polish round, and batch 5A (B35 gathering/fishing, B39 the Fogwell condo, B40 townsfolk homes and the October layer). The owner plays the published build with a real save: lossless migration. Follow /tmp/harness/lookfeel/plan.md sections 4-5 (worldAdd, PREWARM, IN rules, LF5 pop-ups, controls v3, mFloatY/mSeatY, TIER) and Addendum S (/tmp/harness/style/addendum-S.md; his reference images in /tmp/harness/refs/). B41: quality tiers ALREADY EXIST (LF4 + POL3): extend TIER, do not rebuild it; focus on sky, weather, holiday lights, the winter market (Leavenworth-style trip + Lantern Square market + Tamarack the larch goat, Addendum S) and phone framing. NEVER revert the three.js loader or split #err texts; never bring back rotate buttons or girl-coded options; autonomy stays (userBias only, clamp 1.2).", "outOfScope": "nothing new beyond round 2's spec; report bugs anywhere in the game", "qaShots": "Lantern Square at 15:30 and at 21:00 on Dec 10 (winter market), Oct 31 at 19:00 on Mocha's lane, inside Town Hall, a shift mini-game on the phone, Mocha at his job, the Fogwell condo, and Lantern Square on ULTRA at 21:00 on desktop", "lenses": [{"key": "economy", "prompt": "LENS: the town economy, shifts, favors and Mocha's jobs (B36, B37). The owner can earn money (shifts with the 4 mini-games, favors) and spend it; businesses make and lose money believably (revenue, costs, word of mouth, weather, holidays); Mocha gets a job only when he is ready (his own choice via B29/B30), his pay and hours feel fair, and nothing the owner does forces him. Prices and payouts are balanced across the whole game (shops, shifts, favors, fishing/crabbing/gathering from B35, catalog milestones): report a 7-day simulated ledger for the owner and Mocha. The Town tab. Screenshots to {OUT}/econ/."}, {"key": "civic", "prompt": "LENS: Town Hall, the council, petitions and construction (B38). The owner and Mocha can each petition for a new business; the council (Odalie, Mabel, Hank, Willa, Gus) approves or denies with readable reasons tied to the economy and the town's needs; construction is visible over days and the new place opens with a keeper and a proper immersive interior; Mocha petitions on his own when he wants something. Funds, rules and limits make sense. Screenshots to {OUT}/civic/."}, {"key": "sky", "prompt": "LENS: sky, weather, holiday lights and the winter market (B41). Test DAY=11-05 (now), 10-31, 12-10, 12-24, 12-31 and 07-15 at morning, golden hour, blue hour and night, in clear, rain, fog and snow: the grade, clouds, the mountain-is-out haze, the moon phase and path, stars, rare events, holiday lights in the Addendum S style, the December winter market in Lantern Square and the Leavenworth-style train trip, Tamarack the larch goat (spooky-cute, original); phone framing in all 4 viewports; PHONE perf unchanged; TIER still works. Screenshots to {OUT}/sky/."}, {"key": "art", "prompt": "LENS: FINAL ART DIRECTION after B42's two rounds. Compare the canonical views (exteriors and interiors, day and night, Oct 31 and Dec 10) on PHONE and ULTRA with the owner's 9 references in /tmp/harness/refs/ and the approved mockups in /home/user/Booknest/ghost-town/previews/scene-mock/. Is it one cohesive, charming, phone-readable world that looks like his pictures? Name every view where it still does not, with the single biggest gap. Before/after sheets against the published build (/home/user/Booknest/ghost-town/previews/publish/index.html) in {OUT}/art/."}, {"key": "playtest", "prompt": "LENS: the owner's final playtest on his iPhone (393x852, touch, standard controls) and the Duo: earn coins with a shift and a favor, fish and sell, petition the council for a business, watch Mocha's day and his job, visit the condo, set the date to Oct 31 and to Dec 10 and walk the town at night, open every tab, then reload. Report anything confusing, broken, ugly or annoying, with screenshots in {OUT}/play/."}, {"key": "runtime", "prompt": "LENS: runtime safety and performance of the COMPLETE game. Boot with zero page errors in 3 viewports at DAY=11-05, 10-31, 12-10, 07-15 with a fresh save and saves from e7d8990, 095613e, 80aa956 and the current published build (/home/user/Booknest/ghost-town/previews/publish/index.html); read every merge hunk (INT5A and the X/Y merge); duplicate declarations or hook keys; program count after prewarm and 0 late links; constant light count; PHONE draws per fixed view vs base-5b; localStorage and the db doc (remoteState under 256KB after 60 simulated days with every system's arrays); a 30-minute soak for memory growth; catchUp over 7 days away; the bias audit; the full test run (B7-B42, LF1-5, POL, controls, stick, guy, B35/B39/B40)."}]}
const ALL = A.steps || []
const TRACKS = (A.tracks && A.tracks.length) ? A.tracks : [{ name: 'main', ids: ALL.map(s => s.id) }]
const AFTER = A.after || []
const LABEL = A.label || 'b3'
const OUT = '/tmp/harness/rv-' + LABEL
const FILE = '/home/user/Booknest/ghost-town/index.html'
const BASE = '/tmp/harness/base-' + LABEL + '.html'
const EXTRA = A.extra || {}
const NOTES = A.notes || ''
const PARALLEL = TRACKS.length > 1
const titleOf = id => ((ALL.find(s => s.id === id) || {}).title || id)
const trackFile = t => PARALLEL ? '/tmp/harness/track' + t.name + '/index.html' : FILE
const ENV = f => f === FILE ? '' : 'NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=' + f + ' '

const STEP_RESULT = {
  type: 'object',
  properties: {
    summary: { type: 'string', description: 'precise handoff: what you built, function names, data shapes, where things live, hooks' },
    added_hooks: { type: 'array', items: { type: 'string' } },
    tests: { type: 'string' },
    known_issues: { type: 'array', items: { type: 'string' }, description: "include every cross-track dependency as an item starting with 'INTEGRATION:'" },
    smoke_passed: { type: 'boolean' },
    draws: { type: 'string', description: 'draw-call ledger before -> after, tris' },
  },
  required: ['summary', 'added_hooks', 'tests', 'known_issues', 'smoke_passed', 'draws'],
}

function stepPrompt(id, ctx) {
  const n = ctx.handoffs.length
  const per = n ? Math.max(1200, Math.floor(26000 / n)) : 0
  const prev = n ? ctx.handoffs.map(h => '### ' + h.id + ' ' + h.title + '\n' + h.summary.slice(0, per) + '\nKnown issues: ' + h.known.join(' | ').slice(0, 600)).join('\n\n') : '(none yet; you are the first step here)'
  const f = ctx.file, env = ENV(f)
  const trackNote = ctx.track ? `
PARALLEL TRACK ${ctx.track.name}: you work on a COPY of the game at ${f} (three.min.js sits beside it). At the same time, other track(s) are building ${ctx.others.map(o => o.ids.map(x => x + ' (' + titleOf(x) + ')').join(', ')).join('; ')} in their own copies. Afterwards a 3-way merge (base ${BASE}) combines the tracks. Rules for a clean merge:
- NEVER edit ${FILE}. Edit only ${f}.
- Do not build or change the other track's scope. Where your step needs something the other track builds (the interfaces are in spec section 2, e.g. sfx(), babble(), CHARLOD, the cast, S.you, the catalog), call it guarded (typeof x==='function'&&x(...)) or leave a tiny stub, and list each spot in known_issues as an item starting with 'INTEGRATION:'.
- Add new code as new lines or blocks. Never reformat, re-indent, reorder or reflow existing code. In shared hot spots (fresh(), migrate(), the window.__mocha hooks object, renderSet and Settings, the HUD slot table, frame()), make the smallest possible insertion, on its own new line where you can.
- Prefix every node test command with: ${env}(it points page.goto of the main file path at your copy). Write your own tests against the normal path file:///home/user/Booknest/ghost-town/index.html so they also work after the merge.
- The other track also runs a browser. Keep to ONE browser at a time yourself, and close it when done.
` : ''
  return `You are implementing build step ${id} ("${titleOf(id)}") of round 2 of "Mocha's Ghost Town", a cozy, autonomous virtual-pet life-sim. It is a SINGLE FILE (three.js r128, about ${A.sizeKB || 960}KB), hosted as a sandboxed claude.ai artifact. You edit: ${f}
READ FIRST: in /tmp/harness/round2-spec.md, read sections "## 0." (shared rules) and "## 2." (ownership and interfaces), then your own section "## ${id}." (search for the headings). Where the brief below and the spec differ, the spec wins.
Context: /tmp/harness/round1-handoff.md, /tmp/harness/r1-review-summary.md and /tmp/harness/batch2-handoff.md (batch 2: doors, nav, interiors, homes, art pipeline, living lights, hangouts). Skim only what is relevant to your step. Earlier steps you build on:
${prev}
${trackNote}
YOUR BRIEF, ACCEPTANCE TESTS AND HOOKS: read the entry with id "${id}" in /tmp/harness/round2-spec.json (fields brief, acceptance, hooks), e.g. python3 -c "import json;[print(json.dumps(x,indent=1)) for x in json.load(open('/tmp/harness/round2-spec.json'))['steps'] if x['id']=='${id}']". Those acceptance tests and hooks are required.
${EXTRA[id] ? '\nEXTRA FOR THIS STEP: ' + EXTRA[id] + '\n' : ''}
PROCESS AND RULES:
- Back up first: cp ${f} /tmp/harness/backup-${id}.html
- Edit with exact-string Python replacements that assert their match count, or with the Edit tool. Keep the file's compact style.
- Keep the three.js loader (<script src="three.min.js"> plus the cdnjs fallback) and the two split #err texts exactly as they are.
- TESTING, LEAN (to save time): run smoke ONCE at 15:00: ${env}node /tmp/harness/smoke.js 15 (must print OK for all 3 viewports). Add ${env}node /tmp/harness/smoke.js 1 only if your step touches night, lights or sleep. Write /tmp/harness/test-${id}.js covering your acceptance tests through window.__mocha hooks and run it. For visual changes, screenshot portrait 393x852 plus ONE other viewport (landscape 852x393 if layout-sensitive, else desktop 1100x820) and look at them with Read. The full 4-viewport sweep happens in the batch review. At most 3 screenshot iterations per view. Rendering is SwiftShader (slow): drive the game with hooks and use generous timeouts.
- Draw ledger: node /tmp/harness/perf1.js /tmp/harness/backup-${id}.html ${f} (before vs after; see spec section 0) and append to /tmp/harness/draws.json. If perf1.js doesn't fit, use window.__mocha.gfx().
- Autonomy is non-negotiable (spec section 0): no user input path may write G.act, G.target or G.mode. User influence goes only through userBias (clamped at 1.2).
- TIME BUDGET: aim to finish in about 75 minutes of work. Ship CORE completely. Do STRETCH only if time remains, otherwise list it in known_issues.
- Never leave the file broken. If you cannot get smoke passing, restore your backup and report smoke_passed=false with details.
- Do not git commit or push.
Return the structured handoff. The next implementer and the merge engineer see only your summary, so make it precise.`
}

async function buildStep(id, ctx, label) {
  const p = stepPrompt(id, ctx)
  let r = await agent(p, { label: label + 'build ' + id + ': ' + titleOf(id).slice(0, 36), phase: ctx.phase, schema: STEP_RESULT })
  if (!r || !r.smoke_passed) {
    log(label + id + ' reported smoke failure or died; running a repair agent')
    r = await agent(p + `\n\nREPAIR MODE: a previous implementer of this same step finished with smoke failing or crashed. Its report: ${JSON.stringify(r).slice(0, 4000)}. Diff the current file against /tmp/harness/backup-${id}.html, then either fix the breakage or finish the step properly. Smoke must pass at the end.`, { label: label + 'repair ' + id, phase: ctx.phase, schema: STEP_RESULT })
  }
  return r
}

const results = []
const PRIOR = A.prior || {}
for (const t of Object.keys(PRIOR)) for (const h of PRIOR[t]) results.push({ ...h, track: t })
const short = () => results.map(r => ({ id: r.id, track: r.track, smoke: r.smoke_passed, known: r.known_issues, hooks: r.added_hooks, draws: r.draws, summary: (r.summary || '').slice(0, 2000) }))

// ---------------- parallel tracks ----------------
phase('Build')
async function runTrack(t) {
  const ctx = { file: trackFile(t), handoffs: (PRIOR[t.name] || []).map(h => ({ id: h.id, title: h.title, summary: h.summary || '', known: h.known_issues || [] })), track: PARALLEL ? t : null, others: TRACKS.filter(o => o !== t), phase: 'Build' }
  const res = []
  for (const id of t.ids) {
    const r = await buildStep(id, ctx, PARALLEL ? t.name + ': ' : '')
    res.push({ id, title: titleOf(id), track: t.name, ...(r || { summary: 'FAILED', smoke_passed: false, known_issues: [], added_hooks: [], tests: '', draws: '' }) })
    if (!r || !r.smoke_passed) { log('track ' + t.name + ': ' + id + ' still failing after repair; stopping this track'); return { track: t.name, stopped_at: id, res } }
    ctx.handoffs.push({ id, title: titleOf(id), summary: r.summary, known: r.known_issues || [] })
    log('track ' + t.name + ': ' + id + ' done')
  }
  return { track: t.name, res }
}
const tr = await parallel(TRACKS.map(t => () => runTrack(t)))
tr.filter(Boolean).forEach(x => results.push(...x.res))
const stopped = TRACKS.filter((t, i) => !tr[i] || tr[i].stopped_at)
if (stopped.length) return { stopped: stopped.map((t, i) => ({ track: t.name, at: tr[TRACKS.indexOf(t)] && tr[TRACKS.indexOf(t)].stopped_at })), results: short() }

// ---------------- merge ----------------
let merge = null
if (PARALLEL) {
  phase('Merge')
  const integ = results.flatMap(r => (r.known_issues || []).filter(k => /INTEGRATION/i.test(k)).map(k => r.id + ': ' + k))
  const ho = results.map(r => '### ' + r.id + ' (track ' + r.track + ') ' + r.title + '\n' + (r.summary || '').slice(0, 2600) + '\nHooks: ' + (r.added_hooks || []).join(', ')).join('\n\n')
  const MERGE_RES = { type: 'object', properties: { merged: { type: 'boolean' }, smoke_passed: { type: 'boolean' }, conflicts: { type: 'string' }, integration: { type: 'array', items: { type: 'string' } }, tests: { type: 'string' }, summary: { type: 'string' } }, required: ['merged', 'smoke_passed', 'conflicts', 'integration', 'tests', 'summary'] }
  const mp = `You are the MERGE engineer for "Mocha's Ghost Town", a single-file three.js r128 game at ${FILE} (a sandboxed claude.ai artifact). Parallel tracks built steps on separate copies of the same base:
- base: ${BASE} (identical to the current ${FILE})
${TRACKS.map(t => '- track ' + t.name + ': ' + trackFile(t) + ' built ' + t.ids.join(', ')).join('\n')}
The spec is /tmp/harness/round2-spec.md (sections 0 and 2 define shared rules and interfaces).
Builder handoffs:
${ho}

INTEGRATION notes from the builders:
${integ.length ? integ.join('\n') : '(none listed; still check the interfaces)'}

DO:
1. cp ${FILE} /tmp/harness/backup-${LABEL}-premerge.html
2. python3 /tmp/harness/merge3.py ${BASE} ${trackFile(TRACKS[0])} ${trackFile(TRACKS[1])} /tmp/harness/merged-${LABEL}.html  (line-level merge, then a character-level merge of conflicting long lines; it prints the remaining conflicts with line numbers). With more than 2 tracks, merge pairwise.
3. Resolve every remaining conflict by hand, keeping BOTH sides' intent. Then hunt for semantic merge problems that make no textual conflict: duplicate top-level declarations (both tracks adding the same const/let/function name is a SyntaxError), duplicate keys in the window.__mocha hooks object, two HUD slots claiming the same place, both tracks changing fresh()/migrate() or the same state field, both adding per-frame work in frame(), CSS rule collisions, duplicated element ids. Syntax-check the main inline script (extract it and run node --check or new Function on it) and grep.
4. Wire up every INTEGRATION item: replace the guarded stubs with the real calls now that both sides exist (for example babble in the talk card, coin and door sfx, keepers in world space vs shelf shopping and the counter, cast members referenced across tracks, the walker's new look in shops and the cabin).
5. Copy the merged file to ${FILE}. Run node /tmp/harness/smoke.js 15 and node /tmp/harness/smoke.js 1 (OK for all 3 viewports), then EVERY step test of this batch (${results.map(r => '/tmp/harness/test-' + r.id + '.js').join(', ')}), the batch-2 tests (/tmp/harness/test-B7.js ... test-B17.js) and the round-1 tests (test-step1b.js ... test-step6.js). Run them one at a time (one browser at a time). Fix integration breakage. If a test fails only because the other track intentionally changed behavior, update the test and say so. Take portrait 393x852 screenshots at 15:00 and 21:00 and look at them.
6. Confirm grep 'src="three.min.js"' still matches and the two split #err texts are intact.
Never leave ${FILE} broken: if you cannot get smoke passing, restore the premerge backup and report merged=false. Do not git commit. Time budget: about 90 minutes.`
  merge = await agent(mp, { label: 'merge tracks', phase: 'Merge', schema: MERGE_RES })
  if (!merge || !merge.merged || !merge.smoke_passed) {
    log('merge incomplete; running a second merge engineer')
    merge = await agent(mp + `\n\nREPAIR MODE: a previous merge engineer did not finish. Its report: ${JSON.stringify(merge).slice(0, 4000)}. Continue from the current state of the files (check ${FILE} and /tmp/harness/merged-${LABEL}.html).`, { label: 'merge repair', phase: 'Merge', schema: MERGE_RES })
  }
  if (!merge || !merge.merged || !merge.smoke_passed) return { stopped: 'merge', merge, results: short() }
  log('merge done: ' + (merge.conflicts || '').slice(0, 120))
}

// ---------------- after-merge steps ----------------
if (AFTER.length) {
  phase('Build after merge')
  const ctx = { file: FILE, handoffs: results.map(r => ({ id: r.id, title: r.title, summary: r.summary || '', known: r.known_issues || [] })), track: null, others: [], phase: 'Build after merge' }
  if (merge) ctx.handoffs.push({ id: 'MERGE', title: 'merge of the tracks', summary: merge.summary + '\nIntegration: ' + merge.integration.join(' | '), known: [] })
  for (const id of AFTER) {
    const r = await buildStep(id, ctx, '')
    results.push({ id, title: titleOf(id), track: 'after', ...(r || { summary: 'FAILED', smoke_passed: false, known_issues: [], added_hooks: [], tests: '', draws: '' }) })
    if (!r || !r.smoke_passed) return { stopped_at: id, merge, results: short() }
    ctx.handoffs.push({ id, title: titleOf(id), summary: r.summary, known: r.known_issues || [] })
    log(id + ' done')
  }
}

// ---------------- review ----------------
const handoffText = results.map(r => `## ${r.id} ${r.title}\n${(r.summary || '').slice(0, 2600)}\nHooks: ${(r.added_hooks || []).join(', ')}\nTests: ${r.tests}\nKnown issues:\n- ${(r.known_issues || []).join('\n- ')}`).join('\n\n')
const COMMON = `
You are reviewing "Mocha's Ghost Town", a SINGLE FILE: ${FILE} (three.js r128), a sandboxed claude.ai artifact (no external fetches except the cdnjs three.js fallback; localStorage plus window.claude db, with a 256KB doc). Mocha is a white ghost who lives fully AUTONOMOUSLY: the user never steers him, and user influence enters only through userBias, clamped to 1.2. The owner (Jesse, from Kansas City) also has his own walkable character. It must run on iPhone portrait 393x852, iPhone landscape 852x393, an unfolded "iPhone Duo" 900x1000 and desktop 1100x820, on battery.
This batch built round-2 steps ${results.map(r => r.id).join(', ')}${PARALLEL ? ' (in parallel tracks, then merged; watch for merge seams)' : ''}. The spec is /tmp/harness/round2-spec.md (sections 0 and 2 plus each step). Implementer handoffs:
${handoffText.slice(0, 32000)}
${merge ? '\nMerge report: ' + JSON.stringify(merge).slice(0, 2500) + '\n' : ''}
${NOTES ? '\nNOTES FROM THE ORCHESTRATOR:\n' + NOTES + '\n' : ''}
Test harness: node /tmp/harness/smoke.js <hour>, plus per-step tests /tmp/harness/test-<id>.js. Playwright and Chromium are preinstalled; rendering is SwiftShader, so it is slow: drive the game with window.__mocha hooks and use generous timeouts. Never run two browsers at once yourself; another reviewer may be running one, so retry a timeout once before concluding.
Out of scope (later batches): ${A.outOfScope || '(none listed)'}. DO report bugs and regressions in what exists now, including earlier features (texting, holidays, trains, gallery, zoom, save sync, doors, nav, interiors, lights, hangouts).
Write scratch files only under ${OUT}/. Do NOT edit index.html in the review or verify stages.`
const FINDINGS = {
  type: 'object',
  properties: { findings: { type: 'array', items: { type: 'object', properties: {
    title: { type: 'string' }, severity: { type: 'string', enum: ['high', 'medium', 'low'] }, category: { type: 'string' },
    location: { type: 'string' }, evidence: { type: 'string' }, repro: { type: 'string' }, suggested_fix: { type: 'string' } },
    required: ['title', 'severity', 'category', 'location', 'evidence', 'repro', 'suggested_fix'] } } },
  required: ['findings'],
}
const LENSES = (A.lenses || []).map(l => ({ key: l.key, prompt: l.prompt.split('{OUT}').join(OUT) }))
phase('Review')
const reviews = await parallel(LENSES.map(l => () => agent(`${COMMON}\n\n${l.prompt}\n\nReturn concrete, verified findings only, at most 15, most important first.`, { label: 'review: ' + l.key, phase: 'Review', schema: FINDINGS })))
const all = reviews.map((r, i) => r ? r.findings.map(f => ({ ...f, lens: LENSES[i].key })) : []).flat()
phase('Triage')
const tri = await agent(`${COMMON}\n\nTriage these raw findings (JSON):\n${JSON.stringify(all)}\nMerge duplicates, drop out-of-scope items and nits, and calibrate severity (high = crash, data loss, broken feature, autonomy violation, unusable on phone, or a serious perf regression). Return the unique list, most severe first, and the dropped titles with reasons.`, { label: 'triage', phase: 'Triage', schema: { type: 'object', properties: { findings: FINDINGS.properties.findings, dropped: { type: 'array', items: { type: 'string' } } }, required: ['findings', 'dropped'] } })
const uniq = (tri && tri.findings) || all
phase('Verify')
const VERDICT = { type: 'object', properties: { real: { type: 'boolean' }, confidence: { type: 'string', enum: ['high', 'medium', 'low'] }, reasoning: { type: 'string' }, refined_fix: { type: 'string' } }, required: ['real', 'confidence', 'reasoning', 'refined_fix'] }
const checked = await pipeline(uniq, async (f, _o, i) => {
  if (f.severity !== 'high') return { ...f, keep: true, unverified: true, fix: f.suggested_fix }
  const v = await agent(`${COMMON}\n\nAdversarially VERIFY this high-severity finding. Try hard to refute it by reading the code paths and running a targeted check if cheap. If it is real, refine the fix to be minimal and safe.\n${JSON.stringify(f)}`, { label: 'verify ' + i + ': ' + f.title.slice(0, 40), phase: 'Verify', schema: VERDICT })
  return { ...f, keep: !!(v && v.real), fix: (v && v.real && v.refined_fix) || f.suggested_fix, verdict: v && v.reasoning.slice(0, 500) }
})
const confirmed = checked.filter(Boolean).filter(f => f.keep)
const rejected = checked.filter(Boolean).filter(f => !f.keep).map(f => f.title)
log(`${confirmed.length} findings to fix (${confirmed.filter(f => f.unverified).length} unverified medium/low), ${rejected.length} rejected`)
phase('Fix')
const FIXRES = { type: 'object', properties: { fixed: { type: 'array', items: { type: 'string' } }, not_fixed: { type: 'array', items: { type: 'string' } }, tests_run: { type: 'string' }, smoke_passed: { type: 'boolean' }, summary: { type: 'string' } }, required: ['fixed', 'not_fixed', 'tests_run', 'smoke_passed', 'summary'] }
const testList = results.map(r => '/tmp/harness/test-' + r.id + '.js').join(', ')
const fixPrompt = (items, n) => `${COMMON}\n\nYou are the FIXER and MAY edit ${FILE}. Back it up first to /tmp/harness/backup-${LABEL}-fix${n}.html. Fix these findings, most severe first. Findings marked unverified=true have NOT been independently checked: confirm each is real (read the code, or run a quick check) before fixing, and skip false ones (list them in not_fixed as 'not real: ...'). Keep fixes minimal and safe, keep autonomy intact, add no per-frame allocation. Keep the three.js loader and the split #err texts intact.\n${JSON.stringify(items)}\nAfterwards both smoke tests (15 and 1) must pass, plus every step test (${testList}), the batch-2 tests (test-B7.js ... test-B17.js) and the round-1 tests (test-step1b.js ... test-step6.js). Update a test only when a fix intentionally changed behavior, and say so. Time budget: about 100 minutes; if you run long, fix all highs first.`
let fix = confirmed.length ? await agent(fixPrompt(confirmed, 1), { label: 'fixer', phase: 'Fix', schema: FIXRES }) : { fixed: [], not_fixed: [], tests_run: 'none', smoke_passed: true, summary: 'nothing to fix' }
phase('QA')
const QARES = { type: 'object', properties: { pass: { type: 'boolean' }, problems: { type: 'array', items: { type: 'string' } }, screenshots: { type: 'array', items: { type: 'string' } }, summary: { type: 'string' } }, required: ['pass', 'problems', 'screenshots', 'summary'] }
const qaPrompt = (fx) => `${COMMON}\n\nFinal QA. The fixer reported: ${JSON.stringify(fx).slice(0, 6000)}\nRun both smoke tests and all step tests (${testList}). Take a final screenshot set into ${OUT}/final/ (4 viewports at 15:00 and 21:00, plus ${A.qaShots || 'inside a shop and inside Mocha\'s house at night'}) and look at them. Spot-check the fixes. Report pass=false only for real breakage (errors, broken features, data-loss risk, severe layout problems). Time budget: about 45 minutes.`
let qa = await agent(qaPrompt(fix), { label: 'qa', phase: 'QA', schema: QARES })
if (qa && !qa.pass && qa.problems.length) {
  fix = await agent(fixPrompt(qa.problems.map(p => ({ title: p, unverified: false })), 2), { label: 'fixer 2', phase: 'QA', schema: FIXRES })
  qa = await agent(qaPrompt(fix), { label: 'qa 2', phase: 'QA', schema: QARES })
}
return { results: short(), merge, confirmed: confirmed.map(f => ({ title: f.title, severity: f.severity, lens: f.lens })), rejected, fix, qa }

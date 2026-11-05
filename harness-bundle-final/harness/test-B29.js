// B29 acceptance: mood engine (sparks, face), reasons (why), consolidate (days, core, x3 merge), catchUp v2 (-3 days), the Dispatch in all viewports,
// presence (no goPoint/startAct on arrival, a greet candidate exists), bias audit, plan. Screenshots every mood at 393x852.
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html node /tmp/harness/test-B29.js
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const OUT='/tmp/harness/b29/shots';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n,info!==undefined?JSON.stringify(info).slice(0,300):'')}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,900):'')}};
const SHOTS=process.argv.includes('--shots');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h=15)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return{ctx,p,errs}};
// ---------- portrait: mood, faces, why, consolidate, catchUp, presence, audit ----------
{const {ctx,p,errs}=await open({width:393,height:852},true);
  ok('boot without errors',!errs.length,errs);
  // seed a lived-in save: he knows a few places and met Wendell, needs mid
  await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.metW=true;S.friendW=6;for(const k in S.needs)S.needs[k]=60;S.coins=40;M.plan(true)});
  const plan=await p.evaluate(()=>window.__mocha.plan());ok('plan(): 2-4 intentions plus a quirk',plan.pl.length>=2&&plan.pl.length<=4&&plan.q!=null,plan);
  // spark('win',1) -> giddy within 3 s, arc eyes
  await p.evaluate(()=>{const M=window.__mocha;M.S.heart.mt=Date.now();M.spark('win',1)});await p.waitForTimeout(3000);
  const md=await p.evaluate(()=>window.__mocha.mood());ok("spark('win',1) makes him giddy within 3 s",md.m==='giddy',md);ok('giddy shows ^ ^ arc eyes',md.face.arc===true,md.face);
  // every mood: face state + a screenshot at 393x852 (close follow view)
  const moods=['giddy','cheerful','content','cozy','warm','proud','sleepy','wistful','lonely','restless','nervous'];const faces={};
  await p.evaluate(()=>{const M=window.__mocha;M.setCamMode&&M.setCamMode('follow');M.cam({dist:5.2})});
  for(const m of moods){await p.evaluate(m=>{const M=window.__mocha;M.setMood(m);for(let i=0;i<40;i++)M.b29Frame(.05)},m);await p.waitForTimeout(SHOTS?900:150);faces[m]=await p.evaluate(()=>window.__mocha.mood().face);if(SHOTS)await p.screenshot({path:`${OUT}/mood-${m}.png`})}
  ok('faces differ by mood (arcs giddy/proud, sleepy eyes, lonely highlight, nervous sweat, blush warm/giddy/cozy)',faces.giddy.arc&&faces.proud.arc&&!faces.content.arc&&faces.sleepy.eyeY<.7&&faces.lonely.hl2&&faces.nervous.sweat&&faces.warm.blush>.3&&faces.cozy.blush>.2&&faces.content.blush<.1,faces);
  // why(): after a local choice, non-empty; user influence named honestly
  const ch=await p.evaluate(()=>{const M=window.__mocha;let r=null;for(let i=0;i<12&&!(r&&r.doing&&r.why.length);i++)r=M.choose();return r});ok('why() is non-empty after a local choice',ch&&ch.why&&ch.why.length>0,ch);
  const hon=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.mem.userName='Ari';M.heard('you should try some reading','chat');const a=M.ACTS.find(a=>/read/.test(a.doing||''))||M.ACTS[0];const W=[];M.scoreAct(a,{at:Date.now(),h:15},W);return{W,act:a.doing}});
  ok('user influence appears honestly among the reasons ("Ari suggested it ...")',hon.W.some(w=>/^you:/.test(w[0])&&/Ari suggested it/.test(w[2])),hon);
  // consolidate over a seeded day: x3 duplicates merge, S.days grows, a core memory is added
  const cons=await p.evaluate(()=>{const M=window.__mocha,S=M.S,now=Date.now();S.days=S.days.filter(r=>r.d!==(new Date(now-4*36e5).getFullYear()*1e4+(new Date(now-4*36e5).getMonth()+1)*100+new Date(now-4*36e5).getDate()));const d0=S.days.length,c0=S.core.length;
    for(let i=0;i<3;i++)S.diary.unshift({t:now-(3-i)*36e5-5e5,tag:'Reading',text:'Read on the couch for a while.',place:"Mocha's House",big:false});S.diary.unshift({t:now-6e5,tag:'Friends',text:'Juniper taught me a latte-art leaf today. I made a blob, but a heart-shaped blob.',place:'Café',big:true});
    const r=M.consolidate();const rd=S.diary.filter(e=>/Read on the couch/.test(e.text));return{d0,d1:S.days.length,c0,c1:S.core.length,merged:r.merged,ms:r.ms,read:rd.map(e=>e.text),top:r.top}});
  ok('consolidate(): S.days grows, a core memory is added, x3 duplicates merge',cons.d1>cons.d0&&cons.c1>cons.c0&&cons.merged>=2&&cons.read.length===1&&/\(x3 today\)/.test(cons.read[0]),cons);ok('consolidate() is fast (<10 ms)',cons.ms<10,cons.ms);
  // presence: the walker arrives near Mocha; nothing calls goPoint/startAct; a greet candidate exists in localChoose (weighted by present + nearby)
  const pres=await p.evaluate(async()=>{const M=window.__mocha;const g=M.G;g.mode='idle';g.sleep=false;g.timer=999;M.spy(true);M.walkNear(5);for(let i=0;i<6;i++){M.presTick();M.b29Frame(.2)}await new Promise(r=>setTimeout(r,2500));const spy=M.spy(false);const inn=M.inner();return{spy,cands:inn.cands,near:inn.near}});
  ok('walker arriving near Mocha: no goPoint/startAct on the arrival path',pres.spy&&pres.spy.goPoint===0&&pres.spy.startAct===0,pres.spy);
  ok('a greet candidate exists for localChoose, weighted by present (+.3) and nearby (+.4)',pres.cands.some(c=>c.pres==='hi'||c.pres==='wave')&&pres.cands.every(c=>Math.abs(c.ub-.7)<1e-6||c.ub>=.7),pres);
  const inLC=await p.evaluate(()=>{const M=window.__mocha;M.walkNear(5);let seen=0;const n0=M.S.diary.length;for(let i=0;i<60;i++){const c=M.localChoose(Date.now());if(c.act&&c.act.pres)seen++}return seen});ok('presence candidates are chosen sometimes by localChoose itself (his own weighted pick)',inLC>0,inLC);
  // bias audit with the new terms
  const au=await p.evaluate(()=>window.__mocha.ubAudit());ok('bias audit: every term maxed, total <= 1.2 for every act; present and nearby reach their max',au.max<=1.2+1e-9&&!au.over&&!au.neverHit.length&&au.termMax.present===.3&&au.termMax.nearby===.4,{max:au.max,raw:au.rawMax,never:au.neverHit,tm:au.termMax,acts:au.acts});
  // catchUp v2: lastSeen at -3 days
  const cu=await p.evaluate(()=>window.__mocha.catchUpDays(3));ok('catchUp at -3 days: >=3 day records, <=60 outcomes, <40 ms',cu.recs.length>=3&&cu.cu.oc<=60&&cu.cu.ms<40,{recs:cu.recs.length,oc:cu.cu.oc,ms:cu.cu.ms,n:cu.n,k:cu.cu.k});
  const cu9=await p.evaluate(()=>window.__mocha.catchUpDays(10));ok('catchUp at -10 days: 7 detailed days, summary days beyond, <=60 outcomes',cu9.cu.sum>=2&&cu9.cu.oc<=60,{sum:cu9.cu.sum,oc:cu9.cu.oc,ms:cu9.cu.ms,recs:cu9.recs.length});
  const otd=await p.evaluate(()=>window.__mocha.onThisDay());ok('onThisDay() returns a list',Array.isArray(otd),otd);
  // the Dispatch (portrait bottom sheet)
  const dp=await p.evaluate(()=>{const M=window.__mocha;M.dispatch(3*864e5);const el=document.querySelector('#b29dsp'),r=el.getBoundingClientRect();return{vis:!el.classList.contains('hidden'),hl:(el.querySelector('.b29hl')||{}).textContent,mom:el.querySelectorAll('ul')[0]?el.querySelectorAll('h4+ul')[0].children.length:0,up:(el.querySelector('.b29up')||{}).textContent,r:[r.left,r.top,r.right,r.bottom],w:innerWidth,h:innerHeight,go:!!el.querySelector('#b29go')}});
  ok('Dispatch (portrait): headline, >=3 moments, a coming-up line, fits the screen',dp.vis&&dp.hl&&dp.mom>=3&&dp.up&&dp.r[0]>=0&&dp.r[2]<=dp.w+.5&&dp.r[3]<=dp.h+.5,dp);
  if(SHOTS)await p.screenshot({path:`${OUT}/dispatch-portrait.png`});
  // go see him: moves YOUR camera only
  const go=await p.evaluate(()=>{const M=window.__mocha,g=M.G,a0=g.act,t0=g.target,m0=g.mode;document.querySelector('#b29go').click();return{same:g.act===a0&&g.target===t0&&g.mode===m0,cam:M.cam().mode}});ok('"go see him" only moves your camera',go.same&&go.cam==='follow',go);
  // the why card
  const card=await p.evaluate(()=>{const M=window.__mocha;M.whyCard('why');const el=document.querySelector('#b29card');return{vis:!el.classList.contains('hidden'),li:el.querySelectorAll('li').length,sticky:!!el.querySelector('.b29sticky')}});ok('why/feel/plan card renders (reasons, feelings, sticky note)',card.vis&&card.li>=2&&card.sticky,card);
  if(SHOTS)await p.screenshot({path:`${OUT}/card-portrait.png`});
  ok('no page errors during the portrait run',!errs.length,errs);await ctx.close()}
// ---------- the Dispatch in every other viewport ----------
for(const [n,vp,mob] of [['landscape',{width:852,height:393},true],['duo',{width:900,height:1000},true],['desktop',{width:1100,height:820},false]]){const {ctx,p,errs}=await open(vp,mob);
  const dp=await p.evaluate(()=>{const M=window.__mocha,S=M.S,now=Date.now();['Found a smooth gray stone by the water. Keeping it.','Read on the couch. The rain was loud.','Asked Basil about records. He lit up.','Wendell and I did a puzzle. Missing one piece, as always.'].forEach((x,i)=>S.diary.unshift({t:now-(5-i)*36e5,tag:i?'Day':'Treasure',text:x,place:'',big:!i}));M.dispatch(864e5);const el=document.querySelector('#b29dsp'),r=el.getBoundingClientRect();
    return{vis:!el.classList.contains('hidden'),hl:(el.querySelector('.b29hl')||{}).textContent,mom:el.querySelectorAll('h4+ul')[0]?el.querySelectorAll('h4+ul')[0].children.length:0,up:(el.querySelector('.b29up')||{}).textContent,r:[r.left,r.top,r.right,r.bottom].map(Math.round),w:innerWidth,h:innerHeight,btn:(()=>{const q=el.querySelector('.b29x').getBoundingClientRect();return[q.width,q.height]})()}});
  ok(`Dispatch (${n}): headline, >=3 moments, coming-up line, inside the viewport, 44px close`,dp.vis&&dp.hl&&dp.mom>=3&&dp.up&&dp.r[0]>=0&&dp.r[1]>=0&&dp.r[2]<=dp.w&&dp.r[3]<=dp.h&&dp.btn[0]>=44&&dp.btn[1]>=44,dp);
  if(SHOTS&&(n==='landscape'||n==='desktop'))await p.screenshot({path:`${OUT}/dispatch-${n}.png`});
  ok(`no page errors (${n})`,!errs.length,errs);await ctx.close()}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

// B28 acceptance: state v2 (backup, self-check, mig.ok, merge, size guard), bonds, heard(), the bias audit
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html node /tmp/harness/test-B28.js
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const FILE='/home/user/Booknest/ghost-town/index.html',SRC=fs.readFileSync(FILE,'utf8');
const FIXC=fs.readFileSync('/tmp/harness/b28/fix-current.json','utf8'),FIXB=fs.readFileSync('/tmp/harness/b28/fix-b2.json','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,900):'')}};
const tierOf=p=>{const T=[0,10,60,160,320,600];let i=0;while(i<T.length-1&&p>=T[i+1])i++;return i};
// ---- static audit: userBias is only ever added, never multiplied; user-facing talk/heard paths never steer ----
{const uses=[...SRC.matchAll(/userBias\(/g)].length;ok('userBias never multiplies a score',!/\*\s*userBias\(/.test(SRC)&&!/userBias\([^()]*(?:\([^()]*\))?[^()]*\)\s*\*/.test(SRC)&&/s\+=userBias\(a,UBX\)/.test(SRC),{uses});
  const body=n=>{const i=SRC.indexOf('function '+n+'(');if(i<0)return null;let d=0,j=SRC.indexOf('{',i);for(let k=j;k<SRC.length;k++){if(SRC[k]==='{')d++;else if(SRC[k]==='}'){d--;if(!d)return SRC.slice(i,k+1)}}return null};
  const steer=/\bG\.(act|target|mode)\s*=(?!=)|\bstartAct\(|\bgoPoint\(/;const fns=['mochaChips','tkMocha','mochaReply','talkSubmit','tkAsk','npcChips','heard','heardSeed','bondAdd','bondTierUp','b28Out','v2Threads','seedTried','forgetB28','giveTo','giveMocha','gbAdd','gbOpen','consign','buyPainting','vyGift','vyNote','vyReview','vyPaint'];
  const bad=fns.filter(n=>{const b=body(n);return b&&steer.test(b)});ok('talk chips, heard(), bonds, gifts and cabin-visit paths never write G.act/G.target/G.mode',!bad.length,{bad,present:fns.filter(n=>body(n))})}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(save,vp={width:1100,height:820})=>{const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  if(save)await p.addInitScript(s=>{if(!sessionStorage.getItem('b28seeded')){sessionStorage.setItem('b28seeded','1');localStorage.clear();const o=JSON.parse(s);o.lastSeen=Date.now()-(o._gap||60e3);delete o._gap;localStorage.setItem('mocha-seattle-v1',JSON.stringify(o));localStorage.setItem('b28fix',s)}},save);
  await p.goto('file://'+FILE);await p.waitForTimeout(5500);return{ctx,p,errs}};
// ---------- 1. boot with the CURRENT-build save (e7d8990, played via hooks): lossless, backup, v2, mig.ok ----------
{const {ctx,p,errs}=await open(FIXC);await p.waitForTimeout(3000);
  const r=await p.evaluate(async()=>{const M=window.__mocha,S=M.S,fx=JSON.parse(localStorage.getItem('b28fix'));const bak=localStorage.getItem('mocha-v1-backup');let bo=null;try{bo=JSON.parse(bak)}catch(e){}
    const pt=await M.pushTest();return{v:S.v,mig:M.mig(),bakBorn:bo&&bo.born===fx.born,bakDiary:bo&&bo.diary.length===fx.diary.length,bakV:bo&&bo.v,home:JSON.stringify(S.you.home)===JSON.stringify(fx.you.home),look:JSON.stringify(S.you.look)===JSON.stringify(fx.you.look),youCoins:S.you.coins===fx.you.coins,coins:S.coins,fxCoins:fx.coins,
      diary:S.diary.length,fxDiary:fx.diary.length,diaryKept:fx.diary.every(e=>S.diary.some(d=>d.t===e.t&&d.text===e.text)),texts:fx.texts.every(m=>S.texts.some(x=>x.t===m.t&&x.text===m.text)),trips:(S.trips||[]).length===(fx.trips||[]).length,pets:(S.pets||[]).length===(fx.pets||[]).length,paint:(S.paintings||[]).length===(fx.paintings||[]).length,
      wend:M.bond('wendell'),fxFriendW:fx.friendW,keys:['bonds','core','firsts','days','chapters','heart','today','presence','toTell','voice','me','mig'].filter(k=>S[k]==null),ab:!!(S.mem.ab&&S.mem.th&&S.mem.sd&&S.mem.fe),firsts:Object.keys(S.firsts),core:S.core.length,days:S.days.length,pt}});
  ok('current save: S.v===2 and every v2 key exists',r.v===2&&!r.keys.length&&r.ab,r);ok('current save: mocha-v1-backup holds the untouched v1 JSON',r.bakBorn&&r.bakDiary&&r.bakV===1,r);
  ok('current save: his cabin placements, look and wallet carry over unchanged',r.home&&r.look&&r.youCoins,r);ok('current save: diary, texts, trips, pets and paintings kept',r.diaryKept&&r.texts&&r.trips&&r.pets&&r.paint,r);
  ok('current save: bonds.wendell tier matches friendW',r.wend.tier===tierOf(12*r.fxFriendW)&&r.wend.p>=12*r.fxFriendW,{wend:r.wend,fw:r.fxFriendW});
  ok('current save: round trip passed (mig.ok) and only then pushRemote sends',r.mig.ok&&r.pt.pushed===1,r);ok('current save: no page errors',!errs.length,errs);await ctx.close()}
// ---------- 2. boot with an old batch-2 save ----------
{const {ctx,p,errs}=await open(FIXB);await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>{const M=window.__mocha,S=M.S,fx=JSON.parse(localStorage.getItem('b28fix'));const bo=JSON.parse(localStorage.getItem('mocha-v1-backup')||'null');
    return{v:S.v,ok:M.mig().ok,bak:!!bo&&bo.born===fx.born&&bo.diary.length===fx.diary.length,diaryKept:fx.diary.every(e=>S.diary.some(d=>d.t===e.t&&d.text===e.text)),know:Object.keys(fx.know||{}).every(k=>M.bond(k).p>=6*fx.know[k]),wend:M.bond('wendell'),fw:fx.friendW,you:!!S.you&&!!S.you.home,trips:(S.trips||[]).length===(fx.trips||[]).length}});
  ok('batch-2 save: v2, backup, diary intact, know -> bonds, wendell tier',r.v===2&&r.ok&&r.bak&&r.diaryKept&&r.know&&r.wend.tier===tierOf(12*r.fw)&&r.you&&r.trips,r);ok('batch-2 save: no page errors',!errs.length,errs);await ctx.close()}
// ---------- 3. a fixture that throws mid-migration: restore, stay v1, never push ----------
{const bad=JSON.parse(FIXC);bad._mt='throw';const {ctx,p,errs}=await open(JSON.stringify(bad));await p.waitForTimeout(3000);
  const r=await p.evaluate(async()=>{const M=window.__mocha,S=M.S,fx=JSON.parse(localStorage.getItem('b28fix'));const pt=await M.pushTest();return{v:S.v,bonds:S.bonds===undefined,mig:M.mig(),diary:fx.diary.every(e=>S.diary.some(d=>d.t===e.t&&d.text===e.text)),home:JSON.stringify(S.you.home)===JSON.stringify(fx.you.home),bak:!!localStorage.getItem('mocha-v1-backup'),pt,hb:M.bond('wendell')}});
  ok('throwing fixture: backup restored, S.v stays 1, pushRemote skipped',r.v===1&&r.bonds&&r.mig.st==='fail'&&r.mig.noPush===1&&r.pt.pushed===0&&r.diary&&r.home&&r.bak,r);ok('throwing fixture: the game still runs (no page errors)',!errs.length,errs);await ctx.close()}
// ---------- 3b. boot with the current save 6 hours away: catchUp runs right after the migration (TDZ-safe, bonds grow from outcomes) ----------
{const o=JSON.parse(FIXC);o._gap=6*36e5;const {ctx,p,errs}=await open(JSON.stringify(o));
  const r=await p.evaluate(()=>{const M=window.__mocha;return{v:M.S.v,ok:M.mig().ok,bonds:Object.keys(M.S.bonds).length}});ok('boot with a 6 h gap: catchUp after migration runs clean',r.v===2&&!errs.length,{r,errs});await ctx.close()}
// ---------- 4. fresh start: hooks for heard, bonds, the audit, size, merge, UI ----------
{const {ctx,p,errs}=await open(null,{width:393,height:852});
  const r=await p.evaluate(async([FIXC])=>{const M=window.__mocha,o={};const w=ms=>new Promise(r=>setTimeout(r,ms));o.fresh={v:M.S.v,ok:M.mig().ok,bonds:typeof M.S.bonds};
    // hook migrate (no catchUp in the way): counts identical, then the throwing variant
    const fx=JSON.parse(FIXC);const m=M.migrate(FIXC,{trip:1});o.mig={st:m.st,v:m.v,diary:m.diary===fx.diary.length,coins:m.coins===fx.coins,bakSame:m.bakSame,ok:m.mig&&m.mig.ok,wend:m.bonds.wendell,fw:fx.friendW,you:m.bonds.you,firsts:m.firsts,core:m.core,days:m.days};
    const bad=Object.assign({},fx,{_mt:'throw'});const mb=M.migrate(JSON.stringify(bad));o.migBad={st:mb.st,v:mb.v,noPush:mb.noPush,push:(await M.pushTest()).pushed};
    M.migrate(FIXC,{trip:1});o.pushAfter=(await M.pushTest()).pushed;
    // heard: a dated life event -> a thread due tomorrow 10:00, asked when due
    const h=M.heard('i have a job interview tomorrow','chat');const d=new Date();d.setDate(d.getDate()+1);d.setHours(10,0,0,0);o.ev={q:h.ev&&h.ev.q,due:h.ev&&h.ev.due,want:d.getTime(),same:h.actSame&&h.targetSame&&h.modeSame};
    o.phone=!!M.S.phone;o.early=M.threads(d.getTime()-36e5,true).length;o.later=M.threads(d.getTime()+6e4,false);
    const ph=M.S.phone;M.S.phone=null;M.heard('we have a big recital on saturday','chat');const sat=M.S.mem.th.find(x=>/recital/.test(x.q));o.sat=M.threads(sat.due+6e4,false);o.tell=M.toTell().map(x=>x.x);o.person=M.threads(sat.due+12e4,true);M.S.phone=ph;
    const ans=M.heard('it went great, i got the job!','chat');o.answered={st:ans.th.find(x=>/interview/.test(x.q)).st,life:ans.ab.life.map(x=>x.x)};
    // orders change nothing; suggestions become a seed (a userBias term <= .6)
    const g0=M.G.act,t0=M.G.target;const s1=M.heard('you should go to bed','chat');o.sug={same:s1.actSame&&s1.targetSame&&M.G.act===g0&&M.G.target===t0,sd:s1.sd.map(x=>x.fx),reply:s1.reply};
    const s2=M.heard('go to bed','chat');o.ord={order:s2.order,same:s2.actSame&&s2.targetSame,sdN:s2.sd.length,reply:s2.reply};
    const ub=M.userBias({p:'home',s:'bed',fx:'sleep',tags:['cozy'],doing:'sleeping'});o.seed=ub.parts.find(x=>x[0]==='seedBias');
    o.feel=M.heard("i'm so tired today",'text').feel;o.like=M.heard('i really love foggy mornings','chat').like;o.dis=M.heard("i don't like olives",'chat').dis;
    // bonds: tiers, tier-up diary + toast, drift floor
    const d0=M.S.diary.length;const j=M.bond('juniper',70);o.jun={tier:j.tier,name:j.name,entry:M.S.diary.slice(0,3).map(e=>e.text).find(x=>/Juniper and I are regulars/.test(x))||null,op:j.rec.op};
    M.bond('basil',200);o.trade=M.S.items.some(i=>/Basil/.test(i.name));const bb=M.S.bonds.basil;bb.l=Date.now()-20*864e5;M.S.me.dr=0;M.bondDrift();o.drift={p:bb.p,floor:60,miss:M.S.me.miss.map(x=>x.x)};
    // the bias audit: every term maxed at once, for every ACT
    o.audit=M.ubAudit();
    // talk chips with Mocha: none writes G.act / G.target synchronously
    try{M.talk('mocha');await w(300);const st=M.talkState();const n=(st.chips||[]).length||4;o.chips=[];for(let i=0;i<Math.min(n,4);i++){const a0=M.G.act,t1=M.G.target,m0=M.G.mode;const pr=M.talkChip(i);o.chips.push(M.G.act===a0&&M.G.target===t1&&M.G.mode===m0);try{await pr}catch(e){}}M.talkClose()}catch(e){o.chipErr=String(e)}
    // UI: Friends in the Me tab, memories in the You tab (deletable), restore in Settings
    M.openTab('me');await w(300);const fr=document.querySelector('#b28fr');o.ui={friends:!!fr&&/Juniper/.test(fr.textContent)};M.openTab('you');await w(300);const mm=document.querySelector('#b28mem');o.ui.mem=!!mm&&/foggy mornings/.test(mm.textContent);
    const btn=[...(mm?mm.querySelectorAll('button'):[])].find(x=>/foggy/.test(x.parentNode.textContent));if(btn){const r=btn.getBoundingClientRect();o.ui.btn=[Math.round(r.width),Math.round(r.height)];btn.click();await w(100);o.ui.forgot=!document.querySelector('#b28mem').textContent.includes('foggy mornings')&&!M.S.mem.ab.lk.includes('foggy mornings')}
    M.openTab('set');await w(300);o.ui.restore=!!document.querySelector('#b28rb');
    // merge: union core/days by id, max bonds, diary union
    const A=JSON.parse(JSON.stringify(M.S)),B=JSON.parse(JSON.stringify(M.S));A.core.push({id:'1A',t:1,k:'A',x:'a',s:1});B.core.push({id:'2B',t:2,k:'B',x:'b',s:1});A.days.push({id:'d20990101',d:20990101,n:1,tg:[],x:''});B.days.push({id:'d20990102',d:20990102,n:1,tg:[],x:''});B.bonds.juniper.p=500;B.diary.unshift({t:Date.now()+5,tag:'Day',text:'only on B',place:''});
    const mg=M.merge(A,B);o.merge={core:mg.core.some(c=>c.id==='1A')&&mg.core.some(c=>c.id==='2B'),days:mg.days.some(c=>c.id==='d20990101')&&mg.days.some(c=>c.id==='d20990102'),jun:mg.bonds.juniper.p,diary:mg.diary.some(e=>e.text==='only on B')};
    // 60 simulated days with every system on, then the size guard
    const t0s=performance.now();for(let i=0;i<60;i++){M.catchUpSim(1);M.heard('i love jazz and rainy day number '+i,'chat');M.heard('i have a dentist appointment on friday','text');M.S.texts.push({from:'me',text:'a text on day '+i+' about everything that happened at work today and what i ate',t:Date.now()-i*6e4,read:true});M.voiceHarvest('What a lovely quiet morning by the water. The fog was soft and silver today, number '+i+'.','m')}
    o.sim={ms:Math.round(performance.now()-t0s),before:M.size().total,diary:M.S.diary.length,texts:M.S.texts.length};const g=M.v2Guard(true);o.sim.after=M.size().total;o.sim.guard=g;o.sim.top=Object.entries(M.size().fields).slice(0,5);o.sim.keep={core:M.S.core.length,bonds:Object.keys(M.S.bonds).length,firsts:Object.keys(M.S.firsts).length};
    const L0=M.S.learned;M.S.learned=Array.from({length:60},(_,i)=>({topic:'t'+i,facts:Array.from({length:24},(_,j)=>'a long notebook fact number '+j+' about topic '+i+' that goes on for a while to take space'),t:Date.now()}));const T0=M.S.texts;M.S.texts=Array.from({length:150},(_,i)=>({from:'me',text:'x'.repeat(270),t:Date.now()-i*6e4,read:true}));o.bloat={before:M.size().total};const g2=M.v2Guard(true);o.bloat.after=M.size().total;o.bloat.done=g2.done;o.bloat.keep={core:M.S.core.length,bonds:Object.keys(M.S.bonds).length,firsts:Object.keys(M.S.firsts).length};M.S.learned=L0;M.S.texts=T0;
    o.ctx=M.ctxFor('chat').length;return o},[FIXC]);
  console.log(JSON.stringify(r).slice(0,2600));
  ok('fresh start is v2 with mig.ok',r.fresh.v===2&&r.fresh.ok&&r.fresh.bonds==='object',r.fresh);
  ok('hook migrate: counts identical, backup equals the v1 JSON, wendell tier matches friendW',r.mig.st==='ok'&&r.mig.v===2&&r.mig.diary&&r.mig.coins&&r.mig.bakSame&&r.mig.ok===1&&r.mig.wend.tier===tierOf(12*r.mig.fw)&&r.mig.firsts.includes('born'),r.mig);
  ok('hook migrate: a throwing fixture restores, keeps S.v=1 and skips pushRemote',r.migBad.st==='fail'&&r.migBad.v===1&&r.migBad.noPush===1&&r.migBad.push===0&&r.pushAfter===1,r.migBad);
  ok('heard: job interview tomorrow -> thread due tomorrow 10:00',r.ev.due===r.ev.want&&/job interview/.test(r.ev.q||'')&&r.ev.same,r.ev);
  ok('heard: the follow-up waits for its time, then goes by text (he has a phone) or waits and is asked in person',r.early===0&&r.later.length===1&&r.later[0].via===(r.phone?'text':'later')&&/job interview/.test(r.later[0].q)&&r.sat.length===0&&r.tell.some(x=>/recital/.test(x))&&r.person.some(x=>/recital/.test(x.q)&&x.via==='person')&&r.answered.st===2&&r.answered.life.some(x=>/got the job/.test(x)),{ph:r.phone,e:r.early,l:r.later,s:r.sat,t:r.tell,p:r.person,a:r.answered});
  ok("heard('you should go to bed') leaves G.act unchanged and only seeds a <=.6 term",r.sug.same&&r.sug.sd.includes('sleep')&&r.seed&&r.seed[1]<=.6+1e-9,{sug:r.sug,seed:r.seed});
  ok("an order ('go to bed') gets playful independence and changes nothing",r.ord.order&&r.ord.same&&!!r.ord.reply,r.ord);
  ok('heard: feelings, likes and dislikes',r.feel&&r.feel.w==='tired'&&r.like==='foggy mornings'&&r.dis==='olives',{f:r.feel,l:r.like,d:r.dis});
  ok('bonds: tier-up writes the diary (and toast), opinion words, trade gift at friend',r.jun.tier===2&&!!r.jun.entry&&r.jun.op.length>=1&&r.trade,r.jun);
  ok('bonds: drift never goes below mx-1 and leaves a reconnect wish',r.drift.p>=160&&r.drift.miss.length>=1,r.drift);
  ok('BIAS AUDIT: every term maxed, every ACT, total <= 1.2 (clamp engaged)',r.audit.over===0&&r.audit.max<=1.2+1e-9&&r.audit.rawMax>1.2&&r.audit.acts>40,{max:r.audit.max,raw:r.audit.rawMax,acts:r.audit.acts,terms:r.audit.terms,top:r.audit.top});
  ok('BIAS AUDIT: every registered term reached its max in the audit',r.audit.neverHit.length===0,{never:r.audit.neverHit,max:r.audit.termMax});
  ok('talk card chips with Mocha never write G.act/G.target/G.mode',!r.chipErr&&r.chips.length>=3&&r.chips.every(Boolean),{c:r.chips,e:r.chipErr});
  ok('UI: Friends (Me), memories with a 44px forget button (You), restore (Settings)',r.ui.friends&&r.ui.mem&&r.ui.forgot&&r.ui.btn&&r.ui.btn[0]>=44&&r.ui.btn[1]>=44&&r.ui.restore,r.ui);
  ok('merge unions core and days by id, max bonds, diary union',r.merge.core&&r.merge.days&&r.merge.jun===500&&r.merge.diary,r.merge);
  ok('60 simulated days stay under 200 KB (never trims core/bonds/firsts)',r.sim.after<200*1024&&r.sim.keep.core>0&&r.sim.keep.bonds>3,r.sim);
  ok('size guard trims a bloated save under 200 KB in order (diary, learned, texts...) and keeps core/bonds/firsts',r.bloat.before>200*1024&&r.bloat.after<=200*1024&&r.bloat.done[0]==='diary'&&r.bloat.keep.core>0&&r.bloat.keep.bonds>3,r.bloat);
  ok('mind context per kind includes bonds/you slices',r.ctx>50,r.ctx);
  ok('fresh run: no page errors',!errs.length,errs);await ctx.close()}
await b.close();console.log(`\nB28: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

// B23 acceptance: talk pill near Juniper, card >= 5 chips, two different TRUE coffee facts, How's Mocha? references his status/diary;
// Mocha card leaves G.act/G.target/G.mode unchanged + head turn (over his shoulder); boo -> Pearl's possum flop; mind off = 0 calls,
// mind on = at most 1 call via MIND.allow('user'); town.news grows after adoptPet and spreads; card layout with simulated keyboard in
// portrait / landscape / Duo has no overlap; CAM 'talk' pushed + popped. node test-B23.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,600):''));if(!c)fails++};
const SH='/tmp/harness/b23/shots/';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}
// every visible HUD element that intersects the card (and the card vs the simulated keyboard)
const OVL=()=>{const c=document.getElementById('talkCard').getBoundingClientRect(),H=innerHeight,kb=window.__mocha.talkState().kb,out=[];
  for(const e of document.querySelectorAll('#leftTop>*,#meters,#dock,#joy,#look,#zoom,#near,#chatwrap,#edge,#away,.hudS,.hudMore,#toast.show,#knock,#modeBtn,#diaryBtn,#camctl')){if(e.id==='talkCard'||document.getElementById('talkCard').contains(e))continue;const q=e.getBoundingClientRect(),cs=getComputedStyle(e);
    if(!q.width||!q.height||cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)continue;if(q.left<c.right&&c.left<q.right&&q.top<c.bottom&&c.top<q.bottom)out.push((e.id||e.className)+':'+Math.round(q.left)+','+Math.round(q.top)+','+Math.round(q.width)+'x'+Math.round(q.height))}
  return{card:[Math.round(c.left),Math.round(c.top),Math.round(c.width),Math.round(c.height)],over:out,inView:c.top>=0&&c.left>=0&&c.right<=innerWidth+.5&&c.bottom<=H-kb+.5,kb}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file);await p.waitForTimeout(5500);return{ctx,p,errs,E:(f,a)=>p.evaluate(f,a)}};
let {ctx,p,errs,E}=await open({width:393,height:852},true,15);
ok(await E(()=>{const m=window.__mocha;return['talk','talkChip','talkClose','reply','askYou'].every(k=>typeof m[k]==='function')&&typeof m.town.news==='function'&&typeof m.town.spread==='function'}),'hooks: talk/talkChip/talkClose/reply/askYou + town.news/spread');
// ---- Juniper: the pill, the card, chips ----
await E(()=>{window.__mocha.walk();window.__mocha.town.tick()});await p.waitForTimeout(600);
const j0=await E(()=>{const m=window.__mocha,i=m.talk('juniper');m.talkClose();return i});
const pill=await E(async()=>{const m=window.__mocha,el=document.getElementById('near');let n=null,txt='',tk=false;for(let k=0;k<24;k++){await new Promise(r=>setTimeout(r,300));const q=m.talkNear();if(q.near&&!n)n=q;if(/Talk to Juniper/.test(el.textContent)){txt=el.textContent;tk=el.classList.contains('tk')}if(n&&txt)break}return{n:n||{pill:''},txt,tk}});
ok(/Talk to Juniper/.test(pill.n.pill)&&/Talk to Juniper/.test(pill.txt)&&pill.tk,'near Juniper the pill says "Talk to Juniper" (a 44 px button)',pill);
const c1=await E(()=>{const m=window.__mocha,i=m.talk('juniper');const jy=getComputedStyle(document.getElementById('joy')).display,lk=document.getElementById('look')?getComputedStyle(document.getElementById('look')).display:'none',dk=getComputedStyle(document.getElementById('dock')).display;
  const h=[...document.querySelectorAll('#tkChips .tkChip')].map(b=>b.getBoundingClientRect().height);return{i,jy,lk,dk,h}});
ok(c1.i.open&&c1.i.chips.length>=5&&c1.i.chips[c1.i.chips.length-1]==='Bye'&&c1.h.every(x=>x>=44),'the card opens with >= 5 chips (44 px), Bye last',{chips:c1.i.chips,text:c1.i.text,h:c1.h});
ok(c1.i.talking&&c1.jy==='none'&&c1.lk==='none'&&c1.dk==='none','body.talking hides the joystick, look stick and dock',[c1.jy,c1.lk,c1.dk]);
ok(c1.i.top==='talk'&&c1.i.cam.includes('talk:2'),'CAM talk pushed (prio 2) for the two-shot',c1.i.cam);
await p.waitForTimeout(1500);await p.screenshot({path:SH+'portrait-juniper.png'});
{const ay=await E(()=>{const m=window.__mocha;const r=m.askYou('juniper','drink','cocoa');return{r,facts:m.S.you.facts,news:m.town.news().filter(n=>n.kind==='you')}});ok(ay.facts.some(f=>f[0]==='drink'&&f[1]==='cocoa'&&f[2]==='juniper')&&ay.news.some(n=>n.knowers.includes('juniper')&&!n.mocha),'askYou: the answer lands in S.you.facts and on the news bus (Juniper knows, Mocha not yet)',ay)}
// answer her question if she asked one (S.you.facts), then the main chips
let st=await E(()=>window.__mocha.talkState());
if(st.q){const a=await E(async()=>{const m=window.__mocha;const s=await m.talkChip(0);return{s,facts:m.S.you.facts,news:m.town.news().filter(n=>n.kind==='you')}});
  ok(a.facts.some(f=>f[0]==='drink'&&f[2]==='juniper')&&a.news.some(n=>n.knowers.includes('juniper')),'she asks YOU: the answer lands in S.you.facts and on the news bus (Juniper knows)',{facts:a.facts,text:a.s.text});st=a.s}
const tc=await E(async()=>{const m=window.__mocha;let s=m.talkState();const i=s.chips.findIndex(c=>c==='Tell me about coffee');if(i<0)return{err:'no chip',chips:s.chips};const a=await m.talkChip(i);const s2=m.talkState();const i2=s2.chips.findIndex(c=>c==='Tell me about coffee');const b=await m.talkChip(i2);
  return{a:a.text,ar:a.raw,b:b.text,br:b.raw,F:m.FACTS.coffee,chips:s.chips}});
ok(!tc.err&&tc.ar!==tc.br&&tc.F.includes(tc.ar)&&tc.F.includes(tc.br),"'Tell me about coffee' twice gives two different TRUE facts (FACTS.coffee)",tc);
const hm=await E(async()=>{const m=window.__mocha;const s=m.talkState();const i=s.chips.findIndex(c=>c==="How's Mocha?");const r=await m.talkChip(i);const now=m.mochaNow(),d=m.S.diary.slice(0,6).map(e=>e.text);return{text:r.text,src:r.src,now,hasNow:r.text.toLowerCase().includes(now.toLowerCase().slice(0,30)),diary:d.some(x=>r.text.includes(x.split(/[.!?]/)[0].slice(0,20)))}});
ok(hm.hasNow||hm.diary,"'How's Mocha?' references his current status or a recent diary entry",hm);
const cl=await E(()=>{const m=window.__mocha;const r=m.talkClose();return{r,stack:m.cam.stack(),talking:document.body.classList.contains('talking')}});
ok(!cl.r.open&&!cl.stack.some(e=>e.owner==='talk')&&!cl.talking,'closing pops CAM talk and restores the HUD',cl.stack);
// ---- Mocha: never paused ----
const mo=await E(async()=>{const m=window.__mocha,G=m.G;const a0=G.act,t0=G.target,md=G.mode;
  // synchronous: open + every chip + close, no frames in between
  m.talk('mocha',{place:Math.PI/2});const s0=m.talkState();for(let i=0;i<4;i++){const c=m.talkState().chips;if(c[i]&&!/Wanna/.test(c[i]))await m.talkChip(i)}const same=G.act===a0&&G.target===t0&&G.mode===md;m.talkClose();
  // live: trap every write to G.act / G.target / G.mode for 2.5 s with the card open; none may come from the talk code
  const W=[],keep={};for(const k of ['act','target','mode']){let v=G[k];keep[k]=()=>v;Object.defineProperty(G,k,{configurable:true,get(){return v},set(x){W.push(k+' <- '+((new Error().stack||'').split('\n').slice(2,4).join(' | ')));v=x}})}
  m.talk('mocha',{place:Math.PI/2});await new Promise(r=>setTimeout(r,2500));const s=m.talkState();const c=s.chips.findIndex(x=>x==='What are you up to?');const r2=await m.talkChip(c);m.talkClose();
  for(const k of ['act','target','mode']){const v=keep[k]();delete G[k];G[k]=v}return{same,s0:s0.text,s,up:r2.text,W,bad:W.filter(w=>/talk|tk[A-Z]|b23Frame|mochaReply|npcReply/.test(w))}});
ok(mo.same&&mo.bad.length===0,'opening and using the card with Mocha never writes G.act, G.target or G.mode (sync check + live write trap)',{same:mo.same,writes:mo.W.length,bad:mo.bad});
ok(mo.s.shoulder&&Math.abs(mo.s.headYaw)>.15,'he answers over his shoulder (head turned toward you, card text)',{head:mo.s.headYaw,text:mo.s.text,up:mo.up});
// ---- boo / mind off / mind on ----
const bo=await E(async()=>{const m=window.__mocha;return await m.reply('pearl','boo!')});
ok(bo.flop&&/possum/.test(bo.text),"a typed 'boo' to Pearl triggers the possum flop",bo);
const off=await E(async()=>{const m=window.__mocha;m.MIND.on=false;m.mindUse({reset:1});const r=await m.reply('juniper','what is the tallest tree in the world');return r});
ok(off.calls===0&&/local|referral/.test(off.src),'mind off: a free question gets a local/referral reply and 0 API calls',off);
const on=await E(async()=>{const m=window.__mocha,M=m.MIND;let n=0;const api0=M.api,on0=M.on;M.api=async()=>{n++;return{text:JSON.stringify({reply:'hmm! soup is a hug in a bowl, honestly. and mocha agrees. mocha should make soup now.'})}};M.on=true;M.backoff=0;m.mindUse({reset:1});dispatchEvent(new Event('pointerdown'));
  const a=await m.reply('rosalind','what do you think the meaning of soup is');const b2=await m.reply('rosalind','what do you think the meaning of soup is');const c=await m.reply('rosalind','is purple a flavor or a mood');M.api=api0;M.on=on0;return{a,b:b2,c,n,by:m.mindUse().by||null}});
ok(on.n<=1&&on.a.calls<=1&&on.b.calls===0&&on.c.calls===0&&(on.n===0||(on.a.src==='ai'&&!/mocha should/i.test(on.a.text))),"mind on: at most 1 call through MIND.allow('user'), cached, rate-limited, sanitized (no commands to Mocha)",on);
// ---- news ----
const nw=await E(()=>{const m=window.__mocha,S=m.S;S.pets=[];const n0=m.town.news().length;m.adoptPet('hedgehog','Pip');const L=m.town.news(),it=L.find(x=>/Pip/.test(x.text));const k0=it?it.knowers.slice():[];const s=m.town.spread(2);const it2=s.news.find(x=>/Pip/.test(x.text));
  const keepers=m.KEEPERS.map(k=>k.id);return{n0,n1:L.length,text:it&&it.text,k0,k1:it2&&it2.knowers,keeperKnows:!!it2&&it2.knowers.some(id=>keepers.includes(id)),added:s.added}});
ok(nw.n1>nw.n0&&nw.text,'town.news() grows after adoptPet',nw);
ok(nw.keeperKnows&&nw.k1.length>=nw.k0.length,'after spread(2) a keeper knows it',nw);
// ---- portrait layout with the keyboard ----
const lp=await E(`(async()=>{const OVL=${OVL.toString()};const m=window.__mocha;m.talk('juniper');m.talkKb(0);await new Promise(r=>setTimeout(r,300));const a=OVL();let s=m.talkState();if(s.q){await m.talkChip(0);s=m.talkState()}const i=s.chips.findIndex(c=>c==='Say something…');if(i>=0)await m.talkChip(i);m.talkKb(336);await new Promise(r=>setTimeout(r,300));const b=OVL();return{a,b,inp:m.talkState().inp}})()`);
console.log('  layout portrait',JSON.stringify(lp));
ok(lp&&!lp.a.over.length&&lp.a.inView&&!lp.b.over.length&&lp.b.inView&&lp.inp,'portrait: no overlap, keyboard closed and open (336 px)',lp);
await p.screenshot({path:SH+'portrait-kb.png'});await E(()=>{window.__mocha.talkKb(null);window.__mocha.talkClose()});
ok(errs.length===0,'portrait: no page errors',errs.slice(0,4));await ctx.close();
// ---- landscape + Duo ----
for(const [nm,vp,mob,kb] of [['landscape',{width:852,height:393},true,190],['duo',{width:900,height:1000},true,300]]){({ctx,p,errs,E}=await open(vp,mob,15));
  const r=await E(`(async()=>{const OVL=${OVL.toString()};const m=window.__mocha;m.walk();m.town.tick();await new Promise(r=>setTimeout(r,400));const i=m.talk('juniper');if(!i)return{err:'no open'};m.talkKb(0);await new Promise(r=>setTimeout(r,400));const a=OVL();let s=m.talkState();if(s.q){await m.talkChip(0);s=m.talkState()}
    const j=s.chips.findIndex(c=>c==='Say something…');if(j>=0)await m.talkChip(j);m.talkKb(${kb});await new Promise(r=>setTimeout(r,400));const b=OVL();return{a,b,top:s.top,chips:s.chips}})()`);
  ok(r&&!r.err&&!r.a.over.length&&r.a.inView&&!r.b.over.length&&r.b.inView,nm+': card has no overlap, keyboard closed and open ('+kb+' px)',r);
  try{await p.screenshot({path:SH+nm+'-kb.png',timeout:90000})}catch(e){console.log('  (screenshot timeout '+nm+')')}
  const pop=await E(()=>{const m=window.__mocha;m.talkKb(null);const c=m.talkClose();return m.cam.stack().some(e=>e.owner==='talk')});ok(!pop,nm+': CAM talk popped on close');
  if(nm==='landscape'){await E(()=>{window.__mocha.talk('gus')});await p.waitForTimeout(1500);await p.screenshot({path:SH+'landscape-gus.png'});await E(()=>window.__mocha.talkClose())}
  ok(errs.length===0,nm+': no page errors',errs.slice(0,4));await ctx.close()}
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

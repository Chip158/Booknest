// INT4 acceptance (batch 4 x look-and-feel glue): fire-pit framing (CAM 'firepit'), one bubble / notices clear of the HUD in portrait,
// batch-4 cards are LF5 sheets, B31 parts belong to the cabin (LF1), presence inside the cabin, the nest sleep height (LF2), bias audit,
// and old saves (batch 3, hotfix, look-and-feel) load with nothing lost.  node test-INT4.js [phase...]   phases: fire land nest saves (default all)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const FILE='/home/user/Booknest/ghost-town/index.html',SH='/tmp/harness/int4/shots';fs.mkdirSync(SH,{recursive:true});
const PH=process.argv.slice(2).length?process.argv.slice(2):['fire','land','nest','saves'];
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(c,m,x)=>{if(c)pass++;else fail++;console.log((c?'PASS ':'FAIL ')+m+(!c&&x!==undefined?' '+JSON.stringify(x).slice(0,900):''))};
const VP={portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],desktop:[{width:1100,height:820},false]};
async function open(b,vn,hour,o={}){const [vp,mob]=VP[vn];const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  if(o.save)await p.addInitScript(([s,set])=>{if(!sessionStorage.getItem('i4seed')){sessionStorage.setItem('i4seed','1');localStorage.clear();const x=JSON.parse(s);x.lastSeen=Date.now()-60e3;localStorage.setItem('mocha-seattle-v1',JSON.stringify(x));localStorage.setItem('i4fix',s);if(set)localStorage.setItem('mocha-settings',set)}},[o.save,o.set||null]);
  else if(o.fresh)await p.addInitScript(()=>{if(!sessionStorage.getItem('i4f')){sessionStorage.setItem('i4f','1');localStorage.clear()}});
  await p.addInitScript(timeAt(hour));await p.goto('file://'+(o.file||FILE));await p.waitForTimeout(o.wait||6000);return{p,ctx,errs}}
const SETUP=`const M=window.__mocha,S=M.S,sl=ms=>new Promise(r=>setTimeout(r,ms)),C=M.CAT;const run=async(n,done,ms=1000)=>{for(let i=0;i<n;i++){await sl(ms);if(done())return i}return -1};
  const lite=C.items.find(i=>i.cat==='lite'),pl=C.items.find(i=>i.cat==='plnt');
  if(!S.you.home.rooms.great.it){M.cabPlace('ach',0,-3,1,0,'great');M.cabPlace(lite.code,0,-4.8,2.8,0,'great');M.cabPlace(pl.code,0,4.2,2.2,0,'great');M.cabPlace('frg',0,-5.8,-3.6,0,'great');M.cabBuild()}
  S.mem=S.mem||{};S.mem.chats=Math.max(S.mem.chats||0,35);S.metW=true;
  const ov=(a,b)=>a&&b&&a.x<b.x+b.w-1&&a.x+a.w>b.x+1&&a.y<b.y+b.h-1&&a.y+a.h>b.y+1;`;
const E=(p,f)=>p.evaluate('(async()=>{'+SETUP+f+'})()');
// fire-pit evening with Mocha and Wendell; the camera layer, both on screen and unblocked, one bubble at a time clear of the HUD
async function firePit(p,vn){let r=await E(p,`M.setCamMode('follow');M.firePitEvening({mocha:true,sc:.4});const t=await run(90,()=>{const f=M.firePitEvening('state');return f.on&&f.who.m&&f.who.w});await sl(3500);
    const i=M.int4(),s=M.int4See(),f=M.firePitEvening('state');return{t,i,s,f:{on:f.on,who:f.who,fire:f.fire}}`);
  ok(r.t>=0&&r.i.fpcam.on&&r.i.cam==='firepit',`${vn}: fire-pit evening running with Mocha+Wendell pushes CAM 'firepit' (${r.i.fpcam.why})`,r);
  ok(r.s.mocha.on&&r.s.mocha.vis&&!r.s.mocha.occ&&r.s.wendell.on&&r.s.wendell.vis&&!r.s.wendell.occ,`${vn}: follow view frames Mocha ${JSON.stringify(r.s.mocha.ndc)} and Wendell ${JSON.stringify(r.s.wendell.ndc)}, nothing in front`,r.s);
  await p.screenshot({path:`${SH}/${vn}-firepit-1930-follow.png`});
  r=await E(p,`let maxB=0,hit=[],n=0;for(let k=0;k<30;k++){M.say(k%2?'mocha':'wendell',k%2?'marshmallow time!! 🔥':'you want it golden. patience. patience…');await sl(200);const P=M.popups(),H=M.int4Hud();n++;maxB=Math.max(maxB,P.bubbles.length);
      for(const b of P.bubbles)for(const h of H)if(h.id!=='#toast'&&ov(b.rect,h))hit.push(b.who+'x'+h.id)}return{maxB,hit:[...new Set(hit)],n}`);
  ok(r.maxB<=1&&!r.hit.length,`${vn}: both talking at the pit -> at most one bubble, never over a HUD piece`,r);
  return r}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
if(PH.includes('fire')){const vn='portrait';console.log('== fire / portrait 19:30');const {p,ctx,errs}=await open(b,vn,19.5);let r;
  r=await E(p,`const u=M.ubAudit();return{over:u.over,max:u.max,never:u.neverHit,terms:Object.keys(u.termMax||{}),lst:M.prewarm?M.prewarm().list.filter(x=>/int4/.test(x)):null}`);
  ok(r.over===0&&r.max<=1.2+1e-9&&!r.never.length&&new Set(r.terms).size===r.terms.length&&r.terms.includes('atCabin')&&r.terms.includes('present'),`bias audit clean with ${r.terms.length} unique terms ('present' and 'atCabin' both registered)`,r);
  await firePit(p,vn);
  // walk mode near the pit: the same layer; walking away pops it
  r=await E(p,`M.setCamMode('walk');M.you(30.5,62.5);await sl(2500);const a=M.int4(),s=M.int4See();M.you(40,52);await sl(3000);const c=M.int4();return{a,s,c}`);
  ok(r.a.fpcam.on&&r.a.fpcam.why==='walk'&&r.s.mocha.on&&!r.s.mocha.occ&&r.s.wendell.on&&!r.s.wendell.occ,`walk mode by the pit: CAM 'firepit', Mocha and Wendell unblocked`,r);
  ok(!r.c.fpcam.on&&r.c.cam!=='firepit',`walking away pops the fire-pit layer (top: ${r.c.cam})`,r.c);
  // batch-4 notices: one at a time, never over another HUD piece or the bubble
  r=await E(p,`M.firePitEvening({end:1});M.setCamMode('follow');await sl(800);M.say('mocha','ooh, the record player!! 🎶');
    for(const t of ['♫ Rainy Lo-fi on the record player','📌 Mocha pinned a note to your fridge','👻 Mocha is at your door!',"🫙 Hazel's Blackberry Jam (from Wendell) is in your pockets",'🛋 Mocha bought the wingback armchair'])M.notice(t);
    let shown=new Set(),hit=[],multi=0,ids=new Set();for(let k=0;k<64;k++){await sl(250);const P=M.popups(),H=M.int4Hud();H.forEach(h=>ids.add(h.id));const tr=P.notices.rect;if(P.notices.showing)shown.add(P.notices.showing);
      if(document.querySelectorAll('#toast.show').length>1)multi++;if(tr){for(const h of H)if(h.id!=='#toast'&&ov(tr,h))hit.push(h.id+' '+JSON.stringify([k,tr,h,P.names.text,document.body.className.split(' ').filter(c=>/walk|follow/.test(c))]));for(const bb of P.bubbles)if(ov(tr,bb.rect))hit.push('bubble:'+bb.who)}}
    return{shown:[...shown],hit:[...new Set(hit)],multi,ids:[...ids]}`);
  ok(r.shown.length>=4&&!r.multi&&!r.hit.length,`portrait: ${r.shown.length} batch-4 notices, one at a time, none over the HUD (${r.ids.join(' ')}) or a bubble`,r);
  // batch-4 cards are LF5 sheets
  r=await E(p,`M.guestbook('open');await sl(120);const a={sh:M.int4().sheets,pz:M.popups().paused};M.guestbook('close');await sl(120);const b={sh:M.int4().sheets,pz:M.popups().paused};
    M.whyCard();await sl(120);const c={sh:M.int4().sheets,pz:M.popups().paused};document.getElementById('b29card').classList.add('hidden');await sl(120);const d=M.int4().sheets;
    M.dispatch();await sl(120);const e=M.int4().sheets;document.getElementById('b29dsp').classList.add('hidden');await sl(120);return{a,b,c,d,e,f:M.int4().sheets}`);
  ok(r.a.sh['b4:gbk']&&r.a.pz&&!r.b.sh['b4:gbk']&&r.c.sh['b4:b29card']&&r.c.pz&&!r.d['b4:b29card']&&r.e['b4:b29dsp']&&!r.f['b4:b29dsp'],'guestbook, how-he-feels card and the Dispatch register as sheets (LF5 quiet while open)',r);
  // LF1: B31 parts belong to the cabin; a bought painting and the fridge note show inside, the porch book/lanterns/marshmallow do not
  r=await E(p,`const c=M.consign();const by=M.buyPainting(c&&c.id);await sl(300);const i=M.int4().b31;M.setCamMode('walk');M.you(40,60);await sl(400);const a=M.int4Vis();M.inside.enter('cabin',{fade:false});await sl(900);
    const In=M.inside(),b=M.int4Vis();return{by:by&&by.ok,i,a,b,leaks:In.leaks,on:In.on,pid:In.pid}`);
  ok(r.by&&r.i&&r.i.parent==='cabin'&&r.i.extParent==='cabin'&&r.on&&r.pid==='cabin'&&r.b.in&&!r.b.ext&&r.b.pts.length&&r.b.pts.every(Boolean)&&!r.leaks.length,`inside the cabin: painting(s) ${JSON.stringify(r.b.pts)} visible, porch parts hidden, no leaks`,r);
  await p.waitForTimeout(800);await p.screenshot({path:`${SH}/${vn}-cabin-inside.png`});
  r=await E(p,`M.inside.exit({fade:false});await sl(900);return{v:M.int4Vis(),in:M.inside().on,leaks:M.inside().leaks}`);
  ok(!r.in&&r.v.ext&&!r.leaks.length,'outside again: porch parts back, no leaks',r);
  // presence: Mocha visits the cabin; from the street he is not drawn, inside the cabin he is
  r=await E(p,`M.setCamMode('walk');M.you(40,59);M.visitYou(true,{fast:6});const t=await run(120,()=>M.vyState().G.inCabin);await sl(600);const out={t,chars:M.inside().chars,see:M.inside.see('mocha'),on:M.inside().on};
    M.inside.enter('cabin',{fade:false});await sl(900);const In=M.inside();return{out,inn:{chars:In.chars,leaks:In.leaks,see:M.inside.see('mocha'),G:M.vyState().G}}`);
  ok(r.out.t>=0&&!r.out.on&&!r.out.chars.includes('mocha')&&r.inn.chars.includes('mocha')&&!r.inn.leaks.length,'Mocha visiting your cabin: hidden from the street, drawn inside the cabin',r);
  await p.screenshot({path:`${SH}/${vn}-cabin-visit-inside.png`});
  ok(!errs.length,'fire/portrait: no page errors',errs.slice(0,5));await ctx.close()}
if(PH.includes('land')){const vn='landscape';console.log('== fire / landscape 19:30');const {p,ctx,errs}=await open(b,vn,19.5);await firePit(p,vn);
  const r=await E(p,`M.firePitEvening({end:1});await sl(600);for(const t of ['♫ Rainy Lo-fi on the record player','📌 Mocha pinned a note to your fridge'])M.notice(t);let hit=[];for(let k=0;k<20;k++){await sl(250);const P=M.popups(),H=M.int4Hud(),tr=P.notices.rect;if(tr)for(const h of H)if(h.id!=='#toast'&&ov(tr,h))hit.push(h.id)}return{hit:[...new Set(hit)]}`);
  ok(!r.hit.length,'landscape: notices clear of the HUD',r);ok(!errs.length,'landscape: no page errors',errs.slice(0,5));await ctx.close()}
if(PH.includes('nest')){const vn='portrait';console.log('== nest / portrait 01:00 fresh start');const {p,ctx,errs}=await open(b,vn,1,{fresh:true,wait:7000});
  let r=await E(p,`const st=M.homeItems();await run(20,()=>M.int4().sleep&&M.int4().inHome);await sl(1500);return{i:M.int4(),v2:S.v2fresh,nest:st.on,n:st.n}`);
  ok(r.i.nest&&r.i.sleep&&r.i.inHome&&Math.abs(r.i.bedTop-.71)<.01&&Math.abs(r.i.my-r.i.seatY)<.35,`fresh nest at 1:00: he sleeps on his blanket (y ${r.i.my} ~ ${r.i.seatY}, not the old bed height)`,r);
  r=await E(p,`M.inside.enter('home',{who:'mocha',fade:false});await sl(1500);const In=M.inside();return{on:In.on,pid:In.pid,chars:In.chars,leaks:In.leaks}`);
  ok(r.on&&r.pid==='home'&&r.chars.includes('mocha')&&!r.leaks.length,'inside the nest: Mocha drawn, no leaks',r);await p.screenshot({path:`${SH}/${vn}-nest-0100.png`});
  ok(!errs.length,'nest: no page errors',errs.slice(0,5));await ctx.close()}
if(PH.includes('saves')){console.log('== saves');
  for(const [nm,fx] of [['batch-3','/tmp/harness/b28/fix-current.json'],['hotfix','/tmp/harness/int4/fix-hotfix.json'],['look-and-feel','/tmp/harness/int4/fix-lf.json']]){
    if(!fs.existsSync(fx)){ok(false,`${nm} fixture missing ${fx}`);continue}const save=fs.readFileSync(fx,'utf8');const setp=fx.replace('.json','.settings.json');const set=fs.existsSync(setp)?fs.readFileSync(setp,'utf8'):null;
    const {p,ctx,errs}=await open(b,'desktop',15,{save,set,wait:7000});
    const r=await p.evaluate(()=>{const M=window.__mocha,S=M.S,fx=JSON.parse(localStorage.getItem('i4fix'));const J=JSON.stringify,eqp=(a,b)=>J((a||[]).slice(0,(b||[]).length))===J(b||[]);
      const miss=Object.keys(fx).filter(k=>!(k in S));const yk=Object.keys(fx.you||{}).filter(k=>!(k in (S.you||{})));
      const txt=(fx.texts||[]).every(t=>(S.texts||[]).some(u=>u.t===t.t&&u.text===t.text));const dia=(fx.diary||[]).every(e=>S.diary.some(d=>d.t===e.t&&d.text===e.text));
      const set=localStorage.getItem('mocha-settings');let st=null;try{st=M.homeItems()}catch(e){}
      return{v:S.v,mig:M.mig&&M.mig(),miss,yk,dia,nd:[fx.diary.length,S.diary.length],txt,coins:[fx.coins,S.coins],ycoins:[fx.you&&fx.you.coins,S.you.coins],home:J(S.you.home)===J(fx.you.home),look:eqp(S.you.look,fx.you.look),
        xp:[fx.xp,S.xp],disc:(fx.discovered||[]).every(d=>S.discovered.includes(d)),pets:J(S.pets||null)===J(fx.pets||null),paint:(fx.paintings||[]).every(a=>(S.paintings||[]).some(b=>b.id===a.id)),
        hi:!fx.homeItems||J(S.homeItems)===J(fx.homeItems),v2fresh:!!S.v2fresh,furn:st&&st.furnVis,nestOn:st&&st.on,wend:M.bond('wendell'),fw:fx.friendW,bak:!!localStorage.getItem('mocha-v1-backup'),set:!!set}});
    const good=r.v===2&&r.mig&&r.mig.ok&&!r.miss.length&&!r.yk.length&&r.dia&&r.txt&&r.coins[0]===r.coins[1]&&r.ycoins[0]===r.ycoins[1]&&r.home&&r.look&&r.disc&&r.pets&&r.paint&&r.hi&&!r.v2fresh&&r.furn&&!r.nestOn&&r.bak;
    ok(good,`${nm} save: v2, every key kept, diary ${r.nd.join('->')}, texts, coins ${r.coins.join('=')}/${r.ycoins.join('=')}, cabin, look, paintings, homeItems, furnished house (no nest)`,r);
    ok(!errs.length,`${nm} save: no page errors`,errs.slice(0,5));await ctx.close()}}
await b.close();console.log(`\nINT4: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)})().catch(e=>{console.error('FATAL',e);process.exit(1)});

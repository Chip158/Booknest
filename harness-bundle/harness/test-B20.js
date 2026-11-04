// B20 Sound A acceptance: node /tmp/harness/test-B20.js  (prefix NODE_OPTIONS/MOCHA_FILE to test a track copy)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const spies=()=>{window.__acN=0;const A=window.AudioContext;if(A)window.AudioContext=class extends A{constructor(...a){super(...a);window.__acN++}};
  window.__iv=new Set();const si=window.setInterval,ci=window.clearInterval;window.setInterval=function(...a){const h=si.apply(this,a);window.__iv.add(h);return h};window.clearInterval=function(h){window.__iv.delete(h);return ci.call(this,h)};
  try{Object.defineProperty(navigator,'audioSession',{value:{type:'auto'},configurable:true})}catch(e){}
  window.__hide=on=>{Object.defineProperty(document,'hidden',{get:()=>on,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>on?'hidden':'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))}};
let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,400):''));if(!c)fails++};
const wait=ms=>new Promise(r=>setTimeout(r,ms));
async function open(b,vp,mobile,h=15){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.addInitScript(spies);
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return{ctx,p,errs}}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const {ctx,p,errs}=await open(b,{width:393,height:852},true);
  // 1. no context before the first tap; running after; hidden suspends within 1 s and clears every audio timer
  let r=await p.evaluate(()=>({n:window.__acN,a:__mocha.audio()}));ok(r.n===0&&!r.a.ctx&&r.a.state==='none','no AudioContext before the first tap',r.n);
  ok(r.a.session==='auto','audioSession untouched before a gesture',r.a.session);
  await p.tap('canvas',{position:{x:200,y:520}});await p.waitForTimeout(1200);
  r=await p.evaluate(()=>({n:window.__acN,a:__mocha.audio(),iv:window.__iv.size}));ok(r.n===1&&r.a.state==='running'&&r.a.timers>=1,'after a tap: one context, running, audio timer live',{n:r.n,state:r.a.state,timers:r.a.timers});
  ok(r.a.session==='playback',"audioSession is 'playback' with sound on",r.a.session);
  const iv0=r.iv;const t0=Date.now();await p.evaluate(()=>window.__hide(true));await p.waitForTimeout(250);
  r=await p.evaluate(()=>({a:__mocha.audio(),iv:window.__iv.size}));ok(r.a.state==='suspended'&&r.a.timers===0&&r.iv<=iv0-1,'hidden: suspended within 1 s, every audio timer cleared',{state:r.a.state,timers:r.a.timers,iv:[iv0,r.iv],ms:Date.now()-t0});
  await p.evaluate(()=>window.__hide(false));await p.waitForTimeout(600);r=await p.evaluate(()=>__mocha.audio());ok(r.state==='running'&&r.timers>=1,'visible again: running with its timers back',{state:r.state,timers:r.timers});
  // speaker pill: tap cycles on > quiet > off (off truly suspends) > on
  await p.click('.spk');await p.waitForTimeout(300);r=await p.evaluate(()=>__mocha.audio());ok(r.mode==='quiet','speaker tap: quiet',r.mode);
  await p.click('.spk');await p.waitForTimeout(500);r=await p.evaluate(()=>__mocha.audio());ok(r.mode==='muted'&&r.state==='suspended'&&r.timers===0,'speaker tap: off suspends the context',{mode:r.mode,state:r.state,timers:r.timers});
  await p.click('.spk');await p.waitForTimeout(600);r=await p.evaluate(()=>__mocha.audio());ok(r.mode==='on'&&r.state==='running','speaker tap: back on',{mode:r.mode,state:r.state});
  // 2. the mix toggle switches the session to 'ambient' (Settings > Sound, opened by long-press)
  await p.evaluate(()=>{const e=__mocha.SPK,o={bubbles:true,pointerId:1,isPrimary:true};e.dispatchEvent(new PointerEvent('pointerdown',o))});await p.waitForTimeout(800);
  await p.evaluate(()=>{const e=__mocha.SPK;e.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));e.click()});await p.waitForTimeout(600);
  r=await p.evaluate(()=>({sheet:!!document.querySelector('#sndSet'),open:!document.querySelector('#panel').classList.contains('hidden'),mode:__mocha.audio().mode,hud:__mocha.hud()}));
  ok(r.sheet&&r.open&&r.mode==='on','long-press opens the sound sheet (and does not cycle the mode)',{sheet:r.sheet,open:r.open,mode:r.mode});
  ok(!r.hud.overlaps.some(o=>o.includes('speaker')),'portrait: speaker pill clear of the open sound sheet',r.hud.overlaps);
  await p.evaluate(()=>{const t=document.querySelector('[data-sndt="mix"]');t.checked=true;t.dispatchEvent(new Event('change',{bubbles:true}))});await p.waitForTimeout(200);
  r=await p.evaluate(()=>__mocha.audio());ok(r.session==='ambient'&&r.snd.mix===true,"mix toggle: audioSession 'ambient'",r.session);
  await p.evaluate(()=>{const t=document.querySelector('[data-sndt="mix"]');t.checked=false;t.dispatchEvent(new Event('change',{bubbles:true}));const s=document.querySelector('[data-snd="mu"]');s.value=55;s.dispatchEvent(new Event('input',{bubbles:true}));s.dispatchEvent(new Event('change',{bubbles:true}))});
  r=await p.evaluate(()=>__mocha.audio());ok(r.session==='playback'&&r.snd.mu===55,'mix off: playback again; music slider set to 55',{s:r.session,mu:r.snd.mu});
  await p.evaluate(()=>document.querySelector('#closePanel').click());await p.waitForTimeout(300);
  // 3. a door: creak + café bell (DOOREV spy); coins jingle; 30 one-shots stay within the voice caps
  r=await p.evaluate(async()=>{const M=__mocha,sp={},em=M.DOOREV.emit;M.DOOREV.emit=function(t,d){sp[t]=(sp[t]||0)+1;return em.call(this,t,d)};const d=M.doors().find(x=>x.id==='cafe');
    M.audio({lis:[d.x!=null?d.x:d.wx,(d.z!=null?d.z:d.wz)+2],reset:1});M.door('cafe','close');M.doorStep(2);M.door('cafe','open');M.doorStep(.5);await new Promise(r=>setTimeout(r,300));const a=M.audio();M.door('cafe','auto');M.DOOREV.emit=em;return{sp,st:a.stats,d}});
  ok((r.sp.open||0)>=1&&(r.sp.bell||0)>=1&&(r.st['p:creak']||0)>=1&&(r.st['p:bell']||0)>=1,'cafe door: DOOREV open+bell, creak and bell played',{sp:r.sp,creak:r.st['p:creak'],bell:r.st['p:bell']});
  r=await p.evaluate(async()=>{const M=__mocha;M.coins(M.S.coins+5);await new Promise(r=>setTimeout(r,400));return M.audio().stats});ok((r['p:coin']||0)>=1,'earning coins plays the coin sound',r['p:coin']);
  r=await p.evaluate(async()=>{const M=__mocha;let mx=0;M.audio({stress:30});for(let i=0;i<10;i++){const a=M.audio().live;mx=Math.max(mx,a.total);if(a.sfx>4||a.voices>2||a.music>8)mx=99;await new Promise(r=>setTimeout(r,60))}return{mx,live:M.audio().live}});
  ok(r.mx<=14,'30 one-shots: live voices stay at 14 or fewer (music 8, sfx 4, voices 2)',r);
  // 4. babble: kSay within 25 and on screen plays; far away does not; texts never babble
  r=await p.evaluate(async()=>{const M=__mocha,K=M.KEEPERS.find(k=>k.id==='juniper'&&k.obj.visible)||M.KEEPERS.find(k=>k.obj.visible);const v=new M.camera.position.constructor();K.obj.getWorldPosition(v);
    M.cam.push('t20',{prio:3,tx:v.x,ty:v.y+1,tz:v.z,dist:9,pitch:.45,lock:1});M.cam({tx:v.x,ty:v.y+1,tz:v.z,dist:9,pitch:.45});if(M.cam.tick)M.cam.tick(80,.1);await new Promise(r=>setTimeout(r,900));M.audio({lis:[v.x,v.z+3],reset:1});
    M.kSay(K,'hello there! want a latte?');const a1=M.audio().stats;M.audio({lis:[v.x+80,v.z+80]});M.kSay(K,'still here?');const a2=M.audio().stats;M.audio({lis:[v.x,v.z+3]});
    M.txAdd('him','are you around? i found a cool rock');await new Promise(r=>setTimeout(r,250));M.txAdd('me','yes!');await new Promise(r=>setTimeout(r,400));const a3=M.audio().stats;M.cam.pop('t20');return{k:K.id,ok1:a1.babOk||0,far:a2['bab:far']||0,ok2:a2.babOk||0,ok3:a3.babOk||0,txIn:a3['p:textIn']||0,txOut:a3['p:textOut']||0,why:a1}});
  ok(r.ok1===1,'kSay within 25 and on screen babbles',{k:r.k,ok1:r.ok1,why:r.why});ok(r.far===1&&r.ok2===1,'kSay beyond 25 does not babble',r);ok(r.ok3===1&&r.txIn>=1,'texts never babble (they chime instead)',r);
  r=await p.evaluate(()=>[__mocha.babble('mocha','hmm... 👻 okay!'),__mocha.babble('otis','hello?',{force:1,x:__mocha.zone().listener[0],z:__mocha.zone().listener[1]})]);ok(r[0]&&r[1]&&r[1].ok===1,'babble hook (generated voice for a new keeper)',r);
  // 5. forced rain: the rain bed plays, filtered indoors (LP 600 + roof ticks); LOW keeps only the rain bed
  r=await p.evaluate(async()=>{const M=__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.weather('rain');M.audio({lis:[0,2]});await sl(1800);const out=M.zone();
    const d=M.doors().find(x=>x.id==='cafe');const c=M.byId.cafe;M.audio({lis:[c.x,c.z]});await sl(1800);const ins=M.zone();M.audio({tier:'LOW'});await sl(2600);const low=M.zone();M.audio({tier:null,lis:null});return{out,ins,low}});
  ok(r.out.rain&&r.out.rain.lvl>0&&r.out.rain.lp===1800&&!r.out.rain.inside&&r.out.beds.includes('rain'),'forced rain outdoors: rain bed (LP 1.8k)',r.out);
  ok(r.ins.rain&&r.ins.rain.lvl>0&&r.ins.rain.lp===600&&r.ins.rain.inside&&r.ins.rain.roof,'indoors: rain filtered to LP 600 with roof ticks',r.ins);
  ok(r.low.beds.length===1&&r.low.beds[0]==='rain','LOW tier keeps only the rain bed',r.low.beds);
  // 6. sliders persist across a reload
  await p.reload();await p.waitForTimeout(4000);r=await p.evaluate(()=>__mocha.audio());ok(r.snd.mu===55&&!r.ctx,'settings persist (music 55) and no context after reload until a tap',{mu:r.snd.mu,ctx:r.ctx});
  await p.evaluate(()=>{const M=__mocha;M.audio({});});
  ok(errs.length===0,'portrait: no page errors',errs);await ctx.close();
  // speaker pill and sound sheet: no overlap in the other viewports
  for(const [n,vp,mob] of [['landscape',{width:852,height:393},true],['duo',{width:900,height:1000},true],['desktop',{width:1100,height:820},false]]){const o=await open(b,vp,mob);
    let h=await o.p.evaluate(()=>__mocha.hud());const s1=h.slots.find(s=>s.id==='speaker');ok(s1&&s1.on&&(s1.r||s1.folded)&&!h.overlaps.some(x=>x.includes('speaker')),n+': speaker pill placed, no overlap',{r:s1&&s1.r,folded:s1&&s1.folded,ov:h.overlaps});
    await o.p.evaluate(()=>__mocha.sndSheet());await o.p.waitForTimeout(1500);await o.p.evaluate(()=>__mocha.HUD.layout());h=await o.p.evaluate(()=>({h:__mocha.hud(),vis:(()=>{const e=document.querySelector('#sndSet');if(!e)return 0;const r=e.getBoundingClientRect();return r.height>0})()}));
    ok(h.vis&&!h.h.overlaps.some(x=>x.includes('speaker')),n+': sound sheet open, speaker clear of it',{ov:h.h.overlaps,sp:(h.h.slots.find(s=>s.id==='speaker')||{}).r});
    if(n==='landscape')await o.p.screenshot({path:'/tmp/harness/b20/shots/landscape-sheet.png'});
    ok(o.errs.length===0,n+': no page errors',o.errs);await o.ctx.close()}
  await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

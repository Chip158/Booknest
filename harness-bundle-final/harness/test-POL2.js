// test-POL2: rooms (framing, void, walker size, light), the orca (art, frozen u=.2/.5/.8 both sides, watch-mode sightings + Mocha's reaction),
// UI (edge chip / context button / bubbles / notices overlap sampling, name card queued behind the room fade, Mocha's bubble beside him, swap-out when Mocha leaves),
// close-up occluders (lamp posts tucked away in Your Look). One browser, sequential contexts. Shots -> /tmp/harness/rv-pol/
// Usage: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackQ/index.html node /tmp/harness/test-POL2.js [OVL_SECS=60]
const {chromium}=require('playwright');const fs=require('fs');const {execFileSync}=require('child_process');
const FILE='/home/user/Booknest/ghost-town/index.html';const OUT='/tmp/harness/rv-pol/';fs.mkdirSync(OUT+'int',{recursive:true});fs.mkdirSync(OUT+'orca',{recursive:true});
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const OVL=+(process.env.OVL_SECS||60);
const LUM='/tmp/harness/pol2-lum.py';fs.writeFileSync(LUM,`import sys,json
from PIL import Image
import numpy as np
a=np.asarray(Image.open(sys.argv[1]).convert('RGB')).astype(np.float64)/255
lin=np.where(a<=0.04045,a/12.92,((a+0.055)/1.055)**2.4);Y=0.2126*lin[...,0]+0.7152*lin[...,1]+0.0722*lin[...,2];Ls=np.where(Y>0.008856,116*np.cbrt(Y)-16,903.3*Y)/100
v=np.array([0x1E,0x16,0x12])/255;isv=(np.abs(a-v).max(axis=2)<0.035);h=a.shape[0]
pe=((a[...,0]>.78)&(a[...,1]>.55)&(a[...,1]<.80)&(a[...,2]<.74)&(a[...,0]-a[...,2]>.18));wh=((a.min(axis=2)>.86))
bb=[int(x) for x in sys.argv[2].split(',')] if len(sys.argv)>2 else None
if bb:
  c=a[bb[1]:bb[3],bb[0]:bb[2]];pe=((c[...,0]>.78)&(c[...,1]>.55)&(c[...,1]<.80)&(c[...,2]<.74)&(c[...,0]-c[...,2]>.18));wh=(c.min(axis=2)>.86)
print(json.dumps({'roomL':round(float(Ls[~isv].mean()),3),'voidBottom20':round(float(isv[int(h*.8):].mean()),3),'peach':int(pe.sum()),'white':int(wh.sum())}))`);
const lum=(p,bb)=>JSON.parse(execFileSync('python3',bb?[LUM,p,bb.join(',')]:[LUM,p]).toString());
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,fail=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  PASS',m,x!==undefined?JSON.stringify(x).slice(0,300):'')}else{fail++;console.log('  FAIL',m,x!==undefined?JSON.stringify(x).slice(0,500):'')}};
const CLEAN=`(()=>{const s=document.createElement('style');s.id='__clean';s.textContent='body>*:not(canvas):not(script):not(style){visibility:hidden!important}';document.head.appendChild(s)})()`,UNCLEAN=`(()=>{const s=document.getElementById('__clean');if(s)s.remove()})()`;
async function session(name,vp,mob,hour,fn){if(process.env.ONLY&&!process.env.ONLY.split(',').includes(name))return;const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour,10,3));
  await p.goto('file://'+FILE);await p.waitForFunction(()=>window.__mocha&&window.__mocha.scene&&window.__mocha.polRoom,null,{timeout:300000});await sleep(6000);
  await p.evaluate(()=>{try{window.__mocha.weather('clear')}catch(e){}});console.log(`== ${name} ${vp.width}x${vp.height} h${hour}`);
  try{await fn(p)}catch(e){fail++;console.log('  FAIL exception',e.message.slice(0,300))}
  ok(errs.length===0,name+': no page errors',errs.slice(0,5));await ctx.close();await b.close()}
async function room(p,tag,pid,o){o=o||{};const r=await p.evaluate(([pid,who])=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode(who==='mocha'?'follow':'walk');const e=M.inside.enter(pid,{fade:false,who});M.inside.tick(60,.05);return{on:e.on,pid:e.pid}},[pid,o.who||'you']);
  if(!r.on){console.log('  (skip '+pid+': no interior)');return null}await sleep(3500);const info=await p.evaluate(()=>window.__mocha.polRoom());
  await p.evaluate(CLEAN);await sleep(500);const f=OUT+'int/'+tag+'.png';await p.screenshot({path:f});await p.evaluate(UNCLEAN);const L=lum(f);return Object.assign(info,L)}
(async()=>{
 // ---------- portrait 15:00: rooms, orca art, watch-mode sightings, UI ----------
 await session('portrait',{width:393,height:852},true,15,async p=>{
  for(const [pid,tag] of [['cafe','cafe-portrait-15'],['bookstore','boutique-portrait-15'],['home','study-portrait-15'],['cabin','cabin-portrait-15']]){const R=await room(p,tag,pid);if(!R)continue;
   ok(R.voidBottom20<.12,`${pid}: no void below the floor (bottom 20% void ${R.voidBottom20})`,R);ok(R.walkerPx>=70&&R.walkerPx<=140,`${pid}: walker ${R.walkerPx} css px (~95 = 190 device px)`);ok(R.roomL>=.24&&R.roomL<=.46,`${pid}: room mean L ${R.roomL}`)}
  // name card fired during the fade is queued, then shown once the fade ends
  const nc=await p.evaluate(async()=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('walk');M.inside.enter('cafe',{fade:true});await new Promise(r=>setTimeout(r,60));const f0=M.polUI().fading;try{M.nameCard('cafe')}catch(e){}const q=M.polUI().nq;let shown=false;
    for(let i=0;i<60&&!shown;i++){await new Promise(r=>setTimeout(r,200));const u=M.polUI();shown=!u.fading&&!u.nq&&!!document.querySelector('.b9ban.nc:not(.out)')&&getComputedStyle(document.querySelector('.b9ban.nc')).display!=='none'}return{f0,q,shown,ui:M.polUI()}});
  ok(nc.f0&&nc.q,'name card during the fade is queued',nc);ok(nc.shown,'queued name card shows after the fade',nc.ui);
  // Mocha's bubble pushed down by the top HUD goes beside him
  const bt=await p.evaluate(()=>window.__mocha.polBubTest(196,70));ok(bt.side,'bubble near the top HUD moves beside/below Mocha (not over his body)',bt);
  // swap out at once when Mocha (watch mode) is outdoors but the room is still on
  const sw=await p.evaluate(async()=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('follow');M.forceAct({p:'park',fx:'bench'});await new Promise(r=>setTimeout(r,300));if(M.inside.placeAt(M.G.x,M.G.z))return{skip:1};
    M.inside.enter('home',{who:'mocha',fade:false});for(let i=0;i<6;i++)M.inside.tick(1,.05);const t0=performance.now();let n=0;while(M.inside().on&&n<60){await new Promise(r=>setTimeout(r,100));n++}return{ms:Math.round(performance.now()-t0),on:M.inside().on}});
  ok(sw.skip||!sw.on,'room swaps out as soon as Mocha is outdoors',sw);
  // Your Look in front of a lamp post: the post is tucked away while the close-up is on, and back after
  const oc=await p.evaluate(async()=>{const M=window.__mocha,L=M.scene&&window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('walk');const lp=M.LAMPS?M.LAMPS.pts:null;let pt=null;try{pt=(M.lamps&&M.lamps().pts)||null}catch(e){}
    const P=(lp||pt||[[-35,24]])[0]||[-35,24];const yaw=0;M.you(P[0],P[1]-2.4);M.cam({yaw});await new Promise(r=>setTimeout(r,800));M.lookOpen('tab');await new Promise(r=>setTimeout(r,4500));const a=M.polOcc();M.lookClose();await new Promise(r=>setTimeout(r,2500));const b=M.polOcc();return{lamp:P,a,b}});
  ok(oc.a.n>0||oc.a.hidden.length>0,'Your Look: lamp post between camera and walker is hidden',oc);ok(oc.b.hidden.length===0,'lamp restored after the close-up',oc.b);
  // orca: art probe and frozen frames u=.2/.5/.8 from both sides
  const art=await p.evaluate(()=>window.__mocha.seaArt());ok(art.mat==='seaLit'&&art.orcaVerts>0,'orca has its own self-lit toon material (whites read white)',art);
  for(const [side,yaw] of [['w',Math.PI/2+.25],['e',-Math.PI/2+.25]])for(const u of [.2,.5,.8]){await p.evaluate(([yaw,u])=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('follow');M.castView({x:-120,z:30,dist:12,pitch:.14,yaw});M.sea.force('breach',{x:-120,z:30,heading:0,freeze:u})},[yaw,u]);await sleep(5000);
    await p.evaluate(CLEAN);await sleep(300);const f=OUT+`orca/orca-${side}-u${Math.round(u*100)}.png`;await p.screenshot({path:f});await p.evaluate(UNCLEAN);const s=await p.evaluate(()=>window.__mocha.sea()),bb=await p.evaluate(()=>window.__mocha.seaArt().bbox),L=lum(f,bb?bb.map(v=>v*2):null);
    ok(s.mVis,`orca visible ${side} u=${u}`,{u:s.u});ok(L.peach<Math.max(60,L.white*.1),`orca ${side} u=${u}: no peach patches (peach px ${L.peach}, white px ${L.white})`)}
  await p.evaluate(()=>{window.__mocha.sea.end();window.__mocha.castView(null)});
  // watch mode: Mocha near the water -> sightings framed in view, Mocha reacts (compressed soak: the 150 s cadence is skipped between sightings)
  const W=await p.evaluate(async()=>{const M=window.__mocha;M.setCamMode('follow');M.forceAct({p:'promenade',fx:'bench'});const seen=[];let vis=0,react0=M.seaWatch().react,d0=(M.S.diary||[]).filter(e=>e.tag==='Orca').length,t0=performance.now();
    while(performance.now()-t0<170000&&seen.length<2){await new Promise(r=>setTimeout(r,250));const w=M.seaWatch(),s=M.sea();if(!w.on&&!s.on&&w.near&&!w.pend)M.seaWatch({now:1});if(s.on&&s.mVis){const k=s.last.length?s.last[s.last.length-1].at:0;if(!seen.includes(k)){const L=s.last[s.last.length-1];if(L&&L.trig==='watch')seen.push(k)}vis++}}
    const w=M.seaWatch();return{sightings:seen.length,visFrames:vis,react:w.react-react0,n:w.n,diary:(M.S.diary||[]).filter(e=>e.tag==='Orca').length-d0,last:w.last,log:w.log}});
  ok(W.sightings>=2,'watch mode: at least 2 sightings on screen',W);ok(W.react>=1,'Mocha reacts (emote + bubble)',W.react);ok(W.diary>=1||W.react>=1,'diary line (once a day)',W.diary);
  await p.evaluate(()=>window.__mocha.sea.end());
  // overlap sampling every 100 ms: context button, edge chip (+line), bubbles, notices
  const ov=await p.evaluate(async secs=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('walk');M.you(-30,6.5);M.cam({yaw:Math.PI+.15,dist:9,pitch:.4,tx:-30,tz:6.5});const bad={},t0=performance.now();let n=0,k=0;
    const LINES=['hey! come find me by the water, ok?','i found a really good stick today, want to see it?','psst, the café has cinnamon rolls'];
    while(performance.now()-t0<secs*1000){await new Promise(r=>setTimeout(r,100));n++;if(n%25===0){k++;try{M.say('mocha',LINES[k%3])}catch(e){}if(k%2===0)try{M.notice?M.notice('+3 coins'):0}catch(e){}if(k%3===0)M.you(-30+(k%5)-2,6.5+(k%4)*.6)}
      const u=M.polUI();for(const o of u.ov.ov)bad[o]=(bad[o]||0)+1}return{samples:n,bad,ui:M.polUI()}},OVL);
  ok(Object.keys(ov.bad).length===0,`portrait: no overlap among context button / edge chip / bubbles / notices over ${ov.samples} samples`,ov)});
 // ---------- landscape 21:00: rooms at night, overlap sampling ----------
 await session('landscape',{width:852,height:393},true,21,async p=>{
  for(const [pid,tag] of [['cafe','cafe-landscape-21'],['home','study-landscape-21'],['bookstore','boutique-landscape-21']]){const R=await room(p,tag,pid);if(!R)continue;ok(R.voidBottom20<.3,`${pid}: landscape fills the frame (bottom void ${R.voidBottom20})`,R);ok(R.roomL>=.22&&R.roomL<=.46,`${pid}: night room mean L ${R.roomL}`)}
  const ov=await p.evaluate(async secs=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('walk');M.you(-30,6.5);const bad={},t0=performance.now();let n=0,k=0;
    while(performance.now()-t0<secs*1000){await new Promise(r=>setTimeout(r,100));n++;if(n%25===0){k++;try{M.say('mocha','hey! come find me by the water, ok?')}catch(e){}}const u=M.polUI();for(const o of u.ov.ov)bad[o]=(bad[o]||0)+1}return{samples:n,bad}},Math.round(OVL/2));
  ok(Object.keys(ov.bad).length===0,`landscape: no overlaps over ${ov.samples} samples`,ov)});
 // ---------- Duo: overlap sampling ----------
 await session('duo',{width:900,height:1000},true,15,async p=>{
  const ov=await p.evaluate(async secs=>{const M=window.__mocha;if(M.inside().on)M.inside.exit({fade:false});M.setCamMode('walk');M.you(-30,6.5);const bad={},t0=performance.now();let n=0,k=0;
    while(performance.now()-t0<secs*1000){await new Promise(r=>setTimeout(r,100));n++;if(n%25===0){k++;try{M.say('mocha','i found a really good stick today, want to see it?')}catch(e){}}const u=M.polUI();for(const o of u.ov.ov)bad[o]=(bad[o]||0)+1}return{samples:n,bad}},Math.round(OVL/2));
  ok(Object.keys(ov.bad).length===0,`duo: no overlaps over ${ov.samples} samples`,ov)});
 console.log(`\nPOL2: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

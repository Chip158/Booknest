// LF4 "High and Ultra graphics tiers" acceptance through window.__mocha hooks.
// node /tmp/harness/test-LF4.js [parts=parity,desk,gl1,saved,settings]   (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...)
// BASE=<start file> enables the post-shader half of T1 (the start file's post fragment shader is rendered on the same frozen frame and compared pixel by pixel).
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const URL='file:///home/user/Booknest/ghost-town/index.html';
const timeAt=(h,mo=10,d=3)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${mo},${d});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const PARTS=(process.argv[2]||'parity,desk,gl1,saved,settings').split(',');let pass=0,fail=0;
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg,r!==undefined?JSON.stringify(r).slice(0,300):'')}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1200))}};
const SHOT='/tmp/harness/b27s/shots/lf4';fs.mkdirSync(SHOT,{recursive:true});
let OLDFS=null;if(process.env.BASE){const s=fs.readFileSync(process.env.BASE,'utf8'),i=s.indexOf('const post=new THREE.ShaderMaterial('),j=s.indexOf('fragmentShader:`',i)+16,k=s.indexOf('`,depthTest:false',j);OLDFS=s.slice(j,k)}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vn,{hour=15,q='',init=null,ls=null}={})=>{const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:vn==='big'?{width:2560,height:1440}:{width:1100,height:820},mob=vn==='portrait'||vn==='landscape';
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(150000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));
  if(ls)await p.addInitScript(o=>{if(!sessionStorage.getItem('lf4seed')){sessionStorage.setItem('lf4seed','1');for(const k in o)localStorage.setItem(k,typeof o[k]==='string'?o[k]:JSON.stringify(o[k]))}},ls);
  if(init)await p.addInitScript(init);
  await p.goto(URL+q);await p.waitForFunction(()=>window.__mocha&&window.__mocha.tier&&window.__mocha.tier().f&&window.__mocha.lf4dbg().TIER.applied,null,{timeout:150000});await p.waitForTimeout(2500);
  // merge (LF1): watch mode may follow Mocha indoors at boot (room void, far plane); these are outdoor checks, so send him to an outdoor activity first (test harness only)
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct({p:'promenade'})});for(let k=0;k<60;k++){if(await p.evaluate(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'}))break;await p.waitForTimeout(250)}await p.waitForTimeout(1000);
  return{ctx,p,errs,E:f=>p.evaluate(f),EA:(f,a)=>p.evaluate(f,a)}};
const frames=(p,n)=>p.evaluate(n=>new Promise(r=>{let k=0,mx=0,t=performance.now();const f=()=>{const q=performance.now();mx=Math.max(mx,q-t);t=q;if(++k>=n)r(mx);else requestAnimationFrame(f)};requestAnimationFrame(f)}),n);

if(PARTS.includes('parity')){for(const hour of [15,21]){console.log('== T1 PHONE parity, portrait',hour+':00');const {ctx,p,errs,E,EA}=await open('portrait',{hour});
  let r=await E(()=>{const M=window.__mocha,t=M.tier();return{n:t.n,name:t.name,auto:t.auto,f:t.f,post:M.post(),rt:t.rt,gfx:M.gfx(),saver:t.saver}});
  ok(r.n===1&&r.name==='phone'&&r.auto&&r.rt==='base'&&r.post.taps===6&&r.post.dither===0&&r.post.fxaa===0&&r.f.dens===1&&r.f.far===1&&r.f.shadow.size===2048&&!r.saver,'PHONE on SwiftShader: today\'s target, 6-tap band, no dither/FXAA, dens 1, far 1, 2048 shadows',r);
  r=await E(()=>{const D=window.__mocha.lf4dbg();return{pr:D.renderer.getPixelRatio(),far:D.camera.far,fogN:D.scene.fog.near,shadow:D.renderer.shadowMap.type,cast:!!D.scene.children.find(o=>o.isDirectionalLight&&o.castShadow),bend:null}});
  ok(r.pr<=1.5&&r.pr>=1&&r.far===1200&&r.cast,'PHONE live values equal today (PR min(DPR,1.5) on touch, camera.far 1200, sun casts)',r);
  // the post shader on the same frozen frame: the PHONE path of the new shader vs the start file's shader
  if(OLDFS){r=await EA(fs0=>{const M=window.__mocha;M.freeze(true);const D=M.lf4dbg(),R=D.renderer,gl=R.getContext(),T=D.TIER;const q=D.postScene.children[0];const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight;
      const read=()=>{const a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);return a};
      R.setRenderTarget(T.rt||D.rt);R.render(D.scene,D.camera);R.setRenderTarget(null);R.render(D.postScene,D.postCam);const A=read();
      const om=new THREE.ShaderMaterial({uniforms:D.post.uniforms,vertexShader:D.post.vertexShader,fragmentShader:fs0,depthTest:false,depthWrite:false});const keep=q.material;q.material=om;R.render(D.postScene,D.postCam);const B=read();q.material=keep;om.dispose();
      let bad=0,mx=0;for(let i=0;i<A.length;i+=4){let d=0;for(let c=0;c<3;c++)d=Math.max(d,Math.abs(A[i+c]-B[i+c]));mx=Math.max(mx,d);if(d>1)bad++}return{px:w*h,bad,frac:bad/(w*h),maxDiff:mx,ts:D.post.uniforms.ts.value}},OLDFS);
    ok(r.frac<=.001,`post pass at PHONE vs the start file's shader on the same frame: ${(100-r.frac*100).toFixed(3)}% of pixels within 1/255 (max diff ${r.maxDiff})`,r)}
  // round trip PHONE -> ULTRA -> HIGH -> PHONE: draws, tris, programs, textures, target back to PHONE's; same frozen frame within 1/255
  r=await E(async()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,gl=R.getContext(),w=ms=>new Promise(r=>setTimeout(r,ms));M.freeze(true);await w(1200);
    const snap=()=>{D.scene.traverse(o=>{if(o.isDirectionalLight&&o.castShadow)o.shadow.needsUpdate=true});/* lf-fix1: LF3's night shadow freeze (2 Hz) now holds, so refresh the map for each snap */R.setRenderTarget(D.TIER.rt||D.rt);R.info.autoReset=false;R.info.reset();R.render(D.scene,D.camera);const calls=R.info.render.calls,tris=R.info.render.triangles;R.info.autoReset=true;R.setRenderTarget(null);R.render(D.postScene,D.postCam);const a=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,a);return{calls,tris,progs:R.info.programs.length,tex:R.info.memory.textures,geo:R.info.memory.geometries,a,pr:R.getPixelRatio(),rt:M.tier().rt}};
    M.tier(1);await w(1200);const s0=snap();M.tier(3);const sU=snap(),u=M.tier();M.tier(2);const sH=snap();M.tier(1);const s1=snap();// synchronous: no frame() runs between the snaps, so only the tier switches can differ
    let bad=0;for(let i=0;i<s0.a.length;i+=4){if(Math.abs(s0.a[i]-s1.a[i])>1||Math.abs(s0.a[i+1]-s1.a[i+1])>1||Math.abs(s0.a[i+2]-s1.a[i+2])>1)bad++}
    const st=x=>({calls:x.calls,tris:x.tris,progs:x.progs,tex:x.tex,pr:x.pr,rt:x.rt});return{before:st(s0),ultraSnap:st(sU),highSnap:st(sH),after:st(s1),bad,frac:bad/(s0.a.length/4),ultra:{n:u.n,f:u.f}}});
  r.pqProgs=await E(()=>{const t=window.__mocha.tier();return t.pq?t.pq.progs:0});// POL3: HIGH/ULTRA's pass programs (made on the first visit, kept so later switches link nothing) are allowed; PHONE's own programs are unchanged
  ok(r.before.calls===r.after.calls&&r.before.tris===r.after.tris&&r.after.progs-r.before.progs<=r.pqProgs&&r.before.pr===r.after.pr&&r.after.rt==='base','PHONE -> ULTRA -> HIGH -> PHONE: draws, tris, programs (+ POL3 pass programs only), PR and the base target unchanged',r);
  ok(r.after.tex<=r.before.tex+1,'textures after the round trip: PHONE + at most the cached 64x64 blue-noise tile',{before:r.before.tex,after:r.after.tex});
  ok(r.frac<=.001,`same frozen frame after the round trip: ${(100-r.frac*100).toFixed(3)}% within 1/255`,{bad:r.bad,frac:r.frac});
  await p.screenshot({path:`${SHOT}/phone-follow-h${hour}.png`});
  ok(!errs.length,'no page errors',errs);await ctx.close()}}

if(PARTS.includes('desk')){console.log('== desktop 1100x820: T2 ULTRA, HIGH, T4 guess, T6 ADAPT, T8 gating, T9 switch, T10 memory');const {ctx,p,errs,E}=await open('desktop');
  let r=await E(()=>{const M=window.__mocha;return{progs:M.lf4dbg().renderer.info.programs.length,t:M.tier()}});const p0=r.progs;
  ok(r.t.n===1&&r.t.guess===1&&r.t.caps.soft,'software GL guesses PHONE',{n:r.t.n,guess:r.t.guess,renderer:r.t.caps.renderer});
  // T2 ULTRA
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const t0=performance.now();const t=M.tier(3);const ms=performance.now()-t0;await w(300);return{ms:+ms.toFixed(1),t,post:M.post(),gfx:M.gfx()}});
  const f=r.t.f;ok(r.t.n===3&&f.pr>=1.5&&f.msaa>=4&&f.shadow.size===4096&&f.ts===16&&f.dens===2&&f.far===1.6&&(f.ao==='blob'||f.ao==='sao')&&(f.bloom==='glowpts'||f.bloom==='mip'),'T2 ULTRA features: pr>=1.5, msaa>=4, shadow 4096, ts 16, dens 2, far 1.6, ao/bloom as built',f);
  const mx=await frames(p,120);r=await E(()=>{const M=window.__mocha,D=M.lf4dbg();return{gl:D.renderer.getContext().getError(),progs:D.renderer.info.programs.length,shadow:D.scene.children.find(o=>o.isDirectionalLight&&o.castShadow).shadow.mapSize.x,far:D.camera.far,fail:M.tier().fail,rt:M.tier().rt,gfx:M.gfx(),post:M.post()}});
  ok(r.gl===0&&!r.fail.length,'T2 gl.getError() 0 after 120 ULTRA frames, no feature failures',r);ok(r.progs-p0<=6,`T2 programs +${r.progs-p0} (<= 6)`,{p0,p1:r.progs});
  ok(r.shadow===4096&&r.far===1920&&r.rt==='msaa'&&r.post.taps===16&&r.post.dither===1&&r.post.ts===1,'ULTRA live: 4096 map, camera.far 1920, MSAA target, 16 taps, dither on, ts 1',r);
  ok(typeof r.gfx.drawnMP==='number'&&typeof r.gfx.rtMB==='number'&&r.gfx.tier===3,'gfx() gains tier, drawnMP and rtMB',{tier:r.gfx.tier,drawnMP:r.gfx.drawnMP,rtMB:r.gfx.rtMB});
  await E(()=>window.__mocha.shotMode('walk-square-cozy'));await p.waitForTimeout(2500);await p.screenshot({path:`${SHOT}/ultra-desktop-walk-square-cozy-h15.png`});
  // HIGH
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const t=M.tier(2);await w(500);return{t,post:M.post()}});
  ok(r.t.f.shadow.size===2048&&r.t.f.ts===12&&r.t.f.dens===1.4&&r.t.f.far===1.25&&r.t.f.dither===1&&r.post.taps===12&&r.post.dither===1,'HIGH: shadow 2048, ts 12, dens 1.4, far 1.25, dither on',{f:r.t.f,post:r.post});
  await p.screenshot({path:`${SHOT}/high-desktop-walk-square-cozy-h15.png`});
  // 0 new programs after the first visit to each tier; T9 no long apply or frame
  r=await E(async()=>{const M=window.__mocha,R=M.lf4dbg().renderer,w=ms=>new Promise(r=>setTimeout(r,ms));const p1=R.info.programs.length;let worst=0;const gl=R.getContext(),spr=R.setPixelRatio;let cv=0,worstAll=0;R.setPixelRatio=function(){const t=performance.now();spr.apply(this,arguments);cv+=performance.now()-t};// SwiftShader re-allocates the drawing buffer synchronously in setPixelRatio (0.6-2 s; today's ADAPT pays the same); timed apart
    for(const n of [1,3,2,1,3,1,2,1]){gl.finish();cv=0;const t0=performance.now();M.tier(n);const a=performance.now()-t0;worstAll=Math.max(worstAll,a);worst=Math.max(worst,a-cv);await w(350)}R.setPixelRatio=spr;return{p1,p2:R.info.programs.length,worstApplyMs:+worst.toFixed(1),withCanvasRealloc:+worstAll.toFixed(1)}});
  ok(r.p2===r.p1,'0 program links on PHONE/HIGH/ULTRA switches after the first visit',r);ok(r.worstApplyMs<200,`T9 proxy on SwiftShader: 0 links (above) and the apply takes ${r.worstApplyMs} ms after gl.finish(), canvas re-allocation timed apart (< 200); frame times at ULTRA are judged on the owner's computer`,r);
  // T4
  r=await E(()=>{const g=window.__mocha.tierGuess;return{rtx:g({webgl2:true,renderer:'ANGLE (NVIDIA, NVIDIA GeForce RTX 3070 Direct3D11 vs_5_0 ps_5_0)',maxSamples:8,maxTex:16384,touch:false,minSide:1080}),uhd:g({webgl2:true,renderer:'ANGLE (Intel, Intel(R) UHD Graphics 620 Direct3D11)',maxSamples:4,maxTex:16384,touch:false,minSide:1080}),
    iphone:g({webgl2:true,renderer:'Apple GPU',maxSamples:4,maxTex:16384,touch:true,minSide:393}),ipad:g({webgl2:true,renderer:'Apple GPU',maxSamples:4,maxTex:16384,touch:true,minSide:820}),soft:g({webgl2:true,renderer:'ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)))',soft:true,touch:false,minSide:1080}),saver:g({saver:true,webgl2:true,renderer:'NVIDIA GeForce RTX 4090',maxSamples:8,maxTex:16384}),mac:g({webgl2:true,renderer:'Apple M2',maxSamples:4,maxTex:16384,touch:false,minSide:900}),masked:g({webgl2:true,renderer:'',maxSamples:4,maxTex:8192,touch:false,minSide:900})}});
  ok(r.rtx===3&&r.uhd===2&&r.iphone===1&&r.ipad===2&&r.soft===1&&r.saver===0&&r.mac===3&&r.masked===2,'T4 tierGuess table',r);
  // T8: under STYLE.noTs layers ts is 0 on every tier
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('follow');await w(400);let id='juniper';const n=M.town&&M.town.npc&&M.town.npc('juniper');if(n&&n.visible===false){const k=M.KEEPERS.find(k=>{const q=M.town.npc(k.id);return q&&q.visible&&q.st==='work'});if(k)id=k.id}
    const i=M.talk(id);await w(900);const out={id,open:i&&i.open,stack:M.cam().stack||null};for(const t of [1,2,3]){M.tier(t);await w(400);out['t'+t]=M.post().ts}return out});
  ok(r.t1===0&&r.t2===0&&r.t3===0,'T8 tilt-shift is 0 under the talk layer on PHONE, HIGH and ULTRA',r);
  await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.tier&&window.__mocha.lf4dbg().TIER.applied,null,{timeout:150000});await p.waitForTimeout(2000);
  // T6 ADAPT (forced ULTRA; the saved-tier rule is checked in 'saved'): demote order, never promote
  r=await E(()=>{const M=window.__mocha;M.tier(3);const fast=M.tierAdapt({samples:Array(400).fill(8)});const slow=M.tierAdapt({samples:Array(400).fill(100)});return{fast:fast.steps,slow:slow.steps,n:slow.info.n,f:slow.info.f,dem:slow.info.demoted}});
  ok(!r.fast.length,'T6 fast frames never promote or change anything',r.fast);
  {const pre=['bloom','sao','dts'].filter(x=>r.slow.includes(x)),k=pre.length;// POL3 built bloom, SAO and the depth tilt-shift: they go first, in this order
  ok(r.slow.slice(0,k).join()===pre.join()&&r.slow[k]==='shadow'&&r.slow[k+1]==='pr'&&r.slow.indexOf('tier')>r.slow.lastIndexOf('pr'),'T6 slow frames demote in order: bloom, SAO, depth TS (POL3), 4096 -> 2048 shadows, then PR, then the tier',r)}
  // T10
  r=await E(()=>window.__mocha.tierMem(2560,1440,3));ok(r.mb<=160&&r.mp<=8.3,`T10 ULTRA at 2560x1440: ${r.mb} MB RT+shadow, ${r.mp} MP drawn`,r);
  r=await E(()=>({d:window.__mocha.tierMem(1100,820,3),h:window.__mocha.tierMem(1920,1080,2)}));console.log('  info memory ULTRA 1100x820 / HIGH 1920x1080',JSON.stringify(r));
  ok(!errs.length,'no page errors (desktop)',errs);await ctx.close()}

if(PARTS.includes('gl1')){console.log('== T3 WebGL1 forced (?gl1), desktop');const {ctx,p,errs,E}=await open('desktop',{q:'?gl1'});
  let r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const t=M.tier(3);await w(1500);return{webgl2:t.caps.webgl2,f:M.tier().f,post:M.post(),gl:M.lf4dbg().renderer.getContext().getError()}});
  ok(!r.webgl2&&r.f.msaa===false&&r.f.fxaa===true&&r.post.fxaa===1&&r.f.ao==='blob'&&r.f.tsMode==='band'&&r.gl===0,'T3 WebGL1: msaa false (FXAA on), ao blob, band tilt-shift',r);
  await frames(p,30);await p.screenshot({path:`${SHOT}/ultra-gl1-desktop-h15.png`});ok(!errs.length,'no page errors (gl1)',errs);await ctx.close()}

if(PARTS.includes('saved')){console.log('== T5 saved decision and T6 saved-tier lowering (desktop)');let {ctx,p,errs,E}=await open('desktop');
  let r=await E(()=>({s:JSON.parse(localStorage.getItem('mocha-gfx')||'null'),t:window.__mocha.tier()}));
  ok(r.s&&r.s.v===1&&r.s.sig===r.t.sig&&r.s.tier===1&&r.s.guess===1&&'drops' in r.s,'T5 mocha-gfx written {v,sig,tier,guess,probe,drops}',r.s);const sig=r.s.sig;
  await p.evaluate(sig=>localStorage.setItem('mocha-gfx',JSON.stringify({v:1,sig,tier:3,guess:1,probe:null,drops:0})),sig);await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.tier&&window.__mocha.lf4dbg().TIER.applied,null,{timeout:150000});await p.waitForTimeout(1500);
  r=await E(()=>window.__mocha.tier());ok(r.auto&&r.n===3&&r.boot===3&&r.f.dens===2&&r.built.dens===2,'T5 the saved tier is reused on the next boot with the same sig (auto ULTRA, built at dens 2)',{n:r.n,boot:r.boot,auto:r.auto,built:r.built});
  r=await E(()=>{const M=window.__mocha;const s=M.tierAdapt({samples:Array(700).fill(100)});return{steps:s.steps,saved:JSON.parse(localStorage.getItem('mocha-gfx')),sd:s.info.sessionDrops}});
  ok(r.steps.length>=2&&r.saved.tier===2&&r.saved.drops>=2,'T6 two drops in a session lower the saved tier (3 -> 2), drops saved',r);
  await E(()=>{const s=JSON.parse(localStorage.getItem('mocha-gfx'));s.sig='other';s.tier=3;localStorage.setItem('mocha-gfx',JSON.stringify(s))});await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.tier&&window.__mocha.lf4dbg().TIER.applied,null,{timeout:150000});await p.waitForTimeout(1500);
  r=await E(()=>({t:window.__mocha.tier(),s:JSON.parse(localStorage.getItem('mocha-gfx'))}));ok(r.t.n===1&&r.s.sig===r.t.sig&&r.s.tier===1,'T5 a sig change re-decides from the guess',{n:r.t.n,saved:r.s});
  ok(!errs.length,'no page errors (saved)',errs);await ctx.close();
  // SET.saver migrates to 'low'
  ({ctx,p,errs,E}=await open('portrait',{ls:{'mocha-settings':{saver:true}}}));
  r=await E(()=>({t:window.__mocha.tier(),set:JSON.parse(localStorage.getItem('mocha-settings')||'{}')}));
  ok(r.t.n===0&&r.t.saver===true&&r.t.gfx==='low'&&r.t.f.pr===1&&r.t.f.shadow.size===0,'T7 SET.saver=true migrates to gfx low (LOW tier, saver true, PR 1, no shadows)',{n:r.t.n,saver:r.t.saver,gfx:r.t.gfx,f:r.t.f});
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const a=M.tier(1);await w(500);const D=M.lf4dbg();return{n:a.n,saver:a.saver,gfx:a.gfx,cast:!!D.scene.children.find(o=>o.isDirectionalLight&&o.castShadow)}});
  ok(r.n===1&&r.saver===false&&r.gfx==='phone'&&r.cast,'leaving LOW: saver false, the sun casts again',r);ok(!errs.length,'no page errors (saver)',errs);await ctx.close()}

if(PARTS.includes('settings')){for(const vn of ['portrait','desktop']){console.log('== T7 Settings Graphics row,',vn);const {ctx,p,errs,E}=await open(vn);
  let r=await E(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));document.querySelector('#bookBtn').click();await w(400);document.querySelector('#tabNav [data-top="settings"]').click();await w(600);const row=document.getElementById('gfxRow');if(!row)return{row:false};row.scrollIntoView({block:'center'});await w(200);
    const bs=[...row.querySelectorAll('[data-gfx]')].map(b=>{const q=b.getBoundingClientRect();return{v:b.dataset.gfx,t:b.textContent,on:b.classList.contains('on'),w:Math.round(q.width),h:Math.round(q.height)}});return{row:true,bs}});
  ok(r.row&&r.bs.length===5&&r.bs[0].on&&/Auto · Phone/.test(r.bs[0].t)&&(vn!=='portrait'||r.bs.every(b=>b.h>=40)),'the Graphics row renders: Auto · Phone / Battery saver / Phone / High / Ultra',r);
  await p.screenshot({path:`${SHOT}/settings-${vn}.png`});
  r=await E(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));/* pol merge: SwiftShader re-allocates the canvas synchronously in setPixelRatio (timed apart, as T9 and test-POL3) */const R=window.__mocha.lf4dbg().renderer,spr=R.setPixelRatio;let cv=0;R.setPixelRatio=function(){const t=performance.now();spr.apply(this,arguments);cv+=performance.now()-t};
    const t0=performance.now();try{document.querySelector('#gfxRow [data-gfx="ultra"]').click()}finally{R.setPixelRatio=spr}let ms=null;while(performance.now()-t0-cv<1500){if(window.__mocha.tier().n===3){ms=performance.now()-t0-cv;break}await w(20)}await w(500);
    return{ms:ms&&Math.round(ms),canvasMs:Math.round(cv),set:JSON.parse(localStorage.getItem('mocha-settings')).gfx,note:document.getElementById('gfxNote').textContent,on:[...document.querySelectorAll('#gfxRow [data-gfx].on')].map(b=>b.dataset.gfx),saver:document.querySelector('#tab-set [data-t="saver"]').checked}});
  ok(r.ms!=null&&r.ms<=1000&&r.set==='ultra'&&r.on.join()==='ultra','T7 selecting Ultra applies within 1 s and persists in SET.gfx',r);
  ok(/after reload/i.test(r.note),'structural parts: the reload note',r.note);
  if(vn==='portrait')ok(/warm/i.test(r.note),'T7 a touch device shows the warm-battery note',r.note);else ok(!/warm/i.test(r.note),'no battery note on desktop',r.note);
  await p.screenshot({path:`${SHOT}/settings-${vn}-ultra.png`});
  r=await E(async()=>{const w=ms=>new Promise(r=>setTimeout(r,ms));const t=document.querySelector('#tab-set [data-t="saver"]');t.checked=true;t.dispatchEvent(new Event('change'));await w(800);const a=window.__mocha.tier();t.checked=false;t.dispatchEvent(new Event('change'));await w(800);const b=window.__mocha.tier();
    return{on:{n:a.n,saver:a.saver,gfx:a.gfx},off:{n:b.n,saver:b.saver,gfx:b.gfx,auto:b.auto},seg:[...document.querySelectorAll('#gfxRow [data-gfx].on')].map(b=>b.dataset.gfx)}});
  ok(r.on.n===0&&r.on.saver&&r.on.gfx==='low'&&r.off.n===1&&!r.off.saver&&r.off.gfx==='auto'&&r.seg.join()==='auto','the Battery saver toggle maps onto the Graphics setting (on -> low, off -> auto)',r);
  ok(!errs.length,'no page errors (settings '+vn+')',errs);await ctx.close()}}

console.log(`\nLF4: ${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(2)});

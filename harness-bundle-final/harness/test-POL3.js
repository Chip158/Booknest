// POL3 "High and Ultra really look better on a computer": acceptance through window.__mocha hooks.
// node /tmp/harness/test-POL3.js [parts=parity,ultra,switch,lost,gl1,probe]   (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...)
// BASE=<file> is the PHONE parity reference: the game WITHOUT POL3. Default /tmp/harness/ref-noPOL3.html = merge3(base-pol, backup-POL3 (POL1 only), trackQ (INT4+POL2)), i.e. the merged
// game minus POL3 (pol merge, Nov 4). Before the merge it was /tmp/harness/backup-POL3.html. Rebuild it after later merges, or PHONE program/texture parity compares against the wrong file.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const URL='file:///home/user/Booknest/ghost-town/index.html',BASE='file://'+(process.env.BASE||'/tmp/harness/ref-noPOL3.html');
const timeAt=(h,mo=10,d=3)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${mo},${d});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const SEED=`(()=>{let s=1234567;Math.random=()=>{s=(s*16807)%2147483647;return(s-1)/2147483646}})()`;
const PARTS=(process.argv[2]||'parity,ultra,switch,lost,gl1,probe').split(',');let pass=0,fail=0;
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg,r!==undefined?JSON.stringify(r).slice(0,300):'')}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1200))}};
const SHOT='/tmp/harness/rv-pol/tier/test';fs.mkdirSync(SHOT,{recursive:true});
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vn,{hour=15,q='',url=URL,seed=false}={})=>{const vp=vn==='portrait'?{width:393,height:852}:{width:1100,height:820},mob=vn==='portrait';
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(200000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));if(seed)await p.addInitScript(SEED);
  await p.goto(url+q);await p.waitForFunction(()=>window.__mocha&&window.__mocha.tier&&window.__mocha.lf4dbg&&window.__mocha.lf4dbg().TIER.applied,null,{timeout:200000});await p.waitForTimeout(2000);
  await p.evaluate(()=>{try{window.__mocha.forceAct({p:'promenade'})}catch(e){}});for(let k=0;k<40;k++){if(await p.evaluate(()=>{const i=window.__mocha.inside&&window.__mocha.inside();return!i||(!i.on&&i.ph==='idle')}))break;await p.waitForTimeout(250)}
  return{ctx,p,errs,E:f=>p.evaluate(f),EA:(f,a)=>p.evaluate(f,a)}};
const frames=(p,n)=>p.evaluate(n=>new Promise(r=>{let k=0;const f=()=>{if(++k>=n)r(k);else requestAnimationFrame(f)};requestAnimationFrame(f)}),n);
// one frozen frame through the game's own path (scene -> post), read back; plus counts
const SNAP=`(()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,gl=R.getContext();D.scene.traverse(o=>{if(o.isDirectionalLight&&o.castShadow)o.shadow.needsUpdate=true});R.setRenderTarget(D.TIER.rt||D.rt);R.info.autoReset=false;R.info.reset();R.render(D.scene,D.camera);const calls=R.info.render.calls,tris=R.info.render.triangles;R.info.autoReset=true;R.setRenderTarget(null);R.render(D.postScene,D.postCam);
  const w=gl.drawingBufferWidth,h=gl.drawingBufferHeight,a=new Uint8Array(w*h*4);gl.readPixels(0,0,w,h,gl.RGBA,gl.UNSIGNED_BYTE,a);window.__snap=a;return{calls,tris,progs:R.info.programs.length,tex:R.info.memory.textures,geo:R.info.memory.geometries,w,h,pr:R.getPixelRatio()}})()`;
const DIFF=`((A,B)=>{let bad=0,mx=0;for(let i=0;i<A.length;i+=4){let d=0;for(let c=0;c<3;c++)d=Math.max(d,Math.abs(A[i+c]-B[i+c]));if(d>0)bad++;mx=Math.max(mx,d)}return{bad,max:mx,frac:bad/(A.length/4)}})`;

if(PARTS.includes('parity')){for(const hour of [15,21]){console.log('== PHONE parity, portrait',hour+':00, vs',BASE);const res={};
  for(const [k,u] of [['base',BASE],['cur',URL]]){const {ctx,p,errs,E}=await open('portrait',{hour,url:u,seed:true});
   res[k]=await E(`(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const D=M.lf4dbg(),R=D.renderer;const boot={progs:R.info.programs.length,tex:R.info.memory.textures,geo:R.info.memory.geometries};M.shotMode('walk-square-cozy');await w(2500);M.freeze(true);await w(800);
    const s=${SNAP};return{boot,s,tier:M.tier().n,pq:M.tier().pq||null,quad:D.postScene.children[0].material===D.post}})()`);
   if(k==='cur'){// same frame, POL3 bypassed (the start file's render path and post material) vs as shipped: must be identical at PHONE
    res.self=await E(`(()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,P=M.pqDbg().PQ;const s1=${SNAP};const A=window.__snap;const rr=R.render;R.render=P.r0;const q=D.postScene.children[0],qm=q.material;q.material=D.post;const s0=${SNAP};const B=window.__snap;R.render=rr;q.material=qm;return Object.assign(${DIFF}(A,B),{c1:s1.calls,c0:s0.calls})})()`);
    await p.screenshot({path:`${SHOT}/phone-parity-h${hour}.png`})}
   res[k].errs=errs.length;await ctx.close()}
  const B=res.base,C=res.cur;
  ok(C.tier===1&&C.quad&&(!C.pq||C.pq.on===0),'PHONE on SwiftShader: tier 1, the post quad keeps the original post material, POL3 off',{tier:C.tier,quad:C.quad,pq:C.pq});
  ok(B.boot.progs===C.boot.progs,'boot programs equal the reference (0 new programs at PHONE)',{base:B.boot,cur:C.boot});
  // two separate page loads: walkers and townsfolk can stand elsewhere (sim timing), so draws/tris are compared only when the agent layout matches; the bypass check below is the authoritative PHONE identity
  ok(B.s.progs===C.s.progs,'frozen walk-square-cozy: programs equal the reference',{base:B.s.progs,cur:C.s.progs});
  console.log('  info vs reference (two loads: lazy catalog, rooms and agents differ, so textures/draws are informational; the same-page bypass checks are authoritative):',JSON.stringify({base:[B.s.calls,B.s.tris,B.s.tex],cur:[C.s.calls,C.s.tris,C.s.tex],self:[res.self.c0,res.self.c1]}));
  ok(res.self.c0===res.self.c1,'same page: draws with POL3 bypassed equal draws as shipped',{c0:res.self.c0,c1:res.self.c1});
  ok(res.self.bad===0,'same frozen frame with POL3 bypassed vs shipped: pixel diff 0 at PHONE',res.self);
  ok(!B.errs&&!C.errs,'no page errors',{base:B.errs,cur:C.errs})}}

if(PARTS.includes('ultra')){for(const hour of [15.5,21]){console.log('== ULTRA desktop 1100x820',hour);const {ctx,p,errs,E}=await open('desktop',{hour});
  let r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.shotMode('walk-square-cozy');await w(2500);M.freeze(true);await w(600);return{progs:M.lf4dbg().renderer.info.programs.length}});const p0=r.progs;
  // PHONE vs ULTRA on the same frozen frame: lamp rings, AO strip, halo clamp
  r=await E(`(async()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,G=M.GLOWPTS,cam=D.camera;const ring=(a,w,h,pts)=>{let s=0,n=0;for(const [x,y] of pts)for(let dy=-24;dy<=24;dy+=3)for(let dx=-24;dx<=24;dx+=3){const d=Math.hypot(dx,dy);if(d<12||d>24)continue;const X=Math.round(x+dx),Y=Math.round(y+dy);if(X<0||Y<0||X>=w||Y>=h)continue;const i=(Y*w+X)*4;s+=a[i]*.299+a[i+1]*.587+a[i+2]*.114;n++}return n?s/n:0};
   M.tier(1);await new Promise(r=>setTimeout(r,800));let s=${SNAP};const A=window.__snap,W=s.w,H=s.h;const v=new THREE.Vector3(),pts=[];for(let i=0;i<G.n;i++){if(G.A[i]<.1||G.Z[i]<.3||G.K[i]<.5)continue;v.set(G.P[i*3],G.P[i*3+1],G.P[i*3+2]).project(cam);if(Math.abs(v.x)>.9||Math.abs(v.y)>.9||v.z>1)continue;pts.push([(v.x*.5+.5)*W,(v.y*.5+.5)*H,cam.position.distanceTo(new THREE.Vector3(G.P[i*3],G.P[i*3+1],G.P[i*3+2]))])}pts.sort((a,b)=>a[2]-b[2]);const P5=pts.slice(0,5);
   const lumA=ring(A,W,H,P5);let mA=0;for(let i=0;i<A.length;i+=4)mA+=A[i]*.299+A[i+1]*.587+A[i+2]*.114;mA/=A.length/4;
   M.tier(3);await new Promise(r=>setTimeout(r,1800));const sU=${SNAP};const t=M.tier();const U=window.__snap,W3=sU.w,H3=sU.h,k=W3/W;const lumU=ring(U,W3,H3,P5.map(([x,y])=>[x*k,y*k]));let mU=0;for(let i=0;i<U.length;i+=4)mU+=U[i]*.299+U[i+1]*.587+U[i+2]*.114;mU/=U.length/4;
   const P=M.pqDbg().PQ;const kk=P.k.aok;P.k.aok=0;const sN=${SNAP};const N=window.__snap;P.k.aok=kk;const sY=${SNAP};const Y=window.__snap;
   let dk=0,n4=0;for(let i=0;i<Y.length;i+=4){const a=Y[i]*.299+Y[i+1]*.587+Y[i+2]*.114,b=N[i]*.299+N[i+1]*.587+N[i+2]*.114;n4++;if(b>8&&a<b*.96)dk++}
   return{pts:P5.length,lumA:+lumA.toFixed(1),lumU:+lumU.toFixed(1),mA:+mA.toFixed(1),mU:+mU.toFixed(1),aoDarker:+(dk/n4).toFixed(4),t:{n:t.n,bloom:t.bloom,sao:t.sao,msaa:t.msaa,ts:t.ts,halo:t.halo,pq:t.pq,f:{pr:t.f.pr,shadow:t.f.shadow,dens:t.f.dens,far:t.f.far,ao:t.f.ao,tsMode:t.f.tsMode}},gl:R.getContext().getError(),progs:R.info.programs.length}})()`);
  const t=r.t;ok(t.n===3&&t.bloom.on&&t.bloom.mode==='mip'&&t.bloom.levels===5&&t.sao.on&&t.msaa>=4&&t.ts.taps===16&&t.ts.depth&&t.halo==='quads'&&t.f.shadow.size===4096&&t.f.dens===2&&t.f.far===1.6,'ULTRA: tier() reports {bloom mip x5, sao, msaa 4, ts 16 depth-weighted}, halo quads, 4096 shadows, dens 2, far 1.6',t);
  ok(r.gl===0&&!t.pq.fail.length,'no GL error and no POL3 failures after the passes',{gl:r.gl,fail:t.pq.fail});ok(r.progs-p0<=6,`programs +${r.progs-p0} at ULTRA (<= 6)`,{p0,p1:r.progs});
  if(hour>=20){ok(r.mU>=r.mA*1.08,`21:00: the frame's mean luma is ${((r.mU/r.mA-1)*100).toFixed(1)}% higher on ULTRA (bloom + unclamped halos, >= 8%)`,{mA:r.mA,mU:r.mU});console.log('  info ring luma around the nearest projected halos (PHONE, ULTRA):',r.pts,r.lumA,r.lumU)}
  else ok(r.aoDarker>=.02,`15:30: SAO darkens ${(r.aoDarker*100).toFixed(1)}% of the frame by >= 4% (contact shading, >= 2%)`,r);
  await frames(p,40);r=await E(()=>({gl:window.__mocha.lf4dbg().renderer.getContext().getError(),fail:window.__mocha.tier().fail}));ok(r.gl===0&&!r.fail.length,'40 more ULTRA frames: gl.getError() 0, TIER.fail empty',r);
  await E(()=>window.__mocha.freeze(false));ok(!errs.length,'no page errors (ultra '+hour+')',errs);await ctx.close()}}

if(PARTS.includes('switch')){console.log('== live switch: Ultra applies within 1 s, back to PHONE frees the targets');const {ctx,p,errs,E}=await open('desktop',{hour:21});
  let r=await E(async()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,w=ms=>new Promise(r=>setTimeout(r,ms));await w(500);const catN=()=>{try{const s=M.catDisplays().shops;return Object.values(s).filter(e=>e.built).length}catch(e){return 0}};const cat0=catN();const tex0=R.info.memory.textures;const spr=R.setPixelRatio;let cv=0;R.setPixelRatio=function(){const t=performance.now();spr.apply(this,arguments);cv+=performance.now()-t};/* SwiftShader re-allocates the canvas synchronously in setPixelRatio (timed apart, as test-LF4 T9) */const t0=performance.now();M.tier('ultra');R.setPixelRatio=spr;const applyMs=performance.now()-t0-cv,app={n:M.tier().n,quad:M.pq().quadMat};let ms=null;while(performance.now()-t0<3000){const q=M.pq();if(q.passes>0&&q.quadMat==='post3'){ms=performance.now()-t0;break}await w(10)}await w(800);
    const u={pq:M.pq(),tex:R.info.memory.textures};M.tier('phone');await w(600);const back={pq:M.pq(),tex:R.info.memory.textures,rt:M.tier().rt,cat:catN()-cat0};return{applyMs:+applyMs.toFixed(0),canvasMs:+cv.toFixed(0),app,ms:ms==null?null:+ms.toFixed(0),tex0,u:{bl:u.pq.bl.length,ao:!!u.pq.ao,depth:u.pq.depth,tex:u.tex},back:{on:back.pq.on,bl:back.pq.bl.length,ao:back.pq.ao,depth:back.pq.depth,quad:back.pq.quadMat,pts:back.pq.pts,halo:back.pq.halo,tex:back.tex,rt:back.rt,cat:back.cat}}});
  ok(r.applyMs<=1000&&r.app.n===3&&r.app.quad==='post3'&&r.ms!=null,`selecting Ultra applies within 1 s (applied in ${r.applyMs} ms; the first composited frame follows after ${r.ms} ms on SwiftShader, which pays for the first 4096 shadow pass and 5 program links)`,r);
  ok(r.u.bl===5&&r.u.ao&&r.u.depth,'ULTRA allocates the 5-level bloom chain, the half-res AO target and the scene depth texture',r.u);
  ok(r.back.on===0&&r.back.bl===0&&!r.back.ao&&!r.back.depth&&r.back.quad==='post'&&r.back.pts&&(!r.back.halo||!r.back.halo.vis)&&r.back.rt==='base'&&r.back.tex<=r.tex0+1+Math.max(0,r.back.cat),'back to PHONE: targets and depth texture disposed, post material, GLOWPTS points again, base target, textures back (+ the blue-noise tile, + one atlas per catalog display that ULTRA\'s far x1.6 built meanwhile; merge note: after INT4 the lazy catalog builds land in this window)',Object.assign({tex0:r.tex0},r.back));
  ok(!errs.length,'no page errors (switch)',errs);await ctx.close()}

if(PARTS.includes('lost')){console.log('== context loss at ULTRA');const {ctx,p,errs,E}=await open('desktop',{hour:21});
  let r=await E(async()=>{const M=window.__mocha,D=M.lf4dbg(),R=D.renderer,gl=R.getContext(),w=ms=>new Promise(r=>setTimeout(r,ms));M.tier(3);await w(1500);const before=M.pq().passes;const ext=gl.getExtension('WEBGL_lose_context');if(!ext)return{ext:false};ext.loseContext();await w(1200);ext.restoreContext();await w(3000);
    const t=M.tier();return{ext:true,before,n:t.n,pq:M.pq(),gl:gl.getError(),lost:gl.isContextLost()}});
  ok(r.ext&&!r.lost&&r.n===1&&r.pq.on===0&&r.pq.quadMat==='post'&&r.pq.pts,'after a lost and restored context the session continues at PHONE: POL3 off, post material, GLOWPTS points',r);
  await frames(p,20);ok(!errs.filter(e=>!/CONTEXT_LOST|context lost/i.test(e)).length,'no page errors around the context loss',errs);await ctx.close()}

if(PARTS.includes('gl1')){console.log('== WebGL1 forced (?gl1), ULTRA');const {ctx,p,errs,E}=await open('desktop',{hour:21,q:'?gl1'});
  let r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const t=M.tier(3);await w(1500);const u=M.tier();return{webgl2:u.caps.webgl2,f:{msaa:u.f.msaa,fxaa:u.f.fxaa,ao:u.f.ao,tsMode:u.f.tsMode,bloom:u.f.bloom},sao:u.sao,ts:u.ts,pq:M.pq(),gl:M.lf4dbg().renderer.getContext().getError(),fail:u.fail}});
  ok(!r.webgl2&&r.f.msaa===false&&r.f.fxaa===true&&r.f.ao==='blob'&&r.f.tsMode==='band'&&!r.sao.on&&!r.pq.depth&&r.gl===0&&!r.fail.length,'WebGL1: FXAA, no SAO, band tilt-shift, no depth texture, no GL error',r);
  ok(r.pq.on===1&&r.pq.passes>0&&!r.pq.fail.length,'WebGL1: the bloom chain and the composite still run',{on:r.pq.on,passes:r.pq.passes,fail:r.pq.fail});
  await p.screenshot({path:`${SHOT}/ultra-gl1-h21.png`});ok(!errs.length,'no page errors (gl1)',errs);await ctx.close()}

if(PARTS.includes('probe')){console.log('== tierProbe (injected frame series; live plumbing)');const {ctx,p,errs,E}=await open('desktop',{hour:15});
  let r=await E(async()=>{const M=window.__mocha,A=(n,ms)=>Array(n).fill(ms),D=M.lf4dbg(),T=D.TIER;const o={};const caps=Object.assign({},T.caps);
    o.fast=await M.tierProbe({from:1,samples:{a:A(150,8),cpu:A(150,3),b:A(150,16.6)},save:false});
    o.revert=await M.tierProbe({from:1,samples:{a:A(150,8),cpu:A(150,3),b:A(150,40)},save:false});
    o.slow=await M.tierProbe({from:1,samples:{a:A(150,30),cpu:A(150,3)},save:false});
    o.cpu=await M.tierProbe({from:1,samples:{a:A(150,8),cpu:A(150,14),b:A(150,16.6)},save:false});
    T.caps=Object.assign({},caps,{touch:true,phone:false,minSide:900});T.auto=true;o.tabletSlow=await M.tierProbe({from:2,samples:{a:A(150,70),cpu:A(150,9)},save:false});o.tabletOk=await M.tierProbe({from:2,samples:{a:A(150,17),cpu:A(150,5)},save:false});
    T.caps=Object.assign({},caps,{touch:true,phone:true,minSide:393});o.phoneTop=await M.tierProbe({from:2,samples:{a:A(150,5),cpu:A(150,2),b:A(150,16)},save:false});
    T.caps=Object.assign({},caps,{touch:true,phone:true,minSide:393,soft:false});o.phoneFast=await M.tierProbe({from:1,samples:{a:A(150,16.7),cpu:A(150,5),b:A(75,33.4)},save:false});
    {const P=M.pqDbg().PQ,r0=M.tier().pq.probeRuns,pd=P.pbDone,pb=P.boot,au=T.auto;T.auto=true;P.pbDone=0;P.boot=performance.now()-9000;await new Promise(r=>setTimeout(r,1200));o.phoneLive={probe:M.pq().probe,runs:M.tier().pq.probeRuns-r0,pbDone:P.pbDone};if(P.pb){P.pb=null}P.pbDone=pd;P.boot=pb;T.auto=au}
    T.caps=caps;
    o.ultra=await M.tierProbe({from:2,samples:{a:A(150,16.7),cpu:A(150,3),gpu:4,b:A(150,16.7)},save:false});
    o.ultra60=await M.tierProbe({from:3,samples:{a:A(150,16.67),cpu:A(150,3)},save:false});
    o.ultraSlow=await M.tierProbe({from:3,samples:{a:Array.from({length:150},(_,i)=>i%2?33.33:16.67),cpu:A(150,3)},save:false});
    o.saved=await M.tierProbe({from:1,samples:{a:A(150,8),cpu:A(150,3),b:A(150,16.6)}});o.ls=JSON.parse(localStorage.getItem('mocha-gfx'));o.now=M.tier();
    o.dueNew=M.pq().due;T.save.probe.at=Date.now()-15*864e5;o.dueOld=M.pq().due;T.save.probe.at=Date.now();
    M.tier('phone');M.tier('auto');T.autoN=1;M.tier('auto');
    const lv=await M.tierProbe({force:true,ms:700});o.live=lv;o.after=M.tier();o.fpsBack=T.fps();return o});
  ok(r.fast.step==='promote'&&r.fast.tier===2,'fast frames (125 fps, CPU 3 ms) promote PHONE -> HIGH after a held trial',r.fast);
  ok(r.revert.step==='revert'&&r.revert.tier===1,'a trial that cannot hold the cap reverts',r.revert);
  ok(r.slow.step==='stay'&&r.slow.tier===1,'slow frames stay',r.slow);ok(r.cpu.step==='stay','CPU p95 over 8 ms never promotes',r.cpu);
  ok(r.tabletSlow.step==='down'&&r.tabletSlow.tier===1&&r.tabletOk.step==='stay'&&r.tabletOk.tier===2,'tablet/Duo guessed HIGH: steps down when it cannot hold 30 fps, stays HIGH when it can',{slow:r.tabletSlow,ok:r.tabletOk});
  ok(r.phoneTop.tier===2&&r.phoneTop.step==='stay','phones are never promoted',r.phoneTop);ok(r.ultra.step==='promote'&&r.ultra.tier===3,'60 Hz lock with GPU 4 ms promotes HIGH -> ULTRA (real 16.7 ms trial frames)',r.ultra);
  ok(r.phoneFast.step==='stay'&&r.phoneFast.tier===1,'an iPhone at PHONE with fast frames stays PHONE (no auto-promotion)',r.phoneFast);
  ok(r.phoneLive.probe==null&&r.phoneLive.runs===0,'phones never start the live probe (no uncapped Phase A)',r.phoneLive);
  ok(r.ultra60.step==='stay'&&r.ultra60.tier===3,'a desktop ULTRA at a 60 Hz lock stays ULTRA',r.ultra60);
  ok(r.ultraSlow.step==='down'&&r.ultraSlow.tier===2,'a GPU-bound ULTRA on a 60 Hz panel steps down',r.ultraSlow);
  ok(r.ls&&r.ls.tier===2&&r.ls.probe&&r.ls.probe.at&&r.ls.probe.fps>100&&r.now.autoN===2,'the decision is saved in mocha-gfx {tier, probe:{fps,cpuP95,gpuMs,at}} and becomes the auto pick',{ls:r.ls,autoN:r.now.autoN});
  ok(r.dueOld===true&&r.dueNew===false,'a fresh probe is not due; one older than 14 days is due again',{dueNew:r.dueNew,dueOld:r.dueOld});
  ok(r.live&&['stay','down','promote','revert','skipped'].includes(r.live.step)&&r.after.pq.probing==null&&r.fpsBack<1000,'live probe plumbing (forced on SwiftShader): measures, decides, restores the frame cap',{live:r.live,fps:r.fpsBack});
  ok(!errs.length,'no page errors (probe)',errs);await ctx.close()}

await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})().catch(e=>{console.error(e);process.exit(2)});

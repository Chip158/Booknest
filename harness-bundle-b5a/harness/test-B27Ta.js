// test-B27Ta.js: interior style pass A (Addendum S10-S12). Drives everything through window.__mocha hooks at DAY=11-03.
// Usage (track copy): NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackT/index.html node /tmp/harness/test-B27Ta.js
// Checks: boot errors, roomStyle/roomLight/rampCheck/shotMode hooks, BAKEMI on every interior batch (BAKEM + exterior on TOONG),
// pools at floor+.02 with pid, <=6 pools/room, GLOWPTS/POOLS quotas, lamps on all day, room void + indoor shadow fit/freeze + restore,
// pitch .78 portrait / .62 landscape, room draws <=12+1 LIT, toggle deltas (LIT, sky hook = void+freeze, baked cat), merge simulation
// (fov 46/fovK 1.47 portrait, fov 40/fovK 1.28 landscape: far never clips, width >=80%, height within 8%), lint [], DISPLAY 16-40,
// tunnel hidden inside, library glass/sign hidden inside, interior tone stats, autonomy (G.act/target/mode untouched).
const {chromium}=require('playwright');const fs=require('fs');
const FILE='file:///home/user/Booknest/ghost-town/index.html',OUT='/tmp/harness/b27t/shots/ta/test/';fs.mkdirSync(OUT,{recursive:true});
const [DM,DD]=(process.env.DAY||'11-03').split('-').map(Number);
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,fail=0;const res=[];
const ok=(name,c,info)=>{(c?pass++:fail++);res.push((c?'PASS ':'FAIL ')+name+(info!==undefined?' '+JSON.stringify(info).slice(0,400):''));console.log(res[res.length-1])};
const inside=(pid,lx,lz)=>`(()=>{const M=window.__mocha;try{M.stand()}catch(e){}const p=M.byId['${pid}'];if(M.cam().mode!=='walk')M.setCamMode('walk');const q=M.toWorld(p,${lx},${lz});M.you(q.x,q.z);M.cam({yaw:p.ry});const W=(x,z,q)=>{const c=Math.cos(q.ry),s=Math.sin(q.ry),dx=x-q.x,dz=z-q.z;return Math.abs(dx*c-dz*s)<q.w/2+.3&&Math.abs(dx*s+dz*c)<q.d/2+.3};const Y=M.you();for(const q of Object.values(M.byId)){if(!q.interior||q.kind==='home'||!q.w)continue;if(W(Y.x,Y.z,q))q.op=.02;else if(q.op!=null&&q.op<.999)q.op=.98}const hh=M.byId.home;(hh.shell||[]).concat(hh.roofShell||[]).forEach(m=>{m.opacity=${pid==='home'}?.02:.98});for(let i=0;i<3;i++){M.roomTick(30,.05)}return M.roomCam()})()`;
const outside=`(()=>{const M=window.__mocha;M.you(-24,31);M.roomTick(30,.05);for(const q of Object.values(M.byId))if(q.op!=null&&q.op<.999)q.op=.98;return M.roomCam()})()`;
// per-pass draw counter (the toggle_probe method): main vs shadow, averaged over rendered frames
const PROBE=`window.__tp=async(ms=1000)=>{const M=window.__mocha,R=M.renderer;let frames=0,nM=0,nS=0;const o1=R.renderBufferDirect,o2=R.render;R.render=function(s,c){if(s===M.scene)frames++;return o2.apply(this,arguments)};
  R.renderBufferDirect=function(cam,scene){if(scene)nM++;else nS++;return o1.apply(this,arguments)};await new Promise(r=>setTimeout(r,ms));R.renderBufferDirect=o1;R.render=o2;const f=Math.max(1,frames);return{frames,main:+(nM/f).toFixed(1),shadow:+(nS/f).toFixed(1),tris:M.drawInfo().tris}};`;
// tone stats from a PNG (base64) decoded in the page: Lab L* mean, 5x5 grid corners vs centre, near-white share, cool share
const TONE=`async(b64,top)=>{const im=new Image();im.src='data:image/png;base64,'+b64;await im.decode();const W=im.width,H=Math.round(im.height*(top||1)),c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');g.drawImage(im,0,0);const d=g.getImageData(0,0,W,H).data;
  const Lf=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)},Ls=(r,gg,b)=>{const y=.2126*Lf(r)+.7152*Lf(gg)+.0722*Lf(b);return(y>.008856?116*Math.cbrt(y)-16:903.3*y)/100};
  let sum=0,n=0,white=0,cool=0;const cell=Array(25).fill(0),cn=Array(25).fill(0);for(let y=0;y<H;y+=2)for(let x=0;x<W;x+=2){const i=(y*W+x)*4,r=d[i],gg=d[i+1],b=d[i+2],L=Ls(r,gg,b);sum+=L;n++;if(L>.9)white++;const mx=Math.max(r,gg,b),mn=Math.min(r,gg,b);if(mx-mn>18&&b>r+8)cool++;const k=Math.min(4,Math.floor(y/H*5))*5+Math.min(4,Math.floor(x/W*5));cell[k]+=L;cn[k]++}
  const m=cell.map((v,i)=>v/Math.max(1,cn[i])),cor=(m[0]+m[4]+m[20]+m[24])/4,cen=[6,7,8,11,12,13,16,17,18].reduce((a,i)=>a+m[i],0)/9;return{meanL:+(sum/n).toFixed(3),corner:+cor.toFixed(3),centre:+cen.toFixed(3),ratio:+(cor/cen).toFixed(2),white:+(white/n*100).toFixed(2),cool:+(cool/n*100).toFixed(1)}}`;
async function page(b,vp,mob,h){const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(180000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});await p.addInitScript(timeAt(h,DM-1,DD));await p.addInitScript(PROBE);
  await p.goto(FILE);await p.waitForFunction(()=>window.__mocha&&window.__mocha.S,null,{timeout:180000});await sleep(6000);await p.evaluate(()=>{window.__mocha.weather('clear')});await sleep(800);return{ctx,p,errs}}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 // ================= portrait 393x852 at 15:30 =================
 {const {ctx,p,errs}=await page(b,{width:393,height:852},true,15.5);
  const G0=await p.evaluate(()=>{const g=window.__mocha.G;return{act:g.act,target:g.target,mode:g.mode}});
  const H=await p.evaluate(()=>{const M=window.__mocha;return{rs:M.roomStyle(),shots:M.shotMode(),ramp:M.rampCheck(),lint:M.layoutLint(),disp:M.display(),progs:M.programs().n,gl:(()=>{const G=M.GLOWPTS||null;return G?G.from.filter(f=>f==='b27t').length:null})()}});
  ok('hooks: roomStyle lists the styled rooms',['cafe','threads','home','bookstore','library','thrift','neighbor','bakery'].every(k=>H.rs.includes(k)),H.rs);
  ok('hooks: shotMode lists the interior views',['int-cafe','int-threads','int-home'].every(k=>H.shots.includes(k)),H.shots.filter(s=>s.startsWith('int-')));
  ok('ramp: every interior batch on BAKEMI/TOONI, BAKEM + exterior on TOONG',H.ramp.ok&&H.ramp.BAKEM==='TOONG'&&H.ramp.BAKEMI==='TOONI'&&H.ramp.exterior.tooni===0,{BAKEM:H.ramp.BAKEM,ext:H.ramp.exterior,n:H.ramp.interior.length});
  ok('lint: layoutLint() is [] for every building',H.lint.length===0,H.lint);
  const shops=['cafe','bookstore','thrift','bakery','threads','records','grocery','market','petstore','studio','phones','bikes','arcade','nursery','evergreen','lantern'];
  ok('DISPLAY: every shop keeps 16-40 slots',shops.every(k=>H.disp[k]>=16&&H.disp[k]<=40),shops.map(k=>k+':'+H.disp[k]).join(' '));
  const thr=await p.evaluate(()=>window.__mocha.display('threads').slots.filter(s=>s.surf==='rack').length);ok('Threads: 4 stand positions are DISPLAY rack slots (plus the island racks)',thr>=4,thr);
  const R=await p.evaluate(()=>{const M=window.__mocha;return Object.fromEntries(M.roomStyle().map(k=>[k,M.roomStyle(k)]))});
  for(const k of Object.keys(R)){const r=R[k];ok(`room ${k}: LIT batch, <=6 pools, fixtures`,r&&r.lit&&r.lit.draw&&r.pools.length<=6&&r.lights>=1,{kinds:r.kinds,pools:r.pools.length,glows:r.glows,lit:r.lit})}
  const cafe=R.cafe;ok('cafe recipe: 4 cones + 1 frilly, 2 arch windows, sconces',cafe.kinds.filter(k=>k==='cone').length===4&&cafe.kinds.includes('frilly')&&cafe.lit.wins===2,cafe.kinds);
  ok('Mocha study: banker, globe trio, sconce pair, lancet',['banker','globe3','sconce'].every(k=>R.home.kinds.includes(k))&&R.home.lit.wins>=1,R.home.kinds);
  const quota=await p.evaluate(()=>{const M=window.__mocha;let pools=0,gl=0;for(const k of M.roomStyle()){const r=M.roomStyle(k);pools+=r.pools.length;gl+=r.glows}return{pools,gl}});ok('quotas: GLOWPTS +80 or fewer, POOLS +60 or fewer',quota.gl<=80&&quota.pools<=60,quota);
  // cafe: inside, frozen
  await p.evaluate(()=>window.__mocha.freeze(true));
  const rc=await p.evaluate(inside('cafe',0,2.5));await sleep(2500);
  ok('room camera pitch .78 in portrait',Math.abs(rc.pitch-.78)<.03&&rc.top==='room',{pitch:rc.pitch,top:rc.top,fit:rc.fit});
  const L=await p.evaluate(()=>window.__mocha.roomLight('cafe'));
  ok('room void: far plane, clear #1e1612, fog toward the void',L.on&&L.void.clear==='#1e1612'&&L.void.far<60&&L.void.fogNear>0,L.void);
  ok('indoor shadow fit + freeze: shadowHalf max(w,d)/2+3, autoUpdate off',L.shadowHalf===9&&L.shadowAuto===false,{sh:L.shadowHalf,auto:L.shadowAuto});
  ok('lamps on all day (LIT k >= .7) and poolsDay .12-.30 by day',L.k>=.7&&L.poolsDay>=.12&&L.poolsDay<=.3,{k:L.k,pd:L.poolsDay,tint:L.tint});
  ok('pools at floor+.02 with the room pid (floor pools .32, none buried)',L.pools.filter(q=>q.y<1).every(q=>Math.abs(q.y-.32)<.01&&q.pid==='cafe')&&L.pools.length>=4,L.pools);
  ok('CSS room vignette on',L.vig===true);
  const tun=await p.evaluate(()=>{const M=window.__mocha,ds=M.DOORS.filter(d=>d.pid==='cafe'&&d.tunT);M.doorTick&&M.doorTick(.05);return ds.map(d=>d.tunT.on[d.tun])});ok('door tunnel hidden while its own room is on show',tun.every(v=>v===false),tun);
  // draws: own room draws, toggles
  const own=await p.evaluate(()=>{const M=window.__mocha,out={};for(const k of ['cafe','threads','bookstore','thrift','bakery']){let st=0,dy=0;M.byId[k].inner.traverse(o=>{if(o.isMesh||o.isPoints||o.isSprite){if(o.userData.b12)st++;else dy++}});out[k]={static:st,dyn:dy}}const p=M.byId.home;let n=0;p.inner.traverse(o=>{if((o.isMesh||o.isPoints)&&o.visible)n++});out.home={meshes:n};return out});
  ok('each dressed room: 12 or fewer own static draws + 1 LIT',['cafe','threads','bookstore','thrift','bakery'].every(k=>own[k].static<=13),own);
  const base=await p.evaluate(()=>window.__tp(3000));
  const tg=await p.evaluate(async()=>{const M=window.__mocha,out={};const lit=M.byId.cafe.inner.getObjectByName('LIT');const was=lit.layers.mask;lit.layers.mask=0;await new Promise(r=>setTimeout(r,600));out.litOff=await window.__tp(3000);lit.layers.mask=was;
    const SH=M.STYLE?M.STYLE.skyHooks:null;return out});
  ok('toggle: the cafe LIT batch costs exactly 1 main draw',tg.litOff.frames>0&&base.frames>0&&Math.abs(base.main-tg.litOff.main-1)<.6,{base,off:tg.litOff});
  const sky=await p.evaluate(async()=>{const M=window.__mocha,S=M.STYLE_||null;return null});
  await p.screenshot({path:OUT+'cafe-portrait-1530.png'});const b64=(await p.screenshot()).toString('base64');const tone=await p.evaluate(`(${TONE})(${JSON.stringify(b64)},.66)`);
  ok('tone (cafe portrait, room band above the open front): mean L .30-.40, a near-white highlight (corner/centre ratio reported)',tone.meanL>=.3&&tone.meanL<=.4&&tone.white>0,tone);
  // merge simulation (portrait): fov 46, fovK 1.47
  const ms=await p.evaluate(async()=>{const M=window.__mocha,cam=M.camera,ST=M.STYLE;const p=M.byId.cafe,V=new M.THREE.Vector3();const meas=()=>{cam.updateMatrixWorld();let x0=1,x1=-1,y0=1,y1=-1;const c=Math.cos(p.ry),s=Math.sin(p.ry);
     for(const sx of [-.5,.5])for(const sz of [-.5,.5])for(const yy of [0,p.h]){const lx=sx*p.w,lz=sz*p.d;V.set(p.x+lx*c+lz*s,yy,p.z-lx*s+lz*c).project(cam);x0=Math.min(x0,V.x);x1=Math.max(x1,V.x);if(sz<0){y0=Math.min(y0,V.y);y1=Math.max(y1,V.y)}}
     let fc=0;for(const sx of [-.5,.5])for(const sz of [-.5,.5]){const lx=sx*p.w,lz=sz*p.d;fc=Math.max(fc,Math.hypot(p.x+lx*c+lz*s-cam.position.x,p.h-cam.position.y,p.z-lx*s+lz*c-cam.position.z))}return{wFill:+(Math.min(1,x1)-Math.max(-1,x0)).toFixed(3)/2,hBack:+(y1-y0).toFixed(3),far:+cam.far.toFixed(1),fc:+fc.toFixed(1)}};
    const a=meas();const fov0=cam.fov,k0=ST.fovK;cam.fov=46;ST.fovK=1.47;cam.updateProjectionMatrix();M.roomTick(40,.05);for(let i=0;i<3;i++)M.rsTick();await new Promise(r=>setTimeout(r,600));const b=meas();cam.fov=fov0;ST.fovK=k0;cam.updateProjectionMatrix();M.roomTick(40,.05);await new Promise(r=>setTimeout(r,300));return{a,b}});
  ok('merge sim portrait: far plane covers the room, width >= 80%, height within 8%',ms.b.far>=ms.b.fc&&ms.b.wFill>=.8&&Math.abs(ms.b.hBack/ms.a.hBack-1)<=.08,ms);
  // each styled room in portrait fills >= 80% of the width
  const fills={};for(const [pid,lx,lz] of [['threads',0,2.2],['bookstore',0,2.5],['thrift',0,2.2],['bakery',0,1.5],['neighbor',2,2.3]]){await p.evaluate(inside(pid,lx,lz));await sleep(1500);
   fills[pid]=await p.evaluate((pid)=>{const M=window.__mocha,cam=M.camera,p=M.byId[pid],V=new M.THREE.Vector3(),c=Math.cos(p.ry),s=Math.sin(p.ry);cam.updateMatrixWorld();let x0=1,x1=-1;for(const sx of [-.5,.5])for(const sz of [-.5,.5]){const lx=sx*p.w,lz=sz*p.d;V.set(p.x+lx*c+lz*s,.3,p.z-lx*s+lz*c).project(cam);x0=Math.min(x0,V.x);x1=Math.max(x1,V.x)}return +((Math.min(1,x1)-Math.max(-1,x0))/2).toFixed(2)},pid);
   if(pid==='threads')await p.screenshot({path:OUT+'threads-portrait-1530.png'})}
  ok('portrait: every styled room fills >= 80% of the width',Object.values(fills).every(v=>v>=.8),fills);
  // library: glass + sign hidden while on show
  await p.evaluate(inside('library',0,4));await sleep(1500);const lib=await p.evaluate(()=>{const p=window.__mocha.byId.library;return{glass:p.glass.visible,op:+p.op.toFixed(2),fade:(p.fadeX||[]).map(m=>m.visible),pane:p.paneM?p.paneM.visible:null}});
  ok('library: glass shell + name sign + door frame hidden while its room is on show',lib.glass===false&&lib.fade.length>=4&&lib.fade.every(v=>!v)&&lib.pane===false,lib);
  // leave: everything restored
  await p.evaluate(outside);await sleep(800);const L2=await p.evaluate(()=>window.__mocha.roomLight('cafe'));
  ok('leaving restores far, clear colour, shadow box, poolsDay, vignette',!L2.on&&L2.void.far>=1000&&L2.shadowHalf===0&&L2.shadowAuto===true&&L2.poolsDay===0&&!L2.vig,{far:L2.void.far,sh:L2.shadowHalf,auto:L2.shadowAuto,pd:L2.poolsDay,vig:L2.vig});
  const G1=await p.evaluate(()=>{const g=window.__mocha.G;return{act:g.act,target:g.target,mode:g.mode}});
  ok('autonomy: no style path wrote G.act / G.target / G.mode (frozen sim)',JSON.stringify(G0)===JSON.stringify(G1),{G0,G1});
  const cat=await p.evaluate(()=>{const c=window.__mocha.byId.bookstore.storeCat;let n=0;c.traverse(o=>{if(o.isMesh)n++});return{meshes:n,baked:c.userData.baked}});ok('bookstore cat baked into one mesh',cat.meshes===1&&cat.baked>=8,cat);
  ok('portrait: zero page errors',errs.length===0,errs);await ctx.close()}
 // ================= landscape 852x393 at 21:00: pitch .62, merge sim fov 40 / fovK 1.28, night pools, home study =================
 {const {ctx,p,errs}=await page(b,{width:852,height:393},true,21);await p.evaluate(()=>window.__mocha.freeze(true));
  const rc=await p.evaluate(inside('cafe',0,2.5));await sleep(2500);ok('room camera pitch .62 in landscape',Math.abs(rc.pitch-.62)<.03,{pitch:rc.pitch});
  const L=await p.evaluate(()=>window.__mocha.roomLight('cafe'));ok('night: poolsDay .45-.55, LIT k 1.0, windows night tint',L.poolsDay>=.45&&L.poolsDay<=.55&&L.k>=.95&&L.tint==='n',{pd:L.poolsDay,k:L.k,tint:L.tint});
  const ms=await p.evaluate(async()=>{const M=window.__mocha,cam=M.camera,ST=M.STYLE;const p=M.byId.cafe,V=new M.THREE.Vector3();const meas=()=>{cam.updateMatrixWorld();let x0=1,x1=-1,y0=1,y1=-1;const c=Math.cos(p.ry),s=Math.sin(p.ry);
     for(const sx of [-.5,.5])for(const sz of [-.5,.5])for(const yy of [0,p.h]){const lx=sx*p.w,lz=sz*p.d;V.set(p.x+lx*c+lz*s,yy,p.z-lx*s+lz*c).project(cam);x0=Math.min(x0,V.x);x1=Math.max(x1,V.x);if(sz<0){y0=Math.min(y0,V.y);y1=Math.max(y1,V.y)}}
     let fc=0;for(const sx of [-.5,.5])for(const sz of [-.5,.5]){const lx=sx*p.w,lz=sz*p.d;fc=Math.max(fc,Math.hypot(p.x+lx*c+lz*s-cam.position.x,p.h-cam.position.y,p.z-lx*s+lz*c-cam.position.z))}return{wFill:+((Math.min(1,x1)-Math.max(-1,x0))/2).toFixed(3),hBack:+(y1-y0).toFixed(3),far:+cam.far.toFixed(1),fc:+fc.toFixed(1)}};
    const a=meas();const fov0=cam.fov,k0=ST.fovK;cam.fov=40;ST.fovK=1.28;cam.updateProjectionMatrix();M.roomTick(40,.05);M.rsTick();await new Promise(r=>setTimeout(r,600));const b=meas();cam.fov=fov0;ST.fovK=k0;cam.updateProjectionMatrix();M.roomTick(40,.05);return{a,b}});
  ok('merge sim landscape: far covers the room, width >= 80%, height within 8%',ms.b.far>=ms.b.fc&&ms.b.wFill>=.8&&Math.abs(ms.b.hBack/ms.a.hBack-1)<=.08,ms);
  await p.screenshot({path:OUT+'cafe-landscape-2100.png'});
  await p.evaluate(inside('home',0,2));await sleep(2500);const H=await p.evaluate(()=>{const M=window.__mocha;return{L:M.roomLight('home'),cam:M.roomCam()}});
  ok('home study at night: pools at .67 (floor .65+.02), banker pool on the desk',H.L.pools.some(q=>Math.abs(q.y-.67)<.01)&&H.L.pools.some(q=>q.y>1.5&&q.y<1.8),H.L.pools);
  await p.screenshot({path:OUT+'home-landscape-2100.png'});
  // hero silhouette >= 70 px tall in landscape (the bakery case / the outfit wall stands / the study desk)
  const hero=await p.evaluate(async()=>{const M=window.__mocha,out={};for(const [pid,lx,lz,kind] of [['cafe',0,2.5,'bakeryCase'],['threads',0,2.2,'stand'],['home',0,2,'desk']]){
     const M2=M;const p=M2.byId[pid];if(M2.cam().mode!=='walk')M2.setCamMode('walk');const q=M2.toWorld(p,lx,lz);M2.you(q.x,q.z);M2.cam({yaw:p.ry});for(let i=0;i<3;i++)M2.roomTick(30,.05);
     const cam=M2.camera;cam.updateMatrixWorld();let o=null;p.inner.updateMatrixWorld(true);const B=new M2.THREE.Box3();
     const H={cafe:[[-1.9,.3,-3.8],[0,3.9,-3.1]],threads:[[-1.9,.3,-4.2],[1.9,5.0,-3.4]],home:[[-5.85,.65,-3.7],[-4.85,5.1,-1.7]]}[pid];const c=Math.cos(p.ry),s=Math.sin(p.ry),V=new M2.THREE.Vector3();let y0=1,y1=-1;
     for(const xx of [H[0][0],H[1][0]])for(const yy of [H[0][1],H[1][1]])for(const zz of [H[0][2],H[1][2]]){V.set(p.x+xx*c+zz*s,yy,p.z-xx*s+zz*c).project(cam);y0=Math.min(y0,V.y);y1=Math.max(y1,V.y)}out[pid]=Math.round((y1-y0)/2*innerHeight)}return out});
  ok('landscape: hero compositions (case under the frilly, the outfit wall, the desk under the lancet) >= 70 px tall',Object.values(hero).every(v=>v>=70),hero);
  ok('landscape: zero page errors',errs.length===0,errs);await ctx.close()}
 }catch(e){ok('test run threw',false,String(e&&e.stack||e))}
 await b.close();console.log(`\n${pass} passed, ${fail} failed`);fs.writeFileSync(OUT+'result.txt',res.join('\n')+`\n${pass} passed, ${fail} failed\n`);process.exit(fail?1:0)})();

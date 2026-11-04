// B8 acceptance: node /tmp/harness/test-B8.js [func|shots|warm|all]   (screenshots -> /tmp/harness/out/b8-*.png)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const FILE='/home/user/Booknest/ghost-town/index.html',BACK='/tmp/harness/backup-B8.html',OUT='/tmp/harness/out/';
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VP={portrait:[{width:393,height:852},1],landscape:[{width:852,height:393},1],duo:[{width:900,height:1000},1],desktop:[{width:1100,height:820},0]};
const mode=process.argv[2]||'all';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' -> '+JSON.stringify(x).slice(0,400):''));if(!c)fails++};
async function page(b,vp,hour,file=FILE){const [v,mob]=VP[vp];const ctx=await b.newContext({viewport:v,isMobile:!!mob,hasTouch:!!mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));await p.goto('file://'+file);await p.waitForTimeout(4500);return{p,ctx,errs}}
// hold the camera on a fixed view (test-only CAM entry) and let it settle
const view=(p,v)=>p.evaluate(v=>{const M=window.__mocha;M.CAM.push('b8test',Object.assign({prio:3,lock:true,ease:40},v));M.cam.tick(80,.05);return true},v);
// mean colour of the scene render target (before post), read right after the next main render
const rtMean=p=>p.evaluate(()=>new Promise(res=>{const M=window.__mocha,R=M.renderer,o=R.render.bind(R);R.render=function(s,c){o(s,c);if(c===M.camera){R.render=o;const t=R.getRenderTarget();if(!t){res(null);return}const w=t.width,h=t.height,buf=new Uint8Array(w*h*4);R.readRenderTargetPixels(t,0,0,w,h,buf);let r=0,g=0,bl=0,warm=0,n=w*h;for(let i=0;i<buf.length;i+=4){r+=buf[i];g+=buf[i+1];bl+=buf[i+2];warm+=Math.max(0,buf[i]-buf[i+2])}res({r:+(r/n).toFixed(1),g:+(g/n).toFixed(1),b:+(bl/n).toFixed(1),warm:+(warm/n).toFixed(2)})}}}));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
if(mode==='func'||mode==='all'){
  // two reloads: overlaps, trees, lamps, glow pool, sign atlas
  const runs=[];for(let k=0;k<2;k++){const {p,ctx,errs}=await page(b,'portrait',15);
    const r=await p.evaluate(()=>{const M=window.__mocha;let oldLamps=0,glowSprites=0,b8Tex=new Set();M.scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===.12&&o.geometry.parameters.height===5)oldLamps++;if(o.isSprite&&o.visible)glowSprites++;if(o.isMesh&&o.userData.batch==='sign')b8Tex.add(o.material.map&&o.material.map.uuid)});
      return{ov:M.overlaps(),trees:M.trees(6),nTrees:M.treeCount(),lamps:M.lamps(),gp:M.glowPts(),sign:M.signInfo(),b8:M.b8(),oldLamps,glowSprites,signTex:b8Tex.size,atlas:M.signAtlas().length,places:M.byId.records.x+','+M.byId.petstore.x,
        lav:M.scene.children.filter(o=>o.isGroup&&Math.abs(o.position.x-42)<.1&&Math.abs(o.position.z-74)<.1).length,maple:[...M.S?[]:[]],pier:M.PIERS.length,dc:M.drawCalls()}});
    if(k===0){const u=await p.evaluate(()=>window.__mocha.signAtlas());fs.writeFileSync(OUT+'b8-sign-atlas.png',Buffer.from(u.split(',')[1],'base64'))}
    runs.push(r);ok(!errs.length,'no page errors (load '+(k+1)+')',errs);await ctx.close()}
  const r=runs[0];
  ok(r.ov.n===0,'overlap checker: 0 overlaps across PLACES, lots and 11-wide road bands',{n:r.ov.n,list:r.ov.list,checked:r.ov.checked,places:r.ov.places,lots:r.ov.lots});
  ok(r.ov.lots===8&&r.ov.places>=30,'checker covers every footprint place and all 8 lots (7 vacant + your cabin lot)',r.ov);
  ok(JSON.stringify(runs[0].trees)===JSON.stringify(runs[1].trees)&&runs[0].nTrees===runs[1].nTrees,'trees[0..5] identical across two reloads',{a:runs[0].trees,b:runs[1].trees,n:[runs[0].nTrees,runs[1].nTrees]});
  ok(r.lamps.posts.instanced&&r.lamps.heads.instanced&&r.lamps.posts.count===r.lamps.n&&r.lamps.heads.count===r.lamps.n&&r.lamps.heads.instanceColor,'lamps: 1 InstancedMesh for posts, 1 for heads (instanceColor)',r.lamps);
  ok(r.lamps.posts.color==='#2f4a44'&&r.lamps.pools.instanced&&r.lamps.pools.n>=r.lamps.n&&r.lamps.pools.cap===96,'lamp posts #2F4A44, ground light pools instanced (cap 96)',r.lamps.pools);
  ok(r.oldLamps===0,'no round-1 lamp pole meshes left',r.oldLamps);
  ok(r.gp.points&&r.gp.shader&&r.gp.bend&&r.gp.cap===384&&r.gp.n>=r.lamps.n+40,'GLOWPTS: one Points pool (cap 384, ShaderMaterial with bendP) holds the static halos',{n:r.gp.n,from:r.gp.from,converted:r.gp.converted});
  ok(r.gp.spritesLeft.every(s=>s>8||s<=6),'only moving / large-wash / hidden sprites remain outside the pool',r.gp.spritesLeft);
  ok(r.sign.sameTex&&r.signTex===1&&r.sign.w===1024&&r.sign.h===1024&&r.sign.cells>=30&&r.sign.strips>=6,'all B8 sign faces come from one 1024x1024 SIGN atlas',{meshes:r.sign.meshes,cells:r.sign.cells,strips:r.sign.strips,tex:r.signTex});
  ok(r.atlas>5000,'signAtlas() returns a dataURL',r.atlas);
  ok(r.lav===0&&r.places==='-15.5,8'&&r.pier===4,'lavender house gone; records/petstore reconciled off Needle Way; Pier 3 walkable',{lav:r.lav,places:r.places,piers:r.pier});
  ok(r.b8.square.board&&r.b8.square.jukebox&&r.b8.clock>0&&r.b8.fogCells===32,'square board canvas, jukebox halo, town clock, Fogwell window cells',r.b8);
  ok(typeof r.dc==='number'&&r.dc>0,'__mocha.drawCalls() reports draws',r.dc);
  // autonomy: B8 adds no user path that writes G.act/G.target/G.mode (static grep)
  const src=fs.readFileSync(FILE,'utf8'),k0=src.indexOf('B8 TOWN KIT'),k1=src.indexOf('function buildPlace(p)'),w0=src.indexOf('// street lamps (B8)'),w1=src.indexOf('b8World();const B8CONV');
  const b8src=src.slice(k0,k1)+src.slice(w0,w1);ok(k0>0&&w0>0&&!/G\.(act|target|mode)\s*=|startAct\(|goPoint\(/.test(b8src),'B8 code never writes G.act/G.target/G.mode or calls startAct/goPoint');
  // clock redraws once a minute on real time
  {const {p,ctx}=await page(b,'desktop',10.5);const c=await p.evaluate(async()=>{const M=window.__mocha;const m0=M.TCLK.m;const d0=M.TCLK.c.toDataURL();M.TCLK.m=-1;await new Promise(r=>setTimeout(r,1500));return{m0,m1:M.TCLK.m,now:Math.floor(Date.now()/60000),hh:new Date().getHours(),same:d0===M.TCLK.c.toDataURL()}});ok(c.m1===c.now&&c.hh===10,'town clock redraws from frame() on the minute (real time)',c);await ctx.close()}
}
if(mode==='shots'||mode==='all'){
  const V={square:{tx:-30,ty:1,tz:33,dist:36,pitch:.55,yaw:1.15},townhall:{tx:-44,ty:4,tz:33,dist:26,pitch:.28,yaw:1.4},fogwell:{tx:30,ty:9,tz:-60,dist:44,pitch:.22,yaw:.35},cabin:{tx:40,ty:1,tz:76,dist:34,pitch:.62,yaw:Math.PI+.35},
    cemetery:{tx:10,ty:1,tz:97,dist:32,pitch:.55,yaw:Math.PI+.4},willa:{tx:126,ty:2,tz:61,dist:24,pitch:.38,yaw:-Math.PI/2+.3},alley:{tx:-22,ty:2,tz:13,dist:20,pitch:.42,yaw:Math.PI+.2},main:{tx:20,ty:1,tz:2,dist:30,pitch:.42,yaw:.25},lot:{tx:-31,ty:1,tz:70,dist:30,pitch:.5,yaw:Math.PI+.2}};
  for(const [hour,list] of [[15,['square','townhall','fogwell','cabin','willa','lot']],[21,['square','cemetery','alley','main','willa']]]){const {p,ctx,errs}=await page(b,'desktop',hour);
    for(const k of list){await view(p,V[k]);await p.waitForTimeout(2600);await p.screenshot({path:`${OUT}b8-${k}-h${hour}.png`})}ok(!errs.length,'no errors during shots h'+hour,errs);await ctx.close()}
  for(const vp of ['portrait','landscape','duo','desktop']){const {p,ctx,errs}=await page(b,vp,15);await p.screenshot({path:`${OUT}b8-default-${vp}.png`});
    await p.evaluate(()=>window.__mocha.toggleMap(true));await p.waitForTimeout(900);await p.screenshot({path:`${OUT}b8-map-${vp}.png`});ok(!errs.length,'no errors '+vp,errs);await ctx.close()}
}
if(mode==='warm'||mode==='all'){
  // lamp-centred street views that exist in both builds (Fog Street, Needle Way, Main Street) + lamp counts
  const V=[['fog',{tx:16,ty:1,tz:-44,dist:22,pitch:.6,yaw:-1.2}],['needle',{tx:-10,ty:1,tz:-16,dist:20,pitch:.55,yaw:1.2}],['main',{tx:16,ty:1,tz:5,dist:20,pitch:.55,yaw:-.9}]];
  const res={};for(const [nm,f] of [['before',BACK],['after',FILE]]){const {p,ctx}=await page(b,'portrait',21,f);res[nm]={sum:0};
    res[nm].lamps=await p.evaluate(()=>{const M=window.__mocha;if(M.lamps)return M.lamps().n;let n=0;M.scene.traverse(o=>{if(o.isMesh&&o.geometry&&o.geometry.type==='CylinderGeometry'&&o.geometry.parameters.radiusTop===.12&&o.geometry.parameters.height===5)n++});return n});
    for(const [k,v] of V){await view(p,v);await p.waitForTimeout(1800);const m=await rtMean(p);res[nm][k]=m;res[nm].sum+=m.warm;await p.screenshot({path:`${OUT}b8-warm-${k}-${nm}.png`})}await ctx.close()}
  console.log(JSON.stringify(res));
  ok(res.after.sum>=res.before.sum,'21:00: lamp-lit streets at least as warm as before (sum of warm channel over 3 views)',{before:+res.before.sum.toFixed(2),after:+res.after.sum.toFixed(2)});
  ok(res.after.lamps>=res.before.lamps-4,'lamp count kept (lamps standing in a roadway or on a new footprint are dropped)',{before:res.before.lamps,after:res.after.lamps})}
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

// B15 acceptance: node /tmp/harness/test-B15.js [file] [noshots]
// PATCH cache key (sway vs non-sway = 2 programs), RIM follows the sky + interiors, rim on Mocha/pets, precompile at load,
// program count vs backup, no hitch/new programs across the sunset (clock jump 16:00 -> 18:30), grade(); screenshots h12/h17.2/h21/#winter portrait+desktop.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const FILE=process.argv[2]||'/home/user/Booknest/ghost-town/index.html',SHOTS=process.argv[3]!=='noshots',OUT='/tmp/harness/b15/shots/';fs.mkdirSync(OUT,{recursive:true});
// faked clock with a mutable offset (window.__toff) so the test can jump across the sunset
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);window.__toff=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+window.__toff)}static now(){return R.now()+window.__toff}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const res=[];const ok=(name,pass,info)=>{res.push([pass?'PASS':'FAIL',name,info]);console.log(pass?'PASS':'FAIL',name,info===undefined?'':JSON.stringify(info).slice(0,700))};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
async function page(h,vp,mobile,hash='',file=FILE){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file+hash);await sleep(5000);return{ctx,p,errs}}
const DESK={width:1100,height:820},PORT={width:393,height:852};

if(process.env.ONLY!=='ft'){
// 1) desktop at 21:00: precompile, cache key, rim at night on Mocha + pets
{const {ctx,p,errs}=await page(21,DESK,false);
  const r=await p.evaluate(async()=>{const M=window.__mocha;const pr0=M.programs();
    // a pet so the rim on pets is visible
    if(!M.S.pets.length)M.adoptPet&&M.adoptPet('cat','Soot');await new Promise(r=>setTimeout(r,800));
    // sway vs non-sway ToonM with identical params (unique alphaTest so neither variant exists yet)
    const T=window.THREE,mk=sw=>{const m=new M.ToonM({color:'#88aa77',alphaTest:.3137});if(sw)m.userData.sway=true;const o=new T.Mesh(new T.BoxGeometry(1,1,1),m);o.position.set(40,-30,42);M.scene.add(o);return o};
    const n0=M.renderer.info.programs.length,a=mk(false),c=mk(true);M.renderer.compile(M.scene,M.camera);const n1=M.renderer.info.programs.length;
    const pa=M.renderer.properties.get(a.material).currentProgram,pc=M.renderer.properties.get(c.material).currentProgram;
    // and a third identical non-sway one must SHARE the first program
    const d=mk(false);M.renderer.compile(M.scene,M.camera);const n2=M.renderer.info.programs.length,pd=M.renderer.properties.get(d.material).currentProgram;
    const keyA=a.material.customProgramCacheKey(),keyC=c.material.customProgramCacheKey();[a,c,d].forEach(o=>M.scene.remove(o));
    return{pr0,n0,n1,n2,keyA,keyC,distinct:pa!==pc&&!!pa&&!!pc,shared:pa===pd,rim:M.rim(),grade:M.grade()}});
  const cd=(a,b)=>{const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=h(a),B=h(b);return Math.max(...A.map((v,i)=>Math.abs(v-B[i])))};
  ok('precompile ran at load (renderer.compile)',r.pr0.compileMs>0&&r.pr0.afterCompile>=r.pr0.boot&&!r.pr0.err,r.pr0);
  ok('sway + non-sway ToonM (same params) compile to 2 programs',r.n1-r.n0===2&&r.distinct&&r.keyA!==r.keyC,{n0:r.n0,n1:r.n1,keyA:r.keyA,keyC:r.keyC});
  ok('identical non-sway ToonM shares its program',r.shared&&r.n2===r.n1,{n2:r.n2});
  ok('rim flagged on Mocha (character ramp) and every pet mesh',r.rim.mocha&&r.rim.mochaRamp&&r.rim.pets.length>0&&r.rim.pets.every(q=>q.rim===q.meshes&&q.meshes>0),r.rim);
  ok('RIM at night sits between the night key (.35) and the interior key (.3)',r.rim.night>.9&&r.rim.amt>=.295&&r.rim.amt<=.355,{col:r.rim.col,amt:r.rim.amt,inside:r.rim.inside,night:r.rim.night});
  // put Mocha outdoors on the square, then indoors at home: RIM follows
  const out=await p.evaluate(async()=>{const M=window.__mocha,G=M.G,park=(x,z)=>{G.x=x;G.z=z;G.mode='idle';G.timer=1e4;G.act=null},until=async(f,ms=40000)=>{const t0=Date.now();while(!f()&&Date.now()-t0<ms)await new Promise(r=>setTimeout(r,500))};
    park(-30,29);await until(()=>M.rim().inside<.02);const o=M.rim();park(38,41);await until(()=>M.rim().inside>.98);const i=M.rim();return{o,i}});
  ok('RIM outdoors at night ~ night key #9FB4FF/.35',out.o.inside<.05&&cd(out.o.col,'#9fb4ff')<=12&&Math.abs(out.o.amt-.35)<.01,out.o);
  ok('RIM eases to the interior key #FFC88A/.3 when Mocha is indoors',out.i.inside>.95&&cd(out.i.col,'#ffc88a')<=12&&Math.abs(out.i.amt-.3)<.01,out.i);
  ok('grade(): night hemisphere ~ #8A96D8/#2A2A3A (nightAmt blend), night sky keys',cd(r.grade.hemi.sky,'#8a96d8')<=12&&cd(r.grade.hemi.ground,'#2a2a3a')<=12&&r.grade.keys[0][1]==='#141E4A',{hemi:r.grade.hemi,sky:r.grade.sky,night:r.grade.night});
  ok('families applied (cafe brick, bookstore sage, evergreen log, Wendell butter)',r.grade.fam.cafe.wall==='#C9735E'&&r.grade.fam.bookstore.wall==='#9DB89A'&&r.grade.fam.evergreen.wall==='#B07A4A'&&r.grade.fam.neighbor.wall==='#F1D58A'&&r.grade.fam.home.fam==='gothic',r.grade.fam);
  ok('no page errors (desktop 21)',!errs.length,errs);
  if(SHOTS){await p.evaluate(async()=>{const M=window.__mocha,G=M.G;G.x=-30;G.z=29;G.mode='idle';G.timer=1e4;M.setCamMode('follow');await new Promise(r=>setTimeout(r,3000))});await p.screenshot({path:OUT+'desktop-h21-rim.png'})}
  await ctx.close()}

// 2) day vs golden hour rim + hemisphere (desktop h12, h17.2)
const cd=(a,b)=>{const h=x=>[1,3,5].map(i=>parseInt(x.slice(i,i+2),16));const A=h(a),B=h(b);return Math.max(...A.map((v,i)=>Math.abs(v-B[i])))};
for(const h of [12,17.2]){const {ctx,p,errs}=await page(h,DESK,false);
  const r=await p.evaluate(async()=>{const M=window.__mocha,G=M.G;G.x=-30;G.z=29;G.mode='idle';G.timer=1e4;G.act=null;const t0=Date.now();while(M.rim().inside>.02&&Date.now()-t0<40000)await new Promise(r=>setTimeout(r,500));return{rim:M.rim(),grade:M.grade(),pg:M.programs()}});
  if(h===12){ok('RIM at noon = day key #FFF4E0/.25, hemi day colors',cd(r.rim.col,'#fff4e0')<=6&&Math.abs(r.rim.amt-.25)<.01&&r.grade.hemi.sky.toLowerCase()==='#cbd6ff'&&r.grade.hemi.ground.toLowerCase()==='#a39b7a',{rim:r.rim,hemi:r.grade.hemi});res.h12=r.pg.n}
  else ok('RIM at 17:12 has left the day key (golden/sunset/night blend, amt > .25)',r.rim.col.toLowerCase()!=='#fff4e0'&&r.rim.amt>.27,{rim:r.rim,sky:r.grade.sky});
  ok('no page errors (desktop '+h+')',!errs.length,errs);await ctx.close()}

// 3) program count vs the backup (desktop h12 after 10 s)
{const bk='/tmp/harness/backup-B15.html';const {ctx,p}=await page(12,DESK,false,'',bk);await sleep(5000);const nb=await p.evaluate(()=>window.__mocha.gfx().progs);await ctx.close();
 const {ctx:c2,p:p2}=await page(12,DESK,false);await sleep(5000);const na=await p2.evaluate(()=>window.__mocha.programs());await c2.close();
 ok('program count rises by 8 or fewer (backup vs now, desktop h12 +10 s)',na.n-nb<=8,{backup:nb,now:na.n,afterCompile:na.afterCompile,boot:na.boot,compileMs:na.compileMs,keys:na.keys})}

// 4) across the sunset: load 16:00, jump the clock to 18:30; no new programs and no frame hitch; then 17:20 frame times
{const {ctx,p,errs}=await page(16,DESK,false);
  const r=await p.evaluate(async()=>{const M=window.__mocha;await new Promise(r=>setTimeout(r,3000));const n0=M.renderer.info.programs.length;const ft=[];let last=performance.now(),on=true;
    const loop=t=>{ft.push(t-last);last=t;if(on)requestAnimationFrame(loop)};requestAnimationFrame(loop);await new Promise(r=>setTimeout(r,4000));const pre=ft.length;window.__toff+=2.5*3600e3;
    await new Promise(r=>setTimeout(r,8000));on=false;const n1=M.renderer.info.programs.length;const a=ft.slice(2,pre),bb=ft.slice(pre),med=x=>{const s=[...x].sort((p,q)=>p-q);return s[s.length>>1]};
    return{n0,n1,medPre:Math.round(med(a)),maxPost:Math.round(Math.max(...bb)),medPost:Math.round(med(bb)),night:M.grade().night}});
  ok('crossing sunset compiles no new programs',r.n1-r.n0<=0,r);
  ok('crossing sunset: worst frame < 2x the median',r.maxPost<2*Math.max(r.medPre,r.medPost),r);
  ok('no page errors (sunset jump)',!errs.length,errs);await ctx.close()}
}
// 17:20: per-frame CPU time from the very first frame (init-script recorder); compiles happen at load, so after the first frame p95 < 2x median and no new programs
{const ctx=await b.newContext({viewport:DESK});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(17+20/60));await p.addInitScript(()=>{window.__ft=[];const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{const s=performance.now();cb(t);window.__ft.push(performance.now()-s)})});
  await p.goto('file://'+FILE);await sleep(6000);const n0=await p.evaluate(()=>window.__mocha.renderer.info.programs.length);await sleep(14000);
  const r=await p.evaluate(n0=>{const a=window.__ft.filter(x=>x>1),rest=a.slice(1),s=[...rest].sort((x,y)=>x-y);return{n:a.length,first:Math.round(a[0]),med:Math.round(s[s.length>>1]),p95:Math.round(s[Math.floor(s.length*.95)]),max:Math.round(s[s.length-1]),newProgs:window.__mocha.renderer.info.programs.length-n0,progs:window.__mocha.programs()}},n0);
  ok('17:20 frame time: p95 < 2x median after the first frame, 0 programs compiled after load',r.p95<2*r.med&&r.newProgs===0,r);ok('no page errors (17:20)',!errs.length,errs);await ctx.close()}

if(process.env.ONLY!=='ft'){
// 5) screenshots: h12, h17.2, h21, #winter in portrait + desktop; a town view (shops) and the default follow view
if(SHOTS)for(const [h,hash] of [[12,''],[17.2,''],[21,''],[12,'#winter']])for(const [vn,vp,mob] of [['portrait',PORT,true],['desktop',DESK,false]]){
  const {ctx,p,errs}=await page(h,vp,mob,hash);const tag=`${vn}-h${h}${hash?'-winter':''}`;
  await p.screenshot({path:OUT+tag+'-follow.png'});
  await p.evaluate(async()=>{const M=window.__mocha;M.CAM.push('t15',{prio:3,lock:true,ease:40,tx:-14,ty:1,tz:22,dist:44,pitch:.5,yaw:Math.PI*.82});M.cam.tick&&0;await new Promise(r=>setTimeout(r,3500))});
  await p.screenshot({path:OUT+tag+'-town.png'});if(errs.length)ok('no page errors ('+tag+')',false,errs);await ctx.close()}
}
await b.close();const f=res.filter(x=>x[0]==='FAIL');console.log(f.length?`${f.length} FAILED`:'ALL PASS');process.exit(f.length?1:0)})();

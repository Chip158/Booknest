// B9 acceptance: node /tmp/harness/test-B9.js [func|shots|all]   (screenshots -> /tmp/harness/out/b9-*.png)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const FILE='/home/user/Booknest/ghost-town/index.html',OUT='/tmp/harness/out/';
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VP={portrait:[{width:393,height:852},1],landscape:[{width:852,height:393},1],duo:[{width:900,height:1000},1],desktop:[{width:1100,height:820},0]};
const mode=process.argv[2]||'all';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' -> '+JSON.stringify(x).slice(0,500):''));if(!c)fails++};
async function page(b,vp,hour){const [v,mob]=VP[vp];const ctx=await b.newContext({viewport:v,isMobile:!!mob,hasTouch:!!mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));await p.goto('file://'+FILE);await p.waitForTimeout(4500);return{p,ctx,errs}}
const view=(p,v)=>p.evaluate(v=>{const M=window.__mocha;M.CAM.push('b9test',Object.assign({prio:3,lock:true,ease:40},v));M.cam.tick(80,.05);return true},v);
// walker approach: stand `back` units out from door id, facing it, moving; step the 20 Hz door tick
const APPROACH=`(id,back,moving)=>{const M=window.__mocha,d=M.DBY[id];M.setCamMode('walk');const x=d.wx+d.nx*back,z=d.wz+d.nz*back;M.walker(x,z,Math.atan2(-d.nx,-d.nz),moving);M.cam({yaw:Math.atan2(-d.nx,-d.nz)+Math.PI,tx:x,tz:z});return{x,z}}`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
if(mode==='func'||mode==='all'){
  {const {p,ctx,errs}=await page(b,'portrait',10);
    const r=await p.evaluate(()=>{const M=window.__mocha,D=M.doors(),cp=M.camera.position;
      const enter=['cafe','records','bookstore','library','market','thrift','grocery','petstore','cinema','studio','phones','bikes','station','arcade','bakery','threads','nursery','evergreen','lantern','townhall','fogwell','home','neighbor','cabin','willa'];
      const missing=enter.filter(id=>!M.byId[id].door),bad=D.filter(d=>d.walk.off!=null&&d.walk.off>.3).map(d=>[d.id,d.walk.off]);
      let atlasMeshes=0,mats=new Set();M.scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.map===M.DATL.tex){atlasMeshes++;mats.add(o.material.uuid)}});
      const far=D.filter(d=>Math.hypot(d.x-cp.x,d.z-cp.z)>61),near=D.filter(d=>Math.hypot(d.x-cp.x,d.z-cp.z)<55);
      return{n:D.length,missing,bad,atlasMeshes,mats:mats.size,inst:M.DIM.im.isInstancedMesh,count:M.DIM.n,farHidden:far.every(d=>!d.vis),farN:far.length,nearShown:near.every(d=>d.vis),nearN:near.length,kinds:[...new Set(D.map(d=>d.kind))],styles:[...new Set(D.map(d=>d.style))].length,backs:D.filter(d=>d.walk.off==null).map(d=>d.id)}});
    ok(r.n>=24&&!r.missing.length,'>= 24 doors and every enterable place has p.door',{n:r.n,missing:r.missing});
    ok(!r.bad.length,'every front walk lines up with its door centre within 0.3',r.bad);
    ok(r.atlasMeshes===1&&r.mats===1&&r.inst,'every door leaf / plank / chalkboard / note is one InstancedMesh with the one door-atlas material',r);
    ok(r.farHidden&&r.farN>0&&r.nearShown,'doors more than 60 from the camera are hidden; near ones shown',{far:r.farN,near:r.nearN});
    ok(r.kinds.length===6&&r.styles>=12,'six door kinds and 12+ atlas styles',{kinds:r.kinds,styles:r.styles,backs:r.backs});
    // café approach at 10:00: opens past 1.05 within 1 s; closes within 2.5 s after leaving
    const a=await p.evaluate(`(()=>{const M=window.__mocha;(${APPROACH})('cafe',1.35,1);let t=0,tOpen=-1;for(;t<1.5;t+=.05){M.doorStep(.05);if(tOpen<0&&M.DBY.cafe.ang>=1.05)tOpen=t+.05}const max=M.DBY.cafe.ang;
      M.walker(-30,-6,0,0);let tc=-1;for(t=0;t<4;t+=.05){M.doorStep(.05);if(tc<0&&M.DBY.cafe.ang<.03)tc=t+.05}return{tOpen:+tOpen.toFixed(2),max:+max.toFixed(3),tClose:+tc.toFixed(2),ui:M.doorUI()}})()`);
    ok(a.tOpen>0&&a.tOpen<=1,'10:00 café: walker approach opens the door past 1.05 rad within 1 s',a);
    ok(a.tClose>0&&a.tClose<=2.5,'café door closes within 2.5 s after the walker leaves',a.tClose);
    // banner on crossing, OCC after door.pass
    const o=await p.evaluate(()=>{const M=window.__mocha;M.walker(-30,12,0,1);M.doorStep(.6);const ui=M.doorUI(),occIn=M.occ('cafe');M.walker(-30,2,Math.PI,1);M.doorStep(.6);const occOut=M.occ('cafe');
      M.doorPass('cafe','wendell','in');const w=M.occ('cafe');M.doorPass('cafe','wendell','out');return{ui,occIn,occOut,w,w2:M.occ('cafe'),seen:M.S.you.doors.slice()}});
    ok(o.occIn.ids.includes('you')&&o.occIn.ids.includes('juniper')&&!o.occOut.ids.includes('you'),'occ(cafe) reflects the walker after door.pass in/out (keeper stays)',{in:o.occIn,out:o.occOut});
    ok(o.w.ids.includes('wendell')&&!o.w2.ids.includes('wendell'),'occ(cafe) reflects a direct door.pass(agent)',{w:o.w.ids,w2:o.w2.ids});
    ok(/Drizzle &amp; Bean Café · Juniper is in · open till 7pm/.test(o.ui.banner)&&o.ui.bannerOn&&/first visit/.test(o.ui.banner)&&o.seen.includes('cafe'),'entry banner in HUD slot banner, with first-visit sparkle',o.ui.banner);
    // planks + chalkboards + flipSign
    const f=await p.evaluate(()=>{const M=window.__mocha;M.CAM.push('b9t',{prio:3,lock:true,ease:40,tx:-30,ty:1,tz:6,dist:10,pitch:.3,yaw:Math.PI});M.cam.tick(60,.05);M.signAuto(false);M.doorStep(.1);const a0=M.doors().find(d=>d.id==='cafe').plank;M.flipSign('cafe',false);M.doorStep(.2);const mid=M.doors().find(d=>d.id==='cafe').plank;M.doorStep(.4);const a1=M.doors().find(d=>d.id==='cafe').plank;
      const ch=M.doors().filter(d=>d.chalk.length).map(d=>[d.pid,d.chalkLine]);M.flipSign('cafe',true);M.doorStep(.6);M.signAuto(true);M.CAM.pop('b9t');return{a0,mid,a1,ch,again:M.doors().find(d=>d.id==='cafe').plank}});
    ok(f.a0.open&&f.a0.on&&f.a0.ry===0&&f.mid.ry>.2&&f.mid.ry<3&&Math.abs(f.a1.ry-Math.PI)<.01&&f.again.ry<.01,'flipSign animates the OPEN/CLOSED plank 180 deg over .4 s when seen',{a0:f.a0,mid:f.mid,a1:f.a1});
    ok(f.ch.length>=12&&f.ch.some(c=>c[0]==='cinema'&&/^tonight 8pm: |NOW|weather|season|spring|cozy|cocoa|cider|pumpkin|leaf/.test(c[1])),'chalkboards with a seeded daily special (cinema shows a real film)',f.ch);
    ok(!errs.length,'no page errors (10:00 portrait)',errs);await ctx.close()}
  // 21:00 café locked: rattle + Closed toast
  {const {p,ctx,errs}=await page(b,'portrait',21);
    const r=await p.evaluate(`(()=>{const M=window.__mocha;const ev=[];M.DOOREV.on('rattle',d=>ev.push(d.pid));(${APPROACH})('cafe',1.35,1);M.doorStep(.5);return{ev,d:M.doors().find(d=>d.id==='cafe'),ui:M.doorUI()}})()`);
    ok(r.ev.includes('cafe')&&r.d.locked&&r.d.ang<.05&&/Closed, opens 6am/.test(r.ui.toast)&&r.ui.toastOn,'21:00 café is locked: walking into it rattles and toasts "Closed"',{ev:r.ev,ang:r.d.ang,toast:r.ui.toast});
    ok(!errs.length,'no page errors (21:00)',errs);await ctx.close()}
  // Mocha home + awake: the door opens, he calls out from where he is; G.act/G.target untouched
  {const {p,ctx,errs}=await page(b,'portrait',15);
    const r=await p.evaluate(`(()=>{const M=window.__mocha,G=M.G;G.x=34;G.z=40;G.mode='idle';G.act=null;G.target=null;G.timer=50;const before=JSON.stringify({act:G.act,target:G.target,x:G.x,z:G.z});
      (${APPROACH})('home',1.4,1);let t=0,tOpen=-1;for(;t<1.2;t+=.05){M.doorStep(.05);if(tOpen<0&&M.DBY.home.ang>=1.05)tOpen=t}
      const after=JSON.stringify({act:G.act,target:G.target,x:G.x,z:G.z}),bub=document.querySelector('#bubble').textContent,k=M.knock('home'),ub=M.userBias(Object.assign({},M.ACTS[0],{greet:1}));
      return{tOpen,before,after,bub,k,locked:M.doors().find(d=>d.id==='home').locked,ub,dvis:M.doorUI().dvis}})()`);
    ok(r.tOpen>=0&&r.tOpen<1&&!r.locked,'Mocha home and awake: his door is unlocked and opens for the walker',r);
    ok(/open/.test(r.bub)&&r.k.ans==='callout'&&/open|bath/.test(r.k.line),'he calls out "it\'s open!" (say bubble) and answerKnock picks only his line',{bub:r.bub,k:r.k});
    ok(r.before===r.after,'G.act and G.target (and his position) identical before and after',{before:r.before,after:r.after});
    ok(r.ub.parts.some(x=>x[0]==='atDoor'&&x[1]===.6)&&r.ub.total<=1.2,'userBias term atDoor (+.6) feeds his own greet candidate',r.ub);
    // a note on his door while he is out
    const n=await p.evaluate(`(()=>{const M=window.__mocha,G=M.G;G.act=M.ACTS.find(a=>a.p==='cafe');G.mode='activity';G.x=-30;G.z=13;G.timer=60;M.doorStep(.3);const d=M.doors().find(d=>d.id==='home');(${APPROACH})('home',1.8,0);return{note:d.note,locked:d.locked}})()`);
    let near='';for(let i=0;i<8&&!/note on the door/.test(near);i++){await p.waitForTimeout(700);near=await p.evaluate(()=>{const M=window.__mocha;return M.doorUI().near+' | you '+JSON.stringify(window.__you())+' note '+M.doors().find(d=>d.id==='home').note})}
    ok(/out at Drizzle & Bean Café -M/.test(n.note)&&n.locked,'a door note shows on Mocha\'s door while he is out (door locked)',n);
    ok(/note on the door/.test(near),'the note is readable in the near pill within 3',near);
    ok(!errs.length,'no page errors (15:00)',errs);await ctx.close()}
  // asleep at 3:00: no answer; Wendell: Knock? chip and answerKnock opens when home + awake
  {const {p,ctx,errs}=await page(b,'portrait',3);
    const r=await p.evaluate(`(()=>{const M=window.__mocha,G=M.G;G.x=38;G.z=40;const ga=JSON.stringify({a:G.act,t:G.target});(${APPROACH})('home',1.4,1);M.doorStep(.6);const d=M.doors().find(d=>d.id==='home'),ui=M.doorUI(),k=M.knock('home');return{d,ui,k,ak:M.answerKnock('home'),same:ga===JSON.stringify({a:G.act,t:G.target}),bub:document.querySelector('#bubble').classList.contains('show')?document.querySelector('#bubble').textContent:''}})()`);
    ok(r.k.ans==='none'&&!r.k.line&&r.d.locked&&r.d.ang<.05&&r.same,'3:00 Mocha asleep: his door stays shut and there is no answer',{k:r.k,ang:r.d.ang,locked:r.d.locked});
    ok(!errs.length,'no page errors (3:00)',errs);await ctx.close()}
  {const {p,ctx,errs}=await page(b,'portrait',11);
    const r=await p.evaluate(`(()=>{const M=window.__mocha;const W=M.W||null;return 1})()`);
    const w=await p.evaluate(`(()=>{const M=window.__mocha;M.wForce('porch');(${APPROACH})('neighbor',1.5,1);M.doorStep(.5);const ui=M.doorUI(),d0=M.doors().find(d=>d.id==='neighbor');const k=M.knock('neighbor');M.doorStep(1);const d1=M.doors().find(d=>d.id==='neighbor');
      M.wForce('park');const k2=M.answerKnock('neighbor');M.wForce('inside');const k3=M.answerKnock('neighbor');return{chip:ui.knock,chipText:ui.knockText,locked:d0.locked,ang0:d0.ang,k,ang1:d1.ang,k2,k3}})()`);
    ok(w.chip&&/Knock/.test(w.chipText)&&w.locked&&w.ang0<.05,'Wendell\'s door is locked and a "Knock?" chip appears',w);
    ok(w.k.ans==='open'&&/come in/.test(w.k.line)&&w.ang1>=1.05,'answerKnock: Wendell home and awake comes to the door and opens it',{k:w.k,ang:w.ang1});
    ok(w.k2.ans==='none','Wendell out: no answer',w.k2);
    await p.screenshot({path:OUT+'b9-knock-portrait.png'});
    ok(!errs.length,'no page errors (11:00)',errs);await ctx.close()}
  // autonomy (static): the B9 kit never writes G.act/G.target/G.mode or calls startAct/goPoint
  const src=fs.readFileSync(FILE,'utf8'),k0=src.indexOf('B9 DOORS: one'),k1=src.indexOf("PLACES.filter(p=>p.kind!=='spot').forEach(buildPlace)");const b9=src.slice(k0,k1);
  ok(k0>0&&!/G\.(act|target|mode|x|z)\s*=[^=]|startAct\(|goPoint\(/.test(b9),'B9 door code never writes G.act/G.target/G.mode/G.x or calls startAct/goPoint');
}
if(mode==='shots'||mode==='all'){
  const V={cafe:{tx:-29,ty:1.6,tz:7,dist:13,pitch:.22,yaw:Math.PI+.4},home:{tx:41,ty:2,tz:53,dist:15,pitch:.2,yaw:.3},neighbor:{tx:14,ty:1.5,tz:46,dist:11,pitch:.2,yaw:-.35},books:{tx:12,ty:1.6,tz:8,dist:12,pitch:.2,yaw:Math.PI-.3},
    market:{tx:-36,ty:1.6,tz:-10,dist:12,pitch:.25,yaw:.3},townhall:{tx:-43,ty:3,tz:33,dist:12,pitch:.2,yaw:Math.PI/2+.3},grocery:{tx:88,ty:1.6,tz:-9.5,dist:10,pitch:.2,yaw:.35},cabin:{tx:40,ty:1,tz:64,dist:10,pitch:.35,yaw:Math.PI-.4},cinema:{tx:40,ty:1.6,tz:10,dist:10,pitch:.2,yaw:Math.PI+.3}};
  for(const [hour,list,openers] of [[15,['cafe','home','neighbor','books','market','townhall','grocery','cabin','cinema'],['cafe','home','home:gate','grocery','cinema','market','cabin','townhall']],[21,['cafe','home','books'],['home']]]){const {p,ctx,errs}=await page(b,'desktop',hour);
    await p.evaluate(o=>{const M=window.__mocha;for(const id of o)M.door(id,'open')},openers);
    for(const k of list){await view(p,V[k]);await p.evaluate(()=>window.__mocha.doorStep(1.2));await p.waitForTimeout(2200);await p.screenshot({path:`${OUT}b9-${k}-h${hour}.png`})}ok(!errs.length,'no errors during shots h'+hour,errs);await ctx.close()}
  {const {p,ctx}=await page(b,'desktop',15);const u=await p.evaluate(()=>window.__mocha.doorAtlas());fs.writeFileSync(OUT+'b9-door-atlas.png',Buffer.from(u.split(',')[1],'base64'));await ctx.close()}
  for(const vp of ['portrait','landscape','duo','desktop']){const {p,ctx,errs}=await page(b,vp,10);await p.screenshot({path:`${OUT}b9-default-${vp}.png`});
    await p.evaluate(`(()=>{const M=window.__mocha;(${APPROACH})('records',1.3,1);M.doorStep(.3);M.walker(-15.5,12,0,1);M.doorStep(.6);M.toast&&0;return 1})()`);await p.waitForTimeout(700);await p.screenshot({path:`${OUT}b9-banner-${vp}.png`});
    await p.evaluate(`(()=>{const M=window.__mocha;M.wForce('porch');(${APPROACH})('neighbor',1.5,0);M.doorStep(.3);return 1})()`);await p.waitForTimeout(1200);await p.screenshot({path:`${OUT}b9-chip-${vp}.png`});ok(!errs.length,'no errors '+vp,errs);await ctx.close()}
}
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

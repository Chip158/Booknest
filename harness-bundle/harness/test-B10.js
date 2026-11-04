// B10 acceptance: street navigation and agent routes. node /tmp/harness/test-B10.js [shots]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const shots=process.argv[2]==='shots';
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x):''));if(!c)fails++};
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);
// 0) graph basics + hooks
let r=await p.evaluate(()=>{const M=window.__mocha;return{nodes:M.nav(),info:M.navInfo(),rg1:M.regrid('cafe'),rg2:M.regrid('cafe')}});
ok(r.nodes>=200&&r.nodes<=600,'NAV built ('+r.nodes+' nodes, '+r.info.edges+' edges; kinds path/approach/threshold/inside '+r.info.kinds.join('/')+')');
ok(r.info.warn.every(w=>w==='station:back'),'every door approach and place joins the network (station back door reachable through the station)',r.info.warn);
ok(r.rg1&&r.rg1.blocked>0&&JSON.stringify(r.rg1)===JSON.stringify(r.rg2),'regrid(cafe) is re-runnable',r.rg1);
// 1) home door -> cafe counter: both door chains, no foreign footprint (sampled every .5), stays on NAV outside the two buildings
r=await p.evaluate(()=>{const M=window.__mocha,hm=M.byId.home,cf=M.byId.cafe,a=M.spotWorld?0:0;const s={x:40,z:44},cs=M.KEEPERS.find(k=>k.shop==='cafe').ask,c=[cf.x-cs[0],cf.z-cs[1]];
  const R=M.route(s.x,s.z,c[0],c[1],'mocha'),E=M.navEdges();let foreign=[],off=0,maxOff=0;const dE=(x,z)=>{let b=1e9;for(const [ax,az,bx,bz] of E){const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L2));b=Math.min(b,Math.hypot(ax+dx*t-x,az+dz*t-z))}return b};
  for(let i=1;i<R.pts.length;i++){const [ax,az]=R.pts[i-1],[bx,bz]=R.pts[i],L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/.5));for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,z=az+(bz-az)*k/n,f=M.inFoot(x,z,0,hm,cf);if(f)foreign.push([f.id,+x.toFixed(1),+z.toFixed(1)]);
    const pl=M.placeOf(x,z);if(!pl){const d=dE(x,z);maxOff=Math.max(maxOff,d);if(d>.75)off++}}}
  const fl=R.flags,DOOR=16,IN=32,thr=R.pts.filter((q,i)=>fl[i]&DOOR).length,ins=R.pts.filter((q,i)=>fl[i]&IN).length;
  return{n:R.n,kind:R.kind,doors:R.doors,foreign:foreign.slice(0,5),nf:foreign.length,off,maxOff:+maxOff.toFixed(2),thr,ins,ms:R.ms,pts:R.pts}});
ok(r.doors.includes('home')&&r.doors.includes('home:gate')&&r.doors.includes('cafe')&&r.thr>=3&&r.ins>=3,'route(home -> cafe counter) passes both door chains',{doors:r.doors,thresholds:r.thr,inside:r.ins,n:r.n});
ok(r.nf===0,'route never enters a foreign footprint (sampled every .5)',r.foreign);
ok(r.off===0,'outside the two buildings the route stays on NAV edges (max off '+r.maxOff+')');
// 2) forcing an act at the cafe from home: no roof flight, enters through the cafe door
r=await p.evaluate(()=>{const M=window.__mocha,G=M.G;M.navLogClear();M.wForce('inside');G.x=40;G.z=44;G.vx=G.vz=0;G.y=M.navFloor(40,44)+1;G.mode='idle';G.timer=1e4;G.route=null;G.ride=null;G.sleep=false;
  const a=M.ACTS.find(x=>x.p==='cafe'&&x.s==='counter'&&!x.fx)||M.ACTS.find(x=>x.p==='cafe'&&!x.fx);M.startAct(Object.assign({},a));let maxY=-9,maxRel=-9,steps=0,mode='';
  M.navSim(80,k=>{steps=k;if(G.mode==='travel'){const rel=G.y-M.navFloor(G.x,G.z);if(rel>maxRel)maxRel=rel}if(G.mode!=='travel'){mode=G.mode;return false}});
  const L=M.navLog(),pass=L.filter(e=>(e.ev==='pass'||e.ev==='cross')&&e.who==='mocha');return{act:a&&a.doing,mode:G.mode,steps,maxRel:+maxRel.toFixed(3),pos:[+G.x.toFixed(1),+G.z.toFixed(1)],pass,route:L.find(e=>e.ev==='route'&&e.who==='mocha'),place:M.placeOf(G.x,G.z)&&M.placeOf(G.x,G.z).id}});
ok(r.mode==='activity'&&r.place==='cafe','Mocha walked from home to the cafe counter ('+(r.steps*.05).toFixed(1)+' s sim)',{mode:r.mode,pos:r.pos,place:r.place});
ok(r.maxRel<=1.6,'during travel Mocha never rises above floor+1.6 (max '+r.maxRel+')');
ok(r.pass.some(e=>e.door==='cafe'&&e.dir==='in'),'door.pass logged at the cafe door',r.pass.map(e=>e.ev+':'+e.door+':'+e.dir));
ok(r.pass.some(e=>e.door==='home'&&e.dir==='out'),'and he left through his own front door');
// 3) Wendell walks to the market along sidewalks and through doors
r=await p.evaluate(()=>{const M=window.__mocha,G=M.G;M.navLogClear();G.mode='idle';G.timer=1e4;M.wForce('inside');const go=M.wGo('market');const E=M.navEdges();
  const dE=(x,z)=>{let b=1e9;for(const [ax,az,bx,bz] of E){const dx=bx-ax,dz=bz-az,L2=dx*dx+dz*dz||1,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/L2));b=Math.min(b,Math.hypot(ax+dx*t-x,az+dz*t-z))}return b};
  let off=0,maxOff=0,samples=0,cw=0,end=null;M.navSim(150,k=>{const w=M.wpos();if(k%10===0){samples++;if(!M.placeOf(w.x,w.z)){const d=dE(w.x,w.z);maxOff=Math.max(maxOff,d);if(d>1.4)off++}}if(w.cw)cw++;if(!w.path){end=w;return false}});
  const L=M.navLog(),rt=L.find(e=>e.ev==='route'&&e.who==='wendell'),pass=L.filter(e=>(e.ev==='pass'||e.ev==='cross')&&e.who==='wendell').map(e=>e.ev+':'+e.door+':'+e.dir);
  return{go,rt,pass,off,maxOff:+maxOff.toFixed(2),samples,cw,end,place:end&&M.placeOf(end.x,end.z)&&M.placeOf(end.x,end.z).id}});
ok(r.rt&&r.rt.doors.includes('neighbor')&&r.rt.doors.includes('market'),'Wendell\'s route log: his door -> sidewalks -> market door',r.rt&&{n:r.rt.n,doors:r.rt.doors});
ok(r.end&&r.place==='market'&&r.pass.some(p=>p.includes('market:in'))&&r.pass.some(p=>p.includes('neighbor:out')),'Wendell arrived inside the market through both doors',{pass:r.pass,place:r.place});
ok(r.off===0&&r.samples>20,'Wendell stayed on sidewalks/paths outside buildings ('+r.samples+' samples, max off '+r.maxOff+')');
ok(r.cw>=8,'he paused at crosswalks ('+(r.cw*.05).toFixed(2)+' s holding)');
// 4) 100 random routes average under 2 ms; the cache clears when a lock state changes
r=await p.evaluate(()=>{const M=window.__mocha,N=M.NAV;N.cache.clear();let sd=11;const rnd=()=>{sd=(sd*16807)%2147483647;return sd/2147483647};const P=[];
  while(P.length<200){const x=-57+rnd()*185,z=-90+rnd()*190;if(M.inFoot(x,z,0)&&!M.placeOf(x,z))continue;P.push([x,z])}
  for(let i=0;i<10;i++)M.route(P[i][0],P[i][1],P[i+10][0],P[i+10][1]);N.cache.clear();// warm the JIT
  let tot=0,mx=0,bad=0;for(let i=0;i<100;i++){const t0=performance.now(),q=M.navRoute(P[2*i][0],P[2*i][1],P[2*i+1][0],P[2*i+1][1],M.AGENTS[0],{}),dt=performance.now()-t0;tot+=dt;mx=Math.max(mx,dt);if(!q.ok)bad++}
  const before=N.cache.size;M.door('cafe','lock');M.navSim(1.2);const after=N.cache.size;M.door('cafe','auto');M.navSim(1.2);return{avg:tot/100,max:mx,bad,before,after}});
ok(r.avg<2,'100 random routes: avg '+r.avg.toFixed(3)+' ms (max '+r.max.toFixed(2)+' ms, '+r.bad+' unroutable)');
ok(r.before>0&&r.after===0,'route cache clears when a lock state changes',{before:r.before,after:r.after});
// 5) locked on arrival: replan + "oh, they just closed"; explore strolls cut across clear grass; hover height; catchUp untouched
r=await p.evaluate(()=>{const M=window.__mocha,G=M.G;M.navLogClear();M.wForce('inside');G.x=40;G.z=44;G.vx=G.vz=0;G.mode='idle';G.timer=1e4;const a=M.ACTS.find(x=>x.p==='records'&&!x.fx);M.startAct(Object.assign({},a));M.navSim(2);M.door('records','lock');
  let said='';M.navSim(60,()=>{const b=document.getElementById('bubble');if(b&&/just closed/.test(b.textContent))said=b.textContent;if(G.mode!=='travel')return false});M.door('records','auto');const L=M.navLog();
  const lk=L.find(e=>e.ev==='locked');G.x=60;G.z=30;G.mode='idle';const r2=M.route(60,30,58,24);M.G.x=40;M.G.z=44;return{lk,said,mode:G.mode,direct:r2.kind,act:G.act}});
ok(r.lk&&r.lk.door==='records'&&/just closed/.test(r.said)&&r.mode!=='travel','a door locked on arrival: "'+r.said+'", act dropped',r.lk);
ok(r.direct==='direct','short strolls on clear grass go straight (no detour)');
// 6) secret shortcut unlock changes the mask
r=await p.evaluate(()=>{const M=window.__mocha;const a=M.route(-57,-24,-9.6,-24,'mocha');M.shortcut('market');const b=M.route(-57,-24,-9.6,-24,'mocha');const w=M.route(-57,-24,-9.6,-24,'wendell');return{a:a.cost,b:b.cost,w:w.cost}});
ok(r.b<r.a&&r.w>r.b,'secret shortcut behind the market: unlocked for Mocha only',r);
console.log(errs.length?errs:'no page errors');fails+=errs.length;
if(shots){for(const [n,vp] of [['portrait',{width:393,height:852}],['landscape',{width:852,height:393}],['duo',{width:900,height:1000}],['desktop',{width:1100,height:820}]]){
  const c2=await b.newContext({viewport:vp,isMobile:vp.width<800,hasTouch:vp.width<800,deviceScaleFactor:1});const q=await c2.newPage();q.on('pageerror',e=>console.log('ERR',e.message));
  await q.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await q.addInitScript(timeAt(15));await q.goto('file:///home/user/Booknest/ghost-town/index.html');await q.waitForTimeout(4500);
  await q.evaluate(()=>{const M=window.__mocha,G=M.G;M.wForce('inside');G.x=40;G.z=44;G.vx=G.vz=0;G.mode='idle';G.timer=1e4;const a=M.ACTS.find(x=>x.p==='cafe'&&x.s==='counter'&&!x.fx);M.startAct(Object.assign({},a));M.navSim(13.5);M.wGo('market');M.navSim(25)});
  await q.waitForTimeout(2500);await q.screenshot({path:`/tmp/harness/b10/shot-${n}.png`});await c2.close()}}
await b.close();console.log(fails?'FAILED '+fails:'ALL PASS');process.exit(fails?1:0)})();

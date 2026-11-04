// B11 acceptance: walker collision (shop wall, open/locked door, arcade, pier x=-100, Cedar Lake), tap-to-go to the cafe ask spot,
// seats + benchJoin (slot 2 + diary line) vs the weighted candidate (seatedNear <= .6), the Needle lift, seat reachability, hooks.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,400):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.goto('file://'+file);await p.waitForTimeout(4500);
const E=f=>p.evaluate(f);
// hooks exist
ok(await E(()=>{const M=window.__mocha;return typeof M.seats==='function'&&typeof M.benchJoin==='function'&&typeof M.solidAt==='function'&&typeof window.__you().tapGo==='function'}),'hooks: __mocha.seats/benchJoin/solidAt, __you().tapGo');
const col=await E(()=>window.__mocha.col());ok(col.bounds[0]<=-107&&col.bounds[1]>=166&&col.bounds[2]<=-136&&col.bounds[3]>=136,'hash bounds cover x[-107,166] z[-136,136]',col);
// 1) shop wall: the cafe front wall at z=9 (door at x=-30); joystick 'up' with the camera yaw PI pushes +z
await E(()=>{const M=window.__mocha;M.setCamMode('walk');M.door('cafe','auto')});
// merge (LF1): leaving follow mode while Mocha is indoors runs a door swap that locks the stick for a moment; wait for it to finish
for(let k=0;k<80;k++){if(await E(()=>{const i=window.__mocha.inside();return i.ph==='idle'&&!i.lock}))break;await p.waitForTimeout(150)}
let r=await E(()=>{const M=window.__mocha;M.walker(-33.4,6,0,0);M.cam({yaw:Math.PI});return M.youSim(2,0,-1)});ok(r.z<9-.4&&r.z>7.5,'joystick into the cafe wall for 2 s: walker stays outside',r);
r=await E(()=>{const M=window.__mocha;M.walker(-30,6.5,0,0);M.cam({yaw:Math.PI});const a=M.youSim(3,0,-1);return{...a,door:M.doors().find(d=>d.id==='cafe').open}});ok(r.z>10.5&&r.place==='cafe','open door: walker walks in',r);
r=await E(()=>{const M=window.__mocha;M.walker(-30,5.5,0,0);M.cam({yaw:Math.PI});M.youSim(.6);M.door('cafe','lock');M.DBY.cafe.req=0;M.doorStep(3);const a=M.youSim(3,0,-1);a.ang=M.DBY.cafe.ang;M.door('cafe','auto');return a});ok(r.z<9-.4,'locked door: walker is blocked',r);
// 2) arcade walls (x about -90) and the pier end at x=-101
r=await E(()=>{const M=window.__mocha;M.walker(-82,-30,0,0);M.cam({yaw:Math.PI/2});return M.youSim(3,0,-1)});ok(r.x>-85.1+.3,'arcade east wall blocks (x>-85)',r);
r=await E(()=>{const M=window.__mocha;M.walker(-92,-35,0,0);M.cam({yaw:Math.PI/2});return M.youSim(2,0,-1)});ok(r.x<-91&&r.x>-100.6,'pier south of the arcade: walking west is fine until the end',r);
r=await E(()=>{const M=window.__mocha;M.walker(-97,-35,0,0);M.cam({yaw:Math.PI/2});return M.youSim(3,0,-1)});ok(r.x>=-100.6&&r.x<-99.5,'pier end at x=-101 blocks (x>=-100.55)',r);
// 3) Cedar Lake
r=await E(()=>{const M=window.__mocha;M.walker(96,4.5,0,0);M.cam({yaw:Math.PI});return M.youSim(4,0,-1)});ok(r.z<13,'cannot walk into Cedar Lake',{...r,solid:(await 0)});
ok(await E(()=>window.__mocha.solidAt(96,22).why==='lake'),'solidAt(96,22) is the lake');
// 4) tap-to-go to the cafe counter ask spot (Juniper ask [0,-2.3])
r=await E(()=>{const M=window.__mocha,k=M.KEEPERS.find(k=>k.id==='juniper'),c=M.byId.cafe,cs=Math.cos(c.ry),sn=Math.sin(c.ry),ax=c.x+k.ask[0]*cs+k.ask[1]*sn,az=c.z-k.ask[0]*sn+k.ask[1]*cs;M.walker(-12,-6,0,0);
  const t0=performance.now(),g=window.__you().tapGo(ax,az),s=M.youSim(40,0,0,()=>M.TG.on?undefined:false);return{...g,...s,ax,az,dist:Math.hypot(s.x-ax,s.z-az),ms:Math.round(performance.now()-t0)}});
ok(r.dist<.7&&r.t<=15&&!r.going,'tap-to-go reaches the cafe ask spot within 15 s (sim)',r);
// route timing
r=await E(()=>{const M=window.__mocha;M.navDirty();const t0=performance.now();for(let i=0;i<10;i++)M.navRoute(-12+i,-6,-30,16.3,M.AGENTS.find(a=>a.id==='you'),{grass:true});return (performance.now()-t0)/10});ok(r<2,'route computation < 2 ms',+r.toFixed(3));
// 5) ground tap through the real tap path (screen centre) and the ring
r=await E(()=>{const M=window.__mocha;M.walker(-30,30.5,0,0);M.cam({yaw:0,pitch:.5,dist:8});M.cam.tick&&0;return window.__you().tapAt(innerWidth/2,innerHeight*.62)});ok(r&&r.n>=1,'tap on the ground starts a walk',r);
// every walker seat is reachable within 1.2
r=await E(()=>{const M=window.__mocha,bad=[];for(const s of M.SEATS){if(s.tag==='deck')continue;let f=0;for(let i=0;i<2&&!f;i++){const q=M.seatSlot(s,i);for(let rr=.5;rr<=1.15&&!f;rr+=.1)for(let k=0;k<24;k++){const a=k/24*Math.PI*2;if(M.youFree(q.x+Math.cos(a)*rr,q.z+Math.sin(a)*rr)){f=1;break}}}if(!f)bad.push(s.id)}return bad});ok(!r.length,'every walker seat has free ground within 1.2',r);
// 6) sitting: pause near a square bench for 1 s, then benchJoin()
r=await E(()=>{const M=window.__mocha;window.__you().stand();const s=M.SEATS[0],q=M.seatSlot(s,0);M.walker(q.x+Math.sin(s.yaw)*1.0,q.z+Math.cos(s.yaw)*1.0,0,0);const a=M.youSim(1.5,0,0);return{...a,you:window.__you().seat,cam:M.CAM.top()&&M.CAM.top().owner}});
ok(r.you&&r.you.id===0,'pausing within 1.2 of a free bench for 1 s sits the walker',r);
r=await E(()=>{const M=window.__mocha,S=M.S,G=M.G;G.x=M.SEATS[0].x+5;G.z=M.SEATS[0].z+5;G.mode='idle';G.timer=60;G.vx=G.vz=0;S.mem=S.mem||{};const ch=S.mem.chats;S.mem.chats=100;const c=M.benchCand(),parts=M.userBias(c,{});S.mem.chats=ch;
  // weighted, not forced: localChoose picks it only some of the time
  let n=0;S.mem.chats=100;for(let i=0;i<600;i++){const o=M.localChoose();if(o.act&&o.act.fx==='benchjoin')n++}S.mem.chats=ch;return{c:c&&c.fx,parts,picked:n}});
const sn=(r.parts.parts||[]).find(x=>x[0]==='seatedNear');ok(r.c==='benchjoin'&&sn&&sn[1]<=.6&&sn[1]>0,'seatedNear term is .6 at most (friend tier, Mocha idle within 25)',r);ok(r.c==='benchjoin'&&r.picked<600,'"sit beside my visitor" is a weighted candidate (offered, picked '+r.picked+'/600), never forced',r.picked);
r=await E(()=>{const M=window.__mocha,G=M.G,S=M.S;const d0=S.diary.length,c=M.benchJoin();let k=0;const res=M.navSim(40,i=>{k=i;if(G.mode==='activity'&&G.act&&G.act.fx==='benchjoin')return false});
  const s=M.SEATS[0];return{c,occ:s.occ.slice(),mode:G.mode,fx:G.act&&G.act.fx,diary:S.diary[0]&&S.diary[0].tag,text:S.diary[0]&&S.diary[0].text,t:k*.05,dn:S.diary.length-d0}});
ok(r.occ[1]==='mocha'&&r.occ[0]==='you'&&r.diary==='Bench','benchJoin(): Mocha takes slot 2 and writes a diary line',r);
r=await E(()=>{const M=window.__mocha;window.__you().stand();return{seat:window.__you().seat,cam:M.CAM.stack().map(e=>e.owner)}});ok(!r.seat&&!r.cam.includes('seat'),'standing up pops the seat camera',r);
// 7) the Needle: the capsule rises; Mocha is never above the deck except inside the capsule
r=await E(()=>{const M=window.__mocha,G=M.G,N=M.NEL;const act=M.ACTS.find(a=>a.p==='needle'&&!a.night);G.x=6;G.z=-55;G.vx=G.vz=0;G.biking=false;G.ride=null;M.startAct(act);let bad=[],ys=[],maxY=0,rose=0,deckT=0;
  const chk=i=>{const y=G.y,inCap=(G.lift==='up'||G.lift==='down')&&Math.hypot(G.x-N.cx,G.z-N.cz)<.3,onDeck=(G.lift==='deck'||G.lift==='wait1')&&Math.hypot(G.x-N.p.x,G.z-N.p.z)<=4.85&&y<=N.yt+1.6;
    if(y>3&&!inCap&&!onDeck)bad.push([+G.x.toFixed(1),+y.toFixed(1),+G.z.toFixed(1),G.lift,G.mode]);if(N.m.position.y>maxY)maxY=N.m.position.y;if(G.lift==='deck'&&G.mode==='activity'){deckT++;if(deckT>40){G.timer=0}}if(i%20===0)ys.push([+G.y.toFixed(1),G.lift||'-'])};
  M.navSim(150,i=>{chk(i);if(deckT>40&&!G.lift&&G.y<3)return false});return{bad:bad.slice(0,5),nb:bad.length,maxY:+maxY.toFixed(1),deckT,trips:N.trips,end:M.needle(),ys:ys.slice(0,40)}});
ok(r.maxY>40&&r.trips>=2&&r.deckT>40,'Needle: capsule rises to the deck, Mocha spends time up there and rides down',{maxY:r.maxY,trips:r.trips,deckT:r.deckT,end:r.end});
ok(r.nb===0,'Needle: Mocha is never above the deck except inside the capsule',r.bad);
// 8) floorType + solidAt
r=await E(()=>{const M=window.__mocha;return[M.floorType(0,4.5),M.floorType(-30,14),M.floorType(-30,33),M.floorType(-24,100)]});ok(r[0]==='sidewalk'&&r[1]==='wood'&&r[2]==='stone'&&r[3]==='grass','floorType sidewalk/wood/stone/grass',r);
r=await E(()=>{const M=window.__mocha;return[M.solidAt(-30,14).solid,M.solidAt(-30,19.05).solid,M.solidAt(-35.97,14).solid]});ok(!r[0]&&r[1]&&r[2],'solidAt: cafe interior free, back wall and side wall solid',r);
// 9) spawn at the cabin gate on the first walk of a session (fresh page)
await p.close();const ctx2=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p2=await ctx2.newPage();await p2.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p2.addInitScript(timeAt(15));await p2.goto('file://'+file);await p2.waitForTimeout(3500);
r=await p2.evaluate(()=>{window.__mocha.setCamMode('walk');return window.__you()});ok(Math.abs(r.x-40)<.5&&Math.abs(r.z-62.9)<.5,'first walk of a session starts at the cabin gate',r);await p2.close();
console.log('errors:',errs.length?errs:'none');await b.close();process.exit(fails||errs.length?1:0)})();

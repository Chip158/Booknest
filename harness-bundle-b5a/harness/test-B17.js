// B17 acceptance: Wendell's day (parsePlan/planFor/blockAt), hangouts in both houses, invites, empty-house seats, drop-in y-beats,
// catchUp over 3 days, at most 1 MIND call per hangout. Drives the game through window.__mocha hooks (navSim fast-forwards). node test-B17.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,900):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(18));
await p.goto('file://'+file);await p.waitForTimeout(5000);const E=(f,a)=>p.evaluate(f,a);
const clock=h=>E(h=>{const R=window.__RD||(window.__RD=Object.getPrototypeOf(window.Date));const tgt=new R(R.now());tgt.setMonth(10,1);tgt.setHours(Math.floor(h),Math.round((h%1)*60),0,0);const off=tgt-R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;return new Date().getHours()+new Date().getMinutes()/60},h);
const home=()=>E(()=>{const M=window.__mocha,G=M.G;M.hangStop();const q=M.byId.home,c=q.spots.couch,w=M.byId.home;const x=w.x+c[0]*Math.cos(w.ry)+c[1]*Math.sin(w.ry),z=w.z-c[0]*Math.sin(w.ry)+c[1]*Math.cos(w.ry);G.x=x;G.z=z;G.vx=G.vz=0;G.act={p:'home',s:'couch',doing:'reading on the couch',tags:['cozy'],need:{}};G.mode='activity';G.timer=1e4;G.sleep=false;M.wForce('inside');return{x,z}});
// run the sim (sec at a time) until probe() is truthy
const until=(sec,probe,max)=>E(async([sec,probe,max])=>{const M=window.__mocha,f=new Function('M','return ('+probe+')');let k=0;for(;k<max;k++){M.navSim(sec);if(f(M))break;if(k%10===9)await new Promise(r=>setTimeout(r,0))}return{k,st:M.hangState(),w:M.wend()}},[sec,probe,max]);
ok(await E(()=>['wend','wplan','hang','hangState','invite'].every(k=>typeof window.__mocha[k]==='function')),'hooks: wend(), wplan(), hang(id,where), hangState(), invite(k)');
// --- 1) plans: parsePlan / planFor / blockAt
let r=await E(()=>window.__mocha.wplan());
ok(r.parsed===10&&r.plan.length>=10&&r.plan.some(b=>b[5]==='nap'&&b[4]==='fireA'&&b[0]===14)&&r.plan.some(b=>b[5]==='sleep'&&b[4]==='bed'),'planFor(wendell): rhythm parsed into [h0,h1,kind,place,spot,verb] blocks (nap 14-15 in fireA, bed 22-07)',{n:r.plan.length,now:r.now,plan:r.plan.map(b=>b.join(' '))});
await clock(14.5);r=await E(()=>{const M=window.__mocha;M.hangStop();M.wForce('porch');M.Wst.timer=0;M.navSim(1);let k=0;for(;k<120;k++){M.navSim(1);const w=M.wend();if(w.inside&&w.spot==='fireA'&&!w.path)break}return M.wend()});
ok(r.st==='nap'&&r.spot==='fireA'&&r.inside&&r.sit&&r.vis&&/nap/.test(r.doing),'14:30: Wendell walks in from his porch (his plan) and naps in his armchair (fireA), visible',{st:r.st,spot:r.spot,inside:r.inside,doing:r.doing,place:r.place});
await clock(23);r=await E(()=>{const M=window.__mocha;M.hangStop();M.wForce('inside');M.navSim(1);return M.wend()});
ok(r.st==='sleep'&&r.spot==='bed'&&r.inside&&r.vis&&r.place==='neighbor','23:00: Wendell is in bed (inside his cottage, W.visible true)',{st:r.st,spot:r.spot,doing:r.doing,place:r.place,vis:r.vis});
r=await E(()=>{const M=window.__mocha;const out={};for(const h of [7.5,9,12,16,18,20,21.6])out[h]=M.wplan(new Date().setHours(Math.floor(h),(h%1)*60)).now;return out});
ok(r[7.5][5]==='tea'&&r[18][5]==='cook'&&r[21.6][5]==='tv'&&r[12][2]==='go','blockAt is pure: porch tea 7:30, errand at noon, cooking at 18, the late show at 21:36',r);
// --- 2) checkers at Wendell's
await clock(18.25);await home();
r=await E(()=>{const M=window.__mocha;const ck=M.S.wend.ck.slice(),d0=M.S.diary.length;window.__t17={ck,d0};const s=M.hang('checkers','W',{len:26});return s});
ok(r&&r.on&&r.host==='W'&&r.p==='neighbor'&&r.sp[0]==='fireA'&&r.sp[1]==='fireB'&&r.ph==='door','hang(checkers,W): Mocha heads for Wendell\'s door; seats fireA (Wendell) / fireB (Mocha)',r&&{host:r.host,p:r.p,sp:r.sp,ph:r.ph});
r=await until(.5,"M.hangState().ph==='sat'&&M.hangState().wph==='sat'",160);
const ev=r.st.ev;ok(r.st.ph==='sat'&&r.st.wph==='sat'&&ev.some(e=>e[0]==='knock'&&e[1].pid==='neighbor'&&e[1].who==='mocha')&&ev.some(e=>e[0]==='pass'&&e[1].pid==='neighbor'&&e[1].who==='mocha'&&e[1].dir==='in')&&r.st.G.place==='neighbor','both seated: Mocha knocked (DOOREV) and walked IN through Wendell\'s door',{k:r.k,ph:r.st.ph,wph:r.st.wph,G:r.st.G,W:r.st.W,ev:ev.filter(e=>e[0]!=='pass'||e[1].who==='mocha').slice(-8)});
r=await E(()=>{const M=window.__mocha,s=M.hangState(),w=M.wendellSpots().spots;const ang=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)));M.navSim(4);const s2=M.hangState(),gy=Math.atan2(s2.W.x-s2.G.x,s2.W.z-s2.G.z),wy=Math.atan2(s2.G.x-s2.W.x,s2.G.z-s2.W.z);
  return{wAt:Math.hypot(s2.W.x-w.fireA.x,s2.W.z-w.fireA.z),mAt:Math.hypot(s2.G.x-w.fireB.x,s2.G.z-w.fireB.z),mFace:ang(s2.G.yaw,gy),wFace:ang(s2.W.yaw,wy),cam:s2.cam,prop:s2.prop,kind:s2.propKind,bv:s2.bv}});
ok(r.wAt<.4&&r.mAt<.8&&r.mFace<.6&&r.wFace<.6,'they sit at fireA/fireB and face each other',r);
ok(r.cam==='hang'&&r.prop&&r.kind==='board','follow mode: CAM.push(hang) frames the pair; the checkers board prop is shown',r);
const bv0=r.bv;r=await until(.5,"!M.hangState().on",200);
r=await E(()=>{const M=window.__mocha,s=M.hangState(),L=s.log;let dup=0;for(let i=1;i<L.length;i++)if(L[i][0]===L[i-1][0])dup++;const e=M.S.diary.find(x=>x.tag==='Wendell'&&x.t>Date.now()-6e5);return{n:s.n,dup,log:L.slice(0,8),bv:s.bv,ck0:window.__t17.ck,ck:M.S.wend.ck,diary:e&&{tag:e.tag,text:e.text,place:e.place},prop:s.prop,cam:s.cam,turn:M.S.wend.turn,last:M.S.wend.last>0}});
ok(r.n>=6&&r.dup===0,'at least 6 bubbles, alternating speakers',{n:r.n,dup:r.dup,log:r.log});
ok(r.bv>bv0+2,'the board canvas updates (a piece hops every ~4 s)',{bv0,bv:r.bv});
ok(r.diary&&r.diary.tag==='Wendell'&&/checkers/i.test(r.diary.text)&&r.ck[0]+r.ck[1]===r.ck0[0]+r.ck0[1]+1,'a diary entry is written and S.wend.ck changes',r.diary&&{diary:r.diary,ck0:r.ck0,ck:r.ck});
ok(!r.prop&&r.cam!=='hang','after the hangout: props hidden, CAM popped',{prop:r.prop,cam:r.cam});
// --- 3) Wendell invites: knock with soup; accept/decline are Mocha's own (seeded) decision
await clock(18.5);await home();
r=await E(()=>{const M=window.__mocha;let a=null,d=null;for(let s=1;s<200&&(a==null||d==null);s++){const v=M.inviteDecide(s);if(v.ok&&a==null)a=s;if(!v.ok&&d==null)d=s}return{a,d,p:M.inviteDecide(1).p}});const SA=r.a,SD=r.d;
ok(SA!=null&&SD!=null,'inviteDecide(seed) is a weighted Mocha choice: some seeds accept, some decline',r);
r=await E(s=>{const M=window.__mocha;M.S.pantry=40;const v=M.invite('knock',{seed:s});return{v,w:M.wend()}},SA);
ok(r.v.ok&&r.w.inv&&r.w.inv.ph==='go'&&r.w.pot&&r.w.path>0,'invite(knock) with Mocha home: Wendell sets off for Mocha\'s door carrying a pot',{v:r.v,inv:r.w.inv,pot:r.w.pot});
r=await until(.5,"!M.wend().inv",180);
ok(r.st.ev.some(e=>e[0]==='knock'&&e[1].pid==='home'&&e[1].who==='wendell')&&r.st.last&&r.st.last.ok===true&&r.st.on&&r.st.host==='M','he knocks at Mocha\'s door (DOOREV); seed '+SA+': Mocha accepts and hosts',{last:r.st.last,on:r.st.on,id:r.st.id,host:r.st.host,ev:r.st.ev.filter(e=>e[0]==='knock').slice(-2)});
await home();r=await E(s=>{const M=window.__mocha;M.S.pantry=40;window.__p0=M.S.pantry;const act0=M.G.act.doing;M.invite('knock',{seed:s});return act0},SD);const act0=r;
r=await until(.5,"!M.wend().inv",300);
r=await E(()=>{const M=window.__mocha;return{last:M.hangState().last,on:M.hangState().on,inv:M.S.wend.inv,pantry:M.S.pantry,p0:window.__p0,act:M.G.act&&M.G.act.doing,wend:M.wend().doing,log:M.hangState().ev.filter(e=>e[0]==='answer').slice(-1)}});
ok(r.last&&r.last.ok===false&&!r.on&&r.inv&&r.inv.k==='later'&&r.pantry>=r.p0+14&&r.act===act0,'seed '+SD+': Mocha declines ("raincheck?"), keeps doing his thing; Wendell leaves the soup (pantry +15) and offers tomorrow evening',r);
r=await E(()=>{const M=window.__mocha,G=M.G;G.act={p:'studio',s:null,doing:'painting at the easel',tags:['art'],need:{},fx:'paint'};G.mode='activity';const v=M.inviteDecide(1);G.act={p:'home',s:'couch',doing:'reading',tags:[],need:{}};return v});
ok(!r.ok&&/painting/.test(r.why),'painting is never interrupted ("raincheck? i\'m in the middle of a painting")',r);
// --- 4) the empty house: floor cushions and the moving box; movie night moves to Wendell's TV
r=await E(()=>{const M=window.__mocha;M.emptyHouse(true);const a=M.hang('tea','M',{len:20});const b=M.hang('reading','M',{len:20});const c=M.hang('movie','M',{len:20});const o={tea:a&&{sp:a.sp,host:a.host},reading:b&&{sp:b.sp,host:b.host},movie:c&&{sp:c.sp,host:c.host,p:c.p}};M.hangStop();return o});
ok(r.tea&&r.tea.sp[0]==='boxA'&&r.tea.sp[1]==='boxB'&&r.reading&&r.reading.sp[0]==='floorA'&&r.reading.sp[1]==='floorB'&&r.movie&&r.movie.host==='W'&&r.movie.p==='neighbor','emptyHouse(true): tea at Mocha\'s uses boxA/boxB, couch hangouts use floorA/floorB, movie night moves to Wendell\'s TV',r);
await home();r=await E(()=>{const M=window.__mocha;M.emptyHouse(true);return M.hang('reading','M',{len:16})});
r=await until(.5,"M.hangState().ph==='sat'&&M.hangState().wph==='sat'",200);
r=await E(()=>{const M=window.__mocha,s=M.hangState(),p=M.byId.home,sp=k=>{const a=p.spots[k];return{x:p.x+a[0]*Math.cos(p.ry)+a[1]*Math.sin(p.ry),z:p.z-a[0]*Math.sin(p.ry)+a[1]*Math.cos(p.ry)}},A=sp('floorA'),B=sp('floorB');return{wph:s.wph,ph:s.ph,W:s.W,dW:Math.hypot(s.W.x-A.x,s.W.z-A.z),dM:Math.hypot(s.G.x-B.x,s.G.z-B.z),ev:s.ev.filter(e=>e[0]==='knock'||e[0]==='wsat').slice(-3)}});
ok(r.ph==='sat'&&r.W.spot==='floorA'&&r.dW<.4&&r.dM<.8,'empty house: Wendell sits on floorA, Mocha on floorB (nobody sits on air)',r);
await E(()=>{const M=window.__mocha;M.hangStop();M.emptyHouse(false)});
// --- 5) drop in: the walker in couchC during a hangout at Mocha's -> y: beats and the diary mentions you; the activity and host never change
await home();r=await E(()=>{const M=window.__mocha;M.S.mem.userName='Ari';return M.hang('reading','M',{len:34})});const h0={id:r.id,host:r.host};
r=await until(.5,"M.hangState().ph==='sat'&&M.hangState().wph==='sat'",200);
r=await E(()=>window.__mocha.walkSit('home','couchC'));ok(!!r,'the walker sits in couchC (a drop-in seat)',r);
r=await until(.5,"!M.hangState().on",260);
r=await E(()=>{const M=window.__mocha,s=M.hangState(),e=M.S.diary.find(x=>x.tag==='Wendell');return{y:s.y,yb:s.yb,id:s.id,host:s.host,diary:e&&e.text,log:s.log.slice(0,14),ev:s.ev.filter(x=>x[0]==='dropin')}});
ok(r.y===1&&r.yb>=1&&r.id===h0.id&&r.host===h0.host&&/Ari/.test(r.diary||''),'drop-in: y: beats play, the diary mentions Ari; activity + host unchanged',{h0,...r});
await E(()=>{const M=window.__mocha;M.stand&&M.stand();if(window.__you&&window.__you.stand)window.__you.stand()});
// --- 6) MIND: at most one call per hangout (kind 'hang'), none for invites
await home();r=await E(async()=>{window.dispatchEvent(new Event('pointerdown'));const M=window.__mocha,MI=M.MIND;let calls=0;const was={api:MI.api,on:MI.on};MI.api=async()=>{calls++;return{text:'{"diary":"Tea with Wendell by the window. He told me a story and I believed every word of it."}'}};MI.on=true;
  const u0=Object.assign({},MI.use().by);M.invite('call',{seed:3});M.hang('tea','W',{len:14});for(let k=0;k<400&&M.hangState().on;k++){M.navSim(.5);if(k%20===19)await new Promise(r=>setTimeout(r,0))}const mc=M.hangState().mc;MI.on=false;await new Promise(r=>setTimeout(r,300));const by=MI.use().by;MI.api=was.api;MI.on=was.on;
  return{calls,mc,hang:(by.hang||0)-(u0.hang||0),e:M.S.diary.find(x=>x.tag==='Wendell').text}});
ok(r.mc===1&&r.hang===1&&r.calls===1&&/believed every word/.test(r.e),'at most 1 MIND call per hangout (MIND.allow(hang)); the call writes the diary entry',r);
// --- 7) catchUp across 3 simulated days: >=1 hangout per full day, <=1 note invite per day
r=await E(()=>{const M=window.__mocha;M.hangStop();return M.catchUpSim(3,{last:30,li:30})});
const days=Object.keys(r.by).sort();const full=days.slice(1,-1);
ok(r.hang>=3&&full.every(k=>r.by[k].h>=1)&&days.every(k=>r.by[k].n<=1),'catchUp over 3 days: at least 1 hangout a day, at most 1 mailbox note a day',{hang:r.hang,notes:r.notes,by:r.by,entries:r.entries,ids:r.ids});
// --- 8) state + shelf
r=await E(()=>{const M=window.__mocha,w=M.wend();return{bytes:w.bytes,caps:w.caps,S:w.S}});
ok(r.bytes<1024&&r.caps.inst&&r.caps.max===120&&r.caps.n===Math.min(120,r.S.caps)&&r.caps.parent==='inner','S.wend under 1 KB; the caps shelf is ONE InstancedMesh (120) in p.inner, count = min(caps,120)',r);
ok(!errs.length,'no page errors',errs.slice(0,5));
await b.close();console.log(fails?`FAILED ${fails}`:'ALL PASS');process.exit(fails?1:0)})();

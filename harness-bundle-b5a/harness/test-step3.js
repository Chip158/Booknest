// Step 3 feature test: coins/odd jobs, Cascade Mobile + Spoke & Sprocket (interiors, keepers), purchases (built-in + mind validation),
// phone in hand, selfies need a phone, bike riding on roads + park loop, 'me' tab, big map, catch-up safety with an old save.
// Usage: node /tmp/harness/test-step3.js [section filter]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const OUT='/tmp/harness/step3/';const filt=process.argv[2]||'';
let fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  FAIL',m)}else console.log('  ok',m)};
async function open(b,vp,mobile,init){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));if(init)await p.addInitScript(init);
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4000);return {ctx,p,errs}}
const snap=(o)=>{const M=window.__mocha,G=M.G;return M.cam(Object.assign({tx:G.x,ty:G.y,tz:G.z},o))};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
if(!filt||filt==='main'){console.log('== main (desktop)');const {ctx,p,errs}=await open(b,{width:1100,height:820},false);
  const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{document.getElementById('closePanel').click();window.__mocha.weather('clear')});
  let g=await E(()=>window.__mocha.gear());ok(g.coins===150&&g.phone===null&&g.bike===null,'new Mocha: 150 coins, no phone, no bike');ok(g.want&&g.want.price===80,'first want is a phone (80)');
  const pl=await E(()=>{const M=window.__mocha;return{dot:!!M.KEEPERS.find(k=>k.id==='dot'&&k.obj.visible),kip:!!M.KEEPERS.find(k=>k.id==='kip'&&k.obj.visible),acts:M.ACTS.filter(a=>a.fx==='job').length,askDot:!!M.ACTS.find(a=>a.fx==='ask'&&a.keeper==='dot'),askKip:!!M.ACTS.find(a=>a.fx==='ask'&&a.keeper==='kip')}});
  ok(pl.dot&&pl.kip,'Dot and Kip are at work at 3pm');ok(pl.acts>=8,'odd jobs: '+pl.acts);ok(pl.askDot&&pl.askKip,'asking Dot/Kip is an activity');
  // overlap check of new places against roads/buildings/neighbor houses
  const ov=await E(()=>{const M=window.__mocha;const P=M.S&&null;const out=[];const places=[['phones',-15.5,-15,9.5,10,0],['bikes',28,-37,10,9,Math.PI]];const roads=[[-58,0,128,0],[-58,-48,70,-48],[-5,-90,-5,60],[66,-60,66,70],[-5,58,104,58]];
    for(const [id,x,z,w,d] of places){for(const [x1,z1,x2,z2] of roads){const minx=Math.min(x1,x2)-5.5,maxx=Math.max(x1,x2)+5.5,minz=Math.min(z1,z2)-5.5,maxz=Math.max(z1,z2)+5.5;if(x+w/2>minx&&x-w/2<maxx&&z+d/2>minz&&z-d/2<maxz)out.push(id+' x road '+[x1,z1,x2,z2])}}return out});
  ok(ov.length===0,'new shops clear of roads+sidewalks '+JSON.stringify(ov));
  // selfies need a phone
  let r=await E(()=>{const M=window.__mocha;const n=M.S.posts.length;const res=M.takeSelfie('test','x',false);return{res,same:M.S.posts.length===n}});ok(r.res===false&&r.same,'no phone -> no selfie');
  // built-in brain buys a phone at Cascade Mobile
  r=await E(()=>{const M=window.__mocha;let n=0;while(!M.S.phone&&n<12){M.shopVisit({fx:'phoneshop',p:'phones'},Date.now(),true,'Cascade Mobile');n++}return{tries:n,g:M.gear(),top:M.S.diary[0]}});
  ok(r.g.phone&&r.g.coins===150-({'Drizzle Flip':80,'Nimbus Mini':95,'Ghostphone':120}[r.g.phone.model]),'bought a phone with savings: '+(r.g.phone&&r.g.phone.model)+' coins left '+r.g.coins);ok(r.top.tag==='Bought','diary: '+r.top.text.slice(0,80));
  ok(r.g.phoneCols.includes(r.g.phone.color),'phone mesh in his hand uses his phone colour');
  r=await E(()=>{const M=window.__mocha;M.coins(80);const a=M.buyGear('case',{pattern:'clouds',color:'#ffd36b'}),c=M.buyGear('charm',{charm:'tiny pumpkin'});return{a,c,g:M.gear()}});
  ok(r.a&&r.c&&r.g.phone.case.pat==='clouds'&&r.g.phone.charm==='tiny pumpkin'&&r.g.coins===80-15-6,'case + charm bought, coins '+r.g.coins);ok(r.g.phoneCols.includes('#ffd36b')&&r.g.phoneCols.includes('#f28a3a'),'case + charm show on the phone mesh');
  r=await E(()=>{const M=window.__mocha;return{s:M.takeSelfie('first selfie!','Cascade Mobile',false),n:M.S.posts.length}});ok(r.s===true&&r.n>=1,'with a phone he can post a selfie');
  // odd job pays + keeper thanks bubble
  r=await E(()=>{const M=window.__mocha;M.coins(10);const job=M.ACTS.find(a=>a.fx==='job'&&a.p==='cafe');const c0=M.S.coins;M.localOutcome(job,Date.now(),true);return{d:M.S.coins-c0,jobs:M.S.jobs,top:M.S.diary.find(e=>e.tag==='Work'),bub:document.getElementById('bubble3').classList.contains('show'),txt:document.getElementById('bubble3').textContent}});
  ok(r.d>=12&&r.d<=25&&r.jobs===1,'odd job paid '+r.d+' coins');ok(r.top&&/Juniper paid me/.test(r.top.text),'work diary: '+(r.top&&r.top.text.slice(0,90)));ok(r.bub,'Juniper says thanks: '+r.txt);
  // can't overspend
  r=await E(()=>{const M=window.__mocha;M.coins(5);return{b:M.buyGear('bike',{type:'bmx'}),e:M.buyGear('earbuds'),c:M.S.coins}});ok(!r.b&&!r.e&&r.c===5,'cannot buy what he cannot afford (coins stay 5)');
  // brain weighting: broke + phone owned -> jobs get picked a lot; rich + no bike -> bike shop
  r=await E(()=>{const M=window.__mocha,cnt={};M.coins(5);M.S.lastJob=0;for(let i=0;i<500;i++){const c=M.localChoose(Date.now());const k=c.act?(c.act.fx||'other'):'explore';cnt[k]=(cnt[k]||0)+1}return cnt});console.log('  choices broke:',JSON.stringify(r));ok((r.job||0)>60,'when broke he often picks odd jobs ('+(r.job||0)+'/500)');
  r=await E(()=>{const M=window.__mocha,cnt={};M.coins(200);for(let i=0;i<500;i++){const c=M.localChoose(Date.now());const k=c.act?(c.act.fx||'other'):'explore';cnt[k]=(cnt[k]||0)+1}return cnt});console.log('  choices rich:',JSON.stringify(r));ok((r.bikeshop||0)>15,'with savings he visits the bike shop ('+(r.bikeshop||0)+'/500)');ok((r.job||0)<(r.bikeshop||0)+20,'fewer jobs when he has money');
  // Claude mind 'buy' validation
  r=await E(()=>{const M=window.__mocha;M.coins(500);const fin={p:'phones',fx:'phoneshop',doing:'browsing',tags:[],need:{}};M.applyMind({diary:'looked around',buy:{item:'bike',model:'bmx'},next:{place:'home'}},fin);const wrong=M.S.bike;
    M.coins(50);M.applyMind({diary:'bike!',buy:{item:'bike',model:'bmx',color:'#e04f4f',name:'Zoomy'},next:{place:'home'}},{p:'bikes',fx:'bikeshop',doing:'looking at bikes',tags:[],need:{}});const poor=M.S.bike;
    M.coins(150);M.applyMind({diary:'bike!',buy:{item:'bike',model:'BMX',color:'#e04f4f',name:'Zoomy'},next:{place:'home'}},{p:'bikes',fx:'bikeshop',doing:'looking at bikes',tags:[],need:{}});const got=M.S.bike,c1=M.S.coins;
    M.applyMind({diary:'helped',next:{place:'home'}},{...M.ACTS.find(a=>a.fx==='job'&&a.p==='bikes')});return{wrong,poor,got,c1,c2:M.S.coins,jobs:M.S.jobs}});
  ok(r.wrong===null,'mind cannot buy a bike at the phone store');ok(r.poor===null,'mind cannot buy a bike it cannot afford');ok(r.got&&r.got.type==='bmx'&&r.got.name==='Zoomy'&&r.c1===50,'mind bought a BMX named Zoomy at Spoke & Sprocket (coins '+r.c1+')');ok(r.c2>r.c1&&r.jobs===2,'mind-run odd job still pays');
  // helmet: built-in brain buys one next
  r=await E(()=>{const M=window.__mocha;M.coins(60);let n=0;while(!M.gear().helmet&&n<10){M.shopVisit({fx:'bikeshop',p:'bikes'},Date.now(),true,'Spoke & Sprocket');n++}return M.gear()});ok(r.helmet,'bought a helmet');
  // ride: from home to the cinema... far trip to the market
  r=await E(()=>{const M=window.__mocha,G=M.G;G.x=40;G.z=44;G.mode='idle';G.timer=999;M.BK.x=34.5;M.BK.z=54.1;M.startAct(M.ACTS.find(x=>x.p==='market'&&x.s==='fish'));return M.gear().route});
  ok(r&&r.mount&&r.n>=4,'long trip plans a bike route ('+(r&&r.n)+' points)');console.log('  route',JSON.stringify(r.pts.map(q=>q.map(v=>+v.toFixed(1)))));
  const onRoad=await E(()=>{const pts=window.__mocha.gear().route.pts.slice(1,-1);const roads=[[-58,0,128,0],[-58,-48,70,-48],[-5,-90,-5,60],[66,-60,66,70],[-5,58,104,58]];return pts.every(([x,z])=>roads.some(([x1,z1,x2,z2])=>{const dx=x2-x1,dz=z2-z1,l=dx*dx+dz*dz,t=Math.max(0,Math.min(1,((x-x1)*dx+(z-z1)*dz)/l));return Math.hypot(x1+dx*t-x,z1+dz*t-z)<3.4}))});ok(onRoad,'route waypoints are on the road lanes');
  let st;for(let k=0;k<80;k++){st=await E(()=>window.__mocha.tick(10,.05));if(st.biking)break}ok(st.biking,'he mounts his bike');
  st=await E(()=>window.__mocha.tick(45,.05));const ry=await E(()=>window.__mocha.gear().y);ok(st.biking&&ry<2.6,'riding low on the bike (y '+ry+')');
  await E(snap,{dist:10,pitch:.38});await p.waitForTimeout(2500);await p.screenshot({path:OUT+'t-ride.png'});
  let rodeFar=0;for(let k=0;k<250;k++){st=await E(()=>window.__mocha.tick(10,.05));if(st.biking)rodeFar++;if(st.mode==='activity')break}
  r=await E(()=>{const M=window.__mocha,rk=(M.RACKS||[]).find(q=>q.pid==='market');return{g:M.gear(),G:{x:M.G.x,z:M.G.z,mode:M.G.mode},rk:rk&&[rk.px,rk.pz]}});ok(r.G.mode==='activity'&&!r.g.biking,'arrived, off the bike');
  // B11 spec: he dismounts at the bike rack beside the shop door (round 1 parked 4.6 in front of the facade at (-33.6,-5.4))
  ok(r.rk?Math.hypot(r.g.bk.x-r.rk[0],r.g.bk.z-r.rk[1])<2:Math.hypot(r.g.bk.x+33.6,r.g.bk.z+5.4)<4,'bike parked out front of the market ('+r.g.bk.x.toFixed(1)+','+r.g.bk.z.toFixed(1)+(r.rk?' rack '+r.rk.map(v=>v.toFixed(1)):'')+')');
  // bike-ride loop around Cedar Lake
  await E(()=>{const M=window.__mocha;M.G.mode='idle';M.G.timer=999;M.startAct(M.ACTS.find(x=>x.fx==='bikeride'&&x.loop==='park'))});
  for(let k=0;k<300;k++){st=await E(()=>window.__mocha.tick(10,.05));if(st.mode==='activity')break}ok(st.mode==='activity'&&st.biking,'bike ride activity: riding around the lake');
  st=await E(()=>window.__mocha.tick(80,.05));r=await E(()=>{const G=window.__mocha.G;return{d:Math.hypot(G.x-96,G.z-22),b:G.biking,m:G.mode}});ok(r.b&&r.m==='activity'&&r.d>15&&r.d<23,'still looping the lake (r='+r.d.toFixed(1)+')');
  await E(snap,{dist:13,pitch:.5});await p.waitForTimeout(2500);await p.screenshot({path:OUT+'t-loop.png'});
  r=await E(()=>{const M=window.__mocha;const n0=M.S.bike.rides;M.G.timer=0;M.tick(2,.05);return{n0,n1:M.S.bike.rides,b:M.G.biking,top:M.S.diary.slice(0,3).map(e=>e.text.slice(0,70))}});ok(r.n1===r.n0+1&&!r.b,'ride counted, bike parked ('+r.n1+') '+JSON.stringify(r.top));
  // asking Kip
  r=await E(()=>{const M=window.__mocha;M.localOutcome(M.ACTS.find(a=>a.fx==='ask'&&a.keeper==='kip'),Date.now(),true);return M.S.learned.find(l=>/asked Kip/.test(l.topic))});ok(r&&r.facts.length,'asked Kip: '+(r&&r.facts[0]));
  // keepers close-up + interiors
  for(const [pid,spot,yaw,nm] of [['phones','counter',0.3,'dot'],['bikes','counter',Math.PI+0.3,'kip'],['phones','display',0.35,'phones'],['bikes','bikes',Math.PI+0.2,'bikes']]){
    await E(([pid,spot,close])=>{const M=window.__mocha,G=M.G;const act={p:pid,s:spot,doing:'looking around',tags:[],need:{}};M.forceAct(act);G.x=G.target.x;G.z=G.target.z;
      if(close){const k=M.KEEPERS.find(k=>k.shop===pid);const P=k.obj.parent;const c=Math.cos(P.rotation.y),s=Math.sin(P.rotation.y),lx=k.pos[0]-1.5,lz=k.pos[1]+.2;G.x=P.position.x+lx*c+lz*s;G.z=P.position.z-lx*s+lz*c}
      G.mode='activity';G.act=act;G.timer=9999;G.route=null;G.biking=false},[pid,spot,nm.length===3]);
    await E(snap,{dist:nm.length===3?6.5:15,yaw,pitch:nm.length===3?.22:.7});if(nm.length===3)await E(()=>{const M=window.__mocha;const c=M.cam();M.cam({ty:c.ty-.6})});await p.waitForTimeout(3500);await p.screenshot({path:OUT+'t-'+nm+'.png'})}
  // phone in hand close-up
  await E(()=>{const M=window.__mocha,G=M.G;G.x=40;G.z=44;G.mode='activity';G.timer=9999;G.act={p:'home',s:'couch',doing:'checking his phone',tags:[],need:{}};M.showPhone(30)});await E(snap,{dist:5.5,pitch:.25,yaw:0.6});await p.waitForTimeout(3500);
  await p.screenshot({path:OUT+'t-phone.png'});ok(await E(()=>window.__mocha.gear().phoneVisible),'phone visible in his hand');
  // me tab
  await E(()=>{document.getElementById('bookBtn').click()});await p.waitForTimeout(600);await p.click('nav button[data-tab="me"]');await p.waitForTimeout(800);
  r=await E(()=>document.getElementById('tab-me').innerText);ok(/his money/.test(r)&&/his phone/.test(r)&&/Zoomy/.test(r)&&/odd job/.test(r),'me tab shows money, phone, bike');
  await E(()=>{const h=[...document.querySelectorAll('#tab-me h4')].find(x=>/his money/.test(x.textContent));h&&h.scrollIntoView({block:'start'})});await p.waitForTimeout(800);await p.screenshot({path:OUT+'t-me.png'});
  // map
  await E(()=>{document.getElementById('closePanel').click();document.getElementById('mapBtn').click()});await p.waitForTimeout(1500);await p.screenshot({path:OUT+'t-map.png'});
  console.log('  errors:',errs.length?errs:'none');ok(!errs.length,'no page errors (main)');await ctx.close()}
if(!filt||filt==='old'){console.log('== old save + catch-up');
  // build an old-format save (no seed150) that has a bike + phone and was last seen 10h ago
  const {ctx:c0,p:p0}=await open(b,{width:500,height:400},false);const st=await p0.evaluate(()=>{const S=JSON.parse(JSON.stringify(window.__mocha.S));delete S.seed150;S.coins=20;S.lastSeen=Date.now()-10*3600e3;S.phone={model:'Drizzle Flip',color:'#c7b3f0',case:null,charm:null,since:Date.now()-5e8};S.bike={type:'city',color:'#3f8f8a',name:'Puddle',since:Date.now()-4e8,rides:3};S.gadgets=[];S.diary=S.diary.slice(0,3);S.sched={bed:23,wake:7.4};return JSON.stringify(S)});await c0.close();
  const {ctx,p,errs}=await open(b,{width:500,height:400},false,`try{if(!sessionStorage.getItem('seeded')){localStorage.setItem('mocha-seattle-v1',${JSON.stringify(st)});sessionStorage.setItem('seeded','1')}}catch(e){}`);
  const r=await p.evaluate(()=>{const M=window.__mocha;return{g:M.gear(),seed:M.S.seed150,money:M.S.diary.some(e=>e.tag==='Money'),n:M.S.diary.length}});console.log('  ',JSON.stringify({coins:r.g.coins,bike:r.g.bike&&r.g.bike.name,rides:r.g.bike&&r.g.bike.rides,jobs:r.g.jobs,n:r.n}));
  ok(r.seed===1&&r.money,'old save got the one-time 150 coins + diary note');ok(r.g.coins>=0,'coins never negative');ok(r.g.bikeVisible&&r.g.bike.name==='Puddle','old save keeps bike and it is in the world');
  const r2=await p.evaluate(()=>{location.reload()});await p.waitForTimeout(4000);await p.waitForFunction(()=>window.__mocha,null,{timeout:60000});const r3=await p.evaluate(()=>({seed:window.__mocha.S.seed150,money:window.__mocha.S.diary.filter(e=>e.tag==='Money').length}));ok(r3.money===1,'the 150-coin bonus is only given once');
  console.log('  errors:',errs.length?errs:'none');ok(!errs.length,'no page errors (old save)');await ctx.close()}
if(!filt||filt==='mind'){console.log('== mocked Claude mind');
  const {ctx,p,errs}=await open(b,{width:500,height:400},false,`window.claude={use:async k=>k==='sample'?(async(prompt)=>{window.__prompts=(window.__prompts||[]);window.__prompts.push(prompt);const r=window.__nextReply||{diary:'ok',next:{place:'home',spot:'couch',doing:'resting'}};return{text:JSON.stringify(r)}}):null}`);
  const E=(f,a)=>p.evaluate(f,a);
  let r=await E(async()=>{const M=window.__mocha,G=M.G;M.MIND.on=true;M.MIND.last=0;M.coins(200);
    window.__nextReply={diary:'Helped Dot with cables!',enjoyed:.6,buy:{item:'phone',model:'Ghostphone',color:'#c7b3f0'},next:{place:'cafe',job:true,doing:'helping at the cafe',say:'back to work!'}};
    const act={...M.ACTS.find(a=>a.fx==='phoneshop'&&a.s==='display')};G.act=act;G.mode='activity';G.timer=0;M.tick(1,.05);await new Promise(r=>setTimeout(r,300));
    const P=(window.__prompts||[]).slice(-1)[0]||'';return{n:(window.__prompts||[]).length,hasBuy:/"buy": null or/.test(P),hasMoney:/Money: 200 coins/.test(P),hasJob:/odd job here/.test(P),noSelfie:/no phone yet, so no selfies/.test(P),phone:M.S.phone,coins:M.S.coins,next:G.act&&{p:G.act.p,fx:G.act.fx,doing:G.act.doing}}});
  console.log('  ',JSON.stringify(r));ok(r.n>=1&&r.hasBuy&&r.hasMoney&&r.hasJob&&r.noSelfie,'mind prompt has money, buy, odd jobs, no-selfie rule');ok(r.phone&&r.phone.model==='Ghostphone'&&r.coins===80,'mind bought a lavender Ghostphone (coins '+r.coins+')');ok(r.next&&r.next.p==='cafe'&&r.next.fx==='job','mind chose an odd job at the café next');
  r=await E(async()=>{const M=window.__mocha,G=M.G;M.MIND.last=0;const c0=M.S.coins;window.__nextReply={diary:'Juniper let me steam milk.',next:{place:'bikes',spot:'bikes',doing:'looking at bikes'}};G.mode='activity';G.timer=0;M.tick(1,.05);await new Promise(r=>setTimeout(r,300));return{d:M.S.coins-c0,jobs:M.S.jobs,top:M.S.diary.slice(0,2).map(e=>e.tag+': '+e.text),next:G.act&&{p:G.act.p,fx:G.act.fx}}});
  console.log('  ',JSON.stringify(r));ok(r.d>=12&&r.jobs===1,'mind odd job paid '+r.d);ok(r.next&&r.next.p==='bikes'&&r.next.fx==='bikeshop','mind visit to the bike shop is a shopping trip');
  r=await E(async()=>{const M=window.__mocha,G=M.G;M.MIND.last=0;M.coins(90);window.__nextReply={diary:'Just looking.',buy:{item:'bike',model:'cruiser'},next:{place:'park',doing:'biking around the lake'}};G.mode='activity';G.timer=0;M.tick(1,.05);await new Promise(r=>setTimeout(r,300));return{bike:M.S.bike,coins:M.S.coins}});
  ok(r.bike===null&&r.coins===90,'mind cannot buy a 130-coin cruiser with 90 coins');
  r=await E(async()=>{const M=window.__mocha,G=M.G;M.MIND.last=0;M.coins(300);window.__nextReply={diary:'Got it!',buy:{item:'bike',model:'cruiser with a basket',color:'#f7a8c4',name:'Marshmallow'},next:{place:'park',doing:'biking around the lake'}};G.act={...M.ACTS.find(a=>a.fx==='bikeshop')};G.mode='activity';G.timer=0;M.tick(1,.05);await new Promise(r=>setTimeout(r,300));return{bike:M.S.bike,next:G.act&&{p:G.act.p,fx:G.act.fx,loop:G.act.loop},route:M.gear().route}});
  console.log('  ',JSON.stringify({bike:r.bike,next:r.next}));ok(r.bike&&r.bike.type==='cruiser'&&r.bike.name==='Marshmallow','mind bought a pink cruiser named Marshmallow');ok(r.next&&r.next.fx==='bikeride'&&r.next.loop==='park','"biking around the lake" became a real bike ride');ok(r.route&&r.route.loop,'he plans the ride to the lake loop');
  console.log('  errors:',errs.length?errs:'none');ok(!errs.length,'no page errors (mind)');await ctx.close()}
if(!filt||filt==='mobile'){for(const [n,vp] of [['portrait',{width:393,height:852}],['landscape',{width:852,height:393}],['unfolded',{width:900,height:1000}]]){console.log('== '+n);
  const {ctx,p,errs}=await open(b,vp,true);
  await p.evaluate(()=>{const M=window.__mocha;M.coins(400);M.buyGear('phone',{model:'Drizzle Flip',color:'#ff9a8a'});M.buyGear('case',{pattern:'stars',color:'#2b3350'});M.buyGear('bike',{type:'bmx',color:'#e04f4f',name:'Rocket'});M.buyGear('helmet',{color:'#8cc8f0'});M.buyGear('earbuds',{color:'#fffaf2'});
    const P=document.getElementById('panel');if(P.classList.contains('hidden'))document.getElementById('bookBtn').click()});await p.waitForTimeout(600);
  await p.evaluate(()=>document.querySelector('nav button[data-tab="me"]').click());await p.waitForTimeout(700);
  await p.evaluate(()=>{const h=[...document.querySelectorAll('#tab-me h4')].find(x=>/his money/.test(x.textContent));h&&h.scrollIntoView({block:'start'})});await p.waitForTimeout(900);
  await p.screenshot({path:OUT+'t-me-'+n+'.png'});
  const w=await p.evaluate(()=>{const t=document.getElementById('tab-me');return t.scrollWidth<=t.clientWidth+1});ok(w,n+': me tab has no horizontal overflow');
  console.log('  errors:',errs.length?errs:'none');ok(!errs.length,'no page errors ('+n+')');await ctx.close()}}
await b.close();console.log(fails.length?'FAILURES: '+fails.length+'\n - '+fails.join('\n - '):'ALL PASSED');process.exit(fails.length?1:0)})();

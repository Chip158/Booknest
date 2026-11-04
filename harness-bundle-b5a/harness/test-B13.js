// B13 acceptance: five new shops + keepers (lint, TRUE facts via fx:'ask'), phone/bike/station rebuilt to the layout standard
// (lint clean, counters facing the door), DISPLAY 16..40, LIGHTSPOTS/plank/chalk per new shop, round-1 purchases + trips intact,
// room camera + culling on a new shop. node test-B13.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,500):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.goto('file://'+file);await p.waitForTimeout(4500);
const E=f=>p.evaluate(f);
ok(await E(()=>typeof window.__mocha.display==='function'&&typeof window.__mocha.layoutLint==='function'&&typeof window.__mocha.b13Info==='function'),'hooks: __mocha.display(pid), __mocha.layoutLint(), __mocha.b13Info()');
// 1) lint: every building, then the 8 B13 places one by one
let r=await E(()=>window.__mocha.layoutLint());ok(Array.isArray(r)&&r.length===0,'layoutLint() is [] for all 19 shops + the stoop',r);
r=await E(()=>{const M=window.__mocha;return M.B13P.map(id=>[id,M.layoutLint(id).length,!!M.byId[id].lyt])});ok(r.every(x=>x[1]===0&&x[2]),'the 5 new shops + phones/bikes/station are built from LAYOUTS and lint clean',r);
// 2) the five new keepers: KEEPERS fields, hi lines, an ask ACT, TRUE facts; fx:'ask' answers from their own FACTS
r=await E(()=>{const M=window.__mocha;return ['otis','wren','willa','pippin','luma'].map(id=>{const k=M.KEEPERS.find(k=>k.id===id);return{id,shop:k&&k.shop,f:!!(k&&k.name&&k.species&&k.pr&&k.topic&&k.fk.length),hi:k?k.hi.length:0,ask:M.ACTS.some(a=>a.fx==='ask'&&a.keeper===id),obj:!!(k&&k.obj&&(k.obj.parent===M.byId[k.shop].inner||(k.obj.parent===M.scene&&M.town&&M.town.N[k.id])))}})});
ok(r.every(x=>x.f&&x.hi>=3&&x.ask&&x.obj),'Otis, Wren, Willa, Pippin and Luma: KEEPERS fields, 3 hi lines, an ask act, placed in their shop interior (or in world space under the B22 town clock)',r);
r=await E(()=>{const M=window.__mocha,S=M.S,G=M.G;const a={p:'nursery',s:'counter',fx:'ask',keeper:'willa'};const n0=S.diary.length,d0=S.diary[0];M.forceAct(a);const act=G.act&&G.act.keeper;let i=0,arrived=0;for(;i<4000;i++){if(G.mode==='activity'){arrived=1;if(G.timer>.05)G.timer=.05}M.tick(1,.05);if(S.diary.some((x,j)=>j<3&&x!==d0&&x.tag==='Asked'))break}
  const e=S.diary.slice(0,S.diary.length-n0+1).find(x=>x.tag==='Asked'&&x!==d0),k=M.KEEPERS.find(k=>k.id==='willa'),bank=M.FACTSK(k.fk);return{act,arrived,steps:i,tag:e&&e.tag,text:e&&e.text,trueFact:!!e&&bank.some(f=>e.text.includes('"'+f+'"')),learned:S.learned[0]&&S.learned[0].topic}});
ok(r.act==='willa'&&r.arrived&&r.tag==='Asked'&&/Willa Thornbury the young witch/.test(r.text||'')&&r.trueFact,"forceAct({p:'nursery',s:'counter',fx:'ask',keeper:'willa'}): Mocha walks to the counter and the diary gets a TRUE fact from Willa",r);
r=await E(()=>{const M=window.__mocha,S=M.S,out=[];const F={'nw plants':['Sword ferns stay green all winter.','Washington\'s state tree is the western hemlock.'],baking:['The marionberry is a blackberry cultivar developed at Oregon State University.'],woodworking:['Western redcedar is naturally rot-resistant, which is why it is used for shingles and canoes.'],moths:['Luna moth adults have no mouths and live about a week.'],wool:['Jacob sheep can grow two, four or even six horns.']};
  for(const [id,shop] of [['willa','nursery'],['otis','evergreen'],['wren','threads'],['pippin','bakery'],['luma','lantern']]){const k=M.KEEPERS.find(k=>k.id===id);const bank=M.FACTSK(k.fk);for(let i=0;i<4;i++){M.localOutcome({...M.ACTS.find(a=>a.fx==='ask'&&a.keeper===id)});const t=S.diary[0].text,f=bank.find(f=>t.includes('told me: "'+f+'"'));out.push({id,ok:!!f,fact:f||t})}}
  const spec=Object.entries(F).every(([key,fs])=>fs.every(f=>M.FACTSK([key]).includes(f)));return{out,spec}});
ok(r.out.every(x=>x.ok),'every new keeper answers fx:\'ask\' with one of their own TRUE FACTS (20 asks)',r.out.filter(x=>!x.ok).concat(r.out.slice(0,2)));
ok(r.spec,'the spec facts are in the banks (redcedar, sword ferns, marionberry/OSU, luna moth, Jacob sheep horns)');
// 3) phones / bikes / station: counters face the door (keeper yaw within 60 deg of the door; counter front within 60 deg)
r=await E(()=>{const M=window.__mocha;return ['phones','bikes','station','bakery','threads','nursery','evergreen','lantern'].map(id=>{const p=M.byId[id],k=M.KEEPERS.find(k=>k.shop===id),dr=p.door,zf=p.d/2-.3,[kx,kz,yaw]=k.pos,tx=dr.x-kx,tz=zf+.3-kz,L=Math.hypot(tx,tz);
  const kd=Math.acos(Math.max(-1,Math.min(1,(Math.sin(yaw)*tx+Math.cos(yaw)*tz)/L)))*180/Math.PI,c=p.lyt.counter,ry=c.side==='sideL'?Math.PI/2:c.side==='sideR'?-Math.PI/2:0,cx=dr.x-c.x,cz=zf+.3-c.z,cl=Math.hypot(cx,cz),cd=Math.acos((Math.sin(ry)*cx+Math.cos(ry)*cz)/cl)*180/Math.PI;return{id,keeper:k.id,kd:Math.round(kd),cd:Math.round(cd),side:c.side}})});
ok(r.every(x=>x.kd<=60&&x.cd<=60),'Cascade Mobile, Spoke & Sprocket, Rain City Station (and the new shops): keeper and counter face the door within 60 deg',r);
// 4) DISPLAY 16..40 for every shop with goods (+ window slots), LIGHTSPOTS, OPEN/CLOSED plank and chalkboard on each new shop
r=await E(()=>{const M=window.__mocha,d=M.display(),goods=Object.keys(d).filter(k=>!(M.LAYOUTS[k]&&M.LAYOUTS[k].goods===false));return{bad:goods.filter(k=>d[k]<16||d[k]>40).map(k=>[k,d[k]]),d,win:['bakery','threads','nursery','evergreen','lantern','phones','bikes'].map(k=>[k,M.display(k).window])}});
ok(!r.bad.length&&r.win.every(x=>x[1]>=2&&x[1]<=3),'every shop with goods has 16 to 40 DISPLAY slots, 2-3 of them window slots',r);
r=await E(()=>window.__mocha.b13Info().slice(0,5).map(i=>({pid:i.pid,soon:i.soon,lights:i.lights,plank:i.plank,chalk:i.chalk,line:i.chalkLine})));
ok(r.every(x=>!x.soon&&x.lights>=2&&x.plank&&x.chalk===2&&x.line),'each new shop: no longer "coming soon", LIGHTSPOTS, an OPEN/CLOSED plank and an A-frame chalkboard',r);
r=await E(()=>window.__mocha.datl());ok(r.used.chalk===19&&r.w===1024,'door atlas holds all 19 chalkboards (widened to 1024)',r);
// 5) special pieces: fitting room spot 'fit', Pepper, cauldron + night mushrooms, the lean-to, the takeaway hatch, Evergreen vignettes + workshop
r=await E(()=>{const M=window.__mocha,t=M.byId.threads,n=M.byId.nursery,e=M.byId.evergreen,bk=M.byId.bakery;return{fit:t.spots.fit,pepper:!!(n.pepper&&n.pepper.parent),mush:M.LIGHTSPOTS.filter(l=>l.pid==='nursery'&&l.kind==='mushroom').length,vig:M.vignettes(),ws:e.spots.workshop,
  hatch:bk.walls[0][0].children.length,colp:M.COL?M.COL.hit(-14,47.5,.3):null,lean:M.byId.nursery.x}});
ok(Array.isArray(r.fit)&&r.pepper&&r.mush===3&&r.vig.length===3&&r.vig.every(v=>v.meshes>=1)&&r.ws&&r.hatch>=1,'fitting room spot, Pepper, 3 glowing-mushroom planters, 3 movable vignettes, the workshop spot and the bakery hatch exist',r);
ok(r.colp===1,'the greenhouse lean-to blocks the walker (COL prop circles)',r.colp);
r=await E(()=>{const M=window.__mocha;return{day:M.mushGlow()}});ok(r.day<.05,'glowing mushrooms are off by day',r);
// 6) round-1 purchases, the station spots for trains/trips
r=await E(()=>{const M=window.__mocha,S=M.S;const keep={phone:S.phone,bike:S.bike,coins:S.coins};S.phone=null;S.bike=null;S.coins=900;const t=Date.now();
  const a=M.buyGear('phone',{},t,false,'Cascade Mobile'),hadPhone=!!S.phone;const b2=M.buyGear('bike',{type:'city'},t+1,false,'Spoke & Sprocket'),hadBike=!!S.bike;
  M.shopVisit({p:'phones',s:'display',fx:'phoneshop'},t+2,false,'Cascade Mobile',true);M.shopVisit({p:'bikes',s:'bikes',fx:'bikeshop'},t+3,false,'Spoke & Sprocket',true);
  const path=M.bikePath(M.G.x,M.G.z,M.byId.park?M.byId.park.dx:0,M.byId.park?M.byId.park.dz:0);Object.assign(S,keep);return{hadPhone,hadBike,path:path&&path.length}});
ok(r.hadPhone&&r.hadBike&&r.path>0,'round-1 phone and bike purchases still work; bike paths still route',r);
r=await E(()=>{const M=window.__mocha,st=M.byId.station,pl=st.spots.platform,bd=st.spots.board;const w=M.toWorld?M.toWorld(st,pl[0],pl[1]):null;const ex=['main','bench','kiosk','counter','platform','board'].filter(k=>!st.spots[k]);
  const rt=M.navRoute(120,8,w?w.x:150,w?w.z:0,M.AGENTS.find(a=>a.id==='mocha'));return{missing:ex,board:!!st.board,rt:rt&&rt.ok,kind:rt&&rt.kind,inner:!!(st.inner&&st.inner.children.length)}});
ok(!r.missing.length&&r.board&&r.rt&&r.inner,'station: platform/board spots + departure board kept for trains and trips, interior in p.inner, Mocha can route to the platform',r);
// 7) culling + room camera on a new shop: the bakery interior is hidden from afar, the room camera frames it with the walker inside
r=await E(async()=>{const M=window.__mocha,bk=M.byId.bakery,G=M.G,sl=ms=>new Promise(r=>setTimeout(r,ms));G.x=40;G.z=41;G.mode='idle';G.act=null;G.timer=1e4;M.setCamMode('follow');await sl(1500);const i0=M.inside();const far=bk.inner.visible&&!(i0.on&&i0.pid!=='bakery');/* merge (LF1): inside another room the whole WORLD (bakery included) is hidden */M.setCamMode('walk');const w=M.toWorld(bk,0,0);M.walker(w.x,w.z,0,0);await sl(2500);for(let k=0;k<60;k++){const i=M.inside();if(i.pid==='bakery'&&i.ph==='idle')break;await sl(200)}/* merge (LF1): door swaps take a few slow SwiftShader frames */const c=M.roomCam();const near=bk.inner.visible,op=+(bk.op||1).toFixed(2);M.walker(w.x-30,w.z,0,0);await sl(800);M.setCamMode('follow');return{far,near,op,top:c.top,pid:c.pid,fit:c.fit,dist:c.dist}});
ok(!r.far&&r.near&&r.top==='room'&&r.pid==='bakery','bakery interior culled from afar; walker inside -> room camera on the bakery',r);
r=await E(()=>window.__mocha.b13Info().map(i=>[i.pid,i.merged]));ok(r.every(x=>x[1]<=12),'each rebuilt interior merges to 12 or fewer static draws',r);
ok(!errs.length,'no page errors',errs.slice(0,5));
console.log(fails?`FAILED ${fails}`:'ALL PASS');await b.close();process.exit(fails?1:0)})();

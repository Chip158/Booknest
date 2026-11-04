// B14 acceptance: Wendell's cottage (spots, visible inside at 21:00 through the cutaway, the TV redraws only while visible,
// painting gifts inside), Mocha's house (pair + drop-in spots, p.rooms), the empty-house set (emptyHouse, capSpot, lint in both
// states), drop-in SEATS, rooms/occupancy, per-home interior draws <= 14. node test-B14.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,600):''));if(!c)fails++};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(21));
await p.goto('file://'+file);await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);
ok(await E(()=>['wendellSpots','rooms','capSpot','emptyHouse'].every(k=>typeof window.__mocha[k]==='function')),'hooks: __mocha.wendellSpots(), rooms(pid), capSpot(slot), emptyHouse(on)');
// 1) Wendell's interior spots
let r=await E(()=>window.__mocha.wendellSpots());const need=['fireA','fireB','fireC','teaA','teaB','bed','stove','shelf','reading','door','porchA','porchB','porchC'];
ok(need.every(k=>r.spots[k]),"Wendell's cottage has fireA/B/C, teaA/B, bed, stove, shelf, reading, door + porchA/B/C",Object.keys(r.spots));
ok(['fireA','fireB','fireC','teaA','teaB','bed','stove','shelf','reading','door'].every(k=>{const l=r.spots[k].l;return Math.abs(l[0])<6.5&&Math.abs(l[1])<5}),'the indoor spots are inside the 13x10 footprint');
ok(r.W_SPOTS.porch&&Math.hypot(r.W_SPOTS.porch.x-r.spots.porchA.x,r.W_SPOTS.porch.z-r.spots.porchA.z)<.2&&r.capShelf&&r.chimney,'W_SPOTS.porch = the swing (porchA); capShelf + chimney data for B17/B16',{porch:r.W_SPOTS.porch,a:r.spots.porchA});
// 2) visible inside at 21:00 through the cutaway
r=await E(async()=>{const M=window.__mocha,G=M.G;G.x=38;G.z=41;G.mode='idle';G.timer=1e4;M.wForce('inside');/* merge (LF1): no outdoor cutaway any more; you see him by walking into his cottage (the immersive room) */M.setCamMode('walk');{const q=M.toWorld(M.byId.neighbor,0,1);M.walker(q.x,q.z,0,0)}for(let k=0;k<80;k++){const i=M.inside();if(i.pid==='neighbor'&&i.ph==='idle')break;await new Promise(r=>setTimeout(r,150))}await new Promise(r=>setTimeout(r,1500));const w=M.wendellSpots();
  const nb=M.byId.neighbor,b=M.b14();return{hour:new Date().getHours(),inside:w.inside,vis:w.vis,spot:w.spot,x:w.x,z:w.z,op:nb.op==null?null:+nb.op.toFixed(3),inVis:nb.inVis,innerVis:nb.inner.visible,W:b.W}});
ok(r.hour===21&&r.inside&&r.vis&&r.spot==='fireA'&&r.op<.2&&r.inVis&&r.innerVis,'at 21:00 Wendell is inside, visible in his armchair (fireA), the front wall + roof faded and the interior shown',r);
ok(r.W.place==='neighbor'&&r.W.room==='living','his agent is in the neighbor place, room = living (spot->room map)',r.W);
// 3) the TV redraws only while visible
r=await E(async()=>{const M=window.__mocha;M.tv(true);await new Promise(r=>setTimeout(r,2500));const a=M.tv();await new Promise(r=>setTimeout(r,2000));const b2=M.tv();
  M.CAM.pop('t14');M.CAM.push('t14',{prio:3,lock:true,ease:40,tx:-80,ty:1,tz:-60,dist:20,pitch:.5,yaw:0});M.cam.tick(80,.05);await new Promise(r=>setTimeout(r,1500));const c=M.tv();await new Promise(r=>setTimeout(r,3000));const d=M.tv();M.CAM.pop('t14');M.tv(null);
  return{near:[a.n,b2.n],nearVis:a.vis,film:a.film,away:[c.n,d.n],awayVis:d.vis}});
ok(r.nearVis&&r.near[1]>r.near[0]&&r.film,'the late-show TV plays a real FILM and redraws while visible',r);
ok(!r.awayVis&&r.away[1]===r.away[0],'the TV redraw counter stays flat when the camera is away',r);
// 4) Mocha's house spots + rooms
r=await E(()=>{const M=window.__mocha,h=M.byId.home;return{spots:['couchA','couchB','couchC','teaA','teaB','porchA','porchB','porchC','desk2'].filter(k=>!h.spots[k]),rooms:M.rooms('home'),keep:['bed','bath','desk','kitchen','couch'].filter(k=>!h.spots[k])}});
ok(!r.spots.length&&!r.keep.length,"Mocha's house has couchA/B/C, teaA/B, porchA/B/C, desk2 (and keeps bed/bath/desk)",r.spots);
ok(r.rooms.rooms&&['kitchen','living','bedroom','bath','hall'].every(k=>r.rooms.rooms[k])&&r.rooms.spotRoom.bed==='bedroom'&&r.rooms.spotRoom.kitchen==='kitchen'&&r.rooms.spotRoom.couchA==='living'&&r.rooms.spotRoom.bath==='bath','p.rooms zones (kitchen/living/bedroom/bath/hall) + spot->room map',r.rooms);
r=await E(()=>{const M=window.__mocha;return M.rooms('neighbor')});ok(r.rooms&&r.spotRoom.fireA==='living'&&r.spotRoom.teaA==='kitchen'&&r.spotRoom.bed==='bed','Wendell\'s p.rooms (living/kitchen/bed nook/hall)',r.spotRoom);
// 5) drop-in seats
r=await E(()=>window.__mocha.b14().seats);ok(r.length===4&&['home:couchC','home:porchC','neighbor:fireC','neighbor:porchC'].every(k=>r.some(s=>s.p+':'+s.spot===k)),"drop-in SEATS (tag 'dropin'): couchC, porchC at Mocha's; fireC, porchC at Wendell's",r);
// 6) the empty-house set + capSpot + lint in both states
r=await E(()=>{const M=window.__mocha;const off={lint:M.layoutLint(),couch:M.capSpot('couch'),table:M.capSpot('table')};const on=M.emptyHouse(true);const b=M.b14();const st={nest:b.home.nest,draws:b.home.draws,couch:M.capSpot('couch'),table:M.capSpot('table'),bed:M.capSpot('bed'),lamp:M.capSpot('lamp'),lint:M.layoutLint()};const back=M.emptyHouse(false);return{off,on:st,back:{nest:M.b14().home.nest,lint:back.lint,couch:M.capSpot('couch')}}});
ok(r.off.lint.length===0,'layoutLint() is [] furnished (all shops + both homes)',r.off.lint);
ok(r.on.nest&&r.on.couch&&r.on.couch.s==='floorA'&&r.on.couch.pair[1]==='floorB'&&r.on.table.s==='boxA'&&r.on.table.pair[1]==='boxB'&&r.on.bed.s==='blanket'&&r.on.lamp.s==='bulb','emptyHouse(true) shows the blanket/box/cushions/bulb; capSpot(couch)=floorA, capSpot(table)=boxA',r.on);
ok(r.on.lint.length===0,'layoutLint() is [] in the empty-house state',r.on.lint);
ok(!r.back.nest&&r.back.lint.length===0&&r.back.couch.s==='couch','emptyHouse(false) hides it again; capSpot(couch) back to the couch',r.back);
// 7) per-home interior draws
r=await E(()=>{const M=window.__mocha;M.emptyHouse(true);const a=M.b14();M.emptyHouse(false);const b2=M.b14();return{homeNest:a.home.draws,home:b2.home.draws,neighbor:b2.neighbor.draws,mergedH:b2.home.merged,mergedN:b2.neighbor.merged}});
ok(r.homeNest<=14&&r.home<=14&&r.neighbor<=14,'each home interior is <= 14 draws (Mocha furnished / with the nest set, Wendell)',r);
// 8) painting gifts hang inside Wendell's cottage
r=await E(()=>{const M=window.__mocha,S=M.S;const pt=M.makePainting('wendell','For Wendell');pt.where='gift:wendell';S.paintings.push(pt);M.applyPaintings();const nb=M.byId.neighbor;let o=null;nb.inner.traverse(x=>{if(x.isGroup&&x.children.length===2&&x.children[1].material&&x.children[1].material.map&&x.children[1].material.map.image&&x.children[1].material.map.image.width===128&&!o)o=x});
  S.paintings.pop();M.applyPaintings();return{found:!!o,pos:o?[+o.position.x.toFixed(2),+o.position.y.toFixed(2),+o.position.z.toFixed(2)]:null,parentInner:!!o}});
ok(r.found&&Math.abs(r.pos[0])<6.5&&Math.abs(r.pos[2])<5,'a painting gift for Wendell hangs inside his cottage (in p.inner)',r);
// 9) Wendell walks out and back in through his door (nav from the armchair)
r=await E(()=>{const M=window.__mocha;M.wForce('inside');const g=M.wGo('porch');let i=0;M.navSim(80,k=>{i=k;return M.wpos().path>0});const a=M.wendellSpots();const g2=M.wGo('inside');let j=0;M.navSim(80,k=>{j=k;return M.wpos().path>0});const b2=M.wendellSpots();return{out:{n:g.n,steps:i,inside:a.inside,x:a.x,z:a.z},back:{n:g2.n,steps:j,inside:b2.inside,spot:b2.spot}}});
ok(r.out.n>0&&r.out.steps<1600&&!r.out.inside&&Math.hypot(r.out.x-10.05,r.out.z-46.4)<1.5,'from his armchair he walks out the front door to the porch swing',r.out);
ok(r.back.n>0&&r.back.steps<1600&&r.back.inside&&r.back.spot==='fireA','and back inside to his armchair',r.back);
ok(errs.length===0,'no page errors',errs.slice(0,5));
console.log(fails?`${fails} FAILED`:'ALL PASS');await b.close();process.exit(fails?1:0)})();

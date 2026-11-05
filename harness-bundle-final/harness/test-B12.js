// B12 acceptance: layoutLint()==[] (+ self-check that it catches faults), keepers' ask spots + facing, cinema flip + movie,
// bookstore room camera (top 'room', fit range, front faded, zoom restored), per-interior draws <= 12, DISPLAY, LIGHTSPOTS, culling, hooks.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,500):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.goto('file://'+file);await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
ok(await E(()=>{const M=window.__mocha;return['layoutLint','display','rooms','roomCam','drawCalls'].every(k=>typeof M[k]==='function')}),'hooks: layoutLint, display, rooms, roomCam, drawCalls');
// 1) lint clean for every existing building + Mocha's stoop
let r=await E(()=>window.__mocha.layoutLint());ok(Array.isArray(r)&&r.length===0,'layoutLint() returns [] (cinema, library, records, thrift, petstore, grocery, cafe, market, arcade, studio, bookstore, home stoop)',r);
r=await E(()=>{const M=window.__mocha;return['cinema','library','records','thrift','petstore','grocery','cafe','market','arcade','studio','bookstore'].map(id=>[id,(M.byId[id].lay||[]).length])});ok(r.every(x=>x[1]>=8),'every building has lint items',r);
// lint self-check: it must catch an overlap, a blocked entry, a floating item and a keeper facing away
r=await E(()=>{const M=window.__mocha,q=M.byId.records,L=q.lay,k=M.KEEPERS.find(k=>k.id==='basil'),y=k.pos[2];L.push({k:'fakeA',x0:-1.9,y0:.3,z0:-.5,x1:-1.0,y1:1.2,z1:.5},{k:'fakeE',x0:-.5,y0:.3,z0:3.2,x1:.5,y1:1.2,z1:3.8},{k:'fakeF',x0:0,y0:2,z0:0,x1:.3,y1:2.3,z1:.3});k.pos[2]=y+Math.PI;
  const o=M.layoutLint('records');L.length-=3;k.pos[2]=y;return o.map(e=>e.k+':'+(e.a||e.keeper||''))});
ok(r.includes('overlap:bins')||r.some(x=>x.startsWith('overlap')),'self-check: an overlap is reported',r);ok(r.some(x=>x.startsWith('entry')),'self-check: a blocked entry zone is reported');ok(r.some(x=>x==='float:fakeF'),'self-check: a floating item is reported');ok(r.some(x=>x.startsWith('keeper')),'self-check: a keeper facing away is reported');
// 2) every keeper: ask spot is a free grid cell reachable from the door, keeper faces the door within 60 degrees
r=await E(()=>{const M=window.__mocha,out=[];for(const k of M.KEEPERS){const p=M.byId[k.shop],dr=p.door||{x:0},zf=p.d/2,[kx,kz,yaw]=k.pos,tx=dr.x-kx,tz=zf-kz,L=Math.hypot(tx,tz),deg=Math.acos((Math.sin(yaw)*tx+Math.cos(yaw)*tz)/L)*180/Math.PI;
  if(!p.grid)M.regrid(p.id);const g=p.grid,w=p.gw,c=Math.floor((k.ask[0]+p.w/2)/.5)+Math.floor((k.ask[1]+p.d/2)/.5)*w;out.push({id:k.id,shop:k.shop,deg:Math.round(deg),free:!g[c],ask:k.ask})}return out});
const B12=['cinema','library','records','thrift','petstore','grocery','cafe','market','arcade','studio','bookstore'];
ok(r.filter(x=>B12.includes(x.shop)).every(x=>x.deg<=60&&x.free),'B12 keepers: ask spot free + facing within 60 deg of the door',r.filter(x=>B12.includes(x.shop)).map(x=>x.id+':'+x.deg+(x.free?'':'!blocked')));
ok(r.every(x=>x.deg<=60),'all 14 keepers face within 60 deg',r.map(x=>x.id+':'+x.deg));
ok(r.find(x=>x.id==='pearl').deg<60&&r.find(x=>x.id==='bea').deg<60,'Pearl and Bea no longer have their backs to the door',r.filter(x=>x.id==='pearl'||x.id==='bea'));
// 3) cinema: screen on the back wall, seats face it, lobby counter inside the door, startMovie plays
r=await E(()=>{const M=window.__mocha,c=M.byId.cinema,sc=c.screenMesh,cnt=c.lay.find(a=>a.counter),seats=c.lay.filter(a=>a.k==='seats'),part=c.lay.find(a=>a.k==='partition');return{screenZ:+sc.position.z.toFixed(2),back:-c.d/2,seatYaw:c.spots.seat1&&c.spots.seat1[2],seatZmax:Math.max(...seats.map(a=>a.z1)),partZ:part&&part.z0,counter:cnt&&[cnt.x0,cnt.z0,cnt.x1,cnt.z1],monty:M.KEEPERS.find(k=>k.id==='monty').pos,beamStartZ:+c.beam.position.z.toFixed(2)}});
ok(r.screenZ<r.back+1,'cinema screen sits on the back wall',r);ok(Math.abs(r.seatYaw-Math.PI)<.01&&r.seatZmax<r.partZ,'seats face the screen (yaw PI) and sit behind the curtained partition',r);ok(r.counter&&r.counter[1]>r.partZ&&r.counter[0]<-6,'Monty\'s counter is in the lobby on the left wall',r.counter);
r=await E(async()=>{const M=window.__mocha;M.forceAct({p:'cinema',s:'seat',fx:'movie',doing:'watching a movie',tags:['fun']});{const c=M.byId.cinema,s=c.spots.seat,cs=Math.cos(c.ry),sn=Math.sin(c.ry);for(let i=0;i<40&&!M.MOVIE();i++){M.G.x=c.x+s[0]*cs+s[1]*sn;M.G.z=c.z-s[0]*sn+s[1]*cs;await new Promise(r=>setTimeout(r,500))}}await new Promise(r=>setTimeout(r,1500));const mv=M.MOVIE(),c=M.byId.cinema,a=M.G.act,f=a&&a.face;let lz=null;if(f){const cs=Math.cos(c.ry),sn=Math.sin(c.ry),dx=f.x-c.x,dz=f.z-c.z;lz=dx*sn+dz*cs}return{movie:!!mv,title:mv&&mv.film.title,faceLocalZ:lz&&+lz.toFixed(2),ver:c.screen.t.version}});
ok(r.movie&&r.faceLocalZ<-5,'startMovie plays and Mocha faces the back-wall screen',r);
// 4) bookstore room camera
const base=await E(()=>{const M=window.__mocha;M.setCamMode('walk');M.walker(12,22,Math.PI,0);M.roomTick(60,.05);return M.roomCam()});
r=await E(()=>{const M=window.__mocha,q=M.byId.bookstore,cs=Math.cos(q.ry),sn=Math.sin(q.ry),lx=1.4,lz=2.8;M.walker(q.x+lx*cs+lz*sn,q.z-lx*sn+lz*cs,0,0);return M.roomTick(80,.05)});
ok(r.top==='room'&&r.pid==='bookstore','walker inside the bookstore: top CAM entry is room',{top:r.top,pid:r.pid,stack:r.stack});
ok(r.range&&r.dist>=r.range[0]-.01&&r.dist<=r.range[1]+.01&&Math.abs(r.dist-r.fit)<.5,'room distance is the fit distance, inside the fit range',{dist:r.dist,fit:r.fit,range:r.range});
ok(Math.abs(r.yawOff)<=70.5&&r.pitch>=.55&&r.pitch<=1.1,'yaw within 70 deg of the facade, pitch clamped .55..1.1',{yawOff:r.yawOff,pitch:r.pitch});
await W(6000);r=await E(()=>window.__mocha.roomCam());ok(r.frontFaded&&r.inVis,'front wall faded and the interior drawn',{frontOp:r.frontOp,inVis:r.inVis});
r=await E(()=>{const M=window.__mocha,c=M.roomCam();if(c.range)M.setDist(c.range[1]*3);return M.roomCam()});ok(r.range&&r.dist<=r.range[1]+.01,'zoom stays inside the fit range',{dist:r.dist,range:r.range});
r=await E(()=>{const M=window.__mocha;M.walker(12,24,Math.PI,0);return M.roomTick(160,.05)});ok(r.top!=='room'&&Math.abs(r.camDist-base.camDist)<.05*base.camDist,'leaving pops room and restores the previous zoom',{top:r.top,dist:r.camDist,before:base.camDist});
// 5) culling: far from a closed shop with an opaque shell the interior is not drawn
r=await E(async()=>{const M=window.__mocha;M.setCamMode('follow');await new Promise(r=>setTimeout(r,2500));return['library','records','arcade','grocery','petstore'].map(id=>{const q=M.byId[id];return[id,q.inner.visible,q.op]})});
ok(r.filter(x=>x[0]!=='library').every(x=>!x[1]||x[2]<.999),'interiors of far shops with opaque shells are culled',r);
// 6) draws per interior, DISPLAY slots, LIGHTSPOTS
r=await E(()=>window.__mocha.rooms());ok(r.every(x=>x.draws.static<=12),'static draws per interior <= 12',r.map(x=>x.pid+':'+x.draws.static+'(+'+x.draws.dyn+' dyn)'));
r=await E(()=>{const M=window.__mocha;return Object.entries(M.display()).map(([k,n])=>[k,n,M.display(k).window])});const goods=r.filter(x=>!['cinema','library'].includes(x[0]));
ok(goods.every(x=>x[1]>=16&&x[1]<=40),'every shop with goods has 16-40 DISPLAY slots',r);ok(goods.filter(x=>x[2]>=2).length>=8,'window slots on the shopfronts',goods.map(x=>x[0]+':'+x[2]));
r=await E(()=>{const M=window.__mocha,s=M.display('records').slots[3];return{s,n:M.LIGHTSPOTS.length,l:M.LIGHTSPOTS[0]}});ok(r.s&&'lx' in r.s&&'surf' in r.s&&'maxW' in r.s&&r.n>=25&&['pid','lx','ly','lz','color','kind'].every(k=>k in r.l),'DISPLAY slot + LIGHTSPOTS shapes',r);
r=await E(()=>{const M=window.__mocha,s=M.byId.cafe.spots;return{t1:s.t1,t2:s.t2,t3:s.t3,t4:s.t4,b:s.browse1,seat1:s.seat1,counter:s.counter}});ok(r.t1&&r.t2&&r.t3&&r.t4&&r.b&&r.seat1&&r.t1.length===3,'p.spots has t1..t4, browse, seats, facing yaw',r);
r=await E(()=>window.__mocha.drawCalls());ok(r>0,'drawCalls() reports',r);
ok(!errs.length,'no page errors',errs.slice(0,5));
console.log(fails?'FAILURES: '+fails:'ALL PASS');await b.close()})();

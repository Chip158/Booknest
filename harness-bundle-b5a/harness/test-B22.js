// B22 acceptance: town.at(5.9) Juniper at the café door; at(6.05) sign + door open; at(14.2) Juniper on break, cafe shut; at(22) keepers home/back rooms, cafe dark + locked;
// pair('gus','hank') 4-6 alternating bubbles within 45 of the camera + Overheard within 8; 2-4 evening pal visits, one visible at a third place at 20:00;
// WEEKLY Mon vs Thu stages differ and are stable across reloads; <= 8 LOD0; catchUp adds no 3D; draws at 15:00 reported. node test-B22.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,700):''));if(!c)fails++};
const SH='/tmp/harness/b22/shots/';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file);await p.waitForTimeout(5500);return{ctx,p,errs,E:(f,a)=>p.evaluate(f,a)}};
let {ctx,p,errs,E}=await open({width:393,height:852},true,15);
ok(await E(()=>{const t=window.__mocha.town;return!!t&&['npc','plan','at','tick','sign','toss','pair','weekly'].every(k=>typeof t[k]==='function')}),'hooks: __mocha.town.npc/plan/at/tick/sign/toss/pair/weekly');
const w0=await E(()=>{const t=window.__mocha.town,j=t.npc('juniper');return{j,keeperAt:window.__mocha.keeperAt('cafe'),tick:t.tick()}});
ok(w0.j.world&&w0.j.st==='work'&&w0.keeperAt==='juniper','15:00: keepers live in world space; Juniper works the café; keeperAt(cafe) reads the plan',{st:w0.j.st,status:w0.j.status,ka:w0.keeperAt,tick:w0.tick});
// opening ritual
const a59=await E(()=>{const t=window.__mocha.town,r=t.at(5.9),d=window.__mocha.DOORS.find(x=>x.pid==='cafe'&&!x.back);return{r,dd:Math.hypot(r.juniper.x-d.wx,r.juniper.z-d.wz)}});
ok(a59.r.juniper.st==='open'&&a59.r.juniper.visible&&a59.dd<2.5&&a59.r.cafe.sign===false,'at(5.9): Juniper is at the café door, sign still CLOSED',{st:a59.r.juniper.st,dd:a59.dd,status:a59.r.juniper.status,sign:a59.r.cafe.sign});
const a605=await E(()=>window.__mocha.town.at(6.05));
ok(a605.cafe.sign===true&&a605.cafe.door.opening&&a605.cafe.open&&a605.juniper.st==='work','at(6.05): sign OPEN plus door open (ritual), Juniper starts work',{cafe:a605.cafe,st:a605.juniper.st});
// breaks
const a142=await E(()=>{const t=window.__mocha.town,r=t.at(14.2);return{r,isOpen:window.__mocha.town.sign('cafe').open,ka:window.__mocha.keeperAt('cafe')}});
ok(a142.r.juniper.st==='brk'&&a142.isOpen===false&&a142.r.cafe.sign===false&&/back at 2:30/.test(a142.r.cafe.note||'')&&a142.ka===null,'at(14.2): Juniper on break, isOpen(cafe) false, "back at 2:30" note, keeperAt(cafe) null',{st:a142.r.juniper.st,status:a142.r.juniper.status,cafe:a142.r.cafe});
const brk=await E(()=>{const t=window.__mocha.town,K=window.__mocha.KEEPERS;let mx=0,at=0;const inB=(b,h)=>b[0]<=b[1]?h>=b[0]&&h<b[1]:h>=b[0]||h<b[1];
  for(let h=9;h<20;h+=.125){let n=0;for(const k of K){const P=t.plan(k.id);let bb=null;for(const x of P)if(inB(x,h))bb=x;if(bb&&bb[5]==='brk')n++}if(n>mx){mx=n;at=h}}
  const each=K.filter(k=>k.id!=='rowan').every(k=>t.plan(k.id).some(x=>x[5]==='brk'&&x[1]-x[0]>=.49&&x[1]-x[0]<=.76));return{mx,at,each}});
ok(brk.mx<=3&&brk.each,'breaks: one 30-45 min break each (station excepted), staggered so <= 3 are out at once',brk);
const a22=await E(()=>{const t=window.__mocha.town,r=t.at(22),K=window.__mocha.KEEPERS,L=K.filter(k=>{const h=window.__mocha.byId[k.shop].hours;return h&&h[1]<=21.5}).map(k=>t.npc(k.id)),late=K.filter(k=>{const h=window.__mocha.byId[k.shop].hours;return h&&h[1]>21.5}).map(k=>k.id+':'+t.npc(k.id).st);return{late,cafe:r.cafe,bad:L.filter(n=>n.st!=='rest'||n.visible).map(n=>n.id+':'+n.st+':'+n.visible+':'+n.status),st:t.npc('juniper').status}});
ok(a22.bad.length===0&&a22.cafe.open===false&&a22.cafe.locked===true&&a22.cafe.lit===0&&a22.cafe.sign===false,'at(22): keepers of closed shops home in their back rooms ("asleep upstairs"), café dark, sign closed and door locked',{bad:a22.bad,cafe:a22.cafe,st:a22.st,lateShops:a22.late});
// evening pal visits
const vis=await E(()=>{const t=window.__mocha.town,V=t.palVisits(),r=t.at(20),seen=[];for(const v of V){if(!(v.h0<=20&&v.h1>20))continue;const A=t.npc(v.a),B=t.npc(v.b);seen.push({a:v.a,b:v.b,w:v.w,sa:A.st,sb:B.st,va:A.visible,vb:B.visible,d:+Math.hypot(A.x-B.x,A.z-B.z).toFixed(2),status:A.status})}
  const plans=V.every(v=>t.plan(v.a).some(x=>x[5]==='visit'&&x[6]===v.b)&&t.plan(v.b).some(x=>x[5]==='visit'&&x[6]===v.a));return{n:V.length,V,seen,plans}});
ok(vis.n>=2&&vis.n<=4&&vis.plans,'after closing: 2-4 seeded pal visits are part of BOTH plans',{n:vis.n,V:vis.V});
ok(vis.seen.some(s=>s.sa==='visit'&&s.sb==='visit'&&s.va&&s.vb&&s.d<=3),'20:00: a pal visit is visible at a third place (pair within 3)',vis.seen);
// Mocha-free: restore the clock, pals overheard
await E(()=>window.__mocha.town.at(null));
const pr0=await E(()=>{const t=window.__mocha.town,r=t.pair('gus','hank'),g=t.npc('gus');window.__mocha.walker(g.x+1,g.z+3.5,0,0);return{r}});
await p.waitForTimeout(800);const pr1=await E(()=>window.__mocha.town.pair('gus','hank'));pr0.r2=pr1;
const seq=[];for(let i=0;i<30;i++){const c=await E(()=>window.__mocha.town.chat());if(c)seq.push(c);await p.waitForTimeout(1000)}
const last=seq[seq.length-1]||{},said=last.said||[],alt=said.every((s,i)=>s===(i%2?'hank':'gus')),bubbles=[...new Set(seq.map(s=>s.bubble))];
ok(pr0.r2&&pr0.r2.cam<=45&&said.length>=4&&said.length<=6&&alt,'pair(gus,hank) within 3: 4-6 alternating bubbles, 3.5 s apart, within 45 of the camera',{r2:pr0.r2,said,bubbles:bubbles.slice(0,7)});
const over=await E(()=>window.__mocha.town.over());
ok(over.length>=1&&over[over.length-1].a==='gus'&&over[over.length-1].l.length>=4,'Overheard: the exchange logs to S.town.over within 8 of the walker (cap 8)',over[over.length-1]);
// salmon toss
const ts=await E(async()=>{const t=window.__mocha.town;t.at(15);const r=t.toss();await new Promise(r=>setTimeout(r,700));return{r,s:t.tossState()}});
ok(ts.r.ok&&ts.s&&ts.s.vis&&ts.s.y>ts.r.from[1],'toss(): Gus throws a salmon on a parabola',ts);
await E(()=>window.__mocha.town.at(null));
// WEEKLY
const wk=await E(()=>{const t=window.__mocha.town,mon=new Date(2026,10,2,12).getTime(),thu=new Date(2026,10,5,12).getTime(),sun=new Date(2026,10,8,12).getTime();
  const o=id=>({mon:t.weekly(id,mon,true),thu:t.weekly(id,thu,true),sun:t.weekly(id,sun,false)});return{hank:o('hank'),sol:o('sol'),all:Object.keys(t.WEEKLY).length}});
ok(wk.hank.mon.stage!==wk.hank.thu.stage&&wk.hank.mon.verts!==wk.hank.thu.verts&&wk.sol.mon.stage!==wk.sol.thu.stage&&wk.sol.mon.hash!==wk.sol.thu.hash&&wk.hank.sun.done,'WEEKLY: Monday and Thursday show different birdhouse and canvas stages (mesh + canvas), Sunday is done',{hank:[wk.hank.mon.text,wk.hank.thu.text,wk.hank.sun.text,wk.hank.mon.verts,wk.hank.thu.verts],sol:[wk.sol.mon.text,wk.sol.thu.text,wk.sol.mon.hash,wk.sol.thu.hash],goals:wk.all});
// catchUp is pure
const cu=await E(()=>{const M=window.__mocha,O=window.THREE.Object3D.prototype,add=O.add;let n=0;let all=0;O.add=function(...a){all++;if(/townTick|tSnap|tEnter|tGo|wkApply|tProps|tPlan|tWhere/.test(new Error().stack||''))n++;return add.apply(this,a)};const pos=M.town.npc('juniper');let k=0;try{k=M.catchUpSim(1)}catch(e){k='ERR '+e.message}O.add=add;const p2=M.town.npc('juniper');return{n,all,k:k&&k.n,same:pos.x===p2.x&&pos.z===p2.z}});
ok(cu.n===0&&cu.same,'catchUp (1 day) runs no B22 3D code and moves nobody (plans are pure; "all" counts B17 hangout props)',cu);
// LOD + draws at 15:00
await E(()=>window.__mocha.town.at(null));await p.waitForTimeout(1500);
const lod=await E(async()=>{const a=[];for(let i=0;i<8;i++){await new Promise(r=>requestAnimationFrame(r));a.push(window.__mocha.gfx().calls)}return{lod:window.__mocha.lod(),calls:a,st:['juniper','gus','tabitha','clem','jot'].map(id=>id+': '+window.__mocha.town.npc(id).status)}});
ok(lod.lod.n0<=8,'<= 8 characters at LOD0',{n0:lod.lod.n0,n1:lod.lod.n1,hidden:lod.lod.hidden,shadows:lod.lod.shadows});
console.log('INFO draws portrait 15:00 default view',JSON.stringify(lod.calls),'status',JSON.stringify(lod.st));
await p.screenshot({path:SH+'portrait-15.png'});
// screenshot: a 20:00 pal visit up close
await E(()=>{const t=window.__mocha.town;t.at(20);const V=t.palVisits().find(v=>v.h0<=20&&v.h1>20);const A=t.npc(V.a);window.__mocha.castView({x:A.x+1.1,z:A.z,ty:.9,dist:7,pitch:.35,yaw:.3})});await p.waitForTimeout(2500);await p.screenshot({path:SH+'visit-portrait.png'});
await E(()=>{window.__mocha.castView(null);window.__mocha.town.at(null);window.__mocha.castView({x:82,z:30.5,ty:1,dist:5,pitch:.35,yaw:.5})});await p.waitForTimeout(2500);await p.screenshot({path:SH+'birdhouse-portrait.png'});
await E(()=>window.__mocha.castView(null));
ok(errs.length===0,'portrait: no page errors',errs.slice(0,5));
// reload: weekly stages are identical across reloads
const wk2=await E(()=>{const t=window.__mocha.town,mon=new Date(2026,10,2,12).getTime(),thu=new Date(2026,10,5,12).getTime();return{hm:t.weekly('hank',mon,true),ht:t.weekly('hank',thu,true),sm:t.weekly('sol',mon,true),st:t.weekly('sol',thu,true)}});
await ctx.close();({ctx,p,errs,E}=await open({width:1100,height:820},false,15));
const wk3=await E(()=>{const t=window.__mocha.town,mon=new Date(2026,10,2,12).getTime(),thu=new Date(2026,10,5,12).getTime();return{hm:t.weekly('hank',mon,true),ht:t.weekly('hank',thu,true),sm:t.weekly('sol',mon,true),st:t.weekly('sol',thu,true)}});
ok(['hm','ht','sm','st'].every(k=>wk2[k].stage===wk3[k].stage&&wk2[k].sig===wk3[k].sig&&wk2[k].verts===wk3[k].verts),'WEEKLY stages identical across reloads',{a:[wk2.hm.verts,wk2.ht.verts,wk2.sm.sig,wk2.st.sig],b:[wk3.hm.verts,wk3.ht.verts,wk3.sm.sig,wk3.st.sig]});
await E(()=>{const t=window.__mocha.town;t.at(5.9);window.__mocha.castView({x:-30,z:6.5,ty:1,dist:8,pitch:.3,yaw:2.9})});await p.waitForTimeout(2500);await p.screenshot({path:SH+'cafe-door-desktop.png'});
await E(()=>window.__mocha.castView(null));
ok(errs.length===0,'desktop: no page errors',errs.slice(0,5));
await ctx.close();await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

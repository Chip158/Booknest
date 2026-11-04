// B39 The Fogwell condo. Usage: node /tmp/harness/test-B39.js [viewport=portrait|landscape|desktop] [shots=1]
// Drives everything through window.__mocha hooks (fogwell.floor/ride/units/state, inside.enter/exit, rent).
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const VP={portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],desktop:[{width:1100,height:820},false],duo:[{width:900,height:1000},true]};
const vpn=process.argv[2]||'portrait',shots=process.argv[3]!=='0';
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,400):''));if(!c)fails++};
async function page(b,h){const [vp,mob]=VP[vpn];const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h,10,1));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(6000);return {p,ctx,errs}}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  {const {p,ctx,errs}=await page(b,15);
    await p.evaluate(()=>{const m=window.__mocha;m.walker&&m.walker(30,-50)});await p.waitForTimeout(2500);
    // warm-up cycle (shared atlas, unit geometries, catalog templates, the walk camera at the doorstep), then the baseline
    await p.evaluate(()=>{const m=window.__mocha;m.inside.enter('fogwell',{fade:false});m.inside.tick(10,.05);m.fogwell.floor(2);m.inside.tick(4,.05);m.inside.exit({fade:false});m.inside.tick(10,.05)});await p.waitForTimeout(5000);const g0=await p.evaluate(()=>window.__mocha.fogwell.geos());
    // 1. enter: the lobby with Ambrose, the floors slot appears
    let r=await p.evaluate(()=>{const m=window.__mocha;m.inside.enter('fogwell',{fade:false});m.inside.tick(30,.05);return{ins:{on:m.inside().on,pid:m.inside().pid,leaks:m.inside().leaks},fw:m.fogwell.state()}});
    ok(r.ins.on&&r.ins.pid==='fogwell','enter the Fogwell (LF1 interior)',r.ins);ok(r.fw.cur==='L'&&r.fw.vis.L,'the lobby is the shown floor',r.fw.vis);
    ok(r.fw.ambrose&&r.fw.ambrose.place==='fogwell'&&r.fw.ambrose.seen,'Ambrose is at his desk in the lobby and drawn',r.fw.ambrose);ok(r.fw.kinds.includes('desk'),"Ambrose's walnut desk",r.fw.kinds);
    ok(r.fw.ui&&r.fw.ui.slot&&r.fw.ui.on,'HUD slot floors is on',r.fw.ui);ok(r.fw.cam==='floor','CAM top is floor',r.fw.cam);ok(!r.ins.leaks.length,'no LF1 leaks in the lobby',r.ins.leaks);
    await p.waitForTimeout(1500);if(shots)await p.screenshot({path:`/tmp/harness/out/b39-${vpn}-lobby.png`});
    // the picker is clean: 44 px buttons, inside the viewport, no overlap with other HUD slots
    r=await p.evaluate(()=>{const el=document.querySelector('.fwFl');const R=el.getBoundingClientRect();const bs=[...el.querySelectorAll('button')].filter(b=>b.offsetParent).map(b=>{const q=b.getBoundingClientRect();return[q.width,q.height]});
      const others=[...document.querySelectorAll('.hudS')].filter(e=>e!==el&&e.offsetParent&&getComputedStyle(e).display!=='none').map(e=>{const q=e.getBoundingClientRect();return{id:e.id||e.className,q:[q.left,q.top,q.right,q.bottom]}}).filter(o=>o.q[2]>o.q[0]);
      const hit=others.filter(o=>o.q[0]<R.right&&o.q[2]>R.left&&o.q[1]<R.bottom&&o.q[3]>R.top);return{r:[R.left,R.top,R.right,R.bottom].map(Math.round),W:innerWidth,H:innerHeight,bs,hit}});
    ok(r.r[0]>=0&&r.r[2]<=r.W&&r.r[1]>=0&&r.r[3]<=r.H,'picker inside the viewport',r);ok(r.bs.every(q=>q[0]>=44&&q[1]>=44),'picker buttons are 44 px',r.bs);ok(!r.hit.length,'picker overlaps no HUD slot',r.hit);
    // 2. floor 3: the hallway; 4, 5 and R hidden; 3A built on demand with the coffin bed
    r=await p.evaluate(()=>{const m=window.__mocha;const s=m.fogwell.floor(3);m.inside.tick(10,.05);return s});
    ok(r.cur==='3'&&r.vis['3']&&!r.vis['4']&&!r.vis['5']&&!r.vis.R&&!r.vis.L,'floor 3 shown; L, 4, 5 and R hidden',r.vis);
    const u3=(r.units||[]).find(u=>u.unit==='3A');ok(u3&&u3.heroes.includes('coffin')&&r.kinds.includes('coffin'),'unit 3A generated with the coffin bed',u3);
    ok((r.units||[]).every(u=>u.items.length>=3),'each unit placed by autoArrange from the catalog',(r.units||[]).map(u=>[u.unit,u.items.length,u.left]));
    await p.waitForTimeout(1500);const d3=await p.evaluate(()=>{const m=window.__mocha;return{fw:m.fogwell.state().draws,all:m.drawInfo?m.drawInfo().calls:null,inside:m.inside().leaks}});
    const g3=await p.evaluate(()=>window.__mocha.fogwell.geos());ok(d3.fw<=20,'the selected floor is 20 draws or fewer (fogwell meshes)',d3);if(shots)await p.screenshot({path:`/tmp/harness/out/b39-${vpn}-f3.png`});
    // 3. the elevator: ding, the dial moves, the floor changes
    r=await p.evaluate(()=>{const m=window.__mocha;const d0=m.fogwell.state().dial;const a=m.fogwell.ride(5);const mid=m.fogwell.tick(20,.1).dial;const s=m.fogwell.tick(40,.1);return{a:a.ok,d0,mid,s}});
    ok(r.a,'ride accepted');ok(r.mid>r.d0&&r.mid<5,'the dial needle moves during the ride',[r.d0,r.mid,r.s.dial]);ok(r.s.cur==='5'&&r.s.you==='5','the floor changes to 5',r.s.cur);
    ok(r.s.ev.some(e=>e[0]==='ding'),'a ding at arrival',r.s.ev);
    // stairs and the roof
    r=await p.evaluate(()=>{const m=window.__mocha;const s=m.fogwell.floor('R');return{cur:s.cur,kinds:s.kinds,seats:m.fogwell.state().cur}});ok(r.cur==='R'&&r.kinds.includes('grill'),'rooftop terrace with the grill',r);
    if(shots){await p.waitForTimeout(1200);await p.screenshot({path:`/tmp/harness/out/b39-${vpn}-roof.png`})}
    r=await p.evaluate(()=>{const m=window.__mocha;const n=m.fogwell.nav(),rt=m.fogwell.route('L:door','3A');return{n,rt}});ok(r.n.elevator===5&&r.n.stair===5&&r.rt&&r.rt.steps.some(s=>s.via==='ELEVATOR'),'NAV: per-floor subgraphs with ELEVATOR and STAIR edges',r);
    // 4. exit: units disposed, geometry count back to baseline +-5%
    r=await p.evaluate(()=>new Promise(res=>{const m=window.__mocha;m.fogwell.floor(3);m.inside.exit({fade:false});m.inside.tick(20,.05);setTimeout(()=>res({g:m.fogwell.geos(),fw:m.fogwell.state(),on:m.inside().on}),5000)}));
    ok(!r.on&&!r.fw.on&&!r.fw.cur,'leaving drops the floor',r.fw.cur);ok(Math.abs(r.g-g0)<=Math.max(2,g0*.05),'geometries back to baseline +-5%',[g0,g3,r.g]);
    // 5. presence (plan-derived) and rent
    r=await p.evaluate(()=>{const m=window.__mocha;const U=h=>Object.fromEntries(m.fogwell.units(h).map(u=>[u.unit,u]));const a=U(23),b=U(19.5),c=U(20.5);return{v23:a['3A'],b23:a['2A'],b195:b['2A'],b205:c['2A'],rent0:m.rent('2A'),rent:(()=>{const S=m.S||null;return m.rent('5C')})()}});
    ok(r.v23.lit&&r.v23.win&&r.v23.win.col==='#C0485A'&&!r.b23.lit,"23:00: Vesper's window lit red, 2A (Basil) dark",[r.v23,r.b23]);
    ok(r.b205.home,'Basil is home after work (records closes 20:00 per B22; 19:30 = '+r.b195.doing+')',[r.b195.doing,r.b205]);
    ok(!r.rent0.ok,'2A cannot be rented (Basil lives there)',r.rent0);console.log('rent 5C ->',JSON.stringify(r.rent));
    ok(!errs.length,'no page errors',errs);await ctx.close()}
  // 6. a real 23:00 load: the B16 window table shows Vesper red, 2A dark
  if(vpn==='portrait'){const {p,ctx,errs}=await page(b,23);const r=await p.evaluate(()=>new Promise(res=>setTimeout(()=>{const m=window.__mocha;res({v:m.fogwell.win('3A'),b:m.fogwell.win('2A')})},1500)));
    ok(r.v&&r.v.tl>0&&r.v.tc&&r.v.tc[0]>r.v.tc[2],'23:00 (WLT): 3A lit red',r.v);ok(r.b&&r.b.tl===0,'23:00 (WLT): 2A dark',r.b);ok(!errs.length,'no page errors at 23:00',errs);await ctx.close()}
  await b.close();console.log(fails?`B39 ${vpn}: ${fails} FAIL`:`B39 ${vpn}: ALL PASS`);process.exit(fails?1:0)})();

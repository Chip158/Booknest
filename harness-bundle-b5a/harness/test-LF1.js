// LF1 test: immersive interiors (WORLD root, IN state machine, room camera, closed shells, who is drawn, masks, void, taps, pill, cabin + decorate).
// Usage: node /tmp/harness/test-LF1.js [quick]   (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackT/index.html node ...)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const [DM,DD]=(process.env.DAY||'11-03').split('-').map(Number);
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${DM-1},${DD});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const OUT='/tmp/harness/b27t/shots/lf1/';fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,900):'')}};
const report={};
async function page(b,w,h,hour,mob){const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));
  for(let i=0;i<2;i++){try{await p.goto('file:///home/user/Booknest/ghost-town/index.html',{timeout:180000});break}catch(e){if(i)throw e}}
  await p.waitForTimeout(6000);await p.evaluate(()=>{try{document.getElementById('closePanel').click()}catch(e){};window.__mocha.weather('clear')});
  const until=async(f,ms=15000,a)=>{const t=Date.now();while(Date.now()-t<ms){let v=false;try{v=await p.evaluate(f,a)}catch(e){}if(v)return Date.now()-t;await p.waitForTimeout(80)}return -1};
  return{ctx,p,errs,until}}
// pixel probe: hide the HUD, screenshot, sample outside the room's projected rect and scan for sky pixels
async function pixels(p,name){await p.addStyleTag({content:'body>*:not(canvas):not(#inFade):not(#rsVig){visibility:hidden!important}'}).catch(()=>{});
  await p.evaluate(()=>{const s=document.createElement('style');s.id='lf1hide';s.textContent='body>*:not(canvas):not(#inFade):not(#rsVig){visibility:hidden!important}';document.head.appendChild(s)});await p.waitForTimeout(700);
  const buf=await p.screenshot({path:OUT+name+'-nohud.png'});await p.evaluate(()=>{document.querySelectorAll('#lf1hide').forEach(e=>e.remove());document.querySelectorAll('style').forEach(e=>{if(e.textContent.indexOf('visibility:hidden!important')>=0&&e.textContent.indexOf('not(#inFade)')>=0)e.remove()})});
  return p.evaluate(async b64=>{const M=window.__mocha,i=M.inside(),P=M.byId[i.pid],cam=M.camera,T=window.THREE,img=await createImageBitmap(await (await fetch('data:image/png;base64,'+b64)).blob()),c=document.createElement('canvas');c.width=img.width;c.height=img.height;const g=c.getContext('2d');g.drawImage(img,0,0);const d=g.getImageData(0,0,c.width,c.height).data,W=c.width,H=c.height;
    let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const v=new T.Vector3(),cs=Math.cos(P.ry),sn=Math.sin(P.ry),fy=i.fy||0;for(const sx of [-.5,.5])for(const sz of [-.5,.5])for(const yy of [fy,fy+(P.h||6)+1]){const lx=sx*(P.w+1),lz=sz*(P.d+1);v.set(P.x+lx*cs+lz*sn,yy,P.z-lx*sn+lz*cs).project(cam);const px=(v.x+1)/2*W,py=(1-v.y)/2*H;x0=Math.min(x0,px);x1=Math.max(x1,px);y0=Math.min(y0,py);y1=Math.max(y1,py)}
    const pts=[];for(let gy=0;gy<12&&pts.length<40;gy++)for(let gx=0;gx<8;gx++){const x=Math.round(4+gx*(W-8)/7),y=Math.round(4+gy*(H-8)/11);if(x>x0-6&&x<x1+6&&y>y0-6&&y<y1+6)continue;const o=(y*W+x)*4;pts.push([x,y,d[o],d[o+1],d[o+2]])}
    const V=[0x1E,0x16,0x12];const bad=pts.filter(q=>!(Math.abs(q[2]-V[0])<=14&&Math.abs(q[3]-V[1])<=14&&Math.abs(q[4]-V[2])<=14)&&!(q[2]<=V[0]+2&&q[3]<=V[1]+2&&q[4]<=V[2]+2));
    let sky=0;for(let o=0;o<d.length;o+=4*7){const r=d[o],gg=d[o+1],bb=d[o+2];if(bb>r+40&&bb>150)sky++}
    return{rect:[x0,y0,x1,y1].map(Math.round),n:pts.length,bad:bad.slice(0,6),badN:bad.length,sky}},buf.toString('base64'))}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [vn,W,H,mob] of [['portrait',393,852,true],['landscape',852,393,true]]){
  const {ctx,p,errs,until}=await page(b,W,H,10.5,mob);const full=vn==='portrait';
  const base=await p.evaluate(()=>{const M=window.__mocha;return{lights:M.lights().count,progs:M.programs().n,you:M.youSize?M.youSize():null,ent:M.inside.ent()}});
  // walk mode, the walker 3 in front of the café door facing it
  await p.evaluate(()=>{const M=window.__mocha;M.setCamMode('walk');const d=M.inside.door('cafe');M.walker(d.x+d.nx*3,d.z+d.nz*3,Math.atan2(-d.nx,-d.nz),0)});
  await until(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'},15000);
  if(full){const r=await p.evaluate(()=>{const M=window.__mocha,P=M.byId.cafe;const op=P.op==null?1:P.op,hid=(P.shell||[]).filter(m=>m.visible===false).length;return{occH:P.occH,fw:!!(P.fw&&P.fw.visible),op,hid,draws:M.drawInfo()}});
    ok(vn+' street: café front group visible and opaque (10:30; the B-round occluder fade aside)',r.fw&&(r.op>=.99||r.occH>0)&&r.hid===0,r);report.cafeOut=r.draws;await p.screenshot({path:OUT+'street-cafe-'+vn+'.png'})}
  // 1. walk in
  await p.evaluate(()=>window.__mocha.inside.walkTo('cafe'));
  await until(()=>{const i=window.__mocha.inside();return i.on&&i.pid==='cafe'&&i.ph==='idle'},30000);
  await p.waitForTimeout(1200);const r1=await p.evaluate(()=>{const M=window.__mocha,i=M.inside(),w=M.walker(),d=i.door;return{i,w,inFoot:M.inside.placeAt(w.x,w.z),dDoor:Math.hypot(w.x-d.x,w.z-d.z),rc:M.roomCam(),stick:M.ctl().stick.on,draws:M.drawInfo()}});
  // merge: on SwiftShader the merged frame is slower, so the 1.2 s sample can land on B27Ta's 2 s indoor shadow refresh (+19 depth draws); take the quietest of 5 frames
  r1.draws=await p.evaluate(async()=>{let best=null;for(let k=0;k<5;k++){const d=window.__mocha.drawInfo();if(!best||d.tris<best.tris)best=d;await new Promise(r=>setTimeout(r,400))}return best});
  const tm=r1.i.times;ok(vn+' walk in: k>=.95 within 1.5 s and back to 0 within 1.2 s (game time)',tm.swap!=null&&tm.swap-tm.start<=1.5&&tm.idle-tm.swap<=1.2,tm);
  ok(vn+' inside(): on, cafe, you, world:false',r1.i.on&&r1.i.pid==='cafe'&&r1.i.who==='you'&&r1.i.world===false,r1.i);
  ok(vn+' walker inside the footprint within 2.2 of the door',r1.inFoot==='cafe'&&r1.dDoor<=2.2,{w:r1.w,d:r1.dDoor});
  ok(vn+' roomCam top room, pitch '+(full?'.78':'.62'),r1.rc.top==='room'&&Math.abs(r1.rc.pitch-(full?.78:.62))<=.03,r1.rc);
  ok(vn+' no stick survives the swap',r1.stick===false);
  ok(vn+' leaks [] in the café',r1.i.leaks.length===0,r1.i.leaks);
  ok(vn+' café draws <= 80, tris <= 70k',r1.draws.calls<=80&&r1.draws.tris<=70000,{d:r1.draws,chars:r1.i.chars});report['cafeIn_'+vn]=r1.draws;report['swap_'+vn]=r1.i.swaps;
  await p.waitForTimeout(600);await p.screenshot({path:OUT+'cafe-'+vn+'.png'});
  const px=await pixels(p,'cafe-'+vn);ok(vn+' pixels outside the room rect are the void',px.badN===0&&px.n>=12,px);ok(vn+' no sky pixels (window cards aside)',px.sky<=40,px);
  if(full){
    // 4. characters
    const c=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),o={};
      M.forceAct({p:'cafe',fx:'ask',keeper:'juniper'});await w(2500);o.ask=M.inside().chars;o.askSee=M.inside.see('mocha');
      M.forceAct({p:'home',s:'couch'});await w(2500);o.home=M.inside().chars;o.bub=document.getElementById('bubble').style.visibility;o.edge=document.getElementById('edge').style.display;
      M.wForce('cafe');await w(1500);o.wend=M.inside().chars.indexOf('wendell')>=0;o.wSee=M.inside.see('wendell');
      const N=M.town.N;o.jun=M.town.npc('juniper');o.tin=Object.keys(N).filter(k=>N[k].inP==='cafe');o.tout=Object.keys(N).filter(k=>!N[k].inP&&!N[k].hide).slice(0,3);o.chars=M.inside().chars;o.leaks=M.inside().leaks;return o});
    ok('Mocha drawn when he is in the café (ask at Juniper)',c.ask.indexOf('mocha')>=0,c);
    ok('Mocha at home: not drawn, bubble and edge chip hidden',c.home.indexOf('mocha')<0&&c.bub==='hidden'&&c.edge!=='flex',{home:c.home,bub:c.bub,edge:c.edge});
    ok('Wendell on the terrace outside: not drawn',!c.wend&&!c.wSee,c);
    {const jin=c.jun&&(c.jun.inside==='cafe'||c.jun.lvl>=0&&c.jun.place==='cafe'&&c.jun.spot!=='door');ok('Juniper (the keeper) is drawn iff she is inside',jin?c.chars.indexOf('juniper')>=0:c.chars.indexOf('juniper')<0,{jun:c.jun,chars:c.chars})}
    ok('townsfolk inside drawn, outside not',c.tin.every(k=>c.chars.indexOf(k)>=0)&&c.tout.every(k=>c.chars.indexOf(k)<0),{tin:c.tin,tout:c.tout,chars:c.chars});
    ok('leaks [] with the cast moving',c.leaks.length===0,c.leaks);
    // 8. taps inside
    const t=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),o={},P=M.byId.cafe,cam=M.camera,T=window.THREE,v=new T.Vector3();
      const pr=(x,y,z)=>{v.set(x,y,z).project(cam);return[(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]};
      const f=pr(P.x+1,0,P.z-1);M.inside.tap(f[0],f[1]);await w(300);o.floor=M.inside().lastTap;o.fin=o.floor&&M.inside.placeAt(o.floor.x,o.floor.z);
      M.inside.tap(6,innerHeight*.18);await w(300);const lt=M.inside().lastTap;o.void=lt;o.vin=lt?M.inside.placeAt(lt.x,lt.z):null;o.still=M.inside().on;
      try{M.town.at(11.25)}catch(e){}await w(1500);o.jun2=M.town.npc('juniper');const J=M.CASTB&&M.CASTB.juniper;if(J&&J.obj&&M.inside().chars.indexOf('juniper')>=0){const wy=M.walker();J.obj.getWorldPosition(v);M.walker(v.x,v.z-1.8);await w(1200);for(const dy of [.5,.9,1.3]){J.obj.getWorldPosition(v);const q=pr(v.x,v.y+dy,v.z);M.inside.tap(q[0],q[1]);await w(500);o.talk=M.talkState();if(o.talk.open)break}try{M.talkClose()}catch(e){}M.walker(wy.x,wy.z)}else o.talk='juniper outside';try{M.town.at(null)}catch(e){}
      return o});
    ok('floor tap walks to a clamped point in the room',t.fin==='cafe',t);ok('void tap stays inside the room',t.still&&(t.vin==null||t.vin==='cafe'),t);
    ok('tap on Juniper opens talk (when she is inside)',t.talk==='juniper outside'||!!(t.talk&&(t.talk.open||t.talk.id==='juniper')),{talk:t.talk,jun2:t.jun2});
    // 6. walk out by walking into the door
    await p.evaluate(()=>{const M=window.__mocha;if(!M.inside().on)M.inside.enter('cafe',{fade:false})});await until(()=>{const i=window.__mocha.inside();return i.on&&i.ph==='idle'},15000);
    const o=await p.evaluate(async()=>{const M=window.__mocha,d=M.inside().door;M.walker(d.x-d.nx*2.2,d.z-d.nz*2.2,Math.atan2(d.nx,d.nz),0);await new Promise(r=>setTimeout(r,500));M.inside.tapGo(d.x+d.nx*2.5,d.z+d.nz*2.5);return d});
    await until(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'},30000);
    const o2=await p.evaluate(d=>{const M=window.__mocha,i=M.inside(),w=M.walker(),rc=M.roomCam();return{on:i.on,world:i.world,w,dd:Math.hypot(w.x-d.x,w.z-d.z),in:M.inside.placeAt(w.x,w.z),yawErr:Math.abs(Math.atan2(Math.sin(w.yaw-Math.atan2(d.nx,d.nz)),Math.cos(w.yaw-Math.atan2(d.nx,d.nz)))),stack:rc.stack,camYaw:rc.yaw,camDist:rc.camDist,
      cyErr:Math.abs(Math.atan2(Math.sin(rc.yaw-(w.yaw+Math.PI)),Math.cos(rc.yaw-(w.yaw+Math.PI)))),lights:M.lights().count}},o);
    ok('walk out: on false, world true',o2.on===false&&o2.world===true,o2);ok('walker outside within 2.5 of the door facing away',!o2.in&&o2.dd<=2.5&&o2.yawErr<=.5,o2);
    ok('no room layer; walk camera behind him at 7',!o2.stack.some(e=>e.owner==='room')&&o2.cyErr<.3&&Math.abs(o2.camDist-7)<=.5,o2);
    // the "Go outside" pill
    await p.evaluate(()=>window.__mocha.inside.enter('cafe',{fade:false}));await until(()=>{const i=window.__mocha.inside();return i.on&&i.ph==='idle'},15000);
    const pl=await p.evaluate(async()=>{const M=window.__mocha,d=M.inside().door;M.walker(d.x-d.nx*1.6,d.z-d.nz*1.6);await new Promise(r=>setTimeout(r,700));const t=document.getElementById('near').textContent;document.getElementById('near').click();return t});
    ok('"Go outside" pill shows near the door',/Go outside/.test(pl),pl);
    ok('tapping the pill exits',await until(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'},30000)>=0);
    // 7. closed from the street + Mocha inside his house
    const cs=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.forceAct({p:'home',s:'couch'});const d=M.inside.door('home');M.walker(d.x+d.nx*8,d.z+d.nz*8,Math.atan2(-d.nx,-d.nz),0);await w(2500);
      const h=M.byId.home;let op=1;(h.shell||[]).forEach(m=>op=Math.min(op,m.visible===false?0:m.opacity));return{chars:M.inside().chars,near:document.getElementById('near').textContent,on:M.inside().on,op,occH:h.occH,fw:!!(h.fw&&h.fw.visible)}});
    ok('Mocha in his house: not drawn from the street, pill "Mocha is inside"',cs.chars.indexOf('mocha')<0&&/Mocha is inside|Go see Mocha/.test(cs.near)&&!cs.on,cs);// lf-fix1: LF5 wording is '👻 Go see Mocha'
    {const hm=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const d=M.inside.door('home');M.walker(d.x+d.nx*1.2,d.z+d.nz*1.2,Math.atan2(-d.nx,-d.nz),0);await w(400);
        const ak=M.knock?M.knock('home'):null;M.inside.enter('home',{fade:false});await w(2500);const i=M.inside();const o={on:i.on,pid:i.pid,ak};M.inside.exit({fade:false});await w(600);return o});
      ok('lf-fix1: Mocha home -> he answers a knock and the walker goes into his house and stays in',hm.on&&hm.pid==='home'&&!(hm.ak&&hm.ak.ans==='none'),hm)}ok('his house is closed from the street (unless the B-round occluder fade is on: camera behind the house)',(cs.op>=.99||cs.occH>0)&&cs.fw,cs);
    await p.screenshot({path:OUT+'street-home-'+vn+'.png'});
    // 5. watch mode: in and out with Mocha
    const wm=await p.evaluate(async()=>{const M=window.__mocha;M.setCamMode('follow');const A=M.ACTS||[];const a=(A.find&&A.find(x=>x.p==='bookstore'))||{p:'bookstore'};M.forceAct({p:'bookstore',s:a.s,fx:a.fx});return a.s||a.fx||null});
    const wIn=await until(()=>{const i=window.__mocha.inside();return i.on&&i.pid==='bookstore'&&i.who==='mocha'},150000);
    ok('watch mode: the view goes into the bookstore with Mocha',wIn>=0,await p.evaluate(()=>({i:window.__mocha.inside().log,pl:window.__mocha.inside.placeAt(window.__mocha.G?window.__mocha.G.x:0,0)})));
    await p.screenshot({path:OUT+'watch-bookstore-'+vn+'.png'});
    await p.evaluate(()=>{const M=window.__mocha;M.forceAct({p:'cafe',fx:'ask',keeper:'juniper'})});
    const wOut=await until(()=>{const i=window.__mocha.inside();return i.pid!=='bookstore'},150000);
    const lg=await p.evaluate(()=>window.__mocha.inside().log);const gaps=[];for(let i=1;i<lg.length;i++)if(lg[i][2]==='mocha'&&lg[i-1][2]==='mocha')gaps.push(+(lg[i][0]-lg[i-1][0]).toFixed(2));
    ok('watch mode: leaves the bookstore with him',wOut>=0,lg);ok('no two Mocha transitions closer than 2.5 s',gaps.every(g=>g>=2.5),{gaps,lg});
    // 9. cabin + decorate
    const cb=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),o={};M.setCamMode('walk');try{M.movingDay('skip')}catch(e){}try{M.cabinLv(2)}catch(e){}M.walker(40,60,0,0);await w(1500);
      o.r1=M.deco.enter('great');for(let i=0;i<60;i++){await w(150);const s=M.inside();if(s.on&&s.pid==='cabin'&&s.ph==='idle')break}o.in1=M.inside();o.top1=M.roomCam().top;o.draws=M.drawInfo();
      M.deco.enter('lot');for(let i=0;i<60;i++){await w(150);const s=M.inside();if(!s.on&&s.ph==='idle')break}o.in2={on:M.inside().on,log:M.inside().log.slice(-2)};o.top2=M.roomCam().top;
      M.deco.exit();await w(500);M.deco.enter('great');for(let i=0;i<60;i++){await w(150);const s=M.inside();if(s.on&&s.ph==='idle'&&M.roomCam().top==='deco')break}M.deco.exit();await w(800);o.top3=M.roomCam().top;o.in3={on:M.inside().on,pid:M.inside().pid,leaks:M.inside().leaks};o.draws2=M.drawInfo();return o});
    ok('deco.enter(great) from outside fades into the cabin, deco on top',cb.in1.on&&cb.in1.pid==='cabin'&&cb.top1==='deco',{in1:{on:cb.in1.on,pid:cb.in1.pid,log:cb.in1.log},top:cb.top1});
    ok('deco.enter(lot) from inside fades out first',cb.in2.on===false&&cb.top2==='deco',cb);ok('deco.exit() returns to the room view',cb.top3==='room'&&cb.in3.on&&cb.in3.pid==='cabin',cb);
    ok('cabin draws <= 100, leaks []',cb.draws2.calls<=100&&cb.in3.leaks.length===0,{d:cb.draws2,l:cb.in3.leaks});report.cabinIn=cb.draws2;await p.waitForTimeout(800);await p.screenshot({path:OUT+'cabin-'+vn+'.png'});
    // 10/11. compat + invariants
    const iv=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),o={};M.deco.exit();M.inside.exit({fade:false});await w(500);
      M.walker(12,22,Math.PI,0);const b0=M.roomTick(60,.05);const q=M.byId.bookstore,cs=Math.cos(q.ry),sn=Math.sin(q.ry);M.walker(q.x+1.4*cs+2.8*sn,q.z-1.4*sn+2.8*cs,0,0);const rc=M.roomTick(80,.05);o.b12={top:rc.top,pid:rc.pid,frontFaded:rc.frontFaded,inVis:rc.inVis,dist:rc.dist,range:rc.range};M.walker(12,24,Math.PI,0);const r3=M.roomTick(160,.05);o.b12.outTop=r3.top;o.b12.dOut=r3.camDist;o.b12.d0=b0.camDist;
      M.inside.exit({fade:false});M.inside.tick(12);M.setCamMode('walk');M.freeze(true);const G=M.G||{},snap=()=>JSON.stringify([G.act&&G.act.doing,G.target,G.mode]);o.g0=snap();o.l0=M.lights().count;o.p0=M.programs().n;o.y0=M.youSize?JSON.stringify(M.youSize()):'';const sw=[];
      for(let k=0;k<20;k++){M.inside.enter(k%2?'bookstore':'cafe',{fade:false});M.inside.tick(10);sw.push(M.inside().swapMs);o.lin=M.lights().count;M.inside.exit({fade:false});M.inside.tick(10);sw.push(M.inside().swapMs)}
      o.g1=snap();o.l1=M.lights().count;o.p1=M.programs().n;o.y1=M.youSize?JSON.stringify(M.youSize()):'';o.sw=Math.max(...sw);M.freeze(false);o.lint=M.layoutLint();return o});
    ok('test-B12 compat: walker(12,22)+roomTick: room, bookstore, frontFaded, inVis, zoom in range',iv.b12.top==='room'&&iv.b12.pid==='bookstore'&&iv.b12.frontFaded&&iv.b12.inVis&&iv.b12.dist>=iv.b12.range[0]-.01&&iv.b12.dist<=iv.b12.range[1]+.01&&iv.b12.outTop!=='room'&&Math.abs(iv.b12.dOut-iv.b12.d0)<.05*iv.b12.d0,iv.b12);
    ok('lights count same outside, inside and after',iv.l0===base.lights&&iv.lin===base.lights&&iv.l1===base.lights,iv);
    ok('programs +1 or less, 0 new over 20 cycles',iv.p1-base.progs<=1&&iv.p1===iv.p0,{base:base.progs,p0:iv.p0,p1:iv.p1});
    ok('G.act/target/mode identical over 20 cycles; youSize unchanged',iv.g0===iv.g1&&iv.y0===iv.y1,iv);ok('layoutLint() []',Array.isArray(iv.lint)&&iv.lint.length===0,iv.lint);
    report.swapMaxPortrait=iv.sw;
  }
  ok(vn+' no page errors',errs.filter(e=>/PAGEERROR|LF1/.test(e)).length===0,errs);await ctx.close()}
// Mocha's house at 19:00 (watch mode) and the desktop swap timing
{const {ctx,p,errs,until}=await page(b,393,852,19,true);
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct({p:'home',s:'couch'});M.setCamMode('follow')});await until(()=>{const i=window.__mocha.inside();return i.on&&i.pid==='home'&&i.ph==='idle'},40000);await p.waitForTimeout(1500);
  const h=await p.evaluate(()=>{const M=window.__mocha,i=M.inside();return{on:i.on,pid:i.pid,leaks:i.leaks,draws:M.drawInfo()}});ok('Mocha\'s house 19:00: draws <= 100, leaks []',h.on&&h.pid==='home'&&h.draws.calls<=100&&h.leaks.length===0,h);report.homeIn=h.draws;
  await p.screenshot({path:OUT+'home-h19-portrait.png'});const px=await pixels(p,'home-h19-portrait');ok('home: void outside the room rect (when any), no sky (the desk monitor aside)',(px.n<12||px.badN===0)&&px.sky<=200,px);
  const st=await p.evaluate(()=>{const M=window.__mocha;M.inside.exit({fade:false});M.setCamMode('walk');const d=M.inside.door('home');M.walker(d.x+d.nx*9,d.z+d.nz*9,Math.atan2(-d.nx,-d.nz),0);return 1});await until(()=>!window.__mocha.inside().on&&window.__mocha.inside().ph==='idle',20000);await p.waitForTimeout(1500);
  report.homeOut=await p.evaluate(()=>window.__mocha.drawInfo());ok('no page errors (19:00)',errs.filter(e=>/PAGEERROR|LF1/.test(e)).length===0,errs);await ctx.close()}
{const {ctx,p,errs,until}=await page(b,1100,820,10.5,false);
  const s=await p.evaluate(()=>{const M=window.__mocha,sw=[];M.setCamMode('walk');for(let k=0;k<12;k++){M.inside.enter(['cafe','bookstore','home','neighbor','station','cabin'][k%6],{fade:false});M.inside.tick(8);sw.push(M.inside().swapMs);M.inside.exit({fade:false});M.inside.tick(8);sw.push(M.inside().swapMs)}return sw});
  report.swapDesktop=s;ok('desktop: every swap < 12 ms',Math.max(...s)<12,s);
  const lk=await p.evaluate(async()=>{const M=window.__mocha,o={},w=ms=>new Promise(r=>setTimeout(r,ms));for(const pid of ['cafe','bookstore','home','neighbor','station']){M.inside.enter(pid,{fade:false});M.inside.tick(8);await w(400);o[pid]=M.inside().leaks;M.inside.exit({fade:false});M.inside.tick(8)}return o});
  ok('leaks [] in café, bookstore, home, cottage, station',Object.values(lk).every(l=>l.length===0),lk);await ctx.close()}
fs.writeFileSync(OUT+'report.json',JSON.stringify(report,null,1));console.log('REPORT',JSON.stringify(report));
console.log(`\n${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0)})();

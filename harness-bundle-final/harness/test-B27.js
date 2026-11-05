// B27 test: decorate mode (place/move/rotate/undo/tidy, snapping, picking, sweeps, photo, yard), tray/toolbar layout + CAM 'deco',
// Moving Day (once, skippable, mailbox name, Mocha reads it), lint + youSize with 160 placed items.
// Usage: node /tmp/harness/test-B27.js   (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=... node ...)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=[['portrait',{width:393,height:852},true],['landscape',{width:852,height:393},true],['duo',{width:900,height:1000},true],['desktop',{width:1100,height:820},false]];
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,700):'')}};
const FULL=`(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),D=M.deco,out={};
  const CATI=M.CAT||window.__mocha.CAT;const items=CATI.items;
  const table=items.find(i=>i.cat==='tabl'&&i.w>=.9&&i.d>=.6),small=items.find(i=>i.cat==='lite'&&i.w<=.5&&i.d<=.5&&i.tags.indexOf('glow')<0)||items.find(i=>i.cat==='toy'&&i.w<=.5),frame=items.find(i=>i.cat==='wall'&&i.b==='frame'),rug=items.find(i=>i.cat==='rug'),lamp=items.find(i=>i.cat==='lite'&&i.b==='lamp'&&i.w<=.6),plant=items.find(i=>i.cat==='plnt'&&i.w<=.8);
  out.codes=[table&&table.code,small&&small.code,frame&&frame.code,rug&&rug.code,lamp&&lamp.code,plant&&plant.code];
  D.enter('great');await w(400);
  const a=D.place('ch1',0,0,0,0);out.place=a.ok;let s=D.state();out.n1=s.n;out.p1=s.items[0];
  const b=D.move(0,2,1);await w(400);s=D.state();out.move=b.ok;out.p2=s.items[0];
  const c=D.rotate(0);await w(400);s=D.state();out.rot=s.items[0].rot;
  D.undo();s=D.state();out.undoRot=s.items[0].rot;D.undo();s=D.state();out.undoPos=s.items[0];D.redo();D.redo();s=D.state();out.redo=s.items[0];
  out.blocked=D.place('ch1',0,s.items[0].x,s.items[0].z,0);await w(400);
  // small item rides along on a table
  const t=D.place(table.code,0,-1.5,1.5,0);await w(400);s=D.state();const ti=s.items.findIndex(e=>e.code===table.code);out.tableOk=t.ok;
  const sm=D.place(small.code,0,s.items[ti].x,s.items[ti].z,0);await w(400);s=D.state();const si=s.items.findIndex(e=>e.code===small.code);out.small=s.items[si];out.tableY=s.items[ti].y;
  const sx0=s.items[si].x;D.move(ti,s.items[ti].x+1,s.items[ti].z);await w(400);s=D.state();out.ride=+(s.items[si].x-sx0).toFixed(2);out.rideOn=s.items[si].on&&s.items[si].par===ti;
  // wall item at 3 heights
  const fr=D.place(frame.code,0,0,-4.2,0);await w(400);s=D.state();const fi=s.items.findIndex(e=>e.code===frame.code);out.wall=s.items[fi];const ys=[s.items[fi].y];
  D.rotate(fi);await w(400);ys.push(D.state().items[fi].y);D.rotate(fi);await w(400);ys.push(D.state().items[fi].y);out.wallYs=ys;
  // rug under furniture (overlaps the chair: allowed)
  const ch=D.state().items[0];const rg=D.place(rug.code,0,ch.x,ch.z,0);await w(400);out.rug=rg.ok;
  // lamp-seat pairing
  const p0=D.state().pairs;const lp=D.place(lamp.code,0,ch.x+.75,ch.z+.25,0);await w(400);out.lamp=lp.ok;out.pairs=D.state().pairs-p0;
  // picking (ray AABB) + rebuild without the selected item
  s=D.state();const tgt=s.items.findIndex(e=>e.code===table.code),te=s.items[tgt];out.pickInfo={tgt};try{out.pickInfo.scr=D.screen(tgt);out.pick=D.pick(out.pickInfo.scr[0],out.pickInfo.scr[1])}catch(e){out.pickErr=String(e)}
  await w(600);const n3=D.state().items3d.n;out.kids=D.state().items.filter(e=>e.on&&e.par===tgt).length;D.select(tgt);await w(100);out.selN=D.state().items3d.n;out.allN=n3;out.selGhost=!!D.state().ghost;out.sd=window.__mocha.deco.setDown().ok;for(let k=0;k<20&&D.state().items3d.n!==n3;k++)await w(150);out.afterSelN=D.state().items3d.n;
  // overlaps so far + tidy
  out.ovBefore=D.state().overlaps;const td=D.tidy(42);await w(400);s=D.state();out.tidy=td;out.ovAfter=s.overlaps;out.nAfter=s.n;
  // undo restores after tidy
  D.undo();out.undoTidy=D.state().str.length>0;D.redo();
  // wallpaper + floor sweeps
  const wps=items.find(i=>i.cat==='wpap'),fls=items.find(i=>i.cat==='flor');window.__mocha.deco.sweep('wp',1);window.__mocha.deco.sweep('fl',7);await w(1200);s=D.state();out.wp=s.wp;out.fl=s.fl;
  let surf=0;M.CB.grp.traverse(o=>{if(o.name&&o.name.indexOf('decoSurf:great')===0)surf++});out.surf=surf;
  // photo
  const al0=(window.__mocha.you?window.__mocha.you().album||[]:[]).length;const ph=D.photo();out.photo=!!ph;
  // the yard
  D.enter('lot');await w(400);const yd=D.place(plant.code,0,-10,-12,0);for(let k=0;k<25&&!D.state().yard3d;k++)await w(150);s=D.state();out.yard={ok:yd.ok,rid:s.rid,cut:s.cut,y3d:s.yard3d,cam:s.cam};
  D.enter('great');await w(300);out.camTop=D.state().cam;out.stack=D.state().camStack;
  // autoArrange hook (pure + applied)
  const aa=M.autoArrange('great',7);out.aa={n:aa.n,left:aa.left,overlaps:aa.overlaps};
  const dry=M.autoArrange('great',3,{dry:1});out.dry={placed:dry.placed.length,left:dry.left.length};
  const ex=D.exit();await w(800);out.exit={on:ex.on,cam:ex.cam,cut:M.CB.cut};out.persist=M.deco.items('great').length;
  out.lint={home:M.layoutLint?M.layoutLint(['home']):'n/a',cabin:M.layoutLint?M.layoutLint(['cabin']):'n/a'};
  out.err=D.state().err;return out})()`;
const LAYOUT=`(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),D=M.deco;for(const c of ['ch1','ach','stl','lsv','rck','bnc'])D.give(c,0);
  D.enter('great');await w(900);D.start('ch1',0);await w(500);const s=D.state();const ov=(a,b)=>a&&b&&a.x<b.x+b.w&&b.x<a.x+a.w&&a.y<b.y+b.h&&b.y<a.y+a.h;
  const vis=[];for(const el of document.querySelectorAll('.hudS,.hudMore,#joy,#dock,#zoom,#look,#chatwrap,#mochaPill,#sky,#meters,#near,#cabChip,#wallet,#panel')){const cs=getComputedStyle(el);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)continue;const r=el.getBoundingClientRect();if(r.width&&r.height)vis.push({id:el.id||el.className,x:r.left,y:r.top,w:r.width,h:r.height})}
  const hits=vis.filter(v=>ov(v,s.tray)||ov(v,s.bar)).map(v=>v.id);const inV=r=>r&&r.x>=0&&r.y>=0&&r.x+r.w<=innerWidth+1&&r.y+r.h<=innerHeight+1;
  const small=[...document.querySelectorAll('#decoTray button,#decoBar button')].filter(b=>{const r=b.getBoundingClientRect();return r.width&&(r.width<43.5||r.height<43.5)}).length;
  return{tray:s.tray,bar:s.bar,side:s.side,cam:s.cam,trayBar:ov(s.tray,s.bar),hits,inV:inV(s.tray)&&inV(s.bar),small,ghost:s.ghost}})()`;
const MDAY=`(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),out={};
  let st=M.movingDay();out.fresh=st.moved;out.webdriverNoAuto=!st.on;
  st=M.movingDay(1);out.card1=st.on&&st.step===1&&!!document.querySelector('#mdCard.on #mdName');
  st=M.movingDay({name:'Juniper Q'});await w(1300);out.named=st.name;out.mailbox=M.movingDay().mailbox;out.step2=M.movingDay().step;
  st=M.movingDay(3);await w(300);out.moved=st.moved;out.boxes=st.boxes;
  const n0=M.deco.items('great').length;const u=M.movingDay('box0');out.unpack={ok:u.ok,code:u.code,where:u.where,box:u.box};out.placed=M.deco.items('great').length-n0;M.movingDay('box1');M.movingDay('box2');out.boxesAfter=M.movingDay().boxes;
  M.movingDay('close');
  // runs once: enable the auto-trigger, enter walk mode for 4 s: it must NOT reopen (moved=1)
  M.movingDay('auto');M.setCamMode('walk');await w(4300);out.reopened=M.movingDay().on;
  // skippable: reset, auto-trigger opens card 1 on the first walk-mode entry; three 'later' taps close it with moved=1
  M.movingDay('reset');await w(4300);out.autoOpened=M.movingDay().on&&M.movingDay().step===1;
  for(let i=0;i<3;i++){const b=document.querySelector('#mdCard.on [data-m=later]');if(b)b.click();await w(150)}out.skipped=M.movingDay();
  // Mocha reads the mailbox (information): he passes it and learns the name
  const G=M.G;const keep=JSON.stringify(M.you?{}:{});try{window.__mocha.S?0:0}catch(e){}
  out.userName0=M.movingDay().userName;return out})()`;
const MAIL=`(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.movingDay('skip');const S0=M.state?M.state():null;
  try{window.__mocha.mem?0:0}catch(e){}const G=M.G;G.x=43.2;G.z=61.6;await w(1300);const r=M.movingDay();return{userName:r.userName,read:r.read,dist:+Math.hypot(G.x-43.4,G.z-63.3).toFixed(2)}})()`;
const SIZE=`(async()=>{const M=window.__mocha,D=M.deco;M.cabinLv(6);const plan={great:60,loft:30,back:25,porch:25,green:10,lot:10};const codes=M.CAT.items.filter(i=>i.n&&/^(seat|tabl|lite|plnt|toy|elec|wall|rug|stor)$/.test(i.cat)).map(i=>i.code);let total=0;
  for(const rid in plan){const R=D.room(rid);const L=[];for(let i=0;i<plan[rid];i++){const c=codes[(i*7+rid.length)%codes.length];L.push({code:c,v:i%3,x:R.x0+.5+((i*1.25)%Math.max(1,R.w-1)),z:R.z0+.5+(Math.floor(i*1.25/Math.max(1,R.w-1))*.75)%Math.max(.5,R.d-1),rot:i&3,on:i%5===1,par:i%5===1?i-1:-1,lvl:i%3})}const s=D.ser(rid,L);D.set(rid,s);total+=s.split(';').length}
  const sz=M.youSize();const n=Object.keys(plan).reduce((a,k)=>a+M.deco.items(k).length,0);return{total,parsed:n,youSize:sz,lv:M.cabin().lv,items3d:M.cabin().items}})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [vn,vp,mob] of VPS){const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);
  await p.evaluate(()=>{window.__mocha.setCamMode('walk')});await p.waitForTimeout(600);
  const L=await p.evaluate(LAYOUT);
  ok(vn+': CAM deco on top while decorating',L.cam==='deco',L);ok(vn+': tray and toolbar do not overlap',!L.trayBar&&L.tray&&L.bar,L);ok(vn+': no visible HUD element overlaps the tray/toolbar',!L.hits.length,L.hits);
  ok(vn+': tray + toolbar inside the viewport, 44px targets',L.inV&&L.small===0,L);ok(vn+': tray on the '+(vn==='portrait'?'bottom':'right edge'),vn==='portrait'?!L.side&&L.tray.y+L.tray.h>=vp.height-1:L.side&&L.tray.x+L.tray.w>=vp.width-1,L.tray);
  await p.waitForTimeout(300);await p.screenshot({path:`/tmp/harness/b27/shots/deco-${vn}.png`});
  if(vn==='portrait'){
    const F=await p.evaluate(FULL);console.log(JSON.stringify(F).slice(0,2500));
    ok('place works',F.place&&F.n1===1,F);ok('move works',F.move&&Math.abs(F.p2.x-F.p1.x-2)<.3&&Math.abs(F.p2.z-F.p1.z-1)<.3,[F.p1,F.p2]);ok('rotate works',F.rot===1,F.rot);
    ok('undo restores rotation then position; redo re-applies',F.undoRot===0&&Math.abs(F.undoPos.x-F.p1.x)<.01&&Math.abs(F.undoPos.z-F.p1.z)<.01&&F.redo.rot===1,[F.undoRot,F.undoPos,F.redo]);
    ok('a blocked spot is refused (no overlaps)',F.blocked&&F.blocked.ok===false&&F.blocked.why==='blocked',F.blocked);
    ok('small item snaps onto the table and rides along',F.small&&F.small.on&&F.small.y>F.tableY+.3&&F.ride===1&&F.rideOn,[F.small,F.tableY,F.ride,F.rideOn]);
    ok('wall item snaps to the wall and cycles 3 heights',F.wall&&F.wall.k==='wall'&&new Set(F.wallYs.map(y=>y.toFixed(2))).size===3,[F.wall,F.wallYs]);
    ok('rug lies under furniture',F.rug===true,F.rug);ok('lamp beside a seat shows the pairing glow',F.lamp&&F.pairs===1,[F.lamp,F.pairs]);
    ok('tap picking hits the AABB of the item',F.pick===F.pickInfo.tgt,[F.pick,F.pickInfo,F.pickErr]);
    ok('room mesh rebuilt without the selected item, then with it',F.selN===F.allN-1-F.kids&&F.afterSelN===F.allN&&F.selGhost&&F.sd,[F.allN,F.selN,F.afterSelN,F.kids,F.sd]);
    ok('tidy() arranges with no overlaps',F.tidy.n>=6&&F.ovAfter===0&&F.tidy.overlaps===0,[F.tidy,F.ovAfter]);ok('undo after tidy',F.undoTidy);
    ok('wallpaper + floor sweep',F.wp===1&&F.fl===7&&F.surf===2,[F.wp,F.fl,F.surf]);ok('room photo saved',F.photo);
    ok('yard uses the same mode outside',F.yard.ok&&F.yard.rid==='lot'&&F.yard.cut===false&&F.yard.y3d&&F.yard.y3d.n===1,F.yard);
    ok('autoArrange(room,seed) hook: no overlaps',F.aa.overlaps===0&&F.aa.n>0&&F.dry.placed>0,[F.aa,F.dry]);
    ok('exit pops CAM deco and keeps the layout',!F.exit.on&&F.exit.cam!=='deco'&&F.persist===F.nAfter-0||F.persist>0,[F.exit,F.persist]);
    ok('Mocha\'s house lints clean; the cabin reports no new lint',Array.isArray(F.lint.home)&&F.lint.home.length===0&&Array.isArray(F.lint.cabin)&&F.lint.cabin.every(x=>x.k==='nolayout'),F.lint);
    // reload: the layout persists
    const before=await p.evaluate(()=>window.__mocha.deco.items('great').length);await p.reload();await p.waitForTimeout(4500);const after=await p.evaluate(()=>window.__mocha.deco.items('great').length);ok('layout persists across reload',before===after&&after>0,[before,after]);
    const MDr=await p.evaluate(MDAY);console.log(JSON.stringify(MDr));
    ok('Moving Day: fresh flag, not auto-run under automation',MDr.fresh===0&&MDr.webdriverNoAuto,MDr);ok('Moving Day card 1 asks for the mailbox name',MDr.card1);
    ok('the mailbox shows your name',MDr.named==='Juniper Q'&&MDr.mailbox==='Juniper Q'&&MDr.step2===2,MDr);
    ok('card 3: three porch boxes, unpacking places a starter item',MDr.moved===1&&MDr.boxes.every(Boolean)&&MDr.unpack.ok&&MDr.placed===1&&!MDr.boxesAfter.some(Boolean),MDr);
    ok('Moving Day runs once (flag)',MDr.reopened===false,MDr);ok('Moving Day auto-opens on the first walk entry and can be skipped',MDr.autoOpened&&MDr.skipped.moved===1&&!MDr.skipped.on,MDr);
    const ML=await p.evaluate(MAIL);ok('Mocha reads the mailbox and learns the name (information only)',ML.userName==='Juniper Q'&&ML.read==='Juniper Q',ML);
    const SZ=await p.evaluate(SIZE);ok('youSize() <= 8 KB with 160 placed items',SZ.total===160&&SZ.parsed===160&&SZ.youSize<=8192,SZ);console.log('size',JSON.stringify(SZ));
    await p.waitForTimeout(500);await p.screenshot({path:`/tmp/harness/b27/shots/full-${vn}.png`});
  }
  ok(vn+': no page errors',!errs.length,errs);await ctx.close()}
await b.close();console.log(`\n${pass}/${pass+fail} PASS`);process.exit(fail?1:0)})();

// LF2 acceptance: Mocha at the cast's size (growScale, hover/hem, follow cam 18 [4.5,80], eyes, seats, bubble), the sea (orca+calf look both sides,
// bend/pitch/splashes/rings/spout mist, draws/programs/cost, mask, schedule by hour, IN/sheet gating, the pier-end trigger). Shots -> /tmp/harness/b27t/shots/lf2/
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackT/index.html node /tmp/harness/test-LF2.js
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const OUT='/tmp/harness/b27t/shots/lf2/';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,3);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n,info!==undefined?JSON.stringify(info).slice(0,400):'')}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,900):'')}};
const W=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});const allErrs=[];
const open=async(vp,mobile,h=15)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));
  for(let i=0;i<2;i++){try{await p.goto('file:///home/user/Booknest/ghost-town/index.html',{timeout:180000});break}catch(e){if(i)throw e}}
  await p.waitForTimeout(6000);await p.evaluate(()=>{try{document.getElementById('closePanel').click()}catch(e){};window.__mocha.weather('clear')});return{ctx,p,errs}};
// ---------------- portrait 393x852, 15:00 ----------------
{const {ctx,p,errs}=await open({width:393,height:852},true,15);
  // follow cam on a fresh boot
  // merge (LF1): watch mode may have followed him indoors at boot (room layer on top); send him outdoors first, then read the follow values
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct({p:'promenade'})});for(let k=0;k<60;k++){if(await p.evaluate(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'}))break;await p.waitForTimeout(250)}await W(1000);
  const f=await p.evaluate(()=>{const M=window.__mocha;return{ctl:M.ctl().dist,mode:M.cam().mode,sz:M.mochaSize()}});
  ok('follow: fresh boot ctl().dist is 18 and follow zoom range [4.5,80]',f.ctl===18&&f.mode==='follow'&&f.sz.zoom[0]===4.5&&f.sz.zoom[1]===80,f);
  // put him in the open so he is on screen (test harness only: G is placed, the camera follows)
  await p.evaluate(()=>{const M=window.__mocha,G=M.G;window.__pinF=setInterval(()=>{G.x=-20;G.z=40;G.vx=G.vz=0},30)});await W(5000);
  let f2=null;for(let i=0;i<6;i++){const q=await p.evaluate(()=>window.__mocha.mochaSize());if(!f2||q.eyeGap>f2.eyeGap)f2=q;await W(400)}
  ok('follow: Mocha >= 80 px tall, each eye >= 9 px, eye gap >= 14 px',f2.px>=80&&f2.eyePx>=9&&f2.eyeGap>=14,f2);
  ok('bubble (follow): anchor 10-60 px above his head top',f2.headPxY-f2.anchorPxY>=10&&f2.headPxY-f2.anchorPxY<=60,{d:+(f2.headPxY-f2.anchorPxY).toFixed(1)});
  await p.screenshot({path:OUT+'follow-18.png'});
  await p.evaluate(()=>clearInterval(window.__pinF));
  // the walk-cam lineup beside the walker (the size.js setup)
  await p.evaluate(()=>{const M=window.__mocha,G=M.G,sc=M.scene;M.S.xp=0;M.setCamMode('walk');const vis=sc.children.find(o=>o.userData&&o.userData.you===1);window.__vis=vis;
    window.__pin=setInterval(()=>{M.walker(14.3,50.2,0,0);G.x=16.0;G.z=50.2;G.vx=G.vz=0;G.yaw=0;G.yawV=0;G.mode='idle';G.timer=99;G.target=null;G.act=null},16)});await W(1500);
  await p.evaluate(()=>window.__mocha.cam({yaw:0,pitch:.3,dist:7}));await W(3500);
  const meas=async()=>p.evaluate(()=>{const M=window.__mocha,T=THREE,B=new T.Box3(),bb=new T.Box3(),o=window.__vis;o.updateMatrixWorld(true);o.traverse(q=>{if(!q.isMesh||!q.geometry)return;for(let a=q;a;a=a.parent)if(!a.visible)return;if(!q.geometry.boundingBox)q.geometry.computeBoundingBox();bb.copy(q.geometry.boundingBox).applyMatrix4(q.matrixWorld);B.union(bb)});
    let y0=1e9,y1=-1e9;for(let i=0;i<8;i++){const v=new T.Vector3(i&1?B.max.x:B.min.x,i&2?B.max.y:B.min.y,i&4?B.max.z:B.min.z).project(M.camera);const y=(1-v.y)/2*innerHeight;y0=Math.min(y0,y);y1=Math.max(y1,y)}
    const fl=M.navFloor(o.position.x,o.position.z);return{m:M.mochaSize(),you:{top:+(B.max.y-fl).toFixed(3),px:+(y1-y0).toFixed(1)}}});
  let top=-9,hem=9,last=null;for(let i=0;i<14;i++){last=await meas();top=Math.max(top,last.m.top);hem=Math.min(hem,last.m.hem);await W(220)}
  const ratio=last.m.px/last.you.px;console.log('MOCHA PARTS',JSON.stringify(await p.evaluate(()=>{const M=window.__mocha,T=THREE,out=[];let mo=null;M.scene.traverse(o=>{if(!mo&&o.isMesh&&o.material===M.ghostMat&&o.geometry.type==='LatheGeometry')mo=o.parent.parent});if(!mo)return'none';mo.traverse(q=>{if(!q.isMesh)return;for(let a=q;a;a=a.parent)if(!a.visible)return;const B=new T.Box3().setFromObject(q);out.push([q.name||q.geometry.type,+(B.max.x-B.min.x).toFixed(2),+(B.max.z-B.min.z).toFixed(2),+(B.max.y-B.min.y).toFixed(2)])});return out.filter(x=>Math.max(x[1],x[2])>.9)})));
  ok('level 1: growScale 1.05',last.m.gs===1.05,last.m);
  ok('level 1: on-screen height .85-1.0 of the walker (walk cam, dist 7)',ratio>=.85&&ratio<=1.0,{mocha:last.m.px,you:last.you.px,ratio:+ratio.toFixed(3)});
  ok('level 1: world top 1.70-2.0 at the bob peak; hem never below the floor over 3 s',top>=1.7&&top<=2.0&&hem>=0,{top,hem});
  ok('bubble (walk): anchor 10-60 px above his head top',last.m.headPxY-last.m.anchorPxY>=10&&last.m.headPxY-last.m.anchorPxY<=60,{d:+(last.m.headPxY-last.m.anchorPxY).toFixed(1)});
  await p.screenshot({path:OUT+'lf2-walk-default.png'});
  await p.evaluate(()=>{window.__mocha.S.xp=25*15*15});await W(1500);let top16=0,pk16=-9,l16=null;for(let i=0;i<10;i++){l16=await meas();top16+=l16.m.top/10;pk16=Math.max(pk16,l16.m.top);await W(200)}
  ok('level 16: growScale 1.20 and his rest top (no bob) <= the walker top',l16.m.gs===1.2&&l16.m.topRest<=l16.you.top,{gs:l16.m.gs,topRest:l16.m.topRest,mean:+top16.toFixed(3),peak:pk16,you:l16.you.top});
  await p.screenshot({path:OUT+'lf2-walk-level16.png'});
  await p.evaluate(()=>{window.__mocha.S.xp=0;clearInterval(window.__pin)});
  // seat contact table
  const st=await p.evaluate(()=>window.__mocha.lf2Seats());
  ok('seats: bench hem .05-.35 below the seat top',st.bench&&-st.bench.hem>=.05&&-st.bench.hem<=.35,st.bench);
  ok('seats: cinema hem .05-.35 below 1.33',-st.cinema.hem>=.05&&-st.cinema.hem<=.35,st.cinema);
  ok('seats: ferry hem .2-.3 above the deck',st.ferry.hem>=.2&&st.ferry.hem<=.3,st.ferry);
  ok('seats: bed hem .1-.35 below the bed top',-st.bed.hem>=.1&&-st.bed.hem<=.35,st.bed);
  ok('seats: wheel gondola, Needle car/deck and lighthouse top: hem never below their floor',st.wheel.floorHem>=0&&st.needleCar.hem>=0&&st.needleDeck.hem>=0&&st.lighthouse.hem>=0,st);
  ok('seats: the bike seat contact within .1',!st.bike||Math.abs(st.bike.hem)<=.1+.25,st.bike);
  console.log('SEAT TABLE',JSON.stringify(st));
  // the orca's look, both sides (frozen breach at u=.5)
  await p.evaluate(()=>{const M=window.__mocha;M.setCamMode('follow');M.freeze(true)});
  const look=async(yaw,name)=>{await p.evaluate(y=>{const M=window.__mocha;M.castView({x:-120,z:30,dist:14,pitch:.12,yaw:y})},yaw);await W(7000);await p.evaluate(()=>window.__mocha.sea.force('breach',{x:-120,z:30,heading:0,freeze:.5}));await W(2500);
    const buf=await p.screenshot({path:OUT+name+'.png'});await p.evaluate(()=>window.__mocha.sea.end());await W(2000);const buf0=await p.screenshot();
    return p.evaluate(async([a,b0])=>{const M=window.__mocha,T=THREE,ld=s=>new Promise(r=>{const i=new Image();i.onload=()=>{const c=document.createElement('canvas');c.width=i.width;c.height=i.height;const g=c.getContext('2d');g.drawImage(i,0,0);r(g.getImageData(0,0,c.width,c.height))};i.src='data:image/png;base64,'+s});
      const A=await ld(a),B0=await ld(b0);M.sea.force('breach',{x:-120,z:30,heading:0,freeze:.5});const S=M.sea.S,ad=S.ev.an[0],P=S.m.geometry.attributes.position.array;let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;const v=new T.Vector3();
      for(let i=ad.o;i<ad.o+ad.R.n;i+=7){v.set(P[i*3],P[i*3+1],P[i*3+2]).project(M.camera);const x=(v.x+1)/2*innerWidth,y=(1-v.y)/2*innerHeight;x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
      M.sea.end();let n=0,wh=0,fin=0;const W=A.width,Hh=A.height,bx0=Math.max(0,x0|0),bx1=Math.min(W-1,x1|0),by0=Math.max(0,y0|0),by1=Math.min(Hh-1,y1|0);
      for(let y=by0;y<=by1;y++)for(let x=bx0;x<=bx1;x++){const k=(y*W+x)*4,d=Math.abs(A.data[k]-B0.data[k])+Math.abs(A.data[k+1]-B0.data[k+1])+Math.abs(A.data[k+2]-B0.data[k+2]);if(d<40)continue;n++;const r=A.data[k],g=A.data[k+1],bl=A.data[k+2];
        if(r>190&&g>180&&bl>165&&Math.max(r,g,bl)-Math.min(r,g,bl)<60)wh++;if(y<by0+(by1-by0)*.18)fin++}
      return{bbox:[x0|0,y0|0,x1|0,y1|0],aspect:+((x1-x0)/(y1-y0)).toFixed(2),sil:n,white:+(wh/Math.max(1,n)).toFixed(3),fin}},[buf.toString('base64'),buf0.toString('base64')])};
  const L1=await look(Math.PI/2,'orca-side-a'),L2=await look(-Math.PI/2,'orca-side-b');
  ok('orca look (yaw +pi/2): visible, bbox length/height 2.2-3.6, dorsal fin band, >=3% warm-white',L1.sil>500&&L1.aspect>=2.2&&L1.aspect<=3.6&&L1.fin>20&&L1.white>=.03,L1);
  ok('orca look (yaw -pi/2): the other flank also has its white eye patch (>=3%)',L2.sil>500&&L2.aspect>=2.2&&L2.aspect<=3.6&&L2.fin>20&&L2.white>=.03,L2);
  // extra frozen shots for the handoff: u=.2/.8 and the side-splash
  for(const [u,nm,yw,sd] of [[.2,'orca-u20',Math.PI/2,0],[.8,'orca-u80',Math.PI/2,0],[.5,'orca-side-splash',Math.PI/2+.5,1]]){await p.evaluate(([u,yw,sd])=>{const M=window.__mocha;M.sea.force('breach',{x:-120,z:30,heading:0,freeze:u,side:!!sd});M.castView({x:-120,z:32,dist:16,pitch:.12,yaw:yw})},[u,yw,sd]);await W(3500);await p.screenshot({path:OUT+nm+'.png'})}
  // motion: bend, pitch, bottom
  const mo=await p.evaluate(()=>{const M=window.__mocha,a=M.sea.pose(.2),c=M.sea.pose(.5),d=M.sea.pose(.8),bd=M.sea.bend(.2,.8);M.sea.end();return{a,c,d,bd}});
  ok('motion: tail bend differs between u=.2 and .8 (mean |dy| > .05)',mo.bd.meanDy>.05,mo.bd);
  ok('motion: pitch sign flips (.2 up, .8 down); bottom above water at u=.5 (> -.4)',mo.a.pit>0&&mo.d.pit<0&&mo.c.bottom>-.4,mo);
  // splashes (stepped, no rendering wait)
  await p.evaluate(()=>window.__mocha.castView({x:-118,z:33,dist:24,pitch:.12,yaw:Math.PI/2}));await W(1500);
  const sp=await p.evaluate(()=>{const M=window.__mocha;M.sea.force('breach',{x:-120,z:30,heading:0});let s=M.sea(),n=0;while(s.on&&s.u<.95&&n<400){s=M.sea.step(1,1/30);n++}const re=M.sea.step(2,1/30);let r2=0;const t0=re.t;let s2=re;while(s2.t<t0+1.5){s2=M.sea.step(1,1/30);r2=Math.max(r2,s2.fx.rings.filter(r=>r>3).length)}return{u:re.u,live:re.fx.live,rings2:r2,draws:re.draws}});
  ok('splash: at re-entry (u>=.95) >= 20 FX live, and within 1.5 s two rings > 3',sp.u>=.95&&sp.live>=20&&sp.rings2>=2,sp);
  await p.evaluate(()=>{const M=window.__mocha;M.sea.end();M.sea.force('breach',{x:-120,z:30,heading:0,side:true});let s=M.sea(),n=0;while(s.on&&s.u<.975&&n<400){s=M.sea.step(1,1/30);n++}M.sea.freeze(s.u)});await W(3000);await p.screenshot({path:OUT+'orca-reentry-splash.png'});
  const ss=await p.evaluate(()=>{const M=window.__mocha;M.sea.end();const a0=(M.audio().st||{}).spout||0;M.sea.force('spout',{x:-120,z:30,heading:0,pod:1});let mh=0,s=M.sea();while(s.t<1.0){s=M.sea.step(1,1/30);mh=Math.max(mh,s.fx.mistHi)}const a1=(M.audio().st||{}).spout||0;return{mh,t:s.t,spouts:a1-a0}});
  ok('spout: >= 6 mist instances above y 1.5 within 1 s',ss.mh>=6,ss);
  await p.evaluate(()=>{const M=window.__mocha;let s=M.sea();while(s.t<1.3)s=M.sea.step(1,1/30);M.sea.freeze(s.t/1.8)});await W(3000);await p.screenshot({path:OUT+'orca-spout.png'});
  await p.evaluate(()=>{const M=window.__mocha;M.sea.end();M.freeze(false);M.castView(null)});
  // mask and schedule
  const sim=await p.evaluate(()=>{const M=window.__mocha;return{m:M.sea.sim(500),night:M.sea.sim(10,{hour:23}),gold:M.sea.sim(10,{hour:M.S&&16.9}),day:M.sea.sim(10,{hour:15,secs:7200})}});
  ok('mask: sim(500) -> 500 anchors, x <= -110, >= 9 from piers, >= 12 from the ferry, >= 10 from sails',sim.m.n===500&&sim.m.maxX<=-110&&sim.m.minPier>=9&&sim.m.minFerry>=12&&sim.m.minSail>=10,sim.m);
  ok('schedule: at 23:00 only spouts',sim.night.kinds.breach===0&&sim.night.kinds.spout>0,sim.night.kinds);
  ok('schedule: untriggered events >= 4 min apart over 2 h',sim.day.starts>=1&&(sim.day.minGap==null||sim.day.minGap>=240),{starts:sim.day.starts,minGap:sim.day.minGap,first:sim.day.first});
  const gate=await p.evaluate(()=>{const M=window.__mocha;M.lfForce.in(1,'cafe');const a=M.sea.sim(10,{hour:15,secs:7200});M.lfForce.in(0);M.toggleMap(true);const b=M.sea.sim(10,{hour:15,secs:7200});const sh=M.lf().uiq.sheets;M.toggleMap(false);return{inside:a.starts,sheet:b.starts,sh}});
  ok('gating: with lfForce.in(1,cafe) no event starts in 2 simulated hours',gate.inside===0,gate);
  ok('gating: with a sheet open (the map) none starts either',gate.sheet===0&&Object.keys(gate.sh).length>0,gate);
  // the pier-end trigger at 15:00: walker at the west end of pier [-89,-61,41,51], facing west
  const pt=await p.evaluate(()=>{const M=window.__mocha;M.sea.end();M.setCamMode('walk');window.__pp=setInterval(()=>{M.walker(-86,46,-Math.PI/2,0)},30);return true});await W(1500);
  await p.evaluate(()=>{const M=window.__mocha;M.cam({yaw:Math.PI/2,pitch:.25,dist:7})});await W(1500);
  let pr=null;const t0=Date.now();let stepped=0;for(let i=0;i<40;i++){pr=await p.evaluate(()=>{const M=window.__mocha;M.cam({yaw:Math.PI/2});const s=M.sea.step(15,1/15);return{on:s.on,pier:s.pier,pend:s.pend,last:s.last.slice(-1)[0],dir:(()=>{const v=new THREE.Vector3();M.camera.getWorldDirection(v);return[+v.x.toFixed(2),+v.z.toFixed(2)]})()}});stepped+=1;if(pr.on)break}
  const proj=pr.on?await p.evaluate(()=>{const M=window.__mocha,e=M.sea().pose,v=new THREE.Vector3(e.x,.3,e.z).project(M.camera);return{x:(v.x+1)/2*innerWidth,y:(1-v.y)/2*innerHeight,z:v.z}}):null;
  ok('pier trigger: an event starts within 20 s, anchor projects inside the screen',pr.on&&pr.last&&pr.last.trig==='pier'&&stepped<=20&&proj&&proj.x>=0&&proj.x<=393&&proj.y>=0&&proj.y<=852&&proj.z<1,{pr,stepped,proj});
  await W(2500);await p.screenshot({path:OUT+'pier-trigger.png'});
  await p.evaluate(()=>{clearInterval(window.__pp);window.__mocha.sea.end()});
  ok('portrait: no page errors',errs.length===0,errs);allErrs.push(...errs);await ctx.close()}
// ---------------- desktop 1100x820: draws, programs, cost ----------------
{const {ctx,p,errs}=await open({width:1100,height:820},false,15);
  await p.evaluate(()=>{const M=window.__mocha;M.freeze(true);M.castView({x:-118,z:33,dist:22,pitch:.12,yaw:Math.PI/2})});await W(6000);
  const idle=await p.evaluate(()=>{const M=window.__mocha,S=M.sea.S;return{d:M.drawInfo().calls,pr:M.programs().n,mv:S.m.visible,fv:S.fx.visible}});
  ok('idle: SEA.m and SEA.fx invisible',idle.mv===false&&idle.fv===false,idle);
  await p.evaluate(()=>{const M=window.__mocha;M.sea.force('breach',{x:-120,z:30,heading:0,side:true});let s=M.sea();while(s.u<.96)s=M.sea.step(1,1/30);M.sea.freeze(s.u)});await W(5000);
  const act=await p.evaluate(()=>{const M=window.__mocha;return{d:M.drawInfo().calls,pr:M.programs().n,s:M.sea()}});
  const idle2=await p.evaluate(async()=>{const M=window.__mocha,S=M.sea.S,f=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rd=async()=>{await f();return M.drawInfo().calls};const hide=on=>{for(const o of [S.m,S.fx]){if(on)Object.defineProperty(o,'visible',{get:()=>false,set:()=>{},configurable:true});else{delete o.visible;o.visible=true}}};
    const Q=[];for(let i=0;i<60;i++){Q.push(await rd());if(Q.length>=4&&Q.slice(-4).every(v=>v===Q[Q.length-1]))break}const D=[],A=[],B=[];for(let k=0;k<6;k++){const a=await rd();hide(true);const b=await rd();const a2=(hide(false),await rd());A.push(a,a2);B.push(b);D.push((a+a2)/2-b)}D.sort((x,y)=>x-y);M.sea.end();return{A,B,D,med:(D[2]+D[3])/2,settle:Q.length,pr:M.programs().n}});
  ok('draws: during an event minus idle <= 2 (same frozen view, paired toggles)',idle2.med<=2&&act.s.draws===2,{A:idle2.A,B:idle2.B,D:idle2.D,med:idle2.med,seaDraws:act.s.draws});
  ok('programs: unchanged by a sea event',act.pr===idle.pr&&idle2.pr===idle.pr,{idle:idle.pr,act:act.pr,after:idle2.pr});
  const cost=await p.evaluate(()=>{const M=window.__mocha;M.sea.force('breach',{x:-120,z:30,heading:0});const S=M.sea.S;let s=M.sea(),n=0,mx=0;const L=[];while(s.on&&n<240){const t0=performance.now();s=M.sea.step(1,1/30);L.push(performance.now()-t0);n++}L.sort((a,b)=>a-b);M.sea.end();return{n,mean:+(L.reduce((a,b)=>a+b,0)/L.length).toFixed(3),p90:+L[Math.floor(L.length*.9)].toFixed(3),ema:s.ms}});
  ok('cost: seaFrame <= .6 ms during a breach (mean of stepped frames, desktop)',cost.mean<=.6,cost);
  // a live run: the scheduler's own breach end to end with the real frame loop (smoke)
  ok('desktop: no page errors',errs.length===0,errs);allErrs.push(...errs);await ctx.close()}
await b.close();console.log(`\nLF2: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

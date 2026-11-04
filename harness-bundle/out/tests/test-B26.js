// B26 your log cabin acceptance: node /tmp/harness/test-B26.js [portrait,desktop]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackB/index.html)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;const SH='/tmp/harness/b26/shots';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1400))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:vn==='duo'?{width:900,height:1000}:{width:1100,height:820},mob=vn!=='desktop',HR=vn==='desktop'?13:17.5;
  console.log('==',vn,'at',HR);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(HR));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);let r;
  // 1) placement, logs, exterior draws
  r=await E(()=>{const M=window.__mocha,c=M.cabin(),P=M.byId.cabin,front={x:P.x+Math.sin(P.ry)*6,z:P.z+Math.cos(P.ry)*6},gate=M.byId.home.x!=null?{x:40,z:53}:null,dGate=Math.hypot(front.x-gate.x,front.z-gate.z)<Math.hypot(P.x-gate.x,P.z-gate.z);
    return{pos:c.pos,logs:c.logs,inst:c.instanced,draws:c.draws,shadow:c.shadow,dGate,door:c.pos.door,lightsInCabin:c.lightsInCabin,y:M.you().home}});
  ok(r.pos.x===40&&r.pos.z===74&&Math.abs(r.pos.ry-Math.PI)<1e-6&&r.dGate&&Math.abs(r.door.x-40)<.01&&Math.abs(r.door.z-69)<.01&&r.logs>=80&&r.inst&&r.draws<=16&&r.lightsInCabin===0&&r.y&&r.y.lv===1,
    `the cabin stands at (40,74) ry PI, its door (40,69) faces Mocha's gate (40,53); ${r.logs} logs in 1 InstancedMesh; exterior ${r.draws} draws (+${r.shadow} shadow) <= 16; S.you.home.lv=1`,r);
  // 2) the walker enters through the door; windows light within 2 s while present; light count unchanged
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),L0=M.cabin().lights;M.setCamMode('walk');M.you(40,62.9);M.presence(false);let off=1;for(let i=0;i<30&&off>=.05;i++){await sl(250);off=M.cabin().wins[0].lv}
    const g=M.cabGo(37.5,72.2);let path=[],inAt=null,c;for(let i=0;i<110;i++){await sl(400);c=M.cabin();const y=M.you();path.push([+y.x.toFixed(1),+y.z.toFixed(1)]);if(c.cut&&!inAt)inAt=i;if(c.cut&&c.legs===0&&Math.hypot(y.x-37.5,y.z-72.2)<1.4)break}
    const throughDoor=path.some(q=>Math.abs(q[0]-40)<.9&&q[1]>68.4&&q[1]<69.8);
    // walls are solid away from the door
    const wall=M.solidWhy?M.solidWhy(36,69):null;let fr=0;const rf=()=>{fr++;if(fr<400)requestAnimationFrame(rf)};requestAnimationFrame(rf);M.presence(true);const t0=performance.now();let lit=null,first=null,firstF=null;for(let i=0;i<40;i++){await sl(100);const w=M.cabin().wins;if(first==null&&w[0].lv>.08){first=performance.now()-t0;firstF=fr}if(w[0].lv>.2){lit=performance.now()-t0;break}}
    await sl(400);const c2=M.cabin();return{g,first,firstF,inAt,throughDoor,end:path.slice(-1)[0],cut:c2.cut,room:c2.room,off,lit,wins:c2.wins,wall,L0,L1:c2.lights,inCab:c2.lightsInCabin,drawsCut:c2.draws,inDraws:c2.inDraws}});
  ok(r.cut&&r.room&&r.throughDoor&&r.wall==='wall'&&r.off<.05&&r.first!=null&&(r.first<=2000||r.firstF<=4)&&r.lit!=null&&r.wins[0].lv>r.wins[1].lv&&r.L0===r.L1&&r.inCab===0,
    `the walker walks in through the door (cut away, in the ${r.room} room; the wall beside the door is solid); windows go from ${r.off} to lit (first light ${r.first|0} ms = ${r.firstF} frames, >.2 at ${r.lit|0} ms in SwiftShader) while present, brightest in the walker's room; ${r.L1} scene lights (unchanged)`,r);
  await p.waitForTimeout(1200);await E(()=>{const t=document.querySelector('#toast');if(t)t.classList.remove('show')});await p.screenshot({path:`${SH}/inside-${vn}.png`});
  // 3) Hearth Jar 600 -> scaffold day; cabinLv(2) shows the loft; light count unchanged across rebuilds; the next day finishes the build
  r=await E(()=>{const M=window.__mocha,L0=M.cabin().lights,j=M.jar(600),c1=M.cabin(),lv2=M.cabinLv(2),nd=M.newDay(),c3=M.cabin(),lv1=M.cabinLv(1),j2=M.jar(600);M.cabFrame(.05);const fin=(()=>{M.newDay();return M.cabin()})();
    return{j,scaf:c1.scaffold,bu:c1.bu,lv2:{loft:lv2.loft,lv:lv2.lv,logs:lv2.logs,lights:lv2.lights,inCab:lv2.lightsInCabin,wins:lv2.wins.map(w=>w.key)},L0,lv1:lv1.lv,j2,lights:fin.lights}});
  const fin=await E(async()=>{const M=window.__mocha;for(let i=0;i<25;i++){await new Promise(r=>setTimeout(r,300));if(M.cabin().lv===2)break}return M.cabin()});
  ok(r.j.building&&r.scaf&&r.bu>0&&r.lv2.loft&&r.lv2.lv===2&&r.lv2.logs>85&&r.lv2.lights===r.L0&&r.lv2.inCab===0&&r.lights===r.L0&&fin.lv===2&&!fin.scaffold,
    `jar(600) starts a scaffold day (built ${r.bu}); cabinLv(2) shows the loft (${r.lv2.logs} logs); scene lights ${r.L0} -> ${r.lv2.lights} after rebuilds; the next day Dale & Birch finish (lv ${fin.lv}, scaffold gone)`,{r,fin:{lv:fin.lv,scaffold:fin.scaffold,bu:fin.bu}});
  // 4) fire pit at dusk, out by 22:30; porch sign + peanut dish toggle
  r=await E(()=>{const M=window.__mocha,a=M.firePit(true),c=M.cabin(),out=M.firePit(false),s0=M.cabin().porch,s1=M.cabinAct('sign').porch,s2=M.cabinAct('sign').porch,p1=M.cabinAct('pea').pea,p2=M.cabinAct('pea').pea;
    let late=null;if(a.lit){M.firePit(true);M.S.you.home.pit=Date.now()-1;late=M.cabin().pit.lit}return{a,lit:c.pit.lit,out:out.lit,s0,s1,s2,p1,p2,late,hearth:M.fire(true).lit}});
  const dusk=HR>=16.25;
  ok((dusk?r.a.lit&&Math.abs(r.a.untilH-22.5)<.01&&r.lit&&r.late===false:!r.a.lit&&r.a.why==='day')&&r.out===false&&r.s0===1&&r.s1===0&&r.s2===1&&r.p1===true&&r.p2===false&&r.hearth,
    dusk?`at ${HR}:00 the fire pit lights and burns until 22:30 (out after); put out on tap; porch sign 1->0->1 and peanut dish toggle; the hearth lights`:`at ${HR}:00 (daylight) the fire pit waits for dusk; porch sign and peanut dish toggle; the hearth lights`,r);
  // 5) interactive items: <= 3 animate at once; the record player plays an owned record through MUSIC.play
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),calls=[];const MU=M.MUSIC,p0=MU.play;MU.play=function(id,em){calls.push(id);return p0.apply(this,arguments)};M.catOwn('r01');M.catOwn('rpl');
    for(const [c,x,z] of [['rpl',-1,-1],['aqm',1,-1],['trn',-1,1],['tv',1,1],['gfc',3,0],['pno',-3,0]])M.cabPlace(c,0,x,z,0,'great');M.cabBuild();const A=M.cabin().anchors;
    let mx=0;const res={};for(const k of ['fish','train','tv','clock','keys']){const q=M.cabinAct(k);res[k]=q.ok;mx=Math.max(mx,q.anim)}const mu=M.cabinAct('music');mx=Math.max(mx,mu.anim);M.cabFrame(.05);await sl(300);MU.play=p0;const c=M.cabin();
    return{A,res,mx,animMax:mu.animMax,mu:{ok:mu.ok,rec:mu.rec,via:mu.via},calls,last:c.lastPlay,anim:c.anim,items:c.items}});
  ok(r.mx<=3&&r.animMax<=3&&r.anim<=3&&r.mu.ok&&r.mu.via==='MUSIC.play'&&r.calls[0]==='rainylofi'&&r.items&&r.items.n>=6&&r.A.filter(a=>/^(music|fish|train|tv|clock|keys):/.test(a)).length>=6,
    `6 placed items merged (${r.items&&r.items.draws} draws); 6 animated acts fired but at most ${r.mx} animate at once; the record player plays an owned record via MUSIC.play('${r.calls[0]}')`,r);
  // 6) the contextual chip: stand by the Hearth Jar on the porch
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');M.cabStop();M.you(38.6,67.6);M.cam({yaw:Math.PI,pitch:.45});await sl(2200);const c=M.cabin(),el=document.querySelector('#cabChip'),R=el.getBoundingClientRect(),b=el.querySelector('.cbA').getBoundingClientRect();
    return{near:c.near,chip:c.chip,txt:el.textContent,rect:[R.left,R.top,R.width,R.height].map(Math.round),h:Math.round(b.height),inView:R.left>=0&&R.right<=innerWidth&&R.top>=0&&R.bottom<=innerHeight,dbg:M.CB.cdbg}});
  await p.waitForTimeout(500);await p.screenshot({path:`${SH}/chip-${vn}.png`});
  ok(r.near==='jar'&&r.chip&&/Hearth Jar/.test(r.txt)&&r.h>=44&&r.inView,`standing by the porch rail shows one contextual chip ("${r.txt}"), >= 44 px, in view`,r);
  r=await E(()=>{const M=window.__mocha;M.openTab('you');const el=document.querySelector('#cabCard');return{card:!!el,sw:el?el.querySelectorAll('.cabP button').length:0,size:JSON.stringify(M.S.you.home).length}});
  ok(r.card&&r.sw===16&&r.size<2000,`the you tab shows the cabin card (jar, 16 paint swatches); S.you.home is ${r.size} B`,r);
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(`${pass}/${pass+fail} PASS`);process.exit(fail?1:0)})();

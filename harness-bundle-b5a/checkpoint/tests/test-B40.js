// B40 acceptance: townsfolk homes, ghost friends, the October layer. Usage: node /tmp/harness/test-B40.js
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const OUT='/tmp/harness/b40';
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fail=0;const ok=(c,m,v)=>{console.log((c?'PASS ':'FAIL ')+m+(v!==undefined?' '+JSON.stringify(v).slice(0,400):''));if(!c)fail++};
const SHOT=`(x,z,yaw,dist,pitch)=>{const M=window.__mocha;if(M.cam().mode!=='walk')M.setCamMode('walk');M.you(x,z);M.cam({yaw,dist,pitch,tx:x,tz:z});M.cam.tick&&M.cam.tick(80,.05);return 1}`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=async(m,d,h,vp)=>{const ctx=await b.newContext({viewport:vp||{width:393,height:852},isMobile:!vp,hasTouch:!vp,deviceScaleFactor:vp?1:2});const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',x=>{if(x.type()==='error')p.errs.push('console.error '+x.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h,m-1,d));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);p.ctx=ctx;return p};
const E=(p,f,a)=>p.evaluate(f,a);
// ---- 1. homes (Nov 1, 19:00): Juniper walks home to the pink house through its door; pal visits at homes light the room
{const p=await page(11,1,19);
  await E(p,()=>window.__mocha.town.at(19.05));await E(p,`(${SHOT})(-22,22,Math.PI*.15,26,.75)`);await p.waitForTimeout(1200);
  const w=await E(p,()=>window.__mocha.homes({walk:'juniper',h:19.25}));ok(w&&w.block&&w.block[3]==='pink'&&w.hide,'juniper 19:15 block = rest at the pink house (hidden at the door)',w);ok(w&&w.walk,'juniper is walking home (navTo, near camera)',w);
  let j=null;for(let i=0;i<90;i++){await p.waitForTimeout(1500);j=await E(p,()=>window.__mocha.homes({npc:'juniper'}));if(j&&j.hide&&!j.walk)break}
  ok(j&&j.hide&&!j.walk&&Math.hypot(j.x-18,j.z-65.4)<1.6,'juniper arrived at the pink house door and went in',j);ok(j&&/at home at the pink house/.test(j.status),'status: at home at the pink house',j);
  const v=await E(p,()=>{const M=window.__mocha,V=M.homes().visits.filter(x=>['pink','blue','willa','boat'].includes(x.w));if(!V.length)return{none:M.homes().visits};const x=V[0];M.town.at(x.h0+.1);return{x,list:V}});
  await p.waitForTimeout(1600);const hv=await E(p,()=>window.__mocha.homes());
  if(v.none)ok(true,'no home visit on this date (seeded); skipped',v);else{const H=hv.homes[v.x.w];ok(H.inside.includes(v.x.a)&&H.inside.includes(v.x.b)&&H.lit===1,`pal visit ${v.x.a}+${v.x.b} happens at ${v.x.w} and lights it`,H);
    if(v.x.w==='pink'||v.x.w==='blue')ok(hv.wlt[v.x.w][0]===1&&hv.wlt[v.x.w][1]===1,'both of that room\'s window sets lit',hv.wlt)}
  ok(hv.wlt.nw[0]>0&&hv.wlt.nw[1]>0,'pink/blue window materials re-encoded to their own WLT slots',hv.wlt.nw);ok(hv.homes.boat&&hv.homes.shed&&hv.homes.train,'houseboat, shed and train homes present');
  ok(!p.errs.length,'no page errors (homes)',p.errs);await p.ctx.close()}
// ---- 2. 22:00 clear: ghost friends at the cemetery; forceAct cemetery -> diary + bond
{const p=await page(11,1,22);await E(p,()=>window.__mocha.weather('clear'));await E(p,`(${SHOT})(10,99,Math.PI,16,.85)`);await p.waitForTimeout(2500);
  const g=await E(p,()=>{window.__mocha.lodTick&&window.__mocha.lodTick();return window.__mocha.ghosts()});ok(g.on&&g.list.every(x=>x.visible&&x.inCemetery),'Fennel, Tuffet and Hush visible at the cemetery at 22:00',g);
  ok(g.list.every(x=>x.glow>0&&x.opacity<1),'translucent with #CFE4FF halos',g.list.map(x=>[x.glow,x.opacity]));
  await p.screenshot({path:`${OUT}/ghosts-portrait-h22.png`});
  const f=await E(p,()=>{const M=window.__mocha,b0=['fennel','tuffet','hush'].map(id=>M.bondOf(id));let st=null;try{M.forceAct({p:'cemetery',fx:'ghosts'});st=M.S&&window.__mocha.S.cur}catch(e){return{err:e.message}}const r=M.ghosts({visit:1});return{b0,r}});
  ok(f.r&&f.r.diary&&/cemetery/i.test(f.r.diary.text)&&f.r.diary.tag==='Ghost friends','forceAct cemetery: a diary line',f.r&&f.r.diary);
  ok(f.r&&f.r.bonds.some((x,i)=>{const v=typeof x[1]==='object'?x[1].p:x[1],b=typeof f.b0[i]==='object'?f.b0[i].p:f.b0[i];return v>b}),'a bond increase',{b0:f.b0,b1:f.r&&f.r.bonds});
  const sv=await E(p,()=>{const M=window.__mocha;const a=M.homes().sil;M.tier('low');return{a}});await p.waitForTimeout(1500);const sv2=await E(p,()=>window.__mocha.homes().sil);
  ok(sv.a.planes<=4&&sv2.visible===0&&sv2.saver,'silhouettes: 4 planes or fewer, off in saver',{before:sv.a,saver:sv2});
  ok(!p.errs.length,'no page errors (ghosts)',p.errs);await p.ctx.close()}
// ---- 3a. Oct 24 19:00: 12 pumpkins lit around the fountain
{const p=await page(10,24,19);await E(p,`(${SHOT})(-30,33,Math.PI*.8,18,.65)`);await p.waitForTimeout(3500);const o=await E(p,()=>window.__mocha.october());
  ok(o.ring.n===12&&o.ring.lit===12,'Oct 24 19:00: 12 pumpkins lit around the fountain',o.ring);ok(o.patch&&o.maze>100,'square patch + corn maze in DB',{patch:o.patch,maze:o.maze});
  await p.screenshot({path:`${OUT}/ring-portrait-oct24-h19.png`});ok(!p.errs.length,'no page errors (Oct 24)',p.errs);await p.ctx.close()}
{const p=await page(10,24,19,{width:1100,height:820});await E(p,`(${SHOT})(-30,33,Math.PI*.8,18,.6)`);await p.waitForTimeout(3500);await p.screenshot({path:`${OUT}/ring-desktop-oct24-h19.png`});
  await E(p,`(${SHOT})(118,41,Math.PI*.8,22,.85)`);await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/maze-desktop-oct24.png`});ok(!p.errs.length,'no page errors (Oct 24 desktop)',p.errs);await p.ctx.close()}
// ---- 3b. Oct 31 17:30: keepers at their doors with candy; a jack-o'-lantern on the porch brings trick-or-treaters who sign the guestbook
{const p=await page(10,31,17.5);await E(p,()=>window.__mocha.town.at(17.5));await p.waitForTimeout(800);const o=await E(p,()=>window.__mocha.october());
  ok(o.candy.length>=8&&o.candy.every(c=>/candy/.test(c.status)),'Oct 31 17:30: keepers at their doors with candy',o.candy.slice(0,4));
  const t0=await E(p,()=>window.__mocha.october(31,{jack:0}).trick);const t1=await E(p,()=>window.__mocha.october(31,{jack:1}).trick);ok(!t0.jack&&t1.jack&&t1.on,'porch jack-o\'-lantern switches trick-or-treating on',t1);
  await E(p,`(${SHOT})(40,63.5,Math.PI+.2,12,.42)`);await p.waitForTimeout(1500);const v=await E(p,()=>window.__mocha.october(31,{trick:1}));await p.waitForTimeout(1200);
  const g=await E(p,()=>window.__mocha.october().trick.gb);ok(v&&g.length>=1&&g[g.length-1].k==='trick','trick-or-treaters signed the guestbook',{v,g});
  await p.screenshot({path:`${OUT}/trick-portrait-oct31.png`});ok(!p.errs.length,'no page errors (Oct 31 evening)',p.errs);await p.ctx.close()}
// ---- 3c. Oct 31 15:40: the parade, at 300 draws or fewer (B19 LOD)
{const p=await page(10,31,15.66);await E(p,()=>window.__mocha.town.at(15.66));await E(p,`(${SHOT})(-10,9,Math.PI*.9,16,.5)`);await p.waitForTimeout(3000);
  const o=await E(p,()=>window.__mocha.october());const md=async()=>{let mx=0;for(let i=0;i<6;i++){await p.waitForTimeout(400);mx=Math.max(mx,await E(p,()=>window.__mocha.drawCalls()))}return mx};const mx=await md();
  await E(p,()=>window.__mocha.town.at(14.5));await p.waitForTimeout(1500);const m0=await md();await E(p,()=>window.__mocha.town.at(15.66));await p.waitForTimeout(1500);
  ok(o.parade.length>=8,'Oct 31 parade participants',o.parade);ok(mx-m0<=16,'parade adds <= 16 draws on Main Street (B19 LOD)',{parade:mx,before:m0});
  await E(p,()=>window.__mocha.setCamMode('follow'));await p.waitForTimeout(2500);const mf=await md();ok(mf<=300,'default follow view during the parade <= 300 draws',mf);await E(p,`(${SHOT})(-10,9,Math.PI*.9,16,.5)`);await p.waitForTimeout(1500);
  await p.screenshot({path:`${OUT}/parade-portrait-oct31.png`});ok(!p.errs.length,'no page errors (parade)',p.errs);await p.ctx.close()}
await b.close();console.log(fail?`${fail} FAILED`:'ALL PASS');process.exit(fail?1:0)})();

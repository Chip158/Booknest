// B41 acceptance: sky, weather, holiday lights, phone framing and quality tiers. Usage: node /tmp/harness/test-B41.js [only]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const OUT='/tmp/harness/b41';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fail=0;const ok=(c,m,v)=>{console.log((c?'PASS ':'FAIL ')+m+(v!==undefined?' '+JSON.stringify(v).slice(0,420):''));if(!c)fail++};
const only=process.argv[2]||'';const run=k=>!only||only.split(',').includes(k);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const page=async(m,d,h,vp)=>{const ctx=await b.newContext({viewport:vp||{width:393,height:852},isMobile:!vp,hasTouch:!vp,deviceScaleFactor:vp?1:2});const p=await ctx.newPage();p.errs=[];
  p.on('pageerror',e=>p.errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',x=>{if(x.type()==='error')p.errs.push('console.error '+x.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h,m-1,d));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);p.ctx=ctx;return p};
const E=(p,f,a)=>p.evaluate(f,a);
const SHOT=`(x,z,yaw,dist,pitch)=>{const M=window.__mocha;if(M.cam().mode!=='walk')M.setCamMode('walk');M.you(x,z);if(yaw!=null)M.cam({yaw,dist,pitch,tx:x,tz:z});M.cam.tick&&M.cam.tick(80,.05);return 1}`;
// framing check: Mocha's body on the lower-third line of the free area that HUD.bands() leaves
const FRAME=()=>{const M=window.__mocha,v=M.b41vo(),h=innerHeight;const r=M.b41();return{v,h,glide:r.glide,cam:M.cam().mode}};
// ---- 1. framing, portrait, h17.2 and h21 (Nov 1)
for(const hh of [17.2,21])if(run('frame')){const p=await page(11,1,hh);const fol=await E(p,()=>{const M=window.__mocha;return{mode:M.cam().mode,IN:M.lf().IN,vo:M.b41vo()}});console.log('  follow view:',JSON.stringify(fol));
  const ps=await E(p,()=>{const M=window.__mocha;const r=M.w2&&M.w2.pose?M.w2.pose(28,58.5):null;return r});await p.waitForTimeout(3000);
  const st=await E(p,()=>{const M=window.__mocha;return{mode:M.cam().mode,IN:M.lf().IN}});console.log('  posed outdoors:',JSON.stringify(ps),JSON.stringify(st));
  let f=null;for(let i=0;i<6;i++){f=await E(p,FRAME);if(f.v&&Math.abs(f.v.ty-(f.v.y0-f.v.yt))<2)break;await p.waitForTimeout(700)}await p.waitForTimeout(1500);
  const q=await E(p,()=>{const M=window.__mocha,v=M.b41vo();const bands=M.hud().bands;return{v,bands:bands.map(b=>[b.id,b.y,b.h]),off:(()=>{try{return M.lf4dbg().camera.view?M.lf4dbg().camera.view.offsetY:0}catch(e){return null}})()}});
  ok(fol.vo&&fol.vo.room&&fol.vo.yt>fol.vo.top&&fol.vo.yt<fol.vo.bot,`h${hh}: the default follow view (his room) is framed on the free area's lower third too`,fol.vo);const v=q.v&&q.v.why==null?q.v:null;if(!v)console.log('  vo:',JSON.stringify(q.v));ok(v&&v.bot-v.top>300,`h${hh}: free area measured from HUD.bands()`,{top:v&&v.top,bot:v&&v.bot,bands:q.bands});
  // where Mocha lands now = y0 - applied offset
  const ys=v?v.y0-q.off:null,third=v?v.top+(v.bot-v.top)*2/3:null;ok(v&&Math.abs(ys-third)<(v.bot-v.top)*.06,`h${hh}: Mocha sits on the lower-third line of the free area (y ${ys} vs ${third&&third.toFixed(0)})`,{ys,third,off:q.off,v});
  ok(v&&ys>v.top&&ys<v.bot,`h${hh}: inside the free area`);
  await p.screenshot({path:`${OUT}/frame-portrait-h${hh}.png`});ok(!p.errs.length,`no page errors (frame h${hh})`,p.errs);await p.ctx.close()}
// ---- 2. weather: faked rain grows puddles; rain -> clear with the sun up gives a rainbow candidate (Nov 3, 15:00)
if(run('wx')){const p=await page(11,3,15);await E(p,`(${SHOT})(-24,0.5,Math.PI*.85,16,.6)`);await p.waitForTimeout(1500);
  const a=await E(p,()=>{const M=window.__mocha;M.weather('rain');M.puddles({wet:false});const r0=M.puddles({sim:1});const r1=M.puddles({sim:240});const r2=M.puddles({sim:400});return{r0,r1,r2}});
  ok(a.r1.W>a.r0.W&&a.r2.W>a.r1.W&&a.r2.W>=.99,'faked rain: wetness grows over ~10 min',[a.r0.W,a.r1.W,a.r2.W]);ok(a.r2.visible&&a.r2.count>=36&&a.r2.r0>0,'about 40 puddles shown, grown',a.r2);ok(a.r2.ripples===1,'ripples while raining');
  await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/puddles-portrait-h15.png`});
  const c=await E(p,()=>{const M=window.__mocha;M.weather('clear');return 1});await p.waitForTimeout(800);await E(p,()=>window.__mocha.skyEv({tick:1}));await p.waitForTimeout(800);await E(p,()=>window.__mocha.skyEv({tick:1}));
  const r=await E(p,()=>window.__mocha.skyEv());ok(r.now.includes('rainbow')&&r.events.some(e=>e.id==='rainbow'),'clear after rain with the sun up: a rainbow (now + today)',{now:r.now,ev:r.events.map(e=>e.id),rb:r.rb});
  await p.waitForTimeout(1500);await p.screenshot({path:`${OUT}/rainbow-portrait-h15.png`});
  const d=await E(p,()=>{const M=window.__mocha;const a=M.puddles({sim:600});const b=M.puddles({sim:700});return{a,b}});ok(d.b.W===0&&!d.b.visible,'puddles dry ~20 min after the rain stops',d);
  // almanac candidate on some date in the next 60 days
  const cand=await E(p,()=>{for(let i=0;i<120;i++){const t=Date.now()+i*864e5,r=window.__mocha.skyEv({t});if(r.events.some(e=>e.id==='rainbow'))return{i,key:r.key}}return null});ok(!!cand,'SKYEV.today() finds rain-to-clear rainbow days in the almanac',cand);
  ok(!p.errs.length,'no page errors (weather)',p.errs);await p.ctx.close()}
// ---- 3. Oct 31 21:00: orange and purple strands plus bats
if(run('oct')){const p=await page(10,31,21);await E(p,`(${SHOT})(30,55.6,Math.PI*.9,18,.45)`);await p.waitForTimeout(2500);
  const s=await E(p,()=>window.__mocha.strands());const all=Object.assign({},...s.strands.map(x=>x.cols));const ks=Object.keys(all);
  ok(s.theme==='halloween'&&ks.some(k=>/ff8a/.test(k))&&ks.some(k=>/9a5c|9b5d/.test(k)),'Oct 31 21:00: orange and purple strands',{theme:s.theme,cols:ks.slice(0,10),pat:s.pat});
  ok(s.bats,'bats flying',s.bats);ok(s.pat==='chase','October strands chase',s.pat);
  await p.screenshot({path:`${OUT}/oct31-portrait-h21.png`});ok(!p.errs.length,'no page errors (Oct 31)',p.errs);await p.ctx.close()}
// ---- 4. the moon phase for 2026-11-24 + SKYEV.today()
if(run('moon')){const p=await page(11,24,22);await E(p,`(${SHOT})(-52,-6,Math.PI*.62,18,.18)`);await E(p,()=>window.__mocha.weather('clear'));await p.waitForTimeout(2000);
  const t=Date.UTC(2026,10,24,12,0);const ref=(((t-Date.UTC(2000,0,6,18,14))/864e5/29.530588853)%1+1)%1;
  const r=await E(p,t=>window.__mocha.skyEv({t}),t);ok(Math.abs(r.moonFrac-ref)<1e-4,`moon phase 2026-11-24 = synodic formula (${ref.toFixed(4)}: ${r.moon})`,{got:r.moonFrac,ref});
  const n=await E(p,()=>window.__mocha.skyEv());ok(Array.isArray(n.events)&&n.events.some(e=>e.id==='fullmoon'),'SKYEV.today() lists today\'s events (full moon on Nov 24)',n.events);
  ok(Math.abs(n.moonDrawn-n.moonFrac)<.01,'the moon canvas shows today\'s phase',[n.moonDrawn,n.moonFrac]);
  const au=await E(p,()=>{const M=window.__mocha;const r=M.skyEv({aurora:1,tick:1});return r});await p.waitForTimeout(2500);const au2=await E(p,()=>window.__mocha.skyEv({}));
  ok(au.events.some(e=>e.id==='aurora')&&au2.aur>0,'forced aurora night shows the ribbon (22:00, clear)',{ev:au.events.map(e=>e.id),aur:au2.aur,now:au2.now});
  const me=await E(p,()=>window.__mocha.skyEv({meteor:1}));await p.waitForTimeout(1500);const me2=await E(p,()=>window.__mocha.skyEv({}));ok(me2.meteors>=1,'a shooting star streaks on a clear night',me2.meteors);
  await p.screenshot({path:`${OUT}/moon-aurora-portrait-h22.png`});
  const pp=await E(p,()=>window.__mocha.skyEv({}));ok(pp.now.includes('moonpath'),'moon path on the Sound on a clear full-moon night',pp.now);
  ok(!p.errs.length,'no page errors (moon)',p.errs);await p.ctx.close()}
// ---- 5. TIER from ADAPT and SET.saver; LOW: no smoke, L2 0, 20 fps; the tier in Settings
if(run('tier')){const p=await page(11,1,20);
  const a=await E(p,()=>window.__mocha.tier().b41);ok(a&&a.tier==='MED'&&a.fps===30,'touch default MED (phone), 30 fps',a);
  const l=await E(p,()=>window.__mocha.tier('low').b41);await p.waitForTimeout(1500);const l2=await E(p,()=>window.__mocha.tier().b41);
  ok(l2.tier==='LOW'&&l2.saver&&!l2.smoke&&!l2.sunbeams&&l2.l2===0&&l2.fps===20&&l2.shadows===0&&l2.pr===1,'LOW (saver): no smoke or sunbeams, L2 at 0, 20 fps, no shadows, PR 1',l2);
  await E(p,()=>window.__mocha.tier('auto'));await p.waitForTimeout(800);const ad=await E(p,()=>window.__mocha.b41adapt(2));ok(ad.tier==='LOW'&&ad.lowFromAdapt&&ad.auto,'Auto + two ADAPT drops -> LOW',ad);
  await E(p,()=>window.__mocha.openTab('set'));await p.waitForTimeout(800);const st=await E(p,()=>{const r=document.getElementById('gfxRow');return r?{txt:r.innerText.replace(/\s+/g,' ').slice(0,200),on:(r.querySelector('.on')||{}).textContent}:null});
  ok(st&&/Graphics/.test(st.txt)&&/Auto · Saver/.test(st.on),'Settings shows Graphics: Auto (the tier it picked)',st);
  await p.screenshot({path:`${OUT}/settings-portrait.png`});ok(!p.errs.length,'no page errors (tier)',p.errs);await p.ctx.close()}
// ---- 6. December: winter strands twinkle, Wendell overdoes it, the tree cascade; Mocha's own plan (S.deco)
if(run('dec')){const p=await page(12,10,18);await E(p,`(${SHOT})(26,46,Math.PI*.15,24,.5)`);await p.waitForTimeout(2000);
  const s=await E(p,()=>{const M=window.__mocha;return M.strands({deco:3})});await p.waitForTimeout(2600);const s2=await E(p,()=>window.__mocha.strands({cascade:1}));
  ok(s.theme==='winter'&&s.pat==='twinkle','December: winter theme, twinkle',{theme:s.theme,pat:s.pat});ok(s2.deco&&s2.deco.strands===3&&/^#/.test(s2.deco.col),'Mocha\'s own plan: 3 strands in his colour',s2.deco);
  ok(s2.cascade,'town-tree cascade runs',s2.cascade);const hol=s2.strands.filter(x=>x.owner==='hol').reduce((a,x)=>a+x.n,0);ok(hol>300,'holiday bulbs including Wendell\'s extra rows',hol);
  await p.screenshot({path:`${OUT}/dec10-portrait-h18.png`});ok(!p.errs.length,'no page errors (Dec)',p.errs);await p.ctx.close()}
await b.close();console.log(fail?`${fail} FAILED`:'ALL PASS');process.exit(fail?1:0)})();

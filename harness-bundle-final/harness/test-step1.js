// Step 1 feature test: toon materials, rolling-world bend, dots toggle, seasons, screenshots at several hours/views
// Usage: node test-step1.js [filter]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const filt=process.argv[2]||'';
const VIEWS={
  near:{dist:24,pitch:.6,yaw:.35},
  wide:{dist:60,pitch:.42,yaw:.35},
  low:{dist:45,pitch:.18,yaw:2.2},
  west:{dist:50,pitch:.3,yaw:-1.4},
  sky:{dist:30,pitch:.06,yaw:2.6},
  water:{dist:40,pitch:.32,yaw:1.35,act:29},
};
const SC=[
  ['d-h12-wide',12,'',{width:1100,height:820},false,'wide'],
  ['d-h12-low',12,'',{width:1100,height:820},false,'low'],
  ['d-h12-west',12,'',{width:1100,height:820},false,'west'],
  ['d-h17.2-wide',17.2,'',{width:1100,height:820},false,'wide'],
  ['d-h21-wide',21,'',{width:1100,height:820},false,'wide'],
  ['d-h12-winter',12,'#winter',{width:1100,height:820},false,'wide'],
  ['d-h10-summer',10,'#summer',{width:1100,height:820},false,'wide'],
  ['d-h20-winter',20,'#winter',{width:1100,height:820},false,'low'],
  ['d-h12-spring',12,'#spring',{width:1100,height:820},false,'low'],
  ['p-h12-wide',12,'',{width:393,height:852},true,'wide'],
  ['d-h12-water',12,'',{width:1100,height:820},false,'water'],
  ['d-h19-water',19,'',{width:1100,height:820},false,'water'],
  ['d-h23-low',23,'',{width:1100,height:820},false,'sky'],
  ['p-h21-near',21,'',{width:393,height:852},true,'near'],
];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [n,h,hash,vp,mobile,view] of SC){if(filt&&!n.includes(filt))continue;
  const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(h));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html'+hash);await p.waitForTimeout(3500);
  const r=await p.evaluate(v=>{const M=window.__mocha;if(v.act!=null){const a=M.ACTS[v.act];M.forceAct(a);const w=M.G;}const c=document.getElementById('closePanel');if(document.body.classList.contains('panelOpen')&&c)c.click();M.cam(v);if(!location.hash.includes('winter'))M.weather('clear');
    return {toon:M.post&&true}},VIEWS[view]);
  await p.waitForTimeout(6000);
  const info=await p.evaluate(()=>{const M=window.__mocha;return {gfx:M.gfx(),bend:M.BEND.value.toArray().map(x=>+x.toFixed(4)),dots:M.post.uniforms.dots.value}});
  await p.screenshot({path:`/tmp/harness/s1/${n}.png`});
  console.log(n,JSON.stringify(info),errs.length?errs:'OK');bad+=errs.length;await ctx.close()}
await b.close();process.exit(bad?1:0)})();

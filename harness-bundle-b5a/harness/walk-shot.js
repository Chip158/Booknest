const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,vp,mob] of [['walk-d',{width:1100,height:820},false],['walk-p',{width:393,height:852},true]]){
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(13));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(3500);
  await p.evaluate(()=>{const M=window.__mocha;document.getElementById('closePanel').click();M.weather('clear');M.setCamMode('walk')});await p.waitForTimeout(1500);
  const y=await p.evaluate(()=>{const M=window.__mocha;M.cam({yaw:-1.9,pitch:.12});return window.__you()});await p.waitForTimeout(6000);
  await p.screenshot({path:`/tmp/harness/s1/${n}.png`});console.log(n,JSON.stringify(y),errs);await ctx.close()}
await b.close()})();

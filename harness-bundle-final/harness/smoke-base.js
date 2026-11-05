// Usage: node /tmp/harness/smoke.js [hour=15] [extraEvalJSFile]
// Loads ghost-town/index.html in fresh contexts (desktop 1100x820, iPhone portrait 393x852, iPhone landscape 852x393)
// with a faked clock (Nov 1 2026 at the given local hour), lets it run, screenshots to /tmp/harness/out/, prints page errors.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const hour=parseFloat(process.argv[2]||'15');const extra=process.argv[3]?fs.readFileSync(process.argv[3],'utf8'):null;
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let bad=0;
for(const [n,vp,mobile] of [['desktop',{width:1100,height:820},false],['portrait',{width:393,height:852},true],['landscape',{width:852,height:393},true]]){
  const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(hour));
  await p.goto('file:///tmp/harness/backup-step1.html');await p.waitForTimeout(4500);
  if(extra){try{const r=await p.evaluate(extra);if(r!==undefined)console.log(n,'extra ->',JSON.stringify(r).slice(0,600))}catch(e){errs.push('EXTRA EVAL FAILED '+e.message)}await p.waitForTimeout(3000)}
  await p.screenshot({path:`/tmp/harness/base/${n}-h${hour}.png`});
  console.log(n,'h'+hour,errs.length?errs:'OK (no errors)');bad+=errs.length;await ctx.close()}
await b.close();process.exit(bad?1:0)})();

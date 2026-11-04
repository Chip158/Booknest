// compare draw calls per frame between backup and current file (default view)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const counter=`(()=>{window.__dc={n:0,frames:[],tris:0};for(const C of [WebGLRenderingContext,WebGL2RenderingContext]){for(const f of ['drawElements','drawArrays']){const o=C.prototype[f];C.prototype[f]=function(...a){window.__dc.n++;window.__dc.tris+=(f==='drawElements'?a[1]:a[2])/3;return o.apply(this,a)}}}
 const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{const before=window.__dc.n,tb=window.__dc.tris;cb(t);const d=window.__dc.n-before;if(d>0){window.__dc.frames.push(d);window.__dc.lt=Math.round(window.__dc.tris-tb)}})})()`;
const [DAY_M,DAY_D]=(process.env.DAY||'11-01').split('-').map(Number); // seam S0: DAY=MM-DD (default 11-01 keeps old ledgers comparable)
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const f of process.argv.slice(2)){for(const [vn,vp] of [['desktop',{width:1100,height:820}]]){
  const ctx=await b.newContext({viewport:vp});const p=await ctx.newPage();
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(12,DAY_M-1,DAY_D));await p.addInitScript(counter);
  await p.goto('file://'+f);await p.waitForTimeout(6000);const n0=await p.evaluate(()=>window.__dc.frames.length);await p.waitForTimeout(8000);
  const r=await p.evaluate(n0=>{const fr=window.__dc.frames.slice(-20);return {tris:window.__dc.lt,fps8s:((window.__dc.frames.length-n0)/8).toFixed(2),avg:Math.round(fr.reduce((a,b)=>a+b,0)/fr.length),max:Math.max(...fr)}},n0);
  console.log(f.split('/').pop(),vn,JSON.stringify(r));await ctx.close()}}
await b.close()})();

const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await b.newContext({viewport:{width:400,height:300}});const p=await ctx.newPage();
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>{const A=window.__mocha.ACTS;return (Array.isArray(A)?A:Object.values(A)).map((a,i)=>i+':'+a.p+'/'+a.s+'/'+(a.fx||'')).join(' ')});
  console.log(r);await b.close()})();

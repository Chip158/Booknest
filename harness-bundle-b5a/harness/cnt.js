const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await b.newContext({viewport:{width:400,height:300}});const p=await ctx.newPage();
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(3000);
  const r=await p.evaluate(()=>{const T=new THREE.SphereGeometry(1,10,7),a=new THREE.SphereGeometry(1,8,6),c=new THREE.SphereGeometry(1,7,5);return [T.index.count/3,a.index.count/3,c.index.count/3]});
  console.log(r);await b.close()})();

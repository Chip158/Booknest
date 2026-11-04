const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await b.newContext({viewport:{width:1100,height:820}});const p=await ctx.newPage();
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4000);
  const r=await p.evaluate(()=>{const M=window.__mocha;const by={};let tot=0,meshes=0;M.scene.traverse(o=>{if(!(o.isMesh||o.isPoints))return;let vis=true,q=o;while(q){if(!q.visible)vis=false;q=q.parent}if(!vis)return;meshes++;const g=o.geometry;const t=(g.index?g.index.count:g.attributes.position.count)/3*(o.isInstancedMesh?o.count:1);const k=g.type+(o.material&&o.material.vertexColors?'(batch)':'');by[k]=by[k]||{n:0,t:0};by[k].n++;by[k].t+=t;tot+=t});
    return {tot:Math.round(tot),meshes,by:Object.entries(by).sort((a,b)=>b[1].t-a[1].t).slice(0,14).map(([k,v])=>k+':'+v.n+':'+Math.round(v.t))}});
  console.log(JSON.stringify(r,null,1));await b.close()})();

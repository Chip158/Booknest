const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const ctx=await b.newContext({viewport:{width:800,height:600}});const p=await ctx.newPage();
  p.on('pageerror',e=>console.log('PAGEERROR '+e.message));p.on('console',m=>console.log('console',m.type(),m.text().slice(0,300)));
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(14));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(3500);
  await p.evaluate(()=>{const M=window.__mocha;M.G.x=40;M.G.z=70;M.G.mode='idle';M.G.timer=30;});await p.waitForTimeout(4000);
  const r=await p.evaluate(()=>{const M=window.__mocha,R=M.renderer;const gl=R.getContext();const out={err:gl.getError(),gfx:M.gfx()};
    // render scene directly to screen and read center pixel
    const px=new Uint8Array(4);R.setRenderTarget(null);R.render(M.scene,M.camera);gl.readPixels(400,300,1,1,gl.RGBA,gl.UNSIGNED_BYTE,px);out.direct=[...px];
    // find NaNs: objects with NaN in matrixWorld or geometry bounding sphere
    const bad=[];M.scene.traverse(o=>{if(o.matrixWorld.elements.some(Number.isNaN))bad.push('mw:'+o.type+':'+(o.name||''));if(o.geometry&&o.geometry.boundingSphere&&Number.isNaN(o.geometry.boundingSphere.radius))bad.push('bs:'+o.type)});out.bad=bad.slice(0,10);out.nbad=bad.length;
    const L=[];M.scene.traverse(o=>{if(o.isLight)L.push(o.type+':'+o.intensity.toFixed(2)+':'+o.position.toArray().map(v=>v.toFixed(1)).join(','))});out.lights=L;return out});
  console.log(JSON.stringify(r,null,1));await b.close()})();

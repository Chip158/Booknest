// Step 1 functional checks: dots toggle via settings UI, toon materials in use, shells fade in shops, house roof opaque when Mocha outside, selfie renders, labels follow bend
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fails=[];
  const ctx=await b.newContext({viewport:{width:1100,height:820}});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(14));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(3500);
  // 1) materials are toon; dots default off
  let r=await p.evaluate(()=>{const M=window.__mocha;let toon=0,lam=0,phong=0;M.scene.traverse(o=>{const ms=o.material?(Array.isArray(o.material)?o.material:[o.material]):[];ms.forEach(m=>{if(m.isMeshToonMaterial)toon++;if(m.isMeshLambertMaterial)lam++;if(m.isMeshPhongMaterial)phong++})});
    return {toon,lam,phong,dots:M.post.uniforms.dots.value,grad:!!(M.scene.children.find(o=>o.isMesh&&o.material&&o.material.isMeshToonMaterial)||{}).material?.gradientMap}});
  console.log('materials',JSON.stringify(r));if(r.lam||r.phong||!r.toon)fails.push('non-toon lit materials remain');if(r.dots!==0)fails.push('dots should default off');
  // 2) toggle dots through the settings UI
  r=await p.evaluate(async()=>{const tab=[...document.querySelectorAll('#panel [data-tab], #panel button')].find(b=>/settings|⚙/i.test(b.textContent+b.getAttribute('data-tab')));if(tab)tab.click();await new Promise(r=>setTimeout(r,400));
    const t=document.querySelector('#tab-set [data-t="dots"]');if(!t)return {found:false,tab:!!tab};t.click();await new Promise(r=>setTimeout(r,300));return {found:true,checked:t.checked,u:window.__mocha.post.uniforms.dots.value,label:t.parentElement.textContent.slice(0,60)}});
  console.log('dots toggle',JSON.stringify(r));if(!r.found||r.u!==1)fails.push('dots toggle failed');
  await p.evaluate(()=>{document.getElementById('closePanel').click();window.__mocha.cam({dist:40,pitch:.5})});await p.waitForTimeout(4000);await p.screenshot({path:'/tmp/harness/s1/f-dots-on.png'});
  r=await p.evaluate(async()=>{document.querySelector('#bookBtn')?.click();await new Promise(r=>setTimeout(r,300));const t=document.querySelector('#tab-set [data-t="dots"]');if(t){t.click()}await new Promise(r=>setTimeout(r,200));document.getElementById('closePanel').click();return {u:window.__mocha.post.uniforms.dots.value,saved:JSON.parse(localStorage.getItem('mocha-settings')||'{}').dots}});
  console.log('dots off again',JSON.stringify(r));if(r.u!==0)fails.push('dots toggle off failed');
  // 3) shop peek: Mocha at the cafe counter -> front shell fades
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct(M.ACTS[36]);M.cam({dist:22,pitch:.55})});await p.waitForTimeout(9000);
  r=await p.evaluate(()=>{const M=window.__mocha;return {mode:M.G.mode,place:M.G.act&&M.G.act.p,x:+M.G.x.toFixed(1),z:+M.G.z.toFixed(1)}});console.log('cafe',JSON.stringify(r));
  await p.screenshot({path:'/tmp/harness/s1/f-cafe.png'});
  // 4) Mocha outside -> house roof visible
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct(M.ACTS[27]);});await p.waitForTimeout(3000);
  await p.evaluate(()=>{const M=window.__mocha;M.G.x=40;M.G.z=70;M.G.mode='idle';M.G.timer=30;M.cam({dist:34,pitch:.45,yaw:.2})});await p.waitForTimeout(7000);
  await p.screenshot({path:'/tmp/harness/s1/f-house-out.png'});
  // 5) selfie renders an image
  r=await p.evaluate(async()=>{const M=window.__mocha;const n0=M.S.posts.length;M.takeSelfie('toon test','Test');await new Promise(r=>setTimeout(r,500));const ph=JSON.parse(localStorage.getItem('mocha-photos')||'{}');const id=M.S.posts[0]&&M.S.posts[0].id;return {n0,n1:M.S.posts.length,img:(ph[id]||'').slice(0,30),len:(ph[id]||'').length,url:ph[id]||''}});
  console.log('selfie',r.n0,r.n1,r.img,r.len);if(r.n1!==r.n0+1||r.len<2000)fails.push('selfie failed');
  if(r.url)fs.writeFileSync('/tmp/harness/s1/f-selfie.jpg',Buffer.from(r.url.split(',')[1],'base64'));
  // 6) labels follow the bend: home label sits near the projected bent position
  r=await p.evaluate(()=>{const el=[...document.querySelectorAll('#labels .lbl')].find(e=>e.classList.contains('home'));return el?{left:el.style.left,top:el.style.top,op:el.style.opacity}:null});console.log('home label',JSON.stringify(r));
  console.log(errs.length?errs:'no page errors');if(errs.length)fails.push('page errors');
  console.log(fails.length?'FAIL '+fails.join('; '):'PASS');await b.close();process.exit(fails.length?1:0)})();

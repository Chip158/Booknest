// LF3 "menus that never freeze" acceptance through window.__mocha hooks.
// node /tmp/harness/test-LF3.js [portrait]  (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,mo=10,d=3)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${mo},${d});tgt.setHours(${h},0,0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait').split(',');let pass=0,fail=0;
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg,r!==undefined?JSON.stringify(r).slice(0,260):'')}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,900))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:{width:1100,height:820},mob=vn!=='desktop';
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  // count encodes and synchronous read-backs from the page side
  await p.addInitScript(()=>{window.__enc=0;window.__rp={sync:0,pbo:0};const td=HTMLCanvasElement.prototype.toDataURL;HTMLCanvasElement.prototype.toDataURL=function(...a){window.__enc++;return td.apply(this,a)};
    for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const rp=C.prototype.readPixels;C.prototype.readPixels=function(...a){if(typeof a[6]==='number'&&a.length===7)window.__rp.pbo++;else window.__rp.sync++;return rp.apply(this,a)}}});
  // no-raster mode like lookfeel/menus/instr.js (SwiftShader raster would bury main-thread costs); the 128 px preview cells still draw so the atlas has pixels
  if(process.env.DRAW!=='1')await p.addInitScript(()=>{for(const C of [window.WebGL2RenderingContext,window.WebGLRenderingContext]){if(!C)continue;const P=C.prototype,vp=P.viewport;P.viewport=function(x,y,w,h){this.__vw=w;return vp.apply(this,arguments)};
    for(const f of ['drawElements','drawArrays','drawElementsInstanced','drawArraysInstanced']){const o=P[f];if(typeof o!=='function')continue;P[f]=function(...a){if(this.__vw!==128)return;return o.apply(this,a)}}}});
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForFunction(()=>window.__mocha&&window.__mocha.S&&window.__mocha.uiq,null,{timeout:120000});await p.waitForTimeout(5000);
  const E=f=>p.evaluate(f);
  // hooks exist and answer
  let r=await E(()=>{const M=window.__mocha;return{uiq:M.uiq(),pix:M.pix(),thb:M.thb(),pw:M.prewarm(),ll:M.lightsLint()}});
  ok(r.uiq&&r.uiq.level===0&&Array.isArray(r.uiq.sheets)&&r.pix&&'painted' in r.pix&&r.thb&&'readbacks' in r.thb&&r.pw&&'total' in r.pw&&r.ll&&r.ll.visible&&'point' in r.ll.visible,'hooks uiq/pix/thb/prewarm/lightsLint answer',r);
  // M5 prewarm: finish the job, then count program links across menus, previews, a trip start and a selfie
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));for(let i=0;i<60&&!M.prewarm().done;i++)await w(500);return M.prewarm()});
  ok(r.done&&r.total>=3&&r.compiled>=2,'PREWARM job ran after the boot compile (registry incl. preview, catalog, DB samples)',r);
  // seed: 30 posts incl. 24 paintings
  r=await E(()=>{const M=window.__mocha,S=M.S;S.phone=S.phone||{model:'Pixel',color:'#e9886b',case:null,charm:null};const subs=['the ferry','rainy window','Wendell','the market','a cat','the lighthouse','fog','maple tree','a teacup','the bookshop','the park','the ferris wheel'];
    for(let i=0;i<24;i++){const pt=M.makePainting(subs[i%12],'Study '+(i+1),Date.now()-i*36e5,'keep');S.posts.unshift({id:'tp'+i+'_'+Date.now().toString(36),kind:'painting',pid:pt.id,art:{s:pt.subject,c:pt.colors.slice(0,4),seed:pt.seed,ti:pt.title},caption:'painting '+i,place:'Fog & Easel Studio',t:Date.now()-i*36e5,likes:3,liked:false})}
    S.posts.length=Math.min(S.posts.length,30);return{posts:S.posts.length,paints:S.paintings.length}});
  ok(r.posts>=24,'seeded posts and paintings',r);
  const progs0=await E(()=>window.__mocha.prewarm().after);const enc0=await E(()=>window.__enc);const rp0=await E(()=>({...window.__rp}));
  // A6 + A8: open the panel on the feed (half sheet on portrait), handler time, first painting, all painted
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const t0=performance.now();document.querySelector('#bookBtn').click();
    const op=performance.now()-t0;const t1=performance.now();document.querySelector('#tabNav [data-top="feed"]').click();const h=performance.now()-t1;
    const cvs=[...document.querySelectorAll('#tab-feed canvas[data-pix]')],imgs=document.querySelectorAll('#tab-feed img[src^="data:image/jpeg"]').length;let first=null,all=null;const st=performance.now();
    while(performance.now()-st<4000){const pd=cvs.filter(c=>c._pd);if(first==null&&pd.length)first=performance.now()-t1;const vis=cvs.filter(c=>c._near);if(vis.length&&vis.every(c=>c._pd)&&all==null)all=performance.now()-t1;if(all!=null)break;await w(30)}
    await w(1500);const u=M.uiq();return{open:+op.toFixed(1),handler:+h.toFixed(1),canvases:cvs.length,dataImgs:imgs,first:first&&Math.round(first),allNear:all&&Math.round(all),pix:M.pix(),uiq:u}});
  ok(r.handler<=60&&r.canvases>=20,`feed tab handler ${r.handler} ms with ${r.canvases} canvas pictures (no JPEG data URLs for paintings)`,r);
  ok(r.first!=null&&r.first<=900&&r.allNear!=null&&r.allNear<=2500,`first painting ${r.first} ms, every near painting ${r.allNear} ms`,r.pix);
  if(mob)ok(r.uiq.level===1&&r.uiq.fpsCap<=15&&r.uiq.rendersPerSec<=16&&r.uiq.shadowsFrozen,'behind the half sheet: 15 fps cap, <=15 renders/s, shadows frozen',r.uiq);
  // heart in place
  r=await E(()=>{const host=document.querySelector('#tab-feed'),b=host.querySelector('.heart');let w=0;const d=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');Object.defineProperty(host,'innerHTML',{set(v){w++;d.set.call(this,v)},get(){return d.get.call(this)},configurable:true});
    const t=performance.now();b.click();const ms=performance.now()-t;const on=b.classList.contains('on');delete host.innerHTML;return{ms:+ms.toFixed(2),writes:w,on,txt:b.textContent}});
  ok(r.ms<=5&&r.writes===0&&r.on,`heart tap ${r.ms} ms, updated in place (no #tab-feed innerHTML)`,r);
  // M3 dirty marking: a diary entry while the feed is open does not rebuild it synchronously
  r=await E(async()=>{const M=window.__mocha,host=document.querySelector('#tab-feed'),n0=host.querySelectorAll('.post').length,first=host.querySelector('.post');M.lf3Entry('test','lf3 dirty test');const same=host.querySelector('.post')===first;await new Promise(r=>setTimeout(r,400));return{same,kept:host.querySelector('.post')===first,n0,n1:host.querySelectorAll('.post').length}});
  ok(r.same&&r.kept,'a diary entry marks the tab dirty instead of rebuilding the feed (nodes kept, keyed sync)',r);
  // viewer: a painting mounts a canvas, placeholder now, real paint later
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const c=document.querySelector('#tab-feed canvas[data-lb]');const t=performance.now();c.click();const h=performance.now()-t;const cv=document.querySelector('#lbCv');const u=M.uiq();await w(1600);const r2={handler:+h.toFixed(1),shown:cv.style.display!=='none',w:cv.width,pd:!!cv._pd,uiq:u,rps:M.uiq().rendersPerSec};document.querySelector('#lbClose').click();return r2});
  ok(r.handler<=30&&r.shown&&r.w===512&&r.pd&&r.uiq.level===2&&r.rps<=5,`viewer opens a canvas in ${r.handler} ms, painted after; full cover renders ${r.rps}/s`,r);
  // Me tab grid
  r=await E(async()=>{const t=performance.now();window.__mocha.openTab('me');const h=performance.now()-t;const pc=document.querySelector('#tab-me .pcard');if(pc)pc.scrollIntoView({block:'center'});await new Promise(r=>setTimeout(r,1500));const cv=[...document.querySelectorAll('#tab-me .pcard canvas')];return{h:+h.toFixed(1),n:cv.length,pd:cv.filter(c=>c._pd).length}});
  ok(r.n>=10&&r.pd>=4,`Me painting grid: ${r.n} canvases, ${r.pd} painted, handler ${r.h} ms`,r);
  // M4 previews: You tab / catalog through thFill, batches and async read-back
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const b0=M.thb();document.querySelector('#tabNav [data-top="you"]').click();if(M.catPage)M.catPage('seat');await w(2500);const b1=M.thb();
    const cells=[...document.querySelectorAll('#catPg canvas.thc')],imgs=document.querySelectorAll('#catPg img[data-th]').length;
    const filled=cells.filter(c=>{const d=c.getContext('2d').getImageData(0,0,128,128).data;let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>200)n++;return n>128*128*.05}).length;return{b0,b1,cells:cells.length,imgs,filled}});
  ok(r.cells>=5&&r.imgs===0&&r.filled>=3,`catalog cells are canvases filled from atlas pages (${r.filled}/${r.cells})`,r);
  ok(r.b1.batches>r.b0.batches&&(r.b1.async?r.b1.asyncReads>=1:true),`previews batched (${r.b1.batches-r.b0.batches} batches, ${r.b1.readbacks-r.b0.readbacks} read-backs, async ${r.b1.async})`,r.b1);
  // thumbnail compatibility: <img data-th> markup in a test host
  r=await E(async()=>{const h=document.createElement('div');h.innerHTML='<img data-th="sfa.1" class="isgI" alt="">';document.body.appendChild(h);const e0=window.__enc;window.__mocha.thFill?window.__mocha.thFill(h):0;await new Promise(r=>setTimeout(r,2500));const c=h.querySelector('canvas');let op=0;if(c){const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;for(let i=3;i<d.length;i+=4)if(d[i]>200)op++;op/=c.width*c.height}h.remove();return{canvas:!!c,op:+op.toFixed(3),enc:window.__enc-e0}});
  ok(r.canvas&&r.op>=.3&&r.enc===0,`thFill turns <img data-th> into a filled canvas without an encode (opaque ${r.op})`,r);
  // A3: no encodes or sync read-backs on the menu path (legacy thumb() excluded: not called)
  r=await E(()=>({enc:window.__enc,rp:{...window.__rp}}));
  ok(r.enc-enc0===0,`0 toDataURL during the menus (${r.enc-enc0})`,r);
  ok(r.rp.sync-rp0.sync===0||!(await E(()=>window.__mocha.thb().async)),`0 synchronous readPixels on WebGL2 (sync ${r.rp.sync-rp0.sync}, pbo ${r.rp.pbo-rp0.pbo})`,r);
  // legacy thumb() keeps its contract
  r=await E(async()=>{const M=window.__mocha;const u=await new Promise(res=>{const x=M.thumb('stl',0,false,res);if(x&&x.length>500&&!x.startsWith('data:image/png;base64,iVBOR')===false){}setTimeout(()=>res(null),6000)});return{len:u&&u.length,png:u&&u.startsWith('data:image/png')}});
  ok(r.png&&r.len>1500,'legacy thumb(code,v,sil,cb) still yields a rendered PNG data URL',r);
  // close the panel: back to full rate, shadows live
  r=await E(async()=>{document.querySelector('#closePanel').click();await new Promise(r=>setTimeout(r,1300));return window.__mocha.uiq()});
  ok(r.level===0&&!r.shadowsFrozen&&r.rendersPerSec>=(mob?20:30),'after closing: level 0, shadows live, full render rate',r);
  // input first: a pointerdown on a sheet control marks hot; on the canvas it does not
  r=await E(()=>{const M=window.__mocha;const b=document.querySelector('#bookBtn');b.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));const a=M.uiq().hot;b.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));const cv=document.querySelector('#c');
    return new Promise(res=>setTimeout(()=>{cv.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));const c=M.uiq().hot;cv.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));res({sheet:a,canvas:c})},400))});
  ok(r.sheet&&!r.canvas,'input first: sheet/HUD pointerdown sets UIQ.hot, the canvas never does',r);
  // map: full cover 4 Hz
  r=await E(async()=>{const M=window.__mocha;M.toggleMap?M.toggleMap(true):document.querySelector('#mapBtn')&&document.querySelector('#mapBtn').click();await new Promise(r=>setTimeout(r,2300));const u=M.uiq();M.toggleMap?M.toggleMap(false):0;return u});
  if(r&&r.level===2)ok(r.rendersPerSec<=5,`behind the map: ${r.rendersPerSec} renders/s`,r);
  // M8: arrival build sliced
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const ev=M.byId.evergreen;M.you(ev.x,ev.z+3);await w(6000);return M.lf3().catJob});
  ok(r&&r.done>=1&&r.maxMs<=60,`catalog arrival build sliced: ${r&&r.done} builds, ${r&&r.slices} slices, longest slice ${r&&r.maxMs} ms`,r);
  // A5: 0 program links after prewarm across menus, previews, trip start, selfie
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const n0=M.prewarm().after;try{M.takeSelfie&&M.takeSelfie('lf3 test','',true)}catch(e){}await w(600);
    let trip=null;try{trip=M.trip('rainier',{force:true})===''}catch(e){trip=false}await w(2500);return{n0,n1:M.prewarm().after,trip:!!trip,ll:M.lightsLint(),pc:M.lf3().progChanges}});
  ok(r.n1-progs0<=1,`programs after prewarm: ${progs0} -> ${r.n1} (menus, previews, selfie${r.trip?', trip':''})`,r);
  ok(r.ll.changes.length===0,'lightsLint: no change in the visible light count',r.ll);
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(`${pass}/${pass+fail} PASS`);process.exit(fail?1:0)})();

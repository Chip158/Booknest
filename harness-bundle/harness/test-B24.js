// B24 catalog engine acceptance: node /tmp/harness/test-B24.js  (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${h},0,0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,900))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:vn==='duo'?{width:900,height:1000}:{width:1100,height:820},mob=vn!=='desktop';
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(12));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);const E=f=>p.evaluate(f);let r;
  // 1) 150 items, exact category counts, every item/variant builds
  r=await E(()=>{const M=window.__mocha,C=M.CAT,want={seat:9,tabl:7,bed:4,stor:7,misc:6,lite:12,plnt:10,rug:6,wall:10,kit:7,elec:6,toy:10,seas:12,wpap:8,flor:6,clo:14,food:4,rec:8,seed:4};
    const sum=Object.values(C.counts).reduce((a,b)=>a+b,0),cm=Object.keys(want).filter(k=>C.counts[k]!==want[k]);let bad=[],n=0,maxV=0,ns=new Set(),codes=new Set();
    for(const it of C.items){ns.add(it.n);codes.add(it.code);if(!it.fl)bad.push('nofl:'+it.code);if(it.vars.length<2||it.vars.length>(it.tags.includes('jacket')?6:5))bad.push('vars:'+it.code);
      for(let v=0;v<it.vars.length;v++){try{const x=M.buildItem(it.code,v);n++;if(!x||!x.parts.length||!(x.verts>0))bad.push(it.code+'.'+v);maxV=Math.max(maxV,x.verts)}catch(e){bad.push(it.code+'.'+v+':'+e.message)}}}
    return{n:C.items.length,sum,cm,nv:C.nv,built:n,bad,err:C.err,maxV,uniqN:ns.size,uniqCode:codes.size,maxn:Math.max(...ns),cols:C.items[0]&&Object.keys(C.items[0]).length}});
  ok(r.n===150&&r.sum===150&&!r.cm.length&&r.uniqN===150&&r.uniqCode===150&&r.maxn===150&&!r.err.length,'CAT parses exactly 150 items; category counts match the spec and sum to 150; n and code unique',r);
  ok(r.built===r.nv&&r.nv>=420&&!r.bad.length,`buildItem works for every item and variant (${r.built} variants, max ${r.maxV} verts) and every item has a flavour line`,r);
  // 2) jackets: no hue 38..68; the parser rejects a mustard jacket row
  r=await E(()=>{const C=window.__mocha.CAT,jk=C.items.filter(i=>i.tags.includes('jacket')),hues=jk.flatMap(i=>i.vars.map(v=>[i.code,v.nm,Math.round(C.hue(v.c)),v.c2?Math.round(C.hue(v.c2)):-1]));
    const rj=C.items.find(i=>i.code==='rjk'),t=C.parse('zzz|151|Test Jacket|clo|cloth|50||jacket test|.5x.2|k=0|threads||mustard:d4a52a,gold:c9a24a,forest:2f5d3a,navy:23304f|cozy','');
    return{hues,bad:hues.filter(h=>(h[2]>=38&&h[2]<=68)||(h[3]>=38&&h[3]<=68)),rain:rj&&rj.vars.map(v=>v.nm),rej:t.rej,kept:t.items[0]&&t.items[0].vars.map(v=>v.nm)}});
  ok(!r.bad.length&&r.hues.length>=9&&String(r.rain)==='forest,harbor blue,navy,teal,plum,charcoal','no jacket variant hue falls in 38..68; the rain jacket comes in forest, harbor blue, navy, teal, plum and charcoal',r);
  ok(r.rej.length===2&&String(r.kept)==='forest,navy','the parser rejects mustard/gold jacket variants',r);
  // 3) thumbnails: dataURL, <=3 renders per frame, queue drains
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),codes=['sfa','pno','tsc','msl','frg','arc','jol','xtr','rjk','r03'],t0=M.catThumbs().total,got=[];
    const out=codes.map(c=>M.thumb(c,1,false,u=>got.push(u)));const now=M.catThumbs();await sl(4000);const after=M.catThumbs();
    return{first:out.map(u=>typeof u==='string'?u.slice(0,22):u),renderedSync:now.total-t0,thisFrame:now.thisFrame,maxPerFrame:after.maxPerFrame,queued:after.queued,cbs:got.length,allPng:got.every(u=>u.startsWith('data:image/png')),cached:after.cached,again:M.thumb('sfa',1).slice(0,22),err:after.err}});
  ok(r.first.every(u=>typeof u==='string'&&u.startsWith('data:image/png'))&&r.allPng&&r.again.startsWith('data:image/png'),'thumb() returns a dataURL (rendered, cached, or the category emoji while queued)',r);
  ok(r.renderedSync<=3&&r.thisFrame<=3&&r.maxPerFrame<=3&&r.cbs===10&&r.queued===0,`at most 3 thumbnails render per frame (${r.renderedSync} rendered in the calling frame, the rest drained from the queue)`,r);
  // 4) shop display: <=3 draws, exact-size merge, disposed 30 s after hidden beyond 60, rebuilt on return, catMem <= 6 MB after every shop
  r=await E(()=>{const M=window.__mocha,ev=M.byId.evergreen;let d=M.catDisplays({at:[ev.x,ev.z],tick:4});const s=d.shops.evergreen,dt=M.catDrawTest('evergreen');
    const L=[{code:'sfa',v:0,x:0,y:0,z:0},{code:'msl',v:1,x:1,y:0,z:0,ry:1,s:.5},{code:'rgd',v:2,x:-1,y:0,z:0}],g=M.catMerge(L),g2=M.catMerge(L,{head:1.25});
    const nv=L.reduce((a,e)=>a+M.catTpl(e.code,e.v).nv,0),gv=g.children.reduce((a,m)=>a+m.geometry.attributes.position.count,0),g2v=g2.children.reduce((a,m)=>a+m.geometry.attributes.position.count,0),dr=g2.children[0].geometry.drawRange.count,ix=g2.children[0].geometry.index.count;
    g.children.forEach(m=>m.geometry.dispose());g2.children.forEach(m=>m.geometry.dispose());
    return{s,dt,draws:g.children.length,nv,gv,g2v,dr,ix,mats:g.children.map(m=>m.material.type+(m.material.vertexColors?'+vc':'')+(m.material.userData.rim?'+rim':'')+(m.material.map?'+map':''))}});
  ok(r.s.built&&r.s.visible&&r.s.items>=12&&r.s.draws<=3&&r.dt&&r.dt.calls<=3,`Evergreen display builds within 35 with ${r.s&&r.s.items} catalog items in ${r.dt&&r.dt.calls} draw calls (<=3)`,r);
  ok(r.gv===r.nv&&r.g2v>=Math.floor(r.nv*1.25)&&r.dr<r.ix&&r.draws<=3&&r.mats.some(m=>/Toon.*vc.*rim/.test(m)),'catMerge allocates exactly the vertex count (rooms: +25% headroom with a draw range); shared vertexColors toon+rim material',r);
  r=await E(()=>{const M=window.__mocha,ev=M.byId.evergreen;M.catDisplays({at:[ev.x+55,ev.z],tick:1});const mid=M.catDisplays().shops.evergreen;M.catDisplays({at:[ev.x+70,ev.z],tick:1});const hid=M.catDisplays().shops.evergreen;
    M.catDisplays({skew:20e3,tick:1});const at20=M.catDisplays().shops.evergreen;M.catDisplays({skew:11e3,tick:1});const at31=M.catDisplays().shops.evergreen;
    M.catDisplays({at:[ev.x,ev.z],tick:2});const back=M.catDisplays().shops.evergreen;return{mid,hid,at20,at31,back}});
  ok(!r.mid.visible&&r.mid.built&&!r.hid.visible&&r.at20.built&&!r.at31.built&&r.at31.bytes===0&&r.back.built&&r.back.visible&&r.back.builds===r.hid.builds+1,'hidden beyond 50; geometry kept at 20 s, disposed after 30 s hidden beyond 60; rebuilt on return',r);
  r=await E(()=>{const M=window.__mocha,ids=Object.keys(M.catDisplays().shops);let peak=0;for(const id of ids){const q=M.byId[id];M.catDisplays({at:[q.x,q.z],tick:3});peak=Math.max(peak,M.catMem().mb)}const d=M.catDisplays({at:null});
    return{ids:ids.length,peak,mem:M.catMem(),draws:Object.values(d.shops).map(s=>s.draws),items:Object.fromEntries(Object.entries(d.shops).map(([k,v])=>[k,v.items]))}});
  ok(r.ids>=15&&r.peak<=6&&r.mem.mb<=6&&r.draws.every(x=>x<=3),`catMem() stays <= 6 MB after visiting all ${r.ids} shops (peak ${r.peak} MB) and every display is <= 3 draws`,r);
  // 5) catalog page: silhouette, seen, owned
  r=await E(()=>{const M=window.__mocha;M.catSee('ch1');M.catSee('stl');M.catOwn('ach');const pg=M.catPage('seat'),you=M.you?M.you():null,c=window.__mocha.CAT;
    const cell=document.querySelector('#catPg .catCell.own img');return{pg,img:cell&&cell.getAttribute('src').slice(0,22),chips:document.querySelectorAll('#catPg .catC').length}});
  ok(r.pg&&r.pg.cells===9&&r.pg.sil>=1&&r.pg.seen>=2&&r.pg.own>=1&&r.chips===19&&String(r.img).startsWith('data:image/png'),'the catalog page (you tab) shows silhouette, seen and owned states with thumbnails and 19 category chips',r);
  await p.waitForTimeout(1500);await p.screenshot({path:`/tmp/harness/b24/shots/test-${vn}.png`});
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(`${pass}/${pass+fail} PASS`);process.exit(fail?1:0)})();

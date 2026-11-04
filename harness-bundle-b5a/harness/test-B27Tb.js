// test-B27Tb.js: catalog re-themes + the Rainy Term wardrobe + the outfit wall (Addendum S13/S14). Drives everything through window.__mocha hooks at DAY=11-03.
// Usage (track copy): NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackT/index.html node /tmp/harness/test-B27Tb.js
const {chromium}=require('playwright');const fs=require('fs');
const FILE='file:///home/user/Booknest/ghost-town/index.html',OUT='/tmp/harness/b27t/shots/tb/test/';fs.mkdirSync(OUT,{recursive:true});
const [DM,DD]=(process.env.DAY||'11-03').split('-').map(Number);
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,fail=0;const res=[];
const ok=(name,c,info)=>{(c?pass++:fail++);res.push((c?'PASS ':'FAIL ')+name+(info!==undefined?' '+JSON.stringify(info).slice(0,420):''));console.log(res[res.length-1])};
// the 22 re-themed rows keep code, n and category (n/cat as of BASE-LF)
const N0={stl:[3,'seat'],rtb:[11,'tabl'],lsv:[9,'seat'],ach:[2,'seat'],dsk:[12,'tabl'],geo:[88,'toy'],hgc:[83,'elec'],pmt:[66,'wall'],dlp:[42,'lite'],ppl:[38,'lite'],lvl:[44,'lite'],rgc:[59,'rug'],rgb:[58,'rug'],fpq:[120,'flor'],wpp:[114,'wpap'],pth:[48,'plnt'],fsc:[32,'misc'],bkh:[125,'clo'],swt:[123,'clo'],scf:[129,'clo'],bnn:[124,'clo'],mtn:[130,'clo']};
async function page(b,vp,mob,h,init){const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(180000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});await p.addInitScript(timeAt(h,DM-1,DD));if(init)await p.addInitScript(init);
  await p.goto(FILE);await p.waitForFunction(()=>window.__mocha&&window.__mocha.S,null,{timeout:180000});await sleep(5500);await p.evaluate(()=>{window.__mocha.weather('clear')});await sleep(600);return{ctx,p,errs}}
const UI=`(()=>{const M=window.__mocha;M.lookOpen('tab');const el=document.querySelector('#yl'),r=el.getBoundingClientRect(),W=innerWidth,H=innerHeight;const small=[],out=[];
  el.querySelectorAll('button').forEach(b=>{const q=b.getBoundingClientRect();if(!q.width)return;if(q.height<43.5||q.width<43.5)small.push((b.textContent||b.getAttribute('aria-label')||'').slice(0,20)+':'+Math.round(q.width)+'x'+Math.round(q.height))});
  let ov=[];try{ov=M.hud?[]:[]}catch(e){}const bands=(()=>{try{return(window.__mocha.hudBands?window.__mocha.hudBands():[])}catch(e){return[]}})();
  const rows=[...el.querySelectorAll('.ylRow')].map(x=>x.dataset.row);const inView=r.left>=-1&&r.top>=-1&&r.right<=W+1&&r.bottom<=H+1;
  const sib=[...document.querySelectorAll('body>*')].filter(x=>x!==el&&x.id!=='ylDrag'&&getComputedStyle(x).display!=='none'&&getComputedStyle(x).visibility!=='hidden'&&x.getBoundingClientRect().width>0&&+getComputedStyle(x).zIndex>=+getComputedStyle(el).zIndex&&x.tagName!=='CANVAS');
  const hit=sib.filter(x=>{const q=x.getBoundingClientRect();return q.left<r.right&&r.left<q.right&&q.top<r.bottom&&r.top<q.bottom}).map(x=>x.id||x.className);
  M.lookClose();return{small:small.slice(0,12),nsmall:small.length,rows,inView,rect:[r.left,r.top,r.width,r.height].map(Math.round),hit}})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 // ================= portrait 393x852 at 15:30 =================
 {const {ctx,p,errs}=await page(b,{width:393,height:852},true,15.5);
  const G0=await p.evaluate(()=>{const g=window.__mocha.G;window.__mocha.freeze(true);return{act:g.act,target:g.target,mode:g.mode}});
  // ---- catalog ----
  const C=await p.evaluate(N0=>{const M=window.__mocha,CAT=M.CAT,cc={};for(const it of CAT.items)cc[it.cat]=(cc[it.cat]||0)+1;let thr=[];
    for(const it of CAT.items)for(let v=0;v<it.vars.length;v++){try{const r=M.buildItem(it.code,v);if(!r||!r.parts||!r.parts.length)thr.push(it.code+'.'+v+':empty')}catch(e){thr.push(it.code+'.'+v+':'+e.message)}}
    const rows=M.retheme(),bad=rows.filter(r=>r.missing||!N0[r.code]||r.n!==N0[r.code][0]||r.cat!==N0[r.code][1]);
    const furn=rows.filter(r=>!['clo'].includes(r.cat)&&!['rgc','rgb','fpq','wpp'].includes(r.code)).filter(r=>!(r.tags.includes('vintage')&&(r.tags.includes('study')||r.code==='dlp'))).map(r=>r.code);
    const hueOK=CAT.items.filter(it=>it.tags.includes('jacket')).every(it=>it.vars.every(v=>M.jacketOK(v.c)&&(!v.c2||M.jacketOK(v.c2))));
    return{n:CAT.items.length,cc,CATC:M.catc?M.catc():[],thr:thr.slice(0,10),nthr:thr.length,bad,furn,sig:['rck','scf','bnn'].map(c=>!!CAT.by[c]),hueOK,err:CAT.err||[]}},N0);
  ok('catalog: exactly 150 items',C.n===150,C.n);
  ok('catalog: category counts unchanged (CATC exact counts)',!C.CATC.length||C.CATC.every(([k,n])=>C.cc[k]===n),C.cc);
  ok('catalog: the 22 re-themed rows keep code, n and category',C.bad.length===0,C.bad);
  ok('catalog: re-themed furniture rows carry the vintage + study tags',C.furn.length===0,C.furn);
  ok('catalog: buildItem loops every item and variant without throwing',C.nthr===0,C.thr);
  ok('catalog: SIGIT codes rck, scf, bnn resolve',C.sig.every(Boolean),C.sig);
  ok('catalog: no jacket hue in 38-68 (rows tagged jacket)',C.hueOK);
  const TH=await p.evaluate(async()=>{const M=window.__mocha,out={};for(const c of ['stl','ach','dsk','geo','hgc','pmt','dlp','ppl','lvl','rgc','fpq','wpp','fsc','bkh']){out[c]=await new Promise(r=>{const u=M.thumb(c,0,false,x=>r(x));if(u&&u.length>500)r(u);setTimeout(()=>r(null),6000)})}
    return Object.fromEntries(Object.entries(out).map(([k,v])=>[k,v?v.length:0]))});
  ok('catalog: re-themed thumbnails regenerate (rendered PNGs)',Object.values(TH).every(v=>v>1500),TH);
  const LK=await p.evaluate(()=>{const M=window.__mocha;return M.LOOKP.jk.map(e=>[e[0],M.jacketOK(e[1])])});ok('wardrobe: every top colour clears the 38-68 hue block',LK.every(x=>x[1]),LK.filter(x=>!x[1]));
  // ---- wardrobe ----
  await p.evaluate(()=>{const M=window.__mocha;M.freeze(false);if(M.cam().mode!=='walk')M.setCamMode('walk');M.you(-5,25)});await sleep(2500);
  const W=await p.evaluate(()=>{const M=window.__mocha,R=M.renderer,o={progs:[R.info.programs.length],looks:[]};for(let i=0;i<8;i++){const r=M.rainyTerm(i);const y=M.youLook();o.looks.push({n:r.name,ok:r.ok,draws:y.draws,len:y.look.length})}
    for(let i=0;i<8;i++)M.rainyTerm(i);o.progs.push(R.info.programs.length);o.list=M.rainyTerm().map(r=>r.name);return o});
  ok('wardrobe: rainyTerm applies all 8 presets',W.looks.length===8&&W.looks.every(l=>l.ok&&l.len===19),W.looks.map(l=>l.n+':'+l.ok));
  ok('wardrobe: walker <=10 draws in every Rainy Term look',W.looks.every(l=>l.draws<=10),W.looks.map(l=>l.draws));
  ok('wardrobe: renderer.info.programs unchanged across look switches',W.progs[0]===W.progs[1],W.progs);
  const MIG=await p.evaluate(()=>{const M=window.__mocha,S=M.S,o={};const keep=S.you.look.slice(),kf=S.you.outfits.slice();
    S.you.look=[2,1,0,1,3,1,2,0,0,0,1,0];S.you.outfits=[[2,1,0,1,3,1,2,0,0,0,1,0],[1,8,5,0,5,4,8,0,1,2,0,0,2,0],null];const L12=M.youLook().look;o.l12=L12;o.f=S.you.outfits.map(x=>x&&x.length);
    S.you.look=[1,8,6,0,4,5,9,1,1,2,0,1,2,3];o.l14=M.youLook().look;S.you.look=keep;S.you.outfits=kf;return o});
  ok('wardrobe: a 12-entry look migrates (values kept, new slots 0)',MIG.l12.length===19&&MIG.l12.slice(0,12).join()==='2,1,0,1,3,1,2,0,0,0,1,0'&&MIG.l12.slice(12).every(v=>v===0),MIG.l12);
  ok('wardrobe: an owner-fix 14-entry look migrates (values kept, new slots 0)',MIG.l14.length===19&&MIG.l14.slice(0,14).join()==='1,8,6,0,4,5,9,1,1,2,0,1,2,3'&&MIG.l14.slice(14).every(v=>v===0),MIG.l14);
  // owned clothing shows on the walker
  const OWN=await p.evaluate(()=>{const M=window.__mocha,o={};M.rainyTerm(0);const k0=JSON.stringify(M.youKeys());const T=[['swt',1,12,5],['bkh',1,11,3],['scf',0,17,5],['bnn',2,11,10],['mtn',1,18,2]];
    for(const [c,v,slot,val] of T){const L=M.wearItem(c,v);o[c]=L[slot]===val}o.keys=JSON.stringify(M.youKeys())!==k0;return o});
  ok('wardrobe: owned swt, bkh, scf, bnn and mtn show on the walker (look slots + node keys)',['swt','bkh','scf','bnn','mtn'].every(k=>OWN[k])&&OWN.keys,OWN);
  // the outfit wall
  const OW0=await p.evaluate(()=>window.__mocha.outfitWall());
  ok('outfit wall: 4 stands with complete looks, merged into the shop batch (0 new draws)',OW0.built&&OW0.stands===4&&OW0.looks.length===4&&OW0.merged===1&&OW0.draws===0,{looks:OW0.looks,hats:OW0.hats,verts:OW0.verts,ms:OW0.ms});
  ok('outfit wall: stands are DISPLAY rack slots carrying their look',OW0.slots.length===4&&OW0.slots.every(s=>s.surf==='rack'),OW0.slots);
  await p.evaluate(()=>{const M=window.__mocha;M.freeze(false);if(M.cam().mode!=='walk')M.setCamMode('walk');const q=M.toWorld(M.byId.threads,0,1.2);M.you(q.x,q.z);M.cam({yaw:M.byId.threads.ry})});await sleep(5500);
  const TAP=await p.evaluate(()=>{const M=window.__mocha;const ins=M.inside();const t=M.outfitWall('tap',1);return{ins:{on:ins.on,pid:ins.pid},t,info:M.outfitWall()}});
  ok('outfit wall: tapping a stand opens its look card',TAP.t&&TAP.t.hit&&TAP.info.open&&TAP.info.card==='Seminar',TAP);
  const html=await p.evaluate(()=>window.__mocha.outfitWall('html'));ok('outfit wall: the card has both buttons and Wren\'s line',/data-a="try"/.test(html)&&/Wren|“/.test(html),html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,200));
  await p.screenshot({path:OUT+'wall-card-portrait.png'});
  const TRY=await p.evaluate(()=>{const M=window.__mocha;M.outfitWall('close');const r=M.outfitWall('try',3);const top=M.cam.state?M.cam.state():null;const st=M.cam.stack?M.cam.stack():null;return{r,on:M.rainyTerm().find(x=>x.name==='Ferry Night').on,top:M.inside().cam.owner,stack:(M.CAM&&M.CAM.stack)?M.CAM.stack().map(e=>e.owner):null}});
  await sleep(1500);await p.screenshot({path:OUT+'wall-try-portrait.png'});
  ok("outfit wall: 'Try the whole look' opens Your Look (CAM 'look' on top) with that look",TRY.r&&TRY.r.ok&&TRY.r.cam==='look'&&TRY.on,TRY);
  await p.evaluate(()=>window.__mocha.lookClose());
  const BUY=await p.evaluate(()=>{const M=window.__mocha,S=M.S,it=c=>M.CAT.by[c],has=c=>M.catHas?M.catHas('o',it(c).n):null;S.you.coins=500;const before={swt:has('swt'),scf:has('scf'),bkh:has('bkh'),stl:has('stl'),c:S.you.coins};
    const r=M.outfitWall('buy',3);const after={swt:has('swt'),scf:has('scf'),bkh:has('bkh'),stl:has('stl'),c:S.you.coins};return{before,after,r,sum:it('swt').price+it('scf').price}});
  ok("outfit wall: 'Buy pieces' buys only the look's catalog pieces",BUY.after.swt&&BUY.after.scf&&BUY.after.bkh===BUY.before.bkh&&BUY.after.stl===BUY.before.stl&&BUY.before.c-BUY.after.c===BUY.sum,BUY);
  // Your Look responsiveness: one option tap updates only its own rows, applies quietly, saves later
  const RESP=await p.evaluate(()=>{const M=window.__mocha;M.lookOpen('tab');const el=document.querySelector('#yl');const t=[];const rowEl=el.querySelector('[data-row="skin"]'),other=el.querySelector('[data-row="hs"] .ylOpts');
    let same=null;for(const sel of ['[data-k="12"][data-i="7"]','[data-k="4"][data-i="10"]','[data-k="11"][data-i="5"]','[data-k="16"][data-i="1"]','[data-k="15"][data-i="2"]','[data-rt="2"]']){if(sel.includes('rt'))same=el.querySelector('[data-row="hs"] .ylOpts')===other;const bt=el.querySelector(sel);if(!bt){t.push(sel+':missing');continue}const t0=performance.now();bt.click();t.push(+(performance.now()-t0).toFixed(1))}
    M.lookClose();return{t,same}});
  ok('Your Look: an option tap re-renders only its own row (others untouched)',RESP.same,RESP);
  ok('Your Look: tap handlers (SwiftShader, 1x CPU) measured',RESP.t.every(x=>typeof x==='number'),RESP.t);
  const U=await p.evaluate(UI);ok('Your Look (portrait): rows incl. Rainy Term + owned clothes, 44 px targets, inside the viewport, no overlap',U.rows.includes('rainy')&&U.rows.includes('owned')&&U.nsmall===0&&U.inView&&U.hit.length===0,U);
  // autonomy
  const AU=await p.evaluate(()=>{const M=window.__mocha,g=M.G,snap=()=>JSON.stringify({act:g.act,target:g.target,mode:g.mode,timer:g.timer}),a=snap();
    for(let i=0;i<8;i++)M.rainyTerm(i);for(const c of ['swt','bkh','scf','bnn','mtn'])M.wearItem(c,0);M.outfitWall('open',0);M.outfitWall('buy',0);M.outfitWall('try',4);M.lookClose();M.outfitWall('close');M.lookOpen('tab');M.lookClose();
    return{same:a===snap(),a:a.slice(0,120)}});
  ok('autonomy: G.act/G.target/G.mode/G.timer untouched by every wardrobe and wall action',AU.same,AU);
  // persistence across reload
  await p.evaluate(()=>{const M=window.__mocha;M.rainyTerm(6);try{M.save()}catch(e){}});await sleep(2200);const want=await p.evaluate(()=>window.__mocha.youLook().look.join());
  await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.S,null,{timeout:180000});await sleep(5000);
  const got=await p.evaluate(()=>({l:window.__mocha.youLook().look.join(),on:window.__mocha.rainyTerm().find(x=>x.name==='Field Notes').on}));
  ok('wardrobe: looks persist across reload',got.l===want&&got.on,{want,got});
  ok('portrait: no page errors',errs.length===0,errs.slice(0,6));await ctx.close()}
 // ================= Your Look in landscape, Duo and desktop =================
 for(const [n,vp,mob] of [['landscape',{width:852,height:393},true],['duo',{width:900,height:1000},true],['desktop',{width:1100,height:820},false]]){const {ctx,p,errs}=await page(b,vp,mob,15.5);
  const U=await p.evaluate(UI);ok(`Your Look (${n}): 44 px targets, inside the viewport, no overlap`,U.nsmall===0&&U.inView&&U.hit.length===0,U);
  if(n==='desktop'){await p.evaluate(()=>{const M=window.__mocha;M.rainyTerm(0);M.lookOpen('tab')});await sleep(1500);await p.screenshot({path:OUT+'look-sheet-desktop.png'});await p.evaluate(()=>window.__mocha.lookClose())}
  ok(`${n}: no page errors`,errs.length===0,errs.slice(0,6));await ctx.close()}
 }catch(e){ok('test harness',false,e.message)}
 await b.close();console.log(`\n${pass} passed, ${fail} failed`);fs.writeFileSync('/tmp/harness/b27t/shots/tb/test/result.txt',res.join('\n')+`\n${pass} passed, ${fail} failed\n`);process.exit(fail?1:0)})();

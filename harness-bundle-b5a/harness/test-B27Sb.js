// test-B27Sb: the dressing (Addendum S, B27Sb). Run: [NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...] node /tmp/harness/test-B27Sb.js
const {chromium}=require('playwright');const fs=require('fs');
const FILE='/home/user/Booknest/ghost-town/index.html',BASE='/tmp/harness/base-lf.html';
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fails=0,n=0;const ok=(name,c,info)=>{n++;if(!c)fails++;console.log((c?'PASS ':'FAIL ')+name+(c?'':'  '+JSON.stringify(info).slice(0,700)))};
const VP={portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],desktop:[{width:1100,height:820},false]};
async function page(b,vp,mm,dd,h){const [v,mob]=VP[vp];const ctx=await b.newContext({viewport:v,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(240000);const errs=[];
  p.on('pageerror',e=>errs.push(e.message));await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h,mm-1,dd));
  await p.goto('file://'+FILE);await p.waitForFunction(()=>window.__mocha&&window.__mocha.dress,null,{timeout:240000});await p.waitForTimeout(5000);
  await p.evaluate(()=>window.__mocha.weather&&window.__mocha.weather('clear'));await p.waitForTimeout(1000);return{ctx,p,errs}}
const fnSrc=(src,name)=>{const i=src.indexOf('function '+name+'(');if(i<0)return null;let d=0,j=src.indexOf('{',i);for(let k=j;k<src.length;k++){if(src[k]==='{')d++;else if(src[k]==='}'){d--;if(!d)return src.slice(i,k+1)}}return null};
(async()=>{
 // static: territory, autonomy, no sprites/lights, holTheme + TOWNTREE untouched, pumpkin() without hGlow
 {const src=fs.readFileSync(FILE,'utf8'),base=fs.readFileSync(BASE,'utf8');const a=src.indexOf('// ==== B27Sb main block'),e=src.indexOf('function dressInfo(');const blk=src.slice(a,src.indexOf('\n',src.indexOf('STYLE.hooks.push(m=>Object.assign(m,{dress:dressInfo'))+1);
  ok('B27Sb main block present after the B27Sa block and pbW; dressTown filled; dressCal in the holiday tick',a>src.indexOf('const pbW=')&&e>a&&/function dressTown\(\)\{DRS\.g=/.test(src)&&src.includes('if(now>=HOL.t){HOL.t=now+2000;dressCal();'),{a,e});
  ok('autonomy: no G.act/G.target/G.mode writes, startAct, goPoint or userBias terms in the dressing code',!/G\.(act|target|mode)\s*=|startAct\(|goPoint\(|ubAdd\(|userBias\(/.test(blk));
  ok('no new THREE lights, glow() or hGlow() sprites in the dressing code',!/new THREE\.(Point|Spot|Directional|Hemisphere|Ambient|RectArea)Light|hGlow\(|[^.\w]glow\(/.test(blk));
  ok('holTheme and TOWNTREE unchanged vs BASE-LF',fnSrc(src,'holTheme')===fnSrc(base,'holTheme')&&(src.match(/const TOWNTREE=[^;]*;/)||[])[0]===(base.match(/const TOWNTREE=[^;]*;/)||[])[0]);
  ok('F8: pumpkin() makes no hGlow sprite; the halloween fronts no longer call pumpkin()',!/hGlow/.test(fnSrc(src,'pumpkin'))&&!/F\.forEach\(f=>\{const q=LW\(f,f\.pk/.test(fnSrc(src,'holBuild')));
  ok('seam lines untouched (STYLE literal, Batcher addM ao line, placeCam effDist, GLOWPTS/POOLS caps, skyHooks loop)',['const STYLE={shadowHalf:0,','(geo.attributes.ao?geo.attributes.ao.getX(j):1)','const D=STYLE.effDist();','const N=512,P=new Float32Array','const N=160,tex=canvasTex(64,64','for(let i=0;i<STYLE.skyHooks.length;i++)STYLE.skyHooks[i]();'].every(k=>src.includes(k)&&base.includes(k)));
  ok('the three.js loader and the #err texts are unchanged',(src.match(/<script src="three\.min\.js"[^>]*><\/script>/)||[])[0]===(base.match(/<script src="three\.min\.js"[^>]*><\/script>/)||[])[0]&&(src.match(/id="err"[\s\S]{0,400}/)||[''])[0]===(base.match(/id="err"[\s\S]{0,400}/)||[''])[0]);}
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 // 1. Nov 3 15:30 portrait: sites, render paths, no casters, lints, collision, nav
 {const {ctx,p,errs}=await page(b,'portrait',11,3,15.5);const d=await p.evaluate(()=>window.__mocha.dress());
  ok('portrait boots with zero page errors',errs.length===0,errs);
  const S9=['porch:mocha','porch:wendell','porch:cabin','porch:pink','porch:blue','terrace:cafe','terrace:bakery','square','entrance:station','garden:cemetery','garden:park'];
  ok('dress() lists every S9 site with prop counts and render paths (DB / TB / PB / IM)',S9.every(k=>d.sites[k]&&Object.keys(d.sites[k].n).length>2&&Object.values(d.sites[k].path).every(v=>/DB|TB|PB|IM|GLOWPTS|pave/.test(v))),Object.keys(d.sites));
  ok('Nov 3 is the harvest row: stacks, gourds, hay, mums and corn at the sites; holFronts() stacks in DB',d.row==='harvest'&&['stack','gourd','hay','mums','corn'].every(k=>Object.values(d.sites).some(s=>s.n[k]>0))&&d.fronts>=10&&d.sites.fronts.n.stack>=10,{row:d.row,fronts:d.fronts});
  const L=await p.evaluate(()=>{const M=window.__mocha,g=M.scene.getObjectByName('dress');let loose=0,cast=0,im=[];g.children.forEach(o=>{if(o.isInstancedMesh)im.push(o.name);else if(o.isMesh&&!o.userData.batch)loose++;if(o.castShadow)cast++});
    let ims=0;M.scene.traverse(o=>{if(o.isInstancedMesh&&['faces','bunting','strand'].includes(o.name))ims++});return{loose,cast,im,ims,cells:g.children.filter(o=>o.userData.batch).length,mat:g.children.filter(o=>o.userData.batch).every(o=>o.material===M.PBM?.vc||o.material.vertexColors)}});
  ok('DB = batch cells only (PBM.vc, castShadow false) + exactly one face, bunting and strand IM; no loose per-prop meshes',L.loose===0&&L.cast===0&&L.ims===3&&L.cells>3&&L.mat,L);
  ok('bunting shown [Sep 22, Nov 27) and the strand is one warm-white IM with halos in the GLOWPTS pool',d.bunting.visible&&d.bunting.n>40&&d.strand.n>100&&d.strand.halos>0&&d.strand.halos<=26,{b:d.bunting,s:d.strand});
  const G=await p.evaluate(()=>{const M=window.__mocha,lf=M.lights();let jack=0,b27=0,spr=0;const g=M.scene.children.find(o=>o.isPoints&&o.geometry.getAttribute('galpha'));const from=g?null:null;M.scene.traverse(o=>{if(o.isSprite&&o.material&&o.material.color&&o.material.color.getHexString()==='ff9a40')spr++});return{lights:lf.length,spr,prog:M.programs().n}});
  ok('jack range: 40 reserved GLOWPTS slots, dark outside [Oct 17, Nov 1); 8 lantern halos; no ff9a40 sprites',d.jackRange[1]-d.jackRange[0]===39&&d.jackLit===0&&d.lantern===8&&G.spr===0,{jr:d.jackRange,lit:d.jackLit,lant:d.lantern,spr:G.spr});
  const lint=await p.evaluate(()=>({lay:window.__mocha.layoutLint(),dl:window.__mocha.dressLint(),nav:window.__mocha.dressNav()}));
  ok('layoutLint() returns []',Array.isArray(lint.lay)&&lint.lay.length===0,lint.lay);
  ok('dressLint() finds no bare 2x2 H patch inside the dressed sites',lint.dl.length===0,lint.dl);
  ok('solid props are in the walker collision set and clear of NAV edges (townsfolk routes)',d.solid>20&&lint.nav.notSolid.length===0&&lint.nav.onEdge.length===0,{solid:d.solid,nav:lint.nav});
  ok('avenue trees pushed into TB (Maple Row + station + garden path) and the litter IM carries carpets + DB leaf piles',d.avenue.n>=8&&d.litter&&d.litter.count>d.litter.base&&d.litter.cap>=d.litter.count,{av:d.avenue.n,lit:d.litter});
  ok('funding: F4 rail IM, F5 roads + walks merged, F6 skyline + Olympic cones/caps merged, F7 flat casters off',d.funding.rail&&d.funding.roads===5&&d.funding.walks>=20&&d.funding.sky>=20&&d.funding.olym>=2&&d.funding.flat>0,d.funding);
  // tap-to-go across the café terrace to the door, between the props
  const tg=await p.evaluate(async()=>{const M=window.__mocha,Y=window.__you,w=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');M.you(-30,2.5);await w(600);Y().tapGo(-30,8.2);let y;for(let i=0;i<30;i++){await w(400);y=Y();if(y&&Math.hypot(y.x+30,y.z-8.2)<1.2)break}
    const blk=M.colHit(-34.2,7.3,.3)&&M.colHit(-35.2,8.4,.3);return{y,blk}});
  ok('walker: tap-to-go reaches the café door between the terrace props; bistro set and barrel are solid',tg.blk&&(!tg.y||Math.hypot(tg.y.x+30,tg.y.z-8.2)<1.4),tg);
  const sh=await p.evaluate(()=>window.__mocha.shotMode('nope'));ok('shotMode lists the calendar views and the vignette views',['walk-square-cozy@10-20','street-homes@12-10','porch-mocha','terrace-cafe'].every(k=>sh.includes(k)),sh);
  // calendar rows and rebuilds for faked dates
  const C=await p.evaluate(()=>{const M=window.__mocha,r={},rows={};for(const iso of ['2026-07-15','2026-09-21','2026-09-22','2026-10-10','2026-10-16','2026-10-17','2026-10-20','2026-10-31','2026-11-01','2026-11-02','2026-11-03','2026-11-26','2026-11-27','2026-11-30','2026-12-01','2026-12-10'])rows[iso]=M.dressRow(iso);
    const cnt=d=>{const t={};for(const k in d.sites)for(const a in d.sites[k].n)t[a]=(t[a]||0)+d.sites[k].n[a];return t};
    for(const iso of ['2026-10-10','2026-10-20','2026-11-01','2026-11-26','2026-11-27','2026-12-10','2026-07-15']){const d=M.dressCal(iso);r[iso]={row:d.row,c:cnt(d),faces:d.faces,jack:d.jackLit,bunt:d.bunting.visible,lit:d.litter&&d.litter.count-d.litter.base}}M.dressCal();return{rows,r}});
  const R=C.r,c=k=>R[k].c;
  ok('rows follow holTheme + S2b (half-open): Jul 15 off, Sep 21 off, Sep 22 early, Oct 16 early, Oct 17 face, Oct 31 face, Nov 1-2 muertos, Nov 3-26 harvest, Nov 27-30 tidy, Dec off',C.rows['2026-07-15']==='off'&&C.rows['2026-09-21']==='off'&&C.rows['2026-09-22']==='early'&&C.rows['2026-10-16']==='early'&&C.rows['2026-10-17']==='face'&&C.rows['2026-10-31']==='face'&&C.rows['2026-11-01']==='muertos'&&C.rows['2026-11-02']==='muertos'&&C.rows['2026-11-03']==='harvest'&&C.rows['2026-11-26']==='harvest'&&C.rows['2026-11-27']==='tidy'&&C.rows['2026-11-30']==='tidy'&&C.rows['2026-12-01']==='off'&&C.rows['2026-12-10']==='off',C.rows);
  ok('Oct 10: uncarved stacks, no faces, jacks dark',c('2026-10-10').stack>10&&!c('2026-10-10').face&&R['2026-10-10'].faces===0&&R['2026-10-10'].jack===0,R['2026-10-10']);
  ok('Oct 20: faces (face IM) with jack halos lit in the GLOWPTS range',R['2026-10-20'].faces>=15&&R['2026-10-20'].jack>=15&&R['2026-10-20'].jack<=40,R['2026-10-20']);
  ok('Nov 1: uncarved stacks and mums, no hay or faces (marigolds are holBuild muertos)',c('2026-11-01').stack>10&&c('2026-11-01').mums>10&&!c('2026-11-01').hay&&R['2026-11-01'].faces===0,R['2026-11-01']);
  ok('Nov 26: harvest stacks, gourds, hay, mums and corn stalks',['stack','gourd','hay','mums','corn'].every(k=>c('2026-11-26')[k]>0),R['2026-11-26']);
  ok('Nov 27: no pumpkins, hay, mums or bunting; leaf piles stay',!c('2026-11-27').stack&&!c('2026-11-27').hay&&!c('2026-11-27').mums&&!c('2026-11-27').gourd&&!R['2026-11-27'].bunt&&c('2026-11-27').pile>5&&R['2026-11-27'].lit>0,R['2026-11-27']);
  ok('Dec 10 and Jul 15: nothing seasonal (no stacks, gourds, hay, mums, corn, piles, bunting); year-round props stay',['2026-12-10','2026-07-15'].every(k=>!c(k).stack&&!c(k).hay&&!c(k).mums&&!c(k).pile&&!R[k].bunt&&R[k].lit===0&&c(k).bench>0&&c(k).bistro>0&&c(k).fence>0),[R['2026-12-10'],R['2026-07-15']]);
  // the running session crosses Sep 22 and Nov 27 without a reload: DB rebuilds exactly once per boundary and never while the row holds
  const X=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),RD=Object.getPrototypeOf(window.Date);const setNow=iso=>{const off=new RD(iso).getTime()-RD.now();class D2 extends RD{constructor(...a){if(a.length)super(...a);else super(RD.now()+off)}static now(){return RD.now()+off}}D2.UTC=RD.UTC;D2.parse=RD.parse;window.Date=D2};
    const out=[];for(const [a,b1,b2] of [['2026-09-21T23:59:56','off','early'],['2026-11-26T23:59:56','harvest','tidy']]){setNow(a);M.holForce();await w(1500);const d0=M.dress();await w(1800);const d1=M.dress();await w(4200);const d2=M.dress();out.push({a,r0:d0.row,b0:d0.builds,r1:d1.row,b1:d1.builds,r2:d2.row,b2:d2.builds,want:[b1,b2]})}
    const last=out[out.length-1];return out});
  ok('a running session crosses Sep 22 and Nov 27: one rebuild per row change, none while the row holds',X.every(q=>q.r0===q.want[0]&&q.r2===q.want[1]&&q.b2-q.b0===1&&(q.r1===q.r0?q.b1===q.b0:true)),X);
  await ctx.close()}
 // 2. Oct 20 night: the faces and jack halos are live from the boot tick; zero ff9a40 sprites (F8); winter lights on Nov 28
 {const {ctx,p,errs}=await page(b,'portrait',10,20,20);const r=await p.evaluate(()=>{const M=window.__mocha,d=M.dress();let spr=0,hs=0;M.scene.traverse(o=>{if(o.isSprite){hs++;if(o.material.color&&o.material.color.getHexString()==='ff9a40')spr++}});return{row:d.row,faces:d.faces,jack:d.jackLit,spr,hs,theme:M.style().hol.theme}});
  ok('Oct 20 boot: halloween, face row, faces + jack halos, no jack sprites, zero errors',r.theme==='halloween'&&r.row==='face'&&r.faces>=15&&r.jack>=15&&r.spr===0&&errs.length===0,{r,errs});await ctx.close()}
 {const {ctx,p,errs}=await page(b,'landscape',11,28,18);await p.waitForTimeout(2000);const r=await p.evaluate(()=>{const M=window.__mocha,d=M.dress(),s=M.style();const t={};for(const k in d.sites)for(const a in d.sites[k].n)t[a]=(t[a]||0)+d.sites[k].n[a];return{row:d.row,t,bunt:d.bunting.visible,bulbs:s.hol.bulbs,theme:s.hol.theme}});
  ok('Nov 28 landscape boot: tidy row (no pumpkins/hay/mums/bunting, piles stay), warm-white winter bulbs, zero errors',r.row==='tidy'&&!r.t.stack&&!r.t.hay&&!r.t.mums&&!r.bunt&&r.t.pile>0&&r.theme==='winter'&&r.bulbs.every(c=>['#fff1d0','#ffc27a','#ffe2b0'].includes(c))&&errs.length===0,{r,errs});await ctx.close()}
 }catch(e){ok('fatal',false,String(e&&e.stack||e))}
 await b.close();console.log(`${n-fails}/${n} passed`);process.exit(fails?1:0)})();

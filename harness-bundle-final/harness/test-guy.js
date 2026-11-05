// Owner fix 2/2b acceptance: his walker is a guy. Default look (outfit A "Blue jacket"), 14-slot look + migration (old 12-entry looks, the old default -> the guy,
// saved outfits), outfits A/B/C offered by name, the Your Look rows (jacket colour, top, in the rain), rain = hood up + tucked fringe (nothing pokes through) +
// auto rain boots (drawing only, can be turned off), night warm cast, "he/his" in the owner's diary lines. Drives the game through window.__mocha hooks.
// node test-guy.js [file]   (tests the main file path; the track redirect points it at a copy)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=3)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const MAIN='/home/user/Booknest/ghost-town/index.html',file=process.argv[2]||MAIN;let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,600):''));if(!c)fails++};
const D=[1,8,5,0,1,3,7,1,1,2,0,0,1,0],B=[1,8,5,0,5,4,8,0,1,2,0,0,2,0],C=[1,8,6,0,4,5,9,1,1,2,0,0,0,0];
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h,ctx0)=>{const ctx=ctx0||await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file,{timeout:90000});
  await p.waitForFunction(()=>window.__mocha&&window.__mocha.youInfo,null,{timeout:90000});await p.waitForTimeout(4000);return{ctx,p,errs,E:(f,a)=>p.evaluate(f,a)}};
const walk=E=>E(async()=>{if(!document.body.classList.contains('walk'))document.querySelector('#modeBtn').click();await new Promise(r=>setTimeout(r,800));window.__mocha.youWeather('clear');return window.__mocha.youInfo()});
// helper run in the page: the walker's meshes and bounding boxes
const VJS=`window.__gv=()=>{let v=null;window.__mocha.scene.traverse(q=>{if(!v&&q.userData&&q.userData.you)v=q});return v};
window.__bb=n=>{const g=window.__gv().userData.M[n].geometry;g.computeBoundingBox();const b=g.boundingBox;return[b.min.x,b.min.y,b.min.z,b.max.x,b.max.y,b.max.z].map(x=>+x.toFixed(3))}`;
// ---------- portrait 393x852 at 15:00: defaults, palette, sheet, rain ----------
let {ctx,p,errs,E}=await open({width:393,height:852},true,15);await E(VJS);
let r=await walk(E);
ok(r.look.join()===D.join()&&r.jacketName==='Harbor Blue'&&r.jacket==='#4f6b9a'&&r.voice==='low'&&r.flannel==='off','default look is the guy: outfit A, Harbor Blue knit-cuff jacket, khakis, tan boots, backpack, voice low, flannel off',{look:r.look,jacket:r.jacketName,voice:r.voice});
ok(r.draws<=10&&r.headFrac>=.42,'the guy costs 10 draws or fewer, head >= 42% of height',{draws:r.draws,h:r.h,headFrac:r.headFrac});
r=await E(()=>{const M=window.__mocha,P=M.LOOKP;return{n:[P.sk.length,P.hc.length,P.hs.length,P.ec.length,P.jk.length,P.bt.length,P.sh.length,2,2,P.vc.length,P.fl.length,P.cap.length,P.tp.length,P.fh.length],hs:P.hs.slice(5),tp:P.tp,bt:P.bt.map(e=>e[2]),sh:P.sh.map(e=>e[2]),jkOK:P.jk.every(j=>M.jacketOK(j[1])),hb:P.jk[1][1],chest:P.hc[8]}});
ok(r.n.join()==='7,9,7,4,6,6,10,2,2,3,4,2,3,4'&&r.hs.join()==='tousled swoop,side-swept fringe'&&r.tp.join()==='rain jacket,knit-cuff jacket,zip hoodie'&&r.jkOK&&r.hb==='#4f6b9a'&&r.chest==='#553829','LOOKP grows to 14 slots (new hair styles, tops, jackets, bottoms and shoes with a shape kind); every jacket passes jacketOK',r);
r=await E(()=>{const S=window.__mocha.S;return{len:S.you.look.length,outfits:S.you.outfits.map(o=>o&&o.join()),fit3:S.you.flags.fit3}});
ok(r.len===14&&r.outfits[0]===D.join()&&r.outfits[1]===B.join()&&r.outfits[2]===C.join()&&r.fit3===1,'outfits A Blue jacket, B Hoodie, C Rainy day are offered as saved outfits (once)',r);
// Your Look sheet rows
r=await E(async()=>{const M=window.__mocha;M.lookOpen('test');await new Promise(r=>setTimeout(r,2400));const yl=document.querySelector('#yl'),rows=[...yl.querySelectorAll('.ylRow h5')].map(h=>h.textContent),
  row=t=>[...yl.querySelectorAll('.ylRow')].find(x=>x.querySelector('h5').textContent===t);
  return{rows,hair:row('hair').querySelectorAll('.ylSw').length,hs:row('hair style').querySelectorAll('.ylTx').length,top:[...row('top').querySelectorAll('.ylTx')].map(b=>b.textContent),
    boots:row('shoes').querySelectorAll('.ylSw.boot').length,shoes:row('shoes').querySelectorAll('.ylSw').length,wear:[...yl.querySelectorAll('[data-wear]')].map(b=>b.textContent),rain:row('in the rain').textContent.trim()}});
ok(['jacket colour','top','in the rain'].every(t=>r.rows.includes(t))&&!r.rows.includes('rain jacket')&&r.hair===9&&r.hs===7&&r.top.length===3&&r.boots===5&&r.shoes===10,'Your Look: jacket colour, top and in-the-rain rows; 9 hair colours, 7 styles, 10 shoes (5 boots)',r);
ok(r.wear.join()==='wear Blue jacket,wear Hoodie,wear Rainy day'&&/rain boots on/.test(r.rain),'saved outfits show their names; rain boots on by default',{wear:r.wear,rain:r.rain});
r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),g0=M.youInfo().geos;document.querySelector('#yl [data-k="12"][data-i="2"]').click();await sl(150);const a=M.youInfo();
  document.querySelector('#yl [data-wear="1"]').click();await sl(150);const bb=M.youInfo();document.querySelector('#yl [data-wear="2"]').click();await sl(150);const c=M.youInfo();document.querySelector('#yl [data-wear="0"]').click();await sl(150);const d=M.youInfo();
  return{top:a.look[12],bodySwap:a.geos.BODY!==g0.BODY,headSame:a.geos.HEAD===g0.HEAD,b:bb.look.join(),c:c.look.join(),d:d.look.join()}});
ok(r.top===2&&r.bodySwap&&r.headSame&&r.b===B.join()&&r.c===C.join()&&r.d===D.join(),'tapping zip hoodie swaps only BODY; wear Hoodie / Rainy day / Blue jacket put on B, C, A',r);
r=await E(async()=>{const M=window.__mocha,S=M.S;document.querySelector('#yl [data-rb]').click();await new Promise(r=>setTimeout(r,150));const a=[S.you.flags.rainBoots,document.querySelector('#yl [data-rb]').textContent];
  document.querySelector('#yl [data-rb]').click();await new Promise(r=>setTimeout(r,150));const b2=[S.you.flags.rainBoots,document.querySelector('#yl [data-rb]').textContent];M.lookClose();return{a,b:b2}});
ok(r.a[0]===false&&/off/.test(r.a[1])&&r.b[0]===true&&/on/.test(r.b[1]),'the in-the-rain button toggles auto rain boots off and on (S.you.flags.rainBoots)',r);
// rain: hood up, the swoop swaps to the tucked fringe, rain boots drawn (his saved shoes unchanged); with the flag off his own boots stay
r=await E(()=>{const M=window.__mocha,a=M.youWeather('rain'),K={...M.Y18.keys},L=M.youInfo().look,hb=window.__bb('HEAD'),hu=window.__bb('HOODU');M.S.you.flags.rainBoots=false;M.youDress();const K2={...M.Y18.keys};
  M.S.you.flags.rainBoots=true;M.youDress();const K3={...M.Y18.keys};const c=M.youWeather('clear');return{hood:a.hood&&a.hoodUp,K,K2,K3,shoe:L[6],hb,hu,clear:{hood:c.hood,K:{...M.Y18.keys}}}});
ok(r.hood&&r.K.HEAD==='5|0|1'&&r.K.LEGL==='tr|rb'&&r.shoe===7&&r.K2.LEGL==='tr|lb'&&r.K3.LEGL==='tr|rb','rain: hood up, tucked fringe under it, rain boots drawn while his saved shoes stay tan boots; the flag off keeps his boots',{K:r.K,K2:r.K2.LEGL,shoe:r.shoe});
ok(!r.clear.hood&&r.clear.K.HEAD==='5|0|0'&&r.clear.K.LEGL==='tr|lb','clear weather: hood down, the full swoop and his tan boots are back',r.clear);
// hood up never shows hair through it: for every hair style x top, the head's hair stays inside the round hood (top and sides)
r=await E(()=>{const M=window.__mocha,out=[];for(const hs of [0,1,2,3,4,5,6])for(const tp of [0,1,2]){M.youLook([1,8,hs,0,1,3,7,1,1,2,0,0,tp,0]);M.youWeather('rain');const h=window.__bb('HEAD'),u=window.__bb('HOODU');out.push([hs,tp,+(u[4]-h[4]).toFixed(3),+(u[3]-h[3]).toFixed(3)])}
  M.youWeather('clear');M.youLook([1,8,5,0,1,3,7,1,1,2,0,0,1,0]);return out});
const bad=r.filter(x=>(x[0]>=5)&&(x[2]<.02||x[3]<.0));ok(!bad.length,'hood up: the swoop and the side-swept fringe stay inside the hood with every top (top clearance >= .02)',{bad,all:r.filter(x=>x[0]>=5)});
ok(!errs.length,'portrait: no page errors',errs.slice(0,5));
// ---------- migration: a save holding the OLD default becomes the guy; a custom 12-entry look keeps its rain jacket; saved outfits migrate; the offer runs once ----------
await E(()=>{const S=window.__mocha.S;S.you.look=[1,2,0,0,0,0,0,1,1,0,1,0];S.you.outfits=[[2,1,1,0,2,1,2,0,0,1,0,1]];delete S.you.flags.fit3;localStorage.setItem('mocha-seattle-v1',JSON.stringify(S))});
await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.youInfo,null,{timeout:90000});await p.waitForTimeout(3000);
r=await E(()=>{const S=window.__mocha.S;return{look:S.you.look.join(),outfits:S.you.outfits.map(o=>o&&o.join())}});
ok(r.look===D.join()&&r.outfits[0]==='2,1,1,0,2,1,2,0,0,1,0,1,0,0'&&r.outfits[1]===B.join()&&r.outfits[2]===C.join(),'migrate: the old default look becomes the guy; an old 12-entry outfit gets [0,0] (rain jacket, no facial hair); empty slots get B and C',r);
await E(()=>{const S=window.__mocha.S;S.you.look=[2,1,1,0,2,1,2,0,0,1,0,1];localStorage.setItem('mocha-seattle-v1',JSON.stringify(S))});
await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.youInfo,null,{timeout:90000});await p.waitForTimeout(3000);
r=await E(()=>({look:window.__mocha.S.you.look.join(),info:window.__mocha.youInfo().look.join()}));
ok(r.look==='2,1,1,0,2,1,2,0,0,1,0,1,0,0'&&r.info===r.look,'migrate: a custom 12-entry look keeps every choice and gets the rain jacket top',r);
ok(!errs.length,'migration: no page errors',errs.slice(0,5));await ctx.close();
// ---------- 21:00: warm night cast on his material (not lavender), lantern on ----------
({ctx,p,errs,E}=await open({width:393,height:852},true,21));r=await walk(E);await p.waitForTimeout(1200);r=await E(()=>window.__mocha.youInfo());
ok(r.matColor[0]>r.matColor[2]*1.3&&r.matColor[0]>r.matColor[1]&&r.lantern,'21:00: the walker\'s material is tilted warm (r > g > b), lantern lit',{mat:r.matColor,lantern:r.lantern});
ok(!errs.length,'21:00: no page errors',errs.slice(0,5));await ctx.close();
// ---------- he/his in the owner's lines ----------
const src=fs.readFileSync(MAIN,'utf8');
ok(src.includes("so THAT'S his name!")&&!src.includes("THAT'S their name")&&src.includes('My friend texted me his name')&&src.includes('My friend told me his name')&&src.includes('(he/him), who is from Kansas City'),'characters say he/his about the owner (mailbox, texted name, talk prompt)');
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

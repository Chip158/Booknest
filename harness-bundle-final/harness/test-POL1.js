// test-POL1: exteriors toward the owner's pictures. NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=<copy> node /tmp/harness/test-POL1.js
// Boots portrait 393x852 at 15:30 and 21:00 on Nov 3 (frozen, clear), drives __mocha.pol1() over the fixed views and checks: framing maples, grey share, L50,
// draw calls vs the base-pol ledger (+5%), programs unchanged, hip roofs on the flat-roof shops, swags clear of the fountain, no page errors.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=3)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
// base-pol ledger (backup-POL1.html = base-pol, portrait 15:30 / 21:00 frozen, same views; /tmp/harness/rv-pol/ext/before-*.json)
const BASE={15.5:{'walk-square-cozy':293,'walk-square-wide':403,'street-homes':427,'street-homes-walk':460,station:159,'terrace-cafe':395,follow:542},21:{'walk-square-wide':137,'street-homes':212,follow:313}};
let fails=0;const ok=(c,m)=>{console.log((c?'PASS ':'FAIL ')+m);if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 for(const H of [15.5,21]){const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();p.setDefaultTimeout(300000);const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(H));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForFunction(()=>window.__mocha&&window.__mocha.scene,null,{timeout:300000});await p.waitForTimeout(9000);
  await p.evaluate(()=>{const M=window.__mocha;try{M.weather('clear')}catch(e){}M.freeze(true)});await p.waitForTimeout(1500);
  const info=await p.evaluate(()=>window.__mocha.pol1Info());console.log('h'+H,'info',JSON.stringify(info).slice(0,400));
  if(H===15.5){ok(info.trees>=20&&info.inTrees>=info.trees-2,`hand-placed framing trees in the tree batch (${info.inTrees}/${info.trees})`);ok(info.maples>=15,`maples ${info.maples} >= 15`);
   ok(info.roofs>=12,`hip roofs on flat-roof shops ${info.roofs} >= 12`);ok(info.walls>=16,`dressed facades ${info.walls} >= 16`);ok(info.cafeRoof&&info.cafeRoof.verts>100&&info.cafeRoof.top>2.5,`cafe roof is a hip roof ${JSON.stringify(info.cafeRoof)}`);
   ok(info.swags===10&&info.fountainClear>=5,`Lantern Square swags: ${info.swags} spans, none within 5 m of the fountain (min ${info.fountainClear})`);ok(info.sett>100,`kerb leaves baked into the sett canvas (${info.sett})`)}
  const views=H===15.5?['follow','walk-square-cozy','walk-square-wide','street-homes','street-homes-walk','station','terrace-cafe']:['follow','walk-square-wide','street-homes'];
  const r=await p.evaluate(v=>window.__mocha.pol1({views:v,wait:2500}),views);const progs=await p.evaluate(()=>window.__mocha.drawInfo().progs);
  for(const v of r.views){console.log('h'+H,JSON.stringify(v));const B=BASE[H][v.id];if(B)ok(v.draws<=Math.round(B*(v.id==='follow'?1.1:1.05)),`h${H} ${v.id}: draws ${v.draws} <= base ${B} +${v.id==='follow'?10:5}%`);
   if(H===15.5&&['walk-square-cozy','walk-square-wide','street-homes','station'].includes(v.id)){ok(v.maples>=3,`h${H} ${v.id}: ${v.maples} maples in frame >= 3`);ok(v.greyShare<=.15,`h${H} ${v.id}: grey share ${v.greyShare} <= .15`);ok(v.L50>=100&&v.L50<=150,`h${H} ${v.id}: L50 ${v.L50} in 100-150`)}}
  ok(progs===55,`h${H}: programs ${progs} (base-pol 50 + track Q's batch 4/INT4/POL2 = 55; POL1 adds none)`);ok(errs.length===0,`h${H}: no page errors ${JSON.stringify(errs.slice(0,3))}`);await ctx.close()}
 await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

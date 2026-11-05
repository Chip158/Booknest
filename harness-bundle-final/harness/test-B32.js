// B32 acceptance: the empty-house nest (fresh start), Wendell's housewarming, the NEEDS ladder -> a bed (diary first, arrangeHome without overlap),
// fallbacks (remaps), B16 lamp rule, an old save keeps its furniture with FEAT.nest on.  Run: node /tmp/harness/test-B32.js [--shots]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const FILE=process.env.MOCHA_FILE||'/home/user/Booknest/ghost-town/index.html';
const OUT='/tmp/harness/b32';fs.mkdirSync(OUT,{recursive:true});const SHOTS=process.argv.includes('--shots');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n,info!==undefined?JSON.stringify(info).slice(0,240):'')}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,1400):'')}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h=15)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+FILE);await p.waitForTimeout(4500);return{ctx,p,errs}};
const shot=async(p,name,setup)=>{if(!SHOTS)return;await p.evaluate(setup||(()=>{const M=__mocha,G=M.G,h=M.byId.home;G.x=h.x-1;G.z=h.z-.5;G.mode='idle';G.timer=1e5;G.act=null}));await p.waitForTimeout(2500);await p.screenshot({path:`${OUT}/${name}.png`})};
try{
{const {ctx,p,errs}=await open({width:393,height:852},true);
  ok('boot without errors',!errs.length,errs);
  ok('hooks: freshHome, homeItems, housewarming, capSpot',await p.evaluate(()=>['freshHome','homeItems','housewarming','capSpot'].every(k=>typeof __mocha[k]==='function')));
  // 1. fresh start
  let r=await p.evaluate(()=>{const M=__mocha;const f=M.freshHome();return{f,feat:M.FEAT.nest,bed:M.capSpot('bed'),couch:M.capSpot('couch'),table:M.capSpot('table'),lamp:M.capSpot('lamp'),has:['bed','stove','computer','couch','lamp','radio'].map(k=>M.hasItem(k).has),music:M.music(),lint:M.layoutLint('home')}});
  ok('freshHome(): FEAT.nest on, homeItems <= 3, v2fresh=1',r.feat&&r.f.n<=3&&r.f.v2fresh===1,{n:r.f.n,raw:r.f.raw});
  ok('the empty-house set shows (blanket/box/cushions/bulb) and the furnished interior is hidden',r.f.on&&r.f.nestVis&&!r.f.furnVis,r.f);
  ok('fallback spots: bed=blanket, couch=floorA/floorB, table=boxA/boxB, lamp=bulb',r.bed.s==='blanket'&&r.couch.s==='floorA'&&r.couch.pair[1]==='floorB'&&r.table.s==='boxA'&&r.lamp.s==='bulb',{bed:r.bed,couch:r.couch,table:r.table,lamp:r.lamp});
  ok('nothing owned but the radio (move-in package): hasItem bed/stove/computer/couch/lamp false, radio true',r.has.join()==='false,false,false,false,false,true'&&r.music.rad===1,r.has);
  ok('layoutLint(home) clean with the nest on',Array.isArray(r.lint)&&r.lint.length===0,r.lint);
  const coins0=await p.evaluate(()=>__mocha.S.coins);
  await p.evaluate(()=>__mocha.forceAct({p:'home',s:'couch',doing:'relaxing on the couch',tags:['cozy'],need:{fun:10}}));await p.waitForTimeout(2600);
  r=await p.evaluate(()=>({m:__mocha.music(),coins:__mocha.S.coins,act:__mocha.G.act&&{s:__mocha.G.act.s,doing:__mocha.G.act.doing}}));
  ok('the radio plays the same day (music().now from the radio, no purchase); the couch act sits on the floor cushions',r.m.now&&r.m.now.src==='radio'&&r.coins===coins0&&r.act&&r.act.s==='floorA',{now:r.m.now,act:r.act});
  await shot(p,'nest-empty-portrait');
  // 2. housewarming
  r=await p.evaluate(()=>{const M=__mocha,S=M.S,c0=(S.core||[]).length;const h=M.housewarming({force:1});return{h,core:(S.core||[]).slice(-3),c0,d:S.diary.slice(0,3).map(e=>[e.tag,e.text,e.big]),firsts:S.firsts&&S.firsts.gift,cands:M.nest.cands().map(a=>({doing:a.doing,fx:a.fx,sp:a.sp,p:a.p})),lsp:M.LIGHTSPOTS.length}});
  ok('housewarming: the armchair + lamp arrive (w:ach, w:flp), lamp lights the living room (capSpot lamp = main)',r.h.raw.includes('w:ach')&&r.h.raw.includes('w:flp')&&r.h.lamp.s==='main'&&r.h.draws>=1,{raw:r.h.raw,lamp:r.h.lamp,draws:r.h.draws});
  ok('...one couch seat (couchA) for company; Mocha keeps the floor (pair couchA/floorB)',r.h.couch.s==='couchA'&&r.h.couch.pair[1]==='floorB',r.h.couch);
  ok('...a diary first ("chair for company") and a core-memory candidate',r.d.some(x=>/chair for company/.test(x[1])&&x[2])&&r.core.some(c=>c.k==='first'&&/chair for company/.test(c.x))&&r.firsts,{d:r.d,core:r.core});
  ok('...the first hangout that evening: tea on the moving box (boxA/boxB)',r.cands.some(a=>a.fx==='hang'&&a.sp[0]==='boxA'&&a.sp[1]==='boxB'&&a.p==='home'),r.cands);
  r=await p.evaluate(()=>{const M=__mocha;const a=M.hang('tea','M',{len:20});const o=a&&{sp:a.sp,host:a.host};const c=M.hang('reading','M',{len:20});const o2=c&&{sp:c.sp};M.hangStop();return{tea:o,reading:o2}});
  ok('hangouts use the box and the cushions (tea: boxA/boxB; reading: Wendell in his armchair couchA, Mocha on floorB)',r.tea&&r.tea.sp[0]==='boxA'&&r.tea.sp[1]==='boxB'&&r.reading&&r.reading.sp[0]==='couchA'&&r.reading.sp[1]==='floorB',r);
  await shot(p,'nest-housewarming-portrait');
  // 3. three floor nights -> bed want >= .9 -> he buys a bed (diary first) -> arrangeHome places it, no overlap
  r=await p.evaluate(()=>{const M=__mocha,S=M.S,t0=Date.now();const n=[1,2,3].map(i=>M.nest.night(t0+i*864e5));const w=M.homeItems().wants.find(x=>x.nd==='bed');return{n,w}});
  ok('after 3 simulated nights the bed want is >= .9',r.w&&r.w.w>=.9,r);
  r=await p.evaluate(()=>{const M=__mocha,S=M.S;S.coins=400;const c=M.nest.cands().find(a=>a.nb);const b=M.nest.shop('evergreen');const st=M.homeItems();return{c:c&&{p:c.p,doing:c.doing},b,box:st.box,coins:S.coins,d:S.diary.slice(0,3).map(e=>[e.text,e.big]),first:S.firsts&&S.firsts.bed,core:(S.core||[]).filter(c=>c.k==='first').map(c=>c.x.slice(0,40))}});
  ok('with coins: a candidate to order it at Otis\'s desk, and he buys the bed (coins spent)',r.c&&r.c.p==='evergreen'&&r.b&&r.b.ok&&r.coins<400,r);
  ok('...diary first "Finally bought a real bed!!" + firsts.bed + core first; it arrives as a box',r.d.some(x=>/Finally bought a real bed/.test(x[0])&&x[1])&&r.first&&r.core.some(x=>/Finally bought a real bed/.test(x))&&r.box,r);
  r=await p.evaluate(()=>{const M=__mocha;M.nest.unpack();M.S.coins=900;// a couple more things to check overlaps
    for(const c of ['dsk','sfa','tlp','bks','rgd']){const w=M.S.wants;M.S.wants.push({id:'it:'+c,w:1,s:3,n:Date.now(),l:Date.now(),why:'test',c:M.CAT.by[c].price,p:'evergreen',nd:'taste'});M.nest.shop('evergreen');M.nest.unpack()}
    const st=M.homeItems(),L=st.items.filter(e=>!/:/.test(e.tok)),by=M.CAT.by,ov=[];
    const fp=e=>{const it=by[e.code],w=(e.rot&1?it.d:it.w)/2,d=(e.rot&1?it.w:it.d)/2;return[e.lx-w,e.lz-d,e.lx+w,e.lz+d]};
    for(let i=0;i<L.length;i++)for(let j=i+1;j<L.length;j++){if(L[i].room!==L[j].room)continue;const k1=by[L[i].code].cat,k2=by[L[j].code].cat;if(k1==='rug'||k2==='rug'||k1==='lite'||k2==='lite')continue;const a=fp(L[i]),b2=fp(L[j]);if(a[0]<b2[2]-.01&&a[2]>b2[0]+.01&&a[1]<b2[3]-.01&&a[3]>b2[1]+.01)ov.push([L[i].code,L[j].code])}
    const bed=L.find(e=>e.code==='lbd'||M.CAT.by[e.code].cat==='bed');return{L:L.map(e=>[e.code,e.room,e.lx,e.lz,e.rot,e.placed]),ov,bed,spot:st.spots,bedCap:M.capSpot('bed'),slots:st.slots,lint:M.layoutLint('home'),draws:st.draws,box:st.box}});
  ok('arrangeHome places the bed in the bedroom and every item without overlap (autoArrange by room)',r.bed&&r.bed.placed&&r.bed.room==='bedroom'&&r.L.every(e=>e[5])&&!r.ov.length,r);
  ok('spots resolve from homeItems: capSpot(bed)=bed at the placed bed; couch/desk spots follow the sofa/desk',r.bedCap.s==='bed'&&Math.abs(r.spot.bed[0]-r.bed.lx)<.01&&Math.abs(r.spot.couch[0]-r.L.find(e=>e[0]==='sfa')[2])<.01,{spot:r.spot,bed:r.bed});
  ok('his things render in ONE catMerge group (<= 3 draws); box gone after unpacking; lint clean',r.draws>=1&&r.draws<=3&&!r.box&&r.lint.length===0,{draws:r.draws,box:r.box,lint:r.lint});
  await shot(p,'nest-furnished-portrait');
  // 4. fallbacks are real choices
  r=await p.evaluate(()=>{const M=__mocha;M.freshHome();const R=(a,d)=>{const x=M.nest.remap(a,d);return[x.p,x.s,x.doing]};const o={
    sleep:R({p:'home',s:'bed',doing:'sleeping',fx:'sleep'}),cook:R({p:'home',s:'kitchen',doing:'cooking'}),comp:R({p:'home',s:'desk',doing:'looking things up',fx:'research'},1),cal:R({p:'home',s:'desk',doing:'checking his calendar',fx:'calendar'}),
    write:R({p:'home',s:'desk',doing:'writing'}),bath:R({p:'home',s:'bath',doing:'taking a bubble bath'}),couch:R({p:'home',s:'couch',doing:'reading on the couch'})};
    const ci=[];for(let i=0;i<30;i++){const x=M.nest.remap({p:'home',s:'kitchen',doing:'cooking'},1);ci.push(x.p)}const rec=[];for(let i=0;i<30;i++)rec.push(M.nest.remap({p:'home',s:'couch',doing:'listening to records',tags:['music']},1).p);
    o.cafe=ci.includes('cafe');o.box=ci.includes('home');o.booth=rec.includes('records');o.pain=M.nest.pain();return o});
  ok('sleep -> blanket; cooking -> cold snacks on the box; calendar -> paper calendar on the box; writing -> the box; bath unchanged; couch -> floor cushions',r.sleep[1]==='blanket'&&r.cook[1]==='boxA'&&r.cal[1]==='boxA'&&r.write[1]==='boxA'&&r.bath[1]==='bath'&&r.couch[1]==='floorA',r);
  ok('real elsewheres: the library computer, the café for supper, the listening booth at Rain City Records',r.comp[0]==='library'&&r.cafe&&r.box&&r.booth,r);
  ok('painful days are recorded for the NEEDS ladder (bed, stove, computer, couch, player)',['bed','stove','computer','couch','player'].every(k=>r.pain[k]),r.pain);
  // B16: only the bulb (+ an owned lamp) lights his rooms
  r=await p.evaluate(()=>{const M=__mocha;const L=M.LIGHTSPOTS.filter(l=>l.pid==='home');return{kinds:L.map(l=>l.kind)}});
  ok('B16 home light spots present (ceil = the bulb; lamp spots need a lamp he owns)',r.kinds.includes('ceil')||r.kinds.includes('pendant')/*INT4: B27Ta's dressed home names its ceiling light 'pendant'*/,r);
  ok('no page errors in the nest run',!errs.length,errs);
  // 5. an old save keeps its furniture with FEAT.nest on
  await p.evaluate(()=>{const S=__mocha.S;delete S.homeItems;delete S.v2fresh;delete S.nest;localStorage.setItem('mocha-seattle-v1',JSON.stringify(S));window.onbeforeunload=null});
  await p.reload();await p.waitForTimeout(4500);
  r=await p.evaluate(()=>{const M=__mocha;const st=M.homeItems();return{st,feat:M.FEAT.nest,couch:M.capSpot('couch'),bed:M.capSpot('bed'),has:['bed','stove','computer','couch','lamp','desk','tv'].map(k=>M.hasItem(k).has),lint:M.layoutLint('home')}});
  ok('old save: FEAT.nest on, homeItems = built-ins (+decor) with v2fresh=0',r.feat&&r.st.v2fresh===0&&r.st.raw.includes('b:bed')&&r.st.raw.includes('b:couch'),{raw:r.st.raw,v:r.st.v2fresh});
  ok('old save keeps its furnished house: furniture visible, no nest set, capSpot couch/bed are the real ones, every slot owned',r.st.furnVis&&!r.st.nestVis&&r.couch.s==='couch'&&r.bed.s==='bed'&&r.has.every(Boolean)&&r.lint.length===0,{furn:r.st.furnVis,nest:r.st.nestVis,couch:r.couch,bed:r.bed,has:r.has});
  await shot(p,'oldsave-portrait');
  ok('no page errors after reload',!errs.length,errs);
  await ctx.close()}
if(SHOTS){const {ctx,p}=await open({width:1100,height:820},false);await p.evaluate(()=>{const M=__mocha;M.housewarming({force:1})});await shot(p,'nest-housewarming-desktop');await ctx.close()}
}catch(e){fail++;console.log('FAIL exception',e.message)}
console.log(`\nB32: ${pass} passed, ${fail} failed`);await b.close();process.exit(fail?1:0)})();

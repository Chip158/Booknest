// B30 acceptance: wants -> saving goal -> buys on next store visit (diary + spark), dream board + simulated steps -> completion/core/keepsake,
// giveMocha (polite for a disliked item, shelf + tag for a loved one), giveTo('basil',mug) (hearts, counter display, news, once a day), no coin gifts, bias stays clamped.
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html node /tmp/harness/test-B30.js [--shots]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const OUT='/tmp/harness/b30/shots';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n,info!==undefined?JSON.stringify(info).slice(0,300):'')}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,1200):'')}};
const SHOTS=process.argv.includes('--shots');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h=15)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return{ctx,p,errs}};
try{
{const {ctx,p,errs}=await open({width:393,height:852},true);
  ok('boot without errors',!errs.length,errs);
  const st=await p.evaluate(()=>{const M=window.__mocha,S=M.S;return{wants:Array.isArray(S.wants),taste:S.taste,dreams:S.dreams,mine:Array.isArray(S.mine),gifts:S.gifts}});
  ok('fresh state has wants/taste/dreams/mine/gifts',st.wants&&st.taste&&st.taste.st&&Object.keys(st.taste.st).length===7&&st.dreams&&st.mine&&st.gifts,st);
  // ---- 1. want -> saving goal -> buys on next visit to Evergreen
  const w=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.coins=40;return M.want('it:pno',.8)});
  ok('want(it:pno,.8) gives a saving goal',w.goal&&w.goal.kind==='save'&&w.goal.key==='it:pno'&&w.goal.target===420&&w.want.p==='evergreen',w);
  const jar=await p.evaluate(()=>window.__mocha.b30.me());ok('Me tab: eyeing list + coin jar render',jar.html&&jar.eye>=1&&jar.jar,jar);
  const bias=await p.evaluate(()=>{const M=window.__mocha;return{job:M.b30.bias({fx:'job',p:'cafe',tags:[]}),acq:M.b30.bias({fx:'acquire',p:'threads',tags:[]})}});
  ok('saving goal: +1.5 paid work, -1 discretionary buys',bias.job>=1.5&&bias.acq<=-1,bias);
  const poor=await p.evaluate(()=>{const M=window.__mocha;M.b30.shop('evergreen');return M.wants()});
  ok('no coins: no buy yet',poor.wants.some(x=>x.id==='it:pno')&&!poor.mine.some(m=>m.c==='pno'),{c:poor.coins});
  const buy=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.coins=500;const sp0=(S.heart.sp||[]).length;const d0=S.diary.length;
    const act={p:'evergreen',s:null,doing:'browsing the furniture',tags:['home decor'],need:{},lines:['Looked around Evergreen.']};M.localOutcome?M.localOutcome(act,Date.now(),true):null;
    const r=M.wants();return{r,sp:S.heart.sp.slice(-3).map(x=>x[0]),d:S.diary.slice(0,4).map(e=>e.tag+': '+e.text),goal:S.goal,core:(S.core||[]).slice(-2)}});
  ok('with coins he buys it on his next visit (owned, coins spent)',buy.r.mine.some(m=>m.c==='pno')&&buy.r.coins<=80&&!buy.r.wants.some(x=>x.id==='it:pno'),{coins:buy.r.coins,mine:buy.r.mine,err:buy.r.err,last:buy.r.last});
  ok('...with a diary line and a spark, goal cleared',buy.d.some(t=>/Piano/.test(t))&&buy.sp.some(k=>k==='first'||k==='win')&&!(buy.goal&&buy.goal.kind==='save'),buy);
  // ---- exposure / appeal / taste: vintage+study items reachable
  const ap=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.interests.reading=8;S.taste.st.gothic=.9;return{desk:M.b30.appeal('dsk'),lamp:M.b30.appeal('dlp'),mug:M.b30.appeal('mug')}});
  ok('taste lands on study/gothic items (Writing Desk appeal >= .75)',ap.desk>=.75,ap);
  const ex=await p.evaluate(()=>{const M=window.__mocha;const n=M.b30.expose('thrift');M.b30.expose('thrift');return{n,w:M.wants().wants.map(w=>[w.id,w.w,w.s,w.why])}});
  ok('exposure: shop visit notices items and forms wants with a why',ex.n>=1&&ex.w.length>=1&&ex.w.every(x=>x[3]),ex);
  const dec=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.wants.push({id:'it:lvl',w:.13,s:2,n:Date.now()-9e8,l:0,why:'saw it at Lantern',c:30,p:'lantern'});const d0=S.diary.length;M.b30.night(Date.now());return{gone:!S.wants.some(w=>w.id==='it:lvl'),line:S.diary[0]&&S.diary[0].text}});
  ok('wants decay nightly; a faded want gets an honest line',dec.gone&&/phase/.test(dec.line||''),dec);
  // ---- 2. dreams
  const dr=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.dreams.a=[];S.coins=0;S.mine=S.mine.filter(m=>m.c!=='pno');return M.dream('music')});
  ok('dream(music) is active, first step save',dr.a.some(a=>a.id==='music')&&dr.step[dr.a.findIndex(a=>a.id==='music')][0]==='save',dr);
  const board=await p.evaluate(()=>window.__mocha.b30.me());ok('dream board shows the card',board.cards>=1,board);
  const db=await p.evaluate(()=>window.__mocha.b30.bias({fx:'job',p:'cafe',tags:[]}));ok('dreamBias: +1.5 for an act that advances the step (job while saving)',db>=1.5,db);
  const done=await p.evaluate(()=>{const M=window.__mocha,S=M.S,core0=(S.core||[]).length,it0=S.items.length;S.coins=500;M.b30.shop('evergreen');M.localOutcome({p:'evergreen',doing:'browsing',tags:['home decor'],need:{}},Date.now(),true);
    const steps=[M.dream().a.find(a=>a.id==='music')];for(let i=0;i<8;i++)M.b30.dreamCheck('act','home couch playing the piano music');steps.push(M.dream().a.find(a=>a.id==='music'));M.b30.dreamCheck('act','neighbor porch hanging out with wendell social hang');
    const r=M.dream();return{steps,r,core:(S.core||[]).slice(-2).map(c=>c.k+':'+c.x),items:S.items.slice(-1),party:S.dreams.party,sp:S.heart.sp.slice(-2).map(x=>x[0])}});
  ok('simulated steps complete the dream',!done.r.a.some(a=>a.id==='music')&&done.r.d.some(d=>d.id==='music'&&d.ok),done);
  ok('...with a core memory, a keepsake and a party flag',done.core.some(c=>/^dream:My dream came true/.test(c))&&done.items[0]&&/metronome/.test(done.items[0].name)&&done.party&&done.party.id==='music'&&done.sp.includes('dreamDone'),done);
  const cd=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.born=Date.now()-20*864e5;S.dreams.nt=0;S.dreams.a=[];S.interests.art=9;const r=M.b30.considerDream(Date.now());return{id:r&&r.id,d:S.diary[0].text}});
  ok('considerDream: he picks his own from his strongest interest, with the big line',cd.id&&/Not the sleeping kind/.test(cd.d),cd);
  const gu=await p.evaluate(()=>{const M=window.__mocha,S=M.S;const a=S.dreams.a[0];a.t=Date.now()-20*864e5;a.i0=9;for(const k of M.b30.DREAMS[a.id].i)S.interests[k]=-1;M.b30.night(Date.now());return{a:S.dreams.a.map(x=>x.id),d:S.diary.find(e=>/letting it go/.test(e.text))}});
  ok('giving up is honest when interests shift',gu.d&&!gu.a.length,gu);
  // ---- 3. gifts to Mocha
  const gm=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.gifts.d={};const C=Object.keys(M.SHOP?{}:{});
    // find his least- and most-liked small catalog items
    const L=['mug','lvl','frn','dlp','swf'].map(c=>[c,M.b30.appeal(c)]).sort((a,b)=>a[1]-b[1]);return L});
  const low=gm[0][0];
  const pol=await p.evaluate(c=>{const M=window.__mocha,S=M.S;S.taste.st={gothic:0,cozy:0,plant:0,retro:0,spooky:0,nautical:0,minimal:0};S.interests={};S.mine.push({c,v:0,t:1,f:'buy',w:'shelf'},{c,v:0,t:1,f:'buy',w:'shelf'});M.b30.pocket(c,0);return Object.assign(M.giveMocha(c,0),{a:M.b30.appeal(c)})},low);
  ok('giveMocha of a disliked item: polite reaction, goes in a drawer',pol.ok&&pol.r==='polite'&&pol.where==='drawer'&&/very/.test(pol.say),pol);
  const again=await p.evaluate(()=>{const M=window.__mocha;M.b30.pocket('mug',0);return M.giveMocha('mug',0)});ok('giveMocha: once per day',!again.ok&&again.why==='today',again);
  const lov=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.gifts.d={};S.mine=S.mine.filter(m=>m.c!=='frn');S.taste.st.plant=1;S.interests.plants=10;M.b30.pocket('frn',0);const r=M.giveMocha('frn',0);M.b30.tick();return{r,disp:M.b30.disp('mocha'),sp:S.gifts.sp,first:S.gifts.first}});
  ok('a loved item shows on his shelf with a tag',lov.r.ok&&(lov.r.r==='loved'||lov.r.r==='treasured')&&lov.r.where==='shelf'&&/^from /.test(lov.r.tag)&&lov.disp.built&&lov.disp.n>=1,lov);
  // ---- 4. gifts to townsfolk
  const gb=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.gifts.d={};const r0=(S.you.rel.basil||[0])[0];M.b30.pocket('mug',0);const n0=S.town.news.length;const r=M.giveTo('basil','mug',0);M.b30.tick();
    return{r,r0,r1:S.you.rel.basil[0],news:S.town.news.slice(-1)[0],disp:M.b30.disp('basil')}});
  ok('giveTo(basil,mug): hearts rise',gb.r.ok&&gb.r1>gb.r0,{r:gb.r,r0:gb.r0,r1:gb.r1});
  ok('...the mug appears on his counter',gb.disp.built&&gb.disp.parent&&gb.disp.n===1&&gb.disp.spot&&!gb.disp.spot.fb,gb.disp);
  ok('...news is pushed (Mocha may hear it)',gb.news&&/mug/.test(gb.news[2]),gb.news);
  const gb2=await p.evaluate(()=>{const M=window.__mocha;M.b30.pocket('mug',0);return M.giveTo('basil','mug',0)});ok('a second gift to Basil the same day is refused',!gb2.ok&&gb2.why==='today',gb2);
  const tr=await p.evaluate(()=>{const M=window.__mocha;M.b30.pocket('frn',0);return M.giveTo('willa','frn',0)});ok('Willa treasures a fern (+15) and puts it in the window',tr.ok&&tr.r==='treasured'&&tr.hearts===15&&tr.shown,tr);
  const coin=await p.evaluate(()=>{const M=window.__mocha;return[M.giveTo('juniper','coins',50),M.giveTo('mocha','coin',10),M.giveTo('juniper',25)]});ok('no coin gifts exist',coin.every(r=>!r.ok&&r.why==='item'),coin);
  const chips=await p.evaluate(()=>{const M=window.__mocha;return{m:M.b30.chips('mocha')}});ok("Mocha's chips keep 5 + Give under More…",chips.m.length===5&&chips.m.includes('More…'),chips);
  // ---- autonomy: bias audit still clamps, gifts never touch G.act
  const au=await p.evaluate(()=>{const M=window.__mocha;M.spy(true);M.b30.pocket('mug',0);M.S.gifts.d={};M.giveTo('juniper','mug',0);M.giveMocha('mug',0);const n=Object.assign({},M.S&&{}),r=typeof M.ubAudit==='function'?M.ubAudit():null;const s=M.spy(false);return{r:r&&{max:r.max,over:r.over,neverHit:r.neverHit},spy:s}});
  ok('bias audit still passes; gifts call no startAct/goPoint',au.r&&au.r.max<=1.2+1e-9&&!au.r.over&&!au.r.neverHit.length&&(!au.spy||!au.spy.startAct&&!au.spy.goPoint),au);
  const e2=await p.evaluate(()=>window.__mocha.wants().err);ok('no runtime errors in B30 paths',!e2&&!errs.length,{e2,errs});
  if(SHOTS){await p.evaluate(()=>{const M=window.__mocha,S=M.S;M.want('it:dsk',.7);M.want('it:rpl',.9);M.dream('reading');M.b30.me()});await p.waitForTimeout(1500);
    await p.evaluate(()=>{const el=document.querySelector('#b30me');el&&el.scrollIntoView()});await p.waitForTimeout(800);await p.screenshot({path:OUT+'/me-393.png'})}
  await ctx.close()}
if(SHOTS){const {ctx,p}=await open({width:1100,height:820},false);await p.evaluate(()=>{const M=window.__mocha;M.want('it:dsk',.7);M.want('it:rpl',.9);M.dream('reading');M.dream('music');M.b30.me()});await p.waitForTimeout(1500);
  await p.evaluate(()=>{const el=document.querySelector('#b30me');el&&el.scrollIntoView()});await p.waitForTimeout(800);await p.screenshot({path:OUT+'/me-1100.png'});await ctx.close()}
}catch(e){fail++;console.log('FAIL exception',e.message)}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

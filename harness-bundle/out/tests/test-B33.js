// B33 test: Wendell II. Traditions (seed 2 Sunday-15:00 teas -> consolidate -> declared; localChoose picks it >=90% of 50 at Sunday 15:00),
// keepsakes from bond tiers (spare key by Mocha's door, ghost mug on Wendell's shelf), Wendell's polaroid with the walker in a drop-in seat
// (survives savePhotos + reload), seasonal hangouts (Oct 20 pumpkins -> porch jack-o'-lanterns; Dec 5 no stove at Mocha's -> cookies at Wendell's),
// the Nov 14-20 birthday arc (wBday(beat); catchUp advances one beat per missed day), calendar candles.
// Usage: node /tmp/harness/test-B33.js   (track copy: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=... node ...)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,mo,d)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${mo},${d});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,900):'')}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(h,mo,d,vp)=>{const ctx=await b.newContext({viewport:vp||{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(h,mo,d));await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return{ctx,p,errs}};
try{
 // ---------- 1+2+3: Sunday Nov 8 2026, 15:00 ----------
 {const {ctx,p,errs}=await open(15,10,8);
  const T=await p.evaluate(()=>{const M=window.__mocha,o={};o.dow=new Date().getDay();M.trad('reset');o.seed=M.trad({seed:'tea',dow:0,h:15,n:2});
    if(M.consolidate)M.consolidate();M.trad('scan');o.trad=M.trad();o.due=M.tradDue();o.dueW=M.tradDue('wendell');o.plan=M.wplan().now;
    let n=0;const seen={};for(const k of M.w2.choose(50)){seen[k]=(seen[k]||0)+1;if(k==='hang:tea*')n++}o.n=n;o.seen=seen;
    // the third time: keeping it declares it
    const r=M.w2.res('tea');o.res=r;return o});
  console.log(JSON.stringify(T).slice(0,1200));
  ok('a tradition is declared from two seeded Sunday-15:00 teas',T.trad.length===1&&T.trad[0].act==='tea'&&T.trad[0].dow===0&&T.trad[0].w.includes('wendell')&&/Sunday tea with Wendell/.test(T.trad[0].nm),T.trad);
  ok('tradDue() lists it at Sunday 15:00, and tradDue("wendell") finds it',T.due.length===1&&T.dueW===T.trad[0].id,[T.due,T.dueW]);
  ok("Wendell's plan: the kettle on the porch",T.plan&&T.plan[5]==='kettle',T.plan);
  ok('localChoose picks the tradition in >=90% of 50 samples',T.n>=45,{n:T.n,seen:T.seen});
  const K=await p.evaluate(()=>{const M=window.__mocha,a={};const r=M.w2.res('tea');const act=M.hangCands()[0];
    // keep it (the 3rd time) through the real outcome path
    let kept=null;for(let i=0;i<5&&!kept;i++){const k=M.w2.keepNow();if(k.tr)kept=M.trad()[0]}const S=M.w2.S();a.kept=kept&&{kept:kept.kept,dec:kept.dec,st:kept.st,due:kept.due};a.diary=S.diary.slice(0,3).map(e=>e.text.slice(0,90));
    a.cal=(()=>{try{M.openTab&&M.openTab('cal')}catch(e){}return M.w2.cal()})();return a});
  console.log(JSON.stringify(K).slice(0,800));
  ok('keeping it the third time declares it ("is a Thing now") and it is no longer due today',K.kept&&K.kept.kept===1&&K.kept.dec===1&&K.kept.due===false&&K.diary.some(t=>/is a Thing now/.test(t)),K);
  ok('calendar shows candles and the traditions list',K.cal&&K.cal.candles>=4&&K.cal.list===1,K.cal);
  // keepsakes
  const B=await p.evaluate(()=>{const M=window.__mocha,o={};o.before=M.w2.state().m.key.vis;o.bond=M.bond('wendell',170);o.st=M.w2.keeps();const d=M.DBY.home;o.door=[d.wx,d.wz];return o});
  const km=B.st.m.key,mm=B.st.m.mug;
  ok('bond("wendell",170): friend tier, the spare key shows by Mocha\'s door',B.before===false&&B.st.tier===3&&km.vis&&Math.hypot(km.x-B.door[0],km.z-B.door[1])<3.5,{km,door:B.door,tier:B.st.tier});
  ok("...and the ghost mug on Wendell's shelf",mm.vis&&Math.hypot(mm.x-14,mm.z-40)<6&&mm.y>3,mm);
  ok('keepsake bits set (key, mug, checkers)',B.st.bits.includes('key')&&B.st.bits.includes('mug')&&B.st.bits.includes('checkers'),B.st.bits);
  // polaroid with the walker in a drop-in seat
  const P=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');await w(600);const sat=M.walkSit('home','couchC');await w(900);
    const s=M.SEATS.find(q=>q.p==='home'&&q.spot==='couchC');const ps=M.w2.pose(s.x-1.6,s.z-1.2,s.x-2.6,s.z-.4);
    const r=M.polaroid();M.savePhotos();return{sat:!!sat,r,ps,st:M.w2.state().pol}});
  console.log(JSON.stringify(P).slice(0,600));
  ok('polaroid() with the walker in the drop-in seat includes the walker',P.r&&P.r.you===true&&P.r.who.includes('you')&&P.r.who.includes('mocha')&&P.r.kept,P);
  await p.waitForTimeout(1200);await p.reload();await p.waitForTimeout(4500);
  const R=await p.evaluate(id=>{const M=window.__mocha,st=M.w2.state();return{pol:st.pol,has:!!(st.pol.find(x=>x.id===id)||{}).has,fl:st.fl,trad:M.trad().length}},P.r.id);
  ok('the polaroid survives savePhotos() and a reload (id in S.wend.pol, image in PHOTOS)',R.has&&R.pol.some(x=>x.id===P.r.id&&x.who&&x.who.includes('you')),R);
  ok('keepsake bits and the tradition survive the reload',R.fl>0&&R.trad===1,R);
  ok('no page errors (Sunday page)',errs.length===0,errs);await ctx.close()}
 // ---------- 4a: Oct 20 pumpkins ----------
 {const {ctx,p,errs}=await open(15,9,20);
  const O=await p.evaluate(()=>{const M=window.__mocha,o={};o.fits=M.w2.fits();o.res=M.w2.res('pumpkin');o.before=M.w2.state().m.jkM.vis;o.out=M.w2.outcome('pumpkin');const st=M.w2.state();o.jk=[st.m.jkM,st.m.jkW];o.glow=st.glow;o.pk=st.pk;
    // empty-house floor: with no couch/table at Mocha's, it is still possible on his floor
    const S=M.w2.S();M.FEAT.nest=true;S.homeItems={home:[]};o.resEmpty=M.w2.res('pumpkin','M');M.FEAT.nest=false;return o});
  console.log(JSON.stringify(O).slice(0,700));
  ok('Oct 20 offers pumpkin carving',O.fits.includes('pumpkin')&&O.res,O.fits);
  ok("after carving: jack-o'-lanterns on both porches (meshes + 2 halo slots)",O.before===false&&O.jk[0].vis&&O.jk[1].vis&&O.glow.every(a=>a>.5)&&Math.hypot(O.jk[0].x-40,O.jk[0].z-51.5)<4&&Math.hypot(O.jk[1].x-16,O.jk[1].z-45.3)<4,O);
  ok('pumpkin carving works on the floor of an empty house',O.resEmpty&&O.resEmpty.host==='M'&&O.resEmpty.sp[1]==='floorB',O.resEmpty);
  await p.evaluate(()=>{const M=window.__mocha;M.setCamMode('follow');M.cam&&M.cam({dist:16,pitch:.45});});await p.waitForTimeout(400);
  ok('no page errors (Oct 20)',errs.length===0,errs);await ctx.close()}
 // ---------- 4b: Dec 5, no stove at Mocha's ----------
 {const {ctx,p,errs}=await open(15,11,5);
  const D=await p.evaluate(()=>{const M=window.__mocha,o={},S=M.w2.S();M.emptyHouse(false);o.fits=M.w2.fits();o.resStove=M.w2.res('cookies');M.emptyHouse(true);o.res=M.w2.res('cookies');o.out=M.w2.outcome('cookies');M.emptyHouse(false);/* fix1: FEAT.nest is on by default since B32; set the furnished/empty house explicitly */o.co=M.w2.state().co;
    o.day=M.w2.day(Date.now()+864e5+3600e3);o.news=(S.town.news||[]).map(n=>n[2]).filter(t=>/gingerbread/.test(t));return o});
  console.log(JSON.stringify(D).slice(0,700));
  ok('Dec 5 offers cookie baking (at Mocha\'s when he has a stove)',D.fits.includes('cookies')&&D.resStove&&D.resStove.host==='M',D);
  ok("Dec 5 with no stove at Mocha's: cookies are baked at Wendell's",D.res&&D.res.host==='W'&&D.res.p==='neighbor'&&D.out&&/at his place/.test(D.out.diary),D);
  ok('the next day the keepers thank him via news',D.news.length===1,D.news);
  ok('no page errors (Dec 5)',errs.length===0,errs);await ctx.close()}
 // ---------- 5: the birthday arc ----------
 {const {ctx,p,errs}=await open(10,10,17);
  const A=await p.evaluate(()=>{const M=window.__mocha,o={},S=M.w2.S();o.b0=M.wBday(0);o.b1=M.wBday(1);o.b2=M.wBday(2);o.b3=M.wBday(3);o.b4=M.wBday(4);
    // catchUp: away since Nov 16 noon with the arc at 0 -> days 16 and 17 -> 2 beats (not 3)
    M.wBday(0);S.wend.bd.ld=0;const c1=M.catchUpSim(1);o.c1=M.wBday();M.wBday(0);S.wend.bd.ld=0;const c3=M.catchUpSim(3);o.c3=M.wBday();return o});
  console.log(JSON.stringify(A).slice(0,1400));
  ok('wBday(1): Jot lets it slip',A.b1.b===1&&A.b1.news.some(t=>/Jot/.test(t)),A.b1);
  ok('wBday(2): Juniper plans a cake',A.b2.b===2&&A.b2.news.some(t=>/Juniper/.test(t)),A.b2);
  ok('wBday(3): Mocha may make a card (a candidate, his choice)',A.b3.b===3&&A.b3.cands.length===1,A.b3);
  ok('wBday(4): the porch party beat',A.b4.b===4&&A.b4.news.some(t=>/porch party/.test(t)),A.b4);
  ok('catchUp advances one beat per missed day (1 day away -> 2 beats; 3 days away on Nov 17 -> beat 3)',A.c1.b===2&&A.c3.b===3,[A.c1,A.c3]);
  ok('no page errors (Nov 17)',errs.length===0,errs);await ctx.close()}
 {const {ctx,p,errs}=await open(16,10,20);
  const Q=await p.evaluate(()=>{const M=window.__mocha;return{fits:M.w2.fits(),plan:M.wplan().now,bd:M.wBday()}});
  ok('Nov 20: the porch party is on (Wendell on his porch, the party hangout fits)',Q.fits.includes('wparty')&&Q.plan&&Q.plan[5]==='party',Q);
  ok('no page errors (Nov 20)',errs.length===0,errs);await ctx.close()}
}catch(e){fail++;console.log('FAIL exception',e.message)}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

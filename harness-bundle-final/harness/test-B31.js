// B31 visits acceptance: node /tmp/harness/test-B31.js [portrait,desktop]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackB/index.html)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;const SH='/tmp/harness/b31/shots';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1600))}};
async function open(b,vn,hr){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:{width:1100,height:820},mob=vn!=='desktop';
  const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hr));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return{p,ctx,errs}}
const SETUP=`const M=window.__mocha,S=M.S,sl=ms=>new Promise(r=>setTimeout(r,ms)),C=M.CAT;const lite=C.items.find(i=>i.cat==='lite'),pl=C.items.find(i=>i.cat==='plnt');
  if(!S.you.home.rooms.great.it){M.cabPlace('ach',0,-3,1,0,'great');M.cabPlace(lite.code,0,-4.8,2.8,0,'great');M.cabPlace(pl.code,0,4.2,2.2,0,'great');M.cabPlace('frg',0,-5.8,-3.6,0,'great');M.cabBuild()}
  S.mem=S.mem||{};S.mem.chats=Math.max(S.mem.chats||0,35);S.metW=true;
  const run=async(n,done)=>{for(let i=0;i<n;i++){await sl(1000);if(done())return i}return -1};`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){console.log('==',vn);let {p,ctx,errs}=await open(b,vn,15);const E=(f)=>p.evaluate('(async()=>{'+SETUP+f+'})()');let r;
  if(vn==='portrait'){
  // 1) present visit: knock, door, tour names real placed items, mspot, review references a real item
  r=await E(`M.setCamMode('walk');M.you(40,73);const names=M.CAT.items.filter(i=>(S.you.home.rooms.great.it||'').split(';').some(t=>t.split('.')[0]===i.code)).map(i=>i.name.toLowerCase());
    const w0=M.visitYouWeight();M.visitYou(true,{fast:6});let door=0,inside=0;const iv=setInterval(()=>{const g=M.vyState().G;if(Math.abs(g.x-40)<1.3&&g.z>68.3&&g.z<70.3)door=1},120);await run(120,()=>{const v=M.vyState();if(Math.abs(v.G.x-40)<1.3&&v.G.z>68.3&&v.G.z<70.3)door=1;if(v.G.inCabin)inside=1;return !v.on&&v.log.length>3});clearInterval(iv);
    const v=M.vyState(),ev=v.log.map(x=>x[0]);return{w0,names,door,inside,ev,said:v.said,ms:v.mspot,rv:v.rv,diary:v.diary,ks:(()=>{const a=M.CB.A.find(a=>a.code==='ach');return a?M.cabinAct(a).story:null})()}`);
  const named=r.said.filter(s=>r.names.some(n=>s.toLowerCase().includes(n)));
  ok(r.ev.includes('knock')&&r.door&&r.inside&&named.length>=2&&r.ms==='ach.0'&&r.ev.some(e=>e==='sit:ach')&&r.rv&&r.names.some(n=>r.rv.txt.toLowerCase().includes(n))&&/Mocha's spot/.test(r.ks||''),
    `visitYou(true): knock, through the door, ${named.length} bubbles name placed items, sits at mspot ${r.ms}, review "${r.rv&&r.rv.txt.slice(0,90)}", story "${r.ks}"`,r);
  r=await E(`const R=S.you.home.rooms.great;R.it=R.it.split(';').map(t=>t.startsWith('ach.')?t.split('.').map((x,i)=>i===2?String(+x+8):x).join('.'):t).join(';');M.cabBuild();
    M.visitYou(true,{fast:5});await run(120,()=>{const v=M.vyState();return !v.on&&v.log.length>3});const v=M.vyState();return{moved:v.moved,said:v.said,chg:v.rv&&v.rv.chg,ms:v.mspot,ev:v.log.map(x=>x[0]),nm:M.CAT.by.ach.name.toLowerCase()}`);
  ok(r.moved===r.nm&&(r.chg||'').includes('moved the '+r.nm)/*INT4: B27Tb renamed 'ach' (wingback armchair -> tufted parlour chair); use the catalog name*/&&r.ms==='ach.0'&&r.ev.includes('sit:ach'),`moved item noticed next visit: "${r.chg}", same spot ${r.ms}`,r);
  // 2) out: door note, window candle until the walker enters, sometimes a mailbox gift
  r=await E(`M.setCamMode('walk');M.you(40,45);const R0=Math.random;M.visitYou(false,{fast:4});let k=0;await run(140,()=>{const v=M.vyState();if(v.ph==='wait'&&!k){k=1;Math.random=()=>.1}return !v.on&&v.log.length>2});Math.random=R0;
    await sl(1500);const a=M.vyState();M.setCamMode('walk');M.you(40,71.5);await run(20,()=>!M.vyState().cd);const b2=M.vyState();return{a:{cd:a.cd,note:a.note,candle:a.candle,mb:a.mb,mbN:a.mbN,ev:a.log.map(x=>x[0])},b:{cd:b2.cd,note:b2.note,candle:b2.candle}}`);
  ok(r.a.cd>0&&/-M/.test(r.a.note||'')&&r.a.candle&&r.a.candle.tc&&r.a.candle.tl>=.6&&r.a.mb.length>=1&&r.a.mbN>=1&&r.a.ev.includes('rocker')&&!r.b.cd&&!r.b.note,`visitYou(false): rocker, door note "${r.a.note}", candle tl ${r.a.candle&&r.a.candle.tl} until you enter (then ${r.b.cd}), mailbox "${r.a.mb[0]&&r.a.mb[0][1]}"`,r);
  // 3) napping sign: weight 0 + ubVeto, but a mailbox note still can appear
  r=await E(`S.visYou.l=0;S.visYou.wk=[];S.you.home.porch=0;const w=M.visitYouWeight(),va=M.vyCands(Date.now()),veto=M.ubVeto({fx:'visitYou'}),mb0=S.visYou.mb.length;const h=M.visitYou('note');
    await run(90,()=>S.visYou.mb.length>mb0);const v=M.vyState();S.you.home.porch=1;return{w,veto,cands:va.map(a=>a.fx),note:h.cand,mb:S.visYou.mb.slice(-1)[0],n:S.visYou.mb.length-mb0,diary:v.diary}`);
  ok(r.w===0&&r.veto===true&&!r.cands.includes('visitYou')&&r.cands.includes('visitNote')&&r.n===1&&/napping/.test(r.mb[1]),`napping sign: weight ${r.w}, ubVeto ${r.veto}, cands [${r.cands}], mailbox note "${r.mb&&r.mb[1]}"`,r);
  // 4) Wendell's first visit: Hazel's jam (placeable, g:w); guestbook + lanterns; no scores
  r=await E(`M.you(40,73);M.setCamMode('walk');M.wVisit({reset:1,present:true,fast:4,tp:true});await run(150,()=>{const w=M.wVisit('state');return !w.on&&w.log&&w.log.some(x=>x[0]==='home')});const w=M.wVisit('state');
    const pk=(S.you.pk+';'+S.you.store),src=(S.you.home.ks.split(';').find(x=>x.startsWith('hjm.'))||'');const g=M.guestbook();return{w,pk:/hjm\\.0/.test(pk),own:M.catOwn?1:0,src,g}`);
  ok(r.w.jam>0&&r.pk&&/:g:w/.test(r.src)&&r.w.said.some(s=>/Hazel/.test(s))&&r.w.item&&r.g.signers.includes('wendell'),`Wendell's first visit: comment "${r.w.said.find(s=>/\\?|!|\\./.test(s)&&!/knock|Hazel/.test(s))}", Hazel's jam in your pockets (src ${r.src})`,r);
  r=await E(`for(const k of ['luma','sol','juniper','pippin'])M.guestbook({add:k,line:'what a lovely porch'});M.guestbook('open');await sl(400);const g=M.guestbook();const shot=document.getElementById('gbk').getBoundingClientRect();return{g,shot:{t:shot.top,b:shot.bottom,h:innerHeight}}`);
  await p.screenshot({path:SH+'/'+vn+'-guestbook.png'});
  const noScore=!/\b\d+\s*(\/|out of)\s*\d+|★|\bscore|\brating|\bgrade\b|\brank/i.test(r.g.text);
  ok(r.g.signers.length>=5&&r.g.lanterns===Math.min(5,r.g.signers.length)&&r.g.open&&noScore&&r.g.lines.some(l=>l.who==='mocha')&&r.g.lines.some(l=>l.who==='wendell')&&r.shot.b<=r.shot.h,`guestbook: ${r.g.lines.length} lines, ${r.g.signers.length} signers -> ${r.g.lanterns} eave lanterns, no score anywhere`,r);
  await E(`M.guestbook('close')`);
  // 5) consignment: on Sol's wall, buy pays him, hangs via framedPainting; his biggest beat on the next visit
  r=await E(`const c=M.consign();await sl(300);const cons=M.vyCons();S.you.coins=300;const c0=S.coins;const b2=M.buyPainting(c.id);await sl(300);const hung=M.vyPaint();
    M.visitYou(true,{fast:4});await run(140,()=>{const v=M.vyState();return !v.on&&v.log.length>3});const v=M.vyState(),d=S.diary.find(e=>/THAT'S MY PAINTING/.test(e.text));return{c,cons,b:b2,paid:S.coins-c0,hung,said:v.said,core:d?{big:d.big,core:d.core}:null}`);
  ok(r.cons.includes(r.c.id)&&r.b.ok&&r.paid>=r.c.price&&r.hung.some(h=>h.id===r.c.id&&h.kids===2)&&r.said.includes("THAT'S MY PAINTING. ON YOUR WALL.")&&r.core&&r.core.big,`consign ${r.c.id} on Sol's wall -> bought for ${r.c.price} (Mocha +${r.paid}), hung (framedPainting), "THAT'S MY PAINTING. ON YOUR WALL." core memory`,r);
  await E(`M.setCamMode('walk');M.you(40,72.5);M.cabCut&&M.cabCut(true);await sl(1500)`);await p.screenshot({path:SH+'/'+vn+'-inside.png'});
  ok(!errs.length,'no page errors',errs);await ctx.close();
  // 6) fire pit at 19:00
  ({p,ctx,errs}=await open(b,vn,19));
  r=await p.evaluate('(async()=>{'+SETUP+`M.setCamMode('walk');M.you(36,66);const o=M.firePitEvening({mocha:true,sc:.4});await run(150,()=>{const f=M.firePitEvening('state');return f.who.w&&f.log.some(x=>/perfect/.test(x[0]))&&f.log.some(x=>/^w:/.test(x[0]))});const f=M.firePitEvening('state');
    M.firePitEvening({end:1});await run(20,()=>M.firePitEvening('state').done);const fe=M.firePitEvening('state'),dia=S.diary.slice(0,4).map(e=>e.text);
    const a={fx:'visitYou',tags:['people','cozy']},why=[];S.mem.hangAsk={t:Date.now()};const all=M.userBias?M.userBias(a,{at:Date.now(),h:19},why):null;return{o,f,all:all&&all.total!=null?all.total:all,why,done:fe.done,dia}})()`);
  const L=r.f.log.map(x=>x[0]);
  ok(r.o.lit&&r.o.w&&r.f.who.w&&r.f.who.m&&L.includes('toast')&&L.includes('fire')&&L.some(x=>/perfect\. I mean it/.test(x))&&L.some(x=>/^w:/.test(x))&&r.done&&r.o.ub.firePit>0&&r.o.ub.firePit<=.5&&r.o.ub.total<=1.2&&(r.all==null||r.all<=1.2),
    `fire pit 19:00: Wendell came (seeded), beats [${L.slice(0,8).join(' | ')}], firePit +${r.o.ub.firePit}, userBias total ${r.o.ub.total} (all terms ${r.all})`,r);
  await p.screenshot({path:SH+'/'+vn+'-firepit.png'});
  }else{
    r=await E(`M.guestbook({add:'mocha',line:'very cabin-core! favorite thing here: the rocker 💛'});M.guestbook({add:'wendell',line:'Hazel would like your curtains. -W'});M.guestbook('open');await sl(400);const g=M.guestbook();const q=document.getElementById('gbk').getBoundingClientRect();return{g,q:{l:q.left,r:q.right,b:q.bottom,w:innerWidth,h:innerHeight}}`);
    await p.screenshot({path:SH+'/'+vn+'-guestbook.png'});ok(r.g.open&&r.g.lanterns===2&&r.q.r<=r.q.w&&r.q.b<=r.q.h,`guestbook card fits (${vn}), lanterns ${r.g.lanterns}`,r);
  }
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(fail?`FAILED ${fail} (passed ${pass})`:`ALL PASS (${pass})`);process.exit(fail?1:0)})();

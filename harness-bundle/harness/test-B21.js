// B21 Sound B acceptance: node /tmp/harness/test-B21.js [shots]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const FILE=process.env.MOCHA_FILE||'/home/user/Booknest/ghost-town/index.html';const SHOTS=process.argv[2]==='shots';
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const spies=()=>{window.__iv=new Set();const si=window.setInterval,ci=window.clearInterval;window.setInterval=function(...a){const h=si.apply(this,a);window.__iv.add(h);return h};window.clearInterval=function(h){window.__iv.delete(h);return ci.call(this,h)};
  window.__hide=on=>{Object.defineProperty(document,'hidden',{get:()=>on,configurable:true});Object.defineProperty(document,'visibilityState',{get:()=>on?'hidden':'visible',configurable:true});document.dispatchEvent(new Event('visibilitychange'))}};
let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,420):''));if(!c)fails++};
async function open(b,vp,mobile,h=15){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.addInitScript(spies);
  await p.goto('file://'+FILE);await p.waitForTimeout(4500);return{ctx,p,errs}}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
  const {ctx,p,errs}=await open(b,{width:393,height:852},true);
  // 2. fresh start: the move-in package holds the radio; within one activity change at home his pick comes from the radio, zero purchases
  let r=await p.evaluate(()=>({m:__mocha.music(),coins:__mocha.S.coins,ctx:__mocha.audio().ctx}));
  ok(r.m.rad===1&&r.m.hasRadio&&r.m.pkg,'fresh start: the move-in package holds the radio; hasItem(radio)',{rad:r.m.rad,has:r.m.hasRadio,pkg:r.m.pkg});ok(!r.ctx,'no AudioContext before a gesture');const coins0=r.coins;
  await p.evaluate(()=>__mocha.forceAct({p:'home',s:'couch',doing:'relaxing on the couch',tags:['cozy'],need:{fun:10}}));await p.waitForTimeout(2600);
  r=await p.evaluate(()=>({m:__mocha.music(),coins:__mocha.S.coins,act:__mocha.G.act&&__mocha.G.act.doing}));
  ok(r.m.now&&r.m.now.src==='radio'&&r.m.now.id&&r.coins===coins0,'one activity change at home: music().now is set from the radio, no coins spent',{now:r.m.now,coins:[coins0,r.coins],act:r.act});
  ok(/^♪ Mocha · .+ · .+/.test(r.m.chip)&&r.m.chipOn,'now-playing chip shows his pick',r.m.chip);
  // gesture -> audio; the radio is an emitter at his house
  await p.tap('canvas',{position:{x:200,y:520}});await p.waitForTimeout(1500);
  r=await p.evaluate(()=>({a:__mocha.audio(),m:__mocha.music({sync:1})}));const rp=r.m.players.find(x=>x.k==='radio'),tw=r.m.players.find(x=>x.k==='town');
  ok(r.a.state==='running'&&r.m.timer.live&&tw&&tw.wired&&rp&&rp.wired&&rp.em.pid==='home','after a tap: scheduler live, town + radio players wired (radio emitter in his house)',{state:r.a.state,players:r.m.players});
  await p.waitForTimeout(1500);r=await p.evaluate(()=>__mocha.music());ok(r.stats.notes>20&&r.songKey,'notes are being scheduled; SONG.key published',{notes:r.stats.notes,key:r.songKey,err:r.stats.err});
  // 1. the songbook
  r=await p.evaluate(()=>({a:__mocha.song(9),b:__mocha.song(21),a2:__mocha.song(9),all:[...Array(24).keys()].map(h=>__mocha.song(h).key+'/'+__mocha.song(h).bpm)}));
  ok(r.a.key!==r.b.key&&r.a.bpm!==r.b.bpm,'song(9) and song(21) differ in key and tempo',[r.a.key,r.a.bpm,r.b.key,r.b.bpm]);ok(JSON.stringify(r.a)===JSON.stringify(r.a2),'same seed, same theme (deterministic)');
  ok(r.a.form==="A A' B A"&&r.a.bars===16&&r.a.mel.split('|').every(x=>!x||x.split(',').every(m=>+m>=72&&+m<=84)),'form A A\' B A, 16 bars, melody within C5-C6',r.a.prog);const song9=JSON.stringify(r.a);
  r=await p.evaluate(()=>{const o=__mocha.playHour(21);const t=__mocha.music().town;__mocha.playHour(null);return{o,t}});ok(r.o.key&&r.o.bpm===76&&r.t.bpm===76,'playHour(21) switches the town theme',r);
  // 3. pickMusic
  r=await p.evaluate(()=>{const L=[];for(let i=0;i<30;i++)L.push(__mocha.pickMusic({mood:'wistful',wx:'rain',noSilence:1}).g);return L});ok(r.every(g=>g==='lofi'||g==='musicbox'),"pickMusic({mood:'wistful',wx:'rain'}) returns lofi or musicbox",[...new Set(r)]);
  r=await p.evaluate(()=>[__mocha.pickMusic({hol:'halloween',noSilence:1}).g,__mocha.pickMusic({record:'ferryjazz'}).id,__mocha.pickMusic({act:'reading a book'})]);ok(r[0]==='spooky'&&r[1]==='ferryjazz','Halloween picks spooky; a validated mind record is honored',r);
  // rain low-pass
  r=await p.evaluate(async()=>{__mocha.weather('rain');await new Promise(r=>setTimeout(r,2200));const m=__mocha.music();__mocha.weather('clear');return{lp:m.lp,now:m.lpNow}});ok(r.lp===1800&&r.now<6000,'forced rain: the music bus low-pass is active (1.8 kHz)',r);
  // note sprites (1 draw)
  r=await p.evaluate(()=>{const m=__mocha.music(),R=__mocha.renderer,sc=__mocha.scene,cam=__mocha.camera,pts=sc.getObjectByName('b21notes');let d=-1;if(pts){const v=pts.visible;pts.visible=false;R.render(sc,cam);const a=R.info.render.calls;pts.visible=true;R.render(sc,cam);d=R.info.render.calls-a;pts.visible=v}return{n:m.notes,d,cnt:sc.children.filter(o=>o.name==='b21notes').length}});
  ok(r.n.live>0&&r.n.src.includes('home')&&r.d===1&&r.cnt===1,'note sprites drift from his house while the radio plays (one Points pool, 1 draw)',r);
  // 5. Listen in never changes his choice; muted chip still shows his pick
  r=await p.evaluate(async()=>{const n0=JSON.stringify(__mocha.S.music.now);const o=__mocha.listenIn(true);await new Promise(r=>setTimeout(r,900));const m=__mocha.music({sync:1});const rp=m.players.find(x=>x.k==='radio');const n1=JSON.stringify(__mocha.S.music.now);__mocha.listenIn(false);return{li:o.li,solo:rp&&rp.em.solo,same:n0===n1}});
  ok(r.li===1&&r.solo===.7&&r.same,'Listen in solos his emitter at 70% and never changes S.music.now',r);
  r=await p.evaluate(async()=>{__mocha.audio({mode:'muted'});await new Promise(r=>setTimeout(r,1300));const m=__mocha.music(),h=__mocha.hud();const s=h.slots.find(x=>x.id==='nowPlaying');const o={chip:m.chip,on:m.chipOn,slot:s&&s.on,timers:__mocha.audio().timers};__mocha.audio({mode:'on'});return o});
  ok(/^🔇 Mocha/.test(r.chip)&&r.on&&r.slot,'muted: the now-playing chip still shows his pick (muted glyph)',r);
  // the card
  await p.click('.npChip');await p.waitForTimeout(500);r=await p.evaluate(()=>{const c=document.querySelector('#npCard');return{on:c.classList.contains('on'),txt:c.textContent.slice(0,160),cv:!!c.querySelector('canvas'),li:!!c.querySelector('[data-li]')}});
  ok(r.on&&r.cv&&r.li&&/on his radio/.test(r.txt),'tapping the chip opens the card: cover art, source, Listen in',r.txt);if(SHOTS)await p.screenshot({path:'/tmp/harness/out/b21-card-portrait.png'});await p.evaluate(()=>document.querySelector('#npCard .x').click());
  // 3b. with a phone, radio('citypop') crossfades the town music and shows 'Drizzle FM · Mocha's pick'
  r=await p.evaluate(async()=>{__mocha.S.phone={model:'Drizzle Flip',color:'#7a5cc8',case:null,charm:null,since:Date.now()};const t0=__mocha.music({sync:1}).town.src;const o=__mocha.radio('citypop');await new Promise(r=>setTimeout(r,800));const m=__mocha.music({sync:1});return{o,t0,t1:m.town.src,chip:m.chip,tk:m.tk}});
  ok(r.o.ok&&r.t1==='rcitypopdrizzle'&&r.t0!==r.t1&&/Drizzle FM · Mocha's pick: City Pop Drizzle/.test(r.chip),"with a phone, radio('citypop') takes over the town music and shows 'Drizzle FM · Mocha's pick'",r);
  if(SHOTS){await p.waitForTimeout(600);await p.screenshot({path:'/tmp/harness/out/b21-chip-portrait.png'})}
  // 4. the jukebox: 1 of his coins, plays to the square only
  r=await p.evaluate(async()=>{__mocha.S.music.tk=null;__mocha.S.music.now=null;const c0=__mocha.S.coins;const j=__mocha.jukebox();await new Promise(r=>setTimeout(r,700));const m=__mocha.music({sync:1}),jp=m.players.find(x=>x.k==='jb');
    __mocha.audio({lis:[-30,33]});await new Promise(r=>setTimeout(r,400));const gs=__mocha.AUD.spat(-38,40,jp.em.ref,jp.em.max,null).g;__mocha.audio({lis:[40,42]});await new Promise(r=>setTimeout(r,400));const gh=__mocha.AUD.spat(-38,40,jp.em.ref,jp.em.max,null).g;__mocha.audio({lis:null});
    return{c0,c1:__mocha.S.coins,j,em:jp&&jp.em,gs,gh,chip:m.chip}});
  ok(r.c1===r.c0-1&&r.em&&r.em.x===-38&&r.em.z===40&&r.em.max===30&&r.gs>.05&&r.gh===0,'forcing the jukebox spends 1 coin and plays to the square only (max 30)',r);
  r=await p.evaluate(()=>{const S=__mocha.S;const c=S.coins;S.coins=0;let a=null;try{a=__mocha.jukebox()}catch(e){a='ERR'}const c1=S.coins;S.coins=c;return{a,c1}});ok(r.a===null&&r.c1===0,'no coins: the jukebox does nothing and coins never go negative',r);
  // a request changes the town music at the next half hour
  r=await p.evaluate(()=>{__mocha.S.music.tk=null;const m=__mocha.music({request:'ferryjazz'});const d=new Date(m.rq.at);const before=__mocha.music({sync:1}).town.src;const m2=__mocha.music({rqDue:1,tick:1});const after=__mocha.music({sync:1}).town.src;return{at:m.rq.at,min:d.getMinutes(),dt:(m.rq.at-Date.now())/6e4,before,after,tk:m2.tk}});
  ok((r.min===0||r.min===30)&&r.dt>0&&r.dt<=30&&r.before!=='rferryjazz'&&r.after==='rferryjazz'&&r.tk.until-r.tk.t0>=30*6e4-1e3,'a request plays at the next :00/:30 and becomes the town music for 30-60 min',r);
  // 6. the scheduler is cleared on hidden
  r=await p.evaluate(async()=>{window.__hide(true);await new Promise(r=>setTimeout(r,300));const a={m:__mocha.music().timer.live,t:__mocha.audio().timers};window.__hide(false);await new Promise(r=>setTimeout(r,700));return{hid:a,back:__mocha.music().timer.live}});
  ok(r.hid.m===false&&r.hid.t===0&&r.back===true,'the scheduler is cleared on hidden and restarts on visible',r);
  // the cinema pianist starts with a silent film and stops at The End
  r=await p.evaluate(async()=>{const f={title:'The General',year:1926,by:'Buster Keaton & Clyde Bruckman',theme:'train',scenes:['a chase'],facts:['"The General" (1926) stars Buster Keaton.']};__mocha.forceAct({p:'cinema',s:'seat',fx:'movie',film:f,doing:'watching "The General"',tags:['movies']});
    for(let i=0;i<40&&!__mocha.MOVIE();i++)await new Promise(r=>setTimeout(r,250));const mv=!!__mocha.MOVIE();const a=__mocha.music({tick:1,sync:1});const cp=a.players.find(x=>x.k==='cine');const e0=a.cine.end||0;
    const b=__mocha.music({cineEnd:1,tick:1});const c=__mocha.music({sync:1});return{mv,on:a.cine.on,style:a.cine.style,cp:!!cp,off:b.cine.on,end:[e0,c.cine.end],gone:!c.players.some(x=>x.k==='cine')}});
  ok(r.mv&&r.on===1&&r.style==='rag'&&r.cp&&r.off===0&&r.end[1]>r.end[0]&&r.gone,'the cinema pianist (stride/rag for The General) starts with the film and stops at The End with a cadence',r);
  // state size, diagnostics, errors
  r=await p.evaluate(()=>({size:__mocha.music().size,diag:__mocha.diag(),closed:(()=>{__mocha.renderSet&&0;return true})()}));ok(r.size<=2048,'S.music is 2 KB or less',r.size);
  ok(/fps \d+/.test(r.diag)&&/draw calls \d+/.test(r.diag)&&/triangles/.test(r.diag)&&/pixel ratio/.test(r.diag)&&/quality tier/.test(r.diag),'Settings > Diagnostics shows fps, draw calls, triangles, pixel ratio and the quality tier',r.diag);
  if(SHOTS)await p.screenshot({path:'/tmp/harness/out/b21-diag-portrait.png'});
  // same seed across reloads
  await p.reload();await p.waitForTimeout(4500);r=await p.evaluate(()=>JSON.stringify(__mocha.song(9)));ok(r===song9,'the same seed gives the same theme across reloads');
  ok(!errs.length,'no page errors',errs.slice(0,4));await ctx.close();
  if(SHOTS){const L=await open(b,{width:852,height:393},true);await L.p.tap('canvas',{position:{x:400,y:200}});await L.p.evaluate(()=>{__mocha.forceAct({p:'home',s:'couch',doing:'relaxing on the couch',tags:['cozy'],need:{fun:10}})});await L.p.waitForTimeout(2500);
    await L.p.screenshot({path:'/tmp/harness/out/b21-chip-landscape.png'});await L.p.click('.npChip').catch(()=>{});await L.p.waitForTimeout(500);await L.p.screenshot({path:'/tmp/harness/out/b21-card-landscape.png'});ok(!L.errs.length,'landscape: no page errors',L.errs.slice(0,3));await L.ctx.close()}
  await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

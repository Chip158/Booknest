// B7 acceptance tests: CAM stack, HUD slots, six tabs, MIND budget, userBias cap, WX almanac, photo keep-set, hooks.
// Usage: node /tmp/harness/test-B7.js   (screenshots -> /tmp/harness/b7/shots/)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const OUT='/tmp/harness/b7/shots';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,400):''));if(!c)fails++};
const VPS=[['desktop',{width:1100,height:820},false],['portrait',{width:393,height:852},true],['landscape',{width:852,height:393},true],['duo',{width:900,height:1000},true]];
async function open(b,vp,mobile){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error'&&!/GPU stall/.test(m.text()))errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForFunction(()=>window.__mocha&&window.__mocha.HUD&&window.__mocha.HUD.ready,null,{timeout:60000});await p.waitForTimeout(3000);return{ctx,p,errs}}
const E=(p,f,a)=>p.evaluate(f,a);
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 // ---------- desktop: logic tests ----------
 {const {ctx,p,errs}=await open(b,VPS[0][1],false);
  // CAM
  await E(p,()=>{const M=__mocha;M.cam.push('room',{prio:1,tx:20,ty:1,tz:30,dist:10,pitch:.9,range:[6,16]});M.cam.push('talk',{prio:2,tx:22,ty:1.5,tz:31,dist:5,pitch:.4,range:[3,8]})});
  await E(p,()=>__mocha.cam.tick(80));
  let s=await E(p,()=>({st:__mocha.cam.stack(),c:__mocha.cam.state()}));
  ok(s.st[0].owner==='talk'&&s.st[0].top&&s.st.length===2,'CAM: talk (prio 2) on top of room',s.st);
  ok(Math.abs(s.c.dist-5)<.3&&Math.abs(s.c.pitch-.4)<.06&&Math.abs(s.c.tx-22)<.5,'CAM: camera framed on talk',s.c);
  // pinch out with two synthetic touch pointers: distance 200 -> 100 doubles dist, clamped to talk range max 8
  await E(p,()=>{const cv=document.getElementById('c'),ev=(t,id,x)=>cv.dispatchEvent(new PointerEvent(t,{pointerId:id,clientX:x,clientY:400,pointerType:'touch',bubbles:true,isPrimary:id===11}));
    ev('pointerdown',11,400);ev('pointerdown',12,600);ev('pointermove',12,560);ev('pointermove',12,500);ev('pointerup',12,500);ev('pointerup',11,400)});
  await E(p,()=>__mocha.cam.tick(80));
  s=await E(p,()=>({st:__mocha.cam.stack(),c:__mocha.cam.state()}));
  const talk=s.st.find(e=>e.owner==='talk'),room=s.st.find(e=>e.owner==='room');
  ok(talk.dist===8&&room.dist===10,'CAM: pinch changed only the top entry dist, clamped to its range',{talk:talk.dist,room:room.dist});
  ok(Math.abs(s.c.dist-8)<.3,'CAM: camera follows the pinched dist',s.c.dist);
  // wheel + zoom buttons also act on the top entry only
  await E(p,()=>{document.getElementById('zIn').click()});await p.waitForTimeout(300);
  s=await E(p,()=>__mocha.cam.stack());ok(s[0].dist<8&&s[1].dist===10,'CAM: + button changes only the top entry',s.map(e=>e.dist));
  await E(p,()=>{__mocha.cam.pop('talk');__mocha.cam.tick(80)});
  s=await E(p,()=>({st:__mocha.cam.stack(),c:__mocha.cam.state()}));
  ok(s.st.length===1&&s.st[0].owner==='room'&&Math.abs(s.c.dist-10)<.3&&Math.abs(s.c.pitch-.9)<.06&&Math.abs(s.c.tx-20)<.5&&Math.abs(s.c.tz-30)<.5,'CAM: popping talk restores the room framing',s.c);
  const base0=await E(p,()=>__mocha.CAM.base&&{...__mocha.CAM.base});
  await E(p,()=>{__mocha.cam.pop('room');__mocha.cam.tick(80)});
  s=await E(p,()=>({st:__mocha.cam.stack(),c:__mocha.cam.state()}));
  ok(s.st.length===0&&base0&&Math.abs(s.c.dist-base0.dist)<.3&&Math.abs(s.c.pitch-base0.pitch)<.02&&['[6,80]','[4.5,80]'].includes(JSON.stringify(s.c.range)),'CAM: popping the last entry eases back to the base follow view (follow zoom [4.5,80] since LF2)',{c:s.c,base0});
  // follow-mode zoom still works without entries
  const d0=await E(p,()=>__mocha.cam.state().dist);await E(p,()=>{document.getElementById('zIn').click();__mocha.cam.tick(30)});const d1=await E(p,()=>__mocha.cam.state().dist);
  ok(d1<d0-1,'CAM: base zoom button still works',{d0,d1});
  // TABS
  let t=await E(p,()=>__mocha.tabs());ok(t.n===6&&t.labels.join('|').match(/diary.*feed.*mocha.*town.*you.*settings/),'TABS: exactly 6 top-level tabs',t.labels);
  t=await E(p,()=>{__mocha.openTab('calendar');const r=__mocha.tabs();const el=document.getElementById('tab-cal');return{...r,vis:el.offsetHeight>0&&getComputedStyle(el.closest('.tab')).display!=='none',html:el.innerHTML.length}});
  ok(t.top==='town'&&t.leaf==='cal'&&t.vis&&t.html>100,'TABS: openTab(calendar) opens town > calendar',t);
  await p.screenshot({path:OUT+'/desktop-town-cal.png'});
  t=await E(p,()=>{__mocha.openTab('notes');const r=__mocha.tabs();const el=document.getElementById('tab-notes');return{...r,vis:el.offsetHeight>0,sub:[...document.querySelectorAll('#tab-mocha .subnav button')].map(b=>b.textContent+(b.classList.contains('on')?'*':''))}});
  ok(t.top==='mocha'&&t.leaf==='notes'&&t.vis,'TABS: openTab(notes) opens mocha > notebook',t);
  await p.screenshot({path:OUT+'/desktop-mocha-notes.png'});
  t=await E(p,()=>{document.querySelector('#tabNav [data-top="settings"]').click();return{leaf:__mocha.tabs().leaf,meter:(document.getElementById('mindUse')||{}).textContent,caps:[...document.querySelectorAll('[data-mcap]')].map(b=>b.textContent)}});
  ok(t.leaf==='set'&&/\d+ of 10 today/.test(t.meter||'')&&t.caps.length===3,'TABS: settings shows the mind meter and cap control',t);
  await E(p,()=>{const el=document.getElementById('mindUse');el&&el.scrollIntoView()});await p.waitForTimeout(300);await p.screenshot({path:OUT+'/desktop-settings-mind.png'});
  t=await E(p,()=>{document.querySelector('#tabNav [data-tab="cal"]').click();return __mocha.tabs()});ok(t.leaf==='cal','TABS: legacy nav selector [data-tab=cal] still lands on the calendar',t.leaf);
  // MIND budget
  await E(p,()=>window.dispatchEvent(new Event('pointermove')));
  let m=await E(p,()=>__mocha.mindUse({reset:true,cap:'light'}));ok(m.allow.next&&m.allow.user&&m.max===10,'MIND: fresh budget allows both',m);
  m=await E(p,()=>__mocha.mindUse({add:'next',n:6}));ok(!m.allow.next&&!m.allow.letter&&m.allow.user&&m.nonUser===6,'MIND: after 6 non-user calls next is refused, user still allowed',m);
  m=await E(p,()=>__mocha.mindUse({add:'user',n:4}));ok(!m.allow.user&&m.n===10,'MIND: daily cap 10 reached refuses user too',m);
  m=await E(p,()=>__mocha.mindUse({reset:true}));
  m=await E(p,()=>{Object.defineProperty(document,'visibilityState',{get:()=>'hidden',configurable:true});const r=__mocha.mindUse();delete document.visibilityState;return r});
  ok(Object.values(m.allow).every(v=>v===false)&&m.hidden,'MIND: every kind refused while hidden',m.allow);
  m=await E(p,()=>{const L=Date.now;const r0=__mocha.present();return r0});ok(m.present,'present() true after input',m);
  m=await E(p,()=>{const M=__mocha,G=M.G,was=G.sleep;G.sleep=true;const r=M.mindUse();G.sleep=was;return r});ok(Object.values(m.allow).every(v=>v===false),'MIND: refused while he is asleep',m.allow);
  m=await E(p,()=>{const s=document.documentElement.innerHTML;return(s.match(/await ask\(/g)||[]).length+'|'+(s.match(/await ask\([^;]*kind:'/g)||[]).length});const [na,nk]=m.split('|');
  ok(na>=4,'MIND: ask() call sites found',m);
  await E(p,()=>__mocha.mindUse({reset:true}));
  // userBias
  let u=await E(p,()=>__mocha.userBias('cafe',{dummy:5,v:.5}));ok(Math.abs(u.total-1.2)<1e-9&&u.parts.length===5,'userBias: 5 terms of .5 clamp to 1.2',u);
  u=await E(p,()=>__mocha.userBias('cafe'));ok(u.total===0&&u.terms.includes('you mentioned it')&&u.terms.includes('you like it too')&&!u.terms.some(x=>/dummy/.test(x)),'userBias: round-1 nudges are registered terms (0 with no input)',u);
  u=await E(p,()=>{const id=__mocha.ubMention('maybe go to the library later?');return{id,b:__mocha.userBias(id||'library')}});ok(u.id&&u.b.total>.45&&u.b.total<=.5,'userBias: a mentioned place gives a soft additive term',u);
  u=await E(p,()=>{const M=__mocha;let n=0;for(let i=0;i<20;i++){const c=M.localChoose();if(c.act||c.explore)n++}return{n,mode:M.G.mode}});ok(u.n===20,'localChoose still returns choices with userBias wired',u);
  // bonds / home caps / emitters / stubs
  let x=await E(p,()=>({w:__mocha.bondOf('wendell'),you:__mocha.bondOf('you'),t:[0,9,10,59,60,159,160,320,600,900].map(__mocha.tierOf),bed:__mocha.hasItem('bed'),radio:__mocha.hasItem('radio'),player:__mocha.hasItem('player'),stove:__mocha.hasItem('stove'),comp:__mocha.hasItem('computer'),bath:__mocha.hasItem('bath')}));
  ok(x.t.join()==='0,0,1,1,2,2,3,4,5,5'&&x.bed.has&&x.bed.spot.s==='bed'&&!x.radio.has&&x.radio.spot===null&&x.bath.has,'bondOf/tierOf/hasItem/capSpot shims',x);
  x=await E(p,()=>{const M=__mocha;let got=[];M.SFXEV.on('*',e=>got.push(e.name));M.DOOREV.on('open',d=>got.push('door:'+d));M.sfx('tink',1);M.DOOREV.emit('open','cafe');M.FEAT.nest=true;const nb=M.hasItem('bed').has;M.FEAT.nest=false;return{got,nb,emote:typeof emote,stub:M.HUD&&1}});
  ok(x.got.join()==='tink,door:cafe'&&x.nb===false,'EV emitters work; FEAT.nest=true makes unowned items fall back',x);
  // WX
  const w1=await E(p,()=>JSON.stringify(__mocha.wx('2026-11-03')));
  x=await E(p,()=>{let r=0;for(let d=1;d<=30;d++)if(__mocha.wx(`2026-11-${d}`).rainy)r++;const now=__mocha.wx();return{r,now}});
  ok(x.r>=12&&x.r<=24,'WX: 30 November days give 12-24 rainy days',x.r);ok(x.now.kind===x.now.now&&/until|rest of the day/.test(x.now.line),'WX: WEATHER.kind follows the almanac; forecast line',x.now);
  // photos: 40 album photos + 24 posts with 60k-char photos
  x=await E(p,()=>{const M=__mocha,S=M.S,big=n=>'data:image/jpeg;base64,'+'A'.repeat(n),put={};S.you.album=[];S.posts=[];for(let i=0;i<40;i++){S.you.album.push({id:'alb'+i,t:Date.now()-(40-i)*1000});put['alb'+i]=big(60000)}
    for(let i=0;i<24;i++){S.posts.push({id:'pp'+i,t:Date.now()-i*1000,caption:'test '+i,place:'',likes:1,liked:false});put['pp'+i]=big(60000)}
    M.photos({put});const r=M.photos({save:true});return{chars:r.chars,album:S.you.album.length,first:S.you.album[0].id,last:S.you.album[29].id,keys:r.keys.length,posts:r.keys.filter(k=>/^pp/.test(k)).sort((a,b)=>+a.slice(2)-+b.slice(2))}});
  ok(x.chars<=3.2e6&&x.album===30&&x.first==='alb10'&&x.last==='alb39'&&x.posts.length>=12&&x.posts.slice(0,12).join()===[...Array(12).keys()].map(i=>'pp'+i).join(),'PHOTOS: album keeps the 30 newest, newest posts kept, within 3.2e6',x);
  x=await E(p,()=>{__mocha.pinPhoto('pp1',true);__mocha.savePhotos();return __mocha.photos().pins});ok(x.includes('pp1'),'PHOTOS: a hearted photo is pinned',x);
  x=await E(p,async()=>{const M=__mocha;M.S.phone={model:'Ghostphone',color:'#e9886b',case:null,charm:null,since:Date.now()};M.openMsgs();await new Promise(r=>setTimeout(r,600));M.renderMsgs();const f=document.querySelector('#msgList .mFc');return f&&f.textContent});
  ok(x&&/his forecast: .*(until|rest of the day)/.test(x),'WX: forecast line on his phone (Messages)',x);await p.screenshot({path:OUT+'/desktop-msgs-forecast.png'});
  await E(p,()=>{__mocha.closeMsgs();__mocha.S.phone=null});
  const dc=await E(p,()=>__mocha.drawCalls());ok(dc>0,'drawCalls() hook',dc);
  // reload keeps them; WX identical
  await p.reload();await p.waitForFunction(()=>window.__mocha&&window.__mocha.HUD&&window.__mocha.HUD.ready,null,{timeout:60000});await p.waitForTimeout(2500);
  x=await E(p,()=>{const r=__mocha.photos(),S=__mocha.S;return{album:S.you.album.length,first:S.you.album[0]&&S.you.album[0].id,alb:r.keys.filter(k=>/^alb/.test(k)).length,chars:r.chars,pins:r.pins}});
  ok(x.album===30&&x.first==='alb10'&&x.alb===30&&x.chars<=3.2e6,'PHOTOS: reload keeps the 30 newest album photos',x);
  const w2=await E(p,()=>JSON.stringify(__mocha.wx('2026-11-03')));ok(w1===w2,'WX: forDate(2026-11-03) identical across reloads',w1);
  await E(p,()=>{const S=__mocha.S;S.you.album=[];S.posts=[];S.pins=[];__mocha.savePhotos()});
  ok(!errs.length,'desktop: no page errors',errs);await ctx.close()}
 // ---------- HUD in all 4 viewports ----------
 for(const [n,vp,mob] of VPS){const {ctx,p,errs}=await open(b,vp,mob);
  let h=await E(p,()=>__mocha.hud());const base=h.overlaps.filter(([a,c])=>a!=='panel'&&c!=='panel');
  h=await E(p,()=>__mocha.hud({stub:true}));await p.waitForTimeout(400);h=await E(p,()=>__mocha.hud());
  const fixed=new Set(h.slots.filter(s=>s.fixed).map(s=>s.id));const bad=h.overlaps.filter(([a,c])=>!(fixed.has(a)&&fixed.has(c))&&!(fixed.has(a)&&c==='panel')&&!(a==='panel'&&fixed.has(c)));
  const shown=h.slots.filter(s=>s.stub&&s.r).map(s=>s.id),folded=h.slots.filter(s=>s.folded).map(s=>s.id);
  ok(!bad.length,`HUD ${n}: no overlaps involving managed slots or the ⋯ button`,{bad,shown,folded,more:h.more});
  if(base.length)console.log('  note: round-1 fixed-vs-fixed overlaps in',n,JSON.stringify(base));
  // batch 3 merge: reserved slots filled by their steps (B18 emote, B20 speaker, B25 wallet, B27 decorate) are no longer stubs
  const RES=['banner','wallet','speaker','nowPlaying','decorate','floors','emote','talk'];let real=await E(p,R=>R.filter(id=>{const s=__mocha.HUD.S[id];return s&&s.el&&!s.stub}),RES);
  ok(RES.every(id=>shown.includes(id)||folded.includes(id)||real.includes(id)),`HUD ${n}: all 8 reserved slots are placed, folded or filled by their step`,{shown,folded,real});
  const inView=h.bands.filter(r=>!/panel|msgs/.test(r.id)).every(r=>r.x>=0&&r.y>=0&&r.x+r.w<=vp.width+1&&r.y+r.h<=vp.height+1);ok(inView,`HUD ${n}: every band is on screen`);
  await p.screenshot({path:`${OUT}/${n}-hud-stubs.png`});
  if(h.more.length){await E(p,z=>__mocha.hud({pop:z}),h.more[0]);await p.waitForTimeout(300);await p.screenshot({path:`${OUT}/${n}-hud-popover.png`});await E(p,()=>__mocha.hud({pop:null}))}
  // walk mode too
  await E(p,()=>__mocha.setCamMode('walk'));await p.waitForTimeout(800);h=await E(p,()=>__mocha.hud());
  const bad2=h.overlaps.filter(([a,c])=>!(fixed.has(a)&&fixed.has(c))&&!(fixed.has(a)&&c==='panel')&&!(a==='panel'&&fixed.has(c)));ok(!bad2.length,`HUD ${n} walk: no overlaps involving managed slots`,{bad2,more:h.more});
  {const sh=h.slots.filter(s=>s.stub&&s.r).map(s=>s.id),fo=h.slots.filter(s=>s.folded).map(s=>s.id);real=await E(p,R=>R.filter(id=>{const s=__mocha.HUD.S[id];return s&&s.el&&!s.stub}),RES);ok(RES.every(id=>sh.includes(id)||fo.includes(id)||real.includes(id)),`HUD ${n} walk: all 8 reserved slots placed, folded or filled by their step`,{sh,fo,real,more:h.more});if(n==='landscape')ok(h.more.length>0&&fo.length>0,'HUD landscape (walk, sticks up): overflow folds into ⋯',{more:h.more,fo})}
  if(h.more.length){await E(p,z=>__mocha.hud({pop:z}),h.more[0]);await p.waitForTimeout(300);await p.screenshot({path:`${OUT}/${n}-hud-walk-popover.png`});await E(p,()=>__mocha.hud({pop:null}))}
  await p.screenshot({path:`${OUT}/${n}-hud-walk.png`});
  await E(p,()=>{__mocha.setCamMode('follow');__mocha.hud({stub:false})});await p.waitForTimeout(300);h=await E(p,()=>__mocha.hud());
  ok(!h.more.length&&!h.slots.some(s=>s.stub),`HUD ${n}: stubs removed cleanly`);
  await p.screenshot({path:`${OUT}/${n}-clean.png`});
  ok(!errs.length,`${n}: no page errors`,errs);await ctx.close()}
 await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

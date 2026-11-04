// Step 5 feature test: calendar + holidays + parents' mail + holiday world/activities + fireworks.
// Usage: node /tmp/harness/test-step5.js [section: dates|halloween|muertos|thanks|xmas|nye|migrate|catchup|mind|ui]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.floor((h%1)*60)},${Math.round(((h*60)%1)*60)},0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const OUT='/tmp/harness/step5/';const filt=process.argv[2]||'';
let fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  FAIL',m)}else console.log('  ok',m)};
const VPS={desktop:[{width:1100,height:820},false],portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],unfolded:[{width:900,height:1000},true]};
async function open(b,vn,month,day,hour,init){const [vp,mobile]=VPS[vn];const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n').slice(1,3).join(' | ')));p.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errs.push('console.'+m.type()+' '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour,month,day));if(init)await p.addInitScript(init);
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);return {ctx,p,errs}}
const prep=`(()=>{const M=window.__mocha;M.weather('clear');const pn=document.getElementById('panel');if(!pn.classList.contains('hidden'))document.getElementById('closePanel').click();document.getElementById('hint').style.display='none';window.__toasts=[];new MutationObserver(()=>{const t=document.getElementById('toast').textContent;if(window.__toasts[window.__toasts.length-1]!==t)window.__toasts.push(t)}).observe(document.getElementById('toast'),{childList:true,characterData:true,subtree:true});return 1})()`;
const park=(x,z,camo)=>`(()=>{const M=window.__mocha;M.G.x=${x};M.G.z=${z};M.G.mode='activity';M.G.timer=999;M.G.act={p:'home',doing:'posing'};M.cam(${JSON.stringify(camo)});return 1})()`;
const tickUntil=(cond,max=6000)=>`(()=>{const M=window.__mocha;for(let i=0;i<${max};i++){if(${cond})return i;M.tick(1,.05)}return -1})()`;
const until=async(p,fn,arg,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const r=await p.evaluate(fn,arg);if(r)return r;await p.waitForTimeout(250)}return null};
const want=s=>!filt||filt===s;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
// ---------------------------------------------------------------- dates (in-page)
if(want('dates')){console.log('== dates');const {ctx,p,errs}=await open(b,'desktop',9,31,12);
  const r=await p.evaluate(()=>{const M=window.__mocha,f=(y,id)=>{const h=M.holidaysFor(y).find(x=>x.id===id);return h?(h.m+1)+'/'+h.d:null},o={};for(const y of [2026,2027,2028])for(const id of ['easter','mothers','fathers','thanksgiving','lunar','muertos'])o[id+y]=f(y,id);
    o.themes=['2026-10-31','2026-11-01','2026-11-20','2026-12-25','2026-12-31','2027-02-06','2027-03-28'].map(s=>{const [y,m,d]=s.split('-').map(Number);return M.holTheme(new Date(y,m-1,d,12).getTime())});o.bday=[M.bdayParse('my birthday is March 3rd'),M.bdayParse('birthday: 12/25'),M.bdayParse('born on the 4th of July')];o.up=M.holUpcoming(Date.now(),60,4).map(x=>x.h.id+':'+x.days);return o});
  const exp={easter2026:'4/5',easter2027:'3/28',easter2028:'4/16',mothers2026:'5/10',mothers2027:'5/9',mothers2028:'5/14',fathers2026:'6/21',fathers2027:'6/20',fathers2028:'6/18',thanksgiving2026:'11/26',thanksgiving2027:'11/25',thanksgiving2028:'11/23',lunar2026:'2/17',lunar2027:'2/6',lunar2028:'1/26',muertos2026:'11/1'};
  for(const k in exp)ok(r[k]===exp[k],`${k} = ${r[k]}`);ok(r.themes.join()==='halloween,muertos,harvest,winter,newyear,lunar,easter','themes '+r.themes.join());ok(r.bday[0]&&r.bday[0].m===2&&r.bday[0].d===3&&r.bday[1].m===11&&r.bday[1].d===25&&r.bday[2].m===6,'birthday parsing');ok(r.up[0]==='halloween:0'&&r.up[1]==='muertos:1','upcoming '+r.up.join(' '));
  const bd=await p.evaluate(()=>{const M=window.__mocha;M.S.phone={model:'Nimbus Mini',color:'#6c8ebf',case:null,charm:null,since:Date.now()};M.txAdd('him',"when's your birthday? i want to put it on my calendar 📅🎂",Date.now()-60e3,{q:'bday'});const me=M.txAdd('me','march 3rd!',Date.now()-30e3,{wait:1});const out=M.txLocalReply([me],{});
    const r={reply:out[0].text,facts:M.S.mem.facts.slice(),bday:M.ownerBday(),cal:M.holsOn(new Date(2027,2,3,12).getTime()).map(h=>h.id+':'+h.n)};M.S.mem.facts=M.S.mem.facts.filter(f=>!/birth/.test(f));M.S.mem.facts.push('their birthday is today');return r});
  ok(bd.bday&&bd.bday.m===2&&bd.bday.d===3&&bd.cal.some(x=>/^bday:/.test(x)),'birthday answer -> calendar: '+bd.reply+' | '+bd.cal.join(','));
  const bt=await p.evaluate(()=>{const M=window.__mocha;M.setBday({m:new Date().getMonth(),d:new Date().getDate()});M.S.hol.done=(M.S.hol.done||[]).filter(k=>!/txt/.test(k));M.TX.outbox.length=0;M.holTick();return{ob:M.TX.outbox.map(e=>e.kind),today:M.holsOn().map(h=>h.id),c:M.holCands().map(a=>a.k)}});
  ok(bt.ob.includes('bday')||bt.ob.includes('holiday'),'birthday/holiday text queued: '+bt.ob.join(',')+' today='+bt.today.join(','));ok(bt.c.includes('bdcake'),'birthday cake activity');
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,3)));await ctx.close()}
// ---------------------------------------------------------------- Halloween evening (fresh Mocha)
if(want('halloween')){console.log('== halloween Oct 31 18:30');const {ctx,p,errs}=await open(b,'desktop',9,31,18.5);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  let r=await E(()=>{const M=window.__mocha;return{theme:M.hol().theme,mail:M.mail(),label:document.getElementById('sky').textContent,today:M.holsOn().map(h=>h.id),kids:M.hol().kids,glows:M.hol().glows}});
  ok(r.theme==='halloween','theme halloween');ok(r.mail.mbox.some(m=>m.h==='halloween')&&r.mail.waiting>=1,'halloween parcel waiting in the mailbox: '+r.mail.mbox.map(m=>m.h+(m.t>Date.now()?'(later)':'')).join(','));ok(/halloween/.test(r.label),'sky pill: '+r.label);ok(r.kids>5&&r.glows>10,`decorations built (${r.kids} objects, ${r.glows} glows)`);
  r=await until(p,()=>{const m=window.__mocha.mail();return m.flag>-.2&&m.env&&m},null,6000);ok(!!r,'mailbox flag up + envelope showing');
  r=await until(p,()=>{const M=window.__mocha;return window.__toasts.find(t=>/📬/.test(t))||((M.mail().mbox.find(m=>m.h==='halloween')||{}).an&&'flagged an')||(M.S.mail.some(l=>l.h==='halloween')&&'already opened by him')},null,15000);ok(!!r,'mail announced: '+r);
  await E(park(46.5,57,{tx:42.5,tz:53,dist:15,yaw:-.25,pitch:.32}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'hw-home-desktop.png'});
  r=await E(()=>window.__mocha.hol());ok(r.bats,'bats out at dusk');
  // he checks the mail himself
  r=await E(`(()=>{const M=window.__mocha;M.forceAct(M.ACTS.find(a=>a.fx==='mail'));return 1})()`);
  r=await E(tickUntil("M.S.mail.length>0",4000));ok(r>=0,'he walked to the mailbox and opened it (ticks '+r+')');
  r=await E(()=>{const M=window.__mocha,S=M.S;return{l:S.mail[0],d:S.diary.filter(e=>e.tag==='Mail').map(e=>e.text),wear:M.hol().wearing,cos:M.hol().costume,items:S.items.map(i=>i.name),flag:M.mail().waiting}});
  ok(r.l&&r.l.h==='halloween'&&/witch hat|cape|mask/.test(r.l.gift),'halloween letter + costume gift: '+(r.l&&r.l.gift));ok(r.d.length&&/Mom and Dad/.test(r.d[0]),'diary: '+r.d[0]);ok(r.wear.some(w=>/witch hat|cape|mask/.test(w||'')),'he put the costume on: '+r.wear.join(', '));
  ok(r.items.some(i=>/taffy/.test(i)),'taffy treasure');
  // trick-or-treating: dynamic stops at open shops + Wendell's porch
  r=await E(()=>{const M=window.__mocha;const c=M.holCands();return{n:c.filter(a=>a.k==='trick').length,ks:c.filter(a=>a.k==='trick').map(a=>a.keeper)}});ok(r.n>=4,`trick-or-treat stops available: ${r.ks.join(',')}`);
  r=await E(()=>{const M=window.__mocha,c={};for(let i=0;i<300;i++){const x=M.localChoose();const k=x.act?(x.act.hx||x.act.fx||x.act.doing):'explore';c[k]=(c[k]||0)+1}return c});ok((r.trick||0)>120,'built-in brain mostly picks trick-or-treating tonight: '+JSON.stringify(r));
  r=await E(()=>{const M=window.__mocha;const s=M.holCands().find(a=>a.k==='trick'&&a.keeper==='juniper')?'juniper':null;const c=M.holCands().filter(a=>a.k==='trick'&&a.keeper!=='wendell');const pick=c.find(a=>['basil','mabel','monty','hank'].includes(a.keeper))||c[0];return M.holAct(pick.hdk)});ok(r&&r.k==='trick','holAct trick -> '+JSON.stringify(r));
  await p.waitForTimeout(1500);r=await E(()=>window.__mocha.hol().pail);ok(r,'pumpkin pail in his hand');
  await E(tickUntil("M.G.mode==='activity'",3000));await E(()=>{const M=window.__mocha,G=M.G;M.cam({tx:G.x,tz:G.z,dist:13,yaw:G.yaw+Math.PI+.3,pitch:.3});G.timer=999;return 1});await p.waitForTimeout(2500);await p.screenshot({path:OUT+'hw-trick-desktop.png'});
  r=await E(()=>{const M=window.__mocha;M.G.timer=.1;return 1});r=await E(tickUntil("M.S.diary.some(e=>/Trick-or-treated/.test(e.text))",3000));ok(r>=0,'trick-or-treat diary entry');
  r=await E(()=>{const M=window.__mocha;return{d:M.S.diary.find(e=>/Trick-or-treated/.test(e.text)).text,c:M.hol().state.n}});console.log('   ',r.d,JSON.stringify(r.c));
  // the town at night
  await E(park(-30,-2,{tx:-22,tz:2,dist:30,yaw:3.0,pitch:.38}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'hw-street-desktop.png'});
  // texting: give him a phone, then the holiday text queues up
  r=await E(()=>{const M=window.__mocha;M.buyGear('phone',{model:'Nimbus Mini',color:'#6c8ebf'},Date.now(),false);const o0=M.TX.outbox.length;M.holTick();const before=M.TX.outbox.length-o0;M.txAdd('him','hi!! it\'s mocha 👻📱',Date.now());M.holTick();return{ob:M.TX.outbox.map(e=>e.kind),txt:M.holText({id:'halloween'})}});ok(r.ob.includes('holiday'),'holiday text queued: '+r.ob.join(','));console.log('    ',r.txt);
  // calendar tab
  await E(()=>{document.getElementById('bookBtn').click();return 1});await p.waitForTimeout(600);await p.click('nav button[data-tab="cal"]');await p.waitForTimeout(800);
  r=await E(()=>({h:document.getElementById('tab-cal').innerText,today:!!document.querySelector('.cd.today'),letters:document.querySelectorAll('.letter').length,dot:getComputedStyle(document.getElementById('calDot')).display}));
  ok(/October 2026/.test(r.h)&&/Halloween/.test(r.h)&&/coming up/.test(r.h),'calendar shows month, Halloween, upcoming');ok(r.today&&r.letters>=1,'today highlighted + letter card ('+r.letters+')');
  await p.screenshot({path:OUT+'hw-cal-desktop.png'});await p.click('.calNav[data-cm="1"]');await p.waitForTimeout(300);await p.click('.cd[data-day="20261126"]');await p.waitForTimeout(300);r=await E(()=>document.querySelector('.calDay').innerText);ok(/Thanksgiving/.test(r),'tap Nov 26 -> Thanksgiving details');
  await p.screenshot({path:OUT+'hw-cal2-desktop.png'});
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- Día de los Muertos
if(want('muertos')){console.log('== muertos Nov 1 10:00');const {ctx,p,errs}=await open(b,'desktop',10,1,10);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  let r=await E(()=>{const M=window.__mocha;return{theme:M.hol().theme,c:M.holCands().map(a=>a.k),label:document.getElementById('sky').textContent}});ok(r.theme==='muertos','theme muertos');ok(r.c.includes('ofrenda'),'ofrenda activity available: '+[...new Set(r.c)].join(','));
  await E(park(18.5,-6,{tx:18.5,tz:-11.5,dist:12,yaw:0,pitch:.28}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'dm-ofrenda-desktop.png'});
  await E(park(-14,-3,{tx:-14,tz:5,dist:20,yaw:3.14,pitch:.3}));await p.waitForTimeout(2000);await p.screenshot({path:OUT+'dm-shops-desktop.png'});
  r=await E(()=>window.__mocha.holAct('ofrenda'));ok(r&&r.p==='library','holAct ofrenda');r=await E(tickUntil("M.S.diary.some(e=>e.tag==='Día de los Muertos')",4000));ok(r>=0,'ofrenda diary');
  r=await E(()=>{const M=window.__mocha;return{d:M.S.diary.find(e=>e.tag==='Día de los Muertos').text,l:M.S.learned.map(l=>l.topic)}});console.log('    ',r.d);ok(r.l.includes('día de los muertos'),'learned a true fact');
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- Thanksgiving
if(want('thanks')){console.log('== thanksgiving Nov 26 12:00');const {ctx,p,errs}=await open(b,'desktop',10,26,12);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  let r=await E(()=>{const M=window.__mocha;return{theme:M.hol().theme,mb:M.mail().mbox.map(m=>m.h),c:M.holCands().map(a=>a.k),c15:M.holCands(new Date(2026,10,26,15).getTime()).map(a=>a.k+(a.npc?'*':'')),w:M.S&&0}});
  ok(r.theme==='harvest','harvest decorations');ok(r.mb.includes('thanksgiving'),'thanksgiving parcel');ok(r.c.includes('pie'),'pie at noon');ok(r.c15.some(k=>/tgdinner/.test(k)),'dinner with Wendell in the afternoon: '+r.c15.join(','));
  await E(park(-30,4,{tx:-30,tz:8.5,dist:13,yaw:3.14,pitch:.25}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'tg-cafe-desktop.png'});
  r=await E(()=>{const M=window.__mocha;const a=M.holCands(new Date(2026,10,26,15).getTime()).find(x=>x.k==='tgdinner');M.holOutcome(a,Date.now(),true);return M.S.diary[0].text});ok(/Thanksgiving dinner at Wendell/.test(r),'dinner diary: '+r.slice(0,90));
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- Christmas morning
if(want('xmas')){console.log('== christmas Dec 25 09:00');const {ctx,p,errs}=await open(b,'desktop',11,25,9);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  let r=await E(()=>{const M=window.__mocha;return{theme:M.hol().theme,mb:M.mail().mbox.map(m=>m.h+':'+m.hold),c:M.holCands().map(a=>a.k)}});ok(r.theme==='winter','winter lights');ok(r.mb.some(x=>/christmas/.test(x)),'christmas box: '+r.mb.join(','));ok(r.c.includes('presents'),'opening presents is on');
  await E(park(31,-4,{tx:34.5,tz:-8,dist:22,yaw:.25,pitch:.3}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'xm-tree-desktop.png'});
  // he decorates (normally in December), then a tree appears in his house
  r=await E(()=>{const M=window.__mocha;M.S.hol.done=M.S.hol.done||[];M.S.hol.done.push('christmas-2026:decorate');M.holForce(undefined);return 1});await p.waitForTimeout(2600);
  await E(park(43,49,{tx:42,tz:46.5,dist:13,yaw:.15,pitch:.42}));await p.waitForTimeout(2500);await p.screenshot({path:OUT+'xm-home-desktop.png'});
  r=await E(`(()=>{const M=window.__mocha;M.forceAct(M.ACTS.find(a=>a.fx==='mail'));return 1})()`);r=await E(tickUntil("M.S.mail.length>0",4000));r=await E(()=>window.__mocha.S.mail[0]);ok(r&&r.h==='christmas'&&!r.wrapped,'christmas box opened on Christmas: '+(r&&r.gift));
  r=await E(()=>window.__mocha.holAct('presents'));r=await E(tickUntil("M.S.diary.some(e=>e.tag==='Christmas')",4000));ok(r>=0,'christmas morning diary');
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- New Year's Eve countdown + fireworks
if(want('nye')){console.log('== nye Dec 31 23:59:30');const {ctx,p,errs}=await open(b,'desktop',11,31,23+59/60+30/3600);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  let r=await E(()=>{const M=window.__mocha;return{aw:M.asleepAt(M.hourAt(Date.now())),c:M.holCands().map(a=>a.k),theme:M.hol().theme}});ok(!r.aw,'he stays up on New Year\'s Eve');ok(r.c.includes('nye'),'needle countdown available');ok(r.theme==='newyear','newyear theme');
  await E(()=>{const M=window.__mocha;M.holAct('nye');return 1});
  r=await until(p,()=>new Date().getMonth()===0&&window.__mocha.hol().fwLive>40,null,45000);ok(!!r,'fireworks after midnight');
  await E(()=>{const M=window.__mocha,G=M.G;M.cam({tx:G.x,tz:G.z,dist:24,yaw:Math.PI*.62,pitch:.05});return 1});await p.waitForTimeout(1500);await E(()=>window.__mocha.fwBurstNow(5));await p.waitForTimeout(1500);await p.screenshot({path:OUT+'ny-fireworks-desktop.png'});
  r=await E(()=>window.__toasts);ok(r.some(t=>/🎆 3…|🎆 2…/.test(t))&&r.some(t=>/Happy New Year/.test(t)),'countdown toasts: '+r.join(' | '));
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- existing save opened on Halloween (no mail fields yet)
if(want('migrate')){console.log('== migrate: old save, Oct 31 18:30');let {ctx,p,errs}=await open(b,'desktop',9,31,16);
  let save=await p.evaluate(()=>{const S=JSON.parse(JSON.stringify(window.__mocha.S));['mail','mbox','mailSent','hol','calT','careAt','mailT'].forEach(k=>delete S[k]);S.born=Date.now()-20*864e5;S.lastSeen=Date.now()-2*3600e3;return S});await ctx.close();
  ({ctx,p,errs}=await open(b,'desktop',9,31,18.5,`if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('mocha-seattle-v1',${JSON.stringify(JSON.stringify(save))})}`));const E=(f,a)=>p.evaluate(f,a);
  let r=await E(()=>{const M=window.__mocha;return{m:M.mail(),hol:M.S.hol}});ok(Array.isArray(r.m.sent)&&r.m.sent.includes('welcome')&&!r.m.mbox.some(m=>m.h==='welcome'),'old save: no welcome letter');ok(r.m.mbox.some(m=>m.h==='halloween'),'old save gets the Halloween parcel right away');ok(r.m.careAt>Date.now(),'care package scheduled');
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- app closed overnight: care package arrives in the morning, he checks it while away
if(want('catchup')){console.log('== catchup: closed Oct 30 20:00 -> Oct 31 17:00');let {ctx,p,errs}=await open(b,'desktop',9,31,12);
  let save=await p.evaluate(()=>{const S=JSON.parse(JSON.stringify(window.__mocha.S)),d=t=>new Date(t);const ev=new Date();ev.setDate(30);ev.setHours(20,0,0,0);S.born=ev.getTime()-30*864e5;S.lastSeen=ev.getTime();S.mailT=ev.getTime();S.mailSent=['welcome','halloween-2026'];S.mbox=[];S.mail=[];const ca=new Date();ca.setHours(10,30,0,0);S.careAt=ca.getTime();return S});await ctx.close();
  ({ctx,p,errs}=await open(b,'desktop',9,31,17,`if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('mocha-seattle-v1',${JSON.stringify(JSON.stringify(save))})}`));const E=(f,a)=>p.evaluate(f,a);
  let r=await E(()=>{const M=window.__mocha,S=M.S;return{mail:S.mail.map(l=>({h:l.h,t:new Date(l.t).toString().slice(0,21)})),box:S.mbox.map(m=>m.h),d:S.diary.filter(e=>e.t>Date.now()-24*3600e3).map(e=>new Date(e.t).toTimeString().slice(0,5)+' '+e.tag+': '+e.text.slice(0,60))}});
  console.log('    diary while away:\n     '+r.d.join('\n     '));ok(r.mail.some(l=>l.h==='care')||r.box.includes('care'),'care package delivered while away (opened: '+JSON.stringify(r.mail)+', box: '+r.box+')');
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- Claude mind (mock)
if(want('mind')){console.log('== mind (mock) Oct 31 18:30');const {ctx,p,errs}=await open(b,'desktop',9,31,18.5);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  await E(()=>{const M=window.__mocha;window.__prompts=[];M.MIND.api=async(prompt)=>{window.__prompts.push(prompt);return{text:JSON.stringify({diary:'Opened a box from Mom and Dad on Halloween night! The taffy smells like the boardwalk.',enjoyed:.9,tags:['family'],letter:'Dear Mocha, happy Halloween from the lighthouse! Dad put a pumpkin in the lamp room and the boats keep honking at it. Wear your hat tonight! love, Mom & Dad',next:{place:'home',spot:null,doing:'trick-or-treating',say:'trick or treat time!',holiday:'trick'}})}};M.MIND.on=true;M.MIND.last=0;M.MIND.backoff=0;M.forceAct(M.ACTS.find(a=>a.fx==='mail'));return 1});
  let r=await E(tickUntil("window.__prompts.length>0",4000));ok(r>=0,'mind asked after checking the mail');
  r=await until(p,()=>{const M=window.__mocha;return M.S.mail.length&&!M.MIND.busy&&M.S.mail[0]},null,8000);ok(r&&/pumpkin in the lamp room/.test(r.text),'Claude wrote the letter');
  r=await E(()=>{const pr=window.__prompts[0];return{cal:/Calendar: today is/.test(pr),wait:/MAIL IS WAITING/.test(pr),letter:/"letter"/.test(pr),hol:/"holiday"/.test(pr),trick:/"trick"/.test(pr),d:window.__mocha.S.diary.filter(e=>/boardwalk/.test(e.text)).length,act:window.__mocha.G.act&&window.__mocha.G.act.hx}});
  ok(r.cal&&r.wait&&r.letter&&r.hol&&r.trick,'prompt has calendar, mail, letter + holiday fields: '+JSON.stringify(r));ok(r.d===1,'mind diary used once');ok(r.act==='trick','next.holiday -> trick-or-treating');
  r=await E(()=>{const M=window.__mocha,o={};M.applyMind({next:{place:'home',spot:'desk',doing:'checking my calendar'}},null);o.cal=M.G.act.fx;M.applyMind({next:{place:'home',spot:'desk',doing:'checking the mail'}},null);o.mail=M.G.act.fx+'@'+M.G.act.s;return o});ok(r.cal==='calendar'&&r.mail==='mail@mailbox','mind doing -> calendar/mail acts: '+JSON.stringify(r));
  await E(()=>{const M=window.__mocha;M.MIND.on=false;M.MIND.api=null;return 1});ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}
// ---------------------------------------------------------------- calendar tab on phones
if(want('ui')){for(const vn of ['portrait','landscape','unfolded']){console.log('== ui',vn);const {ctx,p,errs}=await open(b,vn,9,31,18.5);const E=(f,a)=>p.evaluate(f,a);await E(prep);
  await E(`(()=>{const M=window.__mocha;M.forceAct(M.ACTS.find(a=>a.fx==='mail'));return 1})()`);await E(tickUntil("M.S.mail.length>0",4000));
  await E(()=>{document.getElementById('bookBtn').click();return 1});await p.waitForTimeout(700);await p.click('nav button[data-tab="cal"]').catch(async()=>{await E(()=>{document.querySelector('nav button[data-tab="cal"]').click()})});await p.waitForTimeout(800);
  await p.screenshot({path:OUT+`ui-cal-${vn}.png`});await E(()=>{const t=document.getElementById('tab-cal');t.scrollTop=t.scrollHeight;document.querySelector('.letter')&&document.querySelector('.letter').click();return 1});await p.waitForTimeout(500);await p.screenshot({path:OUT+`ui-cal2-${vn}.png`});
  const r=await E(()=>{const g=document.querySelector('.calGrid').getBoundingClientRect(),c=document.querySelector('.cd').getBoundingClientRect(),t=document.getElementById('tab-cal').getBoundingClientRect();return{gw:g.width,tw:t.width,cw:c.width,ch:c.height}});ok(r.gw<=r.tw+1&&r.ch>=40,'grid fits: '+JSON.stringify(r));
  ok(errs.length===0,'no errors '+JSON.stringify(errs.slice(0,4)));await ctx.close()}}
await b.close();console.log(fails.length?`\n${fails.length} FAILED:\n- `+fails.join('\n- '):'\nALL PASSED');process.exit(fails.length?1:0)})();

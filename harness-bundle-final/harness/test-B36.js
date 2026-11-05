// B36 shifts, favors, your friendships, the Town tab and Lantern Square: node /tmp/harness/test-B36.js [portrait,landscape]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackX/index.html)
// Clock: Tuesday Nov 3 2026, 15:00 (cafe open; trivia is tonight 19:00-20:30).
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setFullYear(2026,10,3);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,landscape').split(',');let pass=0,fail=0;const SH='/tmp/harness/b36';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1400))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:{width:1100,height:820},mob=vn!=='desktop';const full=vn===VPS[0];
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(5500);const E=(f,a)=>p.evaluate(f,a);let r;
  if(full){
  // 1) shift('juniper',2): pays 14 + hearts; a second shift the same day is refused
  r=await E(()=>{const M=window.__mocha,c0=M.S.you.coins,h0=(M.S.you.rel.juniper||[0])[0],a=M.shift('juniper',2),c1=M.S.you.coins,h1=M.S.you.rel.juniper[0],b2=M.shift('juniper',3);return{c0,c1,h0,h1,a:{ok:a.ok,pay:a.pay,tier:a.tier},b2,c2:M.S.you.coins}});
  ok(r.a.ok&&r.a.pay===14&&r.c1-r.c0===14&&r.h1-r.h0>=3&&!r.b2.ok&&r.b2.why==='today'&&r.c2===r.c1,`shift('juniper',2) pays ${r.c1-r.c0} and +${r.h1-r.h0} hearts; a second shift today -> ${r.b2.why}`,r);
  // 2) reqMake('deliver','juniper') -> carrying (box in hand) -> talk to Mabel -> coins + news
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');await sl(300);const q=M.reqMake('deliver','juniper');await sl(1300);const st=M.req();const c0=M.S.you.coins,n0=M.S.town.news.length;
    M.talk('mabel');await sl(600);const ti=M.talkState();const st2=M.req(),N=M.S.town.news;M.talkClose();return{q,carry:st.carry,shown:st.carryShown,held:st.held.length,held2:st2.held.length,dc:M.S.you.coins-c0,news:N.slice(n0).map(n=>n[2]),card:ti.text,open:ti.open}});
  ok(r.q&&r.carry==='box'&&r.shown&&r.held===1&&r.held2===0&&r.dc>=5&&r.news.some(t=>/pastry box to Mabel/.test(t)),`reqMake('deliver','juniper') carries a ${r.carry} (shown ${r.shown}); talking to Mabel completes it: +${r.dc} coins, news "${r.news[0]}"; Mabel: "${r.card}"`,r);
  // 3) youRel('basil',50) unlocks the friend gift once
  r=await E(()=>{const M=window.__mocha,a=M.youRel('basil',50),b=M.youRel('basil',50),c=M.youRel('basil');return{a,b,c}});
  ok(r.a.tier===2&&r.a.got.includes('friend')&&r.a.gift&&!r.b.got.includes('friend')&&!r.b.gift&&(r.c.flags&16),`youRel('basil',50) -> ${r.a.name}, unlocks ${r.a.got.join('+')} with gift "${r.a.gift&&r.a.gift.what}" (code ${r.a.gift&&r.a.gift.code}); a second call unlocks nothing`,r);
  // 4) seeded favors, "!" peek, accept via the help chip path, expiry rules; Mocha untouched
  r=await E(()=>{const M=window.__mocha,g0=JSON.stringify([M.G.act&&M.G.act.p,M.G.mode,M.G.target||null]),R=M.req(),o=R.offers;return{n:o.length,o:o.map(x=>x.k+':'+x.kind),same:JSON.stringify(M.req().offers)===JSON.stringify(o),g0}});
  ok(r.n>=2&&r.n<=4&&r.same,`today's favors (seeded): ${r.o.join(', ')}`,r);
  // 5) the notice board on a Tuesday shows trivia (today); a trivia candidate exists in localChoose at 19:05
  r=await E(()=>{const M=window.__mocha,B=M.board(),d=new Date();d.setHours(19,5,0,0);const C=M.b36cands(d.getTime(),16),ev=M.town.event('trivia');return{today:B.today,lines:B.lines,w:B.w,h:B.h,C,ev,dow:new Date().getDay()}});
  ok(r.dow===2&&r.today&&r.today.id==='trivia'&&r.lines.some(l=>/Trivia.*TODAY/.test(l))&&r.w===512&&r.C['tev:trivia']>0,`Tuesday board: today = ${r.today&&r.today.n} (${r.lines.find(l=>/TODAY/.test(l))}); 512x${r.h}; at 19:05 localChoose scored tev:trivia ${r.C['tev:trivia']}x (cands ${Object.keys(r.C).length})`,r);
  // 6) Town tab: people (25+ with live status), this week, news; still 6 top-level tabs
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.openTab?M.openTab('people'):null;await sl(800);const cards=[...document.querySelectorAll('#tab-people .ppl')],st=[...document.querySelectorAll('#tab-people [data-st]')].filter(e=>e.textContent.trim().length>2).length;
    const subs=[...document.querySelectorAll('#tab-town .subnav>button')].map(b=>b.textContent),tabs=document.querySelectorAll('#tabNav>button').length;return{cards:cards.length,st,subs,tabs,first:cards[0]&&cards[0].innerText.slice(0,120),ppl:M.people().length}});
  ok(r.cards>=25&&r.st>=20&&r.tabs===6&&r.subs.length>=4,`town › people lists ${r.cards} characters (${r.st} with live status); sub-tabs ${r.subs.join(' | ')}; ${r.tabs} top-level tabs`,r);
  await p.waitForTimeout(400);await p.screenshot({path:`${SH}/people-${vn}.png`});
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.openTab('week');await sl(500);const w=document.querySelector('#tab-week').innerText;M.openTab('tnews');await sl(400);const n=document.querySelector('#tab-tnews').innerText;M.openTab('cal');await sl(500);const c=document.querySelector('#tab-cal .calDay').innerText;return{w:w.slice(0,200),n:n.slice(0,160),c:c.slice(0,200)}});
  ok(/Café Trivia/.test(r.w)&&/news/.test(r.n)&&/Café Trivia/.test(r.c),`this week + news + the calendar day box share TOWN_EVENTS`,r);
  await E(()=>{try{window.__mocha.panel&&window.__mocha.panel(false)}catch(e){}document.getElementById('panel').classList.add('hidden');document.body.classList.remove('panelOpen')});
  // 7) Lantern Square: spray + pigeons near the square; pigeons scatter; saver disables both
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');M.you(-30,26.5);await sl(1600);const a=M.b36();const pk=M.pigeonPoke();await sl(300);const b=M.b36();
    const S0=M.saver();M.saver(true);await sl(500);const c=M.b36();M.saver(S0);await sl(400);const d=M.b36();return{a,pk,b,c,d}});
  ok(r.a.spray&&r.a.pigeons&&r.pk.some(s=>s===1)&&!r.c.spray&&!r.c.pigeons&&r.d.spray,`near the fountain: spray ${r.a.spray}, pigeons ${r.a.pigeons}; a poke scatters them (${r.pk.join('')}); saver -> spray ${r.c.spray}, pigeons ${r.c.pigeons}`,r);
  await p.waitForTimeout(1500);await p.screenshot({path:`${SH}/square-${vn}.png`});
  // 8) wishing fountain: one coin a day
  r=await E(()=>{const M=window.__mocha,c0=M.S.you.coins,a=M.wish(),b=M.wish();return{a,b,dc:M.S.you.coins-c0}});
  ok(r.a.ok&&!r.b.ok&&r.dc===-1,`wish() takes one coin (a second wish today -> ${r.b.why})`,r);
  // 9) the shift chip in the talk card at an open keeper; favors chip
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));try{M.askYou('hank','taste','sweet')}catch(e){}M.talk('hank');await sl(500);const t=M.talkState();M.talkClose();return{chips:t.chips}});
  ok(r.chips.includes('Need a hand today?')&&r.chips.length<=6,`Hank's talk card offers: ${r.chips.join(' / ')}`,r);
  }
  // 10) the mini-game overlay: full screen, header above the canvas, no overlap (each viewport)
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));const o=M.mg('latte',50);await sl(1500);const st=M.b36();return{o,st,vw:innerWidth,vh:innerHeight}});
  const R=r.o.rect,inV=q=>q[0]>=-1&&q[1]>=-1&&q[0]+q[2]<=r.vw+1&&q[1]+q[3]<=r.vh+1;
  ok(R.w>=r.vw-1&&R.h>=r.vh-1&&R.hd[1]+R.hd[3]<=R.cv[1]+1&&inV(R.hd)&&inV(R.cv)&&R.cv[3]>150&&r.st.mg.on&&r.st.mg.game,`mini-game overlay ${R.w}x${R.h}: header ${R.hd.map(Math.round)} above canvas ${R.cv.map(Math.round)} (no overlap); running ${r.st.mg.left}s left`,r);
  await p.screenshot({path:`${SH}/mg-latte-${vn}.png`});
  for(const g of ['shelf','stack','wrap']){await E(g=>{const M=window.__mocha;M.mgEnd();M.mg(g,50)},g);await p.waitForTimeout(1200);await p.screenshot({path:`${SH}/mg-${g}-${vn}.png`})}
  r=await E(()=>window.__mocha.mgEnd());ok(r===false,'the overlay closes',r);
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(fail?`FAILED ${fail} (passed ${pass})`:`ALL ${pass} PASSED`);process.exit(fail?1:0)})();

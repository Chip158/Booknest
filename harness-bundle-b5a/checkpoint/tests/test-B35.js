// B35 gathering, field notes, fishing, crab pot, crow trinkets: node /tmp/harness/test-B35.js [portrait,desktop]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(9,14);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;const SH='/tmp/harness/b35';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1400))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:{width:1100,height:820},mob=vn!=='desktop';
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(11));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(5000);const E=(f,a)=>p.evaluate(f,a);let r;
  // 1) spawns: 8-14 at walkable points, deterministic per date; gather adds an item + sticker + fact
  r=await E(()=>{const M=window.__mocha,a=M.spawns(),a2=M.spawns(),pk0=M.S.you.pk,g=M.gather(0),g2=M.gather(0);return{n:a.length,allW:a.every(s=>s.walkable),codes:a.map(s=>s.code),pos:a.map(s=>[s.x,s.z]),same:JSON.stringify(a.map(s=>[s.code,s.x,s.z]))===JSON.stringify(a2.map(s=>[s.code,s.x,s.z])),g:Object.assign({},g,{sticker:!!g.sticker}),g2,pk0,pk1:M.S.you.pk,fn:M.S.you.fn,b35:M.b35()}});
  const sp1=JSON.stringify(r.pos);
  ok(r.n>=8&&r.n<=14&&r.allW&&r.same&&r.g.ok&&r.g.sticker&&r.g.fact.length>10&&r.g.first&&r.pk1.includes(r.g.code)&&r.fn.includes(r.g.code)&&!r.g2.ok,`spawns() gives ${r.n} finds at walkable points (${r.codes.join(',')}); gather(0) -> ${r.g.name} in ${r.g.where}, sticker + fact, Rosalind +${r.g.pay}; a 2nd gather(0) is refused; ims ${JSON.stringify(r.b35.ims)}`,r);
  // 2) same date -> same spawns after a reload; gathered bit persists
  await E(()=>{try{window.__mocha.save&&window.__mocha.save()}catch(e){}});await p.waitForTimeout(800);await p.reload();await p.waitForTimeout(5000);
  r=await E(()=>{const M=window.__mocha,a=M.spawns();return{pos:JSON.stringify(a.map(s=>[s.x,s.z])),got0:a[0].got}});
  ok(r.pos===sp1,`the same date gives the same spawns across a reload (gathered #0 still gathered: ${r.got0})`,{a:r.pos,b:sp1});
  // 3) walk-mode proximity pick-up + sparkles + critter spot
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');const s=M.spawns().find(x=>!x.got);M.you(s.x+.5,s.z);await sl(1500);const after=M.spawns().find(x=>x.i===s.i);
    const sp=M.spot('kfrg'),sp2=M.spot('kfrg');return{i:s.i,got:after.got,b:M.b35(),sp,sp2}});
  ok(r.got&&r.b.spark>=0&&r.sp.ok&&r.sp.first&&r.sp.fact.includes('state amphibian')&&!r.sp2.first,`walking within 1.2 picks up find #${r.i}; sparkles ${r.b.spark}; spot('kfrg') logs the Pacific chorus frog once (+${r.sp.pay})`,r);
  await p.waitForTimeout(800);await p.screenshot({path:`${SH}/walk-${vn}.png`});
  // 4) fishing: fishBite() + a tap as the ring meets the lure -> reel -> catch card
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.S.you.day.fish=0;M.S.you.gear|=1;M.you(-80,14);await sl(600);const b=M.fishBite({sp:'prch',reel:'auto'});
    await new Promise(res=>{const w=()=>{if(performance.now()>=b.meet-5){const ov=document.getElementById('b35fish');ov.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));res()}else setTimeout(w,2)};w()});
    const st1=M.fishState();let st=st1;for(let i=0;i<60;i++){await sl(250);st=M.fishState();if(st&&st.ph==='card')break}const card=document.querySelector('.b35card');return{b,st1,st,card:card?card.innerText:null,btns:card?[...card.querySelectorAll('button')].map(x=>x.textContent):[]}});
  ok(r.st1&&r.st1.ph==='reel'&&r.st.ph==='card'&&r.card&&r.btns.some(t=>t.includes('keep'))&&r.btns.some(t=>t.includes('sell')),`fishBite() then a tap as the ring meets the lure -> reel -> catch card (${(r.card||'').split('\n')[0]}; buttons ${r.btns.join(' / ')})`,r);
  await p.screenshot({path:`${SH}/catch-${vn}.png`});
  // 5) quillback + steelhead auto-release with the true note and no keep/sell buttons
  r=await E(()=>{const M=window.__mocha,o={};for(const sp of ['quil','stee']){const c=M.fishBite({sp,instant:1}),card=document.querySelector('.b35card');o[sp]={released:c.released,note:c.note,btns:[...card.querySelectorAll('button')].map(x=>x.textContent),text:card.innerText}}return o});
  ok(r.quil.released&&/all rockfish must be released/.test(r.quil.note)&&/descending device/.test(r.quil.text)&&r.stee.released&&/Endangered Species Act/.test(r.stee.note)&&[...r.quil.btns,...r.stee.btns].every(t=>!/keep|sell/i.test(t)),`quillback and steelhead auto-release with their true notes, no keep/sell buttons (${r.quil.btns.join('/')})`,r);
  await p.screenshot({path:`${SH}/release-${vn}.png`});
  // 6) after 10 catches the 11th cast says the fish are quiet
  r=await E(()=>{const M=window.__mocha;M.fishEnd();M.S.you.day.fish=0;for(let i=0;i<10;i++)M.fishBite({sp:'hrng',instant:1});M.fishEnd();const c=M.fishCast({force:1}),b=M.fishBite();return{fish:M.S.you.day.fish,c,b}});
  ok(r.fish===10&&r.c.quiet&&r.b.quiet,`10 catches, then the 11th cast says the fish are quiet`,r);
  // 7) crab pot: crabReady() after 8 h gives crabs; a female Dungeness auto-releases with a note
  r=await E(()=>{const M=window.__mocha;const st0=M.crabStatus(),c=M.crabReady({first:'dungF'}),st1=M.crabStatus(),txt=document.querySelector('.b35card').innerText;return{st0,c,st1,txt}});
  const f0=r.c.crabs&&r.c.crabs[0];ok(r.c.ok&&r.c.crabs.length>=1&&r.c.crabs.length<=3&&f0.sp==='dung'&&f0.sex==='female'&&!f0.keep&&/Female Dungeness/.test(f0.note)&&!r.st1.down,`crabReady() after 8 h hauls ${r.c.crabs.length} crab(s); the female Dungeness is auto-released (${f0&&f0.note}); surprise ${r.c.surprise}`,r);
  await p.screenshot({path:`${SH}/crab-${vn}.png`});
  // 8) crow trinkets: peanuts out overnight -> at most one seeded trinket the next morning
  r=await E(()=>{const M=window.__mocha,y=M.S.you;y.crow.d=0;y.home.pea=0;const none=M.crowGift();y.home.pea=Date.now()-20*36e5;const g=M.crowGift({sure:1}),g2=M.crowGift({sure:1});y.crow.d=0;y.home.pea=Date.now()-20*36e5;const g3=M.crowGift();return{none,g,g2,g3,mb:y.home.mb,pk:y.pk}});
  ok(!r.none.got&&r.g.got&&/^t/.test(r.g.got)&&!r.g2.got&&r.g2.why==='today'&&r.pk.includes(r.g.got)&&r.mb>=1,`no peanuts -> nothing; peanuts overnight -> ${r.g.who} leaves a ${r.g.got} (mailbox ${r.mb}); a second check the same day -> nothing; seeded roll -> ${r.g3.got}`,r);
  // 9) field notes book renders; facts table present; autonomy: Mocha's act untouched
  r=await E(()=>{const M=window.__mocha,a=M.G?JSON.stringify([M.G.act&&M.G.act.p,M.G.mode]):'';const fo=M.fnOpen(),f=M.fnFacts();return{fo,nf:f.length,empty:f.filter(x=>!x[2]).length,clash:M.fnClash()}});
  ok(r.fo.n>=4&&r.nf>=40&&r.empty===0&&!r.clash.length,`the Field Notes book opens (${r.fo.n}/${r.fo.tot}); FN has ${r.nf} entries, each with one fact`,r);
  await p.waitForTimeout(500);await p.screenshot({path:`${SH}/book-${vn}.png`});
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(fail?`FAILED ${fail} (passed ${pass})`:`ALL ${pass} PASSED`);process.exit(fail?1:0)})();

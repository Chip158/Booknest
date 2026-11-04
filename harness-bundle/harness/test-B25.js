// B25 wallet & shopping acceptance: node /tmp/harness/test-B25.js [portrait,landscape,duo,desktop]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackB/index.html)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${h},0,0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;const SH='/tmp/harness/b25/shots';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1200))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:vn==='duo'?{width:900,height:1000}:{width:1100,height:820},mob=vn!=='desktop';
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(12));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);let r;
  // 1) the save: S.you wallet fields, ints and short codes, <= 8 KB
  r=await E(()=>{const M=window.__mocha,y=M.you();return{coins:y.coins,keys:['coins','led','store','pk','cat','wish','st','day','streak','giftDay'].filter(k=>!(k in y)),size:M.youSize(),day:y.day,sd:M.S.shopDay}});
  ok(r.coins===120&&!r.keys.length&&r.size<=8192&&r.day.k>0&&r.sd&&r.sd.k===r.day.k,`S.you has coins (120), led, store, pk, cat, wish, st, day, streak, giftDay; youSize ${r.size} B <= 8 KB; day rollover set dayKey`,r);
  // 2) walk into Evergreen at 12:00: >= 16 items on the shelves
  r=await E(async()=>{const M=window.__mocha,ev=M.byId.evergreen,sl=ms=>new Promise(r=>setTimeout(r,ms));M.setCamMode('walk');M.you(ev.x,ev.z-1);await sl(2500);return M.stock('evergreen')});
  ok(r.built&&r.items>=16&&r.n>=16&&r.list.filter(x=>x.pick).length===1,`inside Evergreen: ${r.items} items on today's shelves (stockFor ${r.n}), one Keeper's Pick at 20% off`,{n:r.n,items:r.items,built:r.built,picks:r.list.filter(x=>x.pick)});
  const pure=await E(()=>{const M=window.__mocha,a=JSON.stringify(M.stockFor('evergreen',20261101)),bb=JSON.stringify(M.SHOP.mem['evergreen:20261101']);delete M.SHOP.mem['evergreen:20261101'];const c=JSON.stringify(M.stockFor('evergreen',20261101)),d=JSON.stringify(M.stockFor('evergreen',20261102));return{same:a===c,diff:a!==d}});
  ok(pure.same&&pure.diff,'stockFor(shop,dayKey) is pure (same day, same stock after clearing the memo) and different tomorrow',pure);
  // 3) tap an item on the shelf -> the Item Card
  let tapped=null,pick=[];for(let i=0;i<6&&!tapped;i++){const L=await E(()=>window.__mocha.stock('evergreen').list.filter(x=>{if(!x.scr||x.sold)return false;const e=document.elementFromPoint(x.scr[0],x.scr[1]);return e&&e.tagName==='CANVAS'&&x.scr[1]>120&&x.scr[1]<innerHeight-140}));pick=L;const it=L[i%Math.max(1,L.length)];if(!it)break;
    if(mob)await p.touchscreen.tap(it.scr[0],it.scr[1]);else await p.mouse.click(it.scr[0],it.scr[1]);await p.waitForTimeout(500);const c=await E(()=>window.__mocha.card());if(c.open&&c.mode==='card')tapped={it:Object.assign({},it,{slot:c.card.slot,code:c.card.code}),c}}
  ok(!!tapped,'a tap on a shelf item opens its Item Card',{cands:pick.length,tapped});
  if(!tapped){const it=r.list.find(x=>!x.sold);await E(s=>window.__mocha.card(s),it.code);tapped={it,c:await E(()=>window.__mocha.card())}}
  await p.waitForTimeout(800);await p.screenshot({path:`${SH}/card-${vn}.png`});
  r=await E(()=>{const M=window.__mocha,c=M.card(),el=document.querySelector('#ish'),R=el.getBoundingClientRect();return{c,inView:R.left>=0&&R.top>=0&&R.right<=innerWidth+.5&&R.bottom<=innerHeight+.5,scrollW:el.scrollWidth<=el.clientWidth+1,sw:el.querySelectorAll('.ishSw button').length,small:[...el.querySelectorAll('button')].filter(b=>b.offsetHeight&&b.offsetHeight<44).map(b=>b.textContent)}});
  ok(r.c.open&&/Buy/.test(r.c.buttons.join())&&/Wishlist/.test(r.c.buttons.join())&&r.sw>=2&&r.inView&&r.scrollW&&!r.small.length,'the card shows name, price, swatches, Buy and Wishlist; it fits the viewport; all buttons >= 44 px',r);
  // 4) Buy through the card's own button
  const before=await E(()=>window.__mocha.you().coins);await p.click('#ish [data-a="buy"]');await p.waitForTimeout(900);
  r=await E(s=>{const M=window.__mocha,y=M.you(),st=M.stock('evergreen'),e=st.list.find(x=>x.slot===s);return{coins:y.coins,e,cards:st.cards,store:y.store,pk:y.pk,led:y.led.slice(-1)[0],btn:M.card().buttons,st:y.st}},tapped.it.slot);
  ok(r.coins===before-r.e.price&&r.e.sold&&r.cards.some(c=>c.slot===tapped.it.slot&&c.v===0)&&(r.store+r.pk).includes(tapped.it.code+'.')&&r.led[1]===-r.e.price&&/SOLD/.test(r.btn.join()),`Buy lowers S.you.coins (${before} -> ${r.coins}), the slot shows a SOLD card, the item is stored (${r.store||r.pk}), ledger row ${JSON.stringify(r.led)}`,r);
  // 5) "See everything here" grid
  r=await E(()=>{const M=window.__mocha;M.openAll('evergreen');const el=document.querySelector('#ish'),R=el.getBoundingClientRect(),cells=el.querySelectorAll('.isgC').length,sold=el.querySelectorAll('.isgC.sold').length,ord=[...el.querySelectorAll('[data-a="ord"]')].length;return{cells,sold,ord,n:M.stock('evergreen').n,inView:R.left>=0&&R.top>=0&&R.right<=innerWidth+.5&&R.bottom<=innerHeight+.5}});
  await p.waitForTimeout(900);await p.screenshot({path:`${SH}/all-${vn}.png`});
  ok(r.cells===r.n+r.ord&&r.sold>=1&&r.ord===3&&r.inView,`"See everything here" lists today's ${r.n} items (sold marked) plus Otis's order desk, within the viewport`,r);
  await E(()=>window.__mocha.shClose());
  // 6) Mocha buys a slot -> "sold to Mocha"; his essentials stay at Otis's desk
  r=await E(()=>{const M=window.__mocha,st=M.stock('evergreen'),e=st.list.find(x=>!x.sold&&!x.mocha),c0=M.S.coins,res=M.mochaBuy('evergreen',e.slot),after=M.stock('evergreen');return{res,slot:e.slot,mocha:after.list.find(x=>x.slot===e.slot).mocha,card:after.cards.find(c=>c.slot===e.slot),c0,c1:M.S.coins,again:M.mochaBuy('evergreen',e.slot).ok,desk:M.orderDesk(),ord:M.mochaOrder('bed')}});
  ok(r.res.ok&&r.res.label==='sold to Mocha'&&r.mocha&&r.card&&r.card.v===1&&!r.again&&r.desk.length===3&&r.desk.every(d=>d.available)&&r.ord.ok,'mochaBuy(shop,slot) marks the slot "sold to Mocha" (its own card on the shelf); bed, stove and couch stay at Otis\'s order desk',r);
  // 7) wallet HUD slot, addCoins clamps at 0, CSS-transform coin fly
  r=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),w=document.querySelector('#wallet'),vis=w&&getComputedStyle(w).display!=='none'&&w.getBoundingClientRect().width>0,R=w&&w.getBoundingClientRect();
    const z=M.addCoins(-999999),up=M.addCoins(12);await sl(60);const f=M.addCoins(5);return{hudS:M.HUD&&M.HUD.S.wallet&&{on:M.HUD.S.wallet.on,folded:M.HUD.S.wallet.folded,zone:M.HUD.S.wallet.zone},more:Object.values((M.HUD||{}).more||{}).map(b=>b.style.display),vis,rect:R&&[R.left,R.top,R.width,R.height],hud:w&&w.classList.contains('hudS'),zero:z.coins,up:up.coins,led:up.led,fly:f.fly,n:document.querySelectorAll('.cfly').length,walN:document.querySelector('#walN').textContent}});
  ok((r.vis||r.hudS&&r.hudS.folded)&&r.hud&&r.zero===0&&r.up===12&&r.led[1]===12&&r.n<=4&&r.fly.length<=4&&r.fly.some(f=>f.on&&/translate/.test(f.tf))&&r.fly.every(f=>!f.left&&!f.top&&f.pos==='fixed'),'wallet is a HUD slot in walk mode; addCoins never goes below 0; the pooled coin fly-in (<=4) moves by CSS transform only',r);
  // 8) Today card + Neighbor Dividend
  r=await E(()=>{const M=window.__mocha,c0=M.you().coins,a=M.collectGazette(),c1=M.you().coins,b=M.collectGazette(),t=M.todayCard();return{a,b,d:c1-c0,t:{rows:t.rows,html:t.html,picks:t.picks.length,g:t.gazette,stamps:t.stamps},sub:document.querySelectorAll('#ySub [data-go]').length,pk:!!document.querySelector('#yPk'),led:!!document.querySelector('#yLed')}});
  ok(r.a===15&&r.d===15&&r.b===0&&r.t.html&&r.t.rows>=3&&r.t.picks>=1&&r.sub>=3&&r.pk&&r.led,'Neighbor Dividend +15 once a day; the Today in Rain City card, you-tab sub-sections, pockets and ledger render',r);
  await p.waitForTimeout(600);await p.screenshot({path:`${SH}/you-${vn}.png`});
  // 9) reload: still sold today; newDay restocks; youSize
  const slot=tapped.it.slot;await p.reload();await p.waitForTimeout(4500);
  r=await E(s=>{const M=window.__mocha,a=M.stock('evergreen').list.find(x=>x.slot===s),d0=M.curDay(),nd=M.newDay(),b=M.stock('evergreen').list.find(x=>x.slot===s);return{sold:a.sold,d0,nd:nd.k,after:b,sd:nd.shopDay,size:M.youSize(),store:M.you().store+M.you().pk,streak:nd.streak}},slot);
  ok(r.sold&&r.nd!==r.d0&&r.after&&!r.after.sold&&!r.after.mocha&&!Object.keys(r.sd.sold).length&&r.store.length>0&&r.size<=8192,`after reload the slot is still SOLD; newDay(${r.nd}) restocks it; the purchase stays stored; youSize ${r.size} B`,r);
  ok(!errs.length,'no page errors',errs);await ctx.close()}
await b.close();console.log(`${pass}/${pass+fail} PASS`);process.exit(fail?1:0)})();

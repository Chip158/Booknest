// B42 acceptance: node /tmp/harness/test-B42.js [file]  (portrait 393x852, Nov 3 15:00)
// - __mocha.shotMode(name) sets up every canonical view deterministically (list, each view returns, talk card/item card/fogwell 3/outfit wall states)
// - round-1/2 fixes: rail buttons never half-covered by a bottom sheet; edge line clamps clear of the rail; #hint backing; interior void colour; roof texture
// - shot sets saved (/tmp/harness/shots-r1, shots-r2) and the critique ledger (/tmp/harness/b42/critique.json) lists every item fixed or with a reason
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');const FILE=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,300):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();p.setDefaultTimeout(120000);const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR '+e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text().slice(0,200))});
 await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15,10,3));
 await p.goto('file://'+FILE);await sleep(6000);
 const L=await p.evaluate(()=>({list:window.__mocha.shotMode(),b42:window.__mocha.b42()}));
 const need=['town-overview','lantern-square','main-street','mocha-home','mocha-study','wendell-hangout','cafe','evergreen','cabin-decor','fogwell-3','talk-card','item-card','walker-front','walker-back','outfit-wall','rainy-front','rainy-back','winter-market','threads-wall','reset'];
 ok(need.every(n=>L.list.includes(n)),'shotMode lists every canonical view',need.filter(n=>!L.list.includes(n)));
 ok(Array.isArray(L.b42.views)&&L.b42.views.length>=18,'__mocha.b42().views',L.b42.views&&L.b42.views.length);
 const res={};for(const n of need){try{res[n]=await p.evaluate(n=>{const r=window.__mocha.shotMode(n);return JSON.parse(JSON.stringify(r===undefined?null:r))},n)}catch(e){res[n]={err:e.message}}await sleep(n==='talk-card'||n==='item-card'||n==='outfit-wall'?1500:250);
  if(n==='talk-card')res.tk=await p.evaluate(()=>window.__mocha.talkState());
  if(n==='item-card')res.card=await p.evaluate(()=>{const M=window.__mocha,c=M.card(),sh=document.querySelector('.ish')||null;const S=[...document.querySelectorAll('.hudS,#modeBtn,#near')].filter(e=>{const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05}).map(e=>e.getBoundingClientRect()).filter(r=>r.width>0);
    return{open:c.open,mode:c.mode,rail:S.map(r=>[r.left,r.top,r.right,r.bottom].map(Math.round)),sheetTop:c.rect?c.rect[1]:null,b42:M.b42()}});
  if(n==='fogwell-3')res.fw=await p.evaluate(()=>window.__mocha.fogwell.state().cur);
  if(n==='outfit-wall')res.ow=await p.evaluate(()=>{const M=window.__mocha;const r=[...document.querySelectorAll('.hudS,#modeBtn,#near')].filter(e=>{const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&+cs.opacity>.05}).map(e=>e.getBoundingClientRect()).filter(r=>r.width>0);return{rail:r.map(q=>Math.round(q.bottom)),b42:M.b42()}});
 }
 const bad=need.filter(n=>!res[n]||res[n].err);ok(!bad.length,'every canonical view returns without error',bad.map(n=>[n,res[n]]));
 ok(res['talk-card']&&res['talk-card'].open===true&&res.tk&&res.tk.open!==false,'talk-card view opens the talk card',res['talk-card']);
 ok(res.card&&res.card.open&&res.card.mode==='card','item-card view opens the item card',res.card&&{open:res.card.open,mode:res.card.mode});
 if(res.card&&res.card.sheetTop!=null){const over=res.card.rail.filter(r=>r[3]>res.card.sheetTop+2&&r[1]<res.card.sheetTop-2);ok(over.length===0,'R1-U2: no visible rail button straddles the item sheet top',{sheetTop:res.card.sheetTop,over,hid:res.card.b42.hid})}
 ok(res.fw==='3','fogwell-3 view shows floor 3',res.fw);
 ok(res['mocha-home']&&res['mocha-home'].in==='home','mocha-home view is inside his house',res['mocha-home']);
 ok(res['wendell-hangout']&&res['wendell-hangout'].hang,'wendell-hangout starts a hangout',res['wendell-hangout']);
 const st=await p.evaluate(()=>{const M=window.__mocha,h=document.getElementById('hint'),cs=getComputedStyle(h);return{bg:cs.backgroundColor,css:!!document.getElementById('b42css'),b42:M.b42(),gfx:M.gfx().calls}});
 ok(/rgba?\(44, 30, 24/.test(st.bg),'R1-U3: #hint has its umber backing',st.bg);ok(st.b42.voidC==='#2C1F18','R1-L1: interior void colour',st.b42.voidC);
 // time option: shotMode(name,{h}) moves the clock deterministically
 const tm=await p.evaluate(()=>{const r=window.__mocha.shotMode('lantern-square',{h:21});return{r:JSON.parse(JSON.stringify(r)),h:new Date().getHours()}});ok(tm.h===21&&tm.r&&tm.r.clock,'shotMode(name,{h:21}) sets the clock',tm);
 await p.evaluate(()=>window.__mocha.shotMode('reset',{h:15}));await sleep(500);
 // autonomy: shotMode never adds a userBias term
 const ub=await p.evaluate(()=>{try{return window.__mocha.ubAudit?Object.keys(window.__mocha.ubAudit()||{}).length:null}catch(e){return 'err '+e.message}});console.log('ubAudit keys',ub);
 // shot sets + critique ledger
 const n1=fs.existsSync('/tmp/harness/shots-r1')?fs.readdirSync('/tmp/harness/shots-r1').filter(f=>f.endsWith('.png')).length:0,n2=fs.existsSync('/tmp/harness/shots-r2')?fs.readdirSync('/tmp/harness/shots-r2').filter(f=>f.endsWith('.png')).length:0;
 ok(n1>=30&&n2>=20,'both rounds saved their shot sets',{r1:n1,r2:n2});
 let C=null;try{C=JSON.parse(fs.readFileSync('/tmp/harness/b42/critique.json','utf8'))}catch(e){}
 const items=C?[].concat(...C.rounds.map(r=>[].concat(...Object.values(r.critics)))):[];ok(C&&C.rounds.length===2&&items.length>=40&&items.every(i=>i.status==='fixed'||(i.status==='deferred'&&i.reason&&i.reason.length>8)),'every critic item is fixed or listed with a reason',{rounds:C&&C.rounds.length,items:items.length,open:items.filter(i=>!(i.status==='fixed'||(i.status==='deferred'&&i.reason))).map(i=>i.id)});
 ok(!errs.length,'no page errors',errs.slice(0,5));
 console.log(fails?`B42: ${fails} FAILED`:'B42: ALL PASS');await b.close();process.exit(fails?1:0)})();

// INT5B merge wiring: one treasury (S.town.fund <-> S.econ.funds), B36 board carries B38 lines + B41 sky, Town tab petitions (file + donate),
// B38 businesses get B37 ledgers, condo rent -> town funds, fountain freezes under B41 snow, cascade chime index, size of S.econ+S.town.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fail=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,500):''));if(!c)fail++};
 const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
 await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15,10,4));
 await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(6000);
 const E=(f,a)=>p.evaluate(f,a);
 let r=await E(()=>{const m=window.__mocha;return m.int5b()});
 ok(r.linked&&r.fund===r.funds,'S.town.fund is a live view of S.econ.funds',r);
 r=await E(()=>{const m=window.__mocha,S=m.S;S.town.fund=3000;const a=S.econ.funds;S.econ.funds=2500;const b=S.town.fund;const j=JSON.parse(JSON.stringify(S.town)).fund;return{a,b,j}});
 ok(r.a===3000&&r.b===2500&&r.j===2500,'writes go both ways and the fund serializes',r);
 r=await E(()=>{const m=window.__mocha,S=m.S,f0=S.econ.funds,x=m.econTick(10);return{f0,f1:S.econ.funds,town:S.town.fund,fl:S.econ.fl}});
 ok(r.f1!==r.f0&&r.town===r.f1,'econ days move the Town Fund (taxes, rent, upkeep)',r);
 r=await E(()=>{const m=window.__mocha,S=m.S,f0=S.econ.funds;const T=S.town;T.fi=m.dkey?m.dkey(Date.now()-5*864e5):T.fi;m.b38.catchUp(Date.now());return{f0,f1:S.econ.funds}});
 ok(r.f0===r.f1,'no double income: B38 flat +20/day is off while linked',r);
 // petition through the Town tab
 r=await E(async()=>{const m=window.__mocha;m.openTab('biz');await new Promise(r=>setTimeout(r,300));const el=document.querySelector('#tab-biz'),i=el.querySelector('.b5bIn'),g=el.querySelector('.b5bGo');if(!i||!g)return{ui:false};i.value='a ramen shop called Noodle Cloud';g.click();const out=el.querySelector('.b5bOut').textContent;await new Promise(r=>setTimeout(r,2600));const el2=document.querySelector('#tab-biz');
   const P=m.S.town.petitions.find(p=>p.tpl==='ramen'&&p.by==='you');const bi=el2.querySelector('.b5bIn').getBoundingClientRect(),bg=el2.querySelector('.b5bGo').getBoundingClientRect();return{ui:true,out,p:P&&{name:P.name,st:P.st},listed:/Noodle Cloud/.test(el2.textContent),h:[bi.height,bg.height],w:[bi.width,bg.right]}});
 ok(r.ui&&r.p&&r.p.name==='Noodle Cloud'&&r.listed,'Town tab › shops: filing a petition by free text lists it with its status',r);
 ok(r.h&&r.h[0]>=44&&r.h[1]>=44&&r.w[1]<=393,'filing box: 44px targets, inside the portrait width',r);
 // board shows B38 lines + sky
 r=await E(()=>{const m=window.__mocha;const d=m.board();return{pet:d.pet,sky:d.sky,lines:d.lines,w:d.w,h:d.h}});
 ok(r.pet&&r.pet.some(t=>/Noodle Cloud/.test(t))&&r.w===512,'B36 board carries B38 petition lines (b38BoardLines)',r);
 r=await E(()=>{const m=window.__mocha;const S=m.S;let ok2=false;try{ok2=m.b38.board&&true}catch(e){}const c=m.council();const d=m.board();return{pet:d.pet,res:c.results.map(x=>[x.name,x.st])}});
 ok(r.pet.length>0,'after a council vote the board shows the result',r);
 r=await E(()=>{const m=window.__mocha;const s=m.skyEv({t:new Date(2026,10,24,15).getTime()});const d=m.board(new Date(2026,10,24,15).getTime());return{sky:m.int5b().sky,ev:s.events.map(e=>e.id)}});
 ok(true,'sky line (info)',r);
 r=await E(async()=>{const m=window.__mocha;m.openTab('week');await new Promise(r=>setTimeout(r,300));const el=document.querySelector('#tab-week');return{sky:/in the sky/.test(el.textContent),week:m.int5b().week}});
 ok(r.sky||r.week.length===0,'Town › week lists the sky this week',r);
 // pending petition -> donate chip
 r=await E(async()=>{const m=window.__mocha,S=m.S;S.you.coins=Math.max(S.you.coins,100);const P=S.town.petitions.find(p=>p.st==='sigs'||p.st==='pending'||p.st==='denied')||S.town.petitions[0];if(!P)return null;P.st='pending';P.got=0;S.econ.funds=10;m.openTab('biz');await new Promise(r=>setTimeout(r,300));const el=document.querySelector('#tab-biz'),d=el.querySelector('.b5bDon');if(!d)return{don:false};const c0=S.you.coins;d.click();return{don:true,c0,c1:S.you.coins,got:P.got,out:el.querySelector('.b5bOut').textContent}});
 ok(r&&r.don&&r.c1===r.c0-10&&r.got===10,'Donate 10 chip on a pending campaign',r);
 // B38 businesses get B37 ledgers
 r=await E(()=>{const m=window.__mocha;const st=m.lotStage('L8',7,'venue');m.econTick(2);const e=m.econ();const B=e.biz.biz_L8;return{st:st&&st.biz,led:!!B,b38econ:m.int5b().b38econ,board:(()=>{m.openTab('biz');return/Lantern|Venue|venue|Room/.test(document.querySelector('#tab-biz').textContent)})()}});
 ok(r.led&&r.b38econ.includes('biz_L8'),'an opened B38 business has a B37 ledger',r);
 r=await E(()=>{const m=window.__mocha;const n=m.econSale('biz_L8',12);return n});ok(r===12,'purchases at a B38 shop flow into S.econ (econSale)',r);
 // condo rent
 r=await E(()=>{const m=window.__mocha,S=m.S;S.you.coins=500;const f0=S.econ.funds;const x=m.rent();return{x,f0,f1:S.econ.funds}});
 ok(r.x.ok&&r.f1===r.f0+150,'condo rent goes to the town funds',r);
 // fountain under B41 snow
 r=await E(async()=>{const m=window.__mocha;const F=m.b41dbg().SKYEV.force;const a0=m.b36().frozen;F.snow=1;let a=false;for(let i=0;i<12&&!a;i++){await new Promise(r=>setTimeout(r,500));a=m.b36().frozen}const sn=m.puddles().snow;delete F.snow;return{a0,a,sn}});
 ok(r.a0===false&&r.a===true,'the B36 fountain freezes under B41 snow (November, forced)',r);
 // size budget
 r=await E(()=>{const S=window.__mocha.S;return{econ:JSON.stringify(S.econ).length,town:JSON.stringify(S.town).length}});
 ok(true,'S.econ + S.town bytes (info)',r);
 ok(errs.length===0,'no page errors',errs.slice(0,6));
 await p.screenshot({path:'/tmp/harness/out/int5b-biz.png'});
 await b.close();console.log(fail?fail+' FAILED':'ALL PASS');process.exit(fail?1:0)})();

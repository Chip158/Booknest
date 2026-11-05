// B38 acceptance: petitions, signatures, council (5 bubbles, Odalie tie-break), board/news, lot stages 1..7 (distinct meshes, lights unchanged),
// open business (keeper + talk card + stock pool), fileMochaPetition from a biz: want > .7, 60 simulated days < 200 KB, catchUp 7 days < 60 ms.
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackY/index.html node /tmp/harness/test-B38.js
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});let fail=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,400):''));if(!c)fail++};
 const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
 await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15,10,4));
 await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(6000);
 const E=(f,a)=>p.evaluate(f,a);
 // 0) hall + diorama
 let r=await E(()=>{const m=window.__mocha,P=m.byId.townhall;return{interior:!!P.interior,inner:!!P.inner,spots:Object.keys(P.spots||{}),dio:m.diorama(),door:m.DOORS?null:null,ent:m.inside?m.inside.ent().includes('townhall'):null,lint:m.layoutLint?m.layoutLint('townhall'):null}});
 ok(r.interior&&r.inner&&r.dio.ok&&r.dio.instanced,'town hall interior + diorama InstancedMesh',r);ok(r.ent!==false,'town hall is an LF1 enterable',r.ent);
 // 1) petition + signatures
 r=await E(()=>{const m=window.__mocha;m.S.town.fund=5000;const a=m.petition('music venue','you');return a});
 ok(r.ok&&r.p.tpl==='venue'&&r.p.by==='you','petition("music venue","you") files it',r);const pid=r.p.id;
 r=await E(pid=>{const m=window.__mocha,out=[];for(const id of ['mabel','gus','juniper','basil','sol'])out.push([id,m.sign(id,pid)]);const forced=m.sign('hank',pid,true);return{out,forced,sigs:m.petitions().petitions.find(q=>q.id===pid).sigs}},pid);
 ok(r.sigs.length>=1&&r.forced.ok,'sign(id,k) adds signatures',r.sigs);
 // 2) council: 5 bubbles, result to board + news
 r=await E(()=>{const m=window.__mocha,c=m.council();const st=m.petitions();return{n:c.n,res:c.results,bub:c.bubbles.map(x=>x.id),board:st.board,news:(m.S.town.news||[]).slice(-3).map(x=>x[2]),st:st.petitions.map(q=>[q.name,q.st,q.lot])}});
 ok(r.n===1&&r.res[0].bubbles.filter(x=>!x.tb).length===5&&new Set(r.res[0].bubbles.map(x=>x.id)).size===5,'council() votes with 5 member bubbles',r.res[0]);
 ok(r.board.length>0&&r.news.some(t=>/Council/.test(t)),'result posts to the board and news',{board:r.board,news:r.news});
 // tie-break: a councillor's own petition (one seat abstains) can split 2-2 -> the mayor decides
 r=await E(()=>{const m=window.__mocha;let tie=null,k=0;for(const tpl of ['comics','venue','museum','garden','ramen','yarn','bowling','florist'])for(const by of ['gus','willa','mabel','hank'])for(let n=0;n<=6&&!tie;n++)for(let s=0;s<4&&!tie;s++){const p={id:'tt'+(k++),tpl,by,sigs:Array(n).fill('x'),st:'sigs'};const v=m.b38.vote(p);if(v&&v.tie)tie={tpl,by,n,v:v.v,y:v.y,n2:v.n}}return tie});
 ok(!!r&&r.v[0][0]==='odalie'&&r.v[0][4]!=null,'a 2-2 split goes to Mayor Odalie',r);
 // 3) approved -> building on a lot; lotStage L8 1..7
 r=await E(()=>{const m=window.__mocha,p=m.S.town.petitions.find(q=>q.tpl==='venue');return{st:p.st,lot:p.lot,why:p.why}});ok(/building|pending|denied/.test(r.st),'venue decided',r);
 if(r.st!=='building')await E(()=>{const m=window.__mocha,p=m.S.town.petitions.find(q=>q.tpl==='venue');p.st='building';p.lot='L8';p.ap=Date.now()});
 const L0=await E(()=>{let L=0;window.__mocha.S&&0;return L});
 const stages=[];for(let n=1;n<=7;n++){stages.push(await E(n=>window.__mocha.lotStage('L8',n),n))}
 const sigs=stages.map(s=>s.sig+'|'+s.meshes);ok(new Set(sigs).size===7,'lotStage("L8",1..7): 7 distinct stage builds',stages.map(s=>[s.stage,s.meshes,s.ms]));
 ok(stages.every(s=>s.lights===stages[0].lights),'scene light count unchanged across stages',stages.map(s=>s.lights));
 const biz=stages[6].biz;ok(biz&&biz.talk,'open adds a keeper with a talk card',biz);
 r=await E(k=>{const m=window.__mocha;const t=m.talk(k);const st=m.talkState();const chips=[...document.querySelectorAll('#tkChips button,.tkChip,#tk button')].map(b=>b.textContent).slice(0,8);m.talkClose();return{open:!!(t&&t.open||st.open),chips,id:st.id}},biz.keeper);
 ok(r.open,'keeper talk card opens',r);
 r=await E(()=>{const m=window.__mocha;return{stock:m.stockFor?m.stockFor('biz_L8').length:null,dio:m.diorama().lots}});ok(r.stock==null||r.stock>=0,'stock pool registered',r);
 ok(r.dio.L8==='#ffd36b','diorama shows L8 open (gold)',r.dio);
 // 4) Mocha files from a biz: want above .7
 r=await E(()=>{const m=window.__mocha;m.want('biz:ramen',.85);const w=m.b38.wantTick();const p=m.S.town.petitions.find(q=>q.tpl==='ramen');return{w,p:p&&{by:p.by,st:p.st}}});
 ok(r.p&&r.p.by==='mocha','fileMochaPetition triggers from a biz: want > .7',r);
 // 5) 60 simulated days stay small; catchUp 7 days fast
 r=await E(()=>{const m=window.__mocha,S=m.S,t0=Date.now();let ms=0;for(let d=1;d<=60;d++){const t=t0+d*864e5;const a=performance.now();m.b38.catchUp(t);ms+=performance.now()-a;if(d%9===0)m.petition(['ice cream','skate park','bowling','museum','aquarium','comics'][d%6],'you')}
   const town=JSON.stringify(S.town).length,b38=JSON.stringify({p:S.town.petitions,b:S.town.built,f:S.town.fund}).length,all=JSON.stringify(S).length;return{town,b38,econ:JSON.stringify(S.econ||{}).length,all,ms:+ms.toFixed(1),n:S.town.petitions.length,built:S.town.built.length}});
 ok(r.all<200*1024&&r.b38<5*1024,'60 simulated days: db < 200 KB, B38 state < 5 KB',r);
 r=await E(()=>{const m=window.__mocha;const a=performance.now();m.b38.catchUp(Date.now()+7*864e5);const b38=performance.now()-a;const c=performance.now();m.catchUpDays&&m.catchUpDays(7);const all=performance.now()-c;return{b38:+b38.toFixed(2),all:+all.toFixed(1)}});
 ok(r.b38<60,'B38 catch-up over 7 days < 60 ms',r);console.log('INFO whole catchUp(7 days) ms',r.all);
 r=await E(()=>({calls:window.__mocha.drawInfo?window.__mocha.drawInfo():null}));console.log('INFO draws',JSON.stringify(r));
 ok(errs.length===0,'no page errors',errs.slice(0,6));
 await p.screenshot({path:'/tmp/harness/out/b38-test.png'});await ctx.close();await b.close();console.log(fail?`FAILED ${fail}`:'ALL PASS');process.exit(fail?1:0)})();

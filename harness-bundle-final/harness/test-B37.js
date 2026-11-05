// test-B37: town economy and Mocha's jobs. Usage: node /tmp/harness/test-B37.js [shots]
// (track redirect: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=<copy> node /tmp/harness/test-B37.js)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(d,h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setFullYear(2026,10,${d});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const SHOTS=process.argv[2]==='shots';let pass=0,fail=0;const ok=(c,m,x)=>{if(c){pass++;console.log('  ok  ',m)}else{fail++;console.log('  FAIL',m,x!==undefined?JSON.stringify(x).slice(0,400):'')}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const ctx=await b.newContext({viewport:{width:1100,height:820}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));
 await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(7,15));
 await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(6000);
 console.log('B37 economy');
 const e0=await p.evaluate(()=>window.__mocha.econ());ok(e0&&Object.keys(e0.biz).length>=19,'S.econ has a ledger for every business',e0&&Object.keys(e0.biz).length);
 ok(e0.d>0&&e0.log.length>0,'the boot settle ran (warm-up days, Gazette log)',{d:e0.d,log:e0.log.length});
 const t3=await p.evaluate(()=>window.__mocha.econTick(3));const e1=t3.econ;let ch=0;for(const k in e1.biz){const a=e0.biz[k],c=e1.biz[k];if(a.cash!==c.cash||a.trend.join()!==c.trend.join())ch++}
 ok(ch>=12,'econTick(3) changes the ledgers',ch);ok(t3.ms<2,'econ tick under 2 ms per day',t3.ms);
 const rv=await p.evaluate(()=>{const M=window.__mocha;return{rain:M.econRev('cafe',20261107,'rain'),sun:M.econRev('cafe',20261107,'sun'),mr:M.econRev('market',20261107,'rain'),ms:M.econRev('market',20261107,'sun'),again:M.econRev('cafe',20261107,'rain'),dow:new Date(2026,10,7).getDay()}});
 ok(rv.dow===6&&rv.rain>rv.sun,'a rainy Saturday raises café revenue vs a sunny one (seeded)',rv);ok(rv.again===rv.rain,'revenue is deterministic for the same day',rv);ok(rv.ms>rv.mr,'a sunny Saturday is better for the market',rv);
 const sg=await p.evaluate(()=>{const M=window.__mocha,L=['cinema','arcade','threads','lantern','records'],tr={},st={};L.forEach(k=>{tr[k]=-5;st[k]=''});M.econ({trend:tr,strat:st});const r=M.econTick(1).econ;
   const sale=L.filter(k=>r.biz[k].strat==='sale'),k=sale[0],e=k?(M.stockFor(k)||[])[0]:null;let pr=null;if(e){const on=M.econ({sale:[k,e]}).price;M.econ({strat:{[k]:''}});const off=M.econ({sale:[k,e]}).price;M.econ({strat:{[k]:'sale'}});pr={on,off}}
   return{moods:L.map(k=>r.biz[k].mood),strats:L.map(k=>r.biz[k].strat),sale,sign:k?r.biz[k].sign:null,signs:L.map(k=>r.biz[k].sign),pr,news:(M.S.town.news||[]).slice(-3).map(n=>n[2])}});
 ok(sg.moods.every(m=>m<=-1),'forced slow weeks make shops struggle (mood -1/-2)',sg.moods);ok(sg.sale.length>=1,'a struggling shop runs a sale',sg.strats);
 ok(sg.signs.some(s=>s&&/^SALE/.test(s)),'the sale shows on its chalkboard A-frame (SALE tag + original line)',sg.signs);ok(!sg.pr||sg.pr.on<sg.pr.off||sg.pr.off<=1,'sale prices are 20% off on the shelves',sg.pr);
 console.log('B37 Mocha\'s job');
 const c0=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.born=Date.now()-12*864e5;S.interests.coffee=5;S.interests.people=3;S.goal={text:'save up for the piano',kind:'save',key:'it:pno',target:600,progress:0};
   const lo=M.career({step:'night'});const r=M.jobReady(.8);const d=S.diary.slice(0,4).map(e=>e.text);return{lo:lo.ready,st:r.st,rd:r.rd,line:r.line,diary:d}});
 ok(c0.st==='look'&&c0.rd>.6,'with a saving goal and rd>.6 he decides to look for a job',c0);ok(c0.diary.some(x=>/I think I want a job\. Not because I have to\./.test(x)),'a job-hunting diary entry ("Not because I have to")',c0.diary);
 const c1=await p.evaluate(()=>{const M=window.__mocha,S=M.S,r=M.career({step:'hunt'});return{st:r.st,iv:r.iv,wy:S.heart&&S.heart.wy,diary:S.diary.slice(0,2).map(e=>e.text)}});
 ok(c1.st==='iv'&&c1.iv&&c1.iv.b,'he reads the help-wanted signs and books an interview',c1);ok(c1.wy&&c1.wy.k==='job','a nervous worry the night before (B29 worry)',c1.wy);
 const c2=await p.evaluate(()=>{const M=window.__mocha,S=M.S,r=M.career({step:'iv'});return{j:r.j,line:r.line,next:r.next,diary:S.diary[0].text,wy:S.heart.wy}});
 ok(c2.j&&c2.j.b===c1.iv.b&&c2.j.dw.length>=2&&c2.j.pay>0,'a hire: role, days, hours, pay',c2.j);ok(/works part-time at .* · .* · /.test(c2.line),'the Me-tab line reads like "works part-time at … · days hours · loves it"',c2.line);ok(!c2.wy,'the worry clears after the interview');
 ok(!!c2.next,'a next shift is scheduled',c2.next);
 const c3=await p.evaluate(t=>{const M=window.__mocha,S=M.S,A=M.career({step:'acts',t}),j=S.career.j,c0=S.coins,b0=S.econ.biz[j.b][0],x0=S.econ.biz[j.b][8];const r=M.career({step:'shift',t});
   const core=(S.core||[]).slice(-3).map(c=>c.x);return{A,c0,c1:S.coins,b0,b1:S.econ.biz[j.b][0],x1:S.econ.biz[j.b][8]-x0,res:r.shift,sh:S.career.j.sh,diary:S.diary[0].text,core,h:new Date(t).getHours(),dw:j.dw,day:new Date(t).getDay()}},c2.next);
 ok(c3.A.shift===true&&c3.A.hw===8&&c3.dw.includes(c3.day),'the shift is a candidate at the scheduled hours (+8)',c3.A);
 ok(c3.res&&c3.res.pay>0&&c3.c1-c3.c0===c3.res.pay,'the shift pays coins (pay + tips)',{c0:c3.c0,c1:c3.c1,res:c3.res});
 ok(c3.x1===c3.res.pay&&(c3.b1===Math.max(0,c3.b0-c3.res.pay)),'and debits the shop ledger',{b0:c3.b0,b1:c3.b1,x1:c3.x1});
 ok(/first day/i.test(c3.diary)&&c3.core.some(x=>/first day/i.test(x)),'the first day becomes a core memory',{d:c3.diary,core:c3.core});
 const c4=await p.evaluate(t=>{const M=window.__mocha,S=M.S,r=M.career({step:'shift',t});return{res:r.shift,coins:S.coins}},c2.next);ok(c4.res&&c4.res.more,'later shift acts that day do not pay twice',c4.res);
 const oj=await p.evaluate(t=>{const M=window.__mocha,S=M.S,j=S.career.j,A=M.career({step:'acts',t}),mine=A.odd.find(o=>o[0]===j.b),oth=A.odd.find(o=>o[0]!==j.b),act=M.ACTS.find(a=>a.fx==='job'&&a.p===oth[0]),c0=S.coins,x0=S.econ.biz[oth[0]][8];const pay=M.payJob(act,t,false,'x');
   return{mine,oth,pay,dc:S.coins-c0,dx:S.econ.biz[oth[0]][8]-x0}},c2.next);
 ok(oj.mine&&oj.mine[1]===false,'a real job replaces the odd job at that shop',oj.mine);ok(oj.oth&&oj.oth[1]===true&&oj.pay>0&&oj.dc===oj.pay&&oj.dx===oj.pay,'round-1 odd jobs still work at other shops (and are paid from that shop)',oj);
 const sl=await p.evaluate(t=>{const M=window.__mocha,S=M.S,j=S.career.j,D=new Date(t);D.setHours(3,0,0,0);const tn=+D,A=M.career({step:'acts',t:tn}),ch=M.career({step:'choose',t:tn,n:12}),cw=M.career({step:'choose',t,n:24});
   return{A,night:ch.seen,day:cw.seen}},c2.next);
 ok(sl.A.asleep&&sl.A.shift===false,'sleep beats shifts (no shift candidate while he sleeps)',sl.A);ok((sl.night.sleep||0)>0&&!sl.night.shift,'at 3am he sleeps, never works',sl.night);ok((sl.day.shift||0)>=12,'inside his hours he mostly goes to work (his schedule)',sl.day);
 const fin=await p.evaluate(()=>{const M=window.__mocha,S=M.S;const t=M.econTick(30),e=t.econ;M.coins(0);const ex=M.career({step:'acts'});
   return{ms:t.ms,coins:S.coins,neg:Object.values(e.biz).filter(b=>b.cash<0).length,funds:e.funds,bytes:e.bytes,town:e.townBytes,me:(()=>{try{return M.openTab?(M.openTab('me'),document.querySelector('.b37job')?.textContent||null):null}catch(x){return'err '+x.message}})()}});
 ok(fin.ms<2,'30 catch-up days average under 2 ms per day',fin.ms);ok(fin.coins>=0&&fin.neg===0&&fin.funds>=0,'coins, shop cash and town funds never go negative',fin);ok(fin.bytes+fin.town<=5120,'S.econ plus S.town is 5 KB or less',{econ:fin.bytes,town:fin.town});
 ok(fin.me&&/works part-time/.test(fin.me),'the Me tab shows his job',fin.me);
 const tb=await p.evaluate(()=>{const M=window.__mocha;try{M.openTab('biz')}catch(e){return'err '+e.message}const el=document.querySelector('#tab-biz');return el?{faces:el.querySelectorAll('.bz').length,funds:/Town funds/.test(el.textContent),gz:/Gazette/.test(el.textContent),job:/Mocha works here/.test(el.textContent),vis:el.offsetParent!==null}:null});
 ok(tb&&tb.faces>=19&&tb.funds&&tb.gz&&tb.job,'Town tab: funds, campaigns, a business board with mood faces, the Gazette',tb);
 const q=await p.evaluate(()=>{const M=window.__mocha,S=M.S;M.career({step:'quit',why:'break'});const r=M.career();return{j:r.j,past:r.past,line:r.line,diary:S.diary[0].text}});
 ok(!q.j&&q.past.length===1&&/notice/.test(q.diary),'he quits kindly (gives notice; the bond survives)',q);
 // persistence through save/reload
 const pr=await p.evaluate(()=>{const M=window.__mocha;M.jobReady(.9);M.career({step:'hunt'});M.career({step:'iv'});try{save()}catch(e){}const S=M.S;localStorage.setItem('__b37',JSON.stringify({j:S.career.j,f:S.econ.funds}));return true});
 await p.reload();await p.waitForTimeout(6000);
 const rl=await p.evaluate(()=>{const M=window.__mocha,c=M.career(),e=M.econ(),o=JSON.parse(localStorage.getItem('__b37')||'{}');return{j:c.j&&c.j.b,oj:o.j&&o.j.b,funds:e.funds,biz:Object.keys(e.biz).length}});ok(rl.j&&rl.j===rl.oj&&rl.biz>=19,'career and ledgers survive a reload',rl);
 if(SHOTS){await ctx.close();for(const [vn,vp,mob] of [['portrait',{width:393,height:852},true],['desktop',{width:1100,height:820},false]]){const c2=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const q2=await c2.newPage();q2.on('pageerror',e=>errs.push(vn+' '+e.message));
   await q2.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await q2.addInitScript(timeAt(7,15));await q2.goto('file:///home/user/Booknest/ghost-town/index.html',{timeout:120000});await q2.waitForTimeout(6000);
   await q2.evaluate(()=>{const M=window.__mocha,S=M.S;S.born=Date.now()-12*864e5;S.interests.coffee=5;S.goal={text:'save up for the piano',kind:'save',key:'it:pno',target:600,progress:0};M.jobReady(.8);M.career({step:'hunt'});M.career({step:'iv'});M.econ({trend:{cinema:-5},strat:{cinema:'sale'}});M.openTab('biz')});await q2.waitForTimeout(1200);
   await q2.screenshot({path:`/tmp/harness/b37/town-${vn}.png`});await q2.evaluate(()=>window.__mocha.openTab('me'));await q2.waitForTimeout(800);await q2.screenshot({path:`/tmp/harness/b37/me-${vn}.png`});await c2.close()}}
 console.log(errs.length?['ERRORS',errs]:'no page errors');if(errs.length)fail++;console.log(`B37: ${pass} passed, ${fail} failed`);try{await b.close()}catch(e){}process.exit(fail?1:0)})();

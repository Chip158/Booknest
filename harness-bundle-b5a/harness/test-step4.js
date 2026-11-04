// Step 4 feature test: texting Mocha's phone (Messages app, badge/read, typing, replies, questions + memory, sleep queue, catch-up replies,
// proactive texts + rate limits, in-person chat still works, Claude-mind texting with a mock).
// Usage: node /tmp/harness/test-step4.js [section filter: ui|sleep|reopen|mind]   (ui accepts a viewport name after a colon, e.g. ui:portrait)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const OUT='/tmp/harness/step4/';const filt=process.argv[2]||'';
let fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  FAIL',m)}else console.log('  ok',m)};
const VPS={desktop:[{width:1100,height:820},false],portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],unfolded:[{width:900,height:1000},true]};
async function open(b,vp,mobile,init,hour=15){const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));if(init)await p.addInitScript(init);
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4000);return {ctx,p,errs}}
const until=async(p,fn,arg,ms=15000)=>{const t0=Date.now();while(Date.now()-t0<ms){const r=await p.evaluate(fn,arg);if(r)return r;await p.waitForTimeout(250)}return null};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const vn of Object.keys(VPS)){if(filt&&!(filt==='ui'||filt==='ui:'+vn))continue;
  console.log('== ui',vn);const [vp,mob]=VPS[vn];const {ctx,p,errs}=await open(b,vp,mob);const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=window.__mocha;M.weather('cloudy');M.textFast(.05);if(!document.getElementById('panel').classList.contains('hidden'))document.getElementById('closePanel').click();document.getElementById('hint').style.display='none'});
  let r=await E(()=>({m:window.__mocha.chatMode(),ph:document.getElementById('say').placeholder,t:window.__mocha.texts()}));
  ok(r.m==='person'&&/in person/.test(r.ph),'no phone, watching: chat bar is in person ('+r.ph+')');ok(r.t.n===0&&r.t.badge==='','no texts, no badge');
  await p.click('#msgBtn');await p.waitForTimeout(900);
  r=await E(()=>({open:window.__mocha.texts().open,dis:document.getElementById('msgIn').disabled,empty:(document.querySelector('.mEmpty')||{}).textContent||'',stat:document.getElementById('msgStat').textContent}));
  ok(r.open&&r.dis&&/doesn't have a phone yet/.test(r.empty)&&/Cascade Mobile/.test(r.empty),'Messages: no-phone empty state, input disabled');ok(/no phone yet/.test(r.stat),'status: '+r.stat);
  await p.screenshot({path:OUT+vn+'-nophone.png'});
  await p.click('#msgClose');await p.waitForTimeout(400);ok(!(await E(()=>window.__mocha.texts().open)),'close button closes Messages');
  // walk mode far away, no phone -> can't talk
  r=await E(()=>{const M=window.__mocha;M.setCamMode('walk');M.you(M.G.x+40,M.G.z+30);return{m:M.chatMode(),ph:M.chatPH()}});ok(r.m==='far','walking far away with no phone: '+r.ph);
  r=await E(()=>{const M=window.__mocha;M.you(M.G.x+3,M.G.z+3);return M.chatMode()});ok(r==='person','walking next to him: in person');
  await E(()=>{const M=window.__mocha;M.setCamMode('follow')});
  // he buys his first phone -> he texts you first
  await E(()=>{const M=window.__mocha;M.coins(200);M.buyGear('phone',{model:'Nimbus Mini',color:'#7fb3d5'},Date.now(),true,'Cascade Mobile')});
  r=await until(p,()=>{const t=window.__mocha.texts();return t.n>0&&t});ok(r&&r.list[0].from==='him'&&/phone/.test(r.list[0].text),'first text from him after buying a phone: '+(r&&r.list[0].text));
  await p.waitForTimeout(300);r=await E(()=>({t:window.__mocha.texts(),toast:document.getElementById('toast').textContent,m:window.__mocha.chatMode(),ph:document.getElementById('say').placeholder,btn:document.getElementById('sendBtn').textContent}));
  ok(r.t.unread===1&&r.t.badge==='1','unread badge shows 1');ok(/Mocha:/.test(r.toast),'toast: '+r.toast);ok(r.m==='text'&&/text Mocha/.test(r.ph)&&r.btn==='text','with a phone, watching: chat bar texts him ('+r.ph+')');
  await p.waitForTimeout(500);await p.screenshot({path:OUT+vn+'-badge.png'});
  // open the thread -> read
  await p.click('#msgBtn');await p.waitForTimeout(700);r=await E(()=>window.__mocha.texts());ok(r.unread===0&&r.badge==='','opening Messages marks it read, badge cleared');
  // send a text through the Messages input
  await E(()=>window.__mocha.textFast(.35));await p.fill('#msgIn','hi mocha!! what are you doing?');await p.press('#msgIn','Enter');
  r=await E(()=>window.__mocha.texts());ok(r.pending===1&&r.list[r.list.length-1].from==='me','my text is in the thread, waiting');
  const ty=await until(p,()=>window.__mocha.texts().typing||null,null,8000);ok(!!ty,'typing indicator shows');
  r=await until(p,()=>{const t=window.__mocha.texts();const l=t.list[t.list.length-1];return!t.job&&l.from==='him'&&t.pending===0&&t},null,15000);
  await E(()=>window.__mocha.textFast(.05));ok(r&&r.list.some(m=>m.from==='me'&&m.read),'my text shows Read');ok(!!r,'he replied: '+(r&&r.list.filter(m=>m.from==='him').slice(-2).map(m=>m.text).join(' / ')));
  // a picture text + one of his questions, answered -> remembered
  await E(()=>{const M=window.__mocha;const pt=M.makePainting('the ferry at dusk','Ferry Lights',Date.now(),'hang');M.TX.outbox.length=0;M.txAdd('him','just finished a painting! “Ferry Lights” 🎨',Date.now(),{pic:'paint:'+pt.id,ini:1});M.txAdd('him','random question: what\'s your favorite food? i\'m still figuring out mine 🍜',Date.now(),{q:'food',ini:1})});
  await p.fill('#msgIn','probably ramen!');await p.press('#msgIn','Enter');
  r=await until(p,()=>{const t=window.__mocha.texts();const l=t.list[t.list.length-1];return!t.job&&t.pending===0&&l.from==='him'&&t},null,15000);
  ok(r&&r.facts.includes('favorite food: ramen'),'he remembers the answer: '+JSON.stringify(r&&r.facts));ok(r&&/ramen/i.test(r.list.filter(m=>m.from==='him').slice(-2).map(m=>m.text).join(' ')),'his reply mentions it: '+(r&&r.list.slice(-1)[0].text));
  ok(await E(()=>!!document.querySelector('#msgList img.mPic')),'picture shows in the thread');
  // tapping the picture opens the big viewer
  await p.click('#msgList img.mPic');await p.waitForTimeout(500);r=await E(()=>window.__mocha.lb());ok(r.open&&r.set==='paint','tapping the picture opens the viewer ('+r.title+')');await E(()=>window.__mocha.closeLB());await p.waitForTimeout(300);
  ok(await E(()=>window.__mocha.texts().open),'Messages still open after closing the viewer');
  // show a typing indicator for the screenshot
  await E(()=>{const M=window.__mocha;M.TX.typing=true;M.renderMsgs()});await p.waitForTimeout(700);await p.screenshot({path:OUT+vn+'-thread.png'});await E(()=>{const M=window.__mocha;M.TX.typing=false;M.renderMsgs()});
  // close; he texts first (question); badge; rate limit
  await p.click('#msgClose');await p.waitForTimeout(300);
  r=await E(async()=>{const M=window.__mocha;const n=M.texts().n;await M.textFirst('q');return{n0:n,t:M.texts()}});ok(r.t.n===r.n0+1&&r.t.list[r.t.list.length-1].q,'he texts you a question first: '+r.t.list[r.t.list.length-1].text);ok(r.t.unread===1&&r.t.badge==='1','badge 1 for his question');
  r=await E(()=>{const M=window.__mocha;const n=M.texts().n;M.TX.nextAt=0;M.txTick();return{n0:n,can:M.txCanIni(null),n1:M.texts().n,job:M.TX.job}});ok(!r.can&&r.n1===r.n0&&!r.job,'rate limit: no second text right after');
  // via the chat bar (watching, he has a phone) -> a text
  await E(()=>{const M=window.__mocha;M.TX.viaBar=0;M.S.texts.forEach(m=>{if(m.q)m.qa=1})});
  if(vn==='desktop'||vn==='landscape'||vn==='portrait'){await E(()=>{const i=document.getElementById('say');i.value='i love jazz';document.getElementById('chat').requestSubmit()});r=await E(()=>window.__mocha.texts());ok(r.list[r.list.length-1].from==='me'&&r.list[r.list.length-1].text==='i love jazz'&&r.pending===1,'chat bar sends a text when he has a phone');
    r=await until(p,()=>{const t=window.__mocha.texts();return!t.job&&t.pending===0&&t.list[t.list.length-1].from==='him'&&t},null,15000);ok(!!r&&r.facts.some(f=>/jazz/.test(f)),'reply to chat-bar text; facts: '+(r&&r.facts.join('; ')));
    await p.waitForTimeout(400);r=await E(()=>({him:[...document.querySelectorAll('#chatlog .msg.him')].map(x=>x.textContent),badge:window.__mocha.texts().badge}));ok(r.him.length>=1,'his reply floats above the chat bar: '+r.him[0]);await p.screenshot({path:OUT+vn+'-bar.png'})}
  // in person still works when you walk up to him
  r=await E(async()=>{const M=window.__mocha;M.setCamMode('walk');M.you(M.G.x+2,M.G.z+2);document.body.classList.add('chatOpen');const n=M.texts().n;const i=document.getElementById('say');i.value='hi mocha';document.getElementById('chat').requestSubmit();await new Promise(r=>setTimeout(r,1800));const bub=document.getElementById('bubble');return{m:M.chatMode(),n0:n,n1:M.texts().n,bub:bub.textContent,show:bub.classList.contains('show')}});
  ok(r.m==='person'&&r.n1===r.n0&&r.show&&r.bub&&r.bub!=='…','in person next to him: speech bubble reply ('+r.bub+'), no text');
  // walk mode screenshot with badge + Messages open in walk mode
  await E(()=>{const M=window.__mocha;M.you(M.G.x+30,M.G.z+20);document.body.classList.remove('chatOpen')});await p.waitForTimeout(600);await p.screenshot({path:OUT+vn+'-walk.png'});
  await p.click('#msgBtn');await p.waitForTimeout(800);await p.screenshot({path:OUT+vn+'-walkmsgs.png'});
  r=await E(()=>{const vis=s=>{const e=document.querySelector(s);if(!e)return false;const cs=getComputedStyle(e);return cs.display!=='none'&&cs.visibility!=='hidden'&&e.getBoundingClientRect().width>0};return{look:vis('#look'),joy:vis('#joy'),open:window.__mocha.texts().open}});ok(r.open&&!r.look&&!r.joy,'walk mode: sticks hidden while Messages is open');
  // overlap check: Messages box vs dock/zoom/top pills (wide layouts)
  r=await E(()=>{const R=s=>{const e=document.querySelector(s);if(!e)return null;const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')return null;const r=e.getBoundingClientRect();return r.width?r:null};const m=R('#msgs');const hit=[];for(const s of ['#dock','#zoom','#mochaPill','#chatwrap','#look','#joy']){const o=R(s);if(o&&m&&o.left<m.right-1&&o.right>m.left+1&&o.top<m.bottom-1&&o.bottom>m.top+1)hit.push(s)}return{hit,m:m&&[m.left,m.top,m.width,m.height].map(Math.round),inView:m&&m.left>=0&&m.top>=0&&m.right<=innerWidth+.5&&m.bottom<=innerHeight+.5}});
  ok(r.inView,'Messages fits on screen '+JSON.stringify(r.m));ok(vn==='portrait'?true:r.hit.length===0,'nothing overlaps Messages: '+JSON.stringify(r.hit));
  await E(()=>window.__mocha.closeMsgs());await E(()=>window.__mocha.setCamMode('follow'));
  ok(errs.length===0,'no page errors '+JSON.stringify(errs.slice(0,3)));await ctx.close()}
if(!filt||filt==='sleep'){console.log('== sleep queue');for(const vn of ['desktop','portrait']){const [vp,mob]=VPS[vn];const {ctx,p,errs}=await open(b,vp,mob);const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=window.__mocha;M.weather('clear');M.textFast(.05);M.coins(200);M.buyGear('phone',{model:'Drizzle Flip',color:'#f29fb5'},Date.now(),false);M.TX.outbox.length=0;const G=M.G;G.act=M.ACTS.find(a=>a.fx==='sleep');G.mode='activity';G.sleep=true;G.timer=9999;if(!document.getElementById('panel').classList.contains('hidden'))document.getElementById('closePanel').click()});
  await p.click('#msgBtn');await p.waitForTimeout(400);await p.fill('#msgIn','are you awake? 🌙');await p.press('#msgIn','Enter');await p.waitForTimeout(3500);
  let r=await E(()=>({t:window.__mocha.texts(),note:(document.querySelector('.mNote')||{}).textContent||''}));ok(r.t.pending===1&&r.t.status.k==='sleep','asleep: no reply yet, status "'+r.t.status.t+'"');ok(/asleep/.test(r.note),'thread note: '+r.note);ok(!r.t.list[r.t.list.length-1].read,'still Delivered, not Read');
  await p.screenshot({path:OUT+vn+'-asleep.png'});
  await E(()=>{window.__mocha.G.timer=0});
  r=await until(p,()=>{const t=window.__mocha.texts();return!t.job&&t.pending===0&&t.list[t.list.length-1].from==='him'&&t},null,20000);
  const txt=r&&r.list.filter(m=>m.from==='him').slice(-2).map(m=>m.text).join(' / ');ok(r&&/(asleep|sleeping|i am now)/i.test(txt),'after waking he answers: '+txt);
  ok(errs.length===0,'no page errors '+JSON.stringify(errs.slice(0,3)));await ctx.close()}}
if(!filt||filt==='reopen'){console.log('== reopen: texts sent while he slept get answered after catch-up');
  // build a save with a phone and a pending text from last night, last seen 9h ago
  let {ctx,p}=await open(b,{width:900,height:700},false);let st=await p.evaluate(()=>{const M=window.__mocha;M.coins(200);M.buyGear('phone',{model:'Ghostphone',color:'#26324a'},Date.now(),false);const S=JSON.parse(JSON.stringify(M.S));const now=Date.now();S.texts=[{from:'him',text:'hi!! it\'s mocha',t:now-20*3600e3,read:true,ini:1},{from:'me',text:'goodnight mocha!',t:now-9*3600e3,read:false,wait:1,zz:1}];S.lastSeen=now-9*3600e3;return S});await ctx.close();
  ({ctx,p}=await open(b,{width:900,height:700},false,`if(!sessionStorage.getItem('seeded')){sessionStorage.setItem('seeded','1');localStorage.setItem('mocha-seattle-v1',${JSON.stringify(JSON.stringify(st))})}`));
  let r=await until(p,()=>{const t=window.__mocha.texts();return t.pending===0&&!t.job&&t.list.some(m=>m.from==='him'&&m.t>Date.now()-60e3)&&t},null,25000);
  ok(!!r,'reply arrived after reopening: '+(r&&r.list.filter(m=>m.from==='him').slice(-1)[0].text));ok(r&&/(asleep|sleeping)/i.test(r.list.filter(m=>m.from==='him').slice(-2).map(m=>m.text).join(' ')),'he says he was asleep');ok(r&&r.unread>=1,'unread badge after reopening: '+(r&&r.badge));
  await ctx.close()}
if(!filt||filt==='mind'){console.log('== Claude mind texting (mock)');const {ctx,p,errs}=await open(b,{width:1000,height:760},false);const E=(f,a)=>p.evaluate(f,a);
  let r=await E(async()=>{const M=window.__mocha;M.textFast(.05);M.coins(200);M.buyGear('phone',{model:'Nimbus Mini',color:'#7fb3d5'},Date.now(),false);M.TX.outbox.length=0;window.__prompts=[];
    M.MIND.api=async(prompt)=>{window.__prompts.push(prompt);if(/decide to text your friend/.test(prompt))return{text:JSON.stringify({text:'the fog is so thick i waved at a lamppost 🌫 what are you up to?',is_question:true,skip:false})};if(/texting your phone/.test(prompt))return{text:JSON.stringify({reply:'aww, thank you!! i\'m at home making tea ☕',follow_up_question:'what\'s your favorite tea?',friend_name:'Sam',remember:['has a cat named Biscuit'],plan:'maybe visit the library'})};return{text:JSON.stringify({diary:'ok',next:{place:'home',spot:'couch',doing:'resting'}})}};
    M.MIND.on=true;M.MIND.backoff=0;M.MIND.last=Date.now();M.sendText("hi! i'm Sam, my cat Biscuit says hi");return true});
  r=await until(p,()=>{const t=window.__mocha.texts();return!t.job&&t.pending===0&&t.list.filter(m=>m.from==='him').length>=2&&t},null,15000);
  const P=await E(()=>window.__prompts.filter(x=>/texting your phone/.test(x)));ok(P.length===1&&/Biscuit/.test(P[0])&&/Places he knows/.test(P[0]),'texting prompt includes the new text + context()');
  ok(r&&r.list.slice(-2)[0].text.startsWith('aww, thank you')&&r.list.slice(-1)[0].q==='ai','Claude reply + follow-up question: '+(r&&r.list.slice(-2).map(m=>m.text).join(' / ')));
  r=await E(()=>({name:window.__mocha.S.mem.userName,facts:window.__mocha.S.mem.facts}));ok(r.name==='Sam'&&r.facts.includes('has a cat named Biscuit'),'friend_name + remember applied: '+JSON.stringify(r));
  r=await E(async()=>{const M=window.__mocha;M.TX.lastAI=0;await M.textFirst();return M.texts()});ok(r.list.slice(-1)[0].text.startsWith('the fog is so thick')&&r.list.slice(-1)[0].ini&&r.list.slice(-1)[0].q==='ai','Claude-written first text: '+r.list.slice(-1)[0].text);
  r=await E(async()=>{const M=window.__mocha;const n=window.__prompts.length;await M.textFirst();return{calls:window.__prompts.length-n,last:M.texts().list.slice(-1)[0].text}});ok(r.calls===0,'pace: the next first-text right after uses the built-in brain ('+r.last+')');
  // a Claude error falls back to the built-in brain
  r=await E(()=>{const M=window.__mocha;M.MIND.api=async()=>{throw{code:'timeout'}};M.MIND.backoff=0;M.sendText('what are you doing?');return true});
  r=await until(p,()=>{const t=window.__mocha.texts();return!t.job&&t.pending===0&&t.list[t.list.length-1].from==='him'&&t},null,15000);ok(!!r,'mind error -> built-in reply: '+(r&&r.list.slice(-1)[0].text));
  await E(()=>{const M=window.__mocha;M.MIND.on=false;M.MIND.api=null});ok(errs.length===0,'no page errors '+JSON.stringify(errs.slice(0,3)));await ctx.close()}
if(!filt||filt==='soak'){console.log('== soak: he lives on his own with a phone (fast clock for texting only)');const {ctx,p,errs}=await open(b,{width:900,height:700},false);const E=(f,a)=>p.evaluate(f,a);
  await E(()=>{const M=window.__mocha;M.coins(300);M.buyGear('phone',{model:'Ghostphone',color:'#c7b3f0'},Date.now(),true);M.textFast(.01);M.TX.nextAt=0});
  const t0=Date.now();while(Date.now()-t0<70000){await p.waitForTimeout(5000);await E(()=>window.__mocha.tick(40,.05))}
  const r=await E(()=>({t:window.__mocha.texts(),G:{mode:window.__mocha.G.mode,act:window.__mocha.G.act&&window.__mocha.G.act.doing}}));const him=r.t.list.filter(m=>m.from==='him');
  console.log('   '+him.map(m=>(m.ini?'[first] ':'')+m.text).join('\n   '));ok(him.length>=2&&him.length<=6,'he texted on his own a few times, not spam ('+him.length+')');ok(r.t.unread===him.length&&r.t.badge===String(Math.min(9,him.length)),'badge counts them: '+r.t.badge);
  ok(errs.length===0,'no page errors '+JSON.stringify(errs.slice(0,3)));await ctx.close()}
await b.close();console.log(fails.length?`\n${fails.length} FAILED:\n- `+fails.join('\n- '):'\nALL PASSED');process.exit(fails.length?1:0)})();

// Controls v3 "never stuck" acceptance (controls-v3.md). node test-stick.js [file]
// Real touch emulation: Playwright hasTouch + isMobile, 393x852 at dpr 2, CDP Input.dispatchTouchEvent with several touch points.
// After EVERY lift (or takeover) JOY must be 0 and the walker must stop within 300 ms; no rotate buttons / look stick in walk mode.
// Scenarios: walk+look lifted in both orders, slide onto a HUD button / off-screen, third-finger tap, talk card / Your Look / decorate / diary sheet / map
// opening while held, page hidden, rotation, pointercancel, lostpointercapture, touchend without pointerup, the watchdog (no pointerup and no touchend),
// tap-to-go then the stick, quick taps still tap (world + left half), pinch zooms, look drags, desktop WASD + blur, Meta keyup, mouse-drag look, Q/E, wheel.
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0,n=0;const ok=(c,m,x)=>{n++;console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,600):''));if(!c)fails++};
const SH='/tmp/harness/ctl/shots/';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.addInitScript(()=>{try{localStorage.removeItem('mocha-settings')}catch(e){}});
p.setDefaultTimeout(150000);
await p.goto('file://'+file);await p.waitForTimeout(5000);
const E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const cdp=await ctx.newCDPSession(p);
// active touch points by id; CDP: touchStart/touchMove send every active point, touchEnd lists the points that lift (empty = all)
const A=new Map();const send=(type,pts,ts)=>cdp.send('Input.dispatchTouchEvent',Object.assign({type,touchPoints:pts.map(([id,q])=>({x:q[0],y:q[1],id}))},ts?{timestamp:ts/1000}:{}));
const down=(id,x,y)=>{A.set(id,[x,y]);return send('touchStart',[...A])},move=(id,x,y)=>{A.set(id,[x,y]);return send('touchMove',[...A])};
const tapAt=async(id,x,y)=>{const t0=Date.now();A.set(id,[x,y]);await send('touchStart',[...A],t0);const q=A.get(id);A.delete(id);await send('touchEnd',[[id,q]],t0+70)};
const up=id=>{const q=A.get(id);A.delete(id);return send('touchEnd',[[id,q]])},upAll=()=>{A.clear();return send('touchEnd',[])},cancelAll=()=>{A.clear();return send('touchCancel',[])};
const st=()=>E(()=>{const M=window.__mocha,c=M.ctl(),y=M.you();return{t:performance.now(),fc:window.__fc,x:y.x,z:y.z,joy:[c.stick.x,c.stick.y],stick:c.stick.on,look:c.look.on,ptrs:c.ptrs,going:c.going,yaw:c.yaw,head:c.heading,tilt:c.tilt,pitch:c.pitch,dist:c.dist,rel:c.released,blocked:c.blocked}});
await E(()=>{window.__fc=0;(function f(){window.__fc++;requestAnimationFrame(f)})()});
const fr=async(k=2,max=20000)=>{const f0=(await E(()=>window.__fc)),t0=Date.now();while(Date.now()-t0<max){await W(100);if((await E(()=>window.__fc))-f0>=k)return}};
// after a lift: JOY 0 at once, the walker still from <= 300 ms on (position at +300 ms == position at +1000 ms)
const stops=async(label,extra)=>{const t0=Date.now(),a=await st();await W(Math.max(0,300-(Date.now()-t0)));const b3j=await st();await fr(1);const b3=await st();b3.joy=b3j.joy;b3.stick=b3j.stick;await fr(3);await W(300);const c=await st();
  const moved=Math.hypot(c.x-b3.x,c.z-b3.z),r={joy0:a.joy,joy300:b3.joy,stick:b3.stick,moved:+moved.toFixed(3),going:c.going,frames:c.fc-a.fc,ms:Date.now()-t0,fps:+((c.fc-a.fc)*1000/(Date.now()-t0)).toFixed(1)};
  ok(!b3.stick&&b3.joy[0]===0&&b3.joy[1]===0&&moved<.02&&!c.going,label+': JOY 0 and the walker stops within 300 ms',Object.assign(r,extra||{}));return r};
const walking=async(label)=>{const a=await st();await fr(3);const b2=await st();const d=Math.hypot(b2.x-a.x,b2.z-a.z);ok(b2.stick&&(b2.joy[0]||b2.joy[1])&&d>.15,label+': the stick walks',{joy:b2.joy,d:+d.toFixed(2)});return d};
const openSpot=()=>E(()=>{const M=window.__mocha;for(const z of [-2,-3,-1,0,-4,1,2])for(let x0=-26;x0<=20;x0+=2){let clear=true;for(let x=x0-4;x<=x0+15&&clear;x+=.5)for(const dz of [-6,-3,0,3,6])if(M.solidAt(x,z+dz).why){clear=false;break}if(clear)return{x:x0,z}}return{x:-10,z:-2}});
const reset=async(s)=>{await upAll().catch(()=>{});await E(s=>{const M=window.__mocha;M.ctlRelease();if(M.ctl().mode!=='walk')M.setCamMode('walk');M.walker(s.x,s.z,0,0);M.cam({yaw:0,pitch:.48})},s);await W(500)};
const SX=90,SY=640,LX=280,LY=740;// the right thumb looks from the free lower-right (the dock pills sit at x > 335, y 420-670)
const blockers=async(on,kinds)=>E(([on,kinds])=>{const B=window.__blk||(window.__blk={});for(const k of kinds){if(on&&!B[k]){B[k]=e=>{e.stopImmediatePropagation()};addEventListener(k,B[k],true)}else if(!on&&B[k]){removeEventListener(k,B[k],true);delete B[k]}}},[on,kinds]);
try{
await E(()=>{const M=window.__mocha;M.weather('clear');M.setCamMode('walk')});await W(1500);
const spot=await openSpot();console.log('  open spot',JSON.stringify(spot));await reset(spot);
// ---------- 0) the clean HUD ----------
let c=await E(()=>window.__mocha.ctl());
ok(c.scheme==='standard'&&c.rotBtns===0&&!c.lookEl,'walk mode: standard scheme, no rotate buttons, no look stick',{scheme:c.scheme,rot:c.rotBtns,look:c.lookEl});
const jb=await E(()=>{const j=document.getElementById('joy'),cs=getComputedStyle(j),r=j.getBoundingClientRect();return{op:+cs.opacity,pe:cs.pointerEvents,r:[Math.round(r.left),Math.round(r.top),Math.round(r.width)],txt:[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&/^(TURN|LOOK)$/.test(e.textContent.trim())&&e.getBoundingClientRect().width>0).length}});
ok(jb.op>0&&jb.op<.6&&jb.pe==='none'&&jb.r[0]<60&&jb.r[1]>600&&!jb.txt,'a faint stick base rests bottom-left as a hint (no TURN / LOOK labels)',jb);
{const hit=await E(([a,b,c,d])=>[document.elementFromPoint(a,b),document.elementFromPoint(c,d)].map(e=>e.id||e.tagName),[SX,SY,LX,LY]);ok(hit[0]==='c'&&hit[1]==='c','the stick and look start points are open world (the canvas), not HUD',hit)}
// ---------- 1) left thumb walks while the right thumb looks; lift left first ----------
await down(1,SX,SY);await move(1,SX,SY-20);await move(1,SX,SY-44);await down(2,LX,LY);await move(2,LX+20,LY);await move(2,LX+60,LY);
let a=await st();await walking('walk + look (left first)');await move(2,LX+100,LY+10);await fr(1);let a2=await st();
ok(a2.look&&a2.stick&&Math.abs(a2.head-a.head)>3,'both thumbs at once: the right thumb turns the view while the left walks',{head:[a.head,a2.head],look:a2.look,stick:a2.stick});
await up(1);await stops('lift the LEFT thumb first');
const y1=(await st()).head;await move(2,LX+40,LY);await fr(1);const y2=(await st()).head;ok(Math.abs(y2-y1)>3,'the right thumb still looks after the left lifted',{y1,y2});await up(2);await W(200);
c=await st();ok(!c.look&&c.ptrs===0,'right thumb lifted: no look pointer left',c);
// ---------- 2) lift the right thumb first ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await down(2,LX,LY);await move(2,LX+60,LY);await up(2);await W(150);
c=await st();ok(c.stick&&(c.joy[1]<-.5),'right thumb lifted first: the stick keeps walking',c);await up(1);await stops('then lift the left thumb');
// ---------- 3) slide off the stick onto a HUD button, and off-screen ----------
await reset(spot);const zb=await E(()=>{const r=document.getElementById('zIn').getBoundingClientRect();return[r.x+r.width/2,r.y+r.height/2]});
await down(1,SX,SY);await move(1,SX,SY-44);await move(1,zb[0]-20,zb[1]);await move(1,zb[0],zb[1]);await W(200);await up(1);await stops('slide onto the + zoom button and lift there',{at:zb});
await reset(spot);await down(1,SX,SY);await move(1,SX-40,SY+60);await move(1,-4,860);await W(200);await up(1);await stops('slide off the screen edge and lift there');
// ---------- 4) a third finger taps ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await down(2,LX,LY);await move(2,LX+40,LY);await down(3,250,300);await W(80);await up(3);await W(200);
c=await st();ok(c.stick&&c.joy[1]<-.5&&!c.going,'a third finger tap: the stick keeps walking, no tap-to-go',c);await up(2);await up(1);await stops('stick + look + third finger, all lifted');
// ---------- 5) overlays open while the stick is held ----------
const overlay=async(label,open,close)=>{await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);const pre=await st();await E(open);
  const r=await stops(label+' opens while the stick is held',{pre:pre.joy,blocked:(await st()).blocked});await move(1,SX+30,SY-60);await W(300);const q=await st();ok(!q.stick&&q.joy[0]===0&&q.joy[1]===0,label+': moving the held thumb afterwards does not walk',q);
  await up(1);await W(150);await E(close);await W(600)};
const npc=await E(()=>{const M=window.__mocha;const k=M.KEEPERS.find(k=>{const q=M.town&&M.town.npc&&M.town.npc(k.id);return q&&q.visible})||M.KEEPERS[0];return k.id});
await overlay('the talk card ('+npc+')',new Function(`window.__mocha.talk(${JSON.stringify(npc)})`),()=>window.__mocha.talkClose());
await overlay('Your Look',()=>window.__mocha.lookOpen(),()=>window.__mocha.lookClose());
await overlay('decorate',()=>window.__mocha.deco.enter('great'),()=>window.__mocha.deco.exit());
await overlay('the diary sheet',()=>document.getElementById('bookBtn').click(),()=>{const pn=document.getElementById('panel');if(!pn.classList.contains('hidden'))document.getElementById('bookBtn').click()});
await overlay('the map',()=>document.getElementById('mapBtn').click(),()=>document.getElementById('mapClose').click());
// ---------- 6) page hidden / phone rotates mid-drag ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);
await E(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>'hidden'});document.dispatchEvent(new Event('visibilitychange'))});
await stops('the page is hidden mid-drag');await E(()=>{delete document.hidden;delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))});await up(1);await W(300);
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await p.setViewportSize({width:852,height:393});await stops('the phone rotates mid-drag (resize)');
await up(1);await p.setViewportSize({width:393,height:852});await W(1200);
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await E(()=>dispatchEvent(new Event('orientationchange')));await stops('orientationchange mid-drag');await up(1);await W(200);
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await E(()=>dispatchEvent(new Event('blur')));await stops('the window loses focus mid-drag');await up(1);await W(200);
// ---------- 7) pointercancel, lostpointercapture ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await cancelAll();await stops('touchcancel / pointercancel');
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await E(()=>{const id=window.__mocha.ctl().stick.id;document.getElementById('c').releasePointerCapture(id)});await move(1,SX+3,SY-46);await stops('lostpointercapture mid-drag');await up(1);await W(200);
// ---------- 8) a touchend that never got its pointerup ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await blockers(true,['pointerup']);await up(1);await stops('touchend with no pointerup');await blockers(false,['pointerup']);
// ---------- 9) the watchdog: neither pointerup nor touchend arrives; the next touch list no longer has that finger ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await W(300);await blockers(true,['pointerup','touchend','lostpointercapture']);await up(1);await W(400);
c=await st();console.log('  (all lift events swallowed; still held:',c.stick,c.joy,')');await blockers(false,['pointerup','touchend','lostpointercapture']);
await down(5,LX,200);await W(50);await stops('watchdog: a new touch whose list lacks the stick finger');await up(5);await W(200);
// ---------- 10) tap-to-go, then the stick ----------
await reset(spot);await tapAt(2,200,330);await W(400);await fr(1);c=await st();ok(c.going,'a quick tap on the world: tap-to-go starts',c);
await down(1,SX,SY);await move(1,SX,SY-44);await W(400);c=await st();ok(!c.going&&c.stick,'using the stick cancels tap-to-go',c);await up(1);await stops('lift after cancelling tap-to-go');
// ---------- 11) a quick tap in the left half still taps (and never walks) ----------
await reset(spot);let mid=null;{const t0=Date.now();A.set(1,[120,560]);await send('touchStart',[...A],t0);mid=await st();A.delete(1);await send('touchEnd',[[1,[120,560]]],t0+70)}await W(400);await fr(1);c=await st();
ok(mid.stick&&mid.joy[0]===0&&mid.joy[1]===0&&c.going&&!c.stick,'a quick tap in the stick half: tap-to-go, the stick never walked',{mid:mid.joy,going:c.going});
await reset(spot);await down(1,SX,SY);await move(1,SX+4,SY-4);await W(700);await up(1);await W(300);c=await st();ok(!c.going,'a still press-and-hold on the stick (700 ms) is not a tap',c);
// ---------- 12) pinch zooms; a look drag turns ----------
await reset(spot);let z0=await st();await down(2,225,300);await down(3,315,300);for(let k=1;k<=4;k++){await move(2,225+k*8,300-k*3);await move(3,315-k*8,300+k*3)}await up(3);await up(2);await W(600);await fr(2);let z1=await st();
ok(z1.dist>z0.dist*1.15&&Math.abs(z1.yaw-z0.yaw)<2&&z1.joy[0]===0,'a pinch on the right side zooms',{before:[z0.dist,z0.yaw],after:[z1.dist,z1.yaw]});
await W(400);z0=await st();await down(2,LX,LY);for(let k=1;k<=5;k++)await move(2,LX-k*20,LY);await up(2);await W(600);z1=await st();
const dy=((z1.head-z0.head+540)%360)-180;ok(Math.abs(dy-100*.0065*180/Math.PI)<12,'a 100 px look drag turns ~37 deg (0.0065 rad/px)',{dyaw:+dy.toFixed(1)});
await p.screenshot({path:SH+'stick-portrait-end.png'});
}catch(e){ok(false,'touch phase threw: '+e.message)}
// ---------- 13) desktop: WASD + blur, Meta keyup, mouse-drag look, Q/E, wheel ----------
await ctx.close().catch(()=>{});
try{const dc=await b.newContext({viewport:{width:1100,height:820}});const d=await dc.newPage();d.on('pageerror',e=>errs.push('DESKTOP PAGEERROR '+e.message));
  await d.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await d.addInitScript(timeAt(15));d.setDefaultTimeout(150000);await d.goto('file://'+file);await d.waitForTimeout(5000);
  const DE=(f,x)=>d.evaluate(f,x);const dst=()=>DE(()=>{const M=window.__mocha,c=M.ctl(),y=M.you();return{x:y.x,z:y.z,keys:c.keys,yaw:c.heading,dist:c.dist}});
  await DE(()=>{window.__fc=0;(function f(){window.__fc++;requestAnimationFrame(f)})()});const dfr=async(k=2,max=20000)=>{const f0=await DE(()=>window.__fc),t0=Date.now();while(Date.now()-t0<max){await d.waitForTimeout(100);if((await DE(()=>window.__fc))-f0>=k)return}};
  await DE(()=>{const M=window.__mocha;M.weather('clear');M.setCamMode('walk');return 1});await d.waitForTimeout(1200);
  const s0={x:-10,z:-2};await DE(s=>{const M=window.__mocha;M.walker(s.x,s.z,0,0);M.cam({yaw:0,pitch:.48})},s0);await d.waitForTimeout(500);
  const dstop=async(label)=>{const a=await dst();await d.waitForTimeout(300);await dfr(1);const b3=await dst();await dfr(3);const c3=await dst();const mv=Math.hypot(c3.x-b3.x,c3.z-b3.z);ok(!a.keys.length&&mv<.02,label+': keys cleared and the walker stops within 300 ms',{keys:a.keys,moved:+mv.toFixed(3)})};
  await d.mouse.move(550,400);await d.keyboard.down('w');await dfr(3);let q=await dst();ok(q.keys.includes('w')&&Math.hypot(q.x-s0.x,q.z-s0.z)>.3,'desktop: W walks',q);
  await DE(()=>dispatchEvent(new Event('blur')));await dstop('desktop: W held while the window loses focus');await d.keyboard.up('w');
  await d.keyboard.down('d');await d.keyboard.down('Meta');await d.keyboard.up('Meta');await dstop('desktop: Cmd pressed while D is held (mac drops the keyup)');await d.keyboard.up('d');
  let y0=(await dst()).yaw;await d.mouse.move(500,400);await d.mouse.down();for(let k=1;k<=5;k++)await d.mouse.move(500+k*20,400);await d.mouse.up();await d.waitForTimeout(800);let y1=(await dst()).yaw;
  ok(Math.abs(((y1-y0+540)%360)-180)>20,'desktop: a mouse drag looks around',{y0,y1});
  y0=y1;await d.mouse.move(700,400);await d.waitForTimeout(500);y1=(await dst()).yaw;ok(Math.abs(((y1-y0+540)%360)-180)<.5,'desktop: moving the mouse with no button held does not turn',{y0,y1});
  y0=y1;await d.mouse.move(500,400);await d.mouse.down({button:'right'});for(let k=1;k<=5;k++)await d.mouse.move(500-k*20,400);await d.mouse.up({button:'right'});await d.waitForTimeout(800);y1=(await dst()).yaw;
  ok(Math.abs(((y1-y0+540)%360)-180)>20,'desktop: a right-button drag looks too',{y0,y1});
  y0=y1;await d.keyboard.down('q');await d.waitForTimeout(700);await dfr(3);await d.keyboard.up('q');await dfr(1);y1=(await dst()).yaw;await dfr(3);const y2=(await dst()).yaw;
  ok(Math.abs(((y1-y0+540)%360)-180)>15&&Math.abs(((y2-y1+540)%360)-180)<.5,'desktop: Q turns while held and stops on release',{y0,y1,y2});
  const z0=(await dst()).dist;await d.mouse.move(550,400);await d.mouse.wheel(0,400);await d.waitForTimeout(800);const z1=(await dst()).dist;ok(z1>z0*1.1,'desktop: the wheel zooms',{z0,z1});
  await dc.close()}catch(e){ok(false,'desktop phase threw: '+e.message)}
ok(!errs.length,'no page errors',errs.slice(0,5));
console.log(fails?`${fails} FAILED of ${n}`:`ALL PASS (${n})`);await b.close();process.exit(fails?1:0)})();

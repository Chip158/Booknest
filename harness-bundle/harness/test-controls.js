// Controls v3 acceptance: the STANDARD mobile third-person scheme (controls-v3.md). node test-controls.js [file]
// Touch is emulated with Playwright hasTouch + CDP Input.dispatchTouchEvent (portrait iPhone 393x852, dpr 2), several touch points at once.
// 0 defaults + clean HUD (no rotate buttons, no look stick, faint stick base) · 1 the left-thumb stick walks camera-relative, no auto-swing
// 2 left thumb walks WHILE the right thumb looks (the walk turns with the view) · 3 look: yaw ~0.0065 rad/px, pitch half, clamped, invert, sensitivity
// 4 quick taps still tap (world = tap-to-go, a person = talk), long-press jogs · 5 pinch zooms (right side, and two fingers on the left)
// 6 Settings > Camera (sensitivity, invert, follows behind) persists; old SET.cam migrates · 7 follow-behind on/off · 8 a CAM layer under a held stick: the walk keeps its direction
// 9 talk two-shot · 10 bubbles below the top HUD · 11 Lantern Square fountain never hides the walker · 12 labels/rain in rooms, the stick still walks in a room · 13 watch mode keeps its orbit
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0,n=0;const ok=(c,m,x)=>{n++;console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,700):''));if(!c)fails++};
const SH='/tmp/harness/ctl/shots/';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}
const dYaw=(a,b)=>{let d=(b-a)%360;if(d>180)d-=360;if(d<-180)d+=360;return d};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
await p.addInitScript(()=>{try{if(!sessionStorage.getItem('ctl-keep'))localStorage.removeItem('mocha-settings')}catch(e){}});
p.setDefaultTimeout(150000);
await p.goto('file://'+file);await p.waitForTimeout(5000);
const E=(f,a)=>p.evaluate(f,a);const W=ms=>p.waitForTimeout(ms);
const cdp=await ctx.newCDPSession(p);
const FC=()=>E(()=>{if(window.__fc==null){window.__fc=0;(function f(){window.__fc++;requestAnimationFrame(f)})()}return window.__fc});
const fr=async(k=2,max=25000)=>{const f0=await FC(),t0=Date.now();while(Date.now()-t0<max){await W(100);if((await FC())-f0>=k)return}};
// active touch points by id; touchStart/touchMove send every active point, touchEnd lists the lifting ones; taps carry hardware-like timestamps
const A=new Map();const send=(type,pts,ts)=>cdp.send('Input.dispatchTouchEvent',Object.assign({type,touchPoints:pts.map(([id,q])=>({x:q[0],y:q[1],id}))},ts?{timestamp:ts/1000}:{}));
const down=(id,x,y)=>{A.set(id,[x,y]);return send('touchStart',[...A])},move=(id,x,y)=>{A.set(id,[x,y]);return send('touchMove',[...A])},up=id=>{const q=A.get(id);A.delete(id);return send('touchEnd',[[id,q]])},upAll=()=>{A.clear();return send('touchEnd',[])};
const tapAt=async(x,y,hold=70)=>{const t0=Date.now();A.set(9,[x,y]);await send('touchStart',[...A],t0);A.delete(9);await send('touchEnd',[[9,[x,y]]],t0+hold)};
const ctl=()=>E(()=>window.__mocha.ctl());
const scr=(x,z,y=.9)=>E(([x,z,y])=>{const M=window.__mocha,T=window.THREE,v=new T.Vector3(x,y,z).project(M.camera);return[Math.round((v.x+1)/2*innerWidth),Math.round((1-v.y)/2*innerHeight)]},[x,z,y]);
const SX=90,SY=640,LX=280,LY=740;// the right thumb looks from the free lower-right (the dock pills sit at x > 335, y 420-670)
const openSpot=()=>E(()=>{const M=window.__mocha;for(const z of [-2,-3,-1,0,-4,1,2])for(let x0=-26;x0<=20;x0+=2){let clear=true;for(let x=x0-4;x<=x0+15&&clear;x+=.5)for(const dz of [-6,-3,0,3,6])if(M.solidAt(x,z+dz).why){clear=false;break}if(clear)return{x:x0,z}}return{x:-10,z:-2}});
const reset=async(s,yaw=0)=>{await upAll().catch(()=>{});await E(([s,yaw])=>{const M=window.__mocha;M.ctlRelease();if(M.ctl().mode!=='walk')M.setCamMode('walk');M.walker(s.x,s.z,0,0);M.cam({yaw,pitch:.48})},[s,yaw]);await fr(2)};
try{
// ---------- 0) defaults + the clean HUD ----------
let c=await ctl();ok(c.scheme==='standard'&&c.sens==='normal'&&!c.invert&&!c.follow,'default: the standard scheme, normal sensitivity, no invert, no follow-behind',{scheme:c.scheme,sens:c.sens,invert:c.invert,follow:c.follow});
await E(()=>{const M=window.__mocha;M.weather('clear');M.setCamMode('walk')});await fr(3);c=await ctl();
ok(c.rotBtns===0&&!c.lookEl&&Math.abs(c.tilt-.48)<.01,'walk mode: no rotate buttons, no look stick, the default tilt',{rot:c.rotBtns,look:c.lookEl,tilt:c.tilt});
const hud=await E(()=>{const r=window.__mocha.hud?window.__mocha.hud():null;return r&&r.overlaps?r.overlaps:null});if(hud)ok(!hud.filter(o=>/joy|look/.test(o)).length,'HUD: the stick base overlaps nothing',hud);
const spot=await openSpot();console.log('  open spot',JSON.stringify(spot));await reset(spot);
await p.screenshot({path:SH+'v3-portrait-walk.png'});
{const hit=await E(([a,b,c,d])=>[document.elementFromPoint(a,b),document.elementFromPoint(c,d)].map(e=>e.id||e.tagName),[SX,SY,LX,LY]);ok(hit[0]==='c'&&hit[1]==='c','the stick and look start points are open world (the canvas), not HUD',hit)}
// ---------- 1) the stick walks camera-relative; no auto-swing ----------
const walkTo=async(dx,dy,frames)=>{const b0=await E(()=>window.__mocha.you());await down(1,SX,SY);await move(1,SX+dx*.5,SY+dy*.5);await move(1,SX+dx,SY+dy);await fr(frames);const b1=await E(()=>window.__mocha.you());const c1=await ctl();await up(1);await fr(1);return{b0,b1,c1}};
let r=await walkTo(0,-44,6);let s0=await scr(r.b0.x,r.b0.z),s1=await scr(r.b1.x,r.b1.z);
ok(Math.hypot(r.b1.x-r.b0.x,r.b1.z-r.b0.z)>.4&&s0[1]>s1[1]+8&&Math.abs(s1[0]-s0[0])<Math.max(16,(s0[1]-s1[1])*.35),'stick up walks away from the camera (up the screen)',{from:s0,to:s1});
await reset(spot);const yw0=(await ctl()).yaw;r=await walkTo(44,0,10);s0=await scr(r.b0.x,r.b0.z);s1=await scr(r.b1.x,r.b1.z);
ok(s1[0]>s0[0]+8,'stick right walks right on the screen',{from:s0,to:s1});ok(Math.abs(dYaw(yw0,r.c1.yaw))<.5,'no auto-swing: the camera yaw stays put while walking sideways',{before:yw0,after:r.c1.yaw});
// ---------- 2) left thumb walks WHILE the right thumb looks; the walk turns with the view ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-44);await fr(2);const h0=await ctl();await down(2,LX,LY);for(let k=1;k<=6;k++)await move(2,LX-k*20,LY);await fr(3);const h1=await ctl();
await fr(3);const dir=await E(()=>window.__you().yaw),want=h1.heading*Math.PI/180+Math.PI;
ok(h1.stick.on&&h1.look.on&&Math.abs(dYaw(h0.heading,h1.heading))>35,'both thumbs at once: the right thumb turns the view while the left walks',{h0:h0.heading,h1:h1.heading,stick:h1.stick.on,look:h1.look.on});
ok(Math.abs(dYaw(want*180/Math.PI,dir*180/Math.PI))<15,'...and "up" walks along the new view',{dir:+(dir*180/Math.PI).toFixed(1),want:+(want*180/Math.PI).toFixed(1)});
await up(2);await up(1);await fr(1);
// ---------- 3) look: yaw ~0.0065 rad/px, pitch half, clamps, invert, sensitivity ----------
const drag=async(dx,dy,steps=5)=>{const a=await ctl();await down(2,LX,LY);for(let k=1;k<=steps;k++)await move(2,LX+dx*k/steps,LY+dy*k/steps);await up(2);const b2=await ctl();return{dh:dYaw(a.heading,b2.heading),dt:b2.tilt-a.tilt,a,b:b2}};
await reset(spot);let L=await drag(-100,0);ok(Math.abs(L.dh-37.2)<6&&Math.abs(L.dt)<.01,'a 100 px horizontal look drag: ~37 deg of yaw, no tilt (drag left = look left)',{dh:+L.dh.toFixed(1),dt:+L.dt.toFixed(3)});
L=await drag(0,60);ok(Math.abs(L.dt-.195)<.05&&Math.abs(L.dh)<1,'a 60 px vertical drag: ~half the rate in pitch (drag down = look down)',{dt:+L.dt.toFixed(3)});
L=await drag(0,1600,10);ok(Math.abs(L.b.tilt-1.1)<.01,'pitch clamps: never straight down',{tilt:L.b.tilt});L=await drag(0,-2400,10);ok(Math.abs(L.b.tilt-.12)<.01,'pitch clamps: never under the ground',{tilt:L.b.tilt});
await reset(spot);await E(()=>window.__mocha.ctlSet({invert:true}));L=await drag(0,60);ok(L.dt<-.1,'invert vertical look flips the tilt',{dt:+L.dt.toFixed(3)});await E(()=>window.__mocha.ctlSet({invert:false}));
await E(()=>window.__mocha.ctlSet({sens:'fast'}));const Lf=await drag(-60,0);await E(()=>window.__mocha.ctlSet({sens:'slow'}));const Ls=await drag(-60,0);await E(()=>window.__mocha.ctlSet({sens:'normal'}));
ok(Math.abs(Lf.dh)>Math.abs(Ls.dh)*1.8,'look sensitivity: fast turns about twice as far as slow',{fast:+Lf.dh.toFixed(1),slow:+Ls.dh.toFixed(1)});
await fr(4);c=await ctl();ok(Math.abs(dYaw(c.heading,c.yaw)-c.nudge[0]*180/Math.PI)<4,'the camera glides onto the look heading (no overshoot left over)',{heading:c.heading,yaw:c.yaw,nudge:c.nudge});
// ---------- 4) quick taps still tap; long-press jogs ----------
await reset(spot);await tapAt(220,330);await fr(1);c=await ctl();ok(c.going&&!c.stick.on,'a quick tap on the world (right side): tap-to-go',{going:c.going});
await reset(spot);await tapAt(110,560);await fr(1);c=await ctl();ok(c.going&&!c.stick.on,'a quick tap in the stick half: tap-to-go too (a tap never walks the stick)',{going:c.going});
await reset(spot);await tapAt(230,330,900);await fr(1);c=await E(()=>({c:window.__mocha.ctl(),g:window.__you().going}));ok(c.c.going,'a long-press (900 ms) jogs there',c.g);
const tk0=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));const k=M.KEEPERS.map(k=>({k,q:M.town&&M.town.npc&&M.town.npc(k.id)})).find(o=>o.q&&o.q.visible&&o.q.st==='work');if(!k)return null;const v=new window.THREE.Vector3();M.CASTB[k.k.id].obj.getWorldPosition(v);return{id:k.k.id,x:v.x,y:v.y,z:v.z}});
if(tk0){let at=null,hit=null;
  for(const off of [[0,2.6],[2.6,0],[0,-2.6],[-2.6,0],[1.9,1.9],[-1.9,1.9],[1.9,-1.9],[-1.9,-1.9],[0,4],[4,0],[0,-4],[-4,0]]){const wx=tk0.x+off[0],wz=tk0.z+off[1];if(await E(([x,z])=>!!window.__mocha.solidAt(x,z).why,[wx,wz]))continue;
    const base=Math.atan2(wx-tk0.x,wz-tk0.z);await E(([x,z])=>{const M=window.__mocha;M.ctlRelease();M.walker(x,z,0,0)},[wx,wz]);
    for(const dy of [.45,-.45,.25,-.25]){await E(([yaw])=>window.__mocha.cam({yaw,pitch:.35}),[base+dy]);await fr(6);at=await scr(tk0.x,tk0.z,tk0.y+.7);
      hit=await E(([x,y,id])=>{const e=document.elementFromPoint(x,y),c=window.__mocha.CASTB[id];let o=c&&c.obj,vis=!!o;while(o){if(!o.visible){vis=false;break}o=o.parent}return{el:e?(e.id||e.tagName):null,vis:vis&&!(c.lod&&c.lod.lvl<0)}},[at[0],at[1],tk0.id]);
      if(at[0]>24&&at[0]<369&&at[1]>170&&at[1]<640&&hit.el==='c'&&hit.vis)break;at=null}if(at)break}
  if(at){await tapAt(at[0],at[1]);await fr(2);const ti=await E(()=>window.__mocha.talkInfo());ok(ti.open&&ti.id===tk0.id,'a quick tap on a person opens the talk card ('+tk0.id+')',{at,open:ti.open,id:ti.id});await E(()=>window.__mocha.talkClose());await fr(3)}
  else ok(false,'could not frame a drawn keeper on open screen to tap',{id:tk0.id,hit})}else ok(false,'no keeper at work to tap');
// ---------- 5) pinch zooms ----------
await reset(spot);let z0=await ctl();await down(2,225,300);await down(3,315,300);for(let k=1;k<=4;k++){await move(2,225+k*8,300-k*3);await move(3,315-k*8,300+k*3)}await up(3);await up(2);await fr(2);let z1=await ctl();
ok(z1.dist>z0.dist*1.15&&Math.abs(dYaw(z0.heading,z1.heading))<.5&&Math.abs(z1.tilt-z0.tilt)<.005,'a pinch on the look side zooms (no twist, no tilt)',{before:[z0.dist,z0.heading],after:[z1.dist,z1.heading]});
await reset(spot);z0=await ctl();{const t0=Date.now();A.set(4,[80,600]);await send('touchStart',[...A],t0);A.set(5,[160,600]);await send('touchStart',[...A],t0+60);for(let k=1;k<=4;k++){A.set(4,[80-k*10,600]);A.set(5,[160+k*10,600]);await send('touchMove',[...A],t0+60+k*40)}
  const mid=await ctl();A.clear();await send('touchEnd',[],t0+300);await fr(2);z1=await ctl();ok(z1.dist<z0.dist*.85&&!mid.stick.on&&mid.stick.x===0&&mid.stick.y===0,'two fingers landing together on the left pinch too (no walking)',{before:z0.dist,after:z1.dist,mid:mid.stick})}
// ---------- 6) Settings > Camera persists; the old cozy/free setting migrates ----------
await E(()=>{if(document.getElementById('panel').classList.contains('hidden'))document.getElementById('bookBtn').click();window.__mocha.openTab('set')});await W(900);
const rows=await E(()=>({sens:[...document.querySelectorAll('#tab-set button[data-k="lookS"]')].map(b=>b.dataset.v),inv:!!document.querySelector('#tab-set input[data-t="lookInv"]'),fol:!!document.querySelector('#tab-set input[data-t="camFollow"]'),cozy:!!document.querySelector('#tab-set [data-k="cam"]')}));
ok(rows.sens.join()==='slow,normal,fast'&&rows.inv&&rows.fol&&!rows.cozy,'Settings > Camera: look sensitivity, invert vertical look, camera follows behind you (no Cozy/Free)',rows);
await p.locator('#tab-set button[data-k="lookS"][data-v="fast"]').scrollIntoViewIfNeeded();await p.locator('#tab-set button[data-k="lookS"][data-v="fast"]').tap();await W(400);
await p.locator('#tab-set input[data-t="lookInv"]').tap();await W(300);await p.locator('#tab-set input[data-t="camFollow"]').tap();await W(300);
let sv=await E(()=>{const s=JSON.parse(localStorage.getItem('mocha-settings'));return{cam:s.cam,lookS:s.lookS,lookInv:s.lookInv,camFollow:s.camFollow,ctl:window.__mocha.ctl()}});
ok(sv.cam==='std'&&sv.lookS==='fast'&&sv.lookInv===true&&sv.camFollow===true&&sv.ctl.sens==='fast'&&sv.ctl.invert&&sv.ctl.follow,'Settings: fast + invert + follow are saved in SET and live at once',{cam:sv.cam,lookS:sv.lookS,inv:sv.lookInv,fol:sv.camFollow});
await E(()=>sessionStorage.setItem('ctl-keep','1'));await p.reload();await W(6000);
let rl=await E(()=>{window.__mocha.openTab('set');const c=window.__mocha.ctl();return{sens:c.sens,invert:c.invert,follow:c.follow,on:document.querySelector('#tab-set button[data-k="lookS"].on').dataset.v,inv:document.querySelector('#tab-set input[data-t="lookInv"]').checked}});
ok(rl.sens==='fast'&&rl.invert&&rl.follow&&rl.on==='fast'&&rl.inv,'the camera settings persist across a reload',rl);
await E(()=>{const s=JSON.parse(localStorage.getItem('mocha-settings'));s.cam='cozy';s.lookS='fast';s.lookInv=true;localStorage.setItem('mocha-settings',JSON.stringify(s))});await p.reload();await W(6000);
rl=await E(()=>{const c=window.__mocha.ctl();return{scheme:c.scheme,sens:c.sens,invert:c.invert,follow:c.follow}});ok(rl.scheme==='standard'&&rl.sens==='normal'&&!rl.invert&&!rl.follow,'an old save with SET.cam "cozy" migrates to the standard scheme defaults',rl);
await E(()=>{const pn=document.getElementById('panel');if(!pn.classList.contains('hidden'))document.getElementById('bookBtn').click();const M=window.__mocha;M.weather('clear');M.setCamMode('walk')});await fr(3);
// ---------- 7) "Camera follows behind you" ----------
const follow=async on=>{await E(o=>window.__mocha.ctlSet({follow:o}),on);await reset(spot);await down(1,SX,SY);await move(1,SX+9,SY-44);await fr(4);const a=await ctl();
  const b2=await E(()=>{const M=window.__mocha;M.CTL.lkT=-99;return M.ctlTick(60,.05)});await up(1);await fr(1);return{a:a.heading,b:b2.heading,d:dYaw(a.heading,b2.heading)}};
const fOff=await follow(false),fOn=await follow(true);await E(()=>window.__mocha.ctlSet({follow:false}));
ok(Math.abs(fOff.d)<.5,'follow-behind OFF: walking slightly off-axis never swings the camera',fOff);ok(Math.abs(fOn.d)>4,'follow-behind ON: after a while walking ahead the camera eases in behind him',fOn);
// ---------- 8) a CAM layer swings the view under a held stick: the walk keeps its direction until the thumb turns ----------
await reset(spot);await down(1,SX,SY);await move(1,SX,SY-30);await fr(4);const d0=await E(()=>window.__you().yaw);
await E(()=>{const M=window.__mocha;M.cam.push('tst',{prio:1,target:()=>{const y=M.you();return{x:y.x,y:1,z:y.z}},dist:7,pitch:.5,yaw:M.CTL.h+1.2,ease:4})});await fr(5);
const d1=await E(()=>window.__you().yaw);const cy=(await ctl()).yaw;
ok(Math.abs(dYaw(d0*180/Math.PI,d1*180/Math.PI))<8,'a CAM layer swings the view 69 deg under a held stick: he keeps walking the same way',{before:+(d0*180/Math.PI).toFixed(1),after:+(d1*180/Math.PI).toFixed(1),camYaw:cy});
await move(1,SX+30,SY-15);await fr(2);await move(1,SX,SY-30);await fr(4);const d2=await E(()=>window.__you().yaw);const cy2=(await ctl()).yaw;
ok(Math.abs(dYaw(d2*180/Math.PI,cy2+180))<12,'...once the thumb turns, "up" follows the new view',{dir:+(d2*180/Math.PI).toFixed(1),camYaw:cy2});
await up(1);await E(()=>window.__mocha.cam.pop('tst'));await fr(3);
// ---------- 9) talk two-shot right after the walker changed place ----------
const tk=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.weather('drizzle');M.setCamMode('follow');await sl(1200);M.setCamMode('walk');const ev=M.byId.evergreen;M.you(ev.x,ev.z-1);await sl(2500);
  let id='juniper';const n=M.town&&M.town.npc&&M.town.npc('juniper');if(n&&n.visible===false){const k=M.KEEPERS.find(k=>{const q=M.town.npc(k.id);return q&&q.visible&&q.st==='work'});if(k)id=k.id}const i=M.talk(id);return{id,open:i&&i.open}});
await W(3500);
const shot=await E(id=>{const M=window.__mocha,T=window.THREE,cam=M.camera,c=cam.position.clone(),y=window.__you(),o=M.CASTB[id].obj,v=new T.Vector3();o.getWorldPosition(v);const vis=new T.Vector3();
  const you=M.scene.getObjectByName?null:null;const heads=[['you',new T.Vector3(y.x,1.5+(window.__mocha.navFloor?0:0),y.z)],[id,new T.Vector3(v.x,v.y+1.4,v.z)]];
  const skip=new Set();for(const q of [o])q.traverse(z=>skip.add(z));const rect=M.talkState().rect;const out=[];
  for(const [k,h] of heads){const d=h.clone().sub(c),L=d.length(),rc=new T.Raycaster(c,d.normalize(),.05,Math.max(.1,L-.5));rc.camera=cam;const hit=rc.intersectObjects(M.scene.children,true).filter(i=>{const q=i.object;if(!q.isMesh||q.isInstancedMesh||skip.has(q))return false;for(let z=q;z;z=z.parent)if(!z.visible)return false;const mt=Array.isArray(q.material)?q.material[0]:q.material;return!(mt&&mt.transparent&&mt.opacity<.5)});
    let nm=null;if(hit[0]){let z=hit[0].object;const pth=[];while(z&&pth.length<4){pth.push(z.name||z.type);z=z.parent}nm=pth.join('<')+'@'+hit[0].distance.toFixed(2)}
    const s=h.clone().project(cam);out.push({k,dist:+L.toFixed(2),blocked:nm,sx:Math.round((s.x+1)/2*innerWidth),sy:Math.round((1-s.y)/2*innerHeight)})}
  const inside=Object.values(M.byId).filter(q=>q.w&&q.d&&(q.solid||q.interior)&&q.kind!=='lot'&&q.kind!=='plaza').filter(q=>{const cs=Math.cos(q.ry||0),sn=Math.sin(q.ry||0),dx=c.x-q.x,dz=c.z-q.z;return Math.abs(dx*cs-dz*sn)<q.w/2&&Math.abs(dx*sn+dz*cs)<q.d/2&&c.y<(q.h||8)}).map(q=>q.id);
  const top=Math.max(...[...document.querySelectorAll('#leftTop>*')].map(e=>e.getBoundingClientRect().bottom).filter(x=>x>0),0);
  return{cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)],you:[y.x,y.z],npc:[+v.x.toFixed(2),+v.z.toFixed(2)],heads:out,inside,card:rect,top,stack:M.CAM.stack().map(e=>e.owner)}},tk.id);
await p.screenshot({path:SH+'portrait-talk-'+tk.id+'-after-walk.png'});
const room=await E(()=>{const M=window.__mocha,y=window.__you();const q=Object.values(M.byId).find(q=>q.interior&&q.w&&q.kind!=='home'&&q.kind!=='lot'&&(()=>{const cs=Math.cos(q.ry),sn=Math.sin(q.ry),dx=y.x-q.x,dz=y.z-q.z;return Math.abs(dx*cs-dz*sn)<q.w/2+.3&&Math.abs(dx*sn+dz*cs)<q.d/2+.3})());return q?q.id:null});
ok(tk.open&&shot.stack.includes('talk'),'talk card open with CAM talk on the stack ('+tk.id+')',{stack:shot.stack});
ok(!shot.inside.filter(id=>id!==room).length,'two-shot camera is not inside another building',{inside:shot.inside,room,cam:shot.cam});
ok(shot.heads.every(h=>h.dist>2),'two-shot camera is not up against a face (> 2 from both heads)',shot.heads.map(h=>[h.k,h.dist]));
ok(shot.heads.every(h=>h.sx>8&&h.sx<393-8&&h.sy>shot.top&&h.sy<(shot.card?shot.card.y:852)),'both heads on screen, between the top pills and the card',{heads:shot.heads.map(h=>[h.k,h.sx,h.sy]),top:shot.top,card:shot.card});
ok(shot.heads.every(h=>!h.blocked),'nothing solid between the camera and either head',shot.heads.map(h=>[h.k,h.blocked]));
// ---------- 10) bubbles stay below the top HUD (talk reply in portrait) ----------
const bb=await E(()=>{const M=window.__mocha,r=M.bub(70,40,'oh! did you hear? the bakery has pumpkin scones today~'),pill=document.getElementById('mochaPill').getBoundingClientRect(),L=[...document.querySelectorAll('#leftTop>*')].map(e=>e.getBoundingClientRect()).filter(q=>q.width);
  const ov=L.some(q=>r.x<q.right&&q.left<r.x+r.w&&r.y<q.bottom&&q.top<r.y+r.h);document.getElementById('bubble3').classList.remove('show');return{r,pill:[Math.round(pill.left),Math.round(pill.top),Math.round(pill.width),Math.round(pill.height)],ov}});
ok(!bb.ov&&bb.r.y>=bb.pill[1]+bb.pill[3],'a speech bubble aimed at the top-left lands below the status pill, not over it',bb);
await E(()=>window.__mocha.talkClose());await W(800);await fr(2);
// ---------- 11) Lantern Square: the fountain column never hides the walker ----------
const sq=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms));M.weather('clear');M.ctlRelease();M.walker(-30,28.3,Math.PI,0);M.cam({yaw:0,pitch:.48});const f0=window.__fc;const t0=Date.now();while(Date.now()-t0<60000){await sl(250);if(window.__fc-f0<8)continue;const c=M.ctl();if(Math.abs(c.pitch-(c.tilt+c.nudge[1]))<.01&&Math.abs(((c.yaw-c.heading-c.nudge[0]*180/Math.PI)+540)%360-180)<1)break}await sl(500);
  const T=window.THREE,c=M.camera.position.clone(),y=window.__you(),t=new T.Vector3(y.x,.9,y.z),d=t.clone().sub(c),L=d.length();
  const ax=c.x,ay=c.y,az=c.z,bx=t.x,by=t.y,bz=t.z;let col=false;for(let k=0;k<=40;k++){const u=k/40,x=ax+(bx-ax)*u,yy=ay+(by-ay)*u,z=az+(bz-az)*u;if(Math.hypot(x+30,z-33)<1.6&&yy<4.1)col=true}
  const s=t.clone().project(M.camera);return{ctl:M.ctl(),cam:[+c.x.toFixed(2),+c.y.toFixed(2),+c.z.toFixed(2)],col,scr:[Math.round((s.x+1)/2*innerWidth),Math.round((1-s.y)/2*innerHeight)]}});
await p.screenshot({path:SH+'v3-portrait-square-fountain.png'});
ok(!sq.col&&sq.scr[0]>0&&sq.scr[0]<393&&sq.scr[1]>0&&sq.scr[1]<852,'Lantern Square: the camera clears the fountain column and the walker is on screen',{col:sq.col,nudge:sq.ctl.nudge,pitch:sq.ctl.pitch,cam:sq.cam,scr:sq.scr});
ok(Math.abs(sq.ctl.nudge[0])<=.38&&sq.ctl.nudge[1]>0,'the occluder nudge (v2) is kept: up first, at most a small swing around',{nudge:sq.ctl.nudge,heading:sq.ctl.heading,yaw:sq.ctl.yaw});
// ---------- 12) labels: hidden behind the room you are in; size capped ----------
const lab=await E(async()=>{const M=window.__mocha,sl=ms=>new Promise(r=>setTimeout(r,ms)),q=M.byId.cafe;M.walker(q.x,q.z,0,0);await sl(5000);const c=M.camera.position,cs=Math.cos(q.ry),sn=Math.sin(q.ry);
  const seg=(px,py,pz)=>{let t0=0,t1=1;const a0=(c.x-q.x)*cs-(c.z-q.z)*sn,a2=(c.x-q.x)*sn+(c.z-q.z)*cs,d0=(px-q.x)*cs-(pz-q.z)*sn-a0,d2=(px-q.x)*sn+(pz-q.z)*cs-a2,d1=py-c.y;
    const sl1=(a,d,lo,hi)=>{if(Math.abs(d)<1e-6)return a>=lo&&a<=hi;let u=(lo-a)/d,v=(hi-a)/d;if(u>v){const w=u;u=v;v=w}t0=Math.max(t0,u);t1=Math.min(t1,v);return t0<=t1};return sl1(a0,d0,-q.w/2,q.w/2)&&sl1(c.y,d1,0,q.h+2.5)&&sl1(a2,d2,-q.d/2,q.d/2)};
  const byName={};for(const p of Object.values(M.byId))byName[p.name]=p;const vis=[],bad=[];let wend=null,maxW=0;
  for(const el of document.querySelectorAll('.lbl')){const nm=el.dataset.base.replace(/^(🏠 |✨ )/,''),p=byName[nm];const on=el.style.opacity==='1';const r=el.getBoundingClientRect();if(on)maxW=Math.max(maxW,r.width);if(p&&p.id==='neighbor')wend=on;if(!on||!p||p===q)continue;const y=(p.h||6)+(p.id==='home'?9:3);vis.push(p.id);if(['needle','wheel','spot','park','hill','troll','station'].includes(p.kind))continue;if(seg(p.x,y,p.z))bad.push(p.id)}
  const ls=[...document.querySelectorAll('.lbl')].map(e=>parseFloat(e.style.getPropertyValue('--ls')||'1'));return{room:M.ctl().room,top:M.CAM.top()&&M.CAM.top().owner,vis,bad,wend,maxW:Math.round(maxW),lsMax:Math.max(...ls),lsMin:Math.min(...ls)}});
ok(lab.room==='cafe'&&lab.top==='room','walker in the cafe: room layer on top',{room:lab.room,top:lab.top});
ok(!lab.bad.length&&lab.wend!==true,"inside the cafe no place label shows through its walls (Wendell's House hidden)",lab);
ok(lab.maxW<=260&&lab.lsMax<=1,'label size capped (max width 260, near labels scaled down)',{maxW:lab.maxW,ls:[lab.lsMin,lab.lsMax]});
// ---------- 12a) rain is clipped out of the room ----------
const rn=await E(async()=>{const M=window.__mocha;M.weather('rain');await new Promise(r=>setTimeout(r,2500));const c=M.ctl(),q=M.byId.cafe;return{rain:c.rain,want:[q.w/2+.4,q.d/2+.4],prog:M.renderer.info.programs.some(p=>/,b?c$/.test(String(p.cacheKey||'')))&&!!M.PATCH.find(q=>q.id==='c')}});
await p.screenshot({path:SH+'portrait-cafe-rain.png'});
ok(Math.abs(rn.rain[0]-rn.want[0])<.01&&Math.abs(rn.rain[1]-rn.want[1])<.01&&rn.prog,'rain in a room: the streaks are clipped out of the cafe box (shader clip active)',rn);
// ---------- 12b) inside a room the stick still walks and a look drag stays inside the room's range ----------
{await E(()=>{const M=window.__mocha;M.weather('clear')});const q=await E(()=>{const q=window.__mocha.byId.cafe;return{x:q.x,z:q.z,ry:q.ry}});await fr(2);let rc=await ctl();
  if(rc.cam==='room'){const a=await E(()=>window.__mocha.you());await down(1,SX,SY);await move(1,SX,SY-30);await fr(4);const b2=await E(()=>window.__mocha.you());await up(1);await fr(1);ok(Math.hypot(b2.x-a.x,b2.z-a.z)>.2,'in the cafe (room camera on top) the stick still walks',{moved:+Math.hypot(b2.x-a.x,b2.z-a.z).toFixed(2)});
    await down(2,LX,LY);for(let k=1;k<=8;k++)await move(2,LX-k*40,LY);await up(2);await fr(6);rc=await ctl();const off=dYaw(q.ry*180/Math.PI,rc.yaw);ok(Math.abs(off)<=1.22*180/Math.PI+3&&rc.cam==='room','a long look drag in the room turns the view only as far as the room allows',{yaw:rc.yaw,roomAxis:+(q.ry*180/Math.PI).toFixed(1),off:+off.toFixed(1)})}
  else ok(false,'room layer expected in the cafe',rc)}
await E(async()=>{const M=window.__mocha;M.walker(-12,-2,0,0);const t0=Date.now();while(Date.now()-t0<20000){await new Promise(r=>setTimeout(r,500));if(!M.ctl().room)break}});await W(800);const rn2=await ctl();ok(rn2.rain[0]===0||rn2.room===null,'back outside: no room layer for the labels',{rain:rn2.rain,room:rn2.room});
// ---------- 13) watch mode keeps its orbit drag ----------
await E(()=>{window.__mocha.weather('clear');window.__mocha.setCamMode('follow')});await E(async()=>{const M=window.__mocha,t0=Date.now();while(Date.now()-t0<20000){await new Promise(r=>setTimeout(r,500));const e=M.CAM.cur;if(!e||e.k>=1)break}});await fr(2);let f0=await E(()=>window.__mocha.cam());await down(2,200,300);for(let k=1;k<=5;k++){await move(2,200+k*20,300+k*10)}await up(2);await fr(2);let f1=await E(()=>window.__mocha.cam());
{const top=await E(()=>{const t=window.__mocha.CAM.top();return t&&t.owner});ok(Math.abs(f1.yaw-f0.yaw)>(top==='room'?.05:.2),'watch mode: a drag still orbits the camera'+(top==='room'?' (Mocha indoors: the B12 room clamp limits it)':''),{before:+f0.yaw.toFixed(3),after:+f1.yaw.toFixed(3),top})}
}catch(e){ok(false,'test threw: '+e.message)}
ok(!errs.length,'no page errors',errs.slice(0,5));
console.log(fails?`${fails} FAILED of ${n}`:`ALL PASS (${n})`);await b.close();process.exit(fails?1:0)})();

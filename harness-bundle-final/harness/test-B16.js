// B16 acceptance: living lights. WLT (room-by-room windows from occOf), the closing café, the lamplighting wave + tinks, the hearth
// window flickering with the fire (same noise), the fixed light rig (count, innerLight in the scene, L2 from boot), lights as messages
// (Wendell's double porch flick, the lantern at 60% for a friend), the winMats loop gone. node test-B16.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,700):''));if(!c)fails++};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const ctx=await b.newContext({viewport:{width:393,height:852},isMobile:true,hasTouch:true,deviceScaleFactor:2});const p=await ctx.newPage();const errs=[];
p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(22));
await p.goto('file://'+file);await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);
// re-point the faked clock mid-test (the app reads the global Date on every call)
const clock=h=>E(h=>{const R=window.__RD||(window.__RD=Object.getPrototypeOf(window.Date));const tgt=new R(R.now());tgt.setMonth(10,1);tgt.setHours(Math.floor(h),Math.round((h%1)*60),0,0);const off=tgt-R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;return new Date().getHours()+new Date().getMinutes()/60},h);
const wait=ms=>p.waitForTimeout(ms);
ok(await E(()=>['wlt','setLux','lights','lamps','porch'].every(k=>typeof window.__mocha[k]==='function')),'hooks: __mocha.wlt(), setLux(x), lights(), lamps(), porch(pid)');
// 4) the fixed rig
let r=await E(()=>window.__mocha.lights());
ok(r.count===r.n0&&r.count===5&&r.innerLightScene&&r.L1&&r.L2,'fixed rig: 5 lights (hemi, sun, L0 mLight, L1 = innerLight now a child of the scene, L2 from boot); count == boot count',{count:r.count,n0:r.n0,list:r.list.map(l=>l.type+':'+l.name+'@'+l.parent)});
r=await E(()=>{const w=window.__mocha.wlt();return{loop:w.loop,enc:w.encoded,drv:w.driven,n:w.n,lut:w.lut,patched:w.patched,winMats:w.winMats}});
ok(!r.loop&&r.enc>40&&r.enc+r.drv===r.winMats&&r.lut.w===256&&r.lut.h===1&&r.lut.nearest&&!r.lut.mip,'the winMats loop is gone from updateSky; every window material is LUT-encoded (win patch) or WLT-driven; 256x1 Nearest LUT',r);
// 1) Wendell at 22:00 lit in his room; 23:30 only the nightlight; the café dark after 19:20
const nb=()=>E(()=>{const M=window.__mocha;M.wForce('inside');return new Promise(res=>setTimeout(()=>{M.wlt({tick:1});const w=M.wlt('neighbor'),room=M.rooms('neighbor').room;res({room,h:new Date().getHours()+new Date().getMinutes()/60,s:Object.fromEntries(w.slots.map(s=>[s.key.split(':')[1],[s.lv,s.col]]))})},700))});
await clock(22.0);r=await nb();
ok(r.room&&r.s[r.room]&&r.s[r.room][0]>=.95&&Object.entries(r.s).every(([k,v])=>k===r.room||Math.abs(v[0]-.3)<.02),"22:00: Wendell's window is lit 1.0 in the room he is in (occOf room), the other rooms .3",r);
await clock(23.5);r=await nb();
ok(r.s.bed&&Math.abs(r.s.bed[0]-.12)<.01&&r.s.bed[1]==='#ffb3c1'&&Object.entries(r.s).every(([k,v])=>k==='bed'||v[0]===0),'23:30: only his bed-nook nightlight is on (.12 #FFB3C1)',r);
await clock(19.34);r=await E(()=>{const M=window.__mocha;M.wlt({tick:1});const w=M.wlt('cafe');return Object.fromEntries(w.slots.map(s=>[s.key.split(':')[1],s.lv]))});
ok(r.main===0&&(r.back||0)===0&&r.sec<=.25,'19:20: the café is dark (sales floor + back room off; one .25 security light)',r);
await clock(18.99);await E(()=>window.__mocha.wlt({tick:1}));await wait(400);await clock(19.0);await wait(700);
r=await E(()=>{const w=window.__mocha.wlt('cafe');return Object.fromEntries(w.slots.map(s=>[s.key.split(':')[1],s.tl]))});const seq0=r;await wait(21000);
r=await E(()=>{const w=window.__mocha.wlt('cafe');return Object.fromEntries(w.slots.map(s=>[s.key.split(':')[1],s.tl]))});
ok(seq0.main>=.7&&r.main===0&&r.sec===.25,'closing at 19:00 runs a 20 s sequence that leaves one .25 security light',{start:seq0,after21s:r});
// 2) faking lux across .42 lights the lamps in a wave from Lantern Square; tinks fire
r=await E(()=>{const M=window.__mocha;window.__tk=0;if(M.SFXEV)M.SFXEV.on('tink',()=>window.__tk++);M.setLux(.7);return M.lamps().on});await wait(1500);
await E(()=>window.__mocha.setLux(.3));await wait(14000);
r=await E(()=>{const L=window.__mocha.lamps();const lit=L.tOn.map((t,i)=>[L.d[i],t]).filter(x=>x[1]>=0).sort((a,b)=>a[0]-b[0]);let mono=0;for(let i=1;i<lit.length;i++)if(lit[i][1]+.12>=lit[i-1][1])mono++;
  let n=lit.length,sx=0,sy=0,sxy=0,sxx=0,syy=0;for(const [x,y] of lit){sx+=x;sy+=y;sxy+=x*y;sxx+=x*x;syy+=y*y}const corr=(n*sxy-sx*sy)/Math.sqrt((n*sxx-sx*sx)*(n*syy-sy*sy));
  return{on:L.on,lit:n,of:L.n,mono,corr:+corr.toFixed(3),tinks:L.tinks,ev:window.__tk,first:lit.slice(0,3),last:lit.slice(-3),waves:L.wave.waves,lux:L.lux}});
ok(r.on===1&&r.lit>=10&&r.corr>.97&&r.mono>=r.lit-2,'lux .7 -> .3 lights the lamps in a wave: on-times grow with distance from the square (~6 u/s)',r);
ok(r.tinks>=r.lit&&r.ev>=r.lit,"each lamp emits SFXEV 'tink' as it flickers on",{tinks:r.tinks,events:r.ev});
await E(()=>window.__mocha.setLux(null));
// 3) the fire and his window flicker in sync
await clock(21.0);r=await E(async()=>{const M=window.__mocha,W=M.W||null;if(M.tv)M.tv(false);M.wForce('inside');M.CAM.push('t16',{prio:3,lock:true,ease:40,tx:14,ty:1,tz:40,dist:16,pitch:.5,yaw:0});M.cam.tick(80,.05);await new Promise(r=>setTimeout(r,2500));
  const S=[];for(let i=0;i<10;i++){await new Promise(r=>setTimeout(r,180));const f=M.lights().fire;f.as=M.lights().assign.map(a=>a.pid+':'+a.kind);S.push(f)}M.CAM.pop('t16');return S});
{const ns=r.map(f=>f&&f.n),sd=Math.sqrt(ns.reduce((a,v)=>a+(v-ns.reduce((x,y)=>x+y,0)/ns.length)**2,0)/ns.length);
 ok(r.every(f=>f&&f.lit&&f.winFl===2&&f.win!=null&&Math.abs(f.win-f.f)<1e-6&&(f.light==null||Math.abs(f.light-f.f)<2e-3))&&r.some(f=>f.light!=null)&&sd>.01,"Wendell's fire flickers and his living-room window flickers with the SAME noise sample (light factor == window factor each frame)",{sd:+sd.toFixed(3),s:r.slice(0,4)})}
r=await E(()=>window.__mocha.lights().fx);ok(r.chimneys.some(c=>c.pid==='neighbor'&&c.lit)&&r.smoke>0,'chimney smoke puffs from his lit chimney',r);
// 5) lights as messages
await clock(19.0);r=await E(async()=>{const M=window.__mocha,G=M.G,h=M.byId.home;G.x=h.x;G.z=h.z-2;G.mode='idle';G.timer=1e5;G.sleep=false;G.act=null;M.wForce('inside');await new Promise(r=>setTimeout(r,700));
  const f0=M.porch('neighbor').flicks;M.wlt({flick:'reset'});await new Promise(r=>setTimeout(r,3600));const P=M.porch('neighbor'),w=M.wlt();return{f0,f1:P.flicks,log:P.log,flick:w.flick,homeOcc:M.rooms('home').occ,nbOcc:M.rooms('neighbor').occ}});
{const L=r.log.join('');ok(r.f1===r.f0+1&&L==='0101',"19:00, both home: Mocha's window lighting makes Wendell flick his porch light twice (off,on,off,on)",r)}
ok(r.flick.cand,'and "flick my porch light back" is now a weighted candidate for Mocha (FLK window open)',r.flick);
r=await E(async()=>{const M=window.__mocha,S=M.S,G=M.G;S.mem.chats=80;S.lite.v=0;G.sleep=true;await new Promise(r=>setTimeout(r,1500));const a=M.porch('home');S.mem.chats=0;await new Promise(r=>setTimeout(r,1500));const b=M.porch('home');G.sleep=false;return{friend:a,stranger:b}});
ok(Math.abs(r.friend.want-.6)<.01&&Math.abs(r.friend.level-.6)<.05&&r.friend.forYou&&r.friend.card,"at friend tier Mocha's porch lantern holds 60% all night (asleep) and the little card hangs on the hook",r.friend);
ok(Math.abs(r.stranger.want-.3)<.01&&!r.stranger.card,'without the bond (and no visit in 3 days) it drops to the ghost-who-likes-visitors 30%',r.stranger);
// porch API + back soon
r=await E(()=>{const M=window.__mocha;const a=M.porch('neighbor',.2);const b=M.porch('neighbor',null);const br=M.shopBreak('cafe',Date.now()+60e3);const w=M.wlt('cafe');M.shopBreak('cafe',0);return{a:a.user,b:b.user,br,slots:w.slots.map(s=>s.key+'='+s.tl)}});
ok(r.a===.2&&r.b===null&&r.br&&/back at/.test(r.br.label)&&r.slots.some(s=>s==='cafe:sec=0.6'),'porch(pid,level) overrides and null restores the rules; shopBreak leaves one warm light + a "back at" note',r);
ok((await E(()=>window.__mocha.lights().count))===5,'the scene light count is still identical after all of it',null);
ok(errs.length===0,'no page errors',errs.slice(0,5));
console.log(fails?`${fails} FAILED`:'ALL PASS');await b.close();process.exit(fails?1:0)})();

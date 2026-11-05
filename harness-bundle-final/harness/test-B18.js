// B18 acceptance: chibi kit (8 draws, setFace = uv only), the new you (1.95 tall, head >=42%, Forest #2F6B4F, recolour without rebuild, no yellow jackets),
// flannel toggle + persistence, hood in rain, lantern at 22:00, emote button (5 choices, wave, photo -> album survives savePhotos + reload),
// Your Look sheet (CAM 'look' on top, no overlap) in portrait, landscape and Duo. Drives the game through window.__mocha hooks. node test-B18.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,700):''));if(!c)fails++};
const SH='/tmp/harness/b18/shots/';
const overlapJS=()=>{const yl=document.querySelector('#yl').getBoundingClientRect(),bad=[];for(const e of document.querySelectorAll('#leftTop,#leftTop>*,#mochaPill,#sky,#mindBtn,#meters,#dock,#joy,#look,#zoom,#chatwrap,#near,#away,#edge,.hudS,.hudMore,#panel,#msgs,#toast,#emoteFan,#diaryBtn,#camctl')){const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden'||+cs.opacity<.05)continue;const r=e.getBoundingClientRect();if(!r.width||!r.height)continue;if(r.left<yl.right&&yl.left<r.right&&r.top<yl.bottom&&yl.top<r.bottom)bad.push(e.id||e.className)}
  const small=[...document.querySelectorAll('#yl button')].filter(b=>{const r=b.getBoundingClientRect();return r.width&&(r.width<43.5||r.height<43.5)}).map(b=>b.textContent||b.getAttribute('aria-label'));const el=document.querySelector('#yl'),body=el.querySelector('.ylBody');
  return{bad,small,rect:[yl.left,yl.top,yl.width,yl.height],hscroll:el.scrollWidth>el.clientWidth+1||(body&&body.scrollWidth>body.clientWidth+1),vw:innerWidth,vh:innerHeight}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file);await p.waitForTimeout(5000);return{ctx,p,errs,E:(f,a)=>p.evaluate(f,a)}};
const walk=E=>E(async()=>{const M=window.__mocha;if(!document.body.classList.contains('walk'))document.querySelector('#modeBtn').click();await new Promise(r=>setTimeout(r,600));return M.youInfo()});
// ---------- portrait 393x852 at 15:00 ----------
let {ctx,p,errs,E}=await open({width:393,height:852},true,15);
ok(await E(()=>['face','emote','youLook','youEmote','youWeather'].every(k=>typeof window.__mocha[k]==='function')&&typeof window.__you==='function'),'hooks: __mocha.face/emote/youLook/youEmote/youWeather and __you()');
let r=await walk(E);r=await E(()=>{const M=window.__mocha;M.youWeather('clear');return M.youInfo()});
ok(Math.abs(r.h-2.14)<=.08&&r.headFrac>=.42,'walker is about 2.14 tall (hood down; owner fix 2: the default guy\'s tousled swoop adds .19 over the old 1.95 bob, body unchanged) with the head >= 42% of height',{h:r.h,head:r.head,headFrac:r.headFrac});
ok(r.jacket==='#4f6b9a'&&r.vcol==='#3d5785'&&r.jacketName==='Harbor Blue','default jacket is Harbor Blue #4f6b9a (owner fix 2; vertex colours #3d5785 = swatch x WCOMP, so it shows as the swatch)',{jacket:r.jacket,vcol:r.vcol});
ok(r.name==='Jesse'&&r.home==='Kansas City, Missouri','the walker is Jesse from Kansas City, Missouri (Addendum J)',{name:r.name,home:r.home});
ok(r.draws<=10,'walker costs 10 draws or fewer',{draws:r.draws});
const you=await E(()=>{const y=window.__you();return{look:y.look,face:y.face,has:'emote' in y,x:y.x}});ok(Array.isArray(you.look)&&you.look.length===14&&you.face&&you.has&&you.x!=null,'__you() still works and now carries look, face and emote',you);
// recolour without rebuild
const before=r;r=await E(()=>window.__mocha.youLook({jk:0}));
ok(r.jacket==='#2F6B4F'&&r.vcol==='#245744'&&r.meshes===before.meshes&&JSON.stringify(r.geos)===JSON.stringify(before.geos),'Forest recolours without rebuilding (same meshes, same geometries; owner fix 2: Harbor Blue is now the default)',{vcol:r.vcol,meshes:[before.meshes,r.meshes],same:JSON.stringify(r.geos)===JSON.stringify(before.geos)});
r=await E(()=>{const M=window.__mocha;return{jk:M.LOOKP.jk.map(j=>[j[0],j[1],+M.hueOf(j[1]).toFixed(1),M.jacketOK(j[1])]),boots:M.LOOKP.sh.map(s=>+M.hueOf(s[1]).toFixed(1))}});
ok(r.jk.length===6&&r.jk.every(j=>j[3]),'no jacket swatch has a hue between 38 and 68 degrees',r.jk);
// flannel toggles (shape change swaps only BODY's geometry)
r=await E(()=>{const M=window.__mocha,a=M.youLook({fl:1}),b=M.youLook({fl:0}),c=M.youLook({fl:2});/* owner fix 2: the default guy has the flannel off, so switch it on first */return{a:a.geos.BODY,b:b.geos.BODY,c:c.geos.BODY,head:[a.geos.HEAD,c.geos.HEAD],fl:[a.flannel,b.flannel,c.flannel],m:[a.meshes,b.meshes,c.meshes]}});
ok(r.a!==r.b&&r.b!==r.c&&r.head[0]===r.head[1]&&r.fl[1]==='off'&&r.fl[2]==='forest-navy'&&r.m[0]===r.m[2],'flannel round the waist toggles off/on (BODY swaps geometry, mesh count unchanged)',r);
// hood up in rain
r=await E(()=>window.__mocha.youWeather('rain'));ok(r.hood&&r.hoodUp,'forced rain puts the hood up',r);
r=await E(()=>window.__mocha.youWeather('clear'));ok(!r.hood&&!r.hoodUp,'clear weather puts the hood down',r);
// emote button: HUD slot 'emote' in walk mode, 5 choices, wave plays
r=await E(()=>{const M=window.__mocha,h=M.hud(),s=h.slots&&(Array.isArray(h.slots)?h.slots.find(x=>x.id==='emote'):h.slots.emote),f=M.emoteFan(true),btn=document.querySelector('#emoteBtn').getBoundingClientRect();M.emoteFan(false);return{slot:s||null,fan:f,btn:[btn.width,btn.height],overlaps:h.overlaps}});
ok(r.fan.n===5&&r.fan.on&&r.btn[0]>=44&&r.btn[1]>=44,'the emote button (HUD slot emote, 44 px) fans out 5 choices',r);
r=await E(async()=>{const M=window.__mocha,a=M.youEmote('wave');await new Promise(r=>setTimeout(r,500));const y=M.youInfo();return{a,pose:y.pose,gesture:y.gesture,face:y.face,emote:y.emote}});
ok(r.a.r==='wave'&&r.gesture==='wave'&&r.face.eye==='happy','wave plays (gesture, happy face, emote pop)',r);
// photo -> album, survives savePhotos + reload
r=await E(async()=>{const M=window.__mocha;await new Promise(r=>setTimeout(r,2400));const a=M.youEmote('photo');M.photos({save:true});const P=M.photos();const id=window.__mocha.youInfo().album.slice(-1)[0];return{a,id,has:P.keys.includes(id),keep:P.keep.album.includes(id)}});
ok(r.a.album>=1&&/^u/.test(r.id)&&r.has&&r.keep,'photo adds an album photo (u prefix, in the B7 keep-set) that survives savePhotos()',r);
const photoId=r.id;
// test chibi: 8 draws or fewer; setFace changes only uv data
r=await E(()=>{const M=window.__mocha,c=M.chibi();const t0=M.face('test','neutral');const a=M.face('test','^^'),b=M.face('test',{eye:'star',mouth:'o',mark:'freckles'});return{c,t0,a,b}});
ok(r.c.draws<=8&&r.c.meshes>=7,'a chibi test character (fox, glasses, scarf, wagging tail) costs 8 draws or fewer',r.c);
ok(r.a.tex===r.t0.tex&&r.b.tex===r.t0.tex&&r.a.uvVer>r.t0.uvVer&&r.b.uvVer>r.a.uvVer&&r.a.posVer===r.t0.posVer&&r.a.cur.eye==='happy'&&r.b.cur.mark==='freckles','setFace changes only uv data (texture count unchanged, positions untouched)',r);
r=await E(()=>{const M=window.__mocha;return[M.emote('test','heart'),M.emote('mocha','!'),M.emote('wendell','note')]});ok(r.every(x=>x.id&&x.on),'emote() pops on a chibi, on Mocha and on Wendell',r);
// Your Look: CAM 'look' on top, no overlap; front close-up
r=await E(async()=>{const M=window.__mocha;M.youLook({jk:0,fl:1});M.lookOpen('test');await new Promise(r=>setTimeout(r,2600));return M.look()});
const ov=await E(overlapJS);ok(r.on&&r.cam==='look'&&r.stack[0].owner==='look'&&r.stack[0].prio===3&&!ov.bad.length&&!ov.small.length&&!ov.hscroll,'portrait: Your Look opens with CAM look on top and nothing overlapping',{look:r,ov});
await p.screenshot({path:SH+'test-portrait-look.png'});
r=await E(async()=>{const el=document.querySelector('#yl [data-k="10"][data-i="3"]');el.click();await new Promise(r=>setTimeout(r,200));return window.__mocha.youInfo().flannel});ok(r==='plum-grey','tapping a flannel swatch in the sheet changes the look',r);
r=await E(()=>{window.__mocha.lookClose();return window.__mocha.look()});ok(!r.on&&r.cam!=='look','done closes the sheet and pops CAM look',r);
// persistence across reload: flannel plum-grey + photo
await E(()=>{window.__mocha.youLook({fl:3,hs:2});});await p.waitForTimeout(300);await p.reload();await p.waitForTimeout(5000);
r=await E(id=>{const M=window.__mocha,y=M.youInfo(),P=M.photos();return{fl:y.flannel,hs:y.look[2],album:y.album.includes(id),photo:P.keys.includes(id)}},photoId);
ok(r.fl==='plum-grey'&&r.hs===2&&r.album&&r.photo,'look (flannel, hair) and the album photo persist across reload',r);
ok(!errs.length,'portrait: no page errors',errs.slice(0,5));await ctx.close();
// ---------- 22:00: the lantern glows (default look has the backpack) ----------
({ctx,p,errs,E}=await open({width:393,height:852},true,22));r=await walk(E);await p.waitForTimeout(1500);r=await E(()=>window.__mocha.youInfo());
ok(r.lantern&&r.glow&&r.draws<=10,'at 22:00 the backpack lantern glows (walker still <= 10 draws)',{lantern:r.lantern,glow:r.glow,draws:r.draws,mat:r.matColor});
await p.screenshot({path:SH+'test-portrait-h22.png'});ok(!errs.length,'22:00: no page errors',errs.slice(0,5));await ctx.close();
// ---------- landscape 852x393 and Duo 900x1000: side sheet, no overlap ----------
for(const [nm,vp] of [['landscape',{width:852,height:393}],['duo',{width:900,height:1000}]]){({ctx,p,errs,E}=await open(vp,true,15));await walk(E);
  r=await E(async()=>{const M=window.__mocha;M.youWeather('clear');M.lookOpen('test');await new Promise(r=>setTimeout(r,2600));return M.look()});const o=await E(overlapJS);
  ok(r.on&&r.cam==='look'&&!o.bad.length&&!o.small.length&&!o.hscroll&&o.rect[2]<vp.width*.6,nm+': Your Look is a side sheet with CAM look on top and nothing overlapping',{look:r,o});
  await p.screenshot({path:SH+`test-${nm}-look.png`});ok(!errs.length,nm+': no page errors',errs.slice(0,5));await ctx.close()}
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

// Step 2 feature test: paintings grid, feed images, lightbox (open/arrows/swipe/keys/backdrop close), painting posts, zoom buttons + pinch in walk mode
// Usage: node test-step2.js [filter]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const filt=process.argv[2]||'';const OUT='/tmp/harness/step2/';
const VPS=[['portrait',{width:393,height:852},true],['landscape',{width:852,height:393},true],['unfolded',{width:900,height:1000},true],['desktop',{width:1100,height:820},false]];
let fails=[];const ok=(c,m)=>{if(!c){fails.push(m);console.log('  FAIL',m)}else console.log('  ok',m)};
// returns list of overlapping pairs among visible elements
const overlapJS=`(sels)=>{const els=[];for(const s of sels)document.querySelectorAll(s).forEach(e=>{const r=e.getBoundingClientRect();const cs=getComputedStyle(e);if(r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&e.offsetParent!==null||cs.position==='fixed'&&r.width>0)els.push({s:s+(e.id?'#'+e.id:''),r})});const bad=[];
 for(let i=0;i<els.length;i++)for(let j=i+1;j<els.length;j++){const a=els[i].r,b=els[j].r;if(els[i].s.split('#')[0]===els[j].s.split('#')[0]&&!els[i].s.includes('#'))continue;const ix=Math.min(a.right,b.right)-Math.max(a.left,b.left),iy=Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top);if(ix>1&&iy>1)bad.push(els[i].s+' x '+els[j].s)}
 const off=els.filter(e=>e.r.left<-1||e.r.top<-1||e.r.right>innerWidth+1||e.r.bottom>innerHeight+1).map(e=>'offscreen '+e.s);return bad.concat(off)}`;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for(const [n,vp,mobile] of VPS){if(filt&&!n.includes(filt))continue;console.log('== '+n);
  const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));
  await p.addInitScript(timeAt(15));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4000);
  const cdp=mobile?await ctx.newCDPSession(p):null;
  const touch=async(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:i+1}))});
  const tapAt=async(x,y)=>{if(mobile)await p.touchscreen.tap(x,y);else await p.mouse.click(x,y)};
  const tapSel=async s=>{const r=await p.locator(s).first().boundingBox();if(!r)throw new Error('no box '+s);await tapAt(r.x+r.width/2,r.y+r.height/2)};
  const swipe=async(x0,y0,dx,dy)=>{if(mobile){await touch('touchStart',[[x0,y0]]);for(let k=1;k<=4;k++){await touch('touchMove',[[x0+dx*k/4,y0+dy*k/4]]);await p.waitForTimeout(60)}await touch('touchEnd',[])}else{await p.mouse.move(x0,y0);await p.mouse.down();for(let k=1;k<=4;k++){await p.mouse.move(x0+dx*k/4,y0+dy*k/4);await p.waitForTimeout(60)}await p.mouse.up()}await p.waitForTimeout(500)};
  const lb=()=>p.evaluate(()=>window.__mocha.lb());
  // seed: 3 paintings, 2 selfies, 1 painting post
  const seed=await p.evaluate(()=>{const M=window.__mocha;M.weather('clear');const now=Date.now();
    const a=M.makePainting('the sound at sunset','Ferry Dreams',now-3600e3,'hang');const b=M.makePainting('the mountain','Big Rainier',now-1800e3,'sell');const c=M.makePainting('my friend wendell','A Raccoon, Probably',now-600e3,'keep');
    M.takeSelfie('me at the café ☕','Drizzle & Bean Café');M.postPainting(a,'new painting: "Ferry Dreams" 🎨');M.takeSelfie('rainy day mood 🌧','Pike Place Market');
    return {paintings:M.S.paintings.length,posts:M.S.posts.map(x=>x.kind||'selfie')}});
  console.log('  seed',JSON.stringify(seed));ok(seed.posts[1]==='painting','painting post created');
  // open panel -> me tab
  await p.evaluate(()=>{if(document.getElementById('panel').classList.contains('hidden'))document.getElementById('bookBtn').click()});await p.waitForTimeout(500);
  await tapSel('nav button[data-tab="me"]');await p.waitForTimeout(600);
  await p.evaluate(()=>{const g=document.querySelector('.pgrid');g&&g.previousElementSibling.scrollIntoView({block:'start'})});await p.waitForTimeout(1200);
  const grid=await p.evaluate(()=>{const cs=[...document.querySelectorAll('.pcard img')].map(i=>{const r=i.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),i.naturalWidth]});const tops=new Set([...document.querySelectorAll('.pcard')].map(c=>Math.round(c.getBoundingClientRect().top)));return {cs,perRow:document.querySelectorAll('.pcard').length/tops.size}});
  console.log('  grid',JSON.stringify(grid));ok(grid.cs.length>=3&&grid.cs[0][0]<=200,'paint grid thumbnails small');
  await p.screenshot({path:OUT+n+'-me.png'});
  // open lightbox on first painting
  await tapSel('.pcard');await p.waitForTimeout(1500);
  let s=await lb();console.log('  lb',JSON.stringify(s));ok(s.open&&s.set==='paint'&&s.i===0&&s.n>=3,'lightbox opens on painting');
  const geo=await p.evaluate(()=>{const R=s=>{const r=document.querySelector(s).getBoundingClientRect();return {l:r.left,t:r.top,r:r.right,b:r.bottom,w:r.width,h:r.height}};return {img:R('#lbImg'),prev:R('#lbPrev'),next:R('#lbNext'),close:R('#lbClose'),cap:R('.lbCap'),vw:innerWidth,vh:innerHeight}});
  const ov=(a,b)=>Math.min(a.r,b.r)-Math.max(a.l,b.l)>1&&Math.min(a.b,b.b)-Math.max(a.t,b.t)>1;
  ok(!ov(geo.img,geo.prev)&&!ov(geo.img,geo.next)&&!ov(geo.img,geo.close)&&!ov(geo.img,geo.cap),'lightbox image does not overlap controls/caption');
  ok(geo.img.l>=0&&geo.img.t>=0&&geo.img.r<=geo.vw&&geo.img.b<=geo.vh,'lightbox image fully on screen');
  ok(Math.abs(geo.img.w/geo.img.h-4/3)<.08,'painting aspect preserved ('+(geo.img.w/geo.img.h).toFixed(3)+')');
  ok(geo.img.w>=Math.min(geo.vw,geo.vh)*.55,'image is big ('+Math.round(geo.img.w)+'x'+Math.round(geo.img.h)+')');
  await p.screenshot({path:OUT+n+'-lb-paint.png'});
  await tapSel('#lbNext');await p.waitForTimeout(700);s=await lb();ok(s.i===1,'next arrow -> 1');
  const cx=geo.vw/2,cy=(geo.img.t+geo.img.b)/2;
  await swipe(cx+60,cy,-180,8);s=await lb();ok(s.i===2,'swipe left -> 2 (got '+s.i+')');
  await swipe(cx-60,cy,180,-6);s=await lb();ok(s.i===1,'swipe right -> 1 (got '+s.i+')');
  await tapSel('#lbPrev');await p.waitForTimeout(500);s=await lb();ok(s.i===0,'prev arrow -> 0');
  await p.keyboard.press('ArrowLeft');await p.waitForTimeout(400);s=await lb();ok(s.i===s.n-1,'ArrowLeft wraps to last');
  await p.screenshot({path:OUT+n+'-lb-paint2.png'});
  const modeBefore=await p.evaluate(()=>window.__mocha.cam().mode);
  await p.keyboard.press('Escape');await p.waitForTimeout(500);s=await lb();ok(!s.open,'Escape closes');
  ok((await p.evaluate(()=>window.__mocha.cam().mode))===modeBefore,'arrow keys in viewer did not switch to walk mode');
  // feed
  await tapSel('nav button[data-tab="feed"]');await p.waitForTimeout(800);
  const feed=await p.evaluate(()=>[...document.querySelectorAll('#tab-feed .pic')].map(i=>{const r=i.getBoundingClientRect();return [Math.round(r.width),Math.round(r.height),i.naturalWidth,i.naturalHeight,i.classList.contains('art')]}));
  console.log('  feed imgs',JSON.stringify(feed));ok(feed.length===3,'3 feed pictures');
  const fmax=(vp.height<=520&&vp.width>vp.height?vp.height*.52:vp.width<=760?Math.min(vp.height*.30,280):Math.min(vp.height*.34,300))+13;ok(feed.every(f=>f[1]<=fmax&&Math.abs((f[0]-(f[4]?12:0))/(f[1]-(f[4]?12:0))-f[2]/f[3])<.06),'feed images contained & aspect kept (max '+Math.round(fmax)+')');
  await p.screenshot({path:OUT+n+'-feed.png'});
  await tapSel('#tab-feed .pic');await p.waitForTimeout(1500);s=await lb();ok(s.open&&s.set==='feed'&&s.i===0,'lightbox opens from feed selfie');
  await p.screenshot({path:OUT+n+'-lb-selfie.png'});
  await tapSel('#lbNext');await p.waitForTimeout(1000);s=await lb();ok(s.i===1&&/Ferry/.test(s.sub),'feed next -> painting post ('+s.sub+')');
  await p.screenshot({path:OUT+n+'-lb-feedpaint.png'});
  // swipe down to close? -> test backdrop tap instead
  const g2=await p.evaluate(()=>{const r=document.getElementById('lbImg').getBoundingClientRect(),st=document.getElementById('lbStage').getBoundingClientRect();return {it:r.top,st:st.top,sl:st.left,sr:st.right}});
  await tapAt(Math.round(g2.sl+(g2.sr-g2.sl)*.5),Math.round((g2.it+g2.st)/2));await p.waitForTimeout(600);s=await lb();ok(!s.open,'tap backdrop closes');
  // zoom: walk mode
  await p.evaluate(()=>{const c=document.getElementById('closePanel');if(document.body.classList.contains('panelOpen'))c.click();window.__mocha.setCamMode('walk')});await p.waitForTimeout(1500);
  const d0=(await p.evaluate(()=>window.__mocha.cam().dist));
  const zi=await p.locator('#zIn').boundingBox();
  if(mobile){await touch('touchStart',[[zi.x+22,zi.y+22]]);await p.waitForTimeout(1500);await touch('touchEnd',[])}else{await p.mouse.move(zi.x+22,zi.y+22);await p.mouse.down();await p.waitForTimeout(1500);await p.mouse.up()}
  await p.waitForTimeout(1500);const d1=await p.evaluate(()=>window.__mocha.cam().dist);ok(d1<d0*.85,`hold + zooms in (walk) ${d0.toFixed(2)} -> ${d1.toFixed(2)}`);
  await tapSel('#zOut');await p.waitForTimeout(300);await tapSel('#zOut');await p.waitForTimeout(300);await tapSel('#zOut');await p.waitForTimeout(2000);
  const d2=await p.evaluate(()=>window.__mocha.cam().dist);ok(d2>d1*1.5,`taps − zoom out (walk) ${d1.toFixed(2)} -> ${d2.toFixed(2)}`);
  const lim=await p.evaluate(()=>window.__mocha.zoomLim());ok(lim[0]===3.5&&lim[1]===30,'walk zoom range 3.5-30');
  const wOv=await p.evaluate(`(${overlapJS})(['#zIn','#zOut','#joy','#look','#dock>*','#top .pill','#near'])`);ok(!wOv.length,'walk: no overlaps '+JSON.stringify(wOv));
  await p.screenshot({path:OUT+n+'-walk.png'});
  if(mobile){ // pinch with both fingers on the right side
    await p.evaluate(()=>window.__mocha.cam({dist:12}));await p.waitForTimeout(400);
    const X=vp.width*.72,Y=vp.height*.45;await touch('touchStart',[[X-20,Y],[X+20,Y+5]]);for(let k=1;k<=5;k++){await touch('touchMove',[[X-20-k*12,Y],[X+20+k*12,Y+5]]);await p.waitForTimeout(80)}await touch('touchEnd',[]);await p.waitForTimeout(500);
    const d3=await p.evaluate(()=>window.__mocha.cam().dist);ok(d3<9,'pinch out on right side zooms in (walk) 12 -> '+d3.toFixed(2));
    // pinch with one finger on the move-stick side landing together
    await p.evaluate(()=>window.__mocha.cam({dist:8}));await p.waitForTimeout(400);
    const L=[vp.width*.3,vp.height*.62],Rr=[vp.width*.6,vp.height*.5];await touch('touchStart',[L,Rr]);for(let k=1;k<=5;k++){await touch('touchMove',[[L[0]+k*8,L[1]-k*5],[Rr[0]-k*8,Rr[1]+k*5]]);await p.waitForTimeout(80)}
    const joy=await p.evaluate(()=>window.__you().joy);await touch('touchEnd',[]);await p.waitForTimeout(500);
    const d4=await p.evaluate(()=>window.__mocha.cam().dist);ok(d4>9.5&&joy[0]===0&&joy[1]===0,'two-finger pinch across both halves zooms out, no walking: 8 -> '+d4.toFixed(2)+' joy='+joy);
    // stick still works with a single finger on the left
    const S0=await p.evaluate(()=>window.__you());await touch('touchStart',[[vp.width*.22,vp.height*.7]]);await p.waitForTimeout(450);for(let k=1;k<=4;k++){await touch('touchMove',[[vp.width*.22,vp.height*.7-k*14]]);await p.waitForTimeout(150)}
    const jy=await p.evaluate(()=>window.__you().joy);await p.waitForTimeout(800);await touch('touchEnd',[]);ok(jy[1]<-.2,'single finger on left still drives the move stick joy='+jy);
  }
  // follow mode zoom
  await p.evaluate(()=>window.__mocha.setCamMode('follow'));await p.waitForTimeout(1500);
  const f0=await p.evaluate(()=>window.__mocha.cam().dist);await tapSel('#zOut');await p.waitForTimeout(1800);const f1=await p.evaluate(()=>window.__mocha.cam().dist);
  ok(f1>f0*1.1,`− zooms out in watch mode ${f0.toFixed(1)} -> ${f1.toFixed(1)}`);
  const fOv=await p.evaluate(`(${overlapJS})(['#zIn','#zOut','#dock>*','#top .pill','#chatwrap form','#hint'])`);ok(!fOv.length,'follow: no overlaps '+JSON.stringify(fOv));
  await p.screenshot({path:OUT+n+'-follow.png'});
  // built-in brain posts paintings sometimes
  // (round-1 fix: posting to his feed needs a phone, so the no-phone run must post nothing, then he gets a phone)
  const bb=await p.evaluate(()=>{const M=window.__mocha;const a=M.ACTS.find(x=>x.p==='studio'&&(x.fx==='paint'||/paint/i.test(x.doing||'')));if(!a)return {err:'no studio act'};
    const cnt=()=>M.S.posts.filter(x=>x.kind==='painting').length;M.S.phone=null;let b0=cnt();for(let i=0;i<10;i++)M.localOutcome(a,Date.now()+i*1000,false);const noPhone=cnt()-b0;
    M.coins(500);M.buyGear('phone',{model:'Nimbus Mini',color:'#f29fb5'},Date.now(),false);b0=cnt();let made=0;for(let i=0;i<10;i++){M.localOutcome(a,Date.now()+(20+i)*1000,false);made++}return {made,noPhone,posted:cnt()-b0,posts:M.S.posts.length,size:JSON.stringify(M.S).length}});
  console.log('  built-in',JSON.stringify(bb));ok(bb.noPhone===0,'no phone: built-in brain posts no paintings ('+bb.noPhone+'/10)');ok(bb.posted>=1&&bb.posted<=10&&bb.posts<=30,'built-in brain posts some paintings ('+bb.posted+'/10)');
  console.log('  errors',errs.length?errs:'none');if(errs.length)fails.push(n+' errors: '+errs.join(' | '));
  await ctx.close()}
await b.close();console.log(fails.length?'FAILURES:\n'+fails.join('\n'):'ALL PASS');process.exit(fails.length?1:0)})();

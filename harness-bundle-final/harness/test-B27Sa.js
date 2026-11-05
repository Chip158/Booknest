// test-B27Sa: the autumn look (Addendum S, B27Sa). Run: [NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=...] node /tmp/harness/test-B27Sa.js
const {chromium}=require('playwright');const fs=require('fs');
const FILE='/home/user/Booknest/ghost-town/index.html';
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month,day)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
let fails=0,n=0;const ok=(name,c,info)=>{n++;if(!c)fails++;console.log((c?'PASS ':'FAIL ')+name+(c?'':'  '+JSON.stringify(info).slice(0,500)))};
const near=(a,b,e=.02)=>Math.abs(a-b)<=e;const cd=(a,b)=>{const x=parseInt(a.slice(1),16),y=parseInt(b.slice(1),16);return Math.max(...[16,8,0].map(k=>Math.abs(((x>>k)&255)-((y>>k)&255))))};
const VP={portrait:[{width:393,height:852},true],landscape:[{width:852,height:393},true],duo:[{width:900,height:1000},true],desktop:[{width:1100,height:820},false]};
async function page(b,vp,mm,dd,h){const [v,mob]=VP[vp];const ctx=await b.newContext({viewport:v,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();p.setDefaultTimeout(180000);const errs=[];
  p.on('pageerror',e=>errs.push(e.message));await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h,mm-1,dd));
  await p.goto('file://'+FILE);await p.waitForFunction(()=>window.__mocha&&window.__mocha.style,null,{timeout:180000});await p.waitForTimeout(5000);
  await p.evaluate(()=>window.__mocha.weather&&window.__mocha.weather('clear'));
  // merge (LF1): watch mode follows Mocha indoors; these are exterior checks, so send him to an outdoor activity (the waterfront) first (test harness only)
  await p.evaluate(()=>{const M=window.__mocha;M.forceAct({p:'promenade'})});
  for(let k=0;k<60;k++){if(await p.evaluate(()=>{const i=window.__mocha.inside();return!i.on&&i.ph==='idle'}))break;await p.waitForTimeout(250)}
  await p.waitForTimeout(1500);return{ctx,p,errs}}
(async()=>{
 // static: autonomy and territory inside the B27Sa blocks
 {const src=fs.readFileSync(FILE,'utf8');const a=src.indexOf('// ---- B27Sa pre-block'),b=src.indexOf('// ==== B27Sa main block'),e=src.indexOf("STYLE.hooks.push(m=>Object.assign(m,{style:styleInfo");
  const blk=src.slice(a,src.indexOf('\n',src.indexOf('function autGrass',a)+10)+1)+src.slice(b,e);
  ok('blocks present (pre-block after PAL, main block after pbW)',a>0&&b>0&&e>b&&src.indexOf('const pbW=')<b&&src.indexOf("rim:{day:")<a,{a,b,e});
  ok('autonomy: no G.act/G.target/G.mode writes, startAct, goPoint or userBias terms in style code',!/G\.(act|target|mode)\s*=|startAct\(|goPoint\(|ubAdd\(|userBias\(/.test(blk));
  ok('no new THREE lights or glow sprites in style code',!/new THREE\.(Point|Spot|Directional|Hemisphere|Ambient|RectArea)Light|hGlow\(|[^.]glow\(/.test(blk));}
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try{
 // 1. Nov 3, 15:30 portrait: palette, trees, lens, light, post gating
 {const {ctx,p,errs}=await page(b,'portrait',11,3,15.5);const r=await p.evaluate(()=>window.__mocha.style());
  ok('portrait boots with zero page errors',errs.length===0,errs);
  ok('AUT active on Nov 3 (fall, grass #BFA45E, harvest)',r.aut&&r.season==='fall'&&r.palette.grass==='#BFA45E'&&r.hol.theme==='harvest',r.palette);
  ok('maple tiers 3 and fir tiers 5 town-wide',r.tiers.maple&&r.tiers.maple[0]===3&&r.tiers.maple[1]===3&&r.tiers.fir[0]===5&&r.tiers.fir[1]===5&&r.tiers.maples>40&&r.tiers.firs>40,r.tiers);
  ok('portrait lens: FOV 46, fovK 1.47, effDist = dist*fovK',r.fov===46&&near(r.fovK,1.472,.005)&&near(r.effDist,r.dist*r.fovK,.05),{fov:r.fov,fovK:r.fovK,eff:r.effDist,d:r.dist});
  ok('autumn day: TOONA weight 1 (ramp base #8a6e78), golden sun #ffd9a8 after 13:30, hemi lerps to #D8DDF0/#B8946A',r.toon.w===1&&r.toon.t0==='#8a6e78'&&r.palette.sun==='#ffd9a8'&&r.palette.hemi.ground==='#b8946a',{toon:r.toon,sun:r.palette.sun,hemi:r.palette.hemi});
  ok('day fog near 45 / far 125 plus (effDist - dist), hazed toward #E9D9C0',near(r.palette.fog[0],45+r.effDist-r.dist,1.5)&&near(r.palette.fog[1],125+r.effDist-r.dist,1.5),r.palette.fog);
  ok('families re-tuned (plum #8A5E6E, slate #7B8C99, sage #A6AE8A, gothic trim #E9DCCB); after-top #8FB3D9',r.palette.fam.plum==='#8A5E6E'&&r.palette.fam.slate==='#7B8C99'&&r.palette.fam.sage==='#A6AE8A'&&r.palette.fam.gothicTrim==='#E9DCCB'&&r.palette.sky.after==='#8FB3D9',r.palette.fam);
  ok('touch: tilt-shift .6, vignette on, portrait band top 12% / bottom 8%',r.post.ts===.6&&r.post.vig===1&&near(r.post.band[0],.12,.001)&&near(r.post.band[1],.08,.001),r.post);
  const sc=await p.evaluate(()=>{const M=window.__mocha,S=M.scene;let lit=0,cl=0,bl=0,dash=0,dashOn=0;[...S.children,...((S.getObjectByName('world')||{children:[]}).children)].forEach(o=>{if(o.name==='litter')lit++;if(o.name==='clouds')cl=o.instanceMatrix.count;if(o.name==='blobs')bl=o.count;if(o.userData&&o.userData.batch==='dash'){dash++;if(o.visible)dashOn++}});
    const leafIM=[...S.children,...((S.getObjectByName('world')||{children:[]}).children)].filter(o=>o.isInstancedMesh&&o.geometry&&o.geometry.type==='PlaneGeometry'&&o.geometry.parameters.width===.55).length;return{lit,cl,bl,leafIM,dash,dashOn}});
  ok('F1 one litter IM; F2 clouds = one IM of 70 puffs (frustum-packed per cloud); blobs IM populated; old dash batch hidden (dashes baked into the setts)',sc.lit===1&&sc.leafIM===1&&sc.cl===70&&sc.bl>10&&sc.dashOn===0,sc);
  const gate={};for(const o of ['look','tryon','room','cabin','deco','talk','hang','seat']){await p.evaluate(o=>window.__mocha.styleCam(o,true),o);await p.waitForTimeout(250);gate[o]=await p.evaluate(()=>{const s=window.__mocha.style();return{ts:s.post.ts,vig:s.post.vig,top:s.post.top}});await p.evaluate(o=>window.__mocha.styleCam(o,false),o);await p.waitForTimeout(150)}
  ok('post gating: ts 0 under look/tryon/room/cabin/deco/talk',['look','tryon','room','cabin','deco','talk'].every(o=>gate[o].ts===0&&gate[o].top===o),gate);
  ok('post gating: vignette 0 under room and cabin only; ts on under hang/seat',gate.room.vig===0&&gate.cabin.vig===0&&gate.look.vig===1&&gate.hang.ts>0&&gate.seat.ts>0,gate);
  // close-up layers dolly back to BASE's lens (FOV 64 in portrait, fovK 1) and return to the style lens after
  const ln=await p.evaluate(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));if(M.cam().mode!=='walk')M.setCamMode('walk');M.you(-24,31);await w(800);M.lookOpen('test');let s1;for(let i=0;i<40;i++){await w(400);s1=M.style();if(s1.fov===64)break}M.lookClose();let s2;for(let i=0;i<40;i++){await w(400);s2=M.style();if(s2.fov===46)break}return{inLook:{fov:s1.fov,fovK:s1.fovK,eff:s1.effDist,dist:s1.dist,top:s1.post.top},after:{fov:s2.fov,fovK:s2.fovK,top:s2.post.top},lens:s1.lens}});
  ok('close-up lens: Your Look runs at BASE FOV 64 with fovK 1 (effDist = dist); back to 46 / 1.472 after',ln.inLook.top==='look'&&ln.inLook.fov===64&&near(ln.inLook.fovK,1,.001)&&near(ln.inLook.eff,ln.inLook.dist,.01)&&ln.after.fov===46&&near(ln.after.fovK,1.472,.005),ln);
  const sh=await p.evaluate(()=>{const M=window.__mocha;const r=M.shotMode('overview');const s=M.style();return{r,list:M.shotMode('nope'),pitch:M.cam().pitch}});
  ok('shotMode lists the fixed views + overview (pitch .9) and porch (pitch .28)',Array.isArray(sh.list)&&sh.list.includes('overview')&&sh.list.includes('porch')&&sh.list.includes('walk-square-cozy')&&sh.r&&sh.r.pitch===.9,sh);
  const cp=await p.evaluate(()=>window.__mocha.camPreset('porch'));ok('camPreset(porch) pitch .28',cp&&cp.pitch===.28,cp);
  await ctx.close()}
 // 2. other viewports: FOV 44 / 40 and fovK
 for(const [vp,fov,k,band] of [['landscape',40,1.281,.16],['duo',44,1.547,.12],['desktop',40,1.281,.16]]){const {ctx,p,errs}=await page(b,vp,11,3,15.5);const r=await p.evaluate(()=>window.__mocha.style());
  ok(`${vp}: FOV ${fov}, fovK ${k}, band ${band}, ts ${vp==='desktop'?1:.6}, zero errors`,r.fov===fov&&near(r.fovK,k,.006)&&near(r.post.band[0],band,.001)&&r.post.ts===(vp==='desktop'?1:.6)&&errs.length===0,{fov:r.fov,fovK:r.fovK,post:r.post,errs});await ctx.close()}
 // 3. a faked Jul 15: summer greens, no TOONA
 {const {ctx,p}=await page(b,'portrait',7,15,15.5);const r=await p.evaluate(()=>window.__mocha.style());
  ok('Jul 15: summer, AUT off, lavender ramp (#7c7a9c), green tiered maples',r.season==='summer'&&!r.aut&&r.toon.w===0&&r.toon.t0==='#7c7a9c'&&r.tiers.maple&&r.tiers.maple[0]===3&&r.palette.maple.every(c=>{const x=parseInt(c.slice(1),16);return((x>>8)&255)>((x>>16)&255)}),{season:r.season,toon:r.toon,maple:r.palette.maple});await ctx.close()}
 // 4. Nov 3 21:00: shadows stay lavender at night, plum-umber night keys
 {const {ctx,p}=await page(b,'portrait',11,3,21);await p.waitForTimeout(1500);const r=await p.evaluate(()=>({s:window.__mocha.style(),g:window.__mocha.grade()}));
  ok('night: lavender ramp (#7c7a9c), night sky key #1C1824, hemi -> #8C849C',r.s.toon.w===0&&r.s.toon.t0==='#7c7a9c'&&r.g.keys[0][1]==='#1C1824'&&cd(r.s.palette.hemi.sky,'#8c849c')<=14,{toon:r.s.toon,k:r.g.keys[0],hemi:r.s.palette.hemi});await ctx.close()}
 // 5. Nov 28 and Dec 10: warm-white winter lights, sage tree, red bows, ONE town tree
 for(const [mm,dd] of [[11,28],[12,10]]){const {ctx,p,errs}=await page(b,'portrait',mm,dd,18);await p.waitForTimeout(2500);
  const r=await p.evaluate(()=>{const M=window.__mocha,s=M.style();let cone=null,bow=null;M.scene.traverse(o=>{if(!cone&&o.isMesh&&o.geometry&&o.geometry.type==='ConeGeometry'&&o.material&&o.material.color){const w=o.getWorldPosition(new THREE.Vector3());if(Math.abs(w.x-34.5)<1.5&&Math.abs(w.z+9.6)<1.5)cone='#'+o.material.color.getHexString()}});return{s,cone}});
  ok(`${mm}-${dd}: winter theme, bulbs only #fff1d0/#ffc27a/#ffe2b0, sage #4a6450 town tree, exactly one town tree, zero errors`,r.s.hol.theme==='winter'&&r.s.hol.bulbs.length>0&&r.s.hol.bulbs.every(c=>['#fff1d0','#ffc27a','#ffe2b0'].includes(c))&&r.cone==='#4a6450'&&r.s.hol.trees===1&&errs.length===0,{hol:r.s.hol,cone:r.cone,errs});
  if(mm===12)ok('Dec 10: firs keep 5 tiers in winter',r.s.tiers.fir&&r.s.tiers.fir[0]===5,r.s.tiers);await ctx.close()}
 }catch(e){ok('fatal',false,String(e&&e.stack||e))}
 await b.close();console.log(`${n-fails}/${n} passed`);process.exit(fails?1:0)})();

// B19 acceptance: cast() >= 25 with looks; every keeper has a face, blinks (face uv changes within 6 s) and costs <= 8 draws; no echo names/species;
// a 20-character crowd at Lantern Square: <= 8 LOD0, the rest LOD1, castShadow on <= 4, character draws within budget (frame total reported);
// kSay/wSay anchor to the new head heights; keeperAt works; face(id,expr) works for the whole cast. node test-B19.js [file]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h,month=10,day=1)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${month},${day});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const file=process.argv[2]||'/home/user/Booknest/ghost-town/index.html';let fails=0;const ok=(c,m,x)=>{console.log((c?'PASS ':'FAIL ')+m+(x!==undefined?' '+JSON.stringify(x).slice(0,600):''));if(!c)fails++};
const SH='/tmp/harness/b19/shots/';try{fs.mkdirSync(SH,{recursive:true})}catch(e){}
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push(e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.goto('file://'+file);await p.waitForTimeout(5000);return{ctx,p,errs,E:(f,a)=>p.evaluate(f,a)}};
const frames=E=>E(async()=>{const a=[];for(let i=0;i<6;i++){await new Promise(r=>requestAnimationFrame(r));a.push(window.__mocha.gfx().calls)}return a});
// ---------- portrait 393x852 at 15:00 ----------
let {ctx,p,errs,E}=await open({width:393,height:852},true,15);
ok(await E(()=>['cast','lod','face','crowd'].every(k=>typeof window.__mocha[k]==='function')),'hooks: __mocha.cast/lod/face/crowd');
const cast=await E(()=>window.__mocha.cast());
ok(cast.length>=25&&cast.every(c=>c.look&&c.built),'cast() lists >= 25 characters, all with looks and models',{n:cast.length});
ok(cast.filter(c=>c.kind==='ghost').length===3&&cast.filter(c=>c.kind==='ghost').every(c=>c.draws0===2),'3 mini ghost friends (Fennel, Tuffet, Hush) at 2 draws each');
const NEW=['vesper','clem','hollis','tabitha','ambrose','fennel','tuffet','hush','morel','honey','reed','odalie','marigold','jot','dale','birch','barnaby','pepper','wendell'];
ok(NEW.every(id=>cast.some(c=>c.id===id)),'new cast + Wendell + Pepper present',NEW.filter(id=>!cast.some(c=>c.id===id)));
ok(cast.every(c=>Array.isArray(c.likes)&&c.likes.length&&Array.isArray(c.dislikes)&&c.dislikes.length&&c.role&&c.home),'every CAST entry has role, home, likes and dislikes');
const bad=cast.filter(c=>/\b(tilda|pip|wisp|bellsy)\b/i.test(c.name)||/walrus|tortoise|alpaca/i.test(c.species));ok(!bad.length,'no echo names or species (Tilda, Pip, Wisp, Bellsy, walrus, tortoise, alpaca)',bad.map(c=>c.id));
ok(/heron/.test(cast.find(c=>c.id==='odalie').species)&&/crow/.test(cast.find(c=>c.id==='jot').species)&&/seal/.test(cast.find(c=>c.id==='barnaby').species),'civic species: heron mayor, crow carrier, harbor seal captain');
const keepers=cast.filter(c=>c.kind==='keeper');
ok(keepers.length>=19&&keepers.every(c=>c.face&&c.draws0<=8),'every keeper is a chibi with a face mesh and <= 8 draws',keepers.map(c=>c.id+':'+c.draws0));
const sig={juniper:'apron',basil:'headphones',mabel:'glasses',rosalind:'glasses',pearl:'sunglasses',sol:'beret',chip:'stripes',hank:'paddle',monty:'antlers2',dot:'tentacles',kip:'goathorns',otis:'facestripe',wren:'horns4',willa:'witchhat',pippin:'spines',luma:'antennae',rowan:'conductor'};
const miss=Object.entries(sig).filter(([id,x])=>{const c=cast.find(c=>c.id===id);return!(c&&(c.x.includes(x)||(x==='apron')))});ok(!miss.length,'keepers keep their signature accessories',miss);
const xx=await E(()=>({monty:window.__mocha.CASTB.monty.look.x,wren:window.__mocha.CASTB.wren.look.x,luma:window.__mocha.CASTB.luma.look.x,kip:window.__mocha.CASTB.kip.look.x,willa:window.__mocha.CASTB.willa.look.x}));
ok(xx.monty.includes('scarf')&&xx.wren.includes('fleece')&&xx.luma.includes('wings')&&xx.kip.includes('beard')&&xx.willa.includes('cape'),'Monty scarf, Wren fleece collar, Luma wings, Kip beard, Willa cape',xx);
const bl=await E(()=>window.__mocha.KEEPERS.map(k=>{const r=window.__mocha.castTick(k.id,6);return[k.id,r&&r.v1>r.v0&&r.eyes.some(e=>e==='half'||e==='closed')]}));
ok(bl.every(x=>x[1]),'every keeper blinks (face uv changes over 6 s, a half/closed frame seen)',bl.filter(x=>!x[1]));
const w=await E(()=>{const o=window.__mocha.CASTB.wendell.obj,u=o.userData;return{mark:u.face&&u.face.userData.cur.mark,tail:!!u.tail,keys:['legs','arms','head','tail'].every(k=>k in u),draws:window.__mocha.cast().find(c=>c.id==='wendell').draws0}});
ok(w.mark==='mask'&&w.tail&&w.keys&&w.draws<=8,'Wendell: raccoon chibi with the mask mark, ringed tail, cardigan, wObj.userData keys kept, <= 8 draws',w);
const fc=await E(()=>{const M=window.__mocha;return{a:M.face('basil','happy').cur,b:M.face('vesper','^^').cur,c:M.face('wendell','ooh').cur,g:M.face('fennel','happy')}});
ok(fc.a&&fc.a.eye==='happy'&&fc.b&&fc.b.eye==='happy'&&fc.b.mouth==='laugh'&&fc.c&&fc.c.eye==='star','face(id,expr) works for keepers, the new cast and Wendell',fc);
const say=await E(()=>{const M=window.__mocha;return{j:M.castSay('juniper'),g:M.castSay('gus'),w:M.castSay('wendell'),ka:M.keeperAt('cafe'),kb:M.keeperAt('records')}});
const anch=s=>s&&s.anchor-s.headTop>.05&&s.anchor-s.headTop<.8;
ok(anch(say.j)&&anch(say.g)&&anch(say.w),'kSay/wSay bubbles anchor just above the new head heights',say);
ok(say.ka==='juniper'&&say.kb==='basil','keeperAt still finds the keeper on duty',[say.ka,say.kb]);
// 20-character crowd at Lantern Square
let st=await E(()=>{const M=window.__mocha;M.crowd(20);M.castView({x:-30,z:33,yaw:Math.PI/2,pitch:1.0,dist:17});return true});await p.waitForTimeout(3500);
const C=await E(async()=>{const M=window.__mocha;M.lodTick();const s=M.lod(),pins=M.CHARLOD.L.filter(r=>r.pin);let ch=0;for(const r of M.CHARLOD.L){if(r.lvl===0)ch+=r.d0+(r.sh?r.cast.length:0);else if(r.lvl===1)ch+=r.lo.length}
  return{n:pins.length,l0:pins.filter(r=>r.lvl===0).length,l1:pins.filter(r=>r.lvl===1).length,hid:pins.filter(r=>r.lvl<0).length,sh:M.CHARLOD.L.filter(r=>r.sh).length,n0:s.n0,ch,maxd0:Math.max(...pins.map(r=>r.d0))}});
const f1=await frames(E);await p.screenshot({path:SH+'crowd-portrait.png'});
ok(C.n===20&&C.l0<=8&&C.l0+C.l1===20&&C.n0<=8,'crowd of 20 at the square: <= 8 at LOD0, the rest at LOD1',C);
ok(C.sh<=4,'castShadow on 4 or fewer characters',C.sh);
ok(C.ch<=8*8+12+4*8,'character draws (main + shadow) within 8x8 + 12 LOD1 + 4 shadow rigs',C.ch);
await E(()=>{for(const r of window.__mocha.CHARLOD.L)if(r.pin)r.obj.visible=false});await p.waitForTimeout(1200);const f0=await frames(E);
await E(()=>{const M=window.__mocha;M.renderer.shadowMap.autoUpdate=false;for(const r of M.CHARLOD.L)if(r.pin)r.obj.visible=true});await p.waitForTimeout(1200);const fm=await frames(E);
await E(()=>{window.__mocha.renderer.shadowMap.autoUpdate=true});
const avg=a=>Math.round(a.reduce((x,y)=>x+y,0)/a.length);
console.log('INFO square draws (portrait 15:00): base scene without the crowd',avg(f0),'with the crowd',avg(f1),'(delta',avg(f1)-avg(f0)+') main pass only (shadow map frozen) with the crowd',avg(fm));
ok(avg(fm)<=300,'crowd scene main pass <= 300 draws (shadow map frozen)',avg(fm));
ok(avg(f1)-avg(f0)<=8*8+12+4*8+10,'crowd adds at most the character budget to the frame',avg(f1)-avg(f0));
// lineup of every keeper (temporary stand-ins built from keeperLook) for the visual check
await E(()=>{const M=window.__mocha;M.crowd(0);M.__lu=[];const ks=M.KEEPERS;ks.forEach((k,i)=>{const g=M.castBuild({id:'lu'+i,kind:'cast',look:M.keeperLook(k)});const row=i<10?0:1,x=-34.6+(i%5)*1.45,z=28.2-Math.floor(i/5)*2.2;g.position.set(x,0,z);g.rotation.y=Math.PI;M.scene.add(g);M.__lu.push(g)});
  M.castView({x:-31.7,z:26,ty:.7,yaw:Math.PI,pitch:.38,dist:8.5})});await p.waitForTimeout(3000);await p.screenshot({path:SH+'keepers-portrait.png'});
await E(()=>{const M=window.__mocha;M.__lu.forEach(g=>M.scene.remove(g));M.castView(null)});
ok(!errs.length,'no page errors (portrait)',errs);await ctx.close();
// ---------- desktop 1100x820 at 22:00: ghosts out, crowd view ----------
({ctx,p,errs,E}=await open({width:1100,height:820},false,22));
const g=await E(()=>{const M=window.__mocha;M.lodTick();return['fennel','tuffet','hush','vesper','honey'].map(id=>[id,M.CASTB[id].obj.visible])});
ok(g[0][1]&&g[1][1]&&g[2][1]&&g[3][1]&&!g[4][1],'night: ghost friends and Vesper are out, Honey is home',g);
await E(()=>{const M=window.__mocha;M.crowd(20);M.castView({x:-30,z:33,yaw:Math.PI/2,pitch:.9,dist:15})});await p.waitForTimeout(3500);await p.screenshot({path:SH+'crowd-desktop-22.png'});
const C2=await E(()=>{const M=window.__mocha;M.lodTick();const pins=M.CHARLOD.L.filter(r=>r.pin);return{l0:pins.filter(r=>r.lvl===0).length,sh:M.CHARLOD.L.filter(r=>r.sh).length}});
ok(C2.l0<=8&&C2.sh<=4,'desktop crowd: <= 8 LOD0, <= 4 shadows',C2);
await E(()=>window.__mocha.crowd(0));await p.waitForTimeout(600);
const fr=await E(()=>{const M=window.__mocha;M.lodTick();return M.lod()});ok(fr.n0<=8&&fr.shadows<=4,'after the crowd: LOD stats sane',{n0:fr.n0,n1:fr.n1,h:fr.hidden,sh:fr.shadows});
ok(!errs.length,'no page errors (desktop 22:00)',errs);await ctx.close();
await b.close();console.log(fails?`${fails} FAILED`:'ALL PASS');process.exit(fails?1:0)})();

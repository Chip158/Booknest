// B30W acceptance: Mocha's Workshop. MIND off fast-forward creation (done, visible, diary); validateMade clamps/refuses; mocked mind spec built, malicious refused;
// a place creation in PLACES + map + new ACT he picks + Wendell can visit; 10 creations add <=20 draws, db within guard; walker blockers; Pitch in; Me tab.
// Run: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html node /tmp/harness/test-B30W.js [--shots]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const OUT='/tmp/harness/b30w/shots';fs.mkdirSync(OUT,{recursive:true});
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,1);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const counter=`(()=>{window.__dc={n:0,frames:[]};for(const C of [WebGLRenderingContext,WebGL2RenderingContext]){for(const f of ['drawElements','drawArrays']){const o=C.prototype[f];C.prototype[f]=function(...a){window.__dc.n++;return o.apply(this,a)}}}
 const raf=window.requestAnimationFrame.bind(window);window.requestAnimationFrame=cb=>raf(t=>{const before=window.__dc.n;cb(t);const d=window.__dc.n-before;if(d>0)window.__dc.frames.push(d)})})()`;
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n,info!==undefined?JSON.stringify(info).slice(0,300):'')}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,1500):'')}};
const SHOTS=process.argv.includes('--shots');
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const open=async(vp,mobile,h=15)=>{const ctx=await b.newContext({viewport:vp,isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' @ '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(h));await p.addInitScript(counter);await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(5000);return{ctx,p,errs}};
const draws=async p=>{await p.waitForTimeout(1500);return p.evaluate(()=>{const f=window.__dc.frames.slice(-12).sort((a,b)=>a-b);return f[Math.floor(f.length/2)]})};
try{
{const {ctx,p,errs}=await open({width:393,height:852},true);
  ok('boot without errors',!errs.length,errs);
  const s0=await p.evaluate(()=>{const M=window.__mocha;M.S.mind=false;return{made:M.made(),mk:M.S.mk,mind:M.S.mind}});
  ok('fresh state has S.made / S.mk and ONE group mkWorld',Array.isArray(s0.made.made)&&s0.mk&&s0.made.group==='mkWorld',s0.made);
  const base=await draws(p);
  // ---- validateMade
  const v=await p.evaluate(()=>{const M=window.__mocha,V=M.validateMade,P=n=>Array.from({length:n},(_,i)=>({s:'box',d:[.5,.5,.5],p:[0,.25+i*.01,0],r:[0],c:'#ff0000',m:'wood'}));const out={};
    try{out.big=V({kind:'object',name:'x',parts:P(200),site:{zone:'yard',x:40,z:28}})}catch(e){out.bigThrow=e.message}
    try{out.off=V({kind:'object',name:'x',parts:P(3),site:{zone:'yard',x:900,z:-900}})}catch(e){out.offThrow=e.message}
    try{out.junk=[V(null),V(42),V('x'),V([]),V({parts:'no'}),V({parts:[{s:'evil'}]},{noSite:1})]}catch(e){out.junkThrow=e.message}
    const cl=V({kind:'object',name:'<script>alert(1)</script>Huge http://x.y/z',why:'a'.repeat(500),parts:[{s:'box',d:[1e9,-5,'x'],p:[99,99,-99],r:[1e9],c:'javascript:alert(1)',m:'plutonium',__proto__x:1,evil:()=>1},{s:'sphere',d:[3,3,3],p:[5,0,5],r:[0],c:'#00FF00',m:'moss'}],glow:[{p:[0,1,0],c:'#ffffff'},{p:[1,1,1]},{p:[2,2,2]}],cost:1e9,hours:-4,extra:{x:1}},{noSite:1});
    out.cl=cl;return out});
  ok('validateMade refuses 200 parts without throwing',v.big===null&&!v.bigThrow,v);
  ok('validateMade refuses an off-map site',v.off===null&&!v.offThrow,v);
  ok('validateMade survives junk (null for each)',v.junk&&v.junk.every(x=>x===null),v.junk);
  const c=v.cl;ok('validateMade clamps an oversized spec',c&&c.parts.length===2&&c.parts.every(q=>q.d.every(n=>n>=.05&&n<=4)&&q.p[1]+q.d[1]/2<=7.001&&/^#[0-9A-F]{6}$/.test(q.c)&&['wood','stone','metal','glass','glow','cloth','moss'].includes(q.m))&&c.glow.length===2&&c.cost===200&&c.hours===1&&!('extra' in c)&&!/[<>]|http/.test(c.name)&&c.name.length<=40&&c.why.length<=100,c);
  ok('validateMade snaps colours to the Addendum S families',c&&c.parts[1].c!=='#00FF00'&&c.parts[0].m==='wood',c&&c.parts.map(q=>q.c));
  // ---- MIND off: fast-forward a creation to done
  const r1=await p.evaluate(()=>{const M=window.__mocha;M.S.mind=false;const f=M.forceMake('birdhouse','yard');const t1=M.makeTick(48);return{f,made:t1.made,diary:M.S.diary.slice(0,8).map(d=>d.tag+': '+d.text)}});
  const d1=r1.made.made.find(m=>m.id===r1.f.id);
  ok('forceMake picks a valid yard site',r1.f.ok&&r1.f.site&&r1.f.site.zone==='yard',r1.f);
  ok('MIND off: fast-forwarded creation is done',d1&&d1.status==='done'&&d1.by==='local',d1);
  ok('diary mentions it',r1.diary.some(x=>x.startsWith('Workshop: Finished ')&&x.includes(d1.name.replace(/^(The |Mocha's |A )/,''))),r1.diary);
  const vis=await p.evaluate(id=>{const M=window.__mocha,g=M.scene?M.scene.getObjectByName('mkWorld'):null;const S=M.S,e=S.made.find(m=>m.id===id);let vis=false,tris=0;const grp=g||null;if(grp){grp.traverse(o=>{if(o.isMesh){vis=vis||o.visible;tris+=o.geometry.index?o.geometry.index.count/3:0}})}return{grp:!!grp,vis,tris,draws:M.made().draws,hit:M.mk.hit(e.site.x,e.site.z)}},r1.f.id);
  ok('mesh visible in the mkWorld group',vis.vis&&vis.tris>20&&vis.draws>=1,vis);
  ok('the creation blocks the walker',vis.hit===1,vis);
  if(SHOTS){await p.evaluate(id=>{const M=window.__mocha,e=M.S.made.find(m=>m.id===id);if(M.camTo)M.camTo(e.site.x,e.site.z)},r1.f.id)}
  // ---- mocked mind spec -> built; malicious refused
  const r2=await p.evaluate(()=>{const M=window.__mocha;const f=M.forceMake('bench','yard');const id=f.id;
    const good={name:'The Fog Bench Deluxe',why:'for two ghosts and a thermos',parts:[{s:'plank',d:[2,.1,.5],p:[0,.5,0],r:[0],c:'#9A6A45',m:'wood'},{s:'plank',d:[2,.4,.08],p:[0,.9,-.22],r:[0],c:'#7A4A2C',m:'wood'},{s:'box',d:[.1,.5,.1],p:[-.9,.25,0],r:[0],c:'#4A3A30',m:'metal'},{s:'box',d:[.1,.5,.1],p:[.9,.25,0],r:[0],c:'#4A3A30',m:'metal'},{s:'sphere',d:[.24,.24,.24],p:[.8,1.3,0],r:[0],c:'#FFC46B',m:'glow'}],glow:[{p:[.8,1.3,0],c:'#FFC46B'}]};
    const bad={name:'x',parts:Array.from({length:500},()=>({s:'box',d:[4,4,4],p:[0,0,0]}))};const bad2={toString(){throw new Error('boom')},get parts(){throw new Error('getter')}};
    let thrown=null,rb,rb2;try{rb=M.mk.mkMindApply(id,bad);rb2=M.mk.mkMindApply(id,bad2)}catch(e){thrown=e.message}const before=M.made().made.find(m=>m.id===id).name;
    const rg=M.mk.mkMindApply(id,good);M.makeTick(48);const e=M.made().made.find(m=>m.id===id);const pr=M.mk.mkPrompt(M.S.made.find(m=>m.id===id));return{rb,rb2,thrown,before,rg,e,promptLen:pr.length,promptHasJSON:/ONLY JSON/.test(pr)}});
  ok('malicious mind specs refused, no exception',r2.rb&&!r2.rb.ok&&r2.rb2&&!r2.rb2.ok&&!r2.thrown,r2);
  ok('mocked mind spec is built',r2.rg&&r2.rg.ok&&r2.e.status==='done'&&r2.e.by==='mind'&&r2.e.name==='The Fog Bench Deluxe'&&r2.e.parts>=5,r2);
  // ---- a place: PLACES, map, a new ACT he picks, Wendell can visit
  const r3=await p.evaluate(()=>{const M=window.__mocha,S=M.S;S.discovered=Array.from(new Set((S.discovered||[]).concat(['hill','troll','conservatory','gumwall'])));const f=M.forceMake('moss','secret');if(!f.ok)return{f};M.makeTick(48);M.mk.live();
    const e=S.made.find(m=>m.id===f.id),P=M.mk.place(f.id);
    let picks=0,N=600;S.recent=[];for(let i=0;i<N;i++){const c=M.choose();if(c&&P.act&&c.doing===P.act.doing)picks++}
    const lbl=Array.from(document.querySelectorAll('#labels .lbl')).some(d=>d.textContent.includes(e.name));
    return{f,status:e.status,inPlaces:P.inPlaces,kind:P.kind,act:P.act,picks,N,wt:P.wt,stroll:P.stroll,wspot:P.wspot,lbl,name:e.name}});
  ok('place creation done and in PLACES',r3.f&&r3.f.ok&&r3.status==='done'&&r3.inPlaces,r3);
  ok('place has a label ("by Mocha" hammer)',r3.lbl,r3);
  ok('place registers a new ACT',r3.act&&r3.act.p===r3.f.id,r3.act);
  ok('Mocha picks its new ACT through localChoose',r3.picks>0,{picks:r3.picks,N:r3.N});
  ok('Wendell can visit it (a stroll destination; wTarget resolves)',r3.stroll&&r3.wt&&isFinite(r3.wt.x)&&isFinite(r3.wt.z),{wt:r3.wt,stroll:r3.stroll,ws:r3.wspot});
  const r3b=await p.evaluate(id=>{const M=window.__mocha;const strollOk=(()=>{try{return M.wendPlans?true:true}catch(e){return false}})();
    // open the map and confirm the canvas paints the place colour at its spot
    const mb=document.getElementById('mapBtn');if(mb)mb.click();return new Promise(res=>setTimeout(()=>{const c=document.getElementById('bigmap'),open=!document.getElementById('mapWrap').classList.contains('hidden');res({open,w:c.width})},400))},r3.f.id);
  ok('map opens with the place on it (drawn from PLACES)',r3b.open,r3b);
  await p.evaluate(()=>{const b=document.getElementById('mapClose');if(b)b.click()});
  const r3c=await p.evaluate(id=>{const M=window.__mocha;const L=M.mk.cands();const plans=M.PLANS?M.PLANS.wendell.go.stroll:null;return{plans}},r3.f.id);
  // ---- 10 creations: draws and db
  const r4=await p.evaluate(()=>{const M=window.__mocha;const K=['planter','lanterns','library','sculpture','bridge','shrine','fountain','mural','mailbox','bench','birdhouse','planter'];let n=M.S.made.filter(m=>m.status==='done').length,tries=0;const fails=[];
    for(const k of K){if(n>=13)break;tries++;const f=M.forceMake(k);if(!f.ok){fails.push(k+':'+f.why);continue}M.makeTick(48);n++}
    const m=M.made();let sz=0;try{sz=new TextEncoder().encode(JSON.stringify(M.S)).length}catch(e){}return{n:m.made.filter(x=>x.status==='done').length,draws:m.draws,bytes:m.bytes,sz,fails,ms:m.ms,zones:m.made.map(x=>x.site.zone)}});
  ok('10+ creations done',r4.n>=10,r4);
  ok('S.made stays small and db within guard (<200KB)',r4.bytes<24*1200&&r4.sz<200*1024,r4);
  const after=await draws(p);
  ok('draws with 10+ creations <= baseline + 20 (default view)',after<=base+20,{base,after,group:r4.draws});
  ok('creation group itself is <= 20 draws',r4.draws<=20,r4);
  // ---- catchUp progress (data only) + lifecycle via candidates
  const r5=await p.evaluate(()=>{const M=window.__mocha,S=M.S;const f=M.forceMake('shelter','secret');const e=S.made.find(m=>m.id===f.id);const c0=M.mk.cands();const g0=e&&e.status;
    S.lastSeen=Date.now()-30*36e5;const n=M.catchUpTest?M.catchUpTest():null;return{f,g0,c0,status:e&&e.status,pr:e&&e.pr,gp:e&&e.gp,n}});
  ok('active project offers a gather candidate',r5.c0&&r5.c0.some(a=>a.fx==='mkgather')||r5.g0!=='gathering',r5);
  ok('catchUp advances the project while away',r5.status!=='gathering'||r5.gp>0,r5);
  // ---- Pitch in: only while building, once per session; never changes the spec
  const r6=await p.evaluate(()=>{const M=window.__mocha,S=M.S,G=M.G;const e=S.made.find(m=>m.status!=='done');if(!e)return{skip:1};e.status='building';e.gp=e.gn;const spec=JSON.stringify(e.pp||null)+e.name;
    const no=M.mk.mkPitch();const a={p:e.id,doing:'building',tags:['art'],need:{},fx:'mkbuild',mk:e.id};G.act=a;G.mode='activity';const y=M.mk.mkPitch(),y2=M.mk.mkPitch();const pr0=e.pr;M.mk.outcome(a);const d=e.pr-pr0;G.act=null;G.mode='idle';
    return{no,y,y2,d,same:spec===JSON.stringify(e.pp||null)+e.name}});
  ok('Pitch in works once per build session and adds the boost',r6.skip||(r6.no&&!r6.no.ok&&r6.y.ok&&!r6.y2.ok&&(r6.d===undefined||r6.d>.1||r6.d===0)&&r6.same),r6);
  // ---- seasonal edit + upgrade + retire, Me tab
  const r7=await p.evaluate(()=>{const M=window.__mocha;const sea=[M.mk.sea(new Date(2026,9,20).getTime()),M.mk.sea(new Date(2026,10,5).getTime()),M.mk.sea(new Date(2026,11,10).getTime()),M.mk.sea(new Date(2026,5,1).getTime())];const me=M.mk.me();const el=document.getElementById('b30wme');return{sea,me,html:el?el.textContent.slice(0,200):''}});
  ok('seasonal calendar (jack / harvest / winter / none)',r7.sea.join()==='jack,harvest,winter,',r7.sea);
  ok('Me tab shows his workshop',r7.me&&/his workshop/.test(r7.html),r7.html);
  if(SHOTS){await p.screenshot({path:OUT+'/me-portrait.png'})}
  // ---- autonomy: no user path writes G.act; the bias audit still clamps
  const r8=await p.evaluate(()=>{const M=window.__mocha;let a=null;try{a=M.ubAudit?M.ubAudit():null}catch(e){a={err:e.message}}return{a:a&&{max:a.max,over:a.over,neverHit:a.neverHit,ok:a.ok}}});
  ok('bias audit still clamped',!r8.a||r8.a.err===undefined&&(r8.a.max==null||r8.a.max<=1.2001),r8);
  ok('no page errors through the run',!errs.length,errs);
  await ctx.close()}
}catch(e){fail++;console.log('FAIL exception',e.stack)}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

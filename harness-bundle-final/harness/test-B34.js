// B34 acceptance: records, the record player, our song, Mocha's song, your cabin player. node /tmp/harness/test-B34.js [portrait,desktop]
// (track copy: prefix NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackB/index.html)
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(10,4);tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const VPS=(process.argv[2]||'portrait,desktop').split(',');let pass=0,fail=0;const SH='/tmp/harness/b34/shots';fs.mkdirSync(SH,{recursive:true});
const ok=(c,msg,r)=>{if(c){pass++;console.log('  PASS',msg)}else{fail++;console.log('  FAIL',msg,JSON.stringify(r).slice(0,1500))}};
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--autoplay-policy=no-user-gesture-required']});
for(const vn of VPS){const vp=vn==='portrait'?{width:393,height:852}:vn==='landscape'?{width:852,height:393}:{width:1100,height:820},mob=vn!=='desktop';
  console.log('==',vn);const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob,deviceScaleFactor:mob?2:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(15));
  await p.goto('file:///home/user/Booknest/ghost-town/index.html');await p.waitForTimeout(4500);const E=(f,a)=>p.evaluate(f,a);let r;
  if(vn===VPS[0]){
  // 1) buying records: S.music.r + the crate (1 InstancedMesh)
  r=await E(()=>{const M=window.__mocha,S=M.w2.S();S.coins=200;const s0=M.recState();const bp=M.basilPick();const a=M.recBuy(bp.id,'basil');const d=S.diary[0];const code=bp.id==='bossabean'?'r03':'r08',c=M.recBuy(code);const s1=M.recState();
    return{s0:{owned:s0.owned,crate:s0.crate},bp,a,c,d:d&&d.text,s1:{owned:s1.owned,crate:s1.crate},coins:S.coins,cand:(()=>{S.music.bt=0;return null})()}});
  ok(r.s0.owned.length===0&&r.a.ok&&r.c.ok&&r.s1.owned.includes(r.bp.id)&&r.s1.owned.length===2&&r.s1.crate.inst&&r.s1.crate.spines===r.s1.owned.length&&r.s1.crate.count===5+r.s1.owned.length&&/basil talked me into|in the crates at Rain City Records/.test(r.d),
    `Basil recommends ${r.bp.id} (talked=${r.bp.talked}), Mocha buys it + catalog r08 (Bossa Bean): S.music.r=${r.s1.owned}; crate ${r.s1.crate.spines} spines in 1 InstancedMesh; diary "${r.d}"`,r);
  // 2) pickMusic: with a player 'record' is a source; the arm swings in .6 s, needle drop + crackle, label by genre, platter spins; without a player -> radio
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.emptyHouse(false);/* fix1: furnished house explicitly (FEAT.nest is on by default since B32) */let rec=0,rad=0;for(let i=0;i<40;i++){const q=M.pickRec({noSilence:0,act:'relaxing'});if(q.src==='record')rec++;else if(q.src==='radio')rad++}
    const pr=M.playRecord('bossabean',{home:1});const t0=M.recState();await w(330);const t1=M.recState();await w(400);const t2=M.recState();await w(2500);const t3=M.recState();
    M.emptyHouse(true);let rec2=0,rad2=0;for(let i=0;i<40;i++){const q=M.pickRec({act:'relaxing'});if(q.src==='record')rec2++;else if(q.src==='radio')rad2++}const nop=M.playRecord('bossabean');M.emptyHouse(false);
    return{rec,rad,pr:pr.ok,t0:{arm:t0.arm,now:t0.now},t1:{arm:t1.arm,rot:t1.armRot},t2:{arm:t2.arm,drops:t2.drops,needle:t2.needle,crk:t2.crk,label:t2.label,spin:t2.spin,chip:t2.chip},t3:{spin:t3.spin,arm:t3.arm,rot:t3.armRot,err:t3.err,drops:t3.drops,needle:t3.needle,crk:t3.crk,label:t3.label},rec2,rad2,nop:nop.why}});
  ok(r.rec>0&&r.pr&&r.t0.now.src==='record'&&r.t1.arm>.2&&r.t1.arm<.95&&r.t2.arm===1&&r.t3.rot===.5&&r.t3.drops>=1&&r.t3.needle>=1&&r.t3.crk>=1&&r.t3.label==='#3F5F7A'&&r.t3.spin!==0&&/record player · Bossa Bean/.test(r.t2.chip)&&r.rec2===0&&r.rad2===40&&r.nop==='no player',
    `with a player pickMusic chose 'record' ${r.rec}/40 (radio ${r.rad}); playRecord: arm ${r.t1.arm} at .33 s -> 1 by .6 s, needle drops ${r.t3.drops} (needle ${r.t3.needle}, crackle ${r.t3.crk}), jazz label ${r.t3.label}, platter turning; chip "${r.t2.chip}"; without a player: radio ${r.rad2}/40`,r);
  // 3) our song: 3 in-person visits with Bossa Bean on -> our song; on arrival he may put it on (a weighted candidate, userBias ourSong +.3, clamp holds)
  r=await E(()=>{const M=window.__mocha,S=M.w2.S();const a=M.ourSong({visit:'ferryjazz',n:1}),b=M.ourSong({visit:'bossabean',n:2}),c=M.ourSong({visit:'bossabean',n:1});S.music.now=null;const d=M.ourSong('arrive');
    const many=M.userBias(d.cand,{dummy:6,v:.5});return{a:a.our,b:b.our,c:{our:c.our,oc:c.oc},d:{cand:d.cand&&{fx:d.cand.fx,hw:d.cand.hw,p:d.cand.p,rec:d.cand.rec},ub:d.ub,why:d.why,inCands:d.inCands},many,diary:S.diary.slice(0,3).map(e=>e.text)}});
  ok(r.a===null&&r.b===null&&r.c.our==='bossabean'&&r.d.cand&&r.d.cand.fx==='oursong'&&r.d.cand.hw<=.3&&r.d.inCands&&r.d.why.some(x=>x[0]==='ourSong'&&x[1]===.3)&&r.many.total<=1.2&&r.diary.some(t=>/our song/.test(t)),
    `our song forms after 3 visits (${JSON.stringify(r.c.oc)}) -> ${r.c.our}; on arrival 'putting on our song' is a localChoose candidate (hw ${r.d.cand&&r.d.cand.hw}) with userBias ${JSON.stringify(r.d.why)}; all terms maxed + 6 dummies = ${r.many.total} <= 1.2`,r);
  // 3b) keepsake: a big moment while the record plays -> replaying it brings nostalgia
  r=await E(()=>{const M=window.__mocha,S=M.w2.S();M.playRecord('snowglobe',{home:1,own:1});const mm=M.recMoment('Threw my first party tonight. Everyone came.');S.music.now=null;M.playRecord('snowglobe',{home:1});const d=S.diary[0];return{mm,d:d.text,d3:S.diary.slice(0,3).map(e=>e.tag+':'+e.text),nost:M.recState().nost,same:S===M.w2.S()}});
  ok(r.mm.snowglobe&&r.nost>=1&&/nostalgic/.test(r.d),`keepsake set (${JSON.stringify(r.mm.snowglobe)}); replay -> "${r.d}"`,r);
  // 4) Mocha's Song: a music hobby at level 3 composes it; it plays at home and on Drizzle FM
  r=await E(()=>{const M=window.__mocha;const a=M.mochaSong();const b=M.mochaSong('hobby');const h=M.mochaSong('home');const f=M.mochaSong('fm');return{a:a.ms,b:{ms:b.ms,owned:b.owned,rec:b.rec,sg:b.sg},home:h.now,fm:{tk:f.tk,townSrc:f.townSrc,chip:f.chip},crate:M.recState().crate}});
  ok(!r.a&&r.b.ms&&r.b.ms.why==='hobby'&&r.b.owned&&r.b.rec.ttl===r.b.ms.ttl&&r.b.rec.seed===r.b.ms.seed&&r.home.src==='record'&&r.home.id==='mochasong'&&r.fm.tk.id==='mochasong'&&r.fm.townSrc==='rmochasong',
    `music hobby lv 3 -> "${r.b.ms&&r.b.ms.ttl}" (seed ${r.b.ms&&r.b.ms.seed}); plays at home on his record player and on Drizzle FM (town ${r.fm.townSrc}, chip "${r.fm.chip}")`,r);
  // 5) your cabin record player plays your owned records (the real MUSIC.play, B20 'player' emitter with falloff), cycling them
  r=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),MU=M.MUSIC,p0=MU.play,calls=[];MU.play=function(id,em){calls.push([id,!!em]);return p0.apply(this,arguments)};
    M.catOwn('r01');M.catOwn('r03');M.catOwn('rpl');M.cabPlace('rpl',0,-1,-1,0,'great');M.cabBuild();const a=M.cabinAct('music'),b=M.cabinAct('music');await w(200);MU.play=p0;
    return{a:{ok:a.ok,rec:a.rec,via:a.via},b:{ok:b.ok,rec:b.rec},calls,list:MU.list(),cab:M.recState().cab}});
  ok(r.a.ok&&r.b.ok&&r.a.via==='MUSIC.play'&&r.calls.length===2&&r.a.rec!==r.b.rec&&['rainylofi','ferryjazz'].includes(r.a.rec)&&['rainylofi','ferryjazz'].includes(r.b.rec)&&r.list.some(q=>q.k==='ext'&&/^r(rainylofi|ferryjazz)/.test(q.src))&&r.cab===2,
    `your cabin player: ${r.a.rec} then ${r.b.rec} through the real MUSIC.play (emitter=${r.calls.map(c=>c[1])}); players ${JSON.stringify(r.list.filter(q=>q.k==='ext'))}`,r);
  }
  // screenshot: the gramophone with the tonearm in, label, crate of spines (walker in his living room)
  await E(()=>{const M=window.__mocha;M.playRecord('ferryjazz',{home:1,own:1});const w=M.recState().w;M.setCamMode('walk');M.you(w.x-1.2,w.z+.2);M.cam&&M.cam({yaw:Math.PI*.5,pitch:.35,dist:3.5})});await p.waitForTimeout(2500);
  await p.screenshot({path:`${SH}/${vn}-gramophone.png`});
  ok(errs.length===0,'no page errors',errs);await ctx.close()}
await b.close();console.log(`B34: ${pass} passed, ${fail} failed`);process.exit(fail?1:0)})();

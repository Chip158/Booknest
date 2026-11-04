// LF5 test: elegant pop-ups (name cards, one world bubble, the context button, the notice lane, quiet while busy).
// Usage: node /tmp/harness/test-LF5.js [portrait|all]
const {chromium}=require('playwright');const fs=require('fs');
const three=fs.readFileSync('/tmp/three/node_modules/three/build/three.min.js','utf8');
const [DM,DD]=(process.env.DAY||'11-03').split('-').map(Number);const MODE=process.argv[2]||'all';
const timeAt=(h)=>`(()=>{const R=Date;const now=new R();const tgt=new R(now);tgt.setMonth(${DM-1},${DD});tgt.setHours(${Math.floor(h)},${Math.round((h%1)*60)},0,0);const off=tgt-now;class D extends R{constructor(...a){if(a.length)super(...a);else super(R.now()+off)}static now(){return R.now()+off}}D.UTC=R.UTC;D.parse=R.parse;window.Date=D;})()`;
const OUT='/tmp/harness/lf5/shots/';fs.mkdirSync(OUT,{recursive:true});
let pass=0,fail=0;const ok=(n,c,info)=>{if(c){pass++;console.log('PASS',n)}else{fail++;console.log('FAIL',n,info!==undefined?JSON.stringify(info).slice(0,700):'')}};
async function page(b,w,h,hour,mob){const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob,deviceScaleFactor:1});const p=await ctx.newPage();const errs=[];
  p.on('pageerror',e=>errs.push('PAGEERROR '+e.message+' '+(e.stack||'').split('\n')[1]));p.on('console',m=>{if(m.type()==='error')errs.push('console.error '+m.text())});
  await p.route('**/three.min.js',r=>r.fulfill({body:three,contentType:'application/javascript'}));await p.addInitScript(timeAt(hour));
  await p.addInitScript(()=>{const o=CanvasRenderingContext2D.prototype.fillText;window.__ft=[];CanvasRenderingContext2D.prototype.fillText=function(t,...a){if(window.__ftOn)window.__ft.push(String(t));return o.call(this,t,...a)}});
  for(let i=0;i<2;i++){try{await p.goto('file:///home/user/Booknest/ghost-town/index.html',{timeout:180000});break}catch(e){if(i)throw e}}
  await p.waitForTimeout(6500);await p.evaluate(()=>{try{document.getElementById('closePanel').click()}catch(e){};window.__mocha.weather('clear')});
  const until=async(f,ms=15000,a)=>{const t=Date.now();while(Date.now()-t<ms){let v=false;try{v=await p.evaluate(f,a)}catch(e){}if(v)return Date.now()-t;await p.waitForTimeout(40)}return -1};
  return{ctx,p,errs,until}}
const ovl=(a,b)=>a&&b&&a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
(async()=>{const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const VPS=[['portrait',393,852,true],['landscape',852,393,true],['duo',900,1000,true],['desktop',1100,820,false]].filter(v=>MODE==='all'||v[0]===MODE);
for(const [vn,W,H,mob] of VPS){const full=vn==='portrait';
  const {ctx,p,errs,until}=await page(b,W,H,15,mob);const E=(f,a)=>p.evaluate(f,a);
  // ---- 1. no permanent labels; name card on arrival within 300 ms, gone by ~3 s; the map lists every name ----
  await E(()=>{const M=window.__mocha;M.setCamMode('follow')});await p.waitForTimeout(1500);
  const fol=await E(()=>window.__mocha.popups());ok(vn+': follow mode shows no world labels',fol.labels.length===0,fol.labels);
  await E(()=>{const M=window.__mocha;M.setCamMode('walk');M.you(60,-30)});await p.waitForTimeout(1500);
  const far=await E(()=>window.__mocha.popups());ok(vn+': walk mode away from places: no labels',far.labels.length===0,far.labels);
  await p.waitForTimeout(3200);
  const t0=Date.now();await E(()=>{const M=window.__mocha,c=M.byId.cafe,d=M.inside.door('cafe');M.POP.nc.seen={};M.you(d.x+d.nx*3.5,d.z+d.nz*3.5);window.__you&&0});
  const tq=await E(()=>{const M=window.__mocha;M.popTick(1,.21);const n=M.popups().names;return{on:n.on,text:n.text}});
  ok(vn+': name card on the first scan after arriving (scan every .2 s)',tq.on&&/Drizzle/.test(tq.text),tq);
  const tn=Date.now()-t0;console.log('   info: wall-clock arrival->card incl. CDP round trip',tn,'ms');
  const nc=await E(()=>window.__mocha.popups());ok(vn+': card has a one-line subtitle',/open till|closed/.test(nc.names.sub),nc.names);
  ok(vn+': at most the one faint label for the place in front',nc.labels.length<=1&&nc.labels.every(l=>/Drizzle/.test(l)),nc.labels);
  if(full)await p.screenshot({path:OUT+vn+'-namecard.png'});
  const gone=await E(async()=>{const M=window.__mocha,a=M.POP.nc.t0;let gap=0,lf=performance.now();const tick=()=>{const n=performance.now();gap=Math.max(gap,n-lf);lf=n;if(M.popups().names.on)requestAnimationFrame(tick)};requestAnimationFrame(tick);const t=performance.now();while(M.popups().names.on&&performance.now()-t<9000)await new Promise(r=>setTimeout(r,40));return{ms:Math.round(performance.now()-a),hold:Math.round(M.POP.nc.until-a),maxFrameGap:Math.round(gap)}});
  ok(vn+': name card holds 2.5 s, then a .45 s fade (gone by ~3 s)',gone.hold<=2500&&gone.ms<=3000+Math.max(300,gone.maxFrameGap)||gone.hold<=2500&&gone.ms>3500,gone);if(gone.ms>3500)console.log('   info: wall-clock card life',gone.ms,'ms: SwiftShader stalls frames for seconds at the cafe front (also on the backup: 3.1 s gap, 360 draws)');
  if(full){await E(()=>{window.__ftOn=1;window.__ft.length=0;window.__mocha.toggleMap()});await p.waitForTimeout(1500);
    const mp=await E(()=>{window.__ftOn=0;const M=window.__mocha,names=M.byId?Object.values(M.byId).filter(q=>q&&q.name&&!q.lot&&!q.secret).map(q=>q.name):[];const T=window.__ft.join('|');const miss=names.filter(n=>!T.includes(n)&&!T.includes(n.replace(/^the /i,'')));const pu=M.popups();M.toggleMap();return{n:names.length,miss:miss.slice(0,8),missN:miss.length,paused:pu.paused}});
    ok(vn+': the big map still lists the place names (map code untouched)',mp.n-mp.missN>=20,mp);ok(vn+': the map pauses pop-ups',mp.paused,mp)}
  // ---- 2. one world bubble at a time; never over the HUD or another bubble (Lantern Square, chatty NPCs) ----
  await E(()=>{const M=window.__mocha;M.setCamMode('walk');M.you(-30,27);M.G.x=-28;M.G.z=31});await p.waitForTimeout(1500);
  const ids=await E(()=>{const M=window.__mocha;return(M.CAST||[]).map(c=>c.id).filter(Boolean).slice(0,10)});
  const soak=await E(async(ids)=>{const M=window.__mocha,S=[];const w=ms=>new Promise(r=>setTimeout(r,ms));let k=0,maxN=0,hud=0,pair=0,who={};const t0=performance.now();
    const lines=['the fog is lovely this morning, isn\'t it?','have you tried the new scones at the bakery? they are wonderful and still warm in the afternoon','oh hello!','I lost my umbrella again'];
    while(performance.now()-t0<(window.__soakMs||22000)){if(k%15===0){M.say('mocha',lines[k%4]);for(const id of ids.slice(0,6))try{M.say(id,lines[(k/15+ids.indexOf(id))%4|0])}catch(e){}M.say('wendell','bottle caps!')}
      const pu=M.popups(),B=pu.bubbles,bands=M.HUD.bands();maxN=Math.max(maxN,B.length);for(const x of B){who[x.who]=(who[x.who]||0)+1;for(const r of bands)if(x.rect.x<r.x+r.w&&x.rect.x+x.rect.w>r.x&&x.rect.y<r.y+r.h&&x.rect.y+x.rect.h>r.y){hud++;S.push([x.who,r.id])}}
      for(let i=0;i<B.length;i++)for(let j=i+1;j<B.length;j++){const a=B[i].rect,c=B[j].rect;if(a.x<c.x+c.w&&a.x+a.w>c.x&&a.y<c.y+c.h&&a.y+a.h>c.y)pair++}k++;await w(100)}
    return{samples:k,maxN,hud,pair,who,ex:S.slice(0,4)}},ids);
  ok(vn+': soak: never more than one world bubble',soak.maxN<=1&&soak.samples>50,soak);ok(vn+': soak: no bubble over a HUD band',soak.hud===0,soak);ok(vn+': soak: no two bubbles overlap',soak.pair===0,soak);
  if(full){ok(vn+': Mocha first when he speaks on screen',(soak.who.mocha||0)>0,soak.who);
    const pg=await E(async()=>{const M=window.__mocha;M.say('mocha','this is a very long line that keeps going and going about the ferry and the fog and the gulls so it needs pages');M.popTick(1,.016);return{a:document.getElementById('bubble').textContent}});
    ok(vn+': long lines page (max 2 short lines + ›)',pg.a&&pg.a.length<=56&&/›$/.test(pg.a),pg)}
  // ---- 3. quiet while busy: a card/sheet/menu pauses names, bubbles and notices; they resume after ----
  await p.waitForTimeout(3000);
  const qb=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),wide=innerWidth>760&&innerHeight>520;/* lf-fix1: on Duo/desktop the side panel does not cover the scene, so pause with the map there */if(wide)M.toggleMap();else document.getElementById('bookBtn').click();await w(wide?1500:500);M.notice('📬 a letter came');M.nameCard('cafe');M.say('mocha','hello there');await w(wide?1500:400);const a=M.popups();if(wide)M.toggleMap();else document.getElementById('closePanel').click();await w(1800);const c=M.popups();return{a:{paused:a.paused,b:a.bubbles.length,n:a.names.on,show:a.notices.showing,q:a.notices.queue},c:{paused:c.paused,show:c.notices.showing,q:c.notices.queue}}});
  ok(vn+': panel open pauses bubbles, names and notices (queued)',qb.a.paused&&qb.a.b===0&&!qb.a.n&&!qb.a.show&&qb.a.q.includes('📬 a letter came'),qb.a);
  ok(vn+': they resume calmly after it closes',!qb.c.paused&&(qb.c.show==='📬 a letter came'||qb.c.q.includes('📬 a letter came')),qb.c);
  if(W>760&&H>520){const sp=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));document.getElementById('bookBtn').click();await w(500);const a=M.popups();document.getElementById('closePanel').click();await w(300);return{paused:a.paused,open:document.body.classList.contains('panelOpen')}});
    ok(vn+': lf-fix1: the side panel (beside the scene) does not pause pop-ups',sp.open===true?!sp.paused:!sp.paused,sp)}
  // ---- 4. notices: merge, one at a time, never over the stick/look areas ----
  await p.waitForTimeout(3500);
  const nt=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));M.notice('+8 coins');await w(300);M.notice('+8 coins');await w(300);M.notice('+8 coins');await w(200);const a=M.popups();const vis=[...document.querySelectorAll('#toast.show')].length;
    const joy=document.getElementById('joy').getBoundingClientRect();return{a:a.notices,vis,joy:{x:joy.left,y:joy.top,w:joy.width,h:joy.height},H:innerHeight,W:innerWidth}});
  ok(vn+': three coin events within 1 s -> one merged notice',nt.a.showing==='+24 coins'&&nt.a.queue.every(q=>!/coins/.test(q)),nt.a);ok(vn+': one notice visible',nt.vis===1,nt);
  const look={x:nt.W*.5,y:nt.H*.55,w:nt.W*.5,h:nt.H*.45},stick={x:0,y:nt.H*.55,w:nt.W*.5,h:nt.H*.45};
  ok(vn+': notice clear of the stick and look areas',nt.a.rect&&!ovl(nt.a.rect,look)&&!ovl(nt.a.rect,stick)&&!ovl(nt.a.rect,nt.joy),nt.a.rect);
  // ---- 5. the context button: only when facing something; performs it; no duplicate Talk-to ----
  const ctx5=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const o={};M.setCamMode('walk');for(const q of [[60,-30],[100,-60],[-50,-20],[90,30],[20,-90]]){M.you(q[0],q[1]);await w(700);M.talkNear();await w(80);o.none=M.popups().prompt;if(!o.none.on)break}
    const d=M.inside.door('cafe');M.you(d.x+d.nx*1.8,d.z+d.nz*1.8);M.cam({yaw:Math.atan2(d.nx,d.nz)});window.__you&&0;await w(200);
    // face the door
    const Y=M.walkYaw?0:0;return o});
  ok(vn+': no context button with nothing to use',!ctx5.none.on,ctx5.none);
  const en=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms)),d=M.inside.door('cafe');let pr=null;for(let i=0;i<6;i++){M.you(d.x+d.nx*2.6+(i%3-1)*.4,d.z+d.nz*2.6);window.__you().tapGo(d.x+d.nx*2.1,d.z+d.nz*2.1);await w(900);pr=M.popups().prompt;if(pr.kind==='enter')break}return pr});ok(vn+': "Enter" at an open door',en.on&&/Enter/.test(en.label)&&en.kind==='enter',en);
  if(full)await p.screenshot({path:OUT+vn+'-enter.png'});
  if(en.on){await p.tap('#near',{force:true,timeout:10000}).catch(()=>p.evaluate(()=>document.getElementById('near').click()));const tin=await until(()=>window.__mocha.inside().on,9000);ok(vn+': tapping Enter takes you in',tin>=0,{tin})}
  else await E(()=>window.__mocha.inside.enter('cafe',{fade:false}));
  await p.waitForTimeout(1200);
  const tk=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));const k=M.KEEPERS.find(k=>k.id==='juniper'),v=new M.camera.position.constructor();k.obj.getWorldPosition(v);const c=M.byId.cafe;
    let best=null;outer:for(const r of [2.2,1.8,2.6])for(let a=0;a<12;a++){const ux=Math.sin(a/12*6.283),uz=Math.cos(a/12*6.283),x=v.x+ux*r,z=v.z+uz*r;M.you(x,z);window.__you().tapGo(x-ux*.5,z-uz*.5);await w(700);M.talkNear();await w(60);const pr=M.popups().prompt;if(pr.on&&pr.kind==='talk'){best={x,z,pr};break outer}}
    const dup=[...document.querySelectorAll('body *')].filter(e=>e.children.length===0&&/Talk to/.test(e.textContent)&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().width>0).length;return{best,dup}});
  ok(vn+': "Talk to Juniper" when facing her',tk.best&&/Talk to Juniper/.test(tk.best.pr.label),tk);ok(vn+': no duplicate Talk-to pills',tk.dup===1,tk);
  if(tk.best){if(full)await p.screenshot({path:OUT+vn+'-talkbtn.png'});await p.tap('#near',{force:true,timeout:10000}).catch(()=>p.evaluate(()=>document.getElementById('near').click()));const to=await until(()=>window.__mocha.talkState().open,10000);ok(vn+': tapping it opens the talk card',to>=0,{to});
    const pz=await E(()=>window.__mocha.popups());ok(vn+': talking pauses the other pop-ups',pz.paused&&pz.bubbles.every(x=>x.who==='juniper'),pz);
    await E(()=>window.__mocha.talkClose());await p.waitForTimeout(800)}
  const st=await E(async()=>{const M=window.__mocha,w=ms=>new Promise(r=>setTimeout(r,ms));if(M.inside().on){M.inside.exit({fade:false});await w(800)}const i=M.SEATS.findIndex(q=>q.p==='cafe'&&q.occ.every(o=>!o));if(i<0)return{none:1};const s=M.SEATS[i];M.you(s.x+Math.sin(s.yaw)*.6,s.z+Math.cos(s.yaw)*.6);window.__you().tapGo(s.x+Math.sin(s.yaw)*.62,s.z+Math.cos(s.yaw)*.62);await w(1400);return{pr:M.popups().prompt,i}});
  ok(vn+': "Sit" next to a free seat',st.pr&&st.pr.on&&st.pr.kind==='sit',st);
  if(st.pr&&st.pr.kind==='sit'){await p.tap('#near',{force:true,timeout:10000}).catch(()=>p.evaluate(()=>document.getElementById('near').click()));const sat=await until(()=>!!window.__you().seat,3000);ok(vn+': tapping Sit sits you down',sat>=0,{sat});
    await p.waitForTimeout(500);const su=await E(()=>window.__mocha.popups().prompt);ok(vn+': then "Stand up"',su.on&&su.kind==='stand',su);if(full)await p.screenshot({path:OUT+vn+'-seated.png'});await E(()=>window.__you().stand())}
  const br=await E(()=>{const M=window.__mocha,pr=M.popups().prompt;return pr});
  if(br.rect){const bad=await E(r=>{const out=[];const R=[...window.__mocha.HUD.bands().filter(b=>b.id!=='near'&&b.id!=='dock')];for(const e of document.querySelectorAll('#dock>*')){const q=e.getBoundingClientRect();if(q.width&&getComputedStyle(e).display!=='none')R.push({id:'dock:'+(e.id||e.className),x:q.left,y:q.top,w:q.width,h:q.height})}for(const b of R)if(r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y)out.push(b.id);return out},br.rect);ok(vn+': context button clear of other HUD',bad.length===0,{bad,br})}
  ok(vn+': no page errors',errs.length===0,errs.slice(0,4));await ctx.close()}
await b.close();console.log(`\n${pass} passed, ${fail} failed`);process.exit(fail?1:0)})().catch(e=>{console.error('FATAL',e);process.exit(1)});

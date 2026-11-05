// Track redirect: NODE_OPTIONS="--require /tmp/harness/redirect.js" MOCHA_FILE=/tmp/harness/trackA/index.html node test-X.js
// Any page.goto / fs.readFileSync of the main game file is pointed at MOCHA_FILE instead.
const T=process.env.MOCHA_FILE;
if(T){const F='/home/user/Booknest/ghost-town/index.html';
 const fix=u=>typeof u==='string'?u.split(F).join(T):u;
 const wrapPage=p=>{if(!p||p.__rd)return p;p.__rd=1;const g=p.goto.bind(p);p.goto=(u,...a)=>g(fix(u),...a);return p};
 const wrapCtx=c=>{if(!c||c.__rd)return c;c.__rd=1;const np=c.newPage.bind(c);c.newPage=async(...a)=>wrapPage(await np(...a));c.on&&c.on('page',wrapPage);return c};
 const wrapBrowser=b=>{const nc=b.newContext.bind(b);b.newContext=async(...a)=>wrapCtx(await nc(...a));const np=b.newPage.bind(b);b.newPage=async(...a)=>wrapPage(await np(...a));return b};
 const pw=require('playwright');for(const bt of ['chromium','webkit','firefox']){const B=pw[bt];if(!B)continue;const l=B.launch.bind(B);B.launch=async(...a)=>wrapBrowser(await l(...a));const lp=B.launchPersistentContext.bind(B);B.launchPersistentContext=async(...a)=>wrapCtx(await lp(...a))}
 const fs=require('fs');const r=fs.readFileSync;fs.readFileSync=function(p,...a){return r.call(this,p===F?T:p,...a)};
}

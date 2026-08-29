import {connect,sleep} from './cdp.mjs';
// Cold cache via clearBrowserCache, NOT setCacheDisabled: disabling the cache
// also disables the memory cache, which is exactly the mechanism that lets a
// preload satisfy the later <img>. With it off, every preload looks like a
// double download even when production does the right thing.
for (const [w,dpr] of [[390,3],[800,2],[1440,2]]) {
  const {send,on,close}=await connect();
  const sent=[], finished=new Map();
  on(m=>{
    if(m.method==='Network.requestWillBeSent'){const u=m.params.request.url;
      if(/engine-(body|blades)/.test(u)) sent.push({id:m.params.requestId,f:u.split('/').pop()});}
    if(m.method==='Network.loadingFinished') finished.set(m.params.requestId, m.params.encodedDataLength);
  });
  await send('Network.enable'); await send('Page.enable');
  await send('Network.clearBrowserCache');
  await send('Emulation.setDeviceMetricsOverride',{width:w,height:900,deviceScaleFactor:dpr,mobile:w<700});
  await send('Page.navigate',{url:'https://leadsengine.ch/?cb='+Date.now()});
  await sleep(8000);
  const real = sent.filter(s => (finished.get(s.id)||0) > 1000);
  const bytes = real.reduce((a,s)=>a+finished.get(s.id),0);
  const byFile = {};
  real.forEach(s=>{byFile[s.f]=(byFile[s.f]||0)+1;});
  const dup = Object.values(byFile).some(v=>v>1);
  console.log((dup?'  FAIL  ':'  PASS  ')+String(w).padStart(4)+'px dpr'+dpr+
    '   requests seen: '+sent.length+'   ACTUALLY transferred: '+real.length+
    ' ('+(bytes/1024).toFixed(1)+'KB)  '+JSON.stringify(byFile));
  close();
}
process.exit(0);

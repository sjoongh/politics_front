const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, deviceScaleFactor:2 });
  const p = await c.newPage();
  await p.goto('https://koreanpolitical.web.app', { waitUntil:'networkidle' });
  await p.waitForTimeout(3500);
  await p.screenshot({ path:'/tmp/shots/LIVE-mobile.png' });
  // 데스크톱 홈
  const dc = await b.newContext({ viewport:{width:1280,height:900} });
  const dp = await dc.newPage();
  await dp.goto('https://koreanpolitical.web.app', { waitUntil:'networkidle' });
  await dp.waitForTimeout(3500);
  await dp.screenshot({ path:'/tmp/shots/LIVE-desktop.png', fullPage:true });
  await b.close(); console.log('live shots done');
})().catch(e=>{console.error(e);process.exit(1)});

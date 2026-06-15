const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });
  await p.waitForTimeout(3500);
  const input = p.locator('.search-box .form-control, input[type="search"], input[placeholder*="검색"]').first();
  await input.fill('경남도');
  await input.press('Enter');
  await p.waitForTimeout(3000);
  const aiResults = await p.locator('.ai-search').count();
  const fallback = await p.locator('.ai-search__fallback').count();
  const items = await p.locator('.ai-search .news-row').count();
  await p.screenshot({ path: '/tmp/shots/after-aisearch-desktop.png', fullPage: true });
  console.log(JSON.stringify({ aiResults, fallback, items }));
  // mobile
  const mc = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, deviceScaleFactor:2 });
  const mp = await mc.newPage();
  await mp.goto('http://localhost:3000',{waitUntil:'domcontentloaded'}); await mp.waitForTimeout(3500);
  const mi = mp.locator('.search-box .form-control, input[type="search"], input[placeholder*="검색"]').first();
  await mi.fill('경남도'); await mi.press('Enter'); await mp.waitForTimeout(3000);
  await mp.screenshot({ path:'/tmp/shots/after-aisearch-mobile.png' });
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

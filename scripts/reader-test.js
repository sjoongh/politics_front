const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto('http://localhost:5055', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  // 첫 피처드 뉴스 카드 클릭
  await p.locator('.bk-card--featured').first().click();
  await p.waitForTimeout(800);
  const readerOpen = await p.locator('.reader').count();
  const title = await p.locator('.reader__title').first().textContent().catch(()=>null);
  const hasSummaryLabel = await p.locator('.reader__summary-label:has-text("AI 요약")').count();
  const hasDisclaimer = await p.locator('.reader__disclaimer').count();
  const relatedCount = await p.locator('.reader__related-item').count();
  const hasOriginalBtn = await p.locator('.reader__action-main:has-text("원문 보기")').count();
  await p.screenshot({ path: '/tmp/shots/after-reader-desktop.png' });
  console.log(JSON.stringify({ readerOpen, title: (title||'').slice(0,30), hasSummaryLabel, hasDisclaimer, relatedCount, hasOriginalBtn }));
  // 모바일도
  const mc = await b.newContext({ viewport:{width:390,height:844}, isMobile:true, deviceScaleFactor:2 });
  const mp = await mc.newPage();
  await mp.goto('http://localhost:5055',{waitUntil:'networkidle'}); await mp.waitForTimeout(2500);
  await mp.locator('.bk-card--featured, .bk-card--clickable').first().click(); await mp.waitForTimeout(800);
  await mp.screenshot({ path:'/tmp/shots/after-reader-mobile.png' });
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

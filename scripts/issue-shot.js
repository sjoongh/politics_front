const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 1000 }, deviceScaleFactor: 1 });
  const p = await c.newPage();
  await p.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3000);
  await p.locator('.topnav-item:has-text("이슈")').first().click();
  await p.waitForTimeout(1500);
  await p.locator('.issue-card:has-text("추가경정예산")').first().click();
  await p.waitForTimeout(2000);
  const panels = await p.locator('.src-panel').count();
  const items = await p.locator('.src-item').count();
  await p.locator('.bk-modal__panel').screenshot({ path: '/tmp/shots/issue-4pane.png' });
  console.log(JSON.stringify({ panels, items }));
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

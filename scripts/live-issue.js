const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  const p = await c.newPage();
  await p.goto('https://koreanpolitical.web.app', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.locator('.topnav-item:has-text("이슈")').first().click();
  await p.waitForTimeout(1800);
  await p.locator('.issue-card:has-text("항공안전법")').first().click();
  await p.waitForTimeout(2500);
  const votes = await p.locator('.src-panel:has-text("표결") .src-item').count();
  await p.locator('.bk-modal__panel').screenshot({ path: '/tmp/shots/LIVE-issue-4pane.png' });
  console.log(JSON.stringify({ votePanelItems: votes }));
  await b.close();
})().catch(e=>{console.error(e);process.exit(1)});

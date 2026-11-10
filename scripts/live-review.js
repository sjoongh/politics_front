const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  const go = async (tab) => { await p.locator(`.topnav-item:has-text("${tab}")`).first().click(); await p.waitForTimeout(1800); };
  await p.goto('https://koreanpolitical.web.app', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: '/tmp/shots/LR-home.png', fullPage: true });
  await go('이슈'); await p.screenshot({ path: '/tmp/shots/LR-issues.png', fullPage: true });
  await go('의원'); await p.screenshot({ path: '/tmp/shots/LR-members.png', fullPage: true });
  // AI 검색
  const inp = p.locator('input[placeholder*="검색"], .search-box .form-control').first();
  await inp.fill('항공안전법'); await inp.press('Enter'); await p.waitForTimeout(3000);
  await p.screenshot({ path: '/tmp/shots/LR-search.png', fullPage: true });
  await b.close(); console.log('live review shots done');
})().catch(e=>{console.error(e);process.exit(1)});

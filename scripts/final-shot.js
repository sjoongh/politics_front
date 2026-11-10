const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 1000 } });
  const p = await c.newPage();
  await p.goto('https://koreanpolitical.web.app', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.locator('.topnav-item:has-text("이슈")').first().click();
  await p.waitForTimeout(2000);
  await p.screenshot({ path: '/tmp/shots/FINAL-issues.png', fullPage: true });
  const badges = await p.locator('.bk-badge--alert, .bk-badge--muted').count();
  // 정당 패널 있는 이슈 열기(술파티)
  const card = p.locator('.issue-card:has-text("술파티")').first();
  if (await card.count()) { await card.click(); await p.waitForTimeout(2500);
    await p.locator('.bk-modal__panel').screenshot({ path: '/tmp/shots/FINAL-issue-detail.png' });
  }
  const party = await p.locator('.party-stance').count();
  console.log(JSON.stringify({ typeBadges: badges, partyStances: party }));
  await b.close();
})().catch(e=>{console.error(e.message);process.exit(1)});

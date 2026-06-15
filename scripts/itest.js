const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await c.newPage();
  await p.goto('http://localhost:5055', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2000);
  await p.locator('.topnav-item:has-text("의원")').first().click();
  await p.waitForTimeout(1000);
  // 국민의힘 필터
  await p.locator('.topic-chip:has-text("국민의힘")').first().click();
  await p.waitForTimeout(500);
  const cnt1 = await p.locator('.member-card').count();
  // 검색 '강명'
  await p.locator('.list-toolbar__input').fill('강명');
  await p.waitForTimeout(500);
  const cnt2 = await p.locator('.member-card').count();
  // 전과순 정렬 (no crash check)
  await p.locator('.list-toolbar__input').fill('');
  await p.locator('.sort-btn:has-text("전과순")').click();
  await p.waitForTimeout(400);
  await p.screenshot({ path: '/tmp/shots/after-members-filtered.png', fullPage: true });
  console.log('국민의힘 filter count:', cnt1, '| +검색"강명" count:', cnt2);
  await b.close();
})();

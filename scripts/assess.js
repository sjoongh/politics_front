const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 1280, height: 1100 } });
  const p = await c.newPage();
  await p.goto('https://koreanpolitical.web.app', { waitUntil: 'networkidle' });
  await p.waitForTimeout(3500);
  await p.screenshot({ path: '/tmp/shots/ASSESS-home.png', fullPage: true });
  await p.locator('.topnav-item:has-text("의원")').first().click(); await p.waitForTimeout(2000);
  // 의원 1명 상세
  const m = p.locator('.member-card').first();
  if (await m.count()) { await m.click(); await p.waitForTimeout(2000);
    await p.locator('.bk-modal__panel').screenshot({ path: '/tmp/shots/ASSESS-member.png' }).catch(()=>{}); }
  await b.close(); console.log('done');
})().catch(e=>{console.error(e.message);process.exit(1)});

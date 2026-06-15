const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const c = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, deviceScaleFactor: 2 });
  const p = await c.newPage();
  await p.goto('http://localhost:5055', { waitUntil: 'networkidle' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: '/tmp/shots/after-mobile-fold.png' });
  await b.close(); console.log('ok');
})();

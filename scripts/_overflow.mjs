// 가로 오버플로 측정: 390/768/1280 + 390@zoom2. scrollWidth-clientWidth가 0이 아니면 exit 1.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5055';
const ISSUE = process.env.SHOT_ISSUE || '609c190844a5417c87695945e7bef25e';
const ROUTES = ['/', '/issues', `/issues/${ISSUE}`, '/members', '/search'];
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h, zoom] of [[390, 844, 1], [768, 1024, 1], [1280, 900, 1], [390, 844, 2]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      if (zoom !== 1) await p.evaluate((z) => { document.body.style.zoom = String(z); }, zoom);
      await p.waitForTimeout(800);
      const over = await p.evaluate(() => document.scrollingElement.scrollWidth - document.scrollingElement.clientWidth);
      if (over > 0) bad += 1;
      console.log(`${w}px zoom${zoom} ${r} overflow=${over}px ${over > 0 ? 'FAIL' : 'ok'}`);
    }
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

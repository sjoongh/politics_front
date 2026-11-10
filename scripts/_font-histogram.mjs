// 렌더링 폰트 크기 분포: 허용 집합 {12,13,14,15,17,20,24} 밖 또는 12 미만이 있으면 exit 1. 사용: node scripts/_font-histogram.mjs [base]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5055';
const ISSUE = process.env.SHOT_ISSUE || '609c190844a5417c87695945e7bef25e';
const ROUTES = ['/', '/issues', `/issues/${ISSUE}`, '/members', '/search'];
const ALLOWED = new Set([12, 13, 14, 15, 17, 20, 24]);
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h] of [[390, 844], [1280, 900]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    for (const r of ROUTES) {
      await p.goto(BASE + r, { waitUntil: 'networkidle' });
      await p.waitForTimeout(1200);
      const hist = await p.evaluate(() => {
        const out = {};
        for (const el of document.querySelectorAll('body *')) {
          if (!el.childNodes || ![...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') continue;
          const fs = Math.round(parseFloat(cs.fontSize) * 10) / 10;
          out[fs] = (out[fs] || 0) + 1;
        }
        return out;
      });
      const offenders = Object.entries(hist).filter(([fs]) => !ALLOWED.has(Number(fs)));
      bad += offenders.length;
      console.log(`${w}px ${r}`, JSON.stringify(hist), offenders.length ? `OUT-OF-SCALE: ${offenders.map(([f, n]) => `${f}px×${n}`).join(', ')}` : 'ok');
    }
    await p.close();
  }
  await b.close();
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

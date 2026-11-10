// 스크린샷 매트릭스: 라우트 × 뷰포트(모바일 390, 데스크톱 1280) × 테마(라이트/다크). 사용: node scripts/shots-v2.mjs [base] [routes,comma]
import { createRequire } from 'module';
import fs from 'fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5056';
const ISSUE = process.env.SHOT_ISSUE || '609c190844a5417c87695945e7bef25e';
const MEMBER = process.env.SHOT_MEMBER || '04T3751T';
const ALL = ['/', '/issues', `/issues/${ISSUE}`, '/members', `/members/${MEMBER}`, '/search', '/search?q=추경'];
const ROUTES = process.argv[3] ? process.argv[3].split(',') : ALL;
const OUT = process.env.SHOT_OUT || '/tmp/shots';
fs.mkdirSync(OUT, { recursive: true });
const name = (r) => r.replace(/[^a-zA-Z0-9가-힣]+/g, '_').replace(/^_|_$/g, '') || 'home';
(async () => {
  const b = await chromium.launch();
  for (const theme of ['light', 'dark']) {
    for (const [vp, w, h] of [['m', 390, 844], ['d', 1280, 900]]) {
      const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
      await ctx.addInitScript((t) => { localStorage.setItem('bk-theme', t); }, theme);
      const p = await ctx.newPage();
      for (const r of ROUTES) {
        await p.goto(BASE + r, { waitUntil: 'networkidle' });
        await p.waitForTimeout(1200);
        const file = `${OUT}/v2-${name(r)}-${vp}-${theme}.png`;
        await p.screenshot({ path: file, fullPage: vp === 'm' ? false : true });
        console.log('shot', file);
      }
      await ctx.close();
    }
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });

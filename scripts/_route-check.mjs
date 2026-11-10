// 라우트·딥링크 회귀 확인(Playwright). 사용: node scripts/_route-check.mjs [base=http://localhost:5055]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5055';
const ISSUE = process.env.CHECK_ISSUE || '609c190844a5417c87695945e7bef25e';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${info}`); };
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await p.goto(`${BASE}/?issue=${ISSUE}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  check('legacy ?issue= redirects to /issues/:id', p.url().endsWith(`/issues/${ISSUE}`), p.url());
  const idx = await p.evaluate(() => (window.history.state && window.history.state.idx) || 0);
  check('redirect used replace (history idx 0)', idx === 0, `idx=${idx}`);
  await p.goto(`${BASE}/?article=x`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(500);
  check('legacy ?article= lands on /', new URL(p.url()).pathname === '/', p.url());
  await p.goto(`${BASE}/nope`, { waitUntil: 'networkidle' });
  check('unknown path → /', new URL(p.url()).pathname === '/', p.url());
  await b.close();
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

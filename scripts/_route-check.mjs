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
  await p.goto(`${BASE}/issues/${ISSUE}`, { waitUntil: 'networkidle' });
  await p.waitForTimeout(1500);
  const back = p.locator('.detail__back');
  if (await back.count()) { await back.first().click(); await p.waitForTimeout(500); }
  check('detail back button returns to /issues', new URL(p.url()).pathname === '/issues', p.url());
  // 키보드: 목록 행 Enter → 상세 → 닫기 → 포커스가 같은 행으로 복귀
  const d = await b.newPage({ viewport: { width: 1280, height: 900 } });
  await d.goto(`${BASE}/issues`, { waitUntil: 'networkidle' });
  await d.waitForTimeout(1500);
  const first = d.locator('.issue-row').first();
  const firstId = await first.getAttribute('data-issue-id');
  await first.focus();
  await d.keyboard.press('Enter');
  await d.waitForTimeout(1200);
  check('Enter on row opens detail', new URL(d.url()).pathname === `/issues/${firstId}`, d.url());
  await d.locator('.detail__back').first().click();
  await d.waitForTimeout(600);
  const focusedId = await d.evaluate(() => document.activeElement && document.activeElement.dataset && document.activeElement.dataset.issueId);
  check('focus returns to the same row after close', focusedId === firstId, `focused=${focusedId}`);
  await d.close();
  await p.goto(`${BASE}/nope`, { waitUntil: 'networkidle' });
  check('unknown path → /', new URL(p.url()).pathname === '/', p.url());
  await b.close();
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

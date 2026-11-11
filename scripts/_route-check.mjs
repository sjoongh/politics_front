// 라우트·딥링크 회귀 확인(Playwright). 사용: node scripts/_route-check.mjs [base=http://localhost:5055]
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5056';
const ISSUE = process.env.CHECK_ISSUE || '609c190844a5417c87695945e7bef25e';
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${info}`); };
// 라이브 백엔드 상태(쿼터·CORS)와 무관하게 결정적으로 돌도록 이슈 API를 고정 데이터로 가로챈다.
const FIX = [
  { id: ISSUE, title: '추가경정예산안 처리', summary: '요약 A', status: '가결', category: '정책', updated_at: '2026-11-10' },
  { id: 'fx2', title: '두 번째 이슈', summary: '요약 B', status: '진행중', category: '정치', updated_at: '2026-11-09' },
  { id: 'fx3', title: '세 번째 이슈', summary: '요약 C', status: '진행중', category: '정치', updated_at: '2026-11-08' },
];
async function mockApi(page) {
  await page.route((u) => u.pathname === '/api/issues', (route) => route.fulfill({ status: 200, contentType: 'application/json',
    body: JSON.stringify({ success: true, data: { items: FIX, next_cursor: null } }) }));
  await page.route((u) => /^\/api\/issues\/[^/]+$/.test(u.pathname), (route) => {
    const id = decodeURIComponent(route.request().url().split('/api/issues/')[1].split('?')[0]);
    const base = FIX.find((f) => f.id === id) || FIX[0];
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { ...base, id: base.id, events: [], articles: [], article_total: 0,
      source_panels: { government: [], assembly_bill: [], assembly_vote: [], party: [] }, perspectives: { breakdown: { counts: {}, total: 0 }, groups: {} } } }) });
  });
  await page.route((u) => u.pathname === '/api/today', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true, data: { edition: null, other_issues: [] } }) }));
  await page.route((u) => u.pathname === '/api/sources', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, message: 'down' }) }));
}
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  await mockApi(p);
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
  await mockApi(d);
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
  // 데스크톱 분할: 두 번째 행 선택 시 URL과 제목이 두 번째 이슈로 바뀌어야 한다(C1)
  await d.goto(`${BASE}/issues`, { waitUntil: 'networkidle' });
  await d.waitForTimeout(1200);
  const rows = d.locator('.issue-row');
  const secondId = await rows.nth(1).getAttribute('data-issue-id');
  await rows.nth(0).click(); await d.waitForTimeout(1500);
  await rows.nth(1).click(); await d.waitForTimeout(2500);
  const titleOfSecond = (await rows.nth(1).locator('.issue-row__title').innerText()).trim();
  const detailTitle = (await d.locator('.detail__title').first().innerText().catch(() => '')).trim();
  check('second row selection stays on second issue', new URL(d.url()).pathname === `/issues/${secondId}` && detailTitle === titleOfSecond, `${d.url()} detail="${detailTitle}"`);
  // 폰트: Pretendard가 실제 적용돼야 한다(I1)
  const ff = await d.evaluate(() => getComputedStyle(document.querySelector('.issue-row__title') || document.body).fontFamily);
  check('Pretendard applied', /Pretendard/i.test(ff), ff);
  // 아웃라인 버튼 테두리(I2)
  await d.goto(`${BASE}/search`, { waitUntil: 'networkidle' }); await d.waitForTimeout(1500);
  const bw = await d.evaluate(() => { const b = document.querySelector('.btn--outline'); return b ? getComputedStyle(b).borderTopWidth : 'no-button'; });
  check('outline button keeps its border', bw !== 'none' && bw !== '0px', `border=${bw}`);
  // 모바일: 상세 뒤로 버튼은 이력을 늘리지 않는다(I3)
  await p.goto(`${BASE}/issues`, { waitUntil: 'networkidle' }); await p.waitForTimeout(1200);
  await p.locator('.issue-row').first().click(); await p.waitForTimeout(1200);
  const idxBefore = await p.evaluate(() => (window.history.state && window.history.state.idx) || 0);
  await p.locator('.detail__back').first().click(); await p.waitForTimeout(600);
  const idxAfter = await p.evaluate(() => (window.history.state && window.history.state.idx) || 0);
  check('detail back does not grow history', idxAfter < idxBefore, `idx ${idxBefore} → ${idxAfter}`);
  await d.close();
  await p.goto(`${BASE}/nope`, { waitUntil: 'networkidle' });
  check('unknown path → /', new URL(p.url()).pathname === '/', p.url());
  await b.close();
  const failed = results.filter((r) => !r.ok).length;
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });

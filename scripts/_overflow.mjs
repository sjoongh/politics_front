// 가로 오버플로 측정: 390/768/1280 + 390@zoom2. scrollWidth-clientWidth가 0이 아니면 exit 1.
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const BASE = process.argv[2] || 'http://localhost:5056';
const ISSUE = process.env.SHOT_ISSUE || '609c190844a5417c87695945e7bef25e';
const ROUTES = ['/', '/issues', `/issues/${ISSUE}`, '/members', '/search'];
(async () => {
  const b = await chromium.launch();
  let bad = 0;
  for (const [w, h, zoom] of [[390, 844, 1], [768, 1024, 1], [1280, 900, 1], [390, 844, 2]]) {
    const p = await b.newPage({ viewport: { width: w, height: h } });
    // 입장 칩·표결 수치가 실제로 그려지도록 v2 목록 응답을 고정 데이터로 바꾼다(Review Focus 5)
    await p.route((u) => u.pathname === '/api/issues' && u.searchParams.get('v') === '2', (route) => route.fulfill({
      status: 200, contentType: 'application/json',
      body: JSON.stringify({ success: true, data: { items: [{ id: 'fx1', title: '기후위기 적응 및 회복력 강화에 관한 법률안 처리', summary: '요약', status: '가결', category: '환경', updated_at: '2026-11-10',
        digest: { counts: { gov: 12, bill: 3, vote: 1, media: 1234 }, vote: { yes: 193, no: 40, abstain: 6, result: '가결' }, last_activity_at: '2026-11-10T00:00:00Z',
          stance: [{ actor: '더불어민주당', position: { yes: 160, no: 0, abstain: 1 }, basis: 'vote' }, { actor: '기후에너지환경부', position: 'explain', basis: 'official' }, { actor: '국민의힘', position: { yes: 80, no: 20, abstain: 3 }, basis: 'vote' }] } }], next_cursor: null } }),
    }));
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

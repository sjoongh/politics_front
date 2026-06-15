// Playwright 스크린샷: after 캡처용. 로컬 serve(http://localhost:5055) 대상.
const { chromium } = require('playwright');

const BASE = process.env.SHOT_BASE || 'http://localhost:5055';
const OUT = process.env.SHOT_OUT || '/tmp/shots';

const tabs = [
  { id: 'news', name: '00-home' },
  { id: 'issues', name: '01-issues' },
  { id: 'members', name: '02-members' },
];

async function clickTab(page, label) {
  // topnav 버튼 텍스트로 클릭
  const btn = page.locator(`.topnav-item:has-text("${label}")`).first();
  if (await btn.count()) { await btn.click(); await page.waitForTimeout(1200); }
}

(async () => {
  const browser = await chromium.launch();
  // Desktop
  const dctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const dpage = await dctx.newPage();
  await dpage.goto(BASE, { waitUntil: 'networkidle' });
  await dpage.waitForTimeout(2500);
  await dpage.screenshot({ path: `${OUT}/after-desktop-00-home.png`, fullPage: true });
  await clickTab(dpage, '이슈');
  await dpage.screenshot({ path: `${OUT}/after-desktop-01-issues.png`, fullPage: true });
  await clickTab(dpage, '의원');
  await dpage.screenshot({ path: `${OUT}/after-desktop-02-members.png`, fullPage: true });
  await dctx.close();

  // Mobile
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true });
  const mpage = await mctx.newPage();
  await mpage.goto(BASE, { waitUntil: 'networkidle' });
  await mpage.waitForTimeout(2500);
  await mpage.screenshot({ path: `${OUT}/after-mobile-00-home.png`, fullPage: true });
  // 모바일은 하단탭
  const issuesTab = mpage.locator('.bottomnav-item:has-text("이슈")').first();
  if (await issuesTab.count()) { await issuesTab.click(); await mpage.waitForTimeout(1200); }
  await mpage.screenshot({ path: `${OUT}/after-mobile-01-issues.png`, fullPage: true });
  const memTab = mpage.locator('.bottomnav-item:has-text("의원")').first();
  if (await memTab.count()) { await memTab.click(); await mpage.waitForTimeout(1200); }
  await mpage.screenshot({ path: `${OUT}/after-mobile-02-members.png`, fullPage: true });
  await mctx.close();

  await browser.close();
  console.log('shots done ->', OUT);
})().catch((e) => { console.error(e); process.exit(1); });

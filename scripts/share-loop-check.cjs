// npm run build && node scripts/share-loop-check.cjs
// 격리 브라우저 + 합성 API. 운영 API/Analytics/메신저로 요청을 보내지 않는다.
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const http = require('node:http');
const { execFileSync } = require('node:child_process');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const backend = path.resolve(root, '../politics_backend');
const issue = { id: 'share-issue', title: '공유 검증 이슈', summary: '합성 검증 자료', articles: [] };
const article = { id: 'share-article', title: '공유 검증 기사', summary: '합성 검증 자료', source: '검증 매체', source_url: 'https://example.invalid/original' };
const mime = { '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.html': 'text/html', '.json': 'application/json', '.woff2': 'font/woff2' };

(async () => {
  let browser;
  let sharePages = {};
  const server = http.createServer(async (req, res) => {
    try {
      const pathname = new URL(req.url, 'http://localhost').pathname;
      if (sharePages[pathname]) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(sharePages[pathname]);
      }
      const relative = pathname.replace(/^\/+/, '');
      const filename = path.resolve(root, 'build', relative);
      if (!filename.startsWith(path.join(root, 'build') + path.sep) && relative) {
        res.writeHead(403); return res.end();
      }
      const hasExtension = !!path.extname(pathname);
      const body = await fs.readFile(hasExtension ? filename : path.join(root, 'build/index.html'));
      res.writeHead(200, { 'Content-Type': mime[path.extname(pathname)] || 'text/html' });
      res.end(body);
    } catch (_) { res.writeHead(404); res.end(); }
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    // 실제 백엔드 라우트의 HTML을 사용하되 Firestore 조회만 합성 데이터로 대체한다.
    sharePages = JSON.parse(execFileSync(path.join(backend, '.venv/bin/python'), ['-c', `
import json,sys
from fastapi import FastAPI
from fastapi.testclient import TestClient
import routers.share_router as sr
sr.WEB_APP_URL=sys.argv[1]
sr.SHARE_BASE_URL=sys.argv[1]
sr._fetch_issue_meta=lambda i: None if i=='deleted' else {'title':'공유 검증 이슈','description':'합성 검증 자료'}
sr._fetch_article_meta=lambda i: None if i=='deleted' else {'title':'공유 검증 기사','description':'합성 검증 자료'}
app=FastAPI(); app.include_router(sr.router); client=TestClient(app)
paths=['/share/issue/share-issue','/share/article/share-article','/share/article/deleted']
print(json.dumps({p:client.get(p).text for p in paths}))
`, base], { cwd: backend, encoding: 'utf8' }));
    browser = await chromium.launch();
    for (const width of [390, 1280]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      let failArticle = false;
      let missingArticle = false;
      let releaseArticle = null;
      let articleGate = null;
      let requests = 0;
      await context.addInitScript(() => {
        window.__shared = [];
        Object.defineProperty(navigator, 'share', { configurable: true, value: async (data) => { window.__shared.push(data); } });
      });
      await context.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.origin === base) return route.continue();
        if (!url.pathname.startsWith('/api/')) return route.abort();
        let data = {};
        let status = 200;
        if (url.pathname === '/api/news/share-article') {
          requests += 1;
          if (articleGate) await articleGate;
          status = failArticle ? 503 : 200;
          data = missingArticle ? {} : { article };
        } else if (url.pathname === '/api/issues/share-issue') data = issue;
        else if (url.pathname === '/api/issues') data = { items: [issue], next_cursor: null };
        else if (url.pathname === '/api/today') data = { edition: null, other_issues: [] };
        else if (url.pathname === '/api/members') data = { members: [] };
        else if (url.pathname.endsWith('/articles')) data = { items: [], total: 0 };
        return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ success: status === 200, data }) });
      });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', (e) => errors.push(e.message));

      await page.goto(`${base}/share/article/share-article`);
      await page.locator('.reader__title').waitFor();
      assert.equal(await page.locator('.reader__title').textContent(), article.title);
      await page.getByRole('button', { name: '공유', exact: true }).click();
      const shared = await page.evaluate(() => window.__shared[0]);
      assert.equal(shared.url, 'https://politicsbackend-ruby.vercel.app/share/article/share-article');
      assert.notEqual(shared.url, article.source_url);
      console.log(`PASS ${width}: article share HTML → reader → service share URL`);

      failArticle = true;
      await page.goto(`${base}/share/article/share-article`);
      await page.getByRole('alert').filter({ hasText: '공유된 기사를 불러오지 못했습니다.' }).waitFor();
      await page.screenshot({ path: `/tmp/share-loop-error-${width}.png` });
      const beforeRetry = requests;
      failArticle = false;
      await page.getByRole('button', { name: '다시 시도', exact: true }).click();
      await page.locator('.reader__title').waitFor();
      assert.equal(requests, beforeRetry + 1);
      assert.equal(await page.getByRole('alert').count(), 0);
      console.log(`PASS ${width}: failed article → visible error → retry → reader`);

      missingArticle = true;
      await page.goto(`${base}/share/article/share-article`);
      await page.getByRole('alert').filter({ hasText: '공유된 기사를 찾을 수 없습니다.' }).waitFor();
      missingArticle = false;
      console.log(`PASS ${width}: missing article response shows explicit error`);

      articleGate = new Promise((resolve) => { releaseArticle = resolve; });
      await page.goto(`${base}/share/article/share-article`);
      await page.getByRole('status', { name: '공유된 기사 불러오는 중' }).waitFor();
      await page.getByRole('link', { name: '이슈', exact: true }).first().click();
      await page.waitForURL('**/issues');
      await page.getByRole('status', { name: '공유된 기사 불러오는 중' }).waitFor({ state: 'hidden' });
      const response = page.waitForResponse((r) => new URL(r.url()).pathname === '/api/news/share-article');
      releaseArticle();
      await response;
      await page.waitForTimeout(150);
      assert.equal(await page.locator('.reader').count(), 0);
      articleGate = null;
      console.log(`PASS ${width}: delayed article does not open after navigation`);

      await page.goto(`${base}/share/issue/share-issue`);
      await page.waitForURL('**/issues/share-issue');
      await page.locator('.detail__action').click();
      assert.equal(await page.evaluate(() => window.__shared[0].url), 'https://politicsbackend-ruby.vercel.app/share/issue/share-issue');
      console.log(`PASS ${width}: issue share HTML → detail → service share URL`);

      await page.goto(`${base}/share/article/deleted`);
      await page.waitForURL(base + '/');
      assert.equal(await page.locator('.reader').count(), 0);
      assert.deepEqual(errors, []);
      console.log(`PASS ${width}: deleted share returns home; no browser runtime errors`);
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise((resolve) => server.close(resolve));
  }
})().catch((e) => { console.error(e); process.exitCode = 1; });

import { canonicalKey, withSnapshots, SNAPSHOT_FILES } from './snapshot';

const H = 3600 * 1000;
const NOW = Date.parse('2026-11-11T03:00:00Z'); // KST 12:00

function snapFile(request, generatedAt, data = { items: ['snap'] }) {
  return { request, generated_at: new Date(generatedAt).toISOString(), body: { success: true, message: '', data } };
}

function fakeFetch(map) {
  const calls = [];
  const impl = async (url) => {
    calls.push(url);
    const file = Object.keys(map).find((f) => url.includes(`/${f}`));
    if (!file || map[file] === 'fail') throw new Error('network');
    return { ok: true, json: async () => map[file] };
  };
  impl.calls = calls;
  return impl;
}

function fakeAdapter(result) {
  const calls = [];
  const impl = async (config) => {
    calls.push(config);
    if (result instanceof Error) throw result;
    return { data: result, status: 200, statusText: 'OK', headers: {}, config };
  };
  impl.calls = calls;
  return impl;
}

const issuesKey = '/api/issues?limit=30&sort=rank&v=2';
const cfg = (url, params) => ({ method: 'get', url, params, baseURL: 'https://api.example' });

test('canonical keys match the backend snapshot plan', () => {
  expect(canonicalKey(cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }))).toBe(issuesKey);
  expect(canonicalKey(cfg('/api/today', {}))).toBe('/api/today');
  expect(canonicalKey(cfg('https://api.example/api/members', { limit: 400 }))).toBe('/api/members?limit=400');
  expect(canonicalKey(cfg('/api/issues?limit=200', undefined))).toBe('/api/issues?limit=200');
  expect(canonicalKey(cfg('/api/issues', { limit: 30, sort: 'rank', v: 2, cursor: null }))).toBe(issuesKey);
  expect(Object.keys(SNAPSHOT_FILES).sort()).toEqual([
    '/api/issues?limit=200', '/api/issues?limit=30&sort=rank&v=2', '/api/issues?limit=50&sort=rank&v=2',
    '/api/members?limit=400', '/api/today',
  ]);
});

test('fresh snapshot is served without calling the API', async () => {
  const fetchImpl = fakeFetch({ 'issues-rank-30.json': snapFile(issuesKey, NOW - 1 * H) });
  const api = fakeAdapter({ success: true, data: { items: ['api'] } });
  const res = await withSnapshots(api, { fetchImpl, now: () => NOW })(cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }));
  expect(res.data.data.items).toEqual(['snap']);
  expect(res.status).toBe(200);
  expect(api.calls).toHaveLength(0);
});

test('stale snapshot defers to the API, and is the fallback when the API fails', async () => {
  const stale = snapFile(issuesKey, NOW - 5 * H);
  const ok = fakeAdapter({ success: true, data: { items: ['api'] } });
  const r1 = await withSnapshots(ok, { fetchImpl: fakeFetch({ 'issues-rank-30.json': stale }), now: () => NOW })(
    cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }));
  expect(r1.data.data.items).toEqual(['api']);

  const down = fakeAdapter(new Error('500 quota'));
  const r2 = await withSnapshots(down, { fetchImpl: fakeFetch({ 'issues-rank-30.json': stale }), now: () => NOW })(
    cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }));
  expect(r2.data.data.items).toEqual(['snap']);
});

test('API error propagates when there is no usable snapshot', async () => {
  const down = fakeAdapter(new Error('500 quota'));
  const adapter = withSnapshots(down, { fetchImpl: fakeFetch({ 'issues-rank-30.json': 'fail' }), now: () => NOW });
  await expect(adapter(cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }))).rejects.toThrow('500 quota');
  const ancient = snapFile(issuesKey, NOW - 8 * 24 * H);
  const adapter2 = withSnapshots(down, { fetchImpl: fakeFetch({ 'issues-rank-30.json': ancient }), now: () => NOW });
  await expect(adapter2(cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }))).rejects.toThrow('500 quota');
});

test('snapshot whose request does not match the key is ignored', async () => {
  const wrong = snapFile('/api/issues?limit=50&sort=rank&v=2', NOW - 1 * H);
  const api = fakeAdapter({ success: true, data: { items: ['api'] } });
  const res = await withSnapshots(api, { fetchImpl: fakeFetch({ 'issues-rank-30.json': wrong }), now: () => NOW })(
    cfg('/api/issues', { v: 2, sort: 'rank', limit: 30 }));
  expect(res.data.data.items).toEqual(['api']);
});

test("today's snapshot from a previous KST day is not served as today", async () => {
  // 생성 KST 11-10 23:30, 지금 KST 11-11 00:30 → 1시간 전이지만 날짜가 바뀜
  const now = Date.parse('2026-11-10T15:30:00Z');
  const prevDay = snapFile('/api/today', Date.parse('2026-11-10T14:30:00Z'));
  const api = fakeAdapter({ success: true, data: { edition: { date: '2026-11-11' } } });
  const res = await withSnapshots(api, { fetchImpl: fakeFetch({ 'today.json': prevDay }), now: () => now })(cfg('/api/today', {}));
  expect(res.data.data.edition.date).toBe('2026-11-11');
});

test('non-snapshot requests and non-GETs go straight to the API', async () => {
  const fetchImpl = fakeFetch({});
  const api = fakeAdapter({ success: true, data: {} });
  const adapter = withSnapshots(api, { fetchImpl, now: () => NOW });
  await adapter(cfg('/api/issues', { v: 2, sort: 'rank', limit: 30, cursor: 'abc' }));
  await adapter({ method: 'post', url: '/api/today', data: '{}' });
  await adapter(cfg('/api/news/foryou', {}));
  expect(fetchImpl.calls).toHaveLength(0);
  expect(api.calls).toHaveLength(3);
});

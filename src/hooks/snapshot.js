// 공개 GET 정적 스냅샷 어댑터.
// 백엔드 수집이 끝날 때마다 GitHub Pages에 올리는 JSON(politics_backend utils/snapshot_plan.py)을 먼저 읽어
// Firestore 읽기 없이 화면을 채운다. 오래됐으면 API를 부르고, API가 실패하면 오래된 스냅샷이라도 보여 준다.
// 파일 모양: { request, generated_at, body: <API 응답 본문 그대로> }

export const SNAPSHOT_BASE = process.env.REACT_APP_SNAPSHOT_BASE
  || 'https://sjoongh.github.io/politics_backend/v1';

// 키는 백엔드 canonical_key와 같아야 한다(경로 + 정렬된 쿼리).
export const SNAPSHOT_FILES = {
  '/api/today': 'today.json',
  '/api/issues?limit=30&sort=rank&v=2': 'issues-rank-30.json',
  '/api/issues?limit=50&sort=rank&v=2': 'issues-rank-50.json',
  '/api/issues?limit=200': 'issues-catalog-200.json',
  '/api/members?limit=400': 'members-400.json',
};

const HOUR = 3600 * 1000;
const FRESH_MS = 3 * HOUR;        // 기본: 수집은 매시(누락 감안 3시간)
const FRESH_MIN_MS = 1 * HOUR;
const FRESH_MAX_MS = 26 * HOUR;   // 파일이 말하는 신선 기간의 상한(의원 목록은 하루 1회 갱신)
const STALE_MAX_MS = 7 * 24 * HOUR; // API가 죽었을 때 보여 줄 수 있는 최대 나이
const FETCH_TIMEOUT_MS = 4000;

function kstDate(ms) {
  return new Date(ms + 9 * HOUR).toISOString().slice(0, 10);
}

export function canonicalKey(config) {
  const raw = String(config.url || '').replace(/^https?:\/\/[^/]+/i, '');
  const [path, query = ''] = raw.split('?');
  const pairs = [];
  new URLSearchParams(query).forEach((v, k) => pairs.push([k, v]));
  Object.entries(config.params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null) pairs.push([k, String(v)]);
  });
  pairs.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  const qs = new URLSearchParams(pairs).toString();
  return qs ? `${path}?${qs}` : path;
}

async function loadSnapshot(file, key, fetchImpl) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS) : null;
  try {
    const res = await fetchImpl(`${SNAPSHOT_BASE}/${file}`, ctrl ? { signal: ctrl.signal } : undefined);
    if (!res || !res.ok) return null;
    const json = await res.json();
    const at = Date.parse(json && json.generated_at);
    if (!json || json.request !== key || Number.isNaN(at) || !json.body || json.body.success !== true) return null;
    return { ...json, at };
  } catch (e) {
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function freshWindow(snap) {
  const s = Number(snap.fresh_for_s);
  if (!Number.isFinite(s) || s <= 0) return FRESH_MS;
  return Math.min(FRESH_MAX_MS, Math.max(FRESH_MIN_MS, s * 1000));
}

function isFresh(snap, key, now) {
  if (now - snap.at > freshWindow(snap)) return false;
  // '오늘 판'은 KST 날짜가 바뀌면 어제 것이 되므로 날짜가 같을 때만 신선하다
  if (key === '/api/today' && kstDate(snap.at) !== kstDate(now)) return false;
  return true;
}

function toResponse(snap, config, stale) {
  return {
    data: snap.body,
    status: 200,
    statusText: 'OK',
    headers: { 'x-snapshot-generated-at': snap.generated_at, 'x-snapshot-stale': stale ? '1' : '0' },
    config,
    request: {},
  };
}

export function withSnapshots(defaultAdapter, { fetchImpl, now = () => Date.now() } = {}) {
  const doFetch = fetchImpl || ((...a) => fetch(...a));
  return async function snapshotAdapter(config) {
    const isGet = (config.method || 'get').toLowerCase() === 'get';
    const key = isGet ? canonicalKey(config) : null;
    const file = key && SNAPSHOT_FILES[key];
    if (!file) return defaultAdapter(config);

    const snap = await loadSnapshot(file, key, doFetch);
    const t = now();
    if (snap && isFresh(snap, key, t)) return toResponse(snap, config, false);
    try {
      return await defaultAdapter(config);
    } catch (err) {
      if (snap && t - snap.at <= STALE_MAX_MS) return toResponse(snap, config, true);
      throw err;
    }
  };
}

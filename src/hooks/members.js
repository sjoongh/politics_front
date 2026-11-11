import api from './api';

const CACHE_MS = 5 * 60 * 1000;
const cache = new Map();   // key → { at, promise }

/** 전체 의원(300명). 5분 모듈 캐시 — 상세·검색·목록이 탭마다 다시 받지 않게. */
export async function getMembers(party = null) {
  const key = party || '*';
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.promise;
  const params = { limit: 400 };   // 백엔드 기본 20건 → 전체(300명)
  if (party) params.party = party;
  const promise = api.get('/api/members', { params }).then((res) => res.data.data?.members || []);
  cache.set(key, { at: Date.now(), promise });
  promise.catch(() => cache.delete(key));
  return promise;
}

export async function getMemberDetail(id) {
  const res = await api.get(`/api/members/${id}`);
  return res.data.data?.member;
}

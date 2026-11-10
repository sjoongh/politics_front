import api from './api';
import { normalizePage, normalizeIssue } from './issueShape';

/** 구 호출(배열). 검색 카탈로그 등에서 첫 200건을 쓴다. */
export async function getIssues(status = null, limit = 200) {
  const params = { limit };
  if (status) params.status = status;
  const res = await api.get('/api/issues', { params });
  return normalizePage(res.data.data).items;
}

/** v2: 서버 정렬(rank|updated|media)·단일 필터·커서. 구 서버가 배열을 주면 정규화한다. */
export async function getIssuesPage({ sort = 'rank', filter = null, cursor = null, limit = 50 } = {}) {
  const params = { v: 2, sort, limit };
  if (filter) params.filter = filter;
  if (cursor) params.cursor = cursor;
  const res = await api.get('/api/issues', { params });
  return normalizePage(res.data.data);
}

export async function getIssueDetail(id) {
  const res = await api.get(`/api/issues/${encodeURIComponent(id)}`);
  return normalizeIssue(res.data.data);
}

export async function getIssueArticles(id, cursor = null, limit = 30) {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get(`/api/issues/${encodeURIComponent(id)}/articles`, { params });
  const d = res.data.data || {};
  return { items: d.items || [], nextCursor: d.next_cursor || null, total: d.total || 0 };
}

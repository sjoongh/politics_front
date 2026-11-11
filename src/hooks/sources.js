import api from './api';

/** 공개 소스 목록(법안·표결·정부 발표 둘러보기). type: assembly_vote|assembly_bill|gov_policy */
export async function getSources({ type, cursor = null, limit = 30 }) {
  const params = { type, limit };
  if (cursor) params.cursor = cursor;
  const res = await api.get('/api/sources', { params });
  const d = res.data.data || {};
  return { items: d.items || [], nextCursor: d.next_cursor || null };
}

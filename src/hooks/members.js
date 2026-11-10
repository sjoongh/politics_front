import api from './api';

export async function getMembers(party = null) {
  const params = { limit: 400 };   // 백엔드 기본 20건 → 전체(300명)
  if (party) params.party = party;
  const res = await api.get('/api/members', { params });
  return res.data.data?.members || [];
}

export async function getMemberDetail(id) {
  const res = await api.get(`/api/members/${id}`);
  return res.data.data?.member;
}

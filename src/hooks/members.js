import api from './api';

export async function getMembers(party = null) {
  const params = {};
  if (party) params.party = party;
  const res = await api.get('/api/members', { params });
  return res.data.data?.members || [];
}

export async function getMemberDetail(id) {
  const res = await api.get(`/api/members/${id}`);
  return res.data.data?.member;
}

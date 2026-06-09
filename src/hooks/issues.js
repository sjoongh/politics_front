import api from './api';

export async function getIssues(status = null) {
  const params = {};
  if (status) params.status = status;
  const res = await api.get('/api/issues', { params });
  return res.data.data || [];
}

export async function getIssueDetail(id) {
  const res = await api.get(`/api/issues/${id}`);
  return res.data.data;
}

import api from './api';

export async function getDailySummary(date = null) {
  const params = {};
  if (date) params.date = date;
  const res = await api.get('/api/summaries/daily', { params });
  return res.data.data?.summary || null;
}

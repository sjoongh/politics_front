import api from './api';

export async function getDigest(interests = []) {
  const params = { interests: interests.join(','), limit: 30 };
  const res = await api.get('/api/news/digest', { params });
  return res.data.data?.articles || [];
}

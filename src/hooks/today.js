import api from './api';
import { normalizeIssue } from './issueShape';

/** 날짜별 판. date 없으면 KST 오늘. 판이 없으면 edition=null. */
export async function getToday(date = null) {
  const res = await api.get('/api/today', { params: date ? { date } : {} });
  const d = res.data.data || {};
  return { edition: d.edition || null, otherIssues: (d.other_issues || []).map(normalizeIssue) };
}

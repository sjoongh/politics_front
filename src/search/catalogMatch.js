// 이미 로드된 카탈로그(이슈·의원)에 대한 클라이언트 키워드 일치(순수). 네트워크 없음.
export function normalizeQuery(q) {
  const s = String(q || '').trim().replace(/\s+/g, ' ');
  return s.length >= 2 ? s : '';
}

export function matchIssues(issues, q, max = 10) {
  const term = normalizeQuery(q);
  if (!term) return [];
  return (issues || []).filter((i) => {
    const hay = [i.title, i.summary, i.law_name, ...(i.keywords || [])].filter(Boolean).join(' ');
    return hay.includes(term);
  }).slice(0, max);
}

export function matchMembers(members, q, max = 10) {
  const term = normalizeQuery(q);
  if (!term) return [];
  return (members || []).filter((m) => `${m.name || ''} ${m.district || ''} ${m.party || ''}`.includes(term)).slice(0, max);
}

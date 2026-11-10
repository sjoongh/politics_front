// 의원 목록·상세 표시 모델(순수).

export function termCount(term) {
  const m = String(term || '').match(/제?\d+대/g);
  return m ? m.length : 0;
}

export function partyOptions(members) {
  const parties = Array.from(new Set((members || []).map((m) => m.party).filter(Boolean)));
  return [{ id: '전체', label: '전체' }, ...parties.map((p) => ({ id: p, label: p }))];
}

export function filterMembers(members, { query = '', party = '전체', sort = 'name' } = {}) {
  const q = (query || '').trim();
  const list = (members || []).filter((m) => {
    const partyOk = party === '전체' || m.party === party;
    const qOk = !q || `${m.name || ''} ${m.district || ''}`.includes(q);
    return partyOk && qOk;
  });
  const sorted = [...list];
  if (sort === 'criminal') sorted.sort((a, b) => (b.criminal_count || 0) - (a.criminal_count || 0));
  else if (sort === 'term') sorted.sort((a, b) => termCount(b.term) - termCount(a.term));
  else sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
  return sorted;
}

export function voteRows(detail) {
  return ((detail && detail.votes) || []).map((v) => ({
    bill: v.bill || '', vote: v.vote || '', issueId: v.issue_id || null, link: v.link || null, date: v.date || null,
  }));
}

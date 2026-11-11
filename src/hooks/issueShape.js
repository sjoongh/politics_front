// 이슈 응답 정규화(순수). digest가 없는 구 문서도 깨지지 않게 null로 둔다.

export function issueType(raw) {
  if (raw.issue_type) return raw.issue_type;
  const k = raw.auto_key || '';
  if (k.startsWith('news:')) return 'news';
  if (k.startsWith('bill:')) return 'bill';
  return 'manual';
}

export function normalizeIssue(raw) {
  const r = raw || {};
  return { ...r, id: r.id, type: issueType(r), digest: r.digest && typeof r.digest === 'object' ? r.digest : null };
}

export function counts(issue) {
  const c = issue && issue.digest && issue.digest.counts;
  if (!c) return null;
  return { gov: c.gov || 0, bill: c.bill || 0, vote: c.vote || 0, media: c.media || 0 };
}

export function hasOfficial(issue) {
  const c = counts(issue);
  return !!c && (c.gov > 0 || c.bill > 0 || c.vote > 0);
}

export function officialStance(issue) {
  const s = (issue && issue.digest && issue.digest.stance) || [];
  return s.filter((x) => x && (x.basis === 'official' || x.basis === 'vote'));
}

export function voteLabel(vote) {
  if (!vote) return null;
  const yes = vote.yes || 0; const no = vote.no || 0; const abstain = vote.abstain || 0;
  if (yes + no + abstain === 0) return null;
  return `${yes}:${no}`;
}

/** 목록 응답 정규화: v2 {items,next_cursor} 또는 구 서버의 배열. */
export function normalizePage(data) {
  if (Array.isArray(data)) return { items: data.map(normalizeIssue), nextCursor: null };
  if (data && Array.isArray(data.items)) return { items: data.items.map(normalizeIssue), nextCursor: data.next_cursor || null };
  return { items: [], nextCursor: null };
}

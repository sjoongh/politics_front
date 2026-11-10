import { normalizeIssue, counts, hasOfficial, officialStance, voteLabel, normalizePage } from './issueShape';

test('no digest is null', () => {
  const i = normalizeIssue({ id: 'a', title: 't' });
  expect(i.digest).toBeNull(); expect(counts(i)).toBeNull(); expect(hasOfficial(i)).toBe(false);
});
test('counts and official', () => {
  const i = normalizeIssue({ id: 'a', digest: { counts: { gov: 1, bill: 0, vote: 0, media: 5 } } });
  expect(counts(i)).toEqual({ gov: 1, bill: 0, vote: 0, media: 5 }); expect(hasOfficial(i)).toBe(true);
});
test('zero counts not official', () => {
  expect(hasOfficial(normalizeIssue({ digest: { counts: { gov: 0, bill: 0, vote: 0, media: 3 } } }))).toBe(false);
});
test('vote label', () => {
  expect(voteLabel({ yes: 182, no: 61 })).toBe('182:61');
  expect(voteLabel({ yes: 0, no: 0, abstain: 0 })).toBeNull();
  expect(voteLabel(null)).toBeNull();
});
test('official stance filters press', () => {
  expect(officialStance(normalizeIssue({ digest: { stance: [{ basis: 'press' }, { basis: 'vote' }, { basis: 'official' }] } }))).toHaveLength(2);
});
test('issue_type derived from auto_key or field', () => {
  expect(normalizeIssue({ id: 'x', issue_type: 'bill' }).type).toBe('bill');
  expect(normalizeIssue({ id: 'x', auto_key: 'news:1' }).type).toBe('news');
  expect(normalizeIssue({ id: 'x' }).type).toBe('manual');
});
test('normalizePage accepts v2 and legacy array', () => {
  expect(normalizePage({ items: [{ id: '1' }], next_cursor: 'c' })).toEqual({ items: [expect.objectContaining({ id: '1' })], nextCursor: 'c' });
  expect(normalizePage([{ id: '2' }])).toEqual({ items: [expect.objectContaining({ id: '2' })], nextCursor: null });
  expect(normalizePage(null)).toEqual({ items: [], nextCursor: null });
});

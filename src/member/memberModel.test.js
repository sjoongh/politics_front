import { filterMembers, termCount, voteRows, partyOptions } from './memberModel';

const M = [
  { id: '1', name: '김가', district: '서울 강남', party: 'A당', criminal_count: 2, term: '제21대, 제22대' },
  { id: '2', name: '이나', district: '부산 해운대', party: 'B당', criminal_count: 0, term: '제22대' },
  { id: '3', name: '박다', district: '대구', party: 'A당', criminal_count: 1, term: '제20대, 제21대, 제22대' },
];

test('term count', () => { expect(termCount('제21대, 제22대')).toBe(2); expect(termCount('')).toBe(0); expect(termCount('22대')).toBe(1); });
test('filter query and party', () => {
  expect(filterMembers(M, { query: '부산', party: '전체', sort: 'name' }).map((m) => m.id)).toEqual(['2']);
  expect(filterMembers(M, { query: '', party: 'A당', sort: 'name' }).map((m) => m.id)).toEqual(['1', '3']);
});
test('sorts', () => {
  expect(filterMembers(M, { query: '', party: '전체', sort: 'criminal' })[0].id).toBe('1');
  expect(filterMembers(M, { query: '', party: '전체', sort: 'term' })[0].id).toBe('3');
  expect(filterMembers(M, { query: '', party: '전체', sort: 'name' }).map((m) => m.name)).toEqual(['김가', '박다', '이나']);
});
test('party options', () => expect(partyOptions(M)).toEqual([{ id: '전체', label: '전체' }, { id: 'A당', label: 'A당' }, { id: 'B당', label: 'B당' }]));
test('vote rows carry issue id and label', () => {
  const rows = voteRows({ votes: [{ bill: 'X', vote: '찬성', issue_id: 'issue_bill_1', link: 'u', date: '2026-11-10' }, { bill: 'Y', vote: '반대' }] });
  expect(rows[0]).toEqual({ bill: 'X', vote: '찬성', issueId: 'issue_bill_1', link: 'u', date: '2026-11-10' });
  expect(rows[1].issueId).toBeNull();
});

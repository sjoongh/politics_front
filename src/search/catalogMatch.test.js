import { matchIssues, matchMembers, normalizeQuery } from './catalogMatch';

test('short query is empty', () => { expect(normalizeQuery(' 가 ')).toBe(''); expect(normalizeQuery('  추경  안 ')).toBe('추경 안'); });
test('match issues by keyword/title/summary, max 10', () => {
  const issues = [{ id: '1', title: 'x', summary: '', keywords: ['추경'] }, { id: '2', title: '추경 처리', summary: '' }, { id: '3', title: 'y', summary: '추경 논의' }, { id: '4', title: 'z', summary: '' }];
  expect(matchIssues(issues, '추경').map((i) => i.id)).toEqual(['1', '2', '3']);
  expect(matchIssues(Array.from({ length: 20 }, (_, i) => ({ id: String(i), title: '추경' })), '추경')).toHaveLength(10);
});
test('match members by name or district', () => {
  expect(matchMembers([{ id: 'a', name: '김', district: '수원' }, { id: 'b', name: '박', district: '서울' }], '수원').map((m) => m.id)).toEqual(['a']);
  expect(matchMembers([{ id: 'a', name: '김', district: '수원' }], '가')).toEqual([]);
});

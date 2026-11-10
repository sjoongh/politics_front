import { statusKind, positionLabel, tallyWidths, shortDate, basisLabel, formatCount } from './format';

test('status kinds', () => {
  expect(statusKind('가결')).toBe('pass'); expect(statusKind('진행중')).toBe('live'); expect(statusKind('계류')).toBe('live');
  expect(statusKind('부결')).toBe('fail'); expect(statusKind('소강')).toBe('etc'); expect(statusKind(undefined)).toBe('etc');
});
test('tally widths sum 100', () => {
  const w = tallyWidths({ yes: 182, no: 61, abstain: 9 });
  expect(w.yes + w.no + w.abstain).toBe(100); expect(w.yes).toBeGreaterThan(w.no);
  expect(tallyWidths({ yes: 0, no: 0, abstain: 0 })).toEqual({ yes: 0, no: 0, abstain: 0 });
  expect(tallyWidths(null)).toEqual({ yes: 0, no: 0, abstain: 0 });
});
test('short date', () => {
  expect(shortDate('2026-11-10T01:00:00Z')).toBe('11.10'); expect(shortDate('2026-11-08')).toBe('11.8');
  expect(shortDate('2026-11-08 12:00:00')).toBe('11.8'); expect(shortDate('')).toBe(''); expect(shortDate(null)).toBe('');
});
test('labels', () => {
  expect(positionLabel('oppose')).toBe('반대'); expect(positionLabel('support')).toBe('찬성'); expect(positionLabel('zzz')).toBe('');
  expect(basisLabel('vote')).toBe('표결'); expect(basisLabel('official')).toBe('공식 발표'); expect(basisLabel('press')).toBe('보도');
});
test('formatCount compacts thousands', () => {
  expect(formatCount(52)).toBe('52'); expect(formatCount(1234)).toBe('1.2천'); expect(formatCount(0)).toBe('0');
});

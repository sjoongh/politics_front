import { sourceLine } from './sourceLine';

test('null digest', () => expect(sourceLine({ digest: null })).toEqual({ parts: [], none: false, media: 0 }));
test('full line', () => expect(sourceLine({ digest: { counts: { gov: 2, bill: 1, vote: 1, media: 52 }, vote: { yes: 182, no: 61 } } }).parts)
  .toEqual(['정부 2', '법안 1', '표결 182:61', '보도 52']));
test('no official', () => {
  const l = sourceLine({ digest: { counts: { gov: 0, bill: 0, vote: 0, media: 7 } } });
  expect(l.none).toBe(true); expect(l.parts).toEqual(['보도 7']); expect(l.media).toBe(7);
});
test('vote count without tally falls back to count', () => {
  expect(sourceLine({ digest: { counts: { gov: 0, bill: 0, vote: 2, media: 0 }, vote: null } }).parts).toEqual(['표결 2']);
});
test('zero media omitted when official exists', () => {
  expect(sourceLine({ digest: { counts: { gov: 1, bill: 0, vote: 0, media: 0 } } }).parts).toEqual(['정부 1']);
});

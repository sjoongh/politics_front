import { partyColor, initials } from './partyColors';

test('partyColor maps known parties', () => {
  expect(partyColor('더불어민주당')).toBe('#152484');
  expect(partyColor('국민의힘')).toBe('#E61E2B');
  expect(partyColor('민주당')).toBe('#152484'); // 부분 매칭
});

test('partyColor falls back', () => {
  expect(partyColor('알수없는당')).toBe('var(--hairline-strong)');
  expect(partyColor('')).toBe('#6b7280');
  expect(partyColor(null)).toBe('#6b7280');
});

test('initials takes last 2 chars of Korean name', () => {
  expect(initials('남인순')).toBe('인순');
  expect(initials('이재명')).toBe('재명');
  expect(initials('')).toBe('?');
});

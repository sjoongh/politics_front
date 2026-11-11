import { shiftDate, formatHeader, isFuture, kstToday, isValidDate } from './dateNav';

test('shift', () => { expect(shiftDate('2026-11-10', -1)).toBe('2026-11-09'); expect(shiftDate('2026-11-30', 1)).toBe('2026-12-01'); });
test('header', () => { expect(formatHeader('2026-11-10')).toBe('11월 10일 화요일'); expect(formatHeader('2026-01-04')).toBe('1월 4일 일요일'); });
test('future', () => { expect(isFuture('2999-01-01')).toBe(true); expect(isFuture('2000-01-01')).toBe(false); expect(isFuture(kstToday())).toBe(false); });
test('valid date string', () => { expect(isValidDate('2026-11-10')).toBe(true); expect(isValidDate('2026-13-01')).toBe(false); expect(isValidDate('nope')).toBe(false); });

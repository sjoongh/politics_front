// 날짜 탐색(순수). KST 고정 오프셋으로 계산해 기기 시간대와 무관하게 같은 날짜를 낸다.
const KST_MS = 9 * 3600 * 1000;
const DAYS = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];

function toKst(date) { return new Date(date.getTime() + KST_MS); }
function fmt(d) { return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`; }

export function isValidDate(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s || '')) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && fmt(d) === s;
}

export function kstToday(now = new Date()) { return fmt(toKst(now)); }

export function shiftDate(date, delta) {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + delta);
  return fmt(d);
}

export function formatHeader(date) {
  const d = new Date(`${date}T00:00:00Z`);
  return `${d.getUTCMonth() + 1}월 ${d.getUTCDate()}일 ${DAYS[d.getUTCDay()]}`;
}

export function isFuture(date, now = new Date()) { return date > kstToday(now); }

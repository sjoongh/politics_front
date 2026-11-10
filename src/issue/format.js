// 표시용 순수 포맷터. 상태·입장·근거 라벨, 표결 막대 폭, 짧은 날짜, 건수.

export function statusKind(status) {
  if (status === '가결') return 'pass';
  if (status === '부결') return 'fail';
  if (status === '진행중' || status === '계류') return 'live';
  return 'etc';
}

const POSITION = { support: '찬성', oppose: '반대', criticize: '비판', propose: '제안', explain: '설명', neutral: '중립' };
export function positionLabel(position) {
  return POSITION[position] || '';
}

const BASIS = { official: '공식 발표', vote: '표결', press: '보도' };
export function basisLabel(basis) {
  return BASIS[basis] || '';
}

/** 찬/반/기권 백분율. 합이 100이 되도록 마지막 항목에서 보정. */
export function tallyWidths(vote) {
  const yes = (vote && vote.yes) || 0; const no = (vote && vote.no) || 0; const abstain = (vote && vote.abstain) || 0;
  const total = yes + no + abstain;
  if (!total) return { yes: 0, no: 0, abstain: 0 };
  const y = Math.round((yes / total) * 100);
  const n = Math.round((no / total) * 100);
  return { yes: y, no: n, abstain: Math.max(0, 100 - y - n) };
}

/** '2026-11-08' | '2026-11-10T01:00:00Z' | '2026-11-08 12:00:00' → 'M.D' (KST 기준) */
export function shortDate(value) {
  if (!value) return '';
  const s = String(value);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return `${Number(s.slice(5, 7))}.${Number(s.slice(8, 10))}`;
  const d = new Date(s.includes('T') || s.includes('Z') ? s : s.replace(' ', 'T') + 'Z');
  if (Number.isNaN(d.getTime())) return '';
  const kst = new Date(d.getTime() + 9 * 3600 * 1000);
  return `${kst.getUTCMonth() + 1}.${kst.getUTCDate()}`;
}

export function formatCount(n) {
  const v = Number(n) || 0;
  if (v >= 10000) return `${(v / 10000).toFixed(1).replace(/\.0$/, '')}만`;
  if (v >= 1000) return `${(v / 1000).toFixed(1).replace(/\.0$/, '')}천`;
  return String(v);
}

// 주요 정당 색상 매핑 (좌측 액센트/아바타용). 미매칭은 기본 primary.
const PARTY_COLORS = {
  '더불어민주당': '#152484',
  '민주당': '#152484',
  '국민의힘': '#E61E2B',
  '조국혁신당': '#0073CF',
  '개혁신당': '#FF7210',
  '진보당': '#D6001C',
  '정의당': '#FFCC00',
  '기본소득당': '#00D2C3',
  '사회민주당': '#F58220',
  '무소속': '#6b7280',
};

export function partyColor(party) {
  if (!party) return '#6b7280';
  const key = Object.keys(PARTY_COLORS).find((p) => party.includes(p));
  return key ? PARTY_COLORS[key] : 'var(--primary)';
}

export function initials(name) {
  if (!name) return '?';
  return name.trim().slice(-2); // 한국 이름: 끝 2글자
}

// 이슈 상세 표시 모델(순수). 백엔드 상세 응답 → 공식 기록·타임라인·입장·보도 분포·발의 의원.
const LEAN_LABEL = { left: '진보', center: '중도', right: '보수', foreign: '외신', unknown: '미분류' };

function panels(detail) {
  const p = (detail && detail.source_panels) || {};
  return { votes: p.assembly_vote || [], bills: p.assembly_bill || [], gov: p.government || [] };
}

/** 표결·법안·정부 발표를 한 목록으로(시간 역순). kind: vote | bill | gov */
export function officialRecords(detail) {
  const { votes, bills, gov } = panels(detail);
  const rows = [
    ...votes.map((s) => ({ kind: 'vote', id: s.id, date: s.published_at || '', title: (s.title || '').replace(/^표결:\s*/, ''), vote: s.vote || null, url: s.url, actor: s.actor_name })),
    ...bills.map((s) => ({ kind: 'bill', id: s.id, date: s.published_at || '', title: s.title || '', bill: s.bill || null, url: s.url, actor: s.actor_name })),
    ...gov.map((s) => ({ kind: 'gov', id: s.id, date: s.published_at || '', title: s.title || '', excerpt: s.claim_summary || s.summary || s.excerpt || '', url: s.url, actor: s.actor_name, position: s.position })),
  ];
  return rows.sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

/** 수동 events + 공식 기록 날짜 → 타임라인(날짜 오름차순). 2개 미만이면 빈 배열. */
export function timelineItems(detail) {
  const events = ((detail && detail.events) || []).filter((e) => e && e.date)
    .map((e) => ({ date: String(e.date).slice(0, 10), label: e.headline || e.summary || '', kind: 'event' }));
  const LABEL = { vote: '표결', bill: '발의', gov: '정부 발표' };
  const recs = officialRecords(detail).filter((r) => r.date)
    .map((r) => ({ date: String(r.date).slice(0, 10), label: `${LABEL[r.kind]} · ${r.title}`, kind: r.kind }));
  const all = [...events, ...recs].sort((a, b) => a.date.localeCompare(b.date));
  return all.length >= 2 ? all : [];
}

/** 상세 입장표: digest.stance 전부(보도 기반 포함). */
export function stanceRows(detail) {
  return ((detail && detail.digest && detail.digest.stance) || []).filter((s) => s && s.actor);
}

/** 수집된 보도 분포. official은 unknown에 합산. 사각지대 문구는 "수집된 보도 중 ○○ 성향 매체 없음"으로 한정. */
export function pressModel(detail) {
  const bd = (detail && detail.perspectives && detail.perspectives.breakdown) || {};
  const c = bd.counts || {};
  const counts = { left: c.left || 0, center: c.center || 0, right: c.right || 0, foreign: c.foreign || 0, unknown: (c.unknown || 0) + (c.official || 0) };
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const blind = bd.blindspot;
  const blindspotText = blind && LEAN_LABEL[blind] ? `수집된 보도 중 ${LEAN_LABEL[blind]} 성향 매체 없음` : null;
  const groups = (detail && detail.perspectives && detail.perspectives.groups) || {};
  return { counts, total, blindspotText, groups };
}

/** 연결 법안의 제안자 중 의원 목록과 이름이 일치하는 사람(최대 8). */
export function proposerChips(detail, members) {
  const names = [];
  for (const s of panels(detail).bills) {
    for (const n of ((s.bill && s.bill.proposers) || [])) if (n && !names.includes(n)) names.push(n);
  }
  const byName = new Map((members || []).map((m) => [m.name, m]));
  return names.filter((n) => byName.has(n)).slice(0, 8).map((n) => ({ id: byName.get(n).id, name: n }));
}

// 관련 기사 추천 점수식 (codex 리뷰 반영).
// keyword 교집합을 최우선, 같은 category 보조, 최신/조회수는 동점 보정.
// 자기 자신·동일 원문·동일 제목은 제외.

function ts(a) {
  const v = a.published_at || a.created_at;
  const t = v ? Date.parse(String(v).replace(' ', 'T')) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

export function relatedNews(current, pool, n = 3) {
  if (!current || !Array.isArray(pool)) return [];
  const curKw = new Set((current.keywords || []).map((k) => String(k).toLowerCase()));

  const scored = pool
    .filter((a) =>
      a &&
      a.id !== current.id &&
      a.source_url !== current.source_url &&
      a.title !== current.title
    )
    .map((a) => {
      const kwOverlap = (a.keywords || []).reduce(
        (acc, k) => acc + (curKw.has(String(k).toLowerCase()) ? 1 : 0),
        0
      );
      const sameCat = a.category && a.category === current.category ? 1 : 0;
      const score = kwOverlap * 3 + sameCat * 2;
      return { a, score, recency: ts(a), views: a.view_count || 0 };
    })
    // 관련성이 전혀 없는(점수0) 항목은 제외 — 무관한 추천 방지
    .filter((o) => o.score > 0)
    .sort((x, y) => y.score - x.score || y.recency - x.recency || y.views - x.views);

  return scored.slice(0, n).map((o) => o.a);
}

import React from 'react';

/**
 * 오늘의 브리핑 히어로.
 * - summary.overview 있으면: 요약 + 하이라이트 표시
 * - 없으면: 최신 이슈/뉴스 제목들로 폴백("오늘의 핵심 이슈")
 */
const TYPE_EMOJI = { news: '🔥', bill: '📜', manual: '✏️' };

export default function BriefingHero({ summary, fallbackItems = [], topIssues = [], onIssueClick }) {
  const overview = summary && summary.overview;
  const highlights = Array.isArray(summary?.highlights) ? summary.highlights.slice(0, 4) : [];
  const issues = (topIssues || []).filter((i) => i && i.title).slice(0, 4);
  const fallback = (fallbackItems || []).filter(Boolean).slice(0, 4);

  return (
    <section className="briefing-hero" aria-label="오늘의 브리핑">
      <span className="briefing-hero__eyebrow">
        📌 오늘의 브리핑{summary?.date ? ` · ${summary.date}` : ''}
      </span>
      {overview ? (
        <>
          <p className="briefing-hero__overview">{overview}</p>
          {highlights.length > 0 && (
            <ul className="briefing-hero__highlights">
              {highlights.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}
        </>
      ) : issues.length > 0 ? (
        <>
          <h2 className="briefing-hero__title">지금 주목받는 이슈</h2>
          <div className="briefing-hero__issues">
            {issues.map((iss) => (
              <button key={iss.id} className="briefing-hero__issue" onClick={() => onIssueClick && onIssueClick(iss.id)}>
                <span className="briefing-hero__issue-tag">{TYPE_EMOJI[iss.issue_type] || '•'}</span>
                <span className="briefing-hero__issue-title">{iss.title}</span>
              </button>
            ))}
          </div>
        </>
      ) : fallback.length > 0 ? (
        <>
          <h2 className="briefing-hero__title">지금 주목받는 이슈</h2>
          <ul className="briefing-hero__highlights">
            {fallback.map((t, i) => <li key={i}>{t}</li>)}
          </ul>
        </>
      ) : (
        <>
          <h2 className="briefing-hero__title">브리핑 코리아</h2>
          <p className="briefing-hero__empty">
            정치 뉴스를 한눈에. 오늘의 요약은 곧 업데이트됩니다.
          </p>
        </>
      )}
    </section>
  );
}

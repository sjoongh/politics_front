import React from 'react';

export default function DailySummaryCard({ summary }) {
  if (!summary || !summary.overview) return null;
  const highlights = Array.isArray(summary.highlights) ? summary.highlights : [];
  return (
    <section className="bk-card daily-summary">
      <div className="bk-card__body">
        <div className="daily-summary__label">📅 오늘의 요약{summary.date ? ` · ${summary.date}` : ''}</div>
        <p className="daily-summary__overview">{summary.overview}</p>
        {highlights.length > 0 && (
          <ul className="daily-summary__highlights">
            {highlights.map((h, i) => <li key={i}>{h}</li>)}
          </ul>
        )}
      </div>
    </section>
  );
}

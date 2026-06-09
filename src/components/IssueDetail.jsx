import React from 'react';
import { useIssueDetail } from './useIssues';
import { statusBadgeClass } from './issueStatus';
import { formatDate } from '../utils/dateUtils';
import NewsCard from './NewsCard';

export default function IssueDetail({ issueId, onClose, onArticleClick }) {
  const { detail, loading } = useIssueDetail(issueId);

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className="bk-modal" onClick={handleOverlay}>
      <div className="bk-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>

        {loading && <p className="bk-card__summary">불러오는 중…</p>}
        {!loading && !detail && <p className="bk-card__summary">이슈를 불러오지 못했습니다.</p>}

        {detail && (
          <>
            <span className={statusBadgeClass(detail.status)}>{detail.status}</span>
            <h3>{detail.title}</h3>
            {detail.summary && <p>{detail.summary}</p>}

            {detail.official_links && detail.official_links.length > 0 && (
              <div className="issue-links">
                {detail.official_links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer" className="issue-link">🔗 {l.label}</a>
                ))}
              </div>
            )}

            {detail.events && detail.events.length > 0 && (
              <div>
                <div className="issue-section-title">타임라인</div>
                <div className="issue-timeline">
                  {detail.events.map((ev) => (
                    <div key={ev.id} className="issue-event">
                      <div className="issue-event__date">{formatDate(ev.date)}</div>
                      <div className="issue-event__headline">{ev.headline}</div>
                      {ev.summary && <div className="issue-event__summary">{ev.summary}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.articles && detail.articles.length > 0 && (
              <div>
                <div className="issue-section-title">관련 뉴스</div>
                <div className="feed-grid">
                  {detail.articles.map((a, idx) => (
                    <NewsCard key={a.id || idx} item={a} type="news" onDetailClick={onArticleClick} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

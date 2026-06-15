import React from 'react';
import { Newspaper } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { statusBadgeClass } from './issueStatus';

export default function IssueCard({ issue, onClick }) {
  const sourceCount = issue.source_count
    ?? (Array.isArray(issue.articles) ? issue.articles.length : null)
    ?? (Array.isArray(issue.related_articles) ? issue.related_articles.length : null);

  return (
    <article
      className="bk-card issue-card"
      onClick={() => onClick(issue.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(issue.id)}
    >
      <div className="bk-card__body">
        <span className={statusBadgeClass(issue.status)}>{issue.status}</span>
        <h3 className="bk-card__title">{issue.title}</h3>
        {issue.summary && <p className="bk-card__summary">{issue.summary}</p>}
        <div className="bk-card__meta">
          <span className="bk-card__src">{issue.category}</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            {sourceCount != null && (
              <span className="issue-card__sources">
                <Newspaper size={12} /> {sourceCount}건
              </span>
            )}
            <span>{formatDate(issue.updated_at)}</span>
          </span>
        </div>
      </div>
    </article>
  );
}

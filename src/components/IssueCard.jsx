import React from 'react';
import { Newspaper } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { statusBadgeClass } from './issueStatus';

function issueType(issue) {
  switch (issue.issue_type) {
    case 'news': return { label: '🔥 현안', cls: 'bk-badge--alert' };
    case 'bill': return { label: '📜 법안', cls: 'bk-badge--muted' };
    case 'manual': return { label: '✏️ 큐레이션', cls: 'bk-badge' };
    default: return null;
  }
}

export default function IssueCard({ issue, onClick }) {
  const sourceCount = issue.source_count
    ?? (Array.isArray(issue.articles) ? issue.articles.length : null)
    ?? (Array.isArray(issue.related_articles) ? issue.related_articles.length : null);
  const type = issueType(issue);

  return (
    <article
      className="bk-card issue-card"
      onClick={() => onClick(issue.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(issue.id)}
    >
      <div className="bk-card__body">
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {type && <span className={`bk-badge ${type.cls}`}>{type.label}</span>}
          <span className={statusBadgeClass(issue.status)}>{issue.status}</span>
        </div>
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

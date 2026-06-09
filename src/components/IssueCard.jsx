import React from 'react';
import { formatDate } from '../utils/dateUtils';
import { statusBadgeClass } from './issueStatus';

export default function IssueCard({ issue, onClick }) {
  return (
    <article className="bk-card issue-card" onClick={() => onClick(issue.id)}>
      <div className="bk-card__body">
        <span className={statusBadgeClass(issue.status)}>{issue.status}</span>
        <h3 className="bk-card__title">{issue.title}</h3>
        {issue.summary && <p className="bk-card__summary">{issue.summary}</p>}
        <div className="bk-card__meta">
          <span className="bk-card__src">{issue.category}</span>
          <span>{formatDate(issue.updated_at)}</span>
        </div>
      </div>
    </article>
  );
}

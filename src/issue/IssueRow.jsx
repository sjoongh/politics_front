import React from 'react';
import { Link } from 'react-router';
import Badge from '../ui/Badge';
import StanceChip from './StanceChip';
import { sourceLine } from './sourceLine';
import { officialStance } from '../hooks/issueShape';
import { shortDate } from './format';
import './issue.css';

/** 이슈 행(링크). 입장 칩은 공식 근거(발표·표결) 2개 이상일 때만 최대 2개. 성향 막대는 행에 두지 않는다. */
export default function IssueRow({ issue, to, replace = false, selected = false, onSelect }) {
  const line = sourceLine(issue);
  const stance = officialStance(issue);
  const isBill = issue.type === 'bill';
  const title = isBill && issue.law_name ? issue.law_name : issue.title;
  const sub = isBill && issue.law_name && issue.title !== issue.law_name ? issue.title : null;
  const date = shortDate((issue.digest && issue.digest.last_activity_at) || issue.updated_at);
  return (
    <Link to={to || `/issues/${issue.id}`} replace={replace} className={`issue-row${selected ? ' is-selected' : ''}`}
      aria-current={selected ? 'true' : undefined} data-issue-id={issue.id} onClick={() => onSelect && onSelect(issue.id)}>
      <span className="issue-row__badges">
        <Badge kind="status" value={issue.status} />
        <Badge kind="category" value={issue.category} />
      </span>
      <span className="issue-row__title">{title}</span>
      {sub && <span className="issue-row__sub">{sub}</span>}
      {issue.summary && <span className="issue-row__summary">{issue.summary}</span>}
      {stance.length >= 2 && (
        <span className="issue-row__stance">
          {stance.slice(0, 2).map((s, i) => <StanceChip key={i} actor={s.actor} position={s.position} basis={s.basis} />)}
        </span>
      )}
      {(line.parts.length > 0 || date) && (
        <span className="issue-row__sources num">
          {line.none && <span className="is-none">공식 기록 없음</span>}
          {line.parts.map((p, i) => (
            <React.Fragment key={p}>
              {(i > 0 || line.none) && <span className="sep">·</span>}
              <span className={line.none ? 'is-none' : undefined}>{p}</span>
            </React.Fragment>
          ))}
          {date && <span className="issue-row__date">{date}</span>}
        </span>
      )}
    </Link>
  );
}

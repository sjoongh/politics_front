import React from 'react';
import Badge from '../ui/Badge';
import StanceChip from './StanceChip';
import { sourceLine } from './sourceLine';
import { officialStance } from '../hooks/issueShape';
import { shortDate } from './format';
import './issue.css';

/** 이슈 행. 입장 칩은 공식 근거(발표·표결) 2개 이상일 때만 최대 2개. 성향 막대는 행에 두지 않는다. */
export default function IssueRow({ issue, onSelect, selected = false, as = 'button' }) {
  const line = sourceLine(issue);
  const stance = officialStance(issue);
  const isBill = issue.type === 'bill';
  const title = isBill && issue.law_name ? issue.law_name : issue.title;
  const sub = isBill && issue.law_name && issue.title !== issue.law_name ? issue.title : null;
  const date = shortDate((issue.digest && issue.digest.last_activity_at) || issue.updated_at);
  const Tag = as;
  return (
    <Tag type={as === 'button' ? 'button' : undefined} className={`issue-row${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect && onSelect(issue.id)} aria-current={selected ? 'true' : undefined} data-issue-id={issue.id}>
      <div className="issue-row__badges">
        <Badge kind="status" value={issue.status} />
        <Badge kind="category" value={issue.category} />
      </div>
      <h3 className="issue-row__title">{title}</h3>
      {sub && <div className="issue-row__sub">{sub}</div>}
      {issue.summary && <p className="issue-row__summary">{issue.summary}</p>}
      {stance.length >= 2 && (
        <div className="issue-row__stance">
          {stance.slice(0, 2).map((s, i) => <StanceChip key={i} actor={s.actor} position={s.position} basis={s.basis} />)}
        </div>
      )}
      {(line.parts.length > 0 || date) && (
        <div className="issue-row__sources num">
          {line.none && <span className="is-none">공식 기록 없음</span>}
          {line.parts.map((p, i) => (
            <React.Fragment key={p}>
              {(i > 0 || line.none) && <span className="sep">·</span>}
              <span className={line.none ? 'is-none' : undefined}>{p}</span>
            </React.Fragment>
          ))}
          {date && <span className="issue-row__date">{date}</span>}
        </div>
      )}
    </Tag>
  );
}

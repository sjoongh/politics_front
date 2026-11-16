import React from 'react';
import { positionLabel, basisLabel } from './format';
import './issue.css';

function Pos({ position }) {
  if (position && typeof position === 'object') {
    const parts = [];
    if (position.yes) parts.push(`찬성 ${position.yes}`);
    if (position.no) parts.push(`반대 ${position.no}`);
    if (position.abstain) parts.push(`기권 ${position.abstain}`);
    return <span className="stance-table__pos num">투표자 중 {parts.join(' · ')}</span>;
  }
  const label = positionLabel(position);
  return label ? <span className={`stance-table__pos stance-chip__pos--${position}`}>{label}</span> : null;
}

/** hideVoteEvidence: 표결 근거(법안명)가 바로 위 공식 기록에 이미 보이면 행마다 반복하지 않는다. */
export default function StanceTable({ rows, hideVoteEvidence = false }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="stance-table">
      {rows.map((s, i) => (
        <div className="stance-table__row" key={`${s.actor}-${i}`}>
          <div className="stance-table__actor">{s.actor}</div>
          <div className="stance-table__body">
            <Pos position={s.position} />
            {s.evidence && !(hideVoteEvidence && s.basis === 'vote') && (s.url ? <a href={s.url} target="_blank" rel="noreferrer">{s.evidence}</a> : <span>{s.evidence}</span>)}
            {s.basis && <span className="stance-table__basis">{basisLabel(s.basis)}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

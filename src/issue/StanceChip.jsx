import React from 'react';
import { positionLabel, basisLabel } from './format';
import './issue.css';

/** position: 문자열(공식 발표·보도) 또는 {yes,no,abstain}(표결 관측치). */
export default function StanceChip({ actor, position, basis, showBasis = false }) {
  if (!actor) return null;
  let body;
  if (position && typeof position === 'object') {
    const parts = [];
    if (position.yes) parts.push(<span key="y" className="stance-chip__pos stance-chip__pos--yes">찬성 {position.yes}</span>);
    if (position.no) parts.push(<span key="n" className="stance-chip__pos stance-chip__pos--no">반대 {position.no}</span>);
    if (position.abstain) parts.push(<span key="a" className="stance-chip__pos stance-chip__pos--neutral">기권 {position.abstain}</span>);
    if (!parts.length) return null;
    body = <span className="num">{parts.reduce((acc, el, i) => (i ? [...acc, '·', el] : [el]), [])}</span>;
  } else {
    const label = positionLabel(position);
    if (!label) return null;
    body = <span className={`stance-chip__pos stance-chip__pos--${position}`}>{label}</span>;
  }
  return (
    <span className="stance-chip">
      <span>{actor}</span>
      {body}
      {showBasis && basis && <span className="stance-chip__basis">{basisLabel(basis)}</span>}
    </span>
  );
}

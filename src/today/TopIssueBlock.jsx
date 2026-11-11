import React from 'react';
import { Link } from 'react-router';
import Badge from '../ui/Badge';
import StanceChip from '../issue/StanceChip';
import { voteLabel } from '../hooks/issueShape';

/** 오늘 변화한 이슈(최대 3): 배지 → 제목 → 무슨 일 → 확인된 입장(공식·표결만, ≤3) → 공식 기록 한 줄. 값 없는 행은 생략. */
export default function TopIssueBlock({ snap, index }) {
  const c = snap.counts || {};
  const stance = (snap.stance || []).filter((s) => s.basis === 'official' || s.basis === 'vote').slice(0, 3);
  const rec = [];
  const vl = voteLabel(snap.vote);
  if (vl) rec.push(`표결 ${vl}${snap.vote && snap.vote.result ? ` ${snap.vote.result}` : ''}`);
  if (c.gov) rec.push(`정부 발표 ${c.gov}`);
  if (c.bill) rec.push(`법안 ${c.bill}`);
  return (
    <Link to={`/issues/${snap.id}`} className="top-issue">
      <div className="top-issue__no"><span className="num">{index + 1}</span><Badge kind="status" value={snap.status} /><Badge kind="category" value={snap.category} /></div>
      <span className="top-issue__title">{snap.title}</span>
      <div className="top-issue__grid">
        {snap.summary && <><b>무슨 일</b><span>{snap.summary}</span></>}
        {stance.length > 0 && <><b>입장</b><span className="top-issue__stance">{stance.map((s, i) => <StanceChip key={i} actor={s.actor} position={s.position} basis={s.basis} />)}</span></>}
        {rec.length > 0 && <><b>공식 기록</b><span className="num">{rec.join(' · ')}</span></>}
      </div>
    </Link>
  );
}

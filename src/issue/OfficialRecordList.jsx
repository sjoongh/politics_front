import React from 'react';
import VoteTally from './VoteTally';
import { shortDate, positionLabel } from './format';
import './issue.css';

const KIND = { vote: '표결', bill: '법안', gov: '정부 발표' };

export default function OfficialRecordList({ records }) {
  if (!records || records.length === 0) return <div className="rec--empty">공식 기록 없음</div>;
  return (
    <div className="hairline-list">
      {records.map((r) => (
        <a key={`${r.kind}-${r.id}`} className="rec" href={r.url || undefined} target={r.url ? '_blank' : undefined} rel="noreferrer">
          <div className="rec__kind">{KIND[r.kind]}{r.kind === 'gov' && r.actor ? ` · ${r.actor}` : ''}{r.date ? ` · ${shortDate(r.date)}` : ''}</div>
          <div className="rec__title">{r.title}</div>
          {r.kind === 'bill' && r.bill && (
            <div className="rec__meta">
              {(r.bill.proposers || []).slice(0, 3).join(', ')}{(r.bill.proposers || []).length > 3 ? ` 외 ${r.bill.proposers.length - 3}인` : ''}
              {r.bill.status ? ` · ${r.bill.status}` : ''}
            </div>
          )}
          {r.kind === 'gov' && (r.position || r.excerpt) && (
            <div className="rec__excerpt">{r.position ? `${positionLabel(r.position)} · ` : ''}{r.excerpt}</div>
          )}
          {r.kind === 'vote' && r.vote && (
            <div className="rec__tally"><VoteTally yes={r.vote.yes} no={r.vote.no} abstain={r.vote.abstain} result={r.vote.result} size="md" /></div>
          )}
        </a>
      ))}
    </div>
  );
}

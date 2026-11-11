import React from 'react';
import { Link } from 'react-router';
import Collapsible from '../ui/Collapsible';
import VoteTally from '../issue/VoteTally';

function Row({ title, meta, issueIds }) {
  const to = issueIds && issueIds[0] ? `/issues/${issueIds[0]}` : null;
  const body = (
    <>
      <div className="day-row__title">{title}</div>
      <div className="day-row__meta"><span>{meta}</span>{to && <span className="day-row__link">이슈 보기</span>}</div>
    </>
  );
  return to ? <Link className="day-row" to={to}>{body}</Link> : <div className="day-row">{body}</div>;
}

/** 국회 오늘: 표결 + 발의 법안. 절차성 안건은 "그 밖 N건"으로 접음. */
export function AssemblyToday({ votes, bills }) {
  const main = (votes || []).filter((v) => !v.procedural);
  const proc = (votes || []).filter((v) => v.procedural);
  const n = (votes || []).length; const m = (bills || []).length;
  if (!n && !m) return null;
  const summary = [n ? `본회의 표결 ${n}건` : null, m ? `발의 ${m}건` : null].filter(Boolean).join(' · ');
  return (
    <div className="day-section">
      <Collapsible summary={`국회 오늘 · ${summary}`}>
        {main.map((v) => (
          <div className="day-row" key={v.id}>
            <div className="day-row__title">{(v.title || '').replace(/^표결:\s*/, '')}</div>
            {v.vote && <VoteTally yes={v.vote.yes} no={v.vote.no} abstain={v.vote.abstain} result={v.vote.result} />}
            {v.issue_ids && v.issue_ids[0] && <Link className="day-row__link" to={`/issues/${v.issue_ids[0]}`}>이슈 보기</Link>}
          </div>
        ))}
        {proc.length > 0 && <Collapsible summary={`그 밖 ${proc.length}건`}>{proc.map((v) => <Row key={v.id} title={(v.title || '').replace(/^표결:\s*/, '')} meta={v.vote && v.vote.result} issueIds={v.issue_ids} />)}</Collapsible>}
        {(bills || []).map((b) => <Row key={b.id} title={b.title} meta="발의" issueIds={b.issue_ids} />)}
      </Collapsible>
    </div>
  );
}

/** 정부 오늘: 정책브리핑. 부처 정보가 없어 "정부"로만 표시한다. */
export function GovernmentToday({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="day-section">
      <Collapsible summary={`정부 오늘 · 정책브리핑 ${items.length}건`}>
        {items.map((g) => (
          <a className="day-row" key={g.id} href={g.url || undefined} target="_blank" rel="noreferrer">
            <div className="day-row__title">{g.title}</div>
            <div className="day-row__meta"><span>정부</span>{g.issue_ids && g.issue_ids[0] && <span className="day-row__link">이슈 연결</span>}</div>
          </a>
        ))}
      </Collapsible>
    </div>
  );
}

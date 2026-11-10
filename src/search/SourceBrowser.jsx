import React, { useState } from 'react';
import { Link } from 'react-router';
import FilterChips from '../ui/FilterChips';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import VoteTally from '../issue/VoteTally';
import { shortDate } from '../issue/format';
import { useSources } from '../hooks/useSources';

const TYPES = [
  { id: 'assembly_vote', label: '표결' },
  { id: 'assembly_bill', label: '발의 법안' },
  { id: 'gov_policy', label: '정부 발표' },
];

/** 법안·표결·정부 발표 둘러보기: 날짜 역순 커서 목록. */
export default function SourceBrowser() {
  const [type, setType] = useState('assembly_vote');
  const page = useSources(type);
  return (
    <div className="browse">
      <div className="browse__tabs"><FilterChips options={TYPES} value={type} onChange={setType} label="소스 유형" /></div>
      {page.error && <ErrorRetry message={page.error} onRetry={page.reload} />}
      <div>
        {page.items.map((s) => {
          const title = (s.title || '').replace(/^표결:\s*/, '');
          const issue = s.issue_ids && s.issue_ids[0];
          const body = (
            <>
              <div className="src-row__title">{title}</div>
              {s.vote && <VoteTally yes={s.vote.yes} no={s.vote.no} abstain={s.vote.abstain} result={s.vote.result} />}
              <div className="src-row__meta num">
                <span>{shortDate(s.published_at)}</span>
                {s.type === 'gov_policy' && <span>정부</span>}
                {issue && <Link to={`/issues/${issue}`}>이슈 보기</Link>}
                {s.url && <a href={s.url} target="_blank" rel="noreferrer">원문</a>}
              </div>
            </>
          );
          return <div className="src-row" key={s.id}>{body}</div>;
        })}
      </div>
      {page.loading && <Skeleton lines={2} rows={page.items.length ? 1 : 4} />}
      {!page.loading && page.hasMore && <div className="issues__more"><button type="button" className="btn btn--outline" onClick={page.loadMore}>더 보기</button></div>}
    </div>
  );
}

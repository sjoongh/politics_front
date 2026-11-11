import React, { useEffect, useRef } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router';
import FilterChips from '../ui/FilterChips';
import SegmentedSort from '../ui/SegmentedSort';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import IssueRow from '../issue/IssueRow';
import { useIssuesPage } from '../hooks/useIssuesPage';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useScrollRestore } from '../hooks/useScrollRestore';
import './Issues.css';

export const FILTERS = [
  { id: 'all', label: '전체', value: null },
  { id: 'has_official', label: '공식 기록 있음', value: 'has_official' },
  { id: 'has_vote', label: '표결 있음', value: 'has_vote' },
  { id: 'has_gov', label: '정부 발표 있음', value: 'has_gov' },
  { id: 'live', label: '진행중', value: 'status:진행중' },
  { id: 'pass', label: '가결', value: 'status:가결' },
];
export const SORTS = [
  { id: 'rank', label: '주목도순' },
  { id: 'updated', label: '갱신순' },
  { id: 'media', label: '보도 많은 순' },
];

export default function Issues() {
  const [params, setParams] = useSearchParams();
  const { id } = useParams();
  const desktop = useIsDesktop();
  const filterId = FILTERS.some((f) => f.id === params.get('f')) ? params.get('f') : 'all';
  const sort = SORTS.some((s) => s.id === params.get('s')) ? params.get('s') : 'rank';
  const filter = FILTERS.find((f) => f.id === filterId).value;
  const page = useIssuesPage({ sort, filter });
  const split = desktop && !!id;
  const detailOnly = !desktop && !!id;

  useScrollRestore(`issues:${filterId}:${sort}`, !detailOnly && !page.loading);
  // 상세 닫힘 후 포커스를 선택했던 행으로 복귀(키보드 사용자)
  const lastId = useRef(null);
  useEffect(() => {
    if (id) { lastId.current = id; return; }
    if (lastId.current) {
      const el = document.querySelector(`[data-issue-id="${lastId.current}"]`);
      if (el) el.focus({ preventScroll: false });
      lastId.current = null;
    }
  }, [id, page.loading]);
  useEffect(() => { if (!detailOnly) window.scrollTo(0, 0); }, [filterId, sort]); // eslint-disable-line react-hooks/exhaustive-deps

  const setParam = (k, v) => {
    const next = new URLSearchParams(params);
    if (v && v !== 'all' && v !== 'rank') next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const linkTo = (issueId) => `/issues/${issueId}${params.toString() ? `?${params}` : ''}`;

  if (detailOnly) return <Outlet />;

  return (
    <div className={`issues${split ? ' is-split' : ''}`}>
      <div className="issues__pane">
        <div className="issues__controls">
          <FilterChips options={FILTERS} value={filterId} onChange={(v) => setParam('f', v)} />
          <SegmentedSort options={SORTS} value={sort} onChange={(v) => setParam('s', v)} />
        </div>
        {page.error && <ErrorRetry message={page.error} onRetry={page.reload} />}
        <div className="issues__list hairline-list">
          {page.items.map((iss) => <IssueRow key={iss.id} issue={iss} to={linkTo(iss.id)} replace={split} selected={iss.id === id} />)}
        </div>
        {page.loading && <Skeleton lines={3} rows={page.items.length ? 1 : 4} />}
        {!page.loading && page.hasMore && (
          <div className="issues__more"><button type="button" className="btn btn--outline" onClick={page.loadMore}>더 보기</button></div>
        )}
      </div>
      {split && <div className="issues__detail"><Outlet /></div>}
    </div>
  );
}

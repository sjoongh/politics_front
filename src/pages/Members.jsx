import React, { useEffect, useMemo, useRef } from 'react';
import { Outlet, useParams, useSearchParams } from 'react-router';
import { Search } from 'lucide-react';
import FilterChips from '../ui/FilterChips';
import SegmentedSort from '../ui/SegmentedSort';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import MemberRow from '../member/MemberRow';
import { filterMembers, partyOptions } from '../member/memberModel';
import { useMembers } from '../hooks/useMembers';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useScrollRestore } from '../hooks/useScrollRestore';
import './Members.css';

const SORTS = [{ id: 'name', label: '이름순' }, { id: 'criminal', label: '전과순' }, { id: 'term', label: '선수순' }];

export default function Members() {
  const [params, setParams] = useSearchParams();
  const { id } = useParams();
  const desktop = useIsDesktop();
  const { members, loading, error, refresh } = useMembers();
  const query = params.get('q') || '';
  const party = params.get('p') || '전체';
  const sort = SORTS.some((s) => s.id === params.get('s')) ? params.get('s') : 'name';
  const list = useMemo(() => filterMembers(members, { query, party, sort }), [members, query, party, sort]);
  const parties = useMemo(() => partyOptions(members), [members]);
  const split = desktop && !!id;
  const detailOnly = !desktop && !!id;
  useScrollRestore(`members:${query}:${party}:${sort}`, !detailOnly && !loading);
  const lastId = useRef(null);
  useEffect(() => {
    if (id) { lastId.current = id; return; }
    if (lastId.current) {
      const el = document.querySelector(`[data-member-id="${lastId.current}"]`);
      if (el) el.focus();
      lastId.current = null;
    }
  }, [id, loading]);

  const setParam = (k, v, def) => {
    const next = new URLSearchParams(params);
    if (v && v !== def) next.set(k, v); else next.delete(k);
    setParams(next, { replace: true });
  };
  const linkTo = (mid) => `/members/${mid}${params.toString() ? `?${params}` : ''}`;

  if (detailOnly) return <Outlet />;
  return (
    <div className={`members${split ? ' is-split' : ''}`}>
      <div className="members__pane">
        <div className="members__controls">
          <label className="members__search"><Search size={16} aria-hidden="true" />
            <input value={query} onChange={(e) => setParam('q', e.target.value, '')} placeholder="이름·지역구" aria-label="의원 검색" />
          </label>
          <FilterChips options={parties} value={party} onChange={(v) => setParam('p', v, '전체')} label="정당" />
          <SegmentedSort options={SORTS} value={sort} onChange={(v) => setParam('s', v, 'name')} />
        </div>
        {error && <ErrorRetry message={error} onRetry={refresh} />}
        {loading ? <Skeleton lines={2} rows={6} /> : (
          <>
            <div className="members__count num">{list.length}명</div>
            <div className="hairline-list">{list.map((m) => <MemberRow key={m.id} member={m} to={linkTo(m.id)} replace={split} selected={m.id === id} />)}</div>
          </>
        )}
      </div>
      {split && <div className="members__detail"><Outlet /></div>}
    </div>
  );
}

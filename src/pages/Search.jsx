import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Search as SearchIcon } from 'lucide-react';
import IssueRow from '../issue/IssueRow';
import MemberRow from '../member/MemberRow';
import AiSearchResults from '../components/AiSearchResults';
import SourceBrowser from '../search/SourceBrowser';
import Skeleton from '../ui/Skeleton';
import { matchIssues, matchMembers, normalizeQuery } from '../search/catalogMatch';
import { getIssues } from '../hooks/issues';
import { useMembers } from '../hooks/useMembers';
import { useAiSearch } from '../hooks/useNewsHooks';
import { useReader } from '../layout/AppFrame';
import './Search.css';

export default function Search() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const q = normalizeQuery(params.get('q'));
  const [input, setInput] = useState(params.get('q') || '');
  const [issues, setIssues] = useState([]);
  const { members } = useMembers();
  const ai = useAiSearch();
  const { openArticle } = useReader();

  useEffect(() => { getIssues(null, 200).then(setIssues).catch(() => {}); }, []);
  useEffect(() => { setInput(params.get('q') || ''); }, [params]);
  useEffect(() => { if (q) ai.run(q); else ai.clear(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const issueHits = useMemo(() => matchIssues(issues, q), [issues, q]);
  const memberHits = useMemo(() => matchMembers(members, q), [members, q]);
  const submit = (e) => {
    e.preventDefault();
    const term = input.trim();
    setParams(term ? { q: term } : {}, { replace: false });
  };

  return (
    <div className="search">
      <form className="search__box" role="search" onSubmit={submit}>
        <SearchIcon size={18} aria-hidden="true" />
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="이슈·의원·기사" aria-label="검색어" autoFocus />
        <button type="submit">검색</button>
      </form>
      {!q && <SourceBrowser />}
      {q && (
        <>
          {issueHits.length > 0 && (
            <section><h2 className="section-title">이슈 {issueHits.length}</h2>
              <div className="hairline-list">{issueHits.map((i) => <IssueRow key={i.id} issue={i} onSelect={(id) => navigate(`/issues/${id}`)} />)}</div>
            </section>
          )}
          {memberHits.length > 0 && (
            <section><h2 className="section-title">의원 {memberHits.length}</h2>
              <div className="hairline-list">{memberHits.map((m) => <MemberRow key={m.id} member={m} onSelect={(id) => navigate(`/members/${id}`)} />)}</div>
            </section>
          )}
          <section>
            <h2 className="section-title">기사</h2>
            {ai.loading && <Skeleton lines={2} rows={3} />}
            {!ai.loading && ai.result && (
              <AiSearchResults result={ai.result} query={q} briefingLoading={ai.briefingLoading}
                onRunBriefing={() => ai.runBriefing(q)} onDetailClick={(type, content) => openArticle(content, (ai.result && ai.result.items) || [])} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

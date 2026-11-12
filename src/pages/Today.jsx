import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import IssueRow from '../issue/IssueRow';
import TopIssueBlock from '../today/TopIssueBlock';
import { AssemblyToday, GovernmentToday } from '../today/DaySection';
import { useToday } from '../hooks/useToday';
import { useIssuesPage } from '../hooks/useIssuesPage';
import { useReader } from '../layout/AppFrame';
import { getNewsDetail } from '../hooks/useNews';
import { kstToday, shiftDate, formatHeader, isFuture, isValidDate } from '../today/dateNav';
import './Today.css';

export default function Today() {
  const { date: param } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { openArticle } = useReader();
  const today = kstToday();
  const date = param && isValidDate(param) && !isFuture(param) ? param : today;
  const isToday = date === today;
  const ed = useToday(isToday ? null : date);
  const feed = useIssuesPage({ sort: 'rank', filter: null, limit: 30, enabled: isToday });

  const sharedArticleId = location.state?.article;
  const [articleError, setArticleError] = useState(null);
  const [articleRetry, setArticleRetry] = useState(0);

  // 성공 전까지 딥링크 state를 보존해 조회 실패 시 같은 기사를 재시도한다.
  useEffect(() => {
    if (!sharedArticleId) return undefined;
    let active = true;
    setArticleError(null);
    getNewsDetail(sharedArticleId).then((r) => {
      if (!active) return;
      if (!r?.article) {
        setArticleError('공유된 기사를 찾을 수 없습니다.');
        return;
      }
      openArticle(r.article, []);
      navigate(location.pathname, { replace: true, state: null });
    }).catch(() => {
      if (active) setArticleError('공유된 기사를 불러오지 못했습니다.');
    });
    return () => { active = false; };
  }, [sharedArticleId, articleRetry, location.pathname, navigate, openArticle]);

  const go = (d) => navigate(d === today ? '/' : `/today/${d}`);
  const edition = ed.edition;
  const top = (edition && edition.top_issues) || [];
  const topIds = new Set(top.map((t) => t.id));
  const feedItems = isToday ? feed.items.filter((i) => !topIds.has(i.id)) : ed.otherIssues;

  return (
    <div className="today">
      {sharedArticleId && (articleError
        ? <ErrorRetry message={articleError} onRetry={() => setArticleRetry((n) => n + 1)} />
        : <div role="status" aria-label="공유된 기사 불러오는 중"><Skeleton lines={2} rows={1} /></div>)}
      <div className="today__head">
        <button type="button" className="today__nav" onClick={() => go(shiftDate(date, -1))} aria-label="전날"><ChevronLeft size={22} /></button>
        <h1 className="today__date">{formatHeader(date)}</h1>
        <button type="button" className="today__nav" onClick={() => go(shiftDate(date, 1))} disabled={isToday} aria-label="다음날"><ChevronRight size={22} /></button>
      </div>
      {edition && edition.overview && <p className="today__overview">{edition.overview}</p>}
      {ed.loading && <Skeleton lines={3} rows={2} />}
      {top.map((snap, i) => <TopIssueBlock key={snap.id} snap={snap} index={i} />)}
      {edition && <AssemblyToday votes={edition.assembly && edition.assembly.votes} bills={edition.assembly && edition.assembly.bills} />}
      {edition && <GovernmentToday items={edition.government} />}
      {isToday && feed.error && <ErrorRetry message={feed.error} onRetry={feed.reload} />}
      {!isToday && ed.error && <ErrorRetry message={ed.error} onRetry={ed.reload} />}
      <div className="hairline-list">
        {feedItems.map((iss) => <IssueRow key={iss.id} issue={iss} />)}
      </div>
      {isToday && feed.loading && <Skeleton lines={3} rows={feed.items.length ? 1 : 3} />}
      {isToday && !feed.loading && feed.hasMore && (
        <div className="issues__more"><button type="button" className="btn btn--outline" onClick={feed.loadMore}>더 보기</button></div>
      )}
    </div>
  );
}

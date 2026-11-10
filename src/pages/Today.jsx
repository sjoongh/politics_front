import React, { useEffect } from 'react';
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
  const feed = useIssuesPage({ sort: 'rank', filter: null, limit: 30 });

  // 레거시 ?article= 딥링크: 리더 열기
  useEffect(() => {
    const aid = location.state && location.state.article;
    if (!aid) return;
    getNewsDetail(aid).then((r) => { if (r && r.article) openArticle(r.article, []); }).catch(() => {});
    navigate(location.pathname, { replace: true, state: null });
  }, [location.state, location.pathname, navigate, openArticle]);

  const go = (d) => navigate(d === today ? '/' : `/today/${d}`);
  const edition = ed.edition;
  const top = (edition && edition.top_issues) || [];
  const topIds = new Set(top.map((t) => t.id));
  const feedItems = isToday ? feed.items.filter((i) => !topIds.has(i.id)) : ed.otherIssues;

  return (
    <div className="today">
      <div className="today__head">
        <button type="button" className="today__nav" onClick={() => go(shiftDate(date, -1))} aria-label="전날"><ChevronLeft size={22} /></button>
        <h1 className="today__date">{formatHeader(date)}</h1>
        <button type="button" className="today__nav" onClick={() => go(shiftDate(date, 1))} disabled={isToday} aria-label="다음날"><ChevronRight size={22} /></button>
      </div>
      {edition && edition.overview && <p className="today__overview">{edition.overview}</p>}
      {ed.loading && <Skeleton lines={3} rows={2} />}
      {top.map((snap, i) => <TopIssueBlock key={snap.id} snap={snap} index={i} onOpen={(id) => navigate(`/issues/${id}`)} />)}
      {edition && <AssemblyToday votes={edition.assembly && edition.assembly.votes} bills={edition.assembly && edition.assembly.bills} />}
      {edition && <GovernmentToday items={edition.government} />}
      {isToday && feed.error && <ErrorRetry message={feed.error} onRetry={feed.reload} />}
      <div className="hairline-list">
        {feedItems.map((iss) => <IssueRow key={iss.id} issue={iss} onSelect={(id) => navigate(`/issues/${id}`)} />)}
      </div>
      {isToday && feed.loading && <Skeleton lines={3} rows={feed.items.length ? 1 : 3} />}
      {isToday && !feed.loading && feed.hasMore && (
        <div className="issues__more"><button type="button" className="btn btn--outline" onClick={feed.loadMore}>더 보기</button></div>
      )}
    </div>
  );
}

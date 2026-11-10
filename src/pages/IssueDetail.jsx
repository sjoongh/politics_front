import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, Share2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Badge from '../ui/Badge';
import AnchorTabs from '../ui/AnchorTabs';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import OfficialRecordList from '../issue/OfficialRecordList';
import StanceTable from '../issue/StanceTable';
import Timeline from '../issue/Timeline';
import PressSection from '../issue/PressSection';
import ProposerChips from '../issue/ProposerChips';
import { officialRecords, timelineItems, stanceRows, pressModel, proposerChips } from '../issue/detailModel';
import { useIssueDetail } from '../hooks/useIssueDetail';
import { goBackToList } from '../hooks/backRules';
import { useMembers } from '../hooks/useMembers';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useReader } from '../layout/AppFrame';
import { issueShareUrl } from '../config/share';
import { trackSelectContent, trackShare } from '../analytics';
import './IssueDetail.css';

export default function IssueDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const { detail, loading, error, reload } = useIssueDetail(id);
  const { members } = useMembers();
  const { openArticle } = useReader();
  const [active, setActive] = useState('records');

  // 병합된 이슈면 응답 id로 URL 교체
  useEffect(() => {
    if (detail && detail.id && detail.id !== id) navigate(`/issues/${detail.id}`, { replace: true });
  }, [detail, id, navigate]);
  useEffect(() => { if (detail && detail.id) trackSelectContent('issue', detail.id); }, [detail]);

  const records = useMemo(() => (detail ? officialRecords(detail) : []), [detail]);
  const timeline = useMemo(() => (detail ? timelineItems(detail) : []), [detail]);
  const stance = useMemo(() => (detail ? stanceRows(detail) : []), [detail]);
  const press = useMemo(() => (detail ? pressModel(detail) : null), [detail]);
  const chips = useMemo(() => (detail ? proposerChips(detail, members) : []), [detail, members]);

  const close = () => goBackToList(navigate, `/issues${params.toString() ? `?${params}` : ''}`, desktop);
  const share = async () => {
    const url = issueShareUrl(detail.id);
    const data = { title: `브리핑 코리아 · ${detail.title}`, text: detail.title, url };
    try {
      if (navigator.share) { await navigator.share(data); trackShare('issue', detail.id, 'native'); }
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast.success('링크를 복사했어요'); trackShare('issue', detail.id, 'clipboard'); }
    } catch (_) { /* 취소 */ }
  };
  const jump = (sec) => {
    setActive(sec);
    const el = document.getElementById(`sec-${sec}`);
    if (el) el.scrollIntoView({ block: 'start' });
  };

  const tabs = [
    { id: 'records', label: '공식 기록', count: records.length },
    { id: 'stance', label: '입장', count: stance.length },
    { id: 'timeline', label: '타임라인', count: timeline.length },
    { id: 'press', label: '보도', count: press ? press.total : 0 },
  ];

  return (
    <article className="detail">
      <div className="detail__top">
        <button type="button" className="detail__back" onClick={close} aria-label={desktop ? '닫기' : '이슈 목록으로'}>
          {desktop ? <X size={18} /> : <ArrowLeft size={18} />}{desktop ? '' : '이슈'}
        </button>
        {detail && <button type="button" className="detail__action" onClick={share}><Share2 size={16} /> 공유</button>}
      </div>
      {loading && <Skeleton lines={4} rows={2} />}
      {error && !loading && <ErrorRetry message={error} onRetry={reload} />}
      {detail && (
        <>
          <div className="detail__badges"><Badge kind="status" value={detail.status} /><Badge kind="category" value={detail.category} /></div>
          <h1 className="detail__title">{detail.type === 'bill' && detail.law_name ? detail.law_name : detail.title}</h1>
          {detail.summary && <p className="detail__summary">{detail.summary}</p>}
          {/* allow-ui-rule */}{detail.auto_generated && <p className="detail__note">여러 보도를 묶어 자동 생성한 이슈입니다. 요약·분류에 오류가 있을 수 있습니다.</p>}

          <section id="sec-records" className="detail__section">
            <h2 className="section-title">공식 기록</h2>
            <OfficialRecordList records={records} />
          </section>

          {stance.length > 0 && (
            <section id="sec-stance" className="detail__section">
              <h2 className="section-title">입장</h2>
              <StanceTable rows={stance} />
            </section>
          )}

          <AnchorTabs tabs={tabs} active={active} onSelect={jump} />

          {timeline.length > 0 && (
            <section id="sec-timeline" className="detail__section">
              <h2 className="section-title">타임라인</h2>
              <Timeline items={timeline} />
            </section>
          )}

          {press && press.total > 0 && (
            <section id="sec-press" className="detail__section">
              <h2 className="section-title">수집된 보도 분포</h2>
              <PressSection issueId={detail.id} model={press} articles={detail.articles || []} articlesCursor={detail.articles_cursor}
                onOpenArticle={(a, pool) => openArticle(a, pool)} />
            </section>
          )}

          {chips.length > 0 && (
            <section className="detail__section">
              <h2 className="section-title">발의 의원</h2>
              <ProposerChips chips={chips} />
            </section>
          )}
        </>
      )}
    </article>
  );
}

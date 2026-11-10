import React, { useEffect } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';
import { ArrowLeft, X } from 'lucide-react';
import Badge from '../ui/Badge';
import Skeleton from '../ui/Skeleton';
import ErrorRetry from '../ui/ErrorRetry';
import VoteSummary from '../member/VoteSummary';
import { voteRows } from '../member/memberModel';
import { useMemberDetail } from '../hooks/useMembers';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { trackSelectContent } from '../analytics';
import { shortDate } from '../issue/format';
import './IssueDetail.css';
import './Members.css';

const voteCls = (v) => (v === '찬성' ? 'yes' : v === '반대' ? 'no' : 'etc');

export default function MemberDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const desktop = useIsDesktop();
  const { detail, loading } = useMemberDetail(id);
  useEffect(() => { if (detail && detail.id) trackSelectContent('member', detail.id); }, [detail]);
  const close = () => navigate(`/members${params.toString() ? `?${params}` : ''}`, { replace: desktop });
  const profile = detail ? [detail.district, detail.committee, detail.term].filter(Boolean).join(' · ') : '';
  const votes = voteRows(detail);
  const bills = (detail && Array.isArray(detail.bills) ? detail.bills : []).slice(0, 12);
  const records = (detail && detail.criminal_records) || [];

  return (
    <article className="detail">
      <div className="detail__top">
        <button type="button" className="detail__back" onClick={close} aria-label={desktop ? '닫기' : '의원 목록으로'}>
          {desktop ? <X size={18} /> : <ArrowLeft size={18} />}{desktop ? '' : '의원'}
        </button>
      </div>
      {loading && <Skeleton lines={3} rows={2} />}
      {!loading && !detail && <ErrorRetry message="의원 정보를 불러오지 못했습니다" onRetry={() => navigate(0)} />}
      {detail && (
        <>
          <div className="detail__badges"><Badge kind="category" value={detail.party || '무소속'} /></div>
          <h1 className="detail__title">{detail.name}</h1>
          {profile && <p className="mdetail__profile">{profile}</p>}
          {detail.source_url && <div className="mdetail__links"><a href={detail.source_url} target="_blank" rel="noreferrer">공식 프로필</a></div>}

          {detail.vote_summary && (
            <section className="detail__section"><h2 className="section-title">표결 요약</h2><VoteSummary summary={detail.vote_summary} /></section>
          )}
          {votes.length > 0 && (
            <section className="detail__section">
              <h2 className="section-title">주요 표결</h2>
              <div>
                {votes.slice(0, 30).map((v, i) => (
                  <div className="vote-row" key={i}>
                    <span className={`vote-row__tag vote-row__tag--${voteCls(v.vote)}`}>{v.vote}</span>
                    <span>{v.bill}{v.date ? <span className="record__meta"> {shortDate(v.date)}</span> : null}</span>
                    {v.issueId ? <Link className="vote-row__link" to={`/issues/${v.issueId}`}>이슈</Link>
                      : v.link ? <a className="vote-row__link" href={v.link} target="_blank" rel="noreferrer">의안</a> : <span />}
                  </div>
                ))}
              </div>
            </section>
          )}
          {bills.length > 0 && (
            <section className="detail__section">
              <h2 className="section-title">발의 법안{detail.bill_stats ? ` · ${detail.bill_stats.total}건` : ''}</h2>
              <div>
                {bills.map((b, i) => (
                  <a className="bill-row" key={i} href={b.url || b.link || undefined} target="_blank" rel="noreferrer">
                    <span>{b.name}</span><span className="bill-row__status">{b.outcome || b.status || b.result || ''}</span>
                  </a>
                ))}
              </div>
            </section>
          )}
          <section className="detail__section">
            <h2 className="section-title">전과 (확정 판결)</h2>
            {records.length > 0 ? records.map((r, i) => (
              <div className="record" key={i}>
                <div>{r.offense}</div>
                <div className="record__meta">{r.disposition}{r.year ? ` · ${r.year}` : ''}{r.source_url && <> · <a href={r.source_url} target="_blank" rel="noreferrer">출처</a></>}</div>
              </div>
            )) : <div className="rec--empty">공개된 확정 전과 없음</div>}
          </section>
          {detail.disclaimer && <p className="mdetail__disclaimer">{detail.disclaimer}</p>}
        </>
      )}
    </article>
  );
}

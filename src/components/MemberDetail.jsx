import React from 'react';
import { useMemberDetail } from './useMembers';

export default function MemberDetail({ memberId, onClose }) {
  const { detail, loading } = useMemberDetail(memberId);

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const records = (detail && detail.criminal_records) || [];
  const profileLine = detail
    ? [detail.district, detail.committee, detail.term].filter(Boolean).join(' · ')
    : '';

  return (
    <div className="bk-modal" onClick={handleOverlay}>
      <div className="bk-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>

        {loading && <p className="bk-card__summary">불러오는 중…</p>}
        {!loading && !detail && <p className="bk-card__summary">의원 정보를 불러오지 못했습니다.</p>}

        {detail && (
          <>
            <span className="bk-badge">{detail.party || '무소속'}</span>
            <h3>{detail.name}</h3>
            {profileLine && <p>{profileLine}</p>}

            {detail.source_url && (
              <div className="issue-links">
                <a href={detail.source_url} target="_blank" rel="noreferrer" className="issue-link">🔗 공식 프로필</a>
              </div>
            )}

            <div className="issue-section-title">전과 (확정 판결)</div>
            {records.length > 0 ? (
              <div className="issue-timeline">
                {records.map((r, i) => (
                  <div key={i} className="issue-event">
                    <div className="issue-event__headline">{r.offense}</div>
                    <div className="issue-event__summary">
                      {r.disposition}{r.year ? ` · ${r.year}` : ''}
                      {r.source_url && (
                        <> · <a href={r.source_url} target="_blank" rel="noreferrer">출처</a></>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="bk-card__summary">공개된 확정 전과 없음</p>
            )}

            {Array.isArray(detail.votes) && detail.votes.length > 0 && (
              <>
                <div className="issue-section-title">🗳️ 주요 표결</div>
                {detail.vote_summary && (
                  <div className="bill-stats">
                    <div className="bill-stat"><span className="bill-stat__num" style={{ color: '#16a34a' }}>{detail.vote_summary['찬성']}</span><span className="bill-stat__label">찬성</span></div>
                    <div className="bill-stat"><span className="bill-stat__num" style={{ color: '#dc2626' }}>{detail.vote_summary['반대']}</span><span className="bill-stat__label">반대</span></div>
                    <div className="bill-stat"><span className="bill-stat__num">{detail.vote_summary['기권']}</span><span className="bill-stat__label">기권</span></div>
                    <div className="bill-stat"><span className="bill-stat__num">{detail.vote_summary['불참']}</span><span className="bill-stat__label">불참</span></div>
                  </div>
                )}
                <div className="issue-timeline">
                  {detail.votes.slice(0, 10).map((v, i) => (
                    <div key={i} className="issue-event">
                      <div className="issue-event__headline">
                        <span className={`vote-tag vote-tag--${v.vote === '찬성' ? 'yes' : v.vote === '반대' ? 'no' : 'etc'}`}>{v.vote}</span> {v.bill}
                      </div>
                      {v.link && <a className="issue-event__summary" href={v.link} target="_blank" rel="noreferrer">의안 보기</a>}
                    </div>
                  ))}
                </div>
              </>
            )}

            {Array.isArray(detail.bills) && detail.bills.length > 0 && (
              <>
                <div className="issue-section-title">📜 대표발의 법안</div>
                {detail.bill_stats && (
                  <div className="bill-stats">
                    <div className="bill-stat"><span className="bill-stat__num">{detail.bill_stats.total}</span><span className="bill-stat__label">발의</span></div>
                    <div className="bill-stat"><span className="bill-stat__num" style={{ color: '#16a34a' }}>{detail.bill_stats.enacted}</span><span className="bill-stat__label">가결·반영</span></div>
                    <div className="bill-stat"><span className="bill-stat__num">{detail.bill_stats.pending}</span><span className="bill-stat__label">심사중</span></div>
                    <div className="bill-stat"><span className="bill-stat__num">{detail.bill_stats.enacted_rate}%</span><span className="bill-stat__label">입법성과율</span></div>
                  </div>
                )}
                <div className="bill-list">
                  {detail.bills.slice(0, 12).map((b, i) => (
                    <a key={i} className="bill-row" href={b.url} target="_blank" rel="noreferrer">
                      <span className={`bill-tag bill-tag--${b.outcome || 'pending'}`}>{b.status || '심사중'}</span>
                      <span className="bill-row__name">{b.name}</span>
                    </a>
                  ))}
                </div>
              </>
            )}

            {detail.disclaimer && (
              <p className="member-disclaimer">{detail.disclaimer}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

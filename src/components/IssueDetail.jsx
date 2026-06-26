import React from 'react';
import { useIssueDetail } from './useIssues';
import { statusBadgeClass } from './issueStatus';
import { formatDate } from '../utils/dateUtils';
import NewsCard from './NewsCard';
import { partyColor } from '../utils/partyColors';
import { Share2 } from 'lucide-react';
import toast from 'react-hot-toast';

const POSITION = {
  support: { label: '찬성', cls: 'pos--support' },
  oppose: { label: '반대', cls: 'pos--oppose' },
  criticize: { label: '비판', cls: 'pos--criticize' },
  propose: { label: '발의/제안', cls: 'pos--propose' },
  explain: { label: '설명', cls: 'pos--explain' },
  neutral: { label: '중립', cls: 'pos--neutral' },
};

function SourceItem({ s }) {
  const pos = POSITION[s.position];
  return (
    <a className="src-item" href={s.url} target="_blank" rel="noreferrer">
      <div className="src-item__head">
        <span className="src-item__actor">{s.actor_name}</span>
        {pos && <span className={`position-tag ${pos.cls}`}>{pos.label}</span>}
      </div>
      <div className="src-item__title">{s.claim_summary || s.title}</div>
      {s.vote && (
        <div className="src-item__vote">
          찬성 {s.vote.yes} · 반대 {s.vote.no} · 기권 {s.vote.abstain}
          {s.vote.result && <strong> → {s.vote.result}</strong>}
        </div>
      )}
    </a>
  );
}

function Panel({ icon, title, items }) {
  return (
    <div className="src-panel">
      <div className="src-panel__title">{icon} {title} <span className="src-panel__count">{items.length}</span></div>
      {items.length > 0 ? items.map((s, i) => <SourceItem key={s.id || i} s={s} />)
        : <div className="src-panel__empty">해당 소스 없음</div>}
    </div>
  );
}

function PartyPanel({ groups }) {
  return (
    <div className="src-panel">
      <div className="src-panel__title">🗣 정당 입장 <span className="src-panel__count">{groups.length}</span></div>
      {groups.length > 0 ? groups.map((g, i) => (
        <div key={i} className="party-stance" style={{ '--party-color': partyColor(g.party) }}>
          <div className="party-stance__head">
            <span className="party-stance__dot" /> {g.party}
            <span className="party-stance__count">{g.count}건</span>
          </div>
          {(g.articles || []).slice(0, 3).map((a, j) => (
            <a key={j} className="party-stance__item" href={a.source_url} target="_blank" rel="noreferrer">
              <span className="party-stance__src">{a.source}</span> {a.title}
            </a>
          ))}
        </div>
      )) : <div className="src-panel__empty">정당 입장 없음</div>}
      {groups.length > 0 && (
        <p className="persp-disclaimer">※ 정당명이 언급된 보도를 자동 분류한 참고용이며, 정당의 공식 입장과 다를 수 있습니다.</p>
      )}
    </div>
  );
}

function SourcePanels({ panels }) {
  const gov = panels.government || [];
  const bills = panels.assembly_bill || [];
  const votes = panels.assembly_vote || [];
  const party = panels.party || [];
  if (gov.length + bills.length + votes.length + party.length === 0) return null;
  return (
    <div className="source-panels">
      <div className="issue-section-title">🔗 1차 소스 — 사건의 전체 그림</div>
      <Panel icon="🏛" title="정부 입장" items={gov} />
      <Panel icon="📜" title="관련 법안" items={bills} />
      <Panel icon="🗳" title="표결 결과" items={votes} />
      {party.length > 0 && <PartyPanel groups={party} />}
    </div>
  );
}

export default function IssueDetail({ issueId, onClose, onArticleClick }) {
  const { detail, loading } = useIssueDetail(issueId);

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/?issue=${issueId}`;
    const data = { title: `브리핑 코리아 · ${detail?.title || '정치 이슈'}`, text: detail?.title, url };
    try {
      if (navigator.share) await navigator.share(data);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(url); toast.success('링크를 복사했어요'); }
    } catch (_) { /* 취소 */ }
  };

  return (
    <div className="bk-modal" onClick={handleOverlay}>
      <div className="bk-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>

        {loading && <p className="bk-card__summary">불러오는 중…</p>}
        {!loading && !detail && <p className="bk-card__summary">이슈를 불러오지 못했습니다.</p>}

        {detail && (
          <>
            <div className="issue-detail__head">
              <span className={statusBadgeClass(detail.status)}>{detail.status}</span>
              <button className="issue-share" onClick={handleShare} aria-label="공유">
                <Share2 size={15} /> 공유
              </button>
            </div>
            <h3>{detail.title}</h3>
            {detail.summary && <p>{detail.summary}</p>}
            {detail.auto_generated && (
              <p className="auto-note">🤖 AI가 여러 보도를 묶어 자동 생성한 이슈입니다. 요약·분류에 오류가 있을 수 있어요.</p>
            )}

            {detail.source_panels && (
              <SourcePanels panels={detail.source_panels} />
            )}

            {detail.perspectives && detail.perspectives.breakdown.total > 0 && (
              <div className="perspectives">
                <div className="issue-section-title">📊 관점 비교</div>
                <div className="persp-bar">
                  {['left', 'center', 'right', 'foreign'].map((k) => {
                    const n = detail.perspectives.breakdown.counts[k] || 0;
                    const total = detail.perspectives.breakdown.total || 1;
                    const pct = Math.round((n / total) * 100);
                    return n > 0 ? (
                      <div key={k} className={`persp-seg persp-seg--${k}`} style={{ width: `${pct}%` }} title={`${pct}%`}>
                        {pct}%
                      </div>
                    ) : null;
                  })}
                </div>
                <div className="persp-legend">
                  <span><i className="persp-dot persp-seg--left" /> 진보 {detail.perspectives.breakdown.counts.left}</span>
                  <span><i className="persp-dot persp-seg--center" /> 중도 {detail.perspectives.breakdown.counts.center}</span>
                  <span><i className="persp-dot persp-seg--right" /> 보수 {detail.perspectives.breakdown.counts.right}</span>
                  <span><i className="persp-dot persp-seg--foreign" /> 외신 {detail.perspectives.breakdown.counts.foreign}</span>
                </div>
                {detail.perspectives.breakdown.blindspot && (
                  <div className="persp-blindspot">
                    ⚠️ {detail.perspectives.breakdown.blindspot === 'left' ? '진보' : '보수'} 성향 매체는 이 사건을 보도하지 않았습니다.
                  </div>
                )}
                {['left', 'center', 'right', 'foreign'].map((k) => {
                  const items = detail.perspectives.groups[k] || [];
                  return items.length > 0 ? (
                    <div key={k} className="persp-group">
                      <div className={`persp-group__label persp-seg--${k}`}>
                        {({ left: '진보', center: '중도', right: '보수', foreign: '외신' })[k]}
                      </div>
                      {items.map((it, i) => (
                        <a key={i} href={it.source_url} target="_blank" rel="noreferrer" className="persp-item">
                          <span className="persp-item__src">{it.source}</span> {it.title}
                        </a>
                      ))}
                    </div>
                  ) : null;
                })}
                <p className="persp-disclaimer">{detail.perspectives.disclaimer}</p>
              </div>
            )}

            {detail.official_links && detail.official_links.length > 0 && (
              <div className="issue-links">
                {detail.official_links.map((l, i) => (
                  <a key={i} href={l.url} target="_blank" rel="noreferrer" className="issue-link">🔗 {l.label}</a>
                ))}
              </div>
            )}

            {detail.events && detail.events.length > 0 && (
              <div>
                <div className="issue-section-title">타임라인</div>
                <div className="issue-timeline">
                  {detail.events.map((ev) => (
                    <div key={ev.id} className="issue-event">
                      <div className="issue-event__date">{formatDate(ev.date)}</div>
                      <div className="issue-event__headline">{ev.headline}</div>
                      {ev.summary && <div className="issue-event__summary">{ev.summary}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detail.articles && detail.articles.length > 0 && (
              <div>
                <div className="issue-section-title">관련 뉴스</div>
                <div className="feed-grid">
                  {detail.articles.map((a, idx) => (
                    <NewsCard key={a.id || idx} item={a} type="news" onDetailClick={onArticleClick} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

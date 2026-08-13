import React, { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { ExternalLink, Share2, X, Eye } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';
import { relatedNews } from '../utils/relatedNews';
import { articleShareUrl } from '../config/share';

function isIconLikeImage(url) {
  if (!url || typeof url !== 'string') return true;
  return /btn_textview\.gif$|\/icon|btn.*\.gif$/.test(url);
}

/**
 * 인앱 요약 브리핑(전문이 아닌 AI 요약 기반 — codex 리뷰 반영해 '요약'임을 명확히).
 * iframe 웹뷰를 대체. 원문은 새 탭으로.
 */
export default function NewsReaderModal({ article, pool = [], onClose }) {
  const [current, setCurrent] = useState(article);
  const panelRef = useRef(null);

  useEffect(() => { setCurrent(article); }, [article]);

  // 관련 기사 클릭으로 내용이 바뀌면 스크롤 상단으로
  useEffect(() => { if (panelRef.current) panelRef.current.scrollTop = 0; }, [current]);

  // Esc 닫기
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const related = useMemo(() => relatedNews(current, pool, 3), [current, pool]);

  if (!current) return null;
  const hasImg = current.image_url && !isIconLikeImage(current.image_url);

  const openOriginal = () => {
    if (current.source_url) window.open(current.source_url, '_blank', 'noopener,noreferrer');
  };

  const share = async () => {
    const shareUrl = current.id ? articleShareUrl(current.id) : window.location.href;
    const shareData = { title: current.title, url: shareUrl };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('링크를 복사했어요');
      } else {
        toast('공유를 지원하지 않는 환경이에요');
      }
    } catch (_) { /* 사용자가 공유 취소 */ }
  };

  return (
    <div className="bk-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="bk-modal__panel reader"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="기사 요약 브리핑"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기"><X size={18} /></button>

        {hasImg && (
          <div className="reader__hero" style={{ backgroundImage: `url(${current.image_url})` }} />
        )}

        <span className="bk-badge">{current.category || '뉴스'}</span>
        <h2 className="reader__title">{current.title}</h2>
        <div className="reader__meta">
          <span className="bk-card__src">{current.source}</span>
          <span>· {formatDate(current.published_at || current.date)}</span>
          {current.view_count > 0 && (
            <span className="reader__views"><Eye size={12} /> {current.view_count}</span>
          )}
        </div>

        <div className="reader__summary-label">AI 요약</div>
        <p className="reader__body">{current.ai_summary || '요약 정보가 아직 없어요. 원문에서 확인해 주세요.'}</p>
        <p className="reader__disclaimer">※ AI 요약은 원문을 대체하지 않습니다. 세부 내용·인용은 원문에서 확인하세요.</p>

        {Array.isArray(current.keywords) && current.keywords.length > 0 && (
          <div className="reader__keywords">
            {current.keywords.slice(0, 8).map((k, i) => (
              <span key={i} className="reader__kw">#{k}</span>
            ))}
          </div>
        )}

        {related.length > 0 && (
          <div className="reader__related">
            <div className="issue-section-title">관련 기사</div>
            {related.map((r) => (
              <button key={r.id} className="reader__related-item" onClick={() => setCurrent(r)}>
                <span className="reader__related-title">{r.title}</span>
                <span className="reader__related-src">
                  {r.source}
                  {(r.published_at || r.date) && ` · ${formatDate(r.published_at || r.date)}`}
                </span>
              </button>
            ))}
          </div>
        )}

        <div className="reader__actions">
          <button className="btn btn--primary reader__action-main" onClick={openOriginal} disabled={!current.source_url}>
            원문 보기 <ExternalLink size={15} />
          </button>
          <button className="btn btn--outline reader__action-share" onClick={share} aria-label="공유">
            <Share2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

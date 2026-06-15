import React from 'react';
import { Sparkles, Sprout, Info } from 'lucide-react';
import NewsCard from './NewsCard';

/**
 * 개인 맞춤 'For You' 피드.
 * - personalized: 관심사/북마크 기반 랭킹 + 추천 사유 노출(설명가능성)
 * - starter(콜드스타트): '맞춤'이 아닌 '시작 추천'으로 정직하게 + 관심사 설정 유도
 */
export default function ForYouFeed({ result, loading, onDetailClick, onGoSettings }) {
  if (loading && !result) {
    return <div className="empty-rich"><div className="empty-rich__icon">✨</div><p className="empty-rich__msg">맞춤 피드를 준비하고 있어요…</p></div>;
  }
  if (!result) return null;
  const { mode, profile, items = [] } = result;
  const isStarter = mode !== 'personalized';
  const isNoMatch = mode === 'no_match';
  const explicit = profile?.explicit || [];
  const implicit = profile?.implicit || [];

  return (
    <div className="foryou">
      <div className="section-head">
        <span className="section-head__title">
          {isStarter ? <Sprout size={18} /> : <Sparkles size={18} />}
          {isStarter ? '시작 추천' : '맞춤 피드'}
        </span>
        <span className="ai-search__count">{items.length}건</span>
      </div>

      {isStarter ? (
        <div className="foryou__nudge">
          <Info size={14} />
          {isNoMatch ? (
            <span>관심사와 관련된 최신 기사가 아직 없어 <b>지금 주목받는 정치뉴스</b>를 보여드려요. 곧 맞춤 기사가 채워집니다.</span>
          ) : (
            <span>아직 관심사가 없어 <b>지금 주목받는 정치뉴스</b>를 보여드려요. 관심 키워드를 등록하면 맞춤 추천이 시작됩니다.</span>
          )}
          {!isNoMatch && onGoSettings && <button className="btn btn--primary btn--sm" onClick={onGoSettings}>관심사 설정</button>}
        </div>
      ) : (
        (explicit.length > 0 || implicit.length > 0) && (
          <div className="foryou__profile">
            <span className="ai-search__interp-label">추천 기준</span>
            <div className="ai-search__chips">
              {explicit.map((k, i) => <span key={`e${i}`} className="ai-chip ai-chip--ent">{k}</span>)}
              {implicit.map((k, i) => <span key={`i${i}`} className="ai-chip ai-chip--kw">🔖 {k}</span>)}
            </div>
          </div>
        )
      )}

      {items.length > 0 ? (
        <div className="news-list">
          {items.map((news, idx) => (
            <div key={news.id || idx} className="foryou__item">
              {news.reason && <span className="foryou__reason">{news.reason}</span>}
              <NewsCard item={news} type="news" compact onDetailClick={onDetailClick} />
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-rich"><div className="empty-rich__icon">📰</div><p className="empty-rich__msg">표시할 추천 기사가 아직 없어요.</p></div>
      )}
    </div>
  );
}

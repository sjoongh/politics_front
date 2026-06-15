import React from 'react';
import { Sparkles, Info } from 'lucide-react';
import NewsCard from './NewsCard';

const PRESET_LABEL = { today: '오늘', recent: '최근', week: '이번 주', month: '이번 달', year: '올해' };
const CONF_LABEL = { high: '높음', medium: '보통', low: '낮음' };

export default function AiSearchResults({ result, query, briefingLoading, onRunBriefing, onDetailClick }) {
  if (!result) return null;
  const { parsed, items = [], briefing, mode, ai } = result;
  const isFallback = mode !== 'ai_structured';

  const chips = [];
  if (parsed) {
    (parsed.keywords || []).forEach((k) => chips.push({ t: k, kind: 'kw' }));
    (parsed.entities || []).forEach((e) => chips.push({ t: e, kind: 'ent' }));
    (parsed.parties || []).forEach((p) => chips.push({ t: p, kind: 'ent' }));
    if (parsed.category) chips.push({ t: parsed.category, kind: 'cat' });
    if (parsed.date_preset && PRESET_LABEL[parsed.date_preset]) chips.push({ t: PRESET_LABEL[parsed.date_preset], kind: 'date' });
  }

  return (
    <div className="ai-search">
      <div className="section-head">
        <span className="section-head__title">
          <Sparkles size={18} /> AI 검색 결과
        </span>
        <span className="ai-search__count">{items.length}건</span>
      </div>

      {/* AI가 이해한 검색 */}
      {!isFallback && chips.length > 0 && (
        <div className="ai-search__interp">
          <span className="ai-search__interp-label">AI가 이해한 검색</span>
          <div className="ai-search__chips">
            {chips.map((c, i) => (
              <span key={i} className={`ai-chip ai-chip--${c.kind}`}>{c.t}</span>
            ))}
          </div>
        </div>
      )}
      {isFallback && (
        <div className="ai-search__fallback">
          <Info size={13} /> AI 해석을 사용할 수 없어 키워드 검색으로 보여드려요.
        </div>
      )}

      {/* AI 브리핑 */}
      {briefing ? (
        <section className="ai-brief">
          <div className="ai-brief__head">
            <Sparkles size={15} /> AI 브리핑
            <span className="ai-brief__conf">신뢰도 {CONF_LABEL[briefing.confidence] || '낮음'}</span>
          </div>
          <p className="ai-brief__answer">{briefing.answer}</p>
          <p className="ai-brief__disclaimer">※ 제공된 기사 기반 AI 생성 요약입니다. 정확한 내용은 원문을 확인하세요.</p>
        </section>
      ) : ai?.briefing_requested && !briefingLoading ? (
        <div className="ai-search__fallback">
          <Info size={13} /> AI 브리핑을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.
        </div>
      ) : items.length > 0 && !isFallback ? (
        <button className="ai-brief__cta" onClick={onRunBriefing} disabled={briefingLoading}>
          <Sparkles size={15} /> {briefingLoading ? 'AI가 정리하는 중…' : '이 결과로 AI 브리핑 생성'}
        </button>
      ) : null}

      {/* 결과 목록 */}
      {items.length > 0 ? (
        <div className="news-list" style={{ marginTop: 14 }}>
          {items.map((news, idx) => (
            <NewsCard key={news.id || idx} item={news} type="news" compact onDetailClick={onDetailClick} />
          ))}
        </div>
      ) : (
        <div className="empty-rich">
          <div className="empty-rich__icon">🔍</div>
          <p className="empty-rich__msg">'{query}'에 대한 결과가 없어요.<br />다른 표현으로 검색해 보세요.</p>
        </div>
      )}
    </div>
  );
}

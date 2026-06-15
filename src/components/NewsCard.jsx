import React from 'react';
import { formatDate } from '../utils/dateUtils';

const NewsCard = ({ item, type, onDetailClick = () => {}, featured = false, compact = false }) => {

  function isIconLikeImage(url) {
    if (!url || typeof url !== 'string') return true;
    return /btn_textview\.gif$|\/icon|btn.*\.gif$/.test(url);
  }

  const renderPresidentPolicy = (policy) => (
    <article className="bk-card">
      <div className="bk-card__body">
        <span className="bk-badge">대통령</span>
        <h3 className="bk-card__title">{policy.title}</h3>
        {policy.context && <p className="bk-card__summary">{policy.context}</p>}
        {policy.promise_type && <p className="bk-card__summary"><strong>세부:</strong> {policy.promise_type}</p>}
        <div className="bk-card__meta">
          <span className="bk-card__src">{formatDate(policy.date)}</span>
          <button className="bk-card__more" onClick={() => onDetailClick('president', policy)}>자세히 →</button>
        </div>
      </div>
    </article>
  );

  const renderParliamentActivity = (activity) => {
    const statusClass = activity.status === '가결' ? 'bk-badge--success'
      : activity.status === '부결' ? 'bk-badge--alert' : '';
    return (
      <article className="bk-card">
        <div className="bk-card__body">
          <span className={`bk-badge ${statusClass}`}>{activity.status || '정책'}</span>
          <h3 className="bk-card__title">{activity.title}</h3>
          {activity.proposer && <p className="bk-card__summary"><strong>발의자:</strong> {activity.proposer}</p>}
          {activity.committee && <p className="bk-card__summary"><strong>소관위:</strong> {activity.committee}</p>}
          {activity.context && <p className="bk-card__summary">{activity.context}</p>}
          <div className="bk-card__meta">
            <span className="bk-card__src">{formatDate(activity.date)}</span>
            <button className="bk-card__more" onClick={() => onDetailClick('parliament', activity)}>자세히 →</button>
          </div>
        </div>
      </article>
    );
  };

  const renderPoliticalStatement = (statement) => {
    const typeClass = statement.type === '논란' ? 'bk-badge--alert' : '';
    return (
      <article className="bk-card">
        <div className="bk-card__body">
          <span className={`bk-badge ${typeClass}`}>{statement.type || '발언'}</span>
          <h3 className="bk-card__title">{statement.speaker} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>({statement.party})</span></h3>
          <p className="bk-card__quote">"{statement.context}"</p>
          {statement.speak_reason && <p className="bk-card__summary"><strong>맥락:</strong> {statement.speak_reason}</p>}
          <div className="bk-card__meta">
            <span className="bk-card__src">{formatDate(statement.date)}</span>
            <button className="bk-card__more" onClick={() => onDetailClick('statements', statement)}>자세히 →</button>
          </div>
        </div>
      </article>
    );
  };

  const renderNewsUpdate = (news) => {
    const hasImg = news.image_url && !isIconLikeImage(news.image_url);
    if (compact) {
      return (
        <article
          className="news-row bk-card--clickable"
          role="button"
          tabIndex={0}
          onClick={() => onDetailClick('news', news)}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDetailClick('news', news)}
        >
          <div
            className="news-row__thumb"
            style={hasImg ? { backgroundImage: `url(${news.image_url})` } : undefined}
            aria-hidden="true"
          />
          <div className="news-row__body">
            <h3 className="news-row__title">{news.title}</h3>
            <div className="news-row__meta">
              <span className="bk-card__src">{news.source}</span>
              {news.category && <span> · {news.category}</span>}
            </div>
          </div>
        </article>
      );
    }
    return (
      <article
        className={`bk-card bk-card--clickable ${featured ? 'bk-card--featured' : ''}`}
        role="button"
        tabIndex={0}
        onClick={() => onDetailClick('news', news)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onDetailClick('news', news)}
      >
        {hasImg && (
          <div className="bk-card__thumb" style={{ backgroundImage: `url(${news.image_url})` }} />
        )}
        <div className="bk-card__body">
          <span className="bk-badge bk-badge--alert">{news.category || '뉴스'}</span>
          <h3 className="bk-card__title">{news.title}</h3>
          <p className="bk-card__summary">{news.ai_summary}</p>
          <div className="bk-card__meta">
            <span className="bk-card__src">{news.source}</span>
            <span className="bk-card__more">자세히 →</span>
          </div>
        </div>
      </article>
    );
  };

  // 타입에 따라 적절한 렌더링 함수 선택
  switch(type) {
    case 'policy':
      return renderPresidentPolicy(item);
    case 'parliament':
      return renderParliamentActivity(item);
    case 'statement':
      return renderPoliticalStatement(item);
    case 'news':
      return renderNewsUpdate(item);
    default:
      return null;
  }
};

export default NewsCard;

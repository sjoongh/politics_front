import React from 'react';
import { formatDate } from '../utils/dateUtils';
import defaultNews from '../assets/default_news.png';

const NewsCard = ({ item, type, onDetailClick = () => {} }) => {

  const getStatusClass = (status) => {
    switch(status) {
      case '가결': return 'success';
      case '발의': return 'info';
      case '부결': return 'error';
      default: return 'info';
    }
  };

  const getCategory = (category) => {
    switch(category) {
      case 'politics': return 'info';
      case 'president': return 'success';
      case 'breaking': return 'error';
      case 'parliament': return 'warning';
      case '연대': return 'success';
      case '인사': return 'warning';
      case '수사': return 'info';
      default: return 'info';
    }
  };

  const FALLBACK_IMAGE = defaultNews;

  function isIconLikeImage(url) {
    // 너무 크기가 작거나 알려진 아이콘 gif
    return url.endsWith('btn_textview.gif') || url.match(/\/icon|btn.*\.gif$/);
  }

  const renderPresidentPolicy = (policy) => (
    <div className="card">
      <div className="card__header">
        <h3>{policy.title}</h3>
        <div className="card-meta">
          <span className="card-date">{formatDate(policy.date)}</span>
        </div>
      </div>
      <div className="card__body">
        <p>{policy.context}</p>
        {policy.promise_type && (
          <div className="news-desc">
            <strong>세부사항:</strong> {policy.promise_type}
          </div>
        )}
        {onDetailClick && (
          <button 
            className="detail-link"
            onClick={() => onDetailClick('president', policy)}
          >
            자세히 보기 →
          </button>
        )}
      </div>
    </div>
  );

  const renderParliamentActivity = (activity) => (
    <div className="card">
      <div className="card__header">
        <h3>{activity.title}</h3>
        <div className="card-meta">
          <span className="card-date">{formatDate(activity.date)}</span>
          <span className={`status status--${getStatusClass(activity.status)}`}>
            {activity.status}
          </span>
        </div>
      </div>
      <div className="card__body">
        {activity.proposer && (
          <p><strong>발의자:</strong> {activity.proposer}</p>
        )}
        {activity.committee && (
          <p><strong>소관위원회:</strong> {activity.committee}</p>
        )}
        {activity.context && (
          <p>{activity.context}</p>
        )}
        {onDetailClick && (
          <button 
            className="detail-link"
            onClick={() => onDetailClick('parliament', activity)}
          >
            자세히 보기 →
          </button>
        )}
      </div>
    </div>
  );

  const renderPoliticalStatement = (statement) => (
    <div className="card">
      <div className="card__header">
        <h3>{statement.speaker} ({statement.party})</h3>
        <div className="card-meta">
          <span className="card-date">{formatDate(statement.date)}</span>
          <span className={`status status--${getCategory(statement.type)}`}>
            {statement.type}
          </span>
        </div>
      </div>
      <div className="card__body">
        <div className="quote">
          "{statement.context}"
        </div>
        <p><strong>발언 맥락:</strong> {statement.speak_reason}</p>
        {onDetailClick && (
          <button 
            className="detail-link"
            onClick={() => onDetailClick('statements', statement)}
          >
            자세히 보기 →
          </button>
        )}
      </div>
    </div>
  );
  const renderNewsUpdate = (news) => (
    <div className="newsCardHorizontal">
      {news.image_url && (
        <div className="newsCardThumbnail">
          <img src={
            news.image_url && !isIconLikeImage(news.image_url)
            ? news.image_url
            : FALLBACK_IMAGE
          }
          alt={news.title}
          loading="lazy"
          onError={e => {
            e.target.onerror = null;
            e.target.src = FALLBACK_IMAGE;
            e.target.style.objectFit = 'contain';
          }}
          /* style={{
              objectFit: 'contain',
              width: '100%',
              height: '100%',
              background: '#ededed'
            }} 
            */
          />
        </div>
      )}
      <div className="newsCardInfo">
        <div className="newsCardHeader">
          <h3 className="newsCardTitle">{news.title}</h3>
          <div className="newsCardMeta">
            <span className="newsCardDate">{formatDate(news.published_at)}</span>
          </div>
        </div>
        <div className="newsCardBody">
          <p className="newsDesc">{news.ai_summary}</p>
          {news.source_url && (
            <div className="newsFooterRow">
              <p className="newsSource"><strong>출처:</strong> {news.source}</p>
              <button
                className="detailLink"
                onClick={() => onDetailClick('news', news)}
              >
                자세히 보기 →
              </button>
            </div>
          )}
        </div>
        <div className="newsCategoryBadge">{news.category}</div>
      </div>
    </div>
  );




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

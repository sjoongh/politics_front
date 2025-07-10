import React from 'react';
import { formatDate } from '../utils/dateUtils';

const NewsCard = ({ item, type, onDetailClick }) => {
  const getStatusClass = (status) => {
    switch(status) {
      case '가결': return 'success';
      case '발의': return 'info';
      case '부결': return 'error';
      default: return 'info';
    }
  };

  const getTypeClass = (type) => {
    switch(type) {
      case '정책': return 'success';
      case '논란': return 'error';
      case '선거': return 'warning';
      case '연대': return 'success';
      case '인사': return 'warning';
      case '수사': return 'info';
      default: return 'info';
    }
  };

  const renderPresidentPolicy = (policy) => (
    <div className="card">
      <div className="card__header">
        <h3>{policy.title}</h3>
        <div className="card-meta">
          <span className="card-date">{formatDate(policy.date)}</span>
        </div>
      </div>
      <div className="card__body">
        <p>{policy.description}</p>
        {policy.details && (
          <div className="news-desc">
            <strong>세부사항:</strong> {policy.details}
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
        {activity.description && (
          <p>{activity.description}</p>
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
          <span className={`status status--${getTypeClass(statement.type)}`}>
            {statement.type}
          </span>
        </div>
      </div>
      <div className="card__body">
        <div className="quote">
          "{statement.content}"
        </div>
        <p><strong>발언 맥락:</strong> {statement.context}</p>
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
    <div className="card">
      <div className="card__header">
        <h3>{news.title}</h3>
        <div className="card-meta">
          <span className="card-date">{formatDate(news.date)}</span>
          <span className={`status status--${getTypeClass(news.type)}`}>
            {news.type}
          </span>
        </div>
      </div>
      <div className="card__body">
        <p>{news.description}</p>
        <p className="news-source"><strong>출처:</strong> {news.source}</p>
        {onDetailClick && (
          <button 
            className="detail-link"
            onClick={() => onDetailClick('news', news)}
          >
            자세히 보기 →
          </button>
        )}
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

import React from 'react';
import NewsCard from './NewsCard';
import { formatDate } from '../utils/dateUtils';

const Dashboard = ({ data, onDetailClick, searchResults }) => {
  if (!data) return null;

  const displayData = searchResults || data;

  const renderPresidentSection = () => (
    <div className="dashboard-item">
      <div className="card">
        <div className="card__body">
          <h3>🎖️ 현재 대통령</h3>
          <div className="president-info">
            <div className="president-name">{data.current_president.name}</div>
            <p><strong>소속:</strong> {data.current_president.party}</p>
            <p><strong>취임일:</strong> {formatDate(data.current_president.start_date)}</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderRecentPolicies = () => (
    <div className="dashboard-item">
      <div className="card">
        <div className="card__body">
          <h3>📋 최근 정책</h3>
          <div className="content-cards">
            {(searchResults ? searchResults.results.policies : data.recent_policies)?.slice(0, 3).map((policy, index) => (
              <div key={index} className="news-item">
                <div className="news-date">{formatDate(policy.date)}</div>
                <div className="news-title">{policy.title}</div>
                <div className="news-desc">{policy.description}</div>
                {onDetailClick && (
                  <button 
                    className="detail-link"
                    onClick={() => onDetailClick('president', policy)}
                  >
                    자세히 보기 →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderParliamentActivities = () => (
    <div className="dashboard-item">
      <div className="card">
        <div className="card__body">
          <h3>🏛️ 국회 활동</h3>
          <div className="content-cards">
            {(searchResults ? searchResults.results.activities : data.parliamentary_activities)?.slice(0, 3).map((activity, index) => (
              <div key={index} className="news-item">
                <div className="news-date">{formatDate(activity.date)}</div>
                <div className="news-title">{activity.title}</div>
                <div className="news-desc">
                  <span className={`status status--${activity.status === '가결' ? 'success' : 'info'}`}>
                    {activity.status}
                  </span>
                  {activity.proposer && <span> | {activity.proposer}</span>}
                </div>
                {onDetailClick && (
                  <button 
                    className="detail-link"
                    onClick={() => onDetailClick('parliament', activity)}
                  >
                    자세히 보기 →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPoliticalStatements = () => (
    <div className="dashboard-item">
      <div className="card">
        <div className="card__body">
          <h3>💬 주요 정치인 발언</h3>
          <div className="content-cards">
            {(searchResults ? searchResults.results.statements : data.political_statements)?.slice(0, 3).map((statement, index) => (
              <div key={index} className="news-item">
                <div className="news-date">{formatDate(statement.date)}</div>
                <div className="news-title">{statement.speaker} ({statement.party})</div>
                <div className="quote">"{statement.content}"</div>
                <div className="news-desc">
                  <span className={`status status--${statement.type === '논란' ? 'error' : 'info'}`}>
                    {statement.type}
                  </span>
                </div>
                {onDetailClick && (
                  <button 
                    className="detail-link"
                    onClick={() => onDetailClick('statements', statement)}
                  >
                    자세히 보기 →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderNewsUpdates = () => (
    <div className="dashboard-item">
      <div className="card">
        <div className="card__body">
          <h3>📰 뉴스 업데이트</h3>
          <div className="content-cards">
            {(searchResults ? searchResults.results.news : data.news_updates)?.slice(0, 3).map((news, index) => (
              <div key={index} className="news-item">
                <div className="news-date">{formatDate(news.date)}</div>
                <div className="news-title">{news.title}</div>
                <div className="news-desc">{news.description}</div>
                <div className="news-source">출처: {news.source}</div>
                {onDetailClick && (
                  <button 
                    className="detail-link"
                    onClick={() => onDetailClick('news', news)}
                  >
                    자세히 보기 →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeyTopics = () => (
    <div className="key-topics">
      <h3 className="key-topics-title">🔍 주요 키워드</h3>
      <div className="topics-list flex gap-8">
        {data.key_topics?.map((topic, index) => (
          <span key={index} className="topic-tag">
            {topic}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="section-title">
        {searchResults ? '🔍 검색 결과' : '📊 실시간 대시보드'}
      </div>

      <div className="dashboard-grid">
        {!searchResults && renderPresidentSection()}
        {renderRecentPolicies()}
        {renderParliamentActivities()}
        {renderPoliticalStatements()}
        {renderNewsUpdates()}
      </div>

      {!searchResults && renderKeyTopics()}
    </div>
  );
};

export default Dashboard;

import React, { useState, useCallback } from 'react';
import './App.css';
import { AppProvider, useAppContext } from "./components/AppContext";
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import NewsCard from './components/NewsCard';
import Modal from './components/Modal';
import { useNews, useSearch, useExport } from './components/useNews';
import LoginForm from './components/LoginForm';

function App() {
  const { data, loading, error, refreshData } = useNews();
  const { searchResults, searchLoading, search, clearSearch } = useSearch();
  const { exportData, exporting } = useExport();
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modal, setModal] = useState({ isOpen: false, content: null, type: null });

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'president', label: '대통령 정책', icon: '🎖️' },
    { id: 'parliament', label: '국회 활동', icon: '🏛️' },
    { id: 'statements', label: '정치인 발언', icon: '💬' },
    { id: 'news', label: '뉴스', icon: '📰' }
  ];

  const handleSearch = useCallback(async (searchTerm, filters) => {
    if (searchTerm.trim()) {
      await search(searchTerm);
      setActiveTab('dashboard'); // 검색 후 대시보드로 이동
    } else {
      clearSearch();
    }
  }, [search, clearSearch]);

  const handleDetailClick = useCallback((type, content) => {
    setModal({
      isOpen: true,
      content,
      type
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ isOpen: false, content: null, type: null });
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportData();
      alert('데이터가 성공적으로 내보내기되었습니다!');
    } catch (error) {
      alert('내보내기 중 오류가 발생했습니다: ' + error.message);
    }
  }, [exportData]);

  if (!user) {
    return (
          <LoginForm />
    );
  }

  const renderTabContent = () => {
    if (!data) return null;

    const currentData = searchResults || data;

    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            data={data}
            searchResults={searchResults}
            onDetailClick={handleDetailClick}
          />
        );

      case 'president':
        return (
          <div>
            <div className="section-title">🎖️ 대통령 정책</div>
            <div className="content-cards">
              {(searchResults?.results?.policies || data.recent_policies)?.map((policy, index) => (
                <NewsCard 
                  key={index}
                  item={policy}
                  type="policy"
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        );

      case 'parliament':
        return (
          <div>
            <div className="section-title">🏛️ 국회 활동</div>
            <div className="content-cards">
              {(searchResults?.results?.activities || data.parliamentary_activities)?.map((activity, index) => (
                <NewsCard 
                  key={index}
                  item={activity}
                  type="parliament"
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        );

      case 'statements':
        return (
          <div>
            <div className="section-title">💬 주요 정치인 발언</div>
            <div className="content-cards">
              {(searchResults?.results?.statements || data.political_statements)?.map((statement, index) => (
                <NewsCard 
                  key={index}
                  item={statement}
                  type="statement"
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        );

      case 'news':
        return (
          <div>
            <div className="section-title">📰 뉴스 업데이트</div>
            <div className="content-cards">
              {(searchResults?.results?.news || data.news_updates)?.map((news, index) => (
                <NewsCard 
                  key={index}
                  item={news}
                  type="news"
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2>데이터를 불러오는 중...</h2>
        <p>잠시만 기다려 주세요.</p>
      </div>
    );
  }

  // if (error) {
  //   return (
  //     <div className="container" style={{ textAlign: 'center', padding: '2rem' }}>
  //       <h2>오류가 발생했습니다</h2>
  //       <p>{error}</p>
  //       <button className="btn btn--primary" onClick={refreshData}>
  //         다시 시도
  //       </button>
  //     </div>
  //   );
  // }

  return (
    <div className="App">
      <Header onExport={handleExport} exporting={exporting}>
        <button className="btn btn--outline ml-4" onClick={logout}>
          로그아웃
        </button>
      </Header>

      <main className="container">
        <SearchFilters 
          onSearch={handleSearch}
          onFilter={() => {}} // 추후 구현 가능
          searchLoading={searchLoading}
        />

        <Tabs 
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
        />

        <div className="tab-content active">
          {renderTabContent()}
        </div>
      </main>

      <Modal 
        isOpen={modal.isOpen}
        onClose={closeModal}
        content={modal.content}
        type={modal.type}
      />

      <footer className="main-footer">
        <div className="container">
          <div className="flex justify-between py-16">
            <div className="footer-info">
              <p>© 2025 정치 뉴스 추적기. 모든 권리 보유.</p>
              <p>뉴스 출처: 각 언론사 및 공식 보도자료</p>
            </div>
            <div className="footer-update">
              <p>마지막 업데이트: {data?.last_updated}</p>
              <button className="btn btn--outline btn--sm" onClick={refreshData}>
                🔄 새로고침
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function WrappedApp() {
  return (
    <AppProvider>
      <App />
    </AppProvider>
  );
}


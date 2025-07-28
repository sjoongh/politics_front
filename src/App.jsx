import React, { useState, useCallback } from 'react';
import './App.css';
import { AppProvider, useAppContext } from "./components/AppContext";
import Header from './components/Header';
import SearchFilters from './components/SearchFilters';
import Dashboard from './components/Dashboard';
import Tabs from './components/Tabs';
import NewsCard from './components/NewsCard';
import Modal from './components/Modal';
import { useNews, useSearch, useExport, usePresident, usePolicies, useStatements } from './components/useNews';
import LoginForm from './components/LoginForm';
import MyPage from './components/MyPage';

function App() {
  // 각 탭별로 key(id값) 필요하면 추후에 넣어서 자식한테 보내주기
  const { data, loading, error, refreshData } = useNews();
  const { searchResults, searchLoading, search, clearSearch } = useSearch();
  const { president, loading: presidentLoading } = usePresident();
  const { policies, loading: policiesLoading } = usePolicies();
  const { statements, loading: statementsLoading } = useStatements();
  const { exportData, exporting } = useExport();
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modal, setModal] = useState({ isOpen: false, content: null, type: null });
  const [webViewUrl, setWebViewUrl] = React.useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const tabs = [
    // { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'all', label: '전체', icon: '🔍' },
    { id: 'news', label: '뉴스', icon: '📰' },
    { id: 'president', label: '대통령', icon: '🎖️' },
    { id: 'parliament', label: '정책', icon: '🏛️' },
    { id: 'statements', label: '정치인 발언', icon: '💬' },
    { id: 'mypage', label: '마이페이지', icon: '👤' }
  ];

  const handleSearch = useCallback(async (searchTerm, filters) => {
    if (searchTerm.trim()) {
      await search(searchTerm);
      setActiveTab('all'); // 검색 후 대시보드로 이동
    } else {
      clearSearch();
      setActiveTab('news'); // 검색어가 없으면 뉴스 탭으로 이동
    }
  }, [search, clearSearch]);

  const handleDetailClick = useCallback((type, content) => {
    if (type === 'news' && content.source_url) {
      setWebViewUrl(content.source_url); // ✅ 웹뷰로 연결
    } else {
      setModal({
        isOpen: true,
        content,
        type
      });
    }
  }, []);

  const handleExport = useCallback(async () => {
    try {
      await exportData();
      alert('데이터가 성공적으로 내보내기되었습니다!');
    } catch (error) {
      alert('내보내기 중 오류가 발생했습니다: ' + error.message);
    }
  }, [exportData]);

  // 로그인 버튼 클릭 시
  const handleLoginOpen = () => setLoginOpen(true);

  // 로그인 성공 시: 모달 닫고 뉴스 탭으로 이동
  const handleLoginSuccess = () => {
    setLoginOpen(false);
    setActiveTab('news');
  };
  // 로그아웃 버튼 클릭시
  const handleLogout = () => {
    logout();       // 실제 로그아웃 수행
    setActiveTab('news');
    setLoginOpen(false); // 혹시 이전에 열려있던 게 있다면
  };

  const renderSearchContent = () => {
    console.log('Rendering search content for tab:', searchResults);
  const results = searchResults || {};
  switch (activeTab) {
    case 'all':
      return (
        <>
          <div className="section-title">🔍 전체 검색결과</div>
          <div>
            <h3>뉴스</h3>
            {results.articles?.slice(0, 5).map(item => (
              <NewsCard item={item} type="news" onDetailClick={handleDetailClick} />
            ))}
            <button onClick={() => setActiveTab('search_news')}>더보기</button>
          </div>
          <div>
            <h3>정책</h3>
            {results.policies?.slice(0, 5).map(item => (
              <NewsCard item={item} type="policy" onDetailClick={handleDetailClick} />
            ))}
            <button onClick={() => setActiveTab('search_policies')}>더보기</button>
          </div>
          <div>
            <h3>발언</h3>
            {results.statements?.slice(0, 5).map(item => (
              <NewsCard item={item} type="statement" onDetailClick={handleDetailClick} />
            ))}
            <button onClick={() => setActiveTab('search_statements')}>더보기</button>
          </div>
        </>
      );
    case 'search_news':
      return results.news?.map(item => (
        <NewsCard item={item} type="news" onDetailClick={handleDetailClick} />
      ));
    case 'search_policies':
      return results.policies?.map(item => (
        <NewsCard item={item} type="policy" onDetailClick={handleDetailClick} />
      ));
    case 'search_statements':
      return results.statements?.map(item => (
        <NewsCard item={item} type="statement" onDetailClick={handleDetailClick} />
      ));
    default:
      return null;
  }
  };

  const renderTabContent = () => {
     if (activeTab.startsWith('all')) return renderSearchContent();
    // if (!data) return null;
    // const currentData = searchResults || data;

    switch (activeTab) {
      /* case 'dashboard':
        return (
          <Dashboard 
            data={data}
            searchResults={searchResults}
            onDetailClick={handleDetailClick}
          />
        );
      */

      case 'president':
        return (
          <div>
            <div className="section-title">🎖️ 대통령 정책</div>
            <div className="content-cards">
              {(searchResults?.results?.policies || president)?.map((president) => (
                <NewsCard 
                  item={president}
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
            <div className="section-title">🏛️ 정책 활동</div>
            <div className="content-cards">
              {(searchResults?.results?.activities || policies)?.map((policy) => (
                <NewsCard 
                  item={policy}
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
              {(searchResults?.results?.statements || statements)?.map((statement) => (
                <NewsCard
                  item={statement}
                  type="statement"
                  onDetailClick={handleDetailClick}
                />
              ))}
            </div>
          </div>
        );

      case 'news':
        const newsList = searchResults?.results?.news || data?.articles || [];
        return (
          <div>
            <div className="section-title" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span>📰 뉴스</span>
              <button
                className="btn btn--outline btn--sm"
                style={{ marginLeft: "auto" }}
                onClick={refreshData}
                disabled={loading}
              >
                🔄 뉴스 업데이트
              </button>
            </div>
            <div className="content-cards">
              {newsList.length > 0 ? (
                newsList.map((news) => (
                  <NewsCard 
                    item={news}
                    type="news"
                    onDetailClick={handleDetailClick}
                  />
                ))
              ) : (
              <p style={{ textAlign: "center", color: "#888" }}>뉴스가 없습니다.</p>
              )}
            </div>
          </div>
        );
  // searchResults?.results?.news || data.news_updates 위에 이렇게 들어가야함
  // 음.. 아마도 버튼형식으로 바꿔서 클릭하면 뉴스 업데이트 해주는 방식으로 해야할듯?
      case 'mypage':
        // fetchBookmarks={/* 북마크 불러오는 함수 또는 null */}
        return (
          <MyPage
            user={user}
            fetchBookmarks={data?.bookmarks || []} // 북마크 데이터가 있다면 전달
            fetchPreferences={data?.preferences || { keywords: [], politicians: [], parties: [] }} // 관심사 데이터
            updateNotification={null} // 알림 설정 업데이트 함수 (추후 구현 가능)
          />
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

  // Header 버튼 분기
  const renderAuthButton = () => {
    if (user) {
      return (
        <button className="btn btn--outline ml-4" onClick={handleLogout}>로그아웃</button>
      );
    } else {
      return (
        <button className="btn btn--outline ml-4" onClick={handleLoginOpen}>로그인</button>
      );
    }
  };
  
  if (loginOpen) {
    return (<LoginForm onSuccess={handleLoginSuccess}
       />)
  }

  return (
    <div className="App">
      <Header>
        {renderAuthButton()}
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
      {webViewUrl && (
        <div className="webviewModal">
          <div className="webviewModalContent">
            <button className="webviewClose" onClick={() => setWebViewUrl(null)}>×</button>
            <iframe
              src={webViewUrl}
              title="뉴스 원문"
              frameBorder="0"
              style={{ width: '100%', height: '80vh', border: 'none' }}
              allowFullScreen
            />
          </div>
        </div>
      )}
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


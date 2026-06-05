import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@mui/material';
import { makeTheme } from './theme/muiTheme';
import { ThemeModeProvider, useThemeMode } from './theme/ThemeContext';
import './App.css';
import { AppProvider, useAppContext } from "./components/AppContext";
import AppShell from './components/layout/AppShell';
import Navigation from './components/layout/Navigation';
import SearchFilters from './components/SearchFilters';
import NewsCard from './components/NewsCard';
import Modal from './components/Modal';
import { useNews, useSearch, usePresident, usePolicies, useStatements } from './components/useNews';
import LoginForm from './components/LoginForm';
import MyPage from './components/MyPage';
import EmptyState from './components/EmptyState';
import SkeletonCard from './components/SkeletonCard';

function App() {
  // 각 탭별로 key(id값) 필요하면 추후에 넣어서 자식한테 보내주기
  const { data, loading, error, refreshData } = useNews();
  const { searchResults, searchLoading, search, clearSearch } = useSearch();
  const { president } = usePresident();
  const { policies } = usePolicies();
  const { statements } = useStatements();
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [modal, setModal] = useState({ isOpen: false, content: null, type: null });
  const [webViewUrl, setWebViewUrl] = React.useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');

  const tabs = [
    { id: 'all', label: '전체', icon: '🔍' },
    { id: 'news', label: '뉴스', icon: '📰' },
    { id: 'president', label: '대통령', icon: '🎖️' },
    { id: 'parliament', label: '정책', icon: '🏛️' },
    { id: 'statements', label: '정치인 발언', icon: '💬' },
    ...(user ? [{ id: 'mypage', label: '마이페이지', icon: '👤' }] : [])
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

  const handleLoginSuccess = () => {
  setLoginOpen(false);
  setActiveTab('news');
};

const handleLoginOpen = () => setLoginOpen(true);
const handleLoginClose = () => setLoginOpen(false);
  // 로그아웃 버튼 클릭시
  const handleLogout = () => {
    logout();       // 실제 로그아웃 수행
    setActiveTab('news');
    setLoginOpen(false); // 혹시 이전에 열려있던 게 있다면
  };

  const handleTabChange = (tabId) => {
    // 검색 후 전체 탭이 아닌 다른 탭으로 이동하면 검색 결과와 검색창 초기화
    if (activeTab === 'all' && tabId !== 'all') {
      clearSearch();
      setSearchValue('');
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    setSearchValue('');
  }, []);

  const renderSearchContent = () => {
  const results = searchResults || {};
  // 모든 카테고리를 하나의 배열로 합침
  const mergedList = [
    ...(results.articles || []),
    ...(results.policies || []),
    ...(results.statements || [])
  ];

  // 아무것도 없으면 안내 메시지
  if (!mergedList.length) {
    return <EmptyState message="검색 결과가 없습니다." icon="🔍" />;
  }

  return (
    <>
      <div className="section-title">🔍 전체 검색결과</div>
      <div>
        {mergedList.map((item, idx) => {
          // 타입 자동 판별
          let type = 'news';
          if (item.type === 'policy' || item.policy_title || item.committee) type = 'policy';
          else if (item.type === 'statement' || item.speaker || item.spaker) type = 'statement';
          // 기본적으로 뉴스 타입

          return (
            <NewsCard
              key={item.id || idx}
              item={item}
              type={type}
              onDetailClick={handleDetailClick}
            />
          );
        })}
      </div>
    </>
  );
};

  const renderTabContent = () => {
     if (activeTab.startsWith('all')) return renderSearchContent();
    // if (!data) return null;
    // const currentData = searchResults || data;

    switch (activeTab) {

      case 'president':
        return (
          <div>
            <div className="section-title">🎖️ 대통령 정책</div>
            <div className="feed-grid">
              {((searchResults?.results?.policies || president) || []).length > 0 ? (
                (searchResults?.results?.policies || president).map((president, idx) => (
                  <NewsCard key={president.id || idx} item={president} type="policy" onDetailClick={handleDetailClick} />
                ))
              ) : (
                <EmptyState message="대통령 정책 정보가 없습니다." />
              )}
            </div>
          </div>
        );

      case 'parliament':
        return (
          <div>
            <div className="section-title">🏛️ 정책 활동</div>
            <div className="feed-grid">
              {((searchResults?.results?.activities || policies) || []).length > 0 ? (
                (searchResults?.results?.activities || policies).map((policy, idx) => (
                  <NewsCard key={policy.id || idx} item={policy} type="parliament" onDetailClick={handleDetailClick} />
                ))
              ) : (
                <EmptyState message="정책 활동이 없습니다." />
              )}
            </div>
          </div>
        );

      case 'statements':
        return (
          <div>
            <div className="section-title">💬 주요 정치인 발언</div>
            <div className="feed-grid">
              {((searchResults?.results?.statements || statements) || []).length > 0 ? (
                (searchResults?.results?.statements || statements).map((statement, idx) => (
                  <NewsCard key={statement.id || idx} item={statement} type="statement" onDetailClick={handleDetailClick} />
                ))
              ) : (
                <EmptyState message="정치인 발언이 없습니다." />
              )}
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
            <div className="feed-grid">
              {newsList.length > 0 ? (
                newsList.map((news, idx) => (
                  <NewsCard
                    key={news.id || idx}
                    item={news}
                    type="news"
                    onDetailClick={handleDetailClick}
                  />
                ))
              ) : (
              <EmptyState message="뉴스가 없습니다." icon="📰" />
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

  if (loading) {
    return (
      <AppShell nav={null} search={null} authButton={renderAuthButton()}>
        <div className="feed-grid">{[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}</div>
      </AppShell>
    );
  }
  if (error) {
    return (
      <AppShell nav={null} search={null} authButton={renderAuthButton()}>
        <EmptyState icon="⚠️" message={`데이터를 불러오지 못했습니다. (${error})`} />
        <div style={{ textAlign: 'center' }}>
          <button className="btn btn--primary" onClick={refreshData}>다시 시도</button>
        </div>
      </AppShell>
    );
  }

  const navEl = (
    <Navigation tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />
  );
  const searchEl = (
    <SearchFilters
      ref={searchInputRef}
      searchValue={searchValue}
      onSearchValueChange={setSearchValue}
      onSearch={handleSearch}
      searchLoading={searchLoading}
    />
  );

  return (
    <>
      <AppShell nav={navEl} search={searchEl} authButton={renderAuthButton()}>
        {renderTabContent()}
      </AppShell>

      {webViewUrl && (
        <div className="webviewModal">
          <div className="webviewModalContent">
            <button className="webviewClose" onClick={() => setWebViewUrl(null)}>×</button>
            <iframe src={webViewUrl} title="뉴스 원문" frameBorder="0"
              style={{ width: '100%', height: '80vh', border: 'none' }} allowFullScreen />
          </div>
        </div>
      )}

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        content={modal.content}
        onClose={() => setModal({ isOpen: false, content: null, type: null })}
      />

      {loginOpen && (
        <LoginForm onSuccess={handleLoginSuccess} onClose={handleLoginClose} />
      )}
    </>
  );
}

function ThemedRoot() {
  const { resolved } = useThemeMode();
  const muiTheme = React.useMemo(() => makeTheme(resolved), [resolved]);
  return (
    <ThemeProvider theme={muiTheme}>
      <AppProvider>
        <App />
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--card-border)' },
            success: { iconTheme: { primary: 'var(--primary)', secondary: 'var(--on-primary)' } },
          }}
        />
      </AppProvider>
    </ThemeProvider>
  );
}

export default function WrappedApp() {
  return (
    <ThemeModeProvider>
      <ThemedRoot />
    </ThemeModeProvider>
  );
}


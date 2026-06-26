import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
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
import { useNews, useSearch, useAiSearch, useForYou, usePresident, usePolicies, useStatements } from './components/useNews';
import AiSearchResults from './components/AiSearchResults';
import ForYouFeed from './components/ForYouFeed';
import IssueCard from './components/IssueCard';
import IssueDetail from './components/IssueDetail';
import { useIssues } from './components/useIssues';
import MemberCard from './components/MemberCard';
import MemberDetail from './components/MemberDetail';
import { useMembers } from './components/useMembers';
import LoginForm from './components/LoginForm';
import MyPage from './components/MyPage';
import EmptyState from './components/EmptyState';
import SkeletonCard from './components/SkeletonCard';
import DailySummaryCard from './components/DailySummaryCard';
import BriefingHero from './components/BriefingHero';
import ScrollToTop from './components/ScrollToTop';
import ListToolbar from './components/ListToolbar';
import NewsReaderModal from './components/NewsReaderModal';
import { useDailySummary } from './components/useSummary';

const NEWS_TOPICS = ['전체', '정치', '경제', '사회', '대통령실', '국회'];
const MEMBER_SORTS = [{ id: 'name', label: '이름순' }, { id: 'criminal', label: '전과순' }, { id: 'term', label: '선수순' }];

function memberTermCount(term) {
  const m = String(term || '').match(/제?\d+대/g);
  return m ? m.length : 0;
}

function App() {
  // 각 탭별로 key(id값) 필요하면 추후에 넣어서 자식한테 보내주기
  const { data, loading, error, refreshData } = useNews();
  const { searchResults, searchLoading, search, clearSearch } = useSearch();
  const aiSearch = useAiSearch();
  const { president } = usePresident();
  const { policies } = usePolicies();
  const { statements } = useStatements();
  const { issues, loading: issuesLoading } = useIssues();
  const { members, loading: membersLoading } = useMembers();
  const dailySummary = useDailySummary();
  const { user, logout } = useAppContext();
  const [activeTab, setActiveTab] = useState('news');
  const forYou = useForYou(!!user && activeTab === 'digest');
  const [modal, setModal] = useState({ isOpen: false, content: null, type: null });
  const [readerArticle, setReaderArticle] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const searchInputRef = useRef(null);
  const [searchValue, setSearchValue] = useState('');
  const [selectedIssueId, setSelectedIssueId] = useState(null);
  const [selectedMemberId, setSelectedMemberId] = useState(null);
  const [newsTopic, setNewsTopic] = useState('전체');
  const [memberQuery, setMemberQuery] = useState('');
  const [memberParty, setMemberParty] = useState('전체');
  const [memberSort, setMemberSort] = useState('name');
  const [issueQuery, setIssueQuery] = useState('');
  const [issueStatus, setIssueStatus] = useState('전체');

  const memberParties = useMemo(
    () => ['전체', ...Array.from(new Set(members.map((m) => m.party).filter(Boolean)))],
    [members]
  );
  const visibleMembers = useMemo(() => {
    const q = memberQuery.trim();
    let list = members.filter((m) => {
      const partyOk = memberParty === '전체' || m.party === memberParty;
      const qOk = !q || `${m.name || ''} ${m.district || ''}`.includes(q);
      return partyOk && qOk;
    });
    const sorted = [...list];
    if (memberSort === 'name') sorted.sort((a, b) => (a.name || '').localeCompare(b.name || '', 'ko'));
    else if (memberSort === 'criminal') sorted.sort((a, b) => (b.criminal_count || 0) - (a.criminal_count || 0));
    else if (memberSort === 'term') sorted.sort((a, b) => memberTermCount(b.term) - memberTermCount(a.term));
    return sorted;
  }, [members, memberQuery, memberParty, memberSort]);

  const issueStatuses = useMemo(
    () => ['전체', ...Array.from(new Set(issues.map((i) => i.status).filter(Boolean)))],
    [issues]
  );
  const visibleIssues = useMemo(() => {
    const q = issueQuery.trim();
    return issues.filter((i) => {
      const statusOk = issueStatus === '전체' || i.status === issueStatus;
      const qOk = !q || `${i.title || ''} ${i.summary || ''}`.includes(q);
      return statusOk && qOk;
    });
  }, [issues, issueQuery, issueStatus]);

  const tabs = [
    { id: 'all', label: '전체', icon: '🔍' },
    { id: 'news', label: '뉴스', icon: '📰' },
    { id: 'president', label: '대통령', icon: '🎖️' },
    { id: 'parliament', label: '정책', icon: '🏛️' },
    { id: 'statements', label: '정치인 발언', icon: '💬' },
    { id: 'issues', label: '이슈', icon: '🔥' },
    { id: 'members', label: '의원', icon: '⚖️' },
    ...(user ? [{ id: 'digest', label: '맞춤', icon: '✨' }] : []),
    ...(user ? [{ id: 'mypage', label: '마이페이지', icon: '👤' }] : [])
  ];

  const handleSearch = useCallback(async (searchTerm, filters) => {
    if (searchTerm.trim()) {
      setActiveTab('all'); // 검색 후 AI 검색 결과로 이동
      await aiSearch.run(searchTerm);
    } else {
      aiSearch.clear();
      setActiveTab('news'); // 검색어가 없으면 뉴스 탭으로 이동
    }
  }, [aiSearch]);

  const handleDetailClick = useCallback((type, content) => {
    if (type === 'news') {
      setReaderArticle(content); // ✅ 인앱 요약 브리핑(iframe 웹뷰 대체)
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
      aiSearch.clear();
      setSearchValue('');
    }
    setActiveTab(tabId);
  };

  useEffect(() => {
    setSearchValue('');
    // 공유 딥링크: ?issue=<id> 로 들어오면 해당 이슈 상세 열기
    const params = new URLSearchParams(window.location.search);
    const iid = params.get('issue');
    if (iid) {
      setSelectedIssueId(iid);
      setActiveTab('issues');
    }
  }, []);

  const renderSearchContent = () => {
    if (aiSearch.loading) {
      return (
        <div>
          <div className="section-head"><span className="section-head__title">✨ AI 검색 중…</span></div>
          <div className="news-list">{[1, 2, 3, 4].map((n) => <SkeletonCard key={n} />)}</div>
        </div>
      );
    }
    if (aiSearch.error) {
      return <EmptyState icon="⚠️" message={`검색에 실패했어요. (${aiSearch.error})`} />;
    }
    if (!aiSearch.result) {
      return <EmptyState icon="🔍" message="검색어를 입력해 보세요. 예: '이재명 부동산 최근 입장'" />;
    }
    return (
      <AiSearchResults
        result={aiSearch.result}
        query={searchValue}
        briefingLoading={aiSearch.briefingLoading}
        onRunBriefing={() => aiSearch.runBriefing(searchValue)}
        onDetailClick={handleDetailClick}
      />
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

      case 'issues':
        return (
          <div>
            <div className="section-head"><span className="section-head__title">🔥 이슈</span></div>
            {issuesLoading ? (
              <div className="feed-grid">{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</div>
            ) : issues.length > 0 ? (
              <>
                <ListToolbar
                  query={issueQuery}
                  onQuery={setIssueQuery}
                  placeholder="이슈 제목·내용 검색"
                  filters={issueStatuses}
                  activeFilter={issueStatus}
                  onFilter={setIssueStatus}
                  resultCount={visibleIssues.length}
                />
                {visibleIssues.length > 0 ? (
                  <div className="feed-grid">
                    {visibleIssues.map((iss) => (
                      <IssueCard key={iss.id} issue={iss} onClick={setSelectedIssueId} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-rich">
                    <div className="empty-rich__icon">🔎</div>
                    <p className="empty-rich__msg">조건에 맞는 이슈가 없어요.<br />검색어나 필터를 바꿔보세요.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-rich">
                <div className="empty-rich__icon">🔥</div>
                <p className="empty-rich__msg">아직 정리된 이슈가 없어요.<br />매일 수집되는 뉴스로 곧 채워집니다.</p>
              </div>
            )}
          </div>
        );

      case 'digest':
        return (
          <ForYouFeed
            result={forYou.result}
            loading={forYou.loading}
            onDetailClick={handleDetailClick}
            onGoSettings={() => setActiveTab('mypage')}
          />
        );

      case 'members':
        return (
          <div>
            <div className="section-head"><span className="section-head__title">⚖️ 의원 책임성</span></div>
            {membersLoading ? (
              <div className="feed-grid">{[1, 2, 3].map((n) => <SkeletonCard key={n} />)}</div>
            ) : members.length > 0 ? (
              <>
                <ListToolbar
                  query={memberQuery}
                  onQuery={setMemberQuery}
                  placeholder="의원 이름·지역구 검색"
                  filters={memberParties}
                  activeFilter={memberParty}
                  onFilter={setMemberParty}
                  sorts={MEMBER_SORTS}
                  activeSort={memberSort}
                  onSort={setMemberSort}
                  resultCount={visibleMembers.length}
                />
                {visibleMembers.length > 0 ? (
                  <div className="feed-grid">
                    {visibleMembers.map((m) => (
                      <MemberCard key={m.id} member={m} onClick={setSelectedMemberId} />
                    ))}
                  </div>
                ) : (
                  <div className="empty-rich">
                    <div className="empty-rich__icon">🔎</div>
                    <p className="empty-rich__msg">조건에 맞는 의원이 없어요.<br />검색어나 정당 필터를 바꿔보세요.</p>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-rich">
                <div className="empty-rich__icon">⚖️</div>
                <p className="empty-rich__msg">등록된 의원 정보가 없어요.<br />국회 데이터 연동 후 표시됩니다.</p>
              </div>
            )}
          </div>
        );

      case 'news': {
        const allNews = searchResults?.results?.news || data?.articles || [];
        const filtered = newsTopic === '전체'
          ? allNews
          : allNews.filter((n) => (n.category || '').includes(newsTopic));
        const heroFallback = (issues.length > 0 ? issues : allNews).map((x) => x.title);
        const featuredItem = filtered[0];
        const gridItems = filtered.slice(1, 7);   // 표준 카드
        const listItems = filtered.slice(7);       // 압축 목록형(티어링 3단계)
        return (
          <div>
            <BriefingHero summary={dailySummary} fallbackItems={heroFallback} />

            {/* 요약이 있을 때만 별도 이슈 칩을 노출(요약 없으면 히어로가 이미 이슈를 나열하므로 중복 방지) */}
            {dailySummary?.overview && issues.length > 0 && (
              <>
                <div className="section-head">
                  <span className="section-head__title">🔥 주목 이슈</span>
                  <button className="bk-card__more" onClick={() => setActiveTab('issues')}>전체보기 →</button>
                </div>
                <div className="topic-chips">
                  {issues.slice(0, 8).map((iss) => (
                    <button key={iss.id} className="topic-chip" onClick={() => setSelectedIssueId(iss.id)}>
                      {iss.title}
                    </button>
                  ))}
                </div>
              </>
            )}

            <div className="section-head">
              <span className="section-head__title">📰 최신 뉴스</span>
              <button className="btn btn--outline btn--sm" onClick={refreshData} disabled={loading}>
                🔄 업데이트
              </button>
            </div>
            <div className="topic-chips" role="tablist" aria-label="뉴스 주제">
              {NEWS_TOPICS.map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={newsTopic === t}
                  className={`topic-chip ${newsTopic === t ? 'active' : ''}`}
                  onClick={() => setNewsTopic(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            {filtered.length > 0 ? (
              <>
                <div className="feed-grid">
                  {featuredItem && (
                    <NewsCard key={featuredItem.id || 'featured'} item={featuredItem} type="news" featured onDetailClick={handleDetailClick} />
                  )}
                  {gridItems.map((news, idx) => (
                    <NewsCard key={news.id || idx} item={news} type="news" onDetailClick={handleDetailClick} />
                  ))}
                </div>
                {listItems.length > 0 && (
                  <>
                    <div className="section-head"><span className="section-head__title">🗞 더 많은 뉴스</span></div>
                    <div className="news-list">
                      {listItems.map((news, idx) => (
                        <NewsCard key={news.id || `row-${idx}`} item={news} type="news" compact onDetailClick={handleDetailClick} />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="empty-rich">
                <div className="empty-rich__icon">📰</div>
                <p className="empty-rich__msg">
                  '{newsTopic}' 주제의 뉴스가 아직 없어요.<br />다른 주제를 선택해 보세요.
                </p>
              </div>
            )}
          </div>
        );
      }
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
        return (
          <div>
            <DailySummaryCard summary={dailySummary} />
            <div className="section-title">🔍 전체</div>
            <div className="feed-grid">
              {(data?.articles || []).length > 0 ? (
                (data?.articles || []).map((news, idx) => (
                  <NewsCard key={news.id || idx} item={news} type="news" onDetailClick={handleDetailClick} />
                ))
              ) : (
                <EmptyState message="표시할 내용이 없습니다." icon="🔍" />
              )}
            </div>
          </div>
        );
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

      <ScrollToTop />

      {readerArticle && (
        <NewsReaderModal
          article={readerArticle}
          pool={data?.articles || []}
          onClose={() => setReaderArticle(null)}
        />
      )}

      <Modal
        isOpen={modal.isOpen}
        type={modal.type}
        content={modal.content}
        onClose={() => setModal({ isOpen: false, content: null, type: null })}
      />

      {selectedIssueId && (
        <IssueDetail
          issueId={selectedIssueId}
          onClose={() => setSelectedIssueId(null)}
          onArticleClick={handleDetailClick}
        />
      )}

      {selectedMemberId && (
        <MemberDetail
          memberId={selectedMemberId}
          onClose={() => setSelectedMemberId(null)}
        />
      )}

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


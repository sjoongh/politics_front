import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import TopBar from './TopBar';
import BottomTabs from './BottomTabs';
import NewsReaderModal from '../components/NewsReaderModal';
import { useBackHandler } from '../hooks/useBackHandler';
import { trackPageView } from '../analytics';
import './AppFrame.css';

export const TABS = [
  { id: 'today', label: '오늘', to: '/' },
  { id: 'issues', label: '이슈', to: '/issues' },
  { id: 'members', label: '의원', to: '/members' },
  { id: 'search', label: '검색', to: '/search' },
];

export function activeTabFor(pathname) {
  if (pathname === '/' || pathname.startsWith('/today')) return 'today';
  if (pathname.startsWith('/issues')) return 'issues';
  if (pathname.startsWith('/members')) return 'members';
  if (pathname.startsWith('/search')) return 'search';
  return null;
}

const ReaderContext = createContext({ openArticle: () => {}, closeArticle: () => {}, article: null });
export const useReader = () => useContext(ReaderContext);

export default function AppFrame() {
  const location = useLocation();
  const [reader, setReader] = useState({ article: null, pool: [] });
  const openArticle = useCallback((article, pool = []) => setReader({ article, pool }), []);
  const closeArticle = useCallback(() => setReader({ article: null, pool: [] }), []);
  const readerValue = useMemo(() => ({ openArticle, closeArticle, article: reader.article }), [openArticle, closeArticle, reader.article]);

  useEffect(() => { trackPageView(location.pathname); }, [location.pathname]);
  useBackHandler({ modalOpen: !!reader.article, closeModal: closeArticle });

  const active = activeTabFor(location.pathname);
  return (
    <ReaderContext.Provider value={readerValue}>
      <div className="frame">
        <TopBar tabs={TABS} active={active} />
        <main className="frame__main" id="main">
          <Outlet />
        </main>
        <BottomTabs tabs={TABS} active={active} />
        {reader.article && (
          <NewsReaderModal article={reader.article} pool={reader.pool} onClose={closeArticle} />
        )}
      </div>
    </ReaderContext.Provider>
  );
}

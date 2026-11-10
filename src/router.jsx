import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router';
import AppFrame from './layout/AppFrame';
import Today from './pages/Today';
import Issues from './pages/Issues';
import IssueDetail from './pages/IssueDetail';
import Members from './pages/Members';
import MemberDetail from './pages/MemberDetail';
import Search from './pages/Search';
import Me from './pages/Me';

import { legacyRedirect } from './legacyRedirect';

function LegacyRedirects({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const target = location.pathname === '/' ? legacyRedirect(location.search) : null;
  useEffect(() => {
    if (target) navigate(target.to, { replace: true, state: target.state });
  }, [target, navigate]);
  if (target) return null;
  return children;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <LegacyRedirects>
        <Routes>
          <Route element={<AppFrame />}>
            <Route path="/" element={<Today />} />
            <Route path="/today/:date" element={<Today />} />
            <Route path="/issues" element={<Issues />}>
              <Route path=":id" element={<IssueDetail />} />
            </Route>
            <Route path="/members" element={<Members />}>
              <Route path=":id" element={<MemberDetail />} />
            </Route>
            <Route path="/search" element={<Search />} />
            <Route path="/me" element={<Me />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </LegacyRedirects>
    </BrowserRouter>
  );
}

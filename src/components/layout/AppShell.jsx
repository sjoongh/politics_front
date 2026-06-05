import React from 'react';
import Header from './Header';
import Footer from './Footer';

export default function AppShell({ nav, search, authButton, children }) {
  return (
    <div className="app-shell">
      <Header search={search} authButton={authButton} />
      {nav && (
        <div className="app-header__nav-strip">
          <div className="app-header__nav-strip-inner">{nav}</div>
        </div>
      )}
      <main className="app-main">{children}</main>
      <Footer />
    </div>
  );
}

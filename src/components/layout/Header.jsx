import React from 'react';
import ThemeToggle from '../ThemeToggle';

export default function Header({ search, authButton }) {
  return (
    <header className="app-header">
      <div className="app-header__inner">
        <div className="app-header__brand">
          <span className="brandmark">브리핑 코리아</span>
          <span className="brandsub">실시간 정치 브리핑</span>
        </div>
        <div className="app-header__search-inline">{search}</div>
        <div className="app-header__actions">
          <ThemeToggle />
          {authButton}
        </div>
      </div>
      <div className="app-header__search-stacked">{search}</div>
    </header>
  );
}

import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router';
import { Search, User } from 'lucide-react';
import ThemeToggle from '../components/ThemeToggle';

export default function TopBar({ tabs, active }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const submit = (e) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/search?q=${encodeURIComponent(term)}` : '/search');
  };
  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link to="/" className="topbar__brand">브리핑 코리아</Link>
        <nav className="topbar__nav" aria-label="주요 메뉴">
          {tabs.map((t) => (
            <NavLink key={t.id} to={t.to} end={t.to === '/'}
              className={`topbar__tab${active === t.id ? ' is-active' : ''}`}
              aria-current={active === t.id ? 'page' : undefined}>
              {t.label}
            </NavLink>
          ))}
        </nav>
        <form className="topbar__search" role="search" onSubmit={submit}>
          <Search size={16} aria-hidden="true" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="검색" aria-label="검색" />
        </form>
        <div className="topbar__actions">
          <ThemeToggle />
          <Link to="/me" className="topbar__icon" aria-label="내 정보"><User size={20} /></Link>
        </div>
      </div>
    </header>
  );
}

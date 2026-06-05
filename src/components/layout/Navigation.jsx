import React from 'react';
import { LayoutGrid, Newspaper, Landmark, ScrollText, MessageSquareQuote, User } from 'lucide-react';

const ICONS = {
  all: LayoutGrid,
  news: Newspaper,
  president: Landmark,
  parliament: ScrollText,
  statements: MessageSquareQuote,
  mypage: User,
};

export default function Navigation({ tabs, activeTab, onTabChange }) {
  const renderItem = (tab, variant) => {
    const Icon = ICONS[tab.id] || LayoutGrid;
    const active = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        className={`${variant}-item ${active ? 'active' : ''}`}
        onClick={() => onTabChange(tab.id)}
        aria-current={active ? 'page' : undefined}
      >
        <Icon size={variant === 'bottomnav' ? 20 : 16} />
        <span>{tab.label}</span>
      </button>
    );
  };

  return (
    <>
      <nav className="topnav">{tabs.map((t) => renderItem(t, 'topnav'))}</nav>
      <nav className="bottomnav">{tabs.map((t) => renderItem(t, 'bottomnav'))}</nav>
    </>
  );
}

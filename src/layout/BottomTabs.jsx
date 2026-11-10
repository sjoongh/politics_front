import React from 'react';
import { NavLink } from 'react-router';
import { CalendarDays, Flag, Users, Search } from 'lucide-react';

const ICONS = { today: CalendarDays, issues: Flag, members: Users, search: Search };

export default function BottomTabs({ tabs, active }) {
  return (
    <nav className="bottomtabs" aria-label="하단 탭">
      {tabs.map((t) => {
        const Icon = ICONS[t.id] || Flag;
        const on = active === t.id;
        return (
          <NavLink key={t.id} to={t.to} end={t.to === '/'} className={`bottomtabs__item${on ? ' is-active' : ''}`}
            aria-current={on ? 'page' : undefined}>
            <Icon size={22} aria-hidden="true" />
            <span>{t.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

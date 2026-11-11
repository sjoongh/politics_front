import React from 'react';
import './ui.css';

export default function AnchorTabs({ tabs, active, onSelect }) {
  return (
    <nav className="anchors" aria-label="섹션">
      {tabs.map((t) => (
        <button key={t.id} type="button" disabled={!t.count} className={`anchors__item${active === t.id ? ' is-active' : ''}`}
          onClick={() => onSelect(t.id)} aria-current={active === t.id ? 'true' : undefined}>
          {t.label}{t.count ? <span className="anchors__count num">{t.count}</span> : null}
        </button>
      ))}
    </nav>
  );
}

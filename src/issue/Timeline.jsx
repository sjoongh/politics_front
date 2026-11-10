import React from 'react';
import { shortDate } from './format';
import './issue.css';

export default function Timeline({ items }) {
  if (!items || items.length === 0) return null;
  return (
    <ol className="timeline">
      {items.map((t, i) => (
        <li className="timeline__item" key={`${t.date}-${i}`}>
          <span className="timeline__date num">{shortDate(t.date)}</span>{t.label}
        </li>
      ))}
    </ol>
  );
}

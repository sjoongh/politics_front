import React from 'react';
import './ui.css';

export default function Skeleton({ lines = 3, rows = 1 }) {
  return (
    <div aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, r) => (
        <div className="skeleton" key={r}>
          {Array.from({ length: lines }).map((__, i) => (
            <div key={i} className={`skeleton__line${i === lines - 1 ? ' skeleton__line--short' : ''}`} />
          ))}
        </div>
      ))}
    </div>
  );
}

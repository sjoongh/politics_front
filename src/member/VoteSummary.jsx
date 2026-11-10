import React from 'react';
import '../pages/Members.css';

const CELLS = [['찬성', 'yes'], ['반대', 'no'], ['기권', 'etc'], ['불참', 'etc']];

export default function VoteSummary({ summary }) {
  if (!summary) return null;
  const total = CELLS.reduce((a, [k]) => a + (summary[k] || 0), 0);
  if (!total) return null;
  return (
    <div className="vote-summary num">
      {CELLS.map(([k, cls]) => (
        <div key={k} className={`vote-summary__cell vote-summary__cell--${cls}`}>
          <span className="vote-summary__num">{summary[k] || 0}</span>
          <span className="vote-summary__label">{k}</span>
        </div>
      ))}
    </div>
  );
}

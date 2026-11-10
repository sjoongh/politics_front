import React from 'react';
import { tallyWidths } from './format';
import './issue.css';

export default function VoteTally({ yes = 0, no = 0, abstain = 0, result, size = 'sm', legend = true }) {
  const total = (yes || 0) + (no || 0) + (abstain || 0);
  if (!total) return null;
  const w = tallyWidths({ yes, no, abstain });
  return (
    <div>
      <div className={`tally tally--${size}`} role="img" aria-label={`찬성 ${yes} 반대 ${no} 기권 ${abstain}${result ? ` ${result}` : ''}`}>
        <span className="tally__yes" style={{ width: `${w.yes}%` }} />
        <span className="tally__no" style={{ width: `${w.no}%` }} />
        <span className="tally__abstain" style={{ width: `${w.abstain}%` }} />
      </div>
      {legend && (
        <div className="tally-legend num">
          <span>찬성 <b>{yes}</b></span><span>반대 <b>{no}</b></span><span>기권 <b>{abstain}</b></span>
          {result && <span><b>{result}</b></span>}
        </div>
      )}
    </div>
  );
}

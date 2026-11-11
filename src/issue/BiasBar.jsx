import React from 'react';
import './issue.css';

const ORDER = [['left', '진보'], ['center', '중도'], ['right', '보수'], ['foreign', '외신'], ['unknown', '미분류']];

/** 수집된 보도 분포. total < 4면 표시하지 않는다(통계로 읽힐 만큼의 표본이 아님). */
export default function BiasBar({ counts, total, legend = true }) {
  const c = counts || {};
  const sum = typeof total === 'number' ? total : ORDER.reduce((a, [k]) => a + (c[k] || 0), 0);
  if (sum < 4) return null;
  return (
    <div>
      <div className="bias" role="img" aria-label={ORDER.map(([k, l]) => `${l} ${c[k] || 0}`).join(', ')}>
        {ORDER.map(([k]) => (c[k] ? <span key={k} className={`bias__${k}`} style={{ width: `${(c[k] / sum) * 100}%` }} /> : null))}
      </div>
      {legend && (
        <div className="bias-legend num">
          {ORDER.map(([k, l]) => (c[k] ? <span key={k}><i className={`bias__${k}`} />{l} {c[k]}</span> : null))}
        </div>
      )}
    </div>
  );
}

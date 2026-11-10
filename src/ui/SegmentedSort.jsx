import React from 'react';
import './ui.css';

export default function SegmentedSort({ options, value, onChange, label = '정렬' }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id}
          className={`seg__item${value === o.id ? ' is-active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

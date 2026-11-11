import React from 'react';
import './ui.css';

export default function FilterChips({ options, value, onChange, label = '필터' }) {
  return (
    <div className="chips" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={value === o.id}
          className={`chip${value === o.id ? ' is-active' : ''}`} onClick={() => onChange(o.id)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

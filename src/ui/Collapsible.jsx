import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import './ui.css';

export default function Collapsible({ summary, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="collapsible">
      <button type="button" className="collapsible__summary" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span>{summary}</span>
        {open ? <ChevronUp size={18} aria-hidden="true" /> : <ChevronDown size={18} aria-hidden="true" />}
      </button>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}

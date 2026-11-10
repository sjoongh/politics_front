import React from 'react';
import { Link } from 'react-router';
import './issue.css';

export default function ProposerChips({ chips }) {
  if (!chips || chips.length === 0) return null;
  return (
    <div className="proposers">
      {chips.map((c) => <Link key={c.id} className="proposers__chip" to={`/members/${c.id}`}>{c.name}</Link>)}
    </div>
  );
}

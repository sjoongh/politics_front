import React from 'react';
import { statusKind } from '../issue/format';
import './ui.css';

export default function Badge({ kind = 'status', value }) {
  if (!value) return null;
  const cls = kind === 'status' ? `badge--${statusKind(value)}` : 'badge--category';
  return <span className={`badge ${cls}`}>{value}</span>;
}

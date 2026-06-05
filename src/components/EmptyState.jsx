import React from 'react';

const EmptyState = ({ message = '표시할 내용이 없습니다.', icon = '📭' }) => (
  <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 16px' }}>
    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>{icon}</div>
    <p>{message}</p>
  </div>
);

export default EmptyState;

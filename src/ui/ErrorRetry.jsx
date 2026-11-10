import React from 'react';
import './ui.css';

export default function ErrorRetry({ message = '불러오지 못했습니다', onRetry }) {
  return (
    <div className="error-retry" role="alert">
      <span>{message}</span>
      {onRetry && <button type="button" className="btn btn--outline btn--sm" onClick={onRetry}>다시 시도</button>}
    </div>
  );
}

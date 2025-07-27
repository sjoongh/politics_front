import React from 'react';
import { getCurrentDate, getCurrentTime } from '../utils/dateUtils';

const Header = ({ onExport, exporting, children }) => {
  return (
    <header className="main-header">
      <div className="container">
        <div className="flex justify-between items-center py-16">
          <div className="logo">
            <h1>🏛️ 정치 뉴스 추적기</h1>
            <p>대한민국 정치 동향 실시간 모니터링</p>
          </div>
          <div className="last-update">
            <p>📅 {getCurrentDate()}</p>
            <p>🕐 마지막 업데이트: <span id="update-time">{getCurrentTime()}</span></p>
            {/*
            <button 
              className="btn btn--secondary btn--sm"
              onClick={onExport}
              disabled={exporting}
            >
              {exporting ? '내보내는 중...' : '📄 데이터 내보내기'}
            </button>
            */}
            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

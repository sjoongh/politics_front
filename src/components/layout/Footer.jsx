import React, { useState } from 'react';
import AboutModal from '../AboutModal';

export default function Footer() {
  const [aboutOpen, setAboutOpen] = useState(false);
  return (
    <footer className="app-footer">
      <div className="app-footer__inner">
        <p>© 브리핑 코리아 · 정보 제공 목적 서비스 (특정 정당·후보를 지지하지 않습니다)</p>
        <p>뉴스 저작권은 각 언론사에 있으며 요약은 AI 정리본입니다. 공공자료 출처: 정책브리핑·열린국회정보(공공누리).</p>
        <p><button className="footer-link" onClick={() => setAboutOpen(true)}>이용안내 · 방법론 · 정정</button></p>
      </div>
      {aboutOpen && <AboutModal onClose={() => setAboutOpen(false)} />}
    </footer>
  );
}

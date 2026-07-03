import React from 'react';

/**
 * 이용안내 · 방법론 · 출처/저작권 · 정정 안내.
 * 한국 정치 서비스의 법적 리스크(저작권·편향·명예훼손) 완화를 위한 투명성 공개.
 */
export default function AboutModal({ onClose }) {
  return (
    <div className="bk-modal" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bk-modal__panel about" role="dialog" aria-modal="true" aria-label="이용안내">
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>

        <h2>이용안내 · 데이터 방법론</h2>

        <div className="about__sec">
          <h3>📰 뉴스 출처와 저작권</h3>
          <p>뉴스 기사의 저작권은 <b>각 언론사</b>에 있습니다. 본 서비스는 기사 전문을 저장·재배포하지 않으며,
            제목·짧은 요약과 <b>원문 링크</b>를 제공합니다. 본문 전체는 반드시 원 언론사에서 확인해 주세요.</p>
        </div>

        <div className="about__sec">
          <h3>🤖 AI 요약 안내</h3>
          <p>기사·자료 요약은 AI(생성형 언어모델)가 자동 생성한 것으로, <b>원문을 대체하지 않습니다.</b>
            오류·누락·뉘앙스 차이가 있을 수 있으며, 인용·판단의 근거로 삼기 전 반드시 원문을 확인하세요.</p>
        </div>

        <div className="about__sec">
          <h3>🏛 공공데이터 출처</h3>
          <p>정부 자료는 <b>정책브리핑(korea.kr)</b>, 국회 법안·표결은 <b>열린국회정보(open.assembly.go.kr)</b>,
            의원 정보는 공식 공개자료를 사용합니다. 공공저작물은 <b>공공누리(KOGL)</b> 조건에 따르며 출처를 표시합니다.</p>
        </div>

        <div className="about__sec">
          <h3>📊 산정 방식 (참고용)</h3>
          <ul>
            <li><b>매체 관점 비교</b>: 통용되는 매체 성향 분류를 참고한 값이며 절대적 기준이 아닙니다.</li>
            <li><b>사건성/노출 순서</b>: 연결된 소스 수·표결 갈등도·보도 빈도 등 규칙 기반 점수로 정렬하며, 특정 정당/성향을 의도적으로 우대하지 않습니다.</li>
            <li><b>의원 책임성</b>: 대표발의 법안·표결은 열린국회 공개데이터 기반이며, 전과는 <b>확정 판결</b>·공식 출처가 있는 항목만 표시합니다.</li>
            <li><b>정당 입장</b>: 기사에서 발화 주체로 보이는 정당에 귀속한 것으로, 해당 정당의 공식 입장과 다를 수 있습니다.</li>
          </ul>
        </div>

        <div className="about__sec">
          <h3>📮 문의·연락처</h3>
          <p>서비스 관련 문의, 제보, 정정 요청은 아래 이메일로 연락해 주세요.</p>
          <p><b>이메일:</b> <a href="mailto:briefingkorea@gmail.com">briefingkorea@gmail.com</a></p>
        </div>

        <div className="about__sec">
          <h3>✏️ 정정 요청</h3>
          <p>잘못된 정보나 정정이 필요한 내용은 각 화면의 <b>피드백(잘못된 정보)</b> 또는
            <b> briefingkorea@gmail.com</b>으로 알려주시면 검토 후 반영합니다.
            사실과 다른 표시가 확인되면 신속히 수정합니다.</p>
        </div>

        <p className="about__disc">본 서비스는 정보 제공 목적이며, 특정 정당·후보를 지지·반대하지 않습니다.
          선거기간 중 일부 기능 표시는 관련 법령에 따라 조정될 수 있습니다.</p>
      </div>
    </div>
  );
}

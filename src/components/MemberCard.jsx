import React from 'react';

export default function MemberCard({ member, onClick }) {
  const sub = [member.district, member.committee].filter(Boolean).join(' · ');
  const count = member.criminal_count || 0;
  return (
    <article className="bk-card issue-card" onClick={() => onClick(member.id)}>
      <div className="bk-card__body">
        <div className="bk-card__meta">
          <span className="bk-card__src">{member.party || '무소속'}</span>
          {member.term && <span>{member.term}</span>}
        </div>
        <h3 className="bk-card__title">{member.name}</h3>
        <p className="bk-card__summary">{sub || '정보 없음'}</p>
        <span className={count > 0 ? 'bk-badge bk-badge--alert' : 'bk-badge bk-badge--muted'}>
          전과 {count}건
        </span>
      </div>
    </article>
  );
}

import React from 'react';
import { partyColor, initials } from '../utils/partyColors';

const TERM_LABEL = { 1: '초선', 2: '재선', 3: '3선', 4: '4선', 5: '5선', 6: '6선' };

function termCount(term) {
  if (!term) return 0;
  const matches = String(term).match(/제?\d+대/g);
  return matches ? matches.length : 0;
}

export default function MemberCard({ member, onClick }) {
  const sub = [member.district, member.committee].filter(Boolean).join(' · ');
  const criminal = member.criminal_count || 0;
  const terms = termCount(member.term);
  const color = partyColor(member.party);
  const photo = member.photo_url || member.photo;

  return (
    <article
      className="bk-card issue-card member-card"
      style={{ '--party-color': color }}
      onClick={() => onClick(member.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(member.id)}
    >
      <span className="member-card__accent" aria-hidden="true" />
      <div className="bk-card__body">
        <div className="member-card__head">
          <div
            className="member-card__avatar"
            style={photo ? { backgroundImage: `url(${photo})`, color: 'transparent' } : undefined}
            aria-hidden="true"
          >
            {!photo && initials(member.name)}
          </div>
          <div>
            <div className="member-card__name">{member.name}</div>
            <div className="member-card__party">{member.party || '무소속'}</div>
          </div>
        </div>
        {sub && <p className="member-card__sub">{sub}</p>}
        <div className="member-card__metrics">
          <div className={`metric-chip ${criminal > 0 ? 'metric-chip--alert' : ''}`}>
            <span className="metric-chip__num">{criminal}</span>
            <span className="metric-chip__label">전과</span>
          </div>
          <div className="metric-chip">
            <span className="metric-chip__num">{terms || '—'}</span>
            <span className="metric-chip__label">{TERM_LABEL[terms] || '선수'}</span>
          </div>
          <div className="metric-chip metric-chip--cta">
            <span className="metric-chip__num">›</span>
            <span className="metric-chip__label">표결·발의</span>
          </div>
        </div>
      </div>
    </article>
  );
}

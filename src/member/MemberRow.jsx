import React from 'react';
import { partyColor, initials } from '../utils/partyColors';
import { termCount } from './memberModel';
import '../pages/Members.css';

export default function MemberRow({ member, onSelect, selected = false }) {
  const sub = [member.district, member.committee].filter(Boolean).join(' · ');
  const photo = member.photo_url || member.photo;
  const terms = termCount(member.term);
  return (
    <button type="button" className={`member-row${selected ? ' is-selected' : ''}`} style={{ '--party': partyColor(member.party) }}
      onClick={() => onSelect(member.id)} aria-current={selected ? 'true' : undefined} data-member-id={member.id}>
      <span className="member-row__party-bar" aria-hidden="true" />
      <span className="member-row__photo" style={photo ? { backgroundImage: `url(${photo})`, color: 'transparent' } : undefined} aria-hidden="true">{!photo && initials(member.name)}</span>
      <span>
        <span className="member-row__name">{member.name}<span className="member-row__party">{member.party || '무소속'}</span></span>
        {sub && <span className="member-row__sub">{sub}</span>}
      </span>
      <span className="member-row__metrics num">전과 <b>{member.criminal_count || 0}</b>{terms ? <> · <b>{terms}</b>선</> : null}</span>
    </button>
  );
}

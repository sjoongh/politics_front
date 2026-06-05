import React from 'react';
import { formatDate } from '../utils/dateUtils';

const Modal = ({ isOpen, onClose, title, content, type }) => {
  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    if (!content) return null;

    switch(type) {
      case 'president':
        return (
          <div>
            <h3>{content.title}</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p>{content.context}</p>
            {content.promise_type && (
              <div>
                <strong>세부사항:</strong>
                <p>{content.promise_type}</p>
              </div>
            )}
          </div>
        );

      case 'parliament':
        return (
          <div>
            <h3>{content.title}</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p><strong>상태:</strong> {content.status}</p>
            {content.proposer && (
              <p><strong>발의자:</strong> {content.proposer}</p>
            )}
            {content.committee && (
              <p><strong>소관위원회:</strong> {content.committee}</p>
            )}
            {content.context && (
              <p><strong>내용:</strong> {content.context}</p>
            )}
          </div>
        );

      case 'statements':
        return (
          <div>
            <h3>{content.speaker} ({content.party})</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p><strong>유형:</strong> {content.type}</p>
            <div className="quote">
              "{content.context}"
            </div>
            <p><strong>발언 맥락:</strong> {content.speak_reason}</p>
          </div>
        );

      case 'news':
        return (
          <div>
            <h3>{content.title}</h3>
            <p><strong>날짜:</strong> {formatDate(content.date)}</p>
            <p><strong>유형:</strong> {content.type}</p>
            <p><strong>출처:</strong> {content.source}</p>
            <p>{content.description}</p>
          </div>
        );

      default:
        return <div>{content}</div>;
    }
  };

  return (
    <div className="bk-modal" onClick={handleOverlayClick}>
      <div className="bk-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button className="bk-modal__close" onClick={onClose} aria-label="닫기">&times;</button>
        {title && <h2>{title}</h2>}
        {renderContent()}
      </div>
    </div>
  );
};

export default Modal;

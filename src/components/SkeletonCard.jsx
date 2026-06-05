import React from 'react';

const shimmer = {
  background: 'linear-gradient(90deg, rgba(94,82,64,0.08) 25%, rgba(94,82,64,0.16) 37%, rgba(94,82,64,0.08) 63%)',
  backgroundSize: '400% 100%',
  animation: 'bk-shimmer 1.4s ease infinite',
  borderRadius: '6px',
};

const SkeletonCard = () => (
  <div className="card" style={{ padding: '16px' }}>
    <div style={{ ...shimmer, height: '20px', width: '70%', marginBottom: '12px' }} />
    <div style={{ ...shimmer, height: '14px', width: '100%', marginBottom: '8px' }} />
    <div style={{ ...shimmer, height: '14px', width: '90%' }} />
    <style>{`@keyframes bk-shimmer { 0% { background-position: 100% 0 } 100% { background-position: -100% 0 } }`}</style>
  </div>
);

export default SkeletonCard;

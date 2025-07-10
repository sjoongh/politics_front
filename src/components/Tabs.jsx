import React from 'react';

const Tabs = ({ activeTab, onTabChange, tabs }) => {
  return (
    <div className="tabs-container">
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Tabs;

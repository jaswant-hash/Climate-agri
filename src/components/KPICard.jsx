import React from 'react';

const KPICard = ({ title, value, icon, iconType, trend, trendIcon, trendClass, trendText }) => {
  return (
    <div className="kpi-card">
        <div className="kpi-header">
            <span className="kpi-title">{title}</span>
            <span className={`material-symbols-rounded kpi-icon ${iconType}`}>{icon}</span>
        </div>
        <div className="kpi-value">{value}</div>
        <div className={`kpi-trend ${trendClass}`}>
            <span className="material-symbols-rounded">{trendIcon}</span>
            <span>{trendText}</span>
        </div>
    </div>
  );
};

export default KPICard;

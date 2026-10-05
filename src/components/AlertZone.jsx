import React from 'react';
import './AlertZone.css';

const AlertZone = ({ alerts }) => {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="alert-zone">
      <div className="alert-header">
        <span className="alert-icon">⚠️</span>
        <h2>Active Severe Warnings</h2>
      </div>
      <div className="alert-list">
        {alerts.map((alert, idx) => (
          <div key={idx} className="alert-item">
            <span className="alert-time mono">{alert.time}</span>
            <span className="alert-msg">{alert.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertZone;

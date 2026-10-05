import React from 'react';
import './DataRibbons.css';

const DataRibbons = ({ hourlyData }) => {
  return (
    <div className="data-ribbons-container">
      <div className="ribbons-header">
        <h2>Hourly Progression</h2>
      </div>
      
      <div className="hourly-blocks">
        {hourlyData.map((hour, idx) => (
          <div key={idx} className="hourly-block">
            <div className="hour-label mono">{hour.time}</div>
            
            <div className="hourly-data-group">
                <div className="data-row">
                    <span className="data-label">Wind</span>
                    <div className="data-bar-container">
                        <div className="data-bar" style={{ width: `${Math.min(hour.wind / 50 * 100, 100)}%` }}></div>
                    </div>
                    <span className="data-val mono">{hour.wind}k/h</span>
                </div>
                
                <div className="data-row">
                    <span className="data-label">Precip</span>
                    <div className="data-bar-container">
                        <div className="data-bar precip" style={{ width: `${hour.precip}%` }}></div>
                    </div>
                    <span className="data-val mono">{hour.precip}%</span>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataRibbons;

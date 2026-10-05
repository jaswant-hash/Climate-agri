import React from 'react';
import './TimelineView.css';

const TimelineView = ({ forecast }) => {
  return (
    <div className="timeline-container">
      <div className="timeline-header">
        <h2>7-Day Outlook</h2>
      </div>
      <div className="timeline-scroll-area">
        {forecast.map((day, idx) => (
          <div key={idx} className="timeline-card">
            <div className="day-name">{day.name}</div>
            <div className="day-temp">
              <span className="high mono">{day.high}°</span>
              <span className="low mono">{day.low}°</span>
            </div>
            
            <div className="micro-chart">
               {/* A simple placeholder for a microchart (sparkline) */}
               <svg viewBox="0 0 100 30" className="sparkline">
                 <path 
                   d={`M 0,${30 - day.trend[0]} L 25,${30 - day.trend[1]} L 50,${30 - day.trend[2]} L 75,${30 - day.trend[3]} L 100,${30 - day.trend[4]}`} 
                   fill="none" 
                   stroke="var(--sky-blue)" 
                   strokeWidth="2" 
                 />
               </svg>
            </div>
            <div className="day-condition">{day.condition}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;

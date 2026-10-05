import React from 'react';

const InsightsCard = () => {
  return (
    <div className="chart-card insights-card">
        <div className="card-header">
            <h2>Key Observations</h2>
        </div>
        <div className="insights-list">
            <div className="insight-item">
                <div className="insight-icon">
                    <span className="material-symbols-rounded">dry</span>
                </div>
                <div className="insight-content">
                    <h3>Drought Risk</h3>
                    <p>Analysis indicates a probability of reduced rainfall in the mid-western region during Q3.</p>
                </div>
            </div>
            <div className="insight-item">
                <div className="insight-icon">
                    <span className="material-symbols-rounded">psychiatry</span>
                </div>
                <div className="insight-content">
                    <h3>Crop Rotation</h3>
                    <p>Consider introducing drought-resistant soy variants for the upcoming planting season.</p>
                </div>
            </div>
            <div className="insight-item">
                <div className="insight-icon">
                    <span className="material-symbols-rounded">water_drop</span>
                </div>
                <div className="insight-content">
                    <h3>Irrigation Planning</h3>
                    <p>Early spring erratic patterns may require adjusting standard irrigation schedules by up to 2 weeks.</p>
                </div>
            </div>
        </div>
    </div>
  );
};

export default InsightsCard;

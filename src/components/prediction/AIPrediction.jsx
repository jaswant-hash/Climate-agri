import React from 'react';
import MLPredictionPanel from './MLPredictionPanel';
import { useLanguage } from '../../context/LanguageContext';

const AIPrediction = () => {
  const { t } = useLanguage();

  return (
    <div className="dashboard-container" style={{ padding: '32px 40px' }}>



      {/* Main Prediction Panel */}
      <MLPredictionPanel />

    </div>
  );
};

export default AIPrediction;

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const CropStressPrediction = () => {
  const { t } = useLanguage();

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('aiPrediction.stressTitle')}</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{t('aiPrediction.stressSub')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        
        {/* Water Stress */}
        <div style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--glass-border)',
          borderLeft: '4px solid #f59e0b', 
          borderRadius: '8px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '16px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                strokeDasharray="45, 100"
                style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ 
              position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700
            }}>
              45%
            </div>
          </div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{t('aiPrediction.stressWater')}</h4>
          <p style={{ color: '#f59e0b', fontSize: '0.8rem', marginTop: '4px' }}>Moderate Risk</p>
        </div>

        {/* Thermal Stress */}
        <div style={{ 
          background: 'var(--bg-surface)', 
          border: '1px solid var(--glass-border)',
          borderLeft: '4px solid #f43f5e', 
          borderRadius: '8px', 
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}>
          <div style={{ position: 'relative', width: '80px', height: '80px', marginBottom: '16px' }}>
            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%' }}>
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="3"
                strokeDasharray="88, 100"
                style={{ strokeLinecap: 'round', transition: 'stroke-dasharray 1s ease' }}
              />
            </svg>
            <div style={{ 
              position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-primary)', fontSize: '1.1rem', fontWeight: 700
            }}>
              88%
            </div>
          </div>
          <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', fontWeight: 600 }}>{t('aiPrediction.stressThermal')}</h4>
          <p style={{ color: '#f43f5e', fontSize: '0.8rem', marginTop: '4px' }}>Critical Risk</p>
        </div>

      </div>
    </div>
  );
};

export default CropStressPrediction;

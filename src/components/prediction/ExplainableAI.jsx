import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const ExplainableAI = () => {
  const { t } = useLanguage();

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--accent-cyan)', fontSize: '28px' }}>query_stats</span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('aiPrediction.xaiTitle')}</h3>
      </div>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>{t('aiPrediction.xaiSub')}</p>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Reasoning Block 1 */}
        <div style={{ 
            background: 'var(--glass-border)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        }}>
          <div style={{ 
            background: 'var(--bg-surface)', 
            width: '48px', height: '48px', 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-cyan)',
            flexShrink: 0
          }}>
            <span className="material-symbols-rounded">public</span>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{t('aiPrediction.xaiReason1Title')}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {t('aiPrediction.xaiReason1Desc')}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem' }}>85%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Confidence</div>
          </div>
        </div>

        {/* Reasoning Block 2 */}
        <div style={{ 
            background: 'var(--glass-border)', 
            border: '1px solid var(--glass-border)', 
            borderRadius: '12px', 
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
        }}>
          <div style={{ 
            background: 'var(--bg-surface)', 
            width: '48px', height: '48px', 
            borderRadius: '10px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--accent-cyan)',
            flexShrink: 0
          }}>
            <span className="material-symbols-rounded">storm</span>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{t('aiPrediction.xaiReason2Title')}</h4>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
              {t('aiPrediction.xaiReason2Desc')}
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem' }}>92%</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Confidence</div>
          </div>
        </div>

        {/* Feature Importance Graphic */}
        <div style={{ marginTop: 'auto', paddingTop: '24px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '0.95rem', marginBottom: '16px' }}>Model Feature Importance</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Historical Data</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                        <div style={{ width: '45%', height: '100%', background: 'var(--accent-cyan)', borderRadius: '3px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', width: '30px' }}>45%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Live Sensors</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                        <div style={{ width: '35%', height: '100%', background: '#a78bfa', borderRadius: '3px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', width: '30px' }}>35%</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ width: '100px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Satellite Img</span>
                    <div style={{ flex: 1, height: '6px', background: 'var(--glass-border)', borderRadius: '3px' }}>
                        <div style={{ width: '20%', height: '100%', background: '#f59e0b', borderRadius: '3px' }} />
                    </div>
                    <span style={{ color: 'var(--text-primary)', fontSize: '0.8rem', width: '30px' }}>20%</span>
                </div>
            </div>
        </div>

      </div>
    </div>
  );
};

export default ExplainableAI;

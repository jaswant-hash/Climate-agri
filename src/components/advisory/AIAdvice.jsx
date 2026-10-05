import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Skel = ({ h = 12, w = '100%' }) => (
  <div style={{
    height: h, width: w, borderRadius: 6, marginBottom: 6,
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-surface) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite'
  }} />
);

const AIAdvice = ({ advice, loading }) => {
  const { t } = useLanguage();

  return (
    <div className="bento-item" style={{
      padding: '32px', height: '100%',
      background: 'var(--bg-surface)',
      border: '1px solid rgba(34, 211, 238, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <span className="material-symbols-rounded" style={{ color: 'var(--accent-cyan)', fontSize: '28px' }}>smart_toy</span>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('advisory.aiTitle')}</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Best Planting Time */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            background: 'var(--accent-cyan)', color: '#020617',
            width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span className="material-symbols-rounded">calendar_month</span>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
              {t('advisory.aiPlanting')}
            </h4>
            {loading
              ? <><Skel h={11} /><Skel h={11} w="80%" /></>
              : <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {advice?.planting || '—'}
                </p>
            }
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)' }} />

        {/* Irrigation Strategy */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            background: 'var(--accent-sky)', color: '#020617',
            width: '40px', height: '40px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
          }}>
            <span className="material-symbols-rounded">sprinkler</span>
          </div>
          <div style={{ flex: 1 }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '1.05rem', fontWeight: 600, marginBottom: '6px' }}>
              {t('advisory.aiIrrigation')}
            </h4>
            {loading
              ? <><Skel h={11} /><Skel h={11} w="75%" /><Skel h={11} w="55%" /></>
              : <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                  {advice?.irrigation || '—'}
                </p>
            }
          </div>
        </div>

      </div>
    </div>
  );
};

export default AIAdvice;

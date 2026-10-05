import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Skel = ({ h = 12, w = '100%', r = 6 }) => (
  <div style={{
    height: h, width: w, borderRadius: r,
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-surface) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite'
  }} />
);

const CropRecommendation = ({ crops, loading }) => {
  const { t } = useLanguage();

  return (
    <div className="bento-item" style={{ padding: '32px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('advisory.cropTitle')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{t('advisory.cropSub')}</p>
        </div>
        <span className="material-symbols-rounded" style={{ color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.1)', padding: '12px', borderRadius: '12px' }}>psychiatry</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading
          ? [1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: 16, background: 'var(--glass-border)', borderRadius: 12 }}>
                <Skel h={48} w={48} r={10} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <Skel h={14} w="70%" />
                  <Skel h={10} w="50%" />
                </div>
                <Skel h={20} w={40} />
              </div>
            ))
          : (crops || []).map((crop, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--glass-border)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  transition: 'all 0.25s',
                  cursor: 'default',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,211,238,0.08)'; e.currentTarget.style.borderColor = 'rgba(34,211,238,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--glass-border)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
              >
                <div style={{
                  background: 'var(--bg-surface)', width: '48px', height: '48px',
                  borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-cyan)'
                }}>
                  <span className="material-symbols-rounded">{crop.icon}</span>
                </div>
                <div style={{ flex: 1 }}>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{crop.name}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{t('advisory.cropSeason')}: {crop.season}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '1.1rem' }}>{crop.confidence}%</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{t('advisory.cropMatch')}</div>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
};

export default CropRecommendation;

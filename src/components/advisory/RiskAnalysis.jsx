import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

const Skel = ({ h = 12, w = '100%' }) => (
  <div style={{
    height: h, width: w, borderRadius: 6,
    background: 'linear-gradient(90deg, var(--bg-card) 25%, var(--bg-surface) 50%, var(--bg-card) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.4s infinite'
  }} />
);

// Animated progress bar
function RiskBar({ level, color }) {
  return (
    <div style={{ width: '100%', height: '8px', background: 'var(--glass-border)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{
        height: '100%',
        width: `${level}%`,
        background: color,
        borderRadius: '4px',
        boxShadow: `0 0 10px ${color}80`,
        transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }} />
    </div>
  );
}

const RiskAnalysis = ({ risks, loading }) => {
  const { t } = useLanguage();

  // pick the highest risk for the alert banner
  const topRisk = risks ? [...risks].sort((a, b) => b.level - a.level)[0] : null;

  return (
    <div className="bento-item" style={{ padding: '32px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t('advisory.riskTitle')}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>{t('advisory.riskSub')}</p>
        </div>
        <span className="material-symbols-rounded" style={{ color: '#f43f5e', background: 'rgba(244,63,94,0.1)', padding: '12px', borderRadius: '12px' }}>warning</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {loading
          ? [1, 2, 3].map(i => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Skel h={12} w="40%" />
                  <Skel h={12} w="20%" />
                </div>
                <Skel h={8} />
              </div>
            ))
          : (risks || []).map((risk, idx) => (
              <div key={idx}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-end' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-rounded" style={{ color: risk.color, fontSize: '18px' }}>{risk.icon}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem' }}>{risk.name}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ color: risk.color, fontWeight: 700, marginRight: '8px' }}>{risk.level}%</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{risk.status}</span>
                  </div>
                </div>
                <RiskBar level={risk.level} color={risk.color} />
              </div>
            ))}
      </div>

      {/* Dynamic alert banner */}
      {!loading && topRisk && (
        <div style={{
          marginTop: '24px', padding: '16px',
          background: 'var(--bg-surface)',
          border: `1px solid var(--glass-border)`,
          borderLeft: `4px solid ${topRisk.color}`,
          borderRadius: '8px'
        }}>
          <p style={{ color: 'var(--text-primary)', fontSize: '0.85rem', lineHeight: 1.5 }}>
            <strong style={{ color: topRisk.color }}>{topRisk.status} Alert: </strong>
            {topRisk.name} is at {topRisk.level}% — {
              topRisk.level >= 70
                ? 'immediate intervention required.'
                : topRisk.level >= 45
                ? 'take preventive measures this week.'
                : 'monitor closely over next 14 days.'
            }
          </p>
        </div>
      )}

      {loading && (
        <div style={{ marginTop: 24, padding: 16, background: 'var(--bg-surface)', borderRadius: 8, borderLeft: '4px solid var(--border)' }}>
          <Skel h={12} w="90%" />
          <div style={{ marginTop: 6 }}><Skel h={12} w="60%" /></div>
        </div>
      )}
    </div>
  );
};

export default RiskAnalysis;

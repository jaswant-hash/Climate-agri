import React, { useState, useEffect } from 'react';
import { fetchAdvisory } from '../../services/advisoryApi';
import { useLanguage } from '../../context/LanguageContext';
import CropRecommendation from './CropRecommendation';
import RiskAnalysis from './RiskAnalysis';
import AIAdvice from './AIAdvice';

const AgriculturalAdvisory = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const load = async () => {
    try {
      setError(null);
      const result = await fetchAdvisory();
      setData(result);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Could not reach backend. Ensure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const actionSections = [
    { label: t('advisory.actionImm'),   color: 'var(--accent-cyan)', key: 'immediate'  },
    { label: t('advisory.actionShort'), color: '#f59e0b',            key: 'short_term' },
    { label: t('advisory.actionLong'),  color: '#34d399',            key: 'long_term'  },
  ];

  return (
    <div className="dashboard-container" style={{ padding: '32px 40px' }}>

      {/* Header */}
      <div className="dashboard-header" style={{ marginBottom: '32px' }}>
        <div>
          <h1>{t('advisory.title')}</h1>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Live indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <span style={{
              width: 8, height: 8, borderRadius: '50%', background: '#22c55e',
              boxShadow: '0 0 0 0 rgba(34,197,94,0.6)',
              animation: 'livePulse 2s ease-in-out infinite', display: 'inline-block'
            }} />
            {loading ? 'Loading…' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Live'}
          </div>
          <button
            onClick={() => { setLoading(true); load(); }}
            style={{
              background: 'none', border: '1px solid var(--border)', borderRadius: 8,
              padding: '6px 8px', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
            }}
            title="Refresh"
          >
            <span className="material-symbols-rounded">refresh</span>
          </button>
          <button className="primary-btn" style={{ padding: '10px 24px', fontSize: '0.9rem' }}>
            <span className="material-symbols-rounded" style={{ verticalAlign: 'middle', marginRight: '8px', fontSize: '18px' }}>download</span>
            {t('advisory.btnExport')}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20,
          background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: 10, padding: '12px 18px', color: '#f87171', fontSize: '0.88rem'
        }}>
          <span className="material-symbols-rounded">wifi_off</span>
          <span>{error}</span>
          <button onClick={() => { setLoading(true); load(); }} style={{
            marginLeft: 'auto', background: 'rgba(239,68,68,0.2)', border: 'none',
            borderRadius: 6, padding: '4px 14px', color: '#f87171', cursor: 'pointer'
          }}>Retry</button>
        </div>
      )}

      {/* Live metrics strip */}
      {!loading && data?.metrics && (
        <div style={{
          display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap'
        }}>
          {[
            { label: 'Rain (90d)',       value: `${data.metrics.total_rain_90d} mm`,   icon: 'water_drop',        color: '#38bdf8' },
            { label: 'Forecast (14d)',   value: `${data.metrics.forecast_rain_14d} mm`, icon: 'cloudy_snowing',    color: '#818cf8' },
            { label: 'Avg Max Temp',     value: `${data.metrics.avg_max_temp}°C`,       icon: 'thermostat',        color: '#f43f5e' },
            { label: 'Heat Stress Days', value: `${data.metrics.heat_days_90} days`,    icon: 'local_fire_department', color: '#f97316' },
          ].map((m, i) => (
            <div key={i} style={{
              flex: '1 1 160px', background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12
            }}>
              <span className="material-symbols-rounded" style={{ color: m.color, fontSize: 22 }}>{m.icon}</span>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 2 }}>{m.label}</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{m.value}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div style={{ gridColumn: 'span 1' }}>
          <CropRecommendation crops={data?.crops} loading={loading} />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <RiskAnalysis risks={data?.risks} loading={loading} />
        </div>
        <div style={{ gridColumn: 'span 1' }}>
          <AIAdvice advice={data?.advice} loading={loading} />
        </div>
      </div>

      {/* Action Plan */}
      <div className="bento-item" style={{ padding: '32px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '24px' }}>
          {t('advisory.actionTitle')}
        </h3>
        <div style={{ display: 'flex', gap: '24px' }}>
          {actionSections.map(({ label, color, key }) => (
            <div key={key} style={{
              flex: 1, background: 'var(--glass-border)', padding: '20px',
              borderRadius: '12px', borderLeft: `4px solid ${color}`
            }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>{label}</h4>
              <ul style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', paddingLeft: '20px', lineHeight: 1.7 }}>
                {loading
                  ? [1, 2].map(i => <li key={i} style={{ listStyle: 'none', marginBottom: 8 }}><div style={{ height: 11, background: 'var(--bg-card)', borderRadius: 4 }} /></li>)
                  : (data?.action_plan?.[key] || []).map((item, i) => <li key={i}>{item}</li>)
                }
              </ul>
            </div>
          ))}
        </div>
        {data?.fetched_at && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 16 }}>
            <span className="material-symbols-rounded" style={{ fontSize: 13 }}>schedule</span>
            Data as of {new Date(data.fetched_at).toLocaleString()}
          </div>
        )}
      </div>

    </div>
  );
};

export default AgriculturalAdvisory;

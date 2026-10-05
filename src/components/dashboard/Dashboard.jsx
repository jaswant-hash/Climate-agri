import React, { useState, useEffect, useRef } from 'react';
import { fetchDashboardKPIs } from '../../services/dashboardApi';
import { useLanguage } from '../../context/LanguageContext';
import './Dashboard.css';

// ── Tiny Sparkline SVG ──────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#38bdf8', height = 40 }) {
  if (!data.length) return null;
  const w = 120, h = height;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  const areaClose = `${w},${h} 0,${h}`;
  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`${pts} ${areaClose}`}
        fill={`url(#sg-${color.replace('#', '')})`}
      />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      {/* last dot */}
      {data.length > 1 && (() => {
        const lx = w, ly = h - ((data[data.length - 1] - min) / range) * (h - 4) - 2;
        return <circle cx={lx} cy={ly} r="3" fill={color} />;
      })()}
    </svg>
  );
}

// ── Animated counter hook ────────────────────────────────────────────────────
function useAnimatedValue(target, duration = 900) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = null;
    const from = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (target - from) * ease);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return display;
}

// ── KPI Card ────────────────────────────────────────────────────────────────
function KPICard({ title, rawValue, unit, trendLabel, trendClass, icon, color, sparkData, loading }) {
  const animated = useAnimatedValue(loading ? 0 : parseFloat(rawValue) || 0);
  const displayVal = loading ? '—' : `${animated.toFixed(unit === ' SMI' || unit === '/100' ? 2 : 1)}${unit}`;

  return (
    <div className={`kpi-card dyn-kpi ${loading ? 'kpi-loading' : ''}`}>
      <div className="kpi-header">
        <span className="kpi-title">{title}</span>
        <span className="material-symbols-rounded kpi-icon" style={{ color }}>{icon}</span>
      </div>
      <div className="kpi-value" style={{ color: loading ? 'var(--text-muted)' : undefined }}>
        {displayVal}
      </div>
      <div className={`kpi-trend ${trendClass}`}>
        <span className="material-symbols-rounded">
          {trendClass === 'danger' ? 'trending_up' : trendClass === 'warning' ? 'info' : 'trending_down'}
        </span>
        <span>{loading ? 'Fetching live data…' : trendLabel}</span>
      </div>
      {!loading && sparkData && (
        <div style={{ marginTop: 8 }}>
          <Sparkline data={sparkData} color={color} />
        </div>
      )}
    </div>
  );
}

function RiskBadge({ level, color }) {
  return (
    <span style={{ color, fontWeight: 700, fontSize: '0.85rem', letterSpacing: '0.08em' }}>
      {level}
    </span>
  );
}

// ── Insight Generator (data-driven) ─────────────────────────────────────────
function getInsights(data) {
  if (!data) return [];
  const insights = [];

  if (data.heat_stress_days >= 10) {
    insights.push({
      icon: 'local_fire_department',
      color: '#ef4444',
      title: 'Heat Stress Alert',
      desc: `${data.heat_stress_days} days exceeded 38°C in the past 90 days. Irrigate during pre-dawn hours to reduce crop thermal damage.`,
    });
  } else if (data.heat_stress_days > 0) {
    insights.push({
      icon: 'thermostat',
      color: '#f97316',
      title: 'Moderate Heat Stress',
      desc: `${data.heat_stress_days} heat stress days recorded recently. Monitor high-temperature sensitive crops closely.`,
    });
  } else {
    insights.push({
      icon: 'thermostat',
      color: '#22c55e',
      title: 'Temperature Normal',
      desc: 'No heat stress days detected in the past 90 days. Conditions are favourable for most crops.',
    });
  }

  if (data.soil_moisture_index < 0.55) {
    insights.push({
      icon: 'dry',
      color: '#eab308',
      title: 'Drought Risk',
      desc: `Soil Moisture Index at ${data.soil_moisture_index} — well below optimal (0.75+). Consider drought-resistant varieties and drip irrigation.`,
    });
  } else if (data.soil_moisture_index >= 0.55 && data.soil_moisture_index < 0.75) {
    insights.push({
      icon: 'water_drop',
      color: '#38bdf8',
      title: 'Soil Moisture Adequate',
      desc: `SMI at ${data.soil_moisture_index}. Rainfall has been sufficient, though supplemental irrigation during dry spells is advisable.`,
    });
  } else {
    insights.push({
      icon: 'psychiatry',
      color: '#34d399',
      title: 'Crop Rotation Advised',
      desc: 'Good moisture levels detected. Optimal time to plan crop rotation to maximise soil nutrient retention.',
    });
  }

  return insights;
}

// ── Readiness Ring ───────────────────────────────────────────────────────────
function ReadinessRing({ score, color }) {
  const r = 42, circ = 2 * Math.PI * r;
  const animated = useAnimatedValue(score, 1200);
  const dash = circ * (animated / 100);
  return (
    <div className="readiness-ring-wrap">
      <svg width="110" height="110" viewBox="0 0 110 110">
        <circle cx="55" cy="55" r={r} fill="none" stroke="var(--bg-card)" strokeWidth="10" />
        <circle
          cx="55" cy="55" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 55 55)"
          style={{ transition: 'stroke-dasharray 0.05s' }}
        />
      </svg>
      <div className="readiness-ring-label">
        <span className="score-value">{Math.round(animated)}</span>
        <span className="score-max">/100</span>
      </div>
    </div>
  );
}

// ── Main Dashboard Component ─────────────────────────────────────────────────
export default function Dashboard({ activeFilter }) {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);

  const load = async () => {
    try {
      setError(null);
      const kpis = await fetchDashboardKPIs();
      setData(kpis);
      setLastUpdated(new Date());
    } catch (e) {
      setError('Could not reach backend. Ensure the FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refresh every 5 minutes
    intervalRef.current = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  const insights = getInsights(data);
  const riskColor = data?.risk_color || '#eab308';

  // Determine anomaly trend class
  const anomalyClass = data?.temp_anomaly_c >= 1.5 ? 'danger'
    : data?.temp_anomaly_c >= 0.5 ? 'warning' : 'success';

  const rainClass = data?.annual_rain_mm < 700 ? 'danger'
    : data?.annual_rain_mm < 900 ? 'warning' : 'success';

  const smiClass = data?.soil_moisture_index < 0.5 ? 'danger'
    : data?.soil_moisture_index < 0.7 ? 'warning' : 'success';

  const heatClass = data?.heat_stress_days >= 15 ? 'danger'
    : data?.heat_stress_days >= 5 ? 'warning' : 'success';

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>{t('dashboard.title')}</h1>

        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {data && <RiskBadge level={data.risk_level} color={riskColor} />}
          <div className="live-indicator">
            <span className="live-dot" />
            <span className="live-label">
              {loading ? 'Loading…' : lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Live'}
            </span>
          </div>
          <button
            className="refresh-btn"
            onClick={() => { setLoading(true); load(); }}
            title="Refresh data"
          >
            <span className="material-symbols-rounded">refresh</span>
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="error-banner">
          <span className="material-symbols-rounded">wifi_off</span>
          <span>{error}</span>
          <button onClick={() => { setLoading(true); load(); }}>Retry</button>
        </div>
      )}

      {/* Bento Grid */}
      <div className="bento-grid">

        {/* KPI 1 – Temp Anomaly */}
        <div className="bento-item item-kpi-1">
          <KPICard
            title={t('dashboard.kpi1.title')}
            rawValue={data?.temp_anomaly_c ?? 0}
            unit="°C"
            trendLabel={data ? `vs 2000–2009 baseline` : ''}
            trendClass={anomalyClass}
            icon="thermostat"
            color="#f43f5e"
            loading={loading}
          />
        </div>

        {/* KPI 2 – Annual Rainfall */}
        <div className="bento-item item-kpi-2">
          <KPICard
            title={t('dashboard.kpi2.title')}
            rawValue={data?.annual_rain_mm ?? 0}
            unit=" mm"
            trendLabel={data ? `${data.annual_rain_mm >= 1100 ? 'Above' : 'Below'} 1100 mm optimal` : ''}
            trendClass={rainClass}
            icon="water_drop"
            color="#38bdf8"
            loading={loading}
          />
        </div>

        {/* Insights */}
        <div className="bento-item item-insights">
          <div className="insights-card">
            <div className="card-header">
              <h2 style={{ margin: 0 }}>{t('dashboard.insights.title')}</h2>
            </div>
            <div className="insights-list">
              {loading ? (
                <>
                  <div className="insight-item skeleton-insight"><div className="skel skel-icon"/><div style={{flex:1}}><div className="skel skel-line"/><div className="skel skel-line short"/></div></div>
                  <div className="insight-item skeleton-insight"><div className="skel skel-icon"/><div style={{flex:1}}><div className="skel skel-line"/><div className="skel skel-line short"/></div></div>
                </>
              ) : insights.map((ins, i) => (
                <div className="insight-item" key={i}>
                  <div className="insight-icon" style={{ background: ins.color + '22', color: ins.color }}>
                    <span className="material-symbols-rounded">{ins.icon}</span>
                  </div>
                  <div className="insight-content">
                    <h3>{ins.title}</h3>
                    <p>{ins.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KPI 3 – Soil Moisture */}
        <div className="bento-item item-kpi-3">
          <KPICard
            title={t('dashboard.kpi3.title')}
            rawValue={data?.soil_moisture_index ?? 0}
            unit=" SMI"
            trendLabel={data ? `${(data.soil_moisture_index * 100).toFixed(0)}% of optimal rainfall received` : ''}
            trendClass={smiClass}
            icon="grass"
            color="#34d399"
            loading={loading}
          />
        </div>

        {/* KPI 4 – Heat Stress Days */}
        <div className="bento-item item-kpi-4">
          <KPICard
            title="Heat Stress Days"
            rawValue={data?.heat_stress_days ?? 0}
            unit=" days"
            trendLabel={data ? `Days >38°C in last 90 days` : ''}
            trendClass={heatClass}
            icon="warning"
            color="#f97316"
            loading={loading}
          />
        </div>

        {/* Readiness Score */}
        <div className="bento-item item-highlight">
          <div className="highlight-content">
            <h3>{t('dashboard.highlight.title')}</h3>
            {loading ? (
              <div className="skel skel-ring" />
            ) : (
              <ReadinessRing score={data?.readiness_score ?? 50} color={riskColor} />
            )}
            <p style={{ marginTop: 8 }}>
              {data ? (
                data.risk_level === 'LOW'
                  ? 'Region is well-prepared for current conditions.'
                  : data.risk_level === 'MODERATE'
                  ? 'Moderate preparedness. Review irrigation and crop plans.'
                  : data.risk_level === 'HIGH'
                  ? 'High risk detected. Priority action required on water management.'
                  : 'Critical risk! Immediate intervention needed.'
              ) : '…'}
            </p>
            {data && (
              <div className="fetched-at">
                <span className="material-symbols-rounded" style={{fontSize:'13px'}}>schedule</span>
                Data as of {new Date(data.fetched_at).toLocaleString()}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { fetchOptions, fetchPrediction, checkHealth } from '../../services/mlApi';

// ── Icons for each prediction aspect ──────────────────────
const ASPECT_META = {
  Target_Stress_Risk_Pct: { label: 'Crop Stress Risk', icon: 'warning', unit: '%', color: '#ef4444' },
  Target_Yield_Loss_Pct: { label: 'Expected Yield Loss', icon: 'trending_down', unit: '%', color: '#f97316' },
  Target_Disease_Risk_Pct: { label: 'Disease & Pest Risk', icon: 'bug_report', unit: '%', color: '#a855f7' },
  Target_Irrigation_Need_mm: { label: 'Irrigation Need', icon: 'water_drop', unit: ' mm', color: '#3b82f6' },
  Target_Drought_Severity_Pct: { label: 'Drought Severity', icon: 'dry', unit: '%', color: '#f59e0b' },
  Target_HeatWave_Severity_Pct: { label: 'Heat Wave Severity', icon: 'thermostat', unit: '%', color: '#ef4444' },
  Target_Crop_Suitability_Score: { label: 'Crop Suitability', icon: 'eco', unit: '%', color: '#22c55e' },
  Target_Fertilizer_Efficiency_Index: { label: 'Fertilizer Efficiency', icon: 'science', unit: '%', color: '#06b6d4' },
  Target_Harvest_Quality_Risk_Pct: { label: 'Harvest Quality Risk', icon: 'agriculture', unit: '%', color: '#8b5cf6' },
};

const RISK_STYLES = {
  LOW: { bg: 'transparent', border: '#22c55e', text: '#22c55e' },
  MODERATE: { bg: 'transparent', border: '#eab308', text: '#eab308' },
  HIGH: { bg: 'transparent', border: '#f97316', text: '#f97316' },
  CRITICAL: { bg: 'transparent', border: '#ef4444', text: '#ef4444' },
};

export default function MLPredictionPanel() {
  const [options, setOptions] = useState(null);
  const [serverOnline, setServerOnline] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Form state
  const [form, setForm] = useState({
    block: '',
    crop: '',
    season: '',
    soil_type: '',
    soil_ph_min: 6.5,
    total_rain_mm: 800,
    rain_deficit_mm: 100,
    heat_stress_days: 8,
    accumulated_gdd: 900,
  });

  // Load options & check server on mount
  useEffect(() => {
    (async () => {
      const alive = await checkHealth();
      setServerOnline(alive);
      if (alive) {
        try {
          const opts = await fetchOptions();
          setOptions(opts);
          setForm(f => ({
            ...f,
            block: opts.blocks[0] || '',
            crop: opts.crops[0] || '',
            season: opts.seasons[0] || '',
            soil_type: opts.soil_types[0] || '',
          }));
        } catch (e) {
          setError('Could not load options from server.');
        }
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: name === 'heat_stress_days' ? parseInt(value) : parseFloat(value) || value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await fetchPrediction(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Styles ────────────────────────────────────────────────
  const cardStyle = {
    background: 'var(--bg-card)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    padding: '24px',
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    background: '#1e293b',
    color: '#f1f5f9',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    colorScheme: 'dark',
  };

  const inputStyle = { ...selectStyle, cursor: 'text' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Inject custom CSS for native dropdown hover colors */}
      <style>{`
        select option:checked,
        select option:hover {
            box-shadow: 0 0 10px 100px #22c55e inset !important;
            background-color: #22c55e !important;
            color: #ffffff !important;
        }
      `}</style>



      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: '24px' }}>

        {/* ── Left: Input Form ── */}
        <div style={cardStyle}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-symbols-rounded" style={{ color: 'var(--accent)' }}>tune</span>
            Farm Parameters
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Block */}
            <div>
              <label style={labelStyle}>Madurai Block</label>
              <select name="block" value={form.block} onChange={handleChange} style={selectStyle} disabled={!options}>
                {options?.blocks.map(b => <option key={b}>{b}</option>)}
              </select>
            </div>

            {/* Crop */}
            <div>
              <label style={labelStyle}>Crop</label>
              <select name="crop" value={form.crop} onChange={handleChange} style={selectStyle} disabled={!options}>
                {options?.crops.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>

            {/* Season */}
            <div>
              <label style={labelStyle}>Season</label>
              <select name="season" value={form.season} onChange={handleChange} style={selectStyle} disabled={!options}>
                {options?.seasons.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Soil Type */}
            <div>
              <label style={labelStyle}>Soil Type</label>
              <select name="soil_type" value={form.soil_type} onChange={handleChange} style={selectStyle} disabled={!options}>
                {options?.soil_types.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>

            {/* Weather parameters are now automatically fetched via Live API in the backend */}
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button
                type="submit"
                disabled={loading || !serverOnline}
                style={{
                  padding: '16px 32px',
                  borderRadius: '12px',
                  border: 'none',
                  background: loading ? '#333' : 'linear-gradient(135deg, #16a34a, #22c55e)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '16px',
                  cursor: loading || !serverOnline ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  transition: 'all 0.3s ease',
                  width: '80%',
                  opacity: (!serverOnline && !loading) ? 0.5 : 1
                }}
              >
                <span className="material-symbols-rounded">{loading ? 'hourglass_top' : 'psychology'}</span>
                {loading ? 'Analysing...' : 'Run AI Prediction'}
              </button>
            </div>

            {error && (
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontSize: '13px' }}>
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ── Right: Results Panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {!result && !loading && (
            <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', gap: '16px' }}>
              <span className="material-symbols-rounded" style={{ fontSize: '64px', color: 'var(--text-muted)', opacity: 0.4 }}>psychology</span>
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Select your farm parameters and click<br /><strong>Run AI Prediction</strong> to get 9 intelligent insights.
              </p>
            </div>
          )}

          {loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.3s ease' }}>
              <style>{`
                @keyframes pulse-bg {
                  0% { background-position: 200% 0; }
                  100% { background-position: -200% 0; }
                }
                .skel-loader {
                  background: linear-gradient(90deg, rgba(148, 163, 184, 0.1) 25%, rgba(148, 163, 184, 0.25) 50%, rgba(148, 163, 184, 0.1) 75%);
                  background-size: 200% 100%;
                  animation: pulse-bg 1.5s infinite linear;
                  border: 1px solid var(--border);
                }
              `}</style>

              {/* Skeleton Banner */}
              <div className="skel-loader" style={{ height: '110px', borderRadius: '16px' }} />

              {/* Skeleton Live Data (5 boxes) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="skel-loader" style={{ height: '80px', borderRadius: '10px' }} />
                ))}
              </div>

              {/* Skeleton Prediction Cards (8 cards) */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="skel-loader" style={{ height: '105px', borderRadius: '14px' }} />
                ))}
              </div>
            </div>
          )}

          {result && (
            <>
              {/* Risk Level Banner */}
              {(() => {
                const rs = RISK_STYLES[result.risk_level] || RISK_STYLES.MODERATE;
                return (
                  <div style={{
                    ...cardStyle,
                    background: rs.bg,
                    borderColor: rs.border,
                    display: 'flex', alignItems: 'center', gap: '16px',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '40px', color: rs.text }}>
                      {result.risk_level === 'LOW' ? 'check_circle' : result.risk_level === 'CRITICAL' ? 'crisis_alert' : 'warning'}
                    </span>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: rs.text, letterSpacing: '0.1em' }}>OVERALL RISK LEVEL</div>
                      <div style={{ fontSize: '28px', fontWeight: 800, color: rs.text }}>{result.risk_level}</div>
                      <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        {result.input.crop} in {result.input.block} — {result.input.season}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Live Data Used — Read Only */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '10px',
              }}>
                {[
                  { label: 'Soil pH', icon: 'science', value: result.input.soil_ph_min },
                  { label: 'Rainfall', icon: 'water_drop', value: `${result.input.total_rain_mm} mm` },
                  { label: 'Rain Deficit', icon: 'opacity', value: `${result.input.rain_deficit_mm} mm` },
                  { label: 'Heat Stress', icon: 'thermostat', value: `${result.input.heat_stress_days} days` },
                  { label: 'GDD', icon: 'wb_sunny', value: result.input.accumulated_gdd },
                ].map(({ label, icon, value }) => (
                  <div key={label} style={{
                    background: 'var(--bg-card)',
                    borderRadius: '10px',
                    padding: '10px',
                    textAlign: 'center',
                    border: '1px solid var(--border)',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: '18px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{icon}</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{value}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* 9 Prediction Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                {Object.entries(result.predictions).map(([key, value]) => {
                  const meta = ASPECT_META[key] || { label: key, icon: 'analytics', unit: '', color: '#888' };
                  const isHigher = (key.includes('Suitability') || key.includes('Fertilizer')) ? value > 60 : value < 40;
                  const barColor = isHigher ? '#22c55e' : value > 60 ? '#ef4444' : '#f97316';
                  const barWidth = key.includes('mm') ? Math.min(100, (value / 500) * 100) : value;

                  return (
                    <div key={key} style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '14px',
                      padding: '16px',
                      transition: 'transform 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'none'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
                          {value}{meta.unit}
                        </span>
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '10px' }}>
                        {meta.label}
                      </div>
                      {/* Progress Bar */}
                      <div style={{ height: '4px', background: 'var(--border)', borderRadius: '4px' }}>
                        <div style={{
                          height: '100%', width: `${barWidth}%`,
                          background: barColor,
                          borderRadius: '4px',
                          transition: 'width 1s ease',
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>


            </>
          )}
        </div>
      </div>
    </div>
  );
}

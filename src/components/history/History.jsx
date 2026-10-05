import React, { useState, useEffect } from 'react';
import './History.css';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/history');
      if (!response.ok) {
        throw new Error('Failed to fetch history');
      }
      const data = await response.json();
      setHistory(data.history || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/history/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setHistory(prev => prev.filter(record => record._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete record', err);
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all history?')) return;
    try {
      const response = await fetch('http://127.0.0.1:8000/history', { method: 'DELETE' });
      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error('Failed to clear history', err);
    }
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <div className="history-container fade-in">
      <div className="history-header">
        <div>
          <h1>Prediction History</h1>
        </div>
        {history.length > 0 && (
          <button 
            className="secondary-btn" 
            onClick={handleClearAll}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ef4444', borderColor: '#ef4444' }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: '18px' }}>delete_sweep</span>
            Clear All
          </button>
        )}
      </div>

      {loading && <div className="loading">Loading history...</div>}
      {error && <div className="error">Error: {error} (Is the backend running and MongoDB connected?)</div>}

      {!loading && !error && history.length === 0 && (
        <div className="empty-state">
          <span className="material-symbols-rounded">history_toggle_off</span>
          <h3>No History Yet</h3>
          <p>Make a prediction in the AI Prediction tab to see it here.</p>
        </div>
      )}

      {!loading && !error && history.length > 0 && (
        <div className="history-list">
          {history.map((record, index) => (
            <div key={record._id || index} className="history-card" style={{ borderLeftColor: record.model_results.risk_color, position: 'relative' }}>
              <div className="history-card-header" style={{ paddingRight: '40px' }}>
                <span className="history-date">{formatDate(record.timestamp)}</span>
                <span
                  className="risk-badge"
                  style={{ background: 'none', color: record.model_results.risk_color, border: 'none', padding: 0, fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em' }}
                >
                  {record.model_results.overall_risk_level}
                </span>
              </div>
              <button 
                onClick={() => handleDelete(record._id)}
                style={{ 
                  position: 'absolute', top: '16px', right: '16px', 
                  background: 'none', border: 'none', color: 'var(--text-muted)', 
                  cursor: 'pointer', padding: '4px', borderRadius: '4px' 
                }}
                title="Delete Record"
                onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <span className="material-symbols-rounded" style={{ fontSize: '20px' }}>delete</span>
              </button>
              <div className="history-card-body">
                <div className="info-group">
                  <span className="material-symbols-rounded">location_on</span>
                  <span>{record.inputs_provided.block}</span>
                </div>
                <div className="info-group">
                  <span className="material-symbols-rounded">grass</span>
                  <span>{record.inputs_provided.crop} ({record.inputs_provided.season})</span>
                </div>
                <div className="info-group">
                  <span className="material-symbols-rounded">water_drop</span>
                  <span>Rain: {record.inputs_provided.total_rain_mm}mm</span>
                </div>
              </div>
              <div className="history-card-footer" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <div className="metric">
                  <small>Stress</small>
                  <strong>{record.model_results.Target_Stress_Risk_Pct}%</strong>
                </div>
                <div className="metric">
                  <small>Yield Loss</small>
                  <strong>{record.model_results.Target_Yield_Loss_Pct}%</strong>
                </div>
                <div className="metric">
                  <small>Irrigation</small>
                  <strong>{record.model_results.Target_Irrigation_Need_mm}mm</strong>
                </div>
                <div className="metric">
                  <small>Disease</small>
                  <strong>{record.model_results.Target_Disease_Risk_Pct}%</strong>
                </div>
                <div className="metric">
                  <small>Drought</small>
                  <strong>{record.model_results.Target_Drought_Severity_Pct}%</strong>
                </div>
                <div className="metric">
                  <small>Heatwave</small>
                  <strong>{record.model_results.Target_HeatWave_Severity_Pct}%</strong>
                </div>
                <div className="metric">
                  <small>Suitability</small>
                  <strong>{record.model_results.Target_Crop_Suitability_Score}/100</strong>
                </div>
                <div className="metric">
                  <small>Fertilizer</small>
                  <strong>{record.model_results.Target_Fertilizer_Efficiency_Index}/100</strong>
                </div>
                <div className="metric">
                  <small>Quality Risk</small>
                  <strong>{record.model_results.Target_Harvest_Quality_Risk_Pct}%</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;

// src/services/mlApi.js
// Service layer to talk to the FastAPI backend on http://localhost:8000

const API_BASE = 'http://localhost:8000';

/**
 * Fetch all valid dropdown options from the ML backend.
 * Returns { blocks, crops, seasons, soil_types }
 */
export async function fetchOptions() {
  const res = await fetch(`${API_BASE}/options`);
  if (!res.ok) throw new Error('Failed to fetch options from API');
  return res.json();
}

/**
 * Send farm data to the ML model and get 9 predictions back.
 * @param {Object} input - { block, crop, season, soil_type, soil_ph_min, total_rain_mm, rain_deficit_mm, heat_stress_days, accumulated_gdd }
 * @returns {Object} - { status, input, risk_level, risk_color, predictions }
 */
export async function fetchPrediction(input) {
  const res = await fetch(`${API_BASE}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

/**
 * Check if the API server is alive.
 * @returns {boolean}
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    return res.ok;
  } catch {
    return false;
  }
}

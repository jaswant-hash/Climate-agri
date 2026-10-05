// src/services/dashboardApi.js
// Fetches live KPI data from the FastAPI /dashboard endpoint

const API_BASE = 'http://localhost:8000';

/**
 * Fetch live dashboard KPIs from the backend.
 * Returns temp anomaly, rainfall, heat stress days, SMI, risk level, readiness score, sparklines.
 */
export async function fetchDashboardKPIs() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

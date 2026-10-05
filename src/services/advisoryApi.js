// src/services/advisoryApi.js
const API_BASE = 'http://localhost:8000';

export async function fetchAdvisory() {
  const res = await fetch(`${API_BASE}/advisory`);
  if (!res.ok) throw new Error('Failed to fetch advisory data');
  return res.json();
}

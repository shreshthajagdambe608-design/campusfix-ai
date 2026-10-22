const API_BASE = import.meta.env?.VITE_API_BASE || 'http://localhost:8000/api';

export async function analyzeIssue({ description, location, image_base64 }) {
  const resp = await fetch(`${API_BASE}/reports/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description, location, image_base64 })
  });
  if (!resp.ok) {
    throw new Error(`Analysis failed with status ${resp.status}`);
  }
  return await resp.json();
}

export async function submitReport(reportData) {
  const resp = await fetch(`${API_BASE}/reports`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reportData)
  });
  if (!resp.ok) {
    throw new Error(`Report submission failed with status ${resp.status}`);
  }
  return await resp.json();
}

export async function fetchReports(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category && filters.category !== 'All') params.append('category', filters.category);
  if (filters.priority && filters.priority !== 'All') params.append('priority', filters.priority);
  if (filters.status && filters.status !== 'All') params.append('status', filters.status);

  const url = `${API_BASE}/reports${params.toString() ? `?${params.toString()}` : ''}`;
  const resp = await fetch(url);
  if (!resp.ok) {
    throw new Error(`Failed to load reports: ${resp.status}`);
  }
  return await resp.json();
}

export async function fetchReportById(reportId) {
  const resp = await fetch(`${API_BASE}/reports/${reportId}`);
  if (!resp.ok) {
    throw new Error(`Report ${reportId} not found`);
  }
  return await resp.json();
}

export async function updateReport(reportId, updates) {
  const resp = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  if (!resp.ok) {
    throw new Error(`Failed to update report ${reportId}`);
  }
  return await resp.json();
}

export async function deleteReport(reportId) {
  const resp = await fetch(`${API_BASE}/reports/${reportId}`, {
    method: 'DELETE'
  });
  if (!resp.ok) {
    throw new Error(`Failed to delete report ${reportId}`);
  }
  return await resp.json();
}

export async function fetchGraphifyData() {
  const resp = await fetch(`${API_BASE}/graphify`);
  if (!resp.ok) {
    throw new Error(`Failed to load graphify topology: ${resp.status}`);
  }
  return await resp.json();
}

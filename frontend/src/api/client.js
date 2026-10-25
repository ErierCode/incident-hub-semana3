// Cliente de la API REST. En desarrollo Vite redirige /api al backend (puerto 3000).
async function request(path, { method = 'GET', body } = {}) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(data?.error || `Error ${response.status}`);
  }
  return data;
}

function toQuery(filters) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined && value !== null) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export const api = {
  dashboard: () => request('/dashboard'),
  technicians: () => request('/technicians'),
  listIncidents: (filters = {}) => request(`/incidents${toQuery(filters)}`),
  getIncident: (id) => request(`/incidents/${id}`),
  createIncident: (incident) => request('/incidents', { method: 'POST', body: incident }),
  assign: (id, technicianId, changedBy) =>
    request(`/incidents/${id}/assign`, { method: 'PATCH', body: { technicianId, changedBy } }),
  changeStatus: (id, status, changedBy) =>
    request(`/incidents/${id}/status`, { method: 'PATCH', body: { status, changedBy } }),
  comments: (id) => request(`/incidents/${id}/comments`),
  addComment: (id, author, message) =>
    request(`/incidents/${id}/comments`, { method: 'POST', body: { author, message } }),
};

import { useState } from 'react';
import { api } from '../api/client.js';
import { CATEGORIES, PRIORITIES } from '../constants.js';

const EMPTY = { title: '', description: '', category: 'HARDWARE', priority: 'MEDIA', reportedBy: '' };

export default function IncidentForm({ user, onCreated, onCancel }) {
  const [form, setForm] = useState({ ...EMPTY, reportedBy: user });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!form.title.trim() || !form.description.trim() || !form.reportedBy.trim()) {
      setError('Título, descripción y usuario son obligatorios');
      return;
    }
    setSaving(true);
    try {
      const incident = await api.createIncident(form);
      onCreated(incident);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="card form" onSubmit={submit} aria-label="Nuevo incidente">
      <h2>Nuevo incidente</h2>
      <label>
        Título
        <input value={form.title} onChange={update('title')} maxLength={200} />
      </label>
      <label>
        Descripción
        <textarea value={form.description} onChange={update('description')} rows={4} />
      </label>
      <div className="row">
        <label>
          Categoría
          <select value={form.category} onChange={update('category')}>
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Prioridad
          <select value={form.priority} onChange={update('priority')}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label>
          Reportado por
          <input value={form.reportedBy} onChange={update('reportedBy')} />
        </label>
      </div>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="actions">
        <button type="submit" className="primary" disabled={saving}>
          {saving ? 'Guardando…' : 'Registrar incidente'}
        </button>
        <button type="button" onClick={onCancel}>Cancelar</button>
      </div>
    </form>
  );
}

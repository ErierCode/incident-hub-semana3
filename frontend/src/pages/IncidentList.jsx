import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { CATEGORIES, PRIORITIES, STATUSES, formatDate, label } from '../constants.js';
import Badge from '../components/Badge.jsx';

const NO_FILTERS = { status: '', priority: '', category: '', technicianId: '' };

function FilterSelect({ name, text, value, options, onChange }) {
  return (
    <label>
      {text}
      <select value={value} onChange={(event) => onChange(name, event.target.value)}>
        <option value="">Todos</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.text}
          </option>
        ))}
      </select>
    </label>
  );
}

const plain = (values) => values.map((value) => ({ value, text: label(value) }));

export default function IncidentList({ onOpen, onNew }) {
  const [filters, setFilters] = useState(NO_FILTERS);
  const [incidents, setIncidents] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api.technicians().then(setTechnicians).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    api.listIncidents(filters).then(setIncidents).catch((err) => setError(err.message));
  }, [filters]);

  const setFilter = (name, value) => setFilters({ ...filters, [name]: value });

  return (
    <div>
      <div className="toolbar">
        <div className="filters">
          <FilterSelect name="status" text="Estado" value={filters.status} options={plain(STATUSES)} onChange={setFilter} />
          <FilterSelect name="priority" text="Prioridad" value={filters.priority} options={plain(PRIORITIES)} onChange={setFilter} />
          <FilterSelect name="category" text="Categoría" value={filters.category} options={plain(CATEGORIES)} onChange={setFilter} />
          <FilterSelect
            name="technicianId"
            text="Técnico"
            value={filters.technicianId}
            options={technicians.map((t) => ({ value: String(t.id), text: t.name }))}
            onChange={setFilter}
          />
          <button type="button" onClick={() => setFilters(NO_FILTERS)}>Limpiar</button>
        </div>
        <button type="button" className="primary" onClick={onNew}>Nuevo incidente</button>
      </div>

      {error && <p role="alert" className="error">{error}</p>}
      {!incidents ? (
        <p>Cargando incidentes…</p>
      ) : incidents.length === 0 ? (
        <p className="empty">No hay incidentes con estos filtros.</p>
      ) : (
        <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Categoría</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Técnico</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.id}</td>
                <td>
                  <button type="button" className="link" onClick={() => onOpen(incident.id)}>
                    {incident.title}
                  </button>
                </td>
                <td>{label(incident.category)}</td>
                <td><Badge kind="priority" value={incident.priority} /></td>
                <td><Badge kind="status" value={incident.status} /></td>
                <td>{incident.technician_name || '—'}</td>
                <td>{formatDate(incident.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
    </div>
  );
}

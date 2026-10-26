import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { STATUSES, label } from '../constants.js';

function Stat({ title, value, note, tone, alert = false }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-title">{title}</span>
      <span className={`stat-value${alert ? ' alert' : ''}`}>{value}</span>
      <span className="stat-note">{note}</span>
    </div>
  );
}

function Bars({ title, rows }) {
  const max = Math.max(1, ...rows.map((row) => row.total));
  return (
    <section className="card">
      <h3>{title}</h3>
      <ul className="bars">
        {rows.map((row) => (
          <li key={row.name}>
            <span className="bar-label">{row.name}</span>
            <span className="bar-track">
              <span className="bar-fill" style={{ width: `${(row.total / max) * 100}%` }} />
            </span>
            <span className="bar-value">{row.total}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard().then(setData).catch((err) => setError(err.message));
  }, []);

  if (error) return <p role="alert" className="error">{error}</p>;
  if (!data) return <p>Cargando indicadores…</p>;

  const rate = data.total === 0 ? 0 : Math.round((data.closed / data.total) * 100);

  return (
    <div>
      <div className="stats">
        <Stat title="Abiertos" value={data.open} note={`de ${data.total} incidentes registrados`} tone="open" />
        <Stat
          title="Críticos abiertos"
          value={data.critical}
          note={data.critical > 0 ? 'requieren atención inmediata' : 'sin incidentes críticos'}
          tone="critical"
          alert={data.critical > 0}
        />
        <Stat title="Cerrados" value={data.closed} note="incidentes resueltos y cerrados" tone="closed" />
        <Stat title="Tasa de resolución" value={`${rate} %`} note={`${data.closed} de ${data.total} cerrados`} tone="rate" />
      </div>

      <div className="grid-3">
        <Bars
          title="Por estado"
          rows={STATUSES.map((status) => ({ name: label(status), total: data.byStatus[status] || 0 }))}
        />
        <Bars
          title="Por categoría"
          rows={data.byCategory.map((row) => ({ name: label(row.category), total: row.total }))}
        />
        <Bars
          title="Carga abierta por técnico"
          rows={data.byTechnician.map((row) => ({ name: row.technician, total: row.total }))}
        />
      </div>
    </div>
  );
}

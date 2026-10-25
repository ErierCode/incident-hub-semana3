import { useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { label } from '../constants.js';

function Stat({ title, value, tone }) {
  return (
    <div className={`stat stat-${tone}`}>
      <span className="stat-value">{value}</span>
      <span className="stat-title">{title}</span>
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

  return (
    <div>
      <div className="stats">
        <Stat title="Abiertos" value={data.open} tone="open" />
        <Stat title="Cerrados" value={data.closed} tone="closed" />
        <Stat title="Críticos abiertos" value={data.critical} tone="critical" />
        <Stat title="Total" value={data.total} tone="total" />
      </div>
      <div className="grid-2">
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

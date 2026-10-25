import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { CAN_ASSIGN, NEXT_STATUS, formatDate, label } from '../constants.js';
import Badge from '../components/Badge.jsx';

export default function IncidentDetail({ id, user, onBack }) {
  const [incident, setIncident] = useState(null);
  const [comments, setComments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const [current, log] = await Promise.all([api.getIncident(id), api.comments(id)]);
      setIncident(current);
      setComments(log);
    } catch (err) {
      setError(err.message);
    }
  }, [id]);

  useEffect(() => {
    load();
    api.technicians().then(setTechnicians).catch((err) => setError(err.message));
  }, [load]);

  async function run(action) {
    setError('');
    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function addComment(event) {
    event.preventDefault();
    if (!message.trim()) return;
    await run(async () => {
      await api.addComment(id, user || 'anónimo', message);
      setMessage('');
    });
  }

  if (!incident) return error ? <p role="alert" className="error">{error}</p> : <p>Cargando incidente…</p>;

  return (
    <div>
      <button type="button" className="link" onClick={onBack}>← Volver al listado</button>
      <section className="card detail">
        <header>
          <h2>#{incident.id} · {incident.title}</h2>
          <div>
            <Badge kind="priority" value={incident.priority} /> <Badge kind="status" value={incident.status} />
          </div>
        </header>
        <p>{incident.description}</p>
        <dl>
          <dt>Categoría</dt><dd>{label(incident.category)}</dd>
          <dt>Reportado por</dt><dd>{incident.reported_by}</dd>
          <dt>Fecha</dt><dd>{formatDate(incident.created_at)}</dd>
          <dt>Técnico</dt><dd>{incident.technician_name || 'Sin asignar'}</dd>
        </dl>

        {error && <p role="alert" className="error">{error}</p>}

        <div className="actions">
          {CAN_ASSIGN.includes(incident.status) && (
            <>
              <select aria-label="Técnico" value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
                <option value="">Seleccionar técnico…</option>
                {technicians.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
              <button
                type="button"
                disabled={!technicianId}
                onClick={() => run(() => api.assign(id, Number(technicianId), user || undefined))}
              >
                {incident.technician_id ? 'Reasignar' : 'Asignar'}
              </button>
            </>
          )}
          {NEXT_STATUS[incident.status].map((next) => (
            <button
              key={next}
              type="button"
              className="primary"
              onClick={() => run(() => api.changeStatus(id, next, user || undefined))}
            >
              Pasar a {label(next)}
            </button>
          ))}
        </div>
      </section>

      <section className="card">
        <h3>Bitácora</h3>
        <ul className="log">
          {comments.map((entry) => (
            <li key={entry.id} className={entry.type === 'SISTEMA' ? 'system' : ''}>
              <span className="log-meta">{formatDate(entry.created_at)} · {entry.author}</span>
              <span>{entry.message}</span>
            </li>
          ))}
        </ul>
        <form className="comment-form" onSubmit={addComment}>
          <input
            aria-label="Comentario"
            placeholder="Escribir un comentario…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit">Comentar</button>
        </form>
      </section>
    </div>
  );
}

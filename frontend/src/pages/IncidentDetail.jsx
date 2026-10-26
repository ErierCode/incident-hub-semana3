import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { CAN_ASSIGN, NEXT_STATUS, formatDate, humanizeMessage, label } from '../constants.js';
import Avatar from '../components/Avatar.jsx';
import Badge from '../components/Badge.jsx';

function Field({ name, children }) {
  return (
    <div>
      <div className="field-label">{name}</div>
      <div className="field-value">{children}</div>
    </div>
  );
}

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
        <div className="wi-title">
          <h2>
            <span className="wi-id">#{incident.id}</span> {incident.title}
          </h2>
        </div>
        <div className="wi-meta">
          <Badge kind="status" value={incident.status} />
          <Badge kind="priority" value={incident.priority} />
        </div>

        <div className="wi-grid">
          <Field name="Asignado a">
            {incident.technician_name ? (
              <>
                <Avatar name={incident.technician_name} small />
                {incident.technician_name}
              </>
            ) : (
              'Sin asignar'
            )}
          </Field>
          <Field name="Categoría">{label(incident.category)}</Field>
          <Field name="Reportado por">
            <Avatar name={incident.reported_by} small />
            {incident.reported_by}
          </Field>
          <Field name="Fecha de creación">{formatDate(incident.created_at)}</Field>
        </div>

        <h3>Descripción</h3>
        <p className="description">{incident.description}</p>

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
        <h3>Discusión</h3>
        <ul className="log">
          {comments.map((entry) => (
            <li key={entry.id} className={entry.type === 'SISTEMA' ? 'system' : ''}>
              <Avatar name={entry.author} />
              <div>
                <div className="log-head">
                  <span className="log-author">{entry.author}</span>
                  <span className="log-meta">{formatDate(entry.created_at)}</span>
                </div>
                <div className="log-text">{humanizeMessage(entry.message)}</div>
              </div>
            </li>
          ))}
        </ul>
        <form className="comment-form" onSubmit={addComment}>
          <input
            aria-label="Comentario"
            placeholder="Agregar un comentario…"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
          <button type="submit">Comentar</button>
        </form>
      </section>
    </div>
  );
}

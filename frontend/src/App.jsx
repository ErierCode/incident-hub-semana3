import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import IncidentList from './pages/IncidentList.jsx';
import IncidentDetail from './pages/IncidentDetail.jsx';
import IncidentForm from './components/IncidentForm.jsx';

const TITLES = {
  dashboard: ['Resumen ejecutivo', 'Situación actual de los incidentes de TI'],
  list: ['Incidentes', 'Registro, asignación y seguimiento'],
  new: ['Nuevo incidente', 'Registro de un reporte de TI'],
  detail: ['Detalle del incidente', 'Datos, asignación y bitácora'],
};

const today = () =>
  new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

export default function App() {
  const [view, setView] = useState({ name: 'dashboard' });
  const [user, setUser] = useState('');

  const show = (name, extra = {}) => setView({ name, ...extra });
  const tab = view.name === 'dashboard' ? 'dashboard' : 'incidents';
  const [title, subtitle] = TITLES[view.name];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">IH</span>
          <div className="brand-name">IT Incident Hub</div>
          <div className="brand-sub">Gestión de incidentes de TI</div>
        </div>

        <nav className="nav" aria-label="Principal">
          <button type="button" className={tab === 'dashboard' ? 'active' : ''} onClick={() => show('dashboard')}>
            Resumen ejecutivo
          </button>
          <button type="button" className={tab === 'incidents' ? 'active' : ''} onClick={() => show('list')}>
            Incidentes
          </button>
        </nav>

        <label className="user">
          Usuario
          <input value={user} onChange={(event) => setUser(event.target.value)} placeholder="Nombre y apellido" />
        </label>
      </aside>

      <div className="main">
        <header className="page-head">
          <div>
            <h1>{title}</h1>
            <p className="page-sub">{subtitle}</p>
          </div>
          <span className="page-date">{today()}</span>
        </header>

        {view.name === 'dashboard' && <Dashboard />}
        {view.name === 'list' && <IncidentList onOpen={(id) => show('detail', { id })} onNew={() => show('new')} />}
        {view.name === 'new' && (
          <IncidentForm user={user} onCreated={(incident) => show('detail', { id: incident.id })} onCancel={() => show('list')} />
        )}
        {view.name === 'detail' && <IncidentDetail id={view.id} user={user} onBack={() => show('list')} />}
      </div>
    </div>
  );
}

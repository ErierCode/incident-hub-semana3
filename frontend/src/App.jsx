import { useState } from 'react';
import Avatar from './components/Avatar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import IncidentList from './pages/IncidentList.jsx';
import IncidentDetail from './pages/IncidentDetail.jsx';
import IncidentForm from './components/IncidentForm.jsx';

const TITLES = {
  dashboard: ['Resumen ejecutivo', 'Situación actual de los incidentes de TI'],
  list: ['Incidentes', 'Registro, asignación y seguimiento'],
  new: ['Nuevo incidente', 'Registro de un reporte de TI'],
  detail: ['Detalle del incidente', 'Datos, asignación y discusión'],
};

const today = () =>
  new Date().toLocaleDateString('es-GT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function DashboardIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1 1h6v6H1zM9 1h6v4H9zM9 7h6v8H9zM1 9h6v6H1z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path d="M1 2h2v2H1zM5 2.5h10v1H5zM1 7h2v2H1zM5 7.5h10v1H5zM1 12h2v2H1zM5 12.5h10v1H5z" />
    </svg>
  );
}

export default function App() {
  const [view, setView] = useState({ name: 'dashboard' });
  const [user, setUser] = useState('');

  const show = (name, extra = {}) => setView({ name, ...extra });
  const tab = view.name === 'dashboard' ? 'dashboard' : 'incidents';
  const [title, subtitle] = TITLES[view.name];

  return (
    <div className="shell">
      <header className="topbar">
        <div className="topbar-left">
          <span className="logo" aria-hidden="true">IH</span>
          <span className="product">IT Incident Hub</span>
          <nav className="crumbs" aria-label="Ruta de navegación">
            <span className="sep">/</span>
            <span>Gestión de incidentes</span>
            <span className="sep">/</span>
            <span className="current">{title}</span>
          </nav>
        </div>
        <div className="topbar-right">
          <label className="user">
            <span className="sr-only">Usuario</span>
            <input value={user} onChange={(event) => setUser(event.target.value)} placeholder="Nombre y apellido" />
          </label>
          <Avatar name={user} />
        </div>
      </header>

      <aside className="sidebar">
        <nav className="nav" aria-label="Principal">
          <button type="button" className={tab === 'dashboard' ? 'active' : ''} onClick={() => show('dashboard')}>
            <DashboardIcon />
            Resumen ejecutivo
          </button>
          <button type="button" className={tab === 'incidents' ? 'active' : ''} onClick={() => show('list')}>
            <ListIcon />
            Incidentes
          </button>
        </nav>
      </aside>

      <main className="main">
        <div className="page-head">
          <div>
            <h1>{title}</h1>
            <p className="page-sub">{subtitle}</p>
          </div>
          <span className="page-date">{today()}</span>
        </div>

        {view.name === 'dashboard' && <Dashboard />}
        {view.name === 'list' && <IncidentList onOpen={(id) => show('detail', { id })} onNew={() => show('new')} />}
        {view.name === 'new' && (
          <IncidentForm user={user} onCreated={(incident) => show('detail', { id: incident.id })} onCancel={() => show('list')} />
        )}
        {view.name === 'detail' && <IncidentDetail id={view.id} user={user} onBack={() => show('list')} />}
      </main>
    </div>
  );
}

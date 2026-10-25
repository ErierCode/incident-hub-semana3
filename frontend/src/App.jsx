import { useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import IncidentList from './pages/IncidentList.jsx';
import IncidentDetail from './pages/IncidentDetail.jsx';
import IncidentForm from './components/IncidentForm.jsx';

export default function App() {
  const [view, setView] = useState({ name: 'dashboard' });
  const [user, setUser] = useState('');

  const show = (name, extra = {}) => setView({ name, ...extra });
  const tab = view.name === 'dashboard' ? 'dashboard' : 'incidents';

  return (
    <div className="app">
      <header className="topbar">
        <h1>IT Incident Hub</h1>
        <nav>
          <button type="button" className={tab === 'dashboard' ? 'active' : ''} onClick={() => show('dashboard')}>
            Dashboard
          </button>
          <button type="button" className={tab === 'incidents' ? 'active' : ''} onClick={() => show('list')}>
            Incidentes
          </button>
        </nav>
        <label className="user">
          Usuario
          <input value={user} onChange={(event) => setUser(event.target.value)} placeholder="Tu nombre" />
        </label>
      </header>

      <main>
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

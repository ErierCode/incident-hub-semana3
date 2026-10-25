const path = require('path');
const express = require('express');
const { version } = require('../package.json');
const { createIncidentService } = require('./services/incidentService');
const { createTechnicianService } = require('./services/technicianService');
const { createDashboardService } = require('./services/dashboardService');
const { createDashboardRouter } = require('./routes/dashboard');
const { createIncidentsRouter } = require('./routes/incidents');
const { createTechniciansRouter } = require('./routes/technicians');

function createApp({ db, staticDir }) {
  const app = express();
  app.use(express.json());

  const technicians = createTechnicianService(db);
  const incidents = createIncidentService(db, { technicians });

  app.get('/health', async (_req, res) => {
    await db.query('SELECT 1');
    res.json({ status: 'ok', version, db: 'up' });
  });

  app.use('/api/incidents', createIncidentsRouter({ incidents }));
  app.use('/api/technicians', createTechniciansRouter({ technicians }));
  app.use('/api/dashboard', createDashboardRouter({ dashboard: createDashboardService(db) }));

  // Interfaz web compilada (frontend/dist): archivos estáticos y fallback a index.html para rutas del cliente.
  if (staticDir) {
    app.use(express.static(staticDir));
    app.get(/^\/(?!api\/|health$).*/, (_req, res) => {
      res.sendFile(path.join(staticDir, 'index.html'));
    });
  }

  app.use((_req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
  });

  app.use((err, _req, res, _next) => {
    console.log('Error no controlado:', err.message);
    res.status(err.status || 500).json({ error: err.status ? err.message : 'Error interno del servidor' });
  });

  return app;
}

module.exports = { createApp };

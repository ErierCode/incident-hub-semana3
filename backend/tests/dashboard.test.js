const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');

describe('GET /api/dashboard', () => {
  let app;

  beforeEach(() => {
    app = createApp({ db: createTestDb() });
  });

  async function createIncident(category, priority) {
    const res = await request(app).post('/api/incidents').send({
      title: `Incidente ${category} ${priority}`,
      description: 'Detalle',
      category,
      priority,
      reportedBy: 'Prueba',
    });
    return res.body.id;
  }

  it('devuelve ceros cuando no hay incidentes', async () => {
    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ total: 0, open: 0, closed: 0, critical: 0, byStatus: {}, byCategory: [] });
    expect(res.body.byTechnician.find((t) => t.technician === 'Sin asignar').total).toBe(0);
  });

  it('calcula abiertos, cerrados, críticos y distribuciones', async () => {
    const red = await createIncident('RED', 'CRITICA');
    await createIncident('RED', 'BAJA');
    const hw = await createIncident('HARDWARE', 'CRITICA');
    await createIncident('SOFTWARE', 'MEDIA');

    await request(app).patch(`/api/incidents/${red}/assign`).send({ technicianId: 1 });
    await request(app).patch(`/api/incidents/${hw}/assign`).send({ technicianId: 2 });
    for (const status of ['EN_PROCESO', 'RESUELTO', 'CERRADO']) {
      await request(app).patch(`/api/incidents/${hw}/status`).send({ status });
    }

    const res = await request(app).get('/api/dashboard');

    expect(res.body).toMatchObject({ total: 4, open: 3, closed: 1, critical: 1 });
    expect(res.body.byStatus).toEqual({ NUEVO: 2, ASIGNADO: 1, CERRADO: 1 });
    expect(res.body.byCategory).toEqual([
      { category: 'HARDWARE', total: 1 },
      { category: 'RED', total: 2 },
      { category: 'SOFTWARE', total: 1 },
    ]);
    const byTech = Object.fromEntries(res.body.byTechnician.map((t) => [t.technician, t.total]));
    expect(byTech).toEqual({
      'Ana López': 1,
      'Carlos Méndez': 0,
      'Lucía Herrera': 0,
      'Sin asignar': 2,
    });
  });
});

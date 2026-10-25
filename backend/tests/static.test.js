const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../src/app');
const { createTestDb } = require('./helpers/testDb');

describe('Interfaz web estática', () => {
  let staticDir;

  beforeAll(() => {
    staticDir = fs.mkdtempSync(path.join(os.tmpdir(), 'incident-hub-static-'));
    fs.writeFileSync(path.join(staticDir, 'index.html'), '<html><body>IT Incident Hub UI</body></html>');
    fs.writeFileSync(path.join(staticDir, 'app.js'), 'console.log("ok")');
  });

  afterAll(() => {
    fs.rmSync(staticDir, { recursive: true, force: true });
  });

  it('sirve index.html en la raíz y en rutas del cliente', async () => {
    const app = createApp({ db: createTestDb(), staticDir });

    const root = await request(app).get('/');
    const clientRoute = await request(app).get('/incidentes/7');

    expect(root.status).toBe(200);
    expect(root.text).toContain('IT Incident Hub UI');
    expect(clientRoute.text).toContain('IT Incident Hub UI');
  });

  it('sirve los archivos estáticos', async () => {
    const app = createApp({ db: createTestDb(), staticDir });

    const res = await request(app).get('/app.js');

    expect(res.status).toBe(200);
    expect(res.text).toContain('console.log');
  });

  it('no intercepta la API ni /health', async () => {
    const app = createApp({ db: createTestDb(), staticDir });

    const health = await request(app).get('/health');
    const missingApi = await request(app).get('/api/no-existe');

    expect(health.body.status).toBe('ok');
    expect(missingApi.status).toBe(404);
    expect(missingApi.body.error).toBe('Recurso no encontrado');
  });

  it('sin staticDir solo expone la API', async () => {
    const app = createApp({ db: createTestDb() });

    const res = await request(app).get('/');

    expect(res.status).toBe(404);
  });
});

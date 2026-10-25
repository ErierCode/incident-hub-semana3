// Smoke test post-despliegue: verifica que el ambiente responde y que el flujo principal funciona.
// Uso: node tests/smoke/smoke.js http://localhost:3002
// La versión esperada se lee del package.json del paquete desplegado.
const path = require('path');

const baseUrl = (process.argv[2] || process.env.SMOKE_URL || 'http://localhost:3000').replace(/\/$/, '');
const expectedVersion = require(path.resolve(__dirname, '../../package.json')).version;

let failures = 0;

async function check(name, fn) {
  try {
    await fn();
    console.log(`  ok   ${name}`);
  } catch (err) {
    failures += 1;
    console.log(`  FAIL ${name}: ${err.message}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(method, route, body) {
  const response = await fetch(`${baseUrl}${route}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let json = null;
  try { json = JSON.parse(text); } catch { /* respuesta no JSON (HTML de la interfaz) */ }
  return { status: response.status, text, json };
}

async function main() {
  console.log(`Smoke test contra ${baseUrl} (esperado v${expectedVersion})`);
  let incidentId;

  await check('GET /health responde ok con la versión esperada', async () => {
    const { status, json } = await call('GET', '/health');
    assert(status === 200, `estado ${status}`);
    assert(json.status === 'ok' && json.db === 'up', 'la base de datos no está disponible');
    assert(json.version === expectedVersion, `versión ${json.version}, se esperaba ${expectedVersion}`);
  });

  await check('GET / sirve la interfaz web', async () => {
    const { status, text } = await call('GET', '/');
    assert(status === 200 && text.includes('IT Incident Hub'), 'no se recibió la interfaz');
  });

  await check('GET /api/technicians devuelve los técnicos del seed', async () => {
    const { status, json } = await call('GET', '/api/technicians');
    assert(status === 200 && json.length >= 3, 'faltan técnicos');
  });

  await check('Crear incidente', async () => {
    const { status, json } = await call('POST', '/api/incidents', {
      title: 'Smoke test', description: 'Verificación automática del despliegue',
      category: 'OTRO', priority: 'BAJA', reportedBy: 'smoke-test',
    });
    assert(status === 201 && json.status === 'NUEVO', `estado ${status}`);
    incidentId = json.id;
  });

  await check('Asignar técnico y registrar bitácora', async () => {
    const assigned = await call('PATCH', `/api/incidents/${incidentId}/assign`, { technicianId: 1, changedBy: 'smoke-test' });
    assert(assigned.json.status === 'ASIGNADO', 'no pasó a ASIGNADO');
    const log = await call('GET', `/api/incidents/${incidentId}/comments`);
    assert(log.json.some((entry) => entry.type === 'SISTEMA'), 'sin entrada de bitácora');
  });

  await check('GET /api/dashboard refleja el incidente', async () => {
    const { status, json } = await call('GET', '/api/dashboard');
    assert(status === 200 && json.total >= 1 && json.open >= 1, 'indicadores inconsistentes');
  });

  console.log(failures ? `\n${failures} verificación(es) fallaron` : '\nSmoke test OK');
  process.exit(failures ? 1 : 0);
}

main().catch((err) => {
  console.log(`Smoke test abortado: ${err.message}`);
  process.exit(1);
});

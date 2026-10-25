import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.jsx';

const dashboard = {
  total: 5,
  open: 3,
  closed: 2,
  critical: 1,
  byStatus: { NUEVO: 3, CERRADO: 2 },
  byCategory: [{ category: 'RED', total: 4 }, { category: 'HARDWARE', total: 1 }],
  byTechnician: [{ technicianId: 1, technician: 'Ana López', total: 2 }, { technicianId: null, technician: 'Sin asignar', total: 1 }],
};
const technicians = [{ id: 1, name: 'Ana López' }, { id: 2, name: 'Carlos Méndez' }];
const incident = {
  id: 7,
  title: 'Sin acceso a la VPN',
  description: 'No conecta desde casa',
  category: 'ACCESOS',
  priority: 'ALTA',
  reported_by: 'Pedro Ruiz',
  status: 'NUEVO',
  technician_id: null,
  technician_name: null,
  created_at: '2026-10-25T10:00:00Z',
};

function mockApi(routes) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, options = {}) => {
      const method = options.method || 'GET';
      calls.push({ url, method, body: options.body ? JSON.parse(options.body) : undefined });
      const key = `${method} ${String(url).split('?')[0]}`;
      const handler = routes[key];
      if (!handler) return { ok: false, status: 404, json: async () => ({ error: `sin mock para ${key}` }) };
      const result = typeof handler === 'function' ? handler(url, options) : handler;
      // Una respuesta con { status: <número>, body } simula un código HTTP; cualquier otro valor es un 200 con ese JSON.
      const isHttp = typeof result.status === 'number';
      const status = isHttp ? result.status : 200;
      return { ok: status < 400, status, json: async () => (isHttp ? result.body : result) };
    }),
  );
  return calls;
}

describe('IT Incident Hub', () => {
  beforeEach(() => vi.unstubAllGlobals());
  afterEach(() => vi.unstubAllGlobals());

  it('muestra los indicadores del dashboard', async () => {
    mockApi({ 'GET /api/dashboard': dashboard });

    render(<App />);

    expect(await screen.findByText('Abiertos')).toBeInTheDocument();
    expect(screen.getByText('Críticos abiertos')).toBeInTheDocument();
    expect(screen.getByText('Sin asignar')).toBeInTheDocument();
    expect(screen.getByText('Ana López')).toBeInTheDocument();
    expect(screen.getByText('RED')).toBeInTheDocument();
  });

  it('muestra un error si la API del dashboard falla', async () => {
    mockApi({ 'GET /api/dashboard': { status: 500, body: { error: 'Error interno del servidor' } } });

    render(<App />);

    expect(await screen.findByRole('alert')).toHaveTextContent('Error interno del servidor');
  });

  it('lista incidentes y aplica filtros en la consulta', async () => {
    const calls = mockApi({
      'GET /api/dashboard': dashboard,
      'GET /api/technicians': technicians,
      'GET /api/incidents': [incident],
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Incidentes' }));
    expect(await screen.findByText('Sin acceso a la VPN')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Estado'), 'NUEVO');
    await user.selectOptions(screen.getByLabelText('Prioridad'), 'ALTA');

    await waitFor(() => {
      const last = calls.filter((c) => c.url.startsWith('/api/incidents')).at(-1);
      expect(last.url).toBe('/api/incidents?status=NUEVO&priority=ALTA');
    });
  });

  it('valida el formulario antes de enviar y crea el incidente', async () => {
    const calls = mockApi({
      'GET /api/dashboard': dashboard,
      'GET /api/technicians': technicians,
      'GET /api/incidents': [],
      'POST /api/incidents': { status: 201, body: incident },
      'GET /api/incidents/7': incident,
      'GET /api/incidents/7/comments': [],
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Incidentes' }));
    await user.click(await screen.findByRole('button', { name: 'Nuevo incidente' }));
    await user.click(screen.getByRole('button', { name: 'Registrar incidente' }));
    expect(screen.getByRole('alert')).toHaveTextContent('obligatorios');
    expect(calls.some((c) => c.method === 'POST')).toBe(false);

    await user.type(screen.getByLabelText('Título'), 'Sin acceso a la VPN');
    await user.type(screen.getByLabelText('Descripción'), 'No conecta desde casa');
    await user.type(screen.getByLabelText('Reportado por'), 'Pedro Ruiz');
    await user.click(screen.getByRole('button', { name: 'Registrar incidente' }));

    expect(await screen.findByText(/#7 · Sin acceso a la VPN/)).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'POST').body).toMatchObject({
      title: 'Sin acceso a la VPN',
      category: 'HARDWARE',
      priority: 'MEDIA',
      reportedBy: 'Pedro Ruiz',
    });
  });

  it('asigna un técnico y agrega comentarios desde el detalle', async () => {
    let current = incident;
    const comments = [];
    const calls = mockApi({
      'GET /api/dashboard': dashboard,
      'GET /api/technicians': technicians,
      'GET /api/incidents': [incident],
      'GET /api/incidents/7': () => current,
      'GET /api/incidents/7/comments': () => comments,
      'PATCH /api/incidents/7/assign': () => {
        current = { ...incident, status: 'ASIGNADO', technician_id: 1, technician_name: 'Ana López' };
        comments.push({ id: 1, type: 'SISTEMA', author: 'Erick', message: 'Asignado a Ana López', created_at: '2026-10-25T10:05:00Z' });
        return current;
      },
      'POST /api/incidents/7/comments': (_url, options) => {
        const body = JSON.parse(options.body);
        comments.push({ id: 2, type: 'COMENTARIO', created_at: '2026-10-25T10:06:00Z', ...body });
        return { status: 201, body: comments.at(-1) };
      },
    });
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText('Usuario'), 'Erick');
    await user.click(screen.getByRole('button', { name: 'Incidentes' }));
    await user.click(await screen.findByRole('button', { name: 'Sin acceso a la VPN' }));

    expect(await screen.findByText('Sin asignar')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Técnico'), '1');
    await user.click(screen.getByRole('button', { name: 'Asignar' }));

    expect(await screen.findByText('Asignado a Ana López')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Pasar a EN PROCESO' })).toBeInTheDocument();
    expect(calls.find((c) => c.method === 'PATCH').body).toEqual({ technicianId: 1, changedBy: 'Erick' });

    await user.type(screen.getByLabelText('Comentario'), 'Revisando credenciales');
    await user.click(screen.getByRole('button', { name: 'Comentar' }));

    expect(await screen.findByText('Revisando credenciales')).toBeInTheDocument();
  });

  it('muestra el error de la API cuando una transición es rechazada', async () => {
    const assigned = { ...incident, status: 'ASIGNADO', technician_id: 1, technician_name: 'Ana López' };
    mockApi({
      'GET /api/dashboard': dashboard,
      'GET /api/technicians': technicians,
      'GET /api/incidents': [assigned],
      'GET /api/incidents/7': assigned,
      'GET /api/incidents/7/comments': [],
      'PATCH /api/incidents/7/status': { status: 409, body: { error: 'Transición no permitida: ASIGNADO → EN_PROCESO' } },
    });
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole('button', { name: 'Incidentes' }));
    await user.click(await screen.findByRole('button', { name: 'Sin acceso a la VPN' }));
    await user.click(await screen.findByRole('button', { name: 'Pasar a EN PROCESO' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Transición no permitida');
  });
});

# IT Incident Hub

Solución web para registrar, operar y dar seguimiento a incidentes de TI. Sustituye los reportes dispersos en llamadas, mensajería y correo por un flujo trazable, construido como proyecto integrador DevOps.

## Requisitos

- Node.js 20 o superior (probado con 22 LTS)
- Docker Desktop (para PostgreSQL local)
- Git

## Instalación

```bash
git clone https://github.com/ErierCode/incident-hub-semana2.git
cd incident-hub-semana2
cp .env.example .env        # definir DB_PASSWORD (obligatoria)
npm install
```

## Ejecución

```bash
docker compose up -d        # PostgreSQL 16
npm run migrate             # esquema + datos iniciales
npm run dev:api             # API en http://localhost:3000
npm run dev -w frontend     # interfaz en http://localhost:5173 (proxy a la API)
```

Verificar: `curl http://localhost:3000/health`

## API REST

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/health` | Estado del servicio y la base de datos |
| GET | `/api/incidents` | Lista; filtros `?status=&priority=&category=&technicianId=` |
| POST | `/api/incidents` | Crea incidente `{ title, description, category, priority, reportedBy }` |
| GET | `/api/incidents/:id` | Detalle |
| PATCH | `/api/incidents/:id/assign` | Asigna técnico `{ technicianId, changedBy? }` |
| PATCH | `/api/incidents/:id/status` | Cambia estado `{ status, changedBy? }` |
| GET | `/api/incidents/:id/comments` | Bitácora (comentarios + eventos del sistema) |
| POST | `/api/incidents/:id/comments` | Agrega comentario `{ author, message }` |
| GET | `/api/technicians` | Técnicos disponibles |
| GET | `/api/dashboard` | Indicadores: abiertos, cerrados, críticos, por categoría y por técnico |

## Pruebas

```bash
npm run lint
npm test
```

Las pruebas usan un PostgreSQL en memoria (pg-mem), no necesitan Docker.

## Estructura

```
backend/     API REST (Express)
frontend/    interfaz web (React + Vite)
database/    migraciones SQL y seed
docs/        arquitectura, ramas y demás documentación
```

## Documentación

- [Arquitectura](docs/architecture.md)
- [Estrategia de ramas](docs/branching.md)
- [Deuda técnica](docs/tech-debt.md)
- [Seguridad y secretos](docs/security.md)
- [Análisis de dependencias](docs/dependencies.md)
- [Evidencias DevOps](docs/evidence.md)

## CI/CD

| Sistema | Archivo | Cuándo corre |
|---|---|---|
| Azure Pipelines (agente self-hosted) | `azure-pipelines.yml` | PR hacia `main`, push a `main`, tags `v*` |
| GitHub Actions | `.github/workflows/ci.yml` | PR hacia `main`, push a `main` |
| Dependabot | `.github/dependabot.yml` | Semanal |

## Responsables

| Integrante | Rol |
|---|---|
| Erick Pu (`ErierCode` / `epur@miumg.edu.gt`) | Desarrollo, DevOps y documentación |

Planificación en Azure Boards: proyecto `proyectoFinal` de la organización `epur`.

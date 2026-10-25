# Arquitectura

## Vista general

```
Usuario ──► Frontend (React + Vite) ──► API REST (Node.js + Express) ──► PostgreSQL 16
```

| Capa | Tecnología | Carpeta |
|---|---|---|
| Frontend | React 19 + Vite | `frontend/` |
| API REST | Node.js 22 LTS + Express 5, validación con zod | `backend/` |
| Persistencia | PostgreSQL 16 (Docker) | `database/` |
| Pruebas | Jest + Supertest, pg-mem (Postgres en memoria) | `backend/tests/`, `tests/` |
| CI/CD | Azure Pipelines (agente self-hosted) + GitHub Actions | `azure-pipelines.yml`, `.github/workflows/` |

## Backend

- `src/app.js`: crea la aplicación Express a partir de una dependencia `db` (cualquier objeto con `query(text, params)`). Esto permite usar el `Pool` real de `pg` en ejecución y un Postgres en memoria (`pg-mem`) en las pruebas.
- `src/routes/`: definición de endpoints HTTP (incidentes, técnicos, dashboard).
- `src/services/`: reglas de negocio (creación, asignación, máquina de estados, bitácora, indicadores).
- `src/validation/`: esquemas zod y middleware `validate` que normaliza `params`, `query` y `body`.
- `src/config.js`: configuración por variables de entorno; `DB_PASSWORD` es obligatoria y la API no arranca sin ella.
- `src/db/`: fábrica del pool, carga de scripts SQL y migración.
- Si existe `frontend/dist`, el backend lo sirve (estáticos y *fallback* a `index.html`), de modo que cada ambiente es un único proceso.

## Frontend

Aplicación de una sola página sin enrutador: `App.jsx` alterna entre el *dashboard*, el listado con filtros, el formulario de alta y el detalle de un incidente. `api/client.js` concentra las llamadas a la API y `constants.js` espeja las reglas de estados del backend. En desarrollo, Vite redirige `/api` al puerto 3000.

## Despliegue

```
 agente self-hosted (Windows, Docker)
 ├── dev  : app :3001 ── PostgreSQL ih-dev  :5441
 ├── qa   : app :3002 ── PostgreSQL ih-qa   :5442
 └── prod : app :3003 ── PostgreSQL ih-prod :5443
```

El pipeline construye un único artefacto y `devops/deploy.ps1` lo despliega en cada ambiente: levanta su base de datos en Docker (`docker-compose.deploy.yml`, un proyecto Compose por ambiente), escribe el `.env` del ambiente con su secreto, aplica las migraciones y reemplaza el proceso anterior. Ver [release-strategy.md](release-strategy.md).

## Modelo de datos

| Tabla | Propósito |
|---|---|
| `technicians` | Técnicos del área de TI que pueden recibir incidentes |
| `incidents` | Incidente: título, descripción, categoría, prioridad, usuario que reporta, estado, técnico, fechas |
| `incident_comments` | Bitácora por incidente: comentarios manuales (`COMENTARIO`) y eventos automáticos (`SISTEMA`) |

Catálogos:

- **Categoría**: `HARDWARE`, `SOFTWARE`, `RED`, `ACCESOS`, `OTRO`
- **Prioridad**: `BAJA`, `MEDIA`, `ALTA`, `CRITICA`
- **Estado**: `NUEVO` → `ASIGNADO` → `EN_PROCESO` → `RESUELTO` → `CERRADO`

## Decisiones

- **Monorepo con npm workspaces**: un solo `npm ci` instala backend y frontend; facilita el pipeline.
- **SQL plano en `database/`**: las migraciones son legibles y las ejecuta tanto `npm run migrate` como las pruebas.
- **pg-mem en pruebas**: las pruebas no requieren un servidor PostgreSQL, por lo que corren igual en el agente self-hosted y en GitHub Actions.

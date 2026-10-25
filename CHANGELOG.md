# Changelog

Todas las versiones siguen [Semantic Versioning](https://semver.org/lang/es/) y el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [0.5.0] - 2026-10-25

### Agregado
- Despliegue por ambientes en Azure Pipelines: DEV (automático en main), QA y PROD (solo en tags, con aprobación manual en PROD) (AB#43).
- : base de datos por ambiente en Docker, migraciones, reemplazo del proceso y verificación de salud (AB#43).
- Smoke test post-despliegue  (AB#44).
- Workflow : GitHub Release con el paquete y las notas del CHANGELOG al crear un tag (AB#45).
- Documentación de la estrategia de release (AB#45).

## [0.4.0] - 2026-10-25

### Agregado
- `GET /api/dashboard`: abiertos, cerrados, críticos y distribución por categoría y técnico (AB#27).
- Interfaz web en React + Vite: dashboard, listado con filtros, formulario de alta y detalle con asignación, cambio de estado y bitácora (AB#28, AB#29, AB#30, AB#31).
- El backend sirve `frontend/dist`, de modo que cada ambiente corre en un único proceso.
- Pruebas del frontend con Vitest y Testing Library.

## [0.3.0] - 2026-10-24

### Agregado
- Pipeline de Azure en agente self-hosted: lint, build, pruebas con cobertura, npm audit, empaquetado y artefacto `incident-hub` (AB#33, AB#32).
- Umbral de calidad de cobertura del 90 % y pruebas de casos límite (AB#34).
- Workflow de GitHub Actions para PR: lint/pruebas, integración con PostgreSQL real, revisión de dependencias y gitleaks (AB#35).
- Dependabot semanal para npm y GitHub Actions (AB#37).
- Documentación: `docs/evidence.md`, `docs/tech-debt.md`, `docs/dependencies.md`, `docs/security.md`.

### Cambiado
- Validación de entradas con esquemas zod; resuelve TD-1 (AB#38).
- Configuración por variables de entorno; `DB_PASSWORD` es obligatoria. Resuelve TD-2 (AB#39).
- ESLint 10 y globals 17 (Dependabot #4).

## [0.2.0] - 2026-10-24

### Agregado
- `GET /api/technicians` y asignación/reasignación de técnico con `PATCH /api/incidents/:id/assign` (AB#22).
- Máquina de estados NUEVO → ASIGNADO → EN_PROCESO → RESUELTO → CERRADO con `PATCH /api/incidents/:id/status` (AB#23).
- Bitácora automática de asignaciones y cambios de estado (AB#26).
- Comentarios por incidente: `GET/POST /api/incidents/:id/comments` (AB#25).
- Filtros combinables en `GET /api/incidents` por `status`, `priority`, `category` y `technicianId` (AB#20).

## [0.1.0] - 2026-10-24

### Agregado
- Estructura del monorepo, docker-compose de PostgreSQL y migración inicial (AB#18).
- `GET /health` con versión y estado de la base de datos.
- `POST /api/incidents`, `GET /api/incidents` y `GET /api/incidents/:id` (AB#19).

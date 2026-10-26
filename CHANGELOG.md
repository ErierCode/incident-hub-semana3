# Changelog

Todas las versiones siguen [Semantic Versioning](https://semver.org/lang/es/) y el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/).

## [Sin publicar]

### Cambiado
- Rediseño visual ejecutivo de la interfaz: barra lateral azul marino con acento latón, tipografía con serif en títulos y cifras, tarjetas de indicadores con contexto, nueva métrica de tasa de resolución, distribución por estado, tablas densas y estados en colores contenidos (burdeos solo para lo crítico). Modo oscuro y diseño adaptable a móvil. Sin cambios en la API (AB#48).

## [1.0.0] - 2026-10-25

Primera versión estable. Recorre DEV, QA y PROD con aprobación manual.

### Agregado
- Guía de la demostración (docs/demo.md) y correspondencia con el enunciado (docs/cumplimiento.md), con las limitaciones declaradas.
- Documentación de arquitectura con la topología de despliegue y README completo.

### Resumen de la versión
- Incidentes con asignación, estados, bitácora, filtros y dashboard (API REST + interfaz React).
- CI/CD: Azure Pipelines en agente self-hosted, GitHub Actions, despliegue por ambientes y GitHub Release automático.
- Calidad y seguridad: cobertura mínima del 90 %, npm audit, gitleaks, Dependabot y secretos protegidos.

## [0.5.1] - 2026-10-25

### Corregido
- El redespliegue en un ambiente ya no mata la aplicación recién iniciada: se lanza sin consola y en su propio grupo de procesos, y se espera a que termine la versión anterior (AB#46).
- El despliegue ya no toma un paquete antiguo de la carpeta de descargas del agente: se limpia antes de descargar y se elige el zip de mayor versión (AB#47).
- Documentados los fallos del pipeline de la semana 3 (builds #36 y #38) en docs/evidence.md.

## [0.5.0] - 2026-10-25

### Agregado
- Despliegue por ambientes en Azure Pipelines: DEV (automático en main), QA y PROD (solo en tags, con aprobación manual en PROD) (AB#43).
- `devops/deploy.ps1`: base de datos por ambiente en Docker, migraciones, reemplazo del proceso y verificación de salud (AB#43).
- Smoke test post-despliegue `tests/smoke/smoke.js` (AB#44).
- Workflow `release.yml`: GitHub Release con el paquete y las notas del CHANGELOG al crear un tag (AB#45).
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

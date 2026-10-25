# Cumplimiento del enunciado

Correspondencia entre las condiciones obligatorias del documento *Proyecto integrador DevOps* (sección 4) y la evidencia verificable. Los enlaces apuntan al sistema original (Azure DevOps o GitHub), no a capturas.

Organización Azure DevOps: `epur` · proyecto: `proyectoFinal` · repositorios: [semana 1](https://github.com/ErierCode/incident-hub-semana1), [semana 2](https://github.com/ErierCode/incident-hub-semana2), [semana 3](https://github.com/ErierCode/incident-hub-semana3).

## Condiciones obligatorias

| Condición | Requisito | Resultado | Dónde verificarlo |
|---|---|---|---|
| **Azure Boards** | 2 Epics, 4 Features, 8 User Stories, 16 Tasks, con responsable, prioridad, estimación y estados | **2 / 4 / 9 / 28 Tasks** (5 de ellas deuda técnica) y 2 Bugs. Todo con responsable, prioridad y estimación; estados actualizados con el avance | [Backlog](https://dev.azure.com/epur/proyectoFinal/_backlogs) · Epics #3 y #4, Features #5–#8, User Stories #9–#17, Tasks #18–#45, Bugs #46–#47 |
| **Git** | `main` estable; trabajo en `feature/*`, `fix/*`, `refactor/*` | Los 3 repos tienen `main` protegida (sin push directo, ni siquiera de administradores; PR obligatorio). Ramas `feature/AB<id>-…`, `fix/AB<id>-…`, `refactor/AB<id>-…`, `chore/AB<id>-…` | [docs/branching.md](branching.md) |
| **Trazabilidad** | Cambios vinculados a Work Items (`AB#ID`) | 29 work items distintos referenciados en el historial de commits. Azure Boards enlaza automáticamente commits y PR en la sección *Development* de cada Task | Abrir cualquier Task cerrada, p. ej. [#34](https://dev.azure.com/epur/proyectoFinal/_workitems/edit/34) o [#38](https://dev.azure.com/epur/proyectoFinal/_workitems/edit/38) |
| **Pull Requests** | Mínimo 6 PR reales con descripción, revisión y evidencia de validación | **17 PR mergeados** (4 + 7 + 6), cada uno con plantilla (descripción, work items, validación, evidencia), comentario de revisión y checks en verde | [semana 1](https://github.com/ErierCode/incident-hub-semana1/pulls?q=is%3Apr+is%3Amerged) · [semana 2](https://github.com/ErierCode/incident-hub-semana2/pulls?q=is%3Apr+is%3Amerged) · [semana 3](https://github.com/ErierCode/incident-hub-semana3/pulls?q=is%3Apr+is%3Amerged) |
| **Deuda técnica** | ≥ 5 identificadas, ≥ 2 resueltas con trabajo trazable | **5 identificadas** (TD-1 a TD-5, Tasks #38–#42), **2 resueltas** vía `refactor/*`: TD-1 (zod, PR #5 de semana 2) y TD-2 (configuración por entorno, PR #6) | [docs/tech-debt.md](tech-debt.md) |
| **Azure Pipelines** | checkout, restauración, build, pruebas, seguridad, empaquetado y artefacto | `azure-pipelines.yml`: checkout → Node → `npm ci` → lint → build → pruebas con cobertura → `npm audit` → empaquetado → zip → publicación del artefacto `incident-hub` | [Pipelines](https://dev.azure.com/epur/proyectoFinal/_build) |
| **Fallo controlado** | Evidencia de un pipeline fallido, diagnóstico, corrección y ejecución exitosa | **Tres casos documentados:** build #11 → #12 (umbral de cobertura); build #36 (redespliegue mata la app, Bug #46); build #38 (paquete antiguo en el workspace del agente, Bug #47). Cada uno con diagnóstico, PR de corrección y ejecución en verde | [docs/evidence.md](evidence.md) |
| **Agente autohospedado** | Configurar y usar ≥ 1 | Agente `agente-pc-erick`, pool `Default`, versión 5.280.0 (win-x64) en `C:\agent`. Ejecuta todos los jobs de CI y los despliegues | [Agent pools](https://dev.azure.com/epur/_settings/agentpools) · log de cualquier build (`C:\agent\_work\…`) |
| **Secretos** | No almacenados en el repositorio; variables o secretos protegidos | `.env` ignorado por Git; grupo de variables `incident-hub-secrets` (variables secretas) en Azure; `CI_DB_PASSWORD` en GitHub Secrets (Actions y Dependabot); gitleaks en cada PR; PAT del agente solo ingresado por consola | [docs/security.md](security.md) |
| **GitHub Actions** | Workflow complementario | `ci.yml` (lint y pruebas, integración con PostgreSQL real, dependencias, gitleaks) y `release.yml` (GitHub Release) | [Actions](https://github.com/ErierCode/incident-hub-semana3/actions) |
| **Dependencias** | Analizar paquetes y documentar vulnerabilidades, severidad y decisión | `npm audit` (0 vulnerabilidades en 514 paquetes), dependency-review y Dependabot; tabla con paquete, versión, licencia y decisión; evaluación del PR de Dependabot (ESLint 10) | [docs/dependencies.md](dependencies.md) |
| **Versionado** | SemVer con secuencia coherente hasta v1.0.0 | `v0.1.0` → `v0.2.0` → `v0.3.0` → `v0.4.0` → `v0.5.0` → `v0.5.1` → **`v1.0.0`**, con CHANGELOG | [Tags](https://github.com/ErierCode/incident-hub-semana3/tags) · [CHANGELOG](../CHANGELOG.md) |
| **Lanzamiento** | Estrategia de release con ambientes y controles de aprobación/validación | Ambientes `dev`, `qa` y `prod` (Environments de Azure DevOps); smoke test automático en cada uno; **aprobación manual en `prod`**; un solo artefacto promovido entre ambientes | [docs/release-strategy.md](release-strategy.md) |

## Entregables (sección 8)

| Entregable | Estado |
|---|---|
| URL del proyecto Azure DevOps y de los repositorios (3, uno por entrega parcial) | https://dev.azure.com/epur/proyectoFinal · `incident-hub-semana1`, `-semana2`, `-semana3`. Como el trabajo se hizo en una sola sesión, cada repo corresponde al cierre del hito: `v0.2.0`, `v0.3.0` y `v1.0.0` |
| Backlog y tablero actualizados | Sí |
| Código fuente funcional | Sí: 61 pruebas de backend y 6 de frontend en verde; ambientes DEV, QA y PROD respondiendo |
| `azure-pipelines.yml` y workflow de GitHub Actions | Sí |
| Documentación en `docs/` | Arquitectura, branching, deuda técnica, seguridad, dependencias, estrategia de release, evidencias, cumplimiento y guía de demostración |
| Evidencia de PR, code review, pipeline fallido/exitoso, agente, artefactos y versiones | Sí, con enlaces al sistema original |
| README con requisitos, instalación, ejecución y responsables | Sí |
| Demostración final operativa | Guía en [demo.md](demo.md) |

## Limitaciones declaradas

Se documentan aquí para no presentarlas como cumplimiento completo:

1. **Regla 9 (contribuciones de cada integrante):** el proyecto es individual y toda la actividad está bajo una sola cuenta (`ErierCode`). No se crearon cuentas adicionales, por lo que no hay autores distintos en los commits ni aprobaciones de PR por una segunda persona. La **revisión de código** consiste en un comentario de revisión por PR; GitHub no permite aprobar el propio PR, así que la protección de `main` se apoya en checks obligatorios y no en aprobaciones humanas.
2. **Fechas:** los work items, PR y builds se crearon el mismo día (2026-10-24 y 2026-10-25), no repartidos en tres semanas, tal como se acordó para la demostración.
3. **Ambientes en un solo host:** DEV, QA y PROD comparten el agente (con puertos y bases de datos distintos). En un entorno real serían servidores separados con el mismo pipeline.
4. **Agente en modo interactivo:** `run.cmd` debe estar abierto; no está instalado como servicio.
5. **Seguridad de la aplicación:** la API no tiene autenticación (TD-5), riesgo aceptado para `v1.0.0` y registrado en [security.md](security.md).
6. **Aprobación de PROD:** la realiza la misma persona que lanza el release; en un equipo debería ser un aprobador distinto.

# Estrategia de release

## Versionado (Semantic Versioning)

Formato `MAJOR.MINOR.PATCH` (https://semver.org/lang/es/). Cada versión es un tag anotado `vX.Y.Z` sobre `main`, con su entrada en `CHANGELOG.md`.

| Cambio | Incrementa | Ejemplo |
|---|---|---|
| Funcionalidad nueva compatible (`feat:`) | MINOR | `0.3.0` → `0.4.0` |
| Corrección (`fix:`) o refactor sin cambio visible | PATCH | `1.0.0` → `1.0.1` |
| Cambio incompatible de la API | MAJOR | `1.x` → `2.0.0` |
| Candidata a release | `-rc.N` | `1.0.0-rc.1` |

Secuencia de versiones hasta la primera versión estable:

| Versión | Hito | Contenido |
|---|---|---|
| `v0.1.0` | Semana 1 | Registro y consulta de incidentes, esquema de base de datos |
| `v0.2.0` | Semana 1 | Asignación, estados, bitácora, comentarios y filtros |
| `v0.3.0` | Semana 2 | CI en Azure Pipelines (agente self-hosted), GitHub Actions, seguridad, deuda técnica TD-1 y TD-2 |
| `v0.4.0` | Semana 3 | Dashboard e interfaz web |
| `v0.5.0` | Semana 3 | Despliegue por ambientes (DEV, QA, PROD), smoke tests y GitHub Release automático |
| `v1.0.0-rc.1` | Semana 3 | Candidata: recorre DEV → QA → PROD para validar el proceso completo |
| `v1.0.0` | Semana 3 | Primera versión estable |

La versión vive en tres `package.json` (raíz, `backend`, `frontend`) y siempre coincide con el tag. El workflow `release.yml` verifica esa coincidencia antes de publicar.

## Ambientes

Cada ambiente es un **Environment de Azure DevOps** (registra el historial de despliegues) y se despliega en el agente self-hosted con su propia base de datos PostgreSQL en Docker, aislada de las demás.

| Ambiente | Puerto API | Puerto PostgreSQL | Proyecto Docker | Cuándo se despliega | Control |
|---|---|---|---|---|---|
| **dev** | 3001 | 5441 | `ih-dev` | Automático en cada push a `main` y en cada tag | CI en verde + smoke test |
| **qa** | 3002 | 5442 | `ih-qa` | Solo en tags `v*`, después de DEV | CI en verde + smoke test |
| **prod** | 3003 | 5443 | `ih-prod` | Solo en tags `v*`, después de QA | **Aprobación manual** + smoke test |

## Flujo

```
Pull Request ──► CI (lint, build, pruebas, npm audit, artefacto) + GitHub Actions
      │
      ▼ merge a main (squash)
     main ──► CI ──► Deploy_DEV (automático)

      ▼ git tag vX.Y.Z   (solo sobre main, con CHANGELOG actualizado)
     tag ──► CI ──► Deploy_DEV ──► Deploy_QA ──► [aprobación] ──► Deploy_PROD
              │
              └──► GitHub Actions "Release": GitHub Release con el paquete .zip y las notas del CHANGELOG
```

Los PR solo ejecutan la etapa CI; nunca despliegan.

## Controles de aprobación y validación

1. **Branch protection en `main`:** solo entra código por PR, con checks obligatorios (Azure Pipelines y 4 jobs de GitHub Actions) y conversaciones resueltas.
2. **Umbral de calidad:** cobertura mínima del 90 % y `npm audit` sin vulnerabilidades altas ni críticas en producción.
3. **Smoke test automático** (`tests/smoke/smoke.js`) tras cada despliegue: salud y versión, interfaz web, técnicos del seed, alta de incidente, asignación con bitácora e indicadores del dashboard. Si falla, el stage falla y los siguientes no se ejecutan.
4. **Aprobación manual en `prod`:** el Environment `prod` tiene un check de *Approvals*. El pipeline queda detenido hasta que un aprobador revisa los resultados de DEV y QA y aprueba.
5. **Un solo artefacto para todos los ambientes:** se construye una vez en la etapa CI y se promueve DEV → QA → PROD. No se recompila entre ambientes.
6. **Secretos por ambiente** en el grupo de variables `incident-hub-secrets` (`DB_PASSWORD_DEV`, `DB_PASSWORD_QA`, `DB_PASSWORD_PROD`), marcadas como secretas.

## Cómo se publica una versión

1. Verificar que `main` está verde y que el CHANGELOG describe la versión.
2. Subir la versión en los `package.json` y el CHANGELOG mediante un PR `chore(release)`.
3. Crear el tag anotado: `git tag -a vX.Y.Z -m "..."` y `git push origin vX.Y.Z`.
4. Azure Pipelines despliega en DEV y QA. Revisar los smoke tests y **aprobar** el despliegue a PROD en Azure DevOps (*Pipelines → ejecución → Review*).
5. GitHub Actions publica el GitHub Release con el paquete adjunto.

## Despliegue y reversión

`deploy.ps1` expande cada versión en `C:\incident-hub-deploy\<ambiente>\releases\<buildId>`, instala dependencias de producción, aplica las migraciones, detiene la versión anterior y arranca la nueva, y confirma `/health` con la versión esperada. Se conservan las 3 últimas versiones.

**Reversión:** volver a ejecutar el pipeline de un tag anterior, que redespliega ese artefacto. Las migraciones son idempotentes (`IF NOT EXISTS`) y solo agregan estructura, por lo que no hay que deshacer datos.

## Limitaciones conocidas

- Los tres ambientes comparten el mismo host (el agente). En una organización real serían servidores o clústeres distintos con el mismo pipeline.
- La API no tiene autenticación (TD-5, ver `tech-debt.md`).

# Guía de la demostración

Recorrido de unos 15 minutos que sigue el flujo del enunciado: **Task → rama → commit `AB#ID` → PR → revisión → `main` → pipeline → artefacto → release**.

## Antes de empezar

1. Abrir PowerShell y ejecutar `C:\agent\run.cmd` (debe decir *Escuchando trabajos*).
2. Iniciar Docker Desktop.
3. Comprobar los ambientes:
   ```powershell
   curl http://localhost:3001/health   # DEV
   curl http://localhost:3002/health   # QA
   curl http://localhost:3003/health   # PROD
   ```
   Si alguno no responde (por ejemplo, tras reiniciar la PC), volver a ejecutar el pipeline del último tag: `deploy.ps1` levanta la base de datos y la aplicación.

## 1. Planificación (Azure Boards) — 2 min

- https://dev.azure.com/epur/proyectoFinal/_backlogs → jerarquía Epic → Feature → User Story → Task.
- Abrir una Task cerrada (por ejemplo #38, deuda técnica TD-1): responsable, estimación, y en *Development* los commits y el PR enlazados con `AB#38`.
- Mostrar los 2 Bugs (#46 y #47) nacidos de fallos reales del pipeline.

## 2. Código y Pull Requests — 3 min

- Repo final: https://github.com/ErierCode/incident-hub-semana3 → *Pull requests* → *Closed*.
- Abrir un PR (por ejemplo el #4, del Bug #46): descripción con la plantilla, comentario de revisión, checks de Actions y de Azure Pipelines.
- Mostrar `main` protegida: *Settings → Branches*. Probar `git push origin main` directo: GitHub lo rechaza.

## 3. Integración continua y fallo controlado — 4 min

- Pipeline `incident-hub-semana3-ci`: etapas CI → DEV → QA → PROD.
- Agente self-hosted: *Project settings → Agent pools → Default*, y la ventana `run.cmd` mostrando el job en ejecución.
- Fallos y correcciones documentados en [evidence.md](evidence.md):
  - build **#11 (rojo) → #12 (verde)**: umbral de cobertura;
  - build **#36 (rojo)**: el redespliegue mataba la aplicación (el smoke test lo detectó);
  - build **#38 (rojo)**: se desplegaba un paquete antiguo → corregido y verificado.
- Artefacto publicado: pestaña *Artifacts* de cualquier ejecución verde (`incident-hub`, con el zip y `npm-audit.json`).
- Seguridad: [security.md](security.md); en Azure, *Library → incident-hub-secrets* (variables con candado); en GitHub, *Settings → Secrets*.

## 4. Release con ambientes y aprobación — 3 min

1. Mostrar *Pipelines → Environments*: `dev`, `qa`, `prod` con el historial de despliegues y la aprobación configurada en `prod`.
2. Mostrar un tag en curso, por ejemplo el de `v1.0.0`: DEV y QA automáticos con smoke test y PROD **detenido esperando aprobación**.
3. Aprobar en *Review → Approve* y ver el despliegue a PROD.
4. GitHub Release: https://github.com/ErierCode/incident-hub-semana3/releases (paquete adjunto y notas del CHANGELOG).

## 5. Aplicación funcionando — 3 min

En PROD (http://localhost:3003):

1. **Dashboard:** indicadores y distribuciones.
2. **Incidentes → Nuevo incidente:** categoría *RED*, prioridad *CRITICA*.
3. Abrir el incidente: **Asignar** a un técnico (pasa a ASIGNADO) → **Pasar a EN PROCESO** → agregar un comentario.
4. Volver al listado y **filtrar** por prioridad `CRITICA` y por técnico.
5. **Dashboard:** el incidente aparece en *críticos abiertos* y en la carga del técnico.
6. Intentar saltar de estado desde la API: `curl -X PATCH localhost:3003/api/incidents/1/status -H "Content-Type: application/json" -d '{"status":"CERRADO"}'` → `409 Transición no permitida`.

## Si piden una modificación en vivo

Flujo completo, con la ventana del agente abierta:

1. Crear una Task en Azure Boards y anotar su ID (por ejemplo `47`).
2. `git checkout -b feature/AB47-cambio` · editar · `git commit -m "feat: descripción" -m "AB#47"`.
3. `git push -u origin feature/AB47-cambio` · `gh pr create` · esperar los checks · merge (squash).
4. Ver el despliegue automático a **DEV** (http://localhost:3001).

Para cambios pequeños con respuesta visible, un buen candidato es agregar una categoría en `backend/src/domain/catalogs.js` y `frontend/src/constants.js`.

## Preguntas probables

| Pregunta | Dónde está la respuesta |
|---|---|
| ¿Cómo se evita desplegar algo roto en PROD? | CI + smoke test en DEV y QA + aprobación manual ([release-strategy.md](release-strategy.md)) |
| ¿Dónde están los secretos? | Grupo de variables de Azure y GitHub Secrets; nunca en el repo ([security.md](security.md)) |
| ¿Qué pasó en los pipelines fallidos? | [evidence.md](evidence.md) |
| ¿Qué deuda técnica queda? | TD-3, TD-4 y TD-5 ([tech-debt.md](tech-debt.md)) |
| ¿Por qué un solo integrante? | Proyecto individual; limitaciones en [cumplimiento.md](cumplimiento.md) |
| ¿Cómo se revierte una versión? | Ejecutar de nuevo el pipeline de un tag anterior ([release-strategy.md](release-strategy.md)) |

# Evidencias DevOps

Registro de evidencias verificables del flujo de trabajo. Cada entrada enlaza al artefacto original en GitHub o Azure DevOps.

## Fallo controlado del pipeline (semana 2)

| Campo | Detalle |
|---|---|
| Pipeline | `incident-hub-ci` (Azure Pipelines, agente self-hosted `agente-pc-erick`, pool `Default`) |
| Ejecución fallida | [Build #11 (`20261025.1`)](https://dev.azure.com/epur/proyectoFinal/_build/results?buildId=11) |
| Disparador | PR [incident-hub-semana2#1](https://github.com/ErierCode/incident-hub-semana2/pull/1) (`feature/AB33-azure-pipeline`) |
| Paso que falló | `Pruebas unitarias e integración (Jest)` |
| Work items | AB#33 (pipeline), AB#34 (corrección) |

### Síntoma

Las 42 pruebas pasaron, pero el paso terminó con código 1:

```
Branches     : 86.66% ( 104/120 )
Jest: Coverage for branches (86.66%) does not meet "global" threshold (90%)
Tests:       42 passed, 42 total
npm error Lifecycle script `test:ci` failed with error:
##[error]Cmd.exe exited with code '1'.
```

### Diagnóstico

El PR introdujo un **umbral de calidad** (`coverageThreshold` del 90 % en `backend/package.json`). El código existente cumplía en statements (95 %), functions (100 %) y lines (97 %), pero no en **branches**. Con `jest --coverage --coverageReporters=text` se identificaron las ramas sin probar:

| Archivo | Rama sin cubrir |
|---|---|
| `src/app.js:29` | Manejador de errores con respuesta 500 genérica (errores sin `status`) |
| `src/domain/status.js:15` | Estado de origen desconocido (`TRANSITIONS[from] \|\| []`) |
| `src/routes/incidents.js:93,109` | `changedBy` presente pero inválido en `/assign` y `/status` |
| `src/routes/incidents.js` | Peticiones sin cuerpo (`req.body \|\| {}`) |
| `src/services/incidentService.js:41` | `list()` invocado sin filtros |

**Causa raíz**: las pruebas de la semana 1 cubrían los caminos felices y la validación principal, pero no los casos límite ni el manejo de fallos de infraestructura.

**Decisión**: no se bajó el umbral, se agregaron las pruebas faltantes. Así se conserva la exigencia de calidad.

### Corrección

- Rama `fix/AB34-coverage-tests`, PR [incident-hub-semana2#2](https://github.com/ErierCode/incident-hub-semana2/pull/2).
- Nuevo archivo `backend/tests/edge-cases.test.js` con 9 casos: fallo de base de datos (500), estado desconocido, peticiones sin cuerpo, `changedBy` inválido y `list()` sin filtros.
- Resultado local: `Branches 95.83% (115/120)`, 51 pruebas en verde.

### Ejecución exitosa

| Campo | Detalle |
|---|---|
| Ejecución | [Build #12](https://dev.azure.com/epur/proyectoFinal/_build/results?buildId=12): **succeeded** en 2 min |
| Commit | `122d6b3`, merge de la corrección en `feature/AB33-azure-pipeline` |
| Pruebas | 51 en verde, publicadas en la pestaña *Tests* |
| Cobertura | Branches 95.83 %, publicada en la pestaña *Code Coverage* |
| Artefactos | `incident-hub` (zip `incident-hub-0.2.0.zip` + `npm-audit.json`, 71 KB) y `Code Coverage Report_12` |

Secuencia completa: **build #11 fallido → diagnóstico → `fix/AB34-coverage-tests` (PR #2) → build #12 exitoso → merge del PR #1 a `main`**.

## Agente self-hosted

| Campo | Detalle |
|---|---|
| Nombre | `agente-pc-erick` |
| Pool | `Default` (organización `epur`) |
| Versión | 5.280.0 (win-x64) |
| Ubicación | `C:\agent`, modo interactivo (`run.cmd`) |
| Registro | PAT con alcance *Agent Pools (Read & manage)* ingresado por consola; no se almacena en el repositorio |
| Evidencia | Los builds #11 y #12 muestran `Agent: agente-pc-erick` y rutas `C:\agent\_work\1\s` en el log |

## Segundo fallo controlado: redespliegue (semana 3)

| Campo | Detalle |
|---|---|
| Pipeline | `incident-hub-semana3-ci` |
| Ejecución fallida | [Build #36](https://dev.azure.com/epur/proyectoFinal/_build/results?buildId=36) (tag `v0.5.0`) |
| Etapa y paso | `Deploy_DEV` → *Smoke test* |
| Work item | Bug AB#46 |

### Síntoma

El paso *Desplegar* terminó bien (`OK: 'dev' sirve v0.5.0`), pero el siguiente paso falló 3 segundos después:

```
Smoke test contra http://localhost:3001 (esperado v0.5.0)
  FAIL GET /health responde ok con la versión esperada: fetch failed
  ... (6 verificaciones fallaron)
##[error]PowerShell exited with code '1'.
```

El primer despliegue a DEV (build #35 en `main`) había funcionado.

### Diagnóstico

1. El log del ambiente (`C:\incident-hub-deploy\dev\logs\app.log`) mostraba que la aplicación arrancó y que, pocos segundos después, terminó con `^C` (Ctrl+C).
2. La diferencia entre el build #35 y el #36 era que el segundo **reemplazaba una versión en ejecución**.
3. Se reprodujo en local ejecutando `deploy.ps1` dos veces desde consolas separadas, igual que el agente: el primer despliegue sobrevivía y el segundo moría a los pocos segundos.

**Causa:** el proceso nuevo se creaba con WMI sin aislar su consola ni su grupo de procesos, y recibía un Ctrl+C a los pocos segundos de arrancar cuando se reemplazaba una versión en ejecución. La hipótesis de trabajo es que la señal procede del cierre de la consola del proceso anterior (`taskkill /T /F`). Lo demostrado es que el fallo se reproduce solo en el redespliegue y que desaparece al aislar el proceso nuevo (ver Corrección).

**Por qué el control lo detectó:** el health check del propio script pasó (la aplicación estaba viva en ese instante) y fue el **smoke test**, un paso posterior e independiente, el que descubrió la caída. Sin esa segunda verificación el despliegue habría quedado marcado como exitoso con la aplicación caída.

### Corrección

- Rama `fix/AB46-redeploy-sigint`.
- `deploy.ps1` lanza la aplicación con `CREATE_NO_WINDOW` + `CREATE_NEW_PROCESS_GROUP` (sin ventana y en su propio grupo de procesos) y espera a que el proceso anterior termine antes de arrancar el nuevo.
- Versión `0.5.1` (PATCH, según SemVer): el tag `v0.5.0` queda tal cual como registro del fallo.
- Verificación local: tres despliegues consecutivos desde consolas separadas, con la aplicación sana 6 segundos después de cada uno y el smoke test en verde.

### La corrección no surtió efecto: build #38 (Bug AB#47)

Tras mergear la corrección a `main`, el [build #38](https://dev.azure.com/epur/proyectoFinal/_build/results?buildId=38) (versión 0.5.1) volvió a fallar en el mismo paso, con el mismo síntoma.

**Diagnóstico:** el log del paso *Expandir paquete* decía `Paquete incident-hub-0.5.0.zip expandido` y el del despliegue `Desplegando v0.5.0`, aunque el build era el 0.5.1. El workspace del agente self-hosted se reutiliza entre ejecuciones y conserva los paquetes descargados antes; el paso tomaba el primer `.zip` de la carpeta (orden alfabético), es decir, la versión **anterior**. Se redesplegó el paquete viejo, con el `deploy.ps1` viejo, y reapareció el defecto AB#46. El defecto de AB#47 ya existía, pero no se veía porque hasta entonces las dos ejecuciones desplegaban la misma versión.

**Lección:** el smoke test comprueba la versión esperada, pero el propio paquete desplegado era la fuente de esa "versión esperada". Conviene, además, que el log deje a la vista qué paquete se despliega.

**Corrección** (rama `fix/AB47-stale-artifact`, sin cambio de versión porque la 0.5.1 aún no se había publicado):
- Nuevo paso *Limpiar descargas anteriores* antes de descargar el artefacto.
- El paso *Expandir paquete* elige el `.zip` de **mayor versión** (comparación numérica: `0.10.0` > `0.9.9`; los sufijos `-rc.N` se ignoran para ordenar), por si quedara más de uno.

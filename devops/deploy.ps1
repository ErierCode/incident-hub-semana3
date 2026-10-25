<#
  Despliega IT Incident Hub en un ambiente del agente self-hosted.
  Se ejecuta desde el paquete ya expandido (AppDir), que contiene backend/, frontend/dist, database/ y devops/.

  Pasos: base de datos (Docker) -> .env -> dependencias -> migraciones -> reemplazo del proceso -> verificación de salud.
  La contraseña llega por la variable de entorno DB_PASSWORD (secreto de Azure Pipelines) y solo se escribe en
  AppDir\.env, que no está en el repositorio ni en el artefacto.
#>
param(
  [Parameter(Mandatory)][ValidateSet('dev', 'qa', 'prod')][string]$Environment,
  [Parameter(Mandatory)][int]$Port,
  [Parameter(Mandatory)][int]$DbPort,
  [Parameter(Mandatory)][string]$AppDir,
  [string]$Root = 'C:\incident-hub-deploy'
)

$ErrorActionPreference = 'Stop'

# Ejecuta un comando nativo (docker, npm). Windows PowerShell 5.1 trata como error terminante cualquier texto
# que el comando escriba en stderr (docker y npm lo usan para mensajes informativos), por eso se relaja
# $ErrorActionPreference dentro de la función y se decide el éxito solo por el código de salida.
function Invoke-Native {
  param([string]$Description, [scriptblock]$Command)
  Write-Host "==> $Description"
  $previous = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    & $Command 2>&1 | ForEach-Object { Write-Host "$_" }
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previous
  }
  if ($exitCode -ne 0) { throw "Falló: $Description (código $exitCode)" }
}

$password = $env:DB_PASSWORD
if (-not $password) { throw 'DB_PASSWORD no está definida: revise el grupo de variables incident-hub-secrets' }

$envRoot = Join-Path $Root $Environment
$logDir = Join-Path $envRoot 'logs'
New-Item -ItemType Directory -Force $envRoot, $logDir | Out-Null
$pidFile = Join-Path $envRoot 'app.pid'
$version = (Get-Content (Join-Path $AppDir 'package.json') -Raw | ConvertFrom-Json).version
Write-Host "Desplegando v$version en '$Environment' (API $Port, PostgreSQL $DbPort)"

# 1. Base de datos del ambiente
$env:DB_PORT = "$DbPort"
$env:DB_NAME = 'incident_hub'
$env:DB_USER = 'incident'
Invoke-Native "Base de datos ih-$Environment" {
  docker compose -p "ih-$Environment" -f (Join-Path $AppDir 'devops\docker-compose.deploy.yml') up -d --wait
}

# 2. Configuración del ambiente (fuera del repositorio)
@(
  "PORT=$Port", 'DB_HOST=localhost', "DB_PORT=$DbPort",
  'DB_NAME=incident_hub', 'DB_USER=incident', "DB_PASSWORD=$password"
) | Set-Content -Path (Join-Path $AppDir '.env') -Encoding ascii

# 3. Dependencias de producción y migraciones
Push-Location $AppDir
try {
  Invoke-Native 'npm ci --omit=dev' { npm ci --omit=dev --no-fund --no-audit }
  Invoke-Native 'Migraciones' { npm run migrate }
} finally {
  Pop-Location
}

# 4. Detener la versión anterior
if (Test-Path $pidFile) {
  $oldPid = [int](Get-Content $pidFile)
  # Solo se detiene si el PID sigue siendo el cmd.exe que lanzó este script (el número pudo reutilizarse).
  $old = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
  if ($old -and $old.ProcessName -eq 'cmd') {
    Write-Host "==> Deteniendo la versión anterior (PID $oldPid)"
    cmd.exe /c "taskkill /PID $oldPid /T /F >nul 2>&1"
    $global:LASTEXITCODE = 0
    # Esperar a que el proceso y su consola desaparezcan antes de arrancar el nuevo.
    Wait-Process -Id $oldPid -Timeout 15 -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
  }
}

# 5. Iniciar la nueva versión desacoplada del agente (sobrevive al fin del job)
$node = (Get-Command node).Source
$appLog = Join-Path $logDir 'app.log'
$command = "cmd.exe /c `"cd /d `"$AppDir`" && `"$node`" --env-file=.env backend\src\server.js >> `"$appLog`" 2>&1`""
# CreateFlags = CREATE_NO_WINDOW (0x08000000) + CREATE_NEW_PROCESS_GROUP (0x200): sin ventana y en su propio grupo,
# de modo que el Ctrl+C que se emite al cerrar la consola de la versión anterior no alcance al nuevo proceso.
$startup = New-CimInstance -ClassName Win32_ProcessStartup -ClientOnly -Property @{ CreateFlags = [uint32]0x08000200; ShowWindow = [uint16]0 }
$process = Invoke-CimMethod -ClassName Win32_Process -MethodName Create -Arguments @{
  CommandLine = $command; CurrentDirectory = $AppDir; ProcessStartupInformation = $startup
}
if ($process.ReturnValue -ne 0) { throw "No se pudo iniciar la aplicación (código $($process.ReturnValue))" }
$process.ProcessId | Set-Content $pidFile
Write-Host "==> Aplicación iniciada (PID $($process.ProcessId)), log: $appLog"

# 6. Verificación de salud
$healthy = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $health = Invoke-RestMethod "http://localhost:$Port/health" -TimeoutSec 3
    if ($health.status -eq 'ok' -and $health.version -eq $version) { $healthy = $true; break }
  } catch {
    Start-Sleep -Seconds 1
  }
}
if (-not $healthy) {
  if (Test-Path $appLog) { Get-Content $appLog -Tail 30 }
  throw "La aplicación no respondió con la versión $version en http://localhost:$Port/health"
}
Write-Host "OK: '$Environment' sirve v$version en http://localhost:$Port"

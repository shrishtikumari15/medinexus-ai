$ErrorActionPreference = 'Stop'

$serviceDirectory = Join-Path $PSScriptRoot 'ml-service'
$python = Join-Path $serviceDirectory 'venv\Scripts\python.exe'

if (-not (Test-Path $python)) {
  throw "ML virtual environment not found at '$python'. Follow the ML service setup steps in README.md first."
}

$listener = Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue
if ($listener) {
  try {
    $health = Invoke-RestMethod -Uri 'http://127.0.0.1:8000/health' -TimeoutSec 3
    if ($health.service -eq 'medinexus-ml-service' -and $health.status -eq 'ok') {
      Write-Host 'MediNexus ML service is already running at http://localhost:8000.'
      exit 0
    }
  } catch {
    # The port is occupied by a different service; report it below.
  }

  throw 'Port 8000 is already in use by a service that is not the MediNexus ML service.'
}

Push-Location $serviceDirectory
try {
  Write-Host 'Starting MediNexus ML service at http://localhost:8000 ...'
  & $python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
} finally {
  Pop-Location
}
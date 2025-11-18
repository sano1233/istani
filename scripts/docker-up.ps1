# Start all Docker services (PowerShell)
# Starts all services defined in docker-compose.yml

param(
    [switch]$Detached,
    [switch]$Build
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting all Docker services..." -ForegroundColor Cyan

$composeArgs = @("up")

if ($Build) {
    Write-Host "Building images first..." -ForegroundColor Yellow
    $composeArgs += "--build"
}

if ($Detached) {
    Write-Host "Starting in detached mode..." -ForegroundColor Yellow
    $composeArgs += "-d"
} else {
    Write-Host "Starting in attached mode (Ctrl+C to stop)..." -ForegroundColor Yellow
}

docker-compose @composeArgs

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start Docker services" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Docker services started successfully" -ForegroundColor Green

if ($Detached) {
    Write-Host ""
    Write-Host "📋 Running containers:" -ForegroundColor Cyan
    docker-compose ps
    
    Write-Host ""
    Write-Host "💡 Useful commands:" -ForegroundColor Cyan
    Write-Host "  View logs: docker-compose logs -f" -ForegroundColor Yellow
    Write-Host "  Stop services: npm run docker:stop" -ForegroundColor Yellow
    Write-Host "  Check status: docker-compose ps" -ForegroundColor Yellow
}


# Docker Build Script (PowerShell)
# Builds Docker images with security best practices

param(
    [string]$Target = "production",
    [switch]$NoCache,
    [switch]$Push
)

$ErrorActionPreference = "Stop"

Write-Host "🐳 Building Docker image..." -ForegroundColor Cyan

$buildArgs = @()
if ($NoCache) {
    $buildArgs += "--no-cache"
}

if ($Target -eq "production") {
    Write-Host "Building production image..." -ForegroundColor Yellow
    docker build -t istani-fitness:latest -t istani-fitness:$(Get-Date -Format 'yyyyMMdd-HHmmss') @buildArgs .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Production image built successfully" -ForegroundColor Green
    
    if ($Push) {
        Write-Host "Pushing to registry..." -ForegroundColor Yellow
        docker push istani-fitness:latest
    }
} elseif ($Target -eq "dev") {
    Write-Host "Building development image..." -ForegroundColor Yellow
    docker build -f Dockerfile.dev -t istani-fitness:dev @buildArgs .
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Development image built successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Invalid target. Use 'production' or 'dev'" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 Available images:" -ForegroundColor Cyan
docker images | Select-String "istani-fitness"


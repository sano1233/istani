# Docker Run Script (PowerShell)
# Runs Docker containers with proper configuration

param(
    [string]$Mode = "production",
    [switch]$Detached,
    [switch]$Build
)

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Docker containers..." -ForegroundColor Cyan

if ($Build) {
    Write-Host "Building images first..." -ForegroundColor Yellow
    & "$PSScriptRoot/docker-build.ps1" -Target $Mode
}

if ($Mode -eq "production") {
    Write-Host "Starting production containers..." -ForegroundColor Yellow
    $composeArgs = @("up")
    if ($Detached) {
        $composeArgs += "-d"
    }
    docker-compose up @composeArgs
} elseif ($Mode -eq "dev") {
    Write-Host "Starting development containers..." -ForegroundColor Yellow
    $composeArgs = @("--profile", "dev", "up")
    if ($Detached) {
        $composeArgs += "-d"
    }
    docker-compose @composeArgs
} else {
    Write-Host "❌ Invalid mode. Use 'production' or 'dev'" -ForegroundColor Red
    exit 1
}


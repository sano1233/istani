# Start agents in development mode (PowerShell)
# Starts development agents with hot reload

$ErrorActionPreference = "Stop"

Write-Host "🤖 Starting agents in development mode..." -ForegroundColor Cyan

# Check if docker-compose.yml exists
if (-not (Test-Path "docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found" -ForegroundColor Red
    exit 1
}

# Start agents with development profile
Write-Host "Starting development agents..." -ForegroundColor Yellow
docker-compose --profile dev up -d elevenlabs-agent fitness-agents

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start agents" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Agents started successfully" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Agent services:" -ForegroundColor Cyan
Write-Host "  - ElevenLabs Agent: http://localhost:3001" -ForegroundColor Yellow
Write-Host "  - Fitness Agents: http://localhost:3002" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Useful commands:" -ForegroundColor Cyan
Write-Host "  View logs: docker-compose logs -f elevenlabs-agent fitness-agents" -ForegroundColor Yellow
Write-Host "  Stop agents: docker-compose stop elevenlabs-agent fitness-agents" -ForegroundColor Yellow


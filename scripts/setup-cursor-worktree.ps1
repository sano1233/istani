# Cursor Worktree Setup Script (PowerShell version)
# This script sets up a new Cursor worktree with all necessary configurations

param(
    [Parameter(Position=0)]
    [string]$BranchName = "cursor/$(Get-Date -Format 'yyyyMMdd-HHmmss')",
    
    [Parameter(Position=1)]
    [string]$WorktreePath = "../worktrees/$($BranchName.Split('/')[-1])"
)

Write-Host "🌳 Setting up Cursor worktree..." -ForegroundColor Cyan
Write-Host "Branch: $BranchName" -ForegroundColor Yellow
Write-Host "Path: $WorktreePath" -ForegroundColor Yellow

# Create worktree
try {
    git worktree add $WorktreePath -b $BranchName 2>$null
} catch {
    try {
        git worktree add $WorktreePath $BranchName 2>$null
    } catch {
        git worktree add $WorktreePath -b $BranchName
    }
}

Set-Location $WorktreePath

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Run typecheck
Write-Host "🔍 Running typecheck..." -ForegroundColor Cyan
try {
    npm run typecheck
} catch {
    Write-Host "⚠️  Typecheck had warnings (continuing...)" -ForegroundColor Yellow
}

# Setup git hooks (optional)
$hooksPath = "../.git/hooks"
if (-not (Test-Path $hooksPath)) {
    Write-Host "📝 Setting up git hooks..." -ForegroundColor Cyan
    New-Item -ItemType Directory -Path $hooksPath -Force | Out-Null
    $preCommitHook = @"
#!/bin/bash
npm run lint -- --fix
npm run typecheck
"@
    Set-Content -Path "$hooksPath/pre-commit" -Value $preCommitHook
    # Note: chmod equivalent in PowerShell would require additional setup
}

Write-Host "✅ Worktree setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  cd $WorktreePath" -ForegroundColor Yellow
Write-Host "  npm run dev:turbo" -ForegroundColor Yellow
Write-Host ""
Write-Host "To remove worktree:" -ForegroundColor Cyan
Write-Host "  git worktree remove $WorktreePath" -ForegroundColor Yellow


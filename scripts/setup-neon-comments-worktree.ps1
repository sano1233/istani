# Setup worktree for Neon Comments integration branch (PowerShell version)
# Branch: claude/setup-neon-comments-01EvegQGSSGcFAdMDxQEZAwe

param(
    [string]$BranchName = "claude/setup-neon-comments-01EvegQGSSGcFAdMDxQEZAwe",
    [string]$WorktreeName = "setup-neon-comments",
    [string]$WorktreePath = "../worktrees/$WorktreeName"
)

Write-Host "🌳 Setting up worktree for Neon Comments integration..." -ForegroundColor Cyan
Write-Host "Branch: $BranchName" -ForegroundColor Yellow
Write-Host "Path: $WorktreePath" -ForegroundColor Yellow

# Check if branch exists remotely
$remoteBranches = git ls-remote --heads origin $BranchName 2>$null
if ($remoteBranches -match $BranchName) {
    Write-Host "✅ Branch found remotely" -ForegroundColor Green
    try {
        git worktree add $WorktreePath -b $BranchName "origin/$BranchName" 2>$null
    } catch {
        try {
            git worktree add $WorktreePath $BranchName 2>$null
        } catch {
            git worktree add $WorktreePath -b $BranchName
        }
    }
} else {
    Write-Host "⚠️  Branch not found remotely, creating new branch" -ForegroundColor Yellow
    git worktree add $WorktreePath -b $BranchName
}

Set-Location $WorktreePath

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

# Check for Neon Comments setup
if (Test-Path "package.json") {
    $packageContent = Get-Content "package.json" -Raw
    if ($packageContent -notmatch "@neondatabase" -and $packageContent -notmatch "neon") {
        Write-Host "📝 Neon Comments packages not found in package.json" -ForegroundColor Yellow
        Write-Host "💡 You may need to install:" -ForegroundColor Cyan
        Write-Host "   npm install @neondatabase/serverless" -ForegroundColor Yellow
        Write-Host "   # or" -ForegroundColor Yellow
        Write-Host "   npm install neon-comments" -ForegroundColor Yellow
    }
}

# Run typecheck
Write-Host "🔍 Running typecheck..." -ForegroundColor Cyan
try {
    npm run typecheck
} catch {
    Write-Host "⚠️  Typecheck had warnings (continuing...)" -ForegroundColor Yellow
}

Write-Host "✅ Worktree setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  cd $WorktreePath" -ForegroundColor Yellow
Write-Host "  npm run dev:turbo" -ForegroundColor Yellow
Write-Host ""
Write-Host "Neon Comments Integration Resources:" -ForegroundColor Cyan
Write-Host "  - Neon Database: https://neon.tech" -ForegroundColor Yellow
Write-Host "  - Neon Serverless: https://neon.tech/docs/serverless/serverless-driver" -ForegroundColor Yellow
Write-Host "  - Comments System: Consider using Neon for real-time comments" -ForegroundColor Yellow


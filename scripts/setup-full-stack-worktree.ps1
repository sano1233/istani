# Setup worktree for Full Stack App branch (PowerShell version)
# Branch: claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC

param(
    [string]$BranchName = "claude/build-full-stack-app-01Xa6az4dVo5t3yAPGkThswC",
    [string]$WorktreeName = "build-full-stack-app",
    [string]$WorktreePath = "../worktrees/$WorktreeName"
)

Write-Host "🌳 Setting up worktree for Full Stack App..." -ForegroundColor Cyan
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

# Run typecheck
Write-Host "🔍 Running typecheck..." -ForegroundColor Cyan
try {
    npm run typecheck
} catch {
    Write-Host "⚠️  Typecheck had warnings (continuing...)" -ForegroundColor Yellow
}

# Fix any merge conflicts
Write-Host "🔧 Checking for merge conflicts..." -ForegroundColor Cyan
$conflicts = Get-ChildItem -Path . -Recurse -File -ErrorAction SilentlyContinue | 
    Select-String -Pattern "<<<<<<< " -ErrorAction SilentlyContinue

if ($conflicts) {
    Write-Host "⚠️  Merge conflicts detected. Please resolve them manually." -ForegroundColor Yellow
} else {
    Write-Host "✅ No merge conflicts found" -ForegroundColor Green
}

Write-Host "✅ Worktree setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To start development:" -ForegroundColor Cyan
Write-Host "  cd $WorktreePath" -ForegroundColor Yellow
Write-Host "  npm run dev:turbo" -ForegroundColor Yellow
Write-Host ""
Write-Host "To fix issues:" -ForegroundColor Cyan
Write-Host "  npm run lint:fix" -ForegroundColor Yellow
Write-Host "  npm run typecheck" -ForegroundColor Yellow


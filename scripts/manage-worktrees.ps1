# Cursor Worktree Management Script (PowerShell version)
# Manage multiple worktrees for parallel development

param(
    [Parameter(Position=0)]
    [string]$Command = "list",
    
    [Parameter(Position=1)]
    [string]$BranchName = "",
    
    [Parameter(Position=2)]
    [string]$WorktreePath = ""
)

switch ($Command) {
    "list" {
        Write-Host "📋 Active worktrees:" -ForegroundColor Cyan
        git worktree list
    }
    
    "create" {
        if ([string]::IsNullOrEmpty($BranchName)) {
            $BranchName = "cursor/$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        }
        if ([string]::IsNullOrEmpty($WorktreePath)) {
            $WorktreePath = "../worktrees/$($BranchName.Split('/')[-1])"
        }
        
        Write-Host "🌳 Creating worktree: $BranchName" -ForegroundColor Cyan
        & "$PSScriptRoot/setup-cursor-worktree.ps1" $BranchName $WorktreePath
    }
    
    "remove" {
        if ([string]::IsNullOrEmpty($WorktreePath)) {
            Write-Host "❌ Please provide worktree path" -ForegroundColor Red
            Write-Host "Usage: .\manage-worktrees.ps1 remove <worktree-path>" -ForegroundColor Yellow
            exit 1
        }
        
        Write-Host "🗑️  Removing worktree: $WorktreePath" -ForegroundColor Yellow
        git worktree remove $WorktreePath --force
        Write-Host "✅ Worktree removed" -ForegroundColor Green
    }
    
    "prune" {
        Write-Host "🧹 Pruning worktrees..." -ForegroundColor Cyan
        git worktree prune
        Write-Host "✅ Pruning complete" -ForegroundColor Green
    }
    
    "dev" {
        if ([string]::IsNullOrEmpty($WorktreePath)) {
            $WorktreePath = "."
        }
        Set-Location $WorktreePath
        Write-Host "🚀 Starting dev server in worktree: $WorktreePath" -ForegroundColor Cyan
        npm run dev:turbo
    }
    
    default {
        Write-Host "Cursor Worktree Manager" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Usage: .\manage-worktrees.ps1 <command> [options]" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Commands:" -ForegroundColor Cyan
        Write-Host "  list              - List all active worktrees"
        Write-Host "  create [branch]   - Create a new worktree"
        Write-Host "  remove <path>     - Remove a worktree"
        Write-Host "  prune             - Prune stale worktrees"
        Write-Host "  dev [path]        - Start dev server in worktree"
        Write-Host ""
        exit 1
    }
}


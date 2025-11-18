# PowerShell Compatibility Guide

## Overview

All scripts in this project now support both PowerShell (Windows) and Bash (Unix-like systems). The scripts automatically detect the operating system and run the appropriate version.

## Fixed Issues

### 1. ✅ React Import Error (app/(auth)/layout.tsx)
- **Issue**: TypeScript couldn't find React module
- **Fix**: Added explicit React import alongside ReactNode type import
- **Status**: ✅ Resolved

### 2. ✅ PowerShell Script Compatibility
- **Issue**: Bash scripts don't work on Windows PowerShell
- **Fix**: Created PowerShell (.ps1) versions of all scripts
- **Status**: ✅ All scripts now cross-platform

### 3. ✅ Cross-Platform Script Runner
- **Issue**: Need to detect OS and run appropriate script
- **Fix**: Created `scripts/run-script.js` Node.js script that auto-detects OS
- **Status**: ✅ Automatic OS detection working

## Available Scripts

### Worktree Management

```bash
# Works on both Windows and Unix
npm run worktree:setup      # Setup new worktree
npm run worktree:list       # List all worktrees
npm run worktree:create     # Create new worktree
npm run worktree:remove     # Remove worktree
npm run worktree:prune      # Prune stale worktrees
npm run worktree:neon       # Setup Neon Comments worktree
npm run worktree:fullstack  # Setup Full Stack App worktree
```

### Log Management

```bash
npm run clean:logs          # Clean Amazon Q log files
```

## PowerShell Scripts

All scripts have PowerShell equivalents:

- `scripts/setup-cursor-worktree.ps1`
- `scripts/manage-worktrees.ps1`
- `scripts/setup-neon-comments-worktree.ps1`
- `scripts/setup-full-stack-worktree.ps1`
- `scripts/clean-amazon-q-logs.ps1`

## Direct PowerShell Usage

You can also run PowerShell scripts directly:

```powershell
# Windows PowerShell
.\scripts\setup-cursor-worktree.ps1
.\scripts\manage-worktrees.ps1 list
.\scripts\clean-amazon-q-logs.ps1
```

## Execution Policy (Windows)

If you get execution policy errors on Windows:

```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user (recommended)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass (one-time)
powershell -ExecutionPolicy Bypass -File scripts\clean-amazon-q-logs.ps1
```

## Amazon Q Compatibility

All scripts are compatible with Amazon Q and other AI coding assistants:

1. **Clear error messages** - Scripts provide helpful error messages
2. **Cross-platform** - Works on Windows, macOS, and Linux
3. **Git integration** - Properly handles Git worktrees
4. **Log management** - Amazon Q logs are properly excluded

## Troubleshooting

### Script Not Found

If you get "script not found" errors:

1. **Check file exists**:
   ```powershell
   # Windows
   Test-Path scripts\clean-amazon-q-logs.ps1
   
   # Unix
   test -f scripts/clean-amazon-q-logs.sh
   ```

2. **Check permissions**:
   ```powershell
   # Windows
   Get-Acl scripts\clean-amazon-q-logs.ps1
   ```

### Execution Policy Errors (Windows)

```powershell
# Run as administrator
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine

# Or use bypass for specific script
powershell -ExecutionPolicy Bypass -File scripts\script.ps1
```

### Path Issues

If scripts can't find files:

1. **Use absolute paths** in scripts
2. **Check working directory**:
   ```powershell
   Get-Location  # PowerShell
   pwd           # Bash
   ```

## Best Practices

1. **Use NPM scripts** - They handle cross-platform automatically
2. **Check OS first** - Scripts auto-detect, but you can check manually
3. **Test both platforms** - If possible, test on Windows and Unix
4. **Use Node.js runner** - `scripts/run-script.js` handles everything

## Related Documentation

- `docs/AMAZON-Q-LOGS-FIX.md` - Amazon Q log file management
- `docs/CURSOR-CONFIG-FIXES.md` - Cursor configuration
- `.gitignore` - Excluded files including Amazon Q logs


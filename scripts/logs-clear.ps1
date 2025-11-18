# Clear Amazon Q logs (PowerShell)
# Removes all Amazon Q log files

$ErrorActionPreference = "Stop"

Write-Host "🧹 Clearing Amazon Q logs..." -ForegroundColor Cyan

$clearedCount = 0

# Remove main log file
if (Test-Path "Amazon Q Logs.log") {
    Write-Host "  Removing: Amazon Q Logs.log" -ForegroundColor Yellow
    Remove-Item "Amazon Q Logs.log" -Force
    $clearedCount++
}

# Remove .q.log files
$qLogFiles = Get-ChildItem -Path . -Filter "*.q.log" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next" }

foreach ($file in $qLogFiles) {
    Write-Host "  Removing: $($file.FullName)" -ForegroundColor Yellow
    Remove-Item $file.FullName -Force
    $clearedCount++
}

# Remove log directories
if (Test-Path ".q-logs") {
    Write-Host "  Removing directory: .q-logs" -ForegroundColor Yellow
    Remove-Item ".q-logs" -Recurse -Force
    $clearedCount++
}

if (Test-Path "amazon-q-logs") {
    Write-Host "  Removing directory: amazon-q-logs" -ForegroundColor Yellow
    Remove-Item "amazon-q-logs" -Recurse -Force
    $clearedCount++
}

if ($clearedCount -eq 0) {
    Write-Host "✅ No Amazon Q log files found" -ForegroundColor Green
} else {
    Write-Host "✅ Cleared $clearedCount Amazon Q log file(s)/directory(ies)" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Tip: Amazon Q log files are excluded in .gitignore" -ForegroundColor Cyan


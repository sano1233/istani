# Clean Amazon Q log files from repository (PowerShell version)
# This script removes Amazon Q log files that may have been accidentally committed

Write-Host "🧹 Cleaning Amazon Q log files..." -ForegroundColor Cyan

$foundFiles = 0

# Remove main log file
if (Test-Path "Amazon Q Logs.log") {
    Write-Host "  Removing: Amazon Q Logs.log" -ForegroundColor Yellow
    Remove-Item "Amazon Q Logs.log" -Force
    $foundFiles++
}

# Remove .q.log files
$qLogFiles = Get-ChildItem -Path . -Filter "*.q.log" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git" }

foreach ($file in $qLogFiles) {
    Write-Host "  Removing: $($file.FullName)" -ForegroundColor Yellow
    Remove-Item $file.FullName -Force
    $foundFiles++
}

# Remove log directories
if (Test-Path ".q-logs") {
    Write-Host "  Removing directory: .q-logs" -ForegroundColor Yellow
    Remove-Item ".q-logs" -Recurse -Force
    $foundFiles++
}

if (Test-Path "amazon-q-logs") {
    Write-Host "  Removing directory: amazon-q-logs" -ForegroundColor Yellow
    Remove-Item "amazon-q-logs" -Recurse -Force
    $foundFiles++
}

if ($foundFiles -eq 0) {
    Write-Host "✅ No Amazon Q log files found" -ForegroundColor Green
} else {
    Write-Host "✅ Cleaned $foundFiles Amazon Q log file(s)/directory(ies)" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Tip: Amazon Q log files are now excluded in .gitignore" -ForegroundColor Cyan
Write-Host "   They will not be tracked by Git in the future" -ForegroundColor Cyan


# Archive Amazon Q logs (PowerShell)
# Archives Amazon Q logs to a timestamped archive

$ErrorActionPreference = "Stop"

Write-Host "📦 Archiving Amazon Q logs..." -ForegroundColor Cyan

$archiveDir = "logs-archive"
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveName = "amazon-q-logs-$timestamp"

# Create archive directory if it doesn't exist
if (-not (Test-Path $archiveDir)) {
    New-Item -ItemType Directory -Path $archiveDir | Out-Null
}

$archivePath = Join-Path $archiveDir $archiveName
New-Item -ItemType Directory -Path $archivePath | Out-Null

$archivedCount = 0

# Archive main log file
if (Test-Path "Amazon Q Logs.log") {
    Write-Host "  Archiving: Amazon Q Logs.log" -ForegroundColor Yellow
    Copy-Item "Amazon Q Logs.log" -Destination $archivePath -Force
    $archivedCount++
}

# Archive .q.log files
$qLogFiles = Get-ChildItem -Path . -Filter "*.q.log" -Recurse -ErrorAction SilentlyContinue | 
    Where-Object { $_.FullName -notmatch "node_modules|\.git|\.next" }

foreach ($file in $qLogFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    $destPath = Join-Path $archivePath $relativePath
    $destDir = Split-Path $destPath -Parent
    
    if (-not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    Write-Host "  Archiving: $relativePath" -ForegroundColor Yellow
    Copy-Item $file.FullName -Destination $destPath -Force
    $archivedCount++
}

# Archive log directories
if (Test-Path ".q-logs") {
    Write-Host "  Archiving directory: .q-logs" -ForegroundColor Yellow
    $destPath = Join-Path $archivePath ".q-logs"
    Copy-Item ".q-logs" -Destination $destPath -Recurse -Force
    $archivedCount++
}

if (Test-Path "amazon-q-logs") {
    Write-Host "  Archiving directory: amazon-q-logs" -ForegroundColor Yellow
    $destPath = Join-Path $archivePath "amazon-q-logs"
    Copy-Item "amazon-q-logs" -Destination $destPath -Recurse -Force
    $archivedCount++
}

if ($archivedCount -eq 0) {
    Write-Host "✅ No Amazon Q log files found to archive" -ForegroundColor Green
    Remove-Item $archivePath -Force -ErrorAction SilentlyContinue
} else {
    Write-Host "✅ Archived $archivedCount Amazon Q log file(s)/directory(ies) to $archivePath" -ForegroundColor Green
    
    # Create archive info file
    $infoFile = Join-Path $archivePath "archive-info.txt"
    $info = @"
Amazon Q Logs Archive
Created: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
Files Archived: $archivedCount
Archive Location: $archivePath
"@
    Set-Content -Path $infoFile -Value $info
    
    Write-Host ""
    Write-Host "📁 Archive location: $archivePath" -ForegroundColor Cyan
    Write-Host "💡 You can now safely clear logs: npm run logs:clear" -ForegroundColor Yellow
}


# Cross-platform script runner
# Automatically detects OS and runs appropriate script

param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptName,
    
    [Parameter(ValueFromRemainingArguments=$true)]
    [string[]]$Arguments
)

$isWindows = $PSVersionTable.Platform -eq "Win32NT" -or $env:OS -match "Windows"

if ($isWindows) {
    $scriptPath = "scripts/$ScriptName.ps1"
    if (Test-Path $scriptPath) {
        & $scriptPath @Arguments
    } else {
        Write-Host "❌ PowerShell script not found: $scriptPath" -ForegroundColor Red
        exit 1
    }
} else {
    $scriptPath = "scripts/$ScriptName.sh"
    if (Test-Path $scriptPath) {
        & bash $scriptPath @Arguments
    } else {
        Write-Host "❌ Bash script not found: $scriptPath" -ForegroundColor Red
        exit 1
    }
}


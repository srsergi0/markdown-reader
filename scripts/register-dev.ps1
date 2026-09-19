# Register .md file association for development
# Run as Administrator: powershell -ExecutionPolicy Bypass -File scripts/register-dev.ps1

$projectRoot = Resolve-Path "$PSScriptRoot\.."
$devElectron = Join-Path $projectRoot "node_modules\.bin\electron.cmd"

$builtApp = $null
$possiblePaths = @(
  (Join-Path $projectRoot "artifacts\win-unpacked\Markdown Reader.exe"),
  (Join-Path $projectRoot "artifacts\win-unpacked\MarkdownReader.exe"),
  (Join-Path $projectRoot "artifacts\win-unpacked\markdown-reader.exe")
)
foreach ($p in $possiblePaths) {
  if (Test-Path $p) { $builtApp = $p; break }
}

if ($builtApp) {
  $openCommand = "`"$builtApp`" `"%1`""
  $iconPath = "$builtApp,0"
} elseif (Test-Path $devElectron) {
  $openCommand = "`"$devElectron`" `"$projectRoot`" `"%1`""
  $iconPath = "$devElectron,0"
} else {
  Write-Host "Warning: Could not find Electron. Run 'bun install' first." -ForegroundColor Yellow
  $openCommand = "`"$devElectron`" `"$projectRoot`" `"%1`""
  $iconPath = "$devElectron,0"
}

$progId = "MarkdownReader.md"
$appName = "Markdown Reader"

# Create ProgID
New-Item -Path "HKCU:\Software\Classes\$progId" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Software\Classes\$progId" -Name "" -Value $appName -Force | Out-Null

# Default icon
New-Item -Path "HKCU:\Software\Classes\$progId\DefaultIcon" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Software\Classes\$progId\DefaultIcon" -Name "" -Value $iconPath -Force | Out-Null

# Open command
New-Item -Path "HKCU:\Software\Classes\$progId\shell\open\command" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Software\Classes\$progId\shell\open\command" -Name "" -Value $openCommand -Force | Out-Null

# Associate .md extension
New-Item -Path "HKCU:\Software\Classes\.md" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Software\Classes\.md" -Name "" -Value $progId -Force | Out-Null

# Also associate .markdown
New-Item -Path "HKCU:\Software\Classes\.markdown" -Force | Out-Null
New-ItemProperty -Path "HKCU:\Software\Classes\.markdown" -Name "" -Value $progId -Force | Out-Null

# Notify Explorer of changes
$taskbarStop = [System.Diagnostics.Process]::Start("taskkill", "/f /im explorer.exe")
$taskbarStop.WaitForExit()
Start-Process "explorer.exe"

Write-Host "File association registered successfully!" -ForegroundColor Green
Write-Host ".md and .markdown files will now open with $appName" -ForegroundColor Green

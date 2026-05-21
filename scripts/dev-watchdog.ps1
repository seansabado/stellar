param(
    [int]$Port = 3001,
    [int]$RestartDelaySeconds = 2
)

Write-Host "[watchdog] Starting Stellar dev server watchdog on port $Port"

while ($true) {
    & npm run dev:once
    $exitCode = $LASTEXITCODE
    Write-Host "[watchdog] Dev server exited with code $exitCode"
    Write-Host "[watchdog] Restarting in $RestartDelaySeconds second(s)..."
    Start-Sleep -Seconds $RestartDelaySeconds
}
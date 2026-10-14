# Cleanly stop DCF Platform Servers (Ports 8000 and 3000)

Write-Host "Stopping DCF Platform Servers..." -ForegroundColor Cyan

# Stop FastAPI backend on port 8000
$port8000Processes = (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($port8000Processes) {
    $port8000Processes | Select-Object -Unique | ForEach-Object {
        try {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped backend process (PID $_) on port 8000" -ForegroundColor Green
        } catch {}
    }
} else {
    Write-Host "No process listening on port 8000" -ForegroundColor Gray
}

# Stop Next.js frontend on port 3000
$port3000Processes = (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue).OwningProcess
if ($port3000Processes) {
    $port3000Processes | Select-Object -Unique | ForEach-Object {
        try {
            Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped frontend process (PID $_) on port 3000" -ForegroundColor Green
        } catch {}
    }
} else {
    Write-Host "No process listening on port 3000" -ForegroundColor Gray
}

# Close any launcher cmd windows if still open
Get-Process cmd -ErrorAction SilentlyContinue | Where-Object { 
    $_.MainWindowTitle -like "*DCF Backend Server*" -or $_.MainWindowTitle -like "*DCF Web Frontend*" 
} | ForEach-Object {
    try { 
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue 
        Write-Host "Closed launcher window: $($_.MainWindowTitle)" -ForegroundColor Gray
    } catch {}
}

Write-Host "DCF Platform servers stopped successfully." -ForegroundColor Yellow

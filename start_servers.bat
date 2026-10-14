@echo off
title DCF Valuation Platform Launcher
color 0A
echo ==========================================================
echo   Starting Indian Equities DCF Valuation Platform...
echo ==========================================================
echo.

set PROJECT_DIR=C:\Moved_From_E\Projects\Vibhuti Sharma

echo [1/3] Starting FastAPI Backend (Port 8000)...
start "DCF Backend Server (Port 8000)" cmd /k "cd /d %PROJECT_DIR% && .\services\api\.venv\Scripts\python -m uvicorn services.api.main:app --host 127.0.0.1 --port 8000"

echo [2/3] Starting Next.js Web Frontend (Port 3000)...
start "DCF Web Frontend (Port 3000)" cmd /k "cd /d %PROJECT_DIR%\apps\web && npm run dev"

echo [3/3] Waiting for servers to initialize...
ping 127.0.0.1 -n 5 >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ==========================================================
echo   All servers are up and running!
echo   Frontend : http://localhost:3000
echo   Backend  : http://127.0.0.1:8000
echo ==========================================================
echo You can minimize this window or close it.
ping 127.0.0.1 -n 4 >nul
exit

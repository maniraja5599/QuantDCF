@echo off
title DCF Web Frontend (Port 3000)
cd /d "%~dp0apps\web"
echo Starting Next.js Web Frontend on http://localhost:3000 ...
npm run dev
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Frontend encountered an error.
    pause
)

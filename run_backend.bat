@echo off
title DCF Backend Server (Port 8000)
cd /d "%~dp0"
echo Starting FastAPI Backend on http://127.0.0.1:8000 ...
.\services\api\.venv\Scripts\python.exe -m uvicorn services.api.main:app --host 127.0.0.1 --port 8000 --reload
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo Backend encountered an error.
    pause
)

@echo off
title ANDARA ERP - Stop Development
cd /d "%~dp0"

echo ========================================================
echo          ANDARA ERP - STOPPING ALL SERVICES
echo ========================================================
echo.

:: 1. Hentikan Docker Compose
echo [1/3] Menghentikan Docker Containers (PostgreSQL)...
docker compose down

:: 2. Hentikan proses Backend jika masih aktif di port 8080
echo.
echo [2/3] Memeriksa dan menghentikan proses Backend (Port 8080)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080 ^| findstr LISTENING') do (
    echo       Menghentikan PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

:: 3. Hentikan proses Frontend jika masih aktif di port 5173
echo.
echo [3/3] Memeriksa dan menghentikan proses Frontend (Port 5173)...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    echo       Menghentikan PID %%a...
    taskkill /F /PID %%a >nul 2>&1
)

echo.
echo ========================================================
echo   Semua service Andara ERP telah dihentikan!
echo ========================================================
echo.
pause

@echo off
setlocal enabledelayedexpansion
title ANDARA ERP - Development Launcher
cd /d "%~dp0"

echo ========================================================
echo          ANDARA ERP - LOCAL DEVELOPMENT LAUNCHER
echo ========================================================
echo.

:: 1. Jalankan Docker Compose untuk Database PostgreSQL
echo [1/3] Menjalankan Docker Compose (PostgreSQL Database)...
docker compose up -d
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Gagal menjalankan Docker Compose!
    echo Pastikan aplikasi Docker Desktop sudah dibuka dan aktif.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

echo       Database PostgreSQL aktif!
echo       Menunggu 3 detik agar database siap menerima koneksi...
timeout /t 3 /nobreak >nul

:: 2. Jalankan Backend Spring Boot di terminal terpisah
echo.
echo [2/3] Membuka terminal Backend (Spring Boot)...
start "Andara ERP - Backend (Spring Boot)" cmd /k "title Andara ERP - Backend (Port 8080) && cd /d ""%~dp0backend"" && echo ======================================================== && echo   ANDARA ERP - BACKEND SPRING BOOT (Port 8080) && echo ======================================================== && if exist mvnw.cmd (call mvnw.cmd spring-boot:run) else (call mvn spring-boot:run)"

:: 3. Jalankan Frontend Vite React di terminal terpisah
echo.
echo [3/3] Membuka terminal Frontend (React Vite)...
start "Andara ERP - Frontend (React Vite)" cmd /k "title Andara ERP - Frontend (Port 5173) && cd /d ""%~dp0frontend"" && echo ======================================================== && echo   ANDARA ERP - FRONTEND VITE REACT (Port 5173) && echo ======================================================== && call npm run dev"

echo.
echo ========================================================
echo   Semua service telah diluncurkan!
echo   - PostgreSQL Database : localhost:5432
echo   - Backend API         : http://localhost:8080
echo   - Frontend App        : http://localhost:5173
echo ========================================================
echo.
echo [INFO] Terminal Backend dan Frontend dibuka di jendela terpisah.
echo Jangan tutup jendela terminal tersebut selama Anda bekerja.
echo.
echo Membuka browser ke http://localhost:5173 dalam 5 detik...
timeout /t 5 /nobreak >nul
start http://localhost:5173

echo.
echo Launcher selesai. Anda dapat menutup jendela ini kapan saja.
pause

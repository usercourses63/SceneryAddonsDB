@echo off
setlocal enabledelayedexpansion

REM SceneryAddonsDB v3.0 Installation Script
REM This batch file installs MongoDB service and sets up the application

echo ======================================
echo SceneryAddonsDB v3.0 Installation
echo ======================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: This script must be run as Administrator!
    echo Please right-click this batch file and select "Run as administrator"
    pause
    exit /b 1
)

echo Installing MongoDB as Windows service...
echo.

REM Run MongoDB installation script
powershell -ExecutionPolicy Bypass -File "%~dp0install-mongodb-service.ps1"

if %errorLevel% neq 0 (
    echo.
    echo MongoDB installation failed!
    pause
    exit /b 1
)

echo.
echo ======================================
echo Installation Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Run start.bat to start the application
echo 2. Open http://localhost:5000 in your browser
echo 3. The application will be available in the system tray
echo.
echo For troubleshooting, check the logs in the application directory.
echo.
pause
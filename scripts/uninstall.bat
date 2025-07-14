@echo off
setlocal enabledelayedexpansion

REM SceneryAddonsDB v3.0 Uninstallation Script
REM This batch file removes MongoDB service and application

echo ======================================
echo SceneryAddonsDB v3.0 Uninstallation
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

echo WARNING: This will remove MongoDB service and optionally remove data.
echo.
set /p confirm="Are you sure you want to continue? (y/N): "

if /i not "%confirm%"=="y" (
    echo Uninstallation cancelled.
    pause
    exit /b 0
)

echo.
set /p removeData="Remove MongoDB data directories? (y/N): "
set /p removeInstall="Remove MongoDB installation? (y/N): "

echo.
echo Uninstalling MongoDB service...

REM Build PowerShell command with parameters
set "psCommand=powershell -ExecutionPolicy Bypass -File "%~dp0uninstall-mongodb-service.ps1""

if /i "%removeData%"=="y" (
    set "psCommand=!psCommand! -RemoveData"
)

if /i "%removeInstall%"=="y" (
    set "psCommand=!psCommand! -RemoveInstallation"
)

REM Execute the PowerShell script
!psCommand!

if %errorLevel% neq 0 (
    echo.
    echo Uninstallation encountered errors!
    pause
    exit /b 1
)

echo.
echo ======================================
echo Uninstallation Complete!
echo ======================================
echo.
echo SceneryAddonsDB v3.0 has been uninstalled.
echo.
pause
@echo off
setlocal enabledelayedexpansion

REM SceneryAddonsDB v3.0 Application Stop Script
REM This batch file stops the SceneryAddonsDB application

echo ======================================
echo SceneryAddonsDB v3.0 Application Stop
echo ======================================
echo.

echo Stopping SceneryAddonsDB application...
echo.

REM Change to the parent directory for proper relative paths
cd /d "%~dp0.."

REM Run the PowerShell stop script
powershell -ExecutionPolicy Bypass -File "%~dp0stop-application.ps1"

if %errorLevel% neq 0 (
    echo.
    echo Application stop encountered errors!
    echo Check the error messages above for details.
    pause
    exit /b 1
)

echo.
echo Application stopped successfully!
echo.
pause
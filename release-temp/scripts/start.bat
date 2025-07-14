@echo off
setlocal enabledelayedexpansion

REM SceneryAddonsDB v3.0 Application Start Script
REM This batch file starts the SceneryAddonsDB application

echo ======================================
echo SceneryAddonsDB v3.0 Application Start
echo ======================================
echo.

REM Check if application directory exists
if not exist "%~dp0..\app\SceneryAddonsDB.exe" (
    echo ERROR: Application not found!
    echo Please ensure the application is properly installed.
    echo Expected location: %~dp0..\app\SceneryAddonsDB.exe
    pause
    exit /b 1
)

echo Starting SceneryAddonsDB application...
echo.

REM Change to the parent directory for proper relative paths
cd /d "%~dp0.."

REM Run the PowerShell start script
powershell -ExecutionPolicy Bypass -File "%~dp0start-application.ps1" -ApplicationPath ".\app\SceneryAddonsDB.exe"

if %errorLevel% neq 0 (
    echo.
    echo Application startup failed!
    echo Check the error messages above for details.
    pause
    exit /b 1
)

echo.
echo Application started successfully!
echo Open http://localhost:5000 in your browser to access the application.
echo.
pause
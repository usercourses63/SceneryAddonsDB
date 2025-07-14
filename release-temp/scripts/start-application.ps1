# SceneryAddonsDB v3.0 Application Startup Script
# This script starts the SceneryAddonsDB application with proper environment setup

param(
    [string]$ApplicationPath = ".\app\SceneryAddonsDB.exe",
    [string]$Environment = "Production",
    [switch]$CheckDependencies = $true,
    [switch]$ShowLogs = $false
)

Write-Host "======================================" -ForegroundColor Green
Write-Host "SceneryAddonsDB v3.0 Application Startup" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"

# Function to check if MongoDB service is running
function Test-MongoDBService {
    Write-Host "Checking MongoDB service..." -ForegroundColor Yellow
    
    $service = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
    
    if ($service) {
        if ($service.Status -eq "Running") {
            Write-Host "✓ MongoDB service is running" -ForegroundColor Green
            return $true
        } else {
            Write-Host "✗ MongoDB service is not running" -ForegroundColor Red
            Write-Host "  Attempting to start MongoDB service..." -ForegroundColor Yellow
            
            try {
                Start-Service -Name "MongoDB"
                Start-Sleep -Seconds 3
                
                $service = Get-Service -Name "MongoDB"
                if ($service.Status -eq "Running") {
                    Write-Host "✓ MongoDB service started successfully" -ForegroundColor Green
                    return $true
                } else {
                    Write-Host "✗ Failed to start MongoDB service" -ForegroundColor Red
                    return $false
                }
            }
            catch {
                Write-Host "✗ Error starting MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
                return $false
            }
        }
    } else {
        Write-Host "✗ MongoDB service not found" -ForegroundColor Red
        Write-Host "  Please run install-mongodb-service.ps1 first" -ForegroundColor Yellow
        return $false
    }
}

# Function to test MongoDB connection
function Test-MongoDBConnection {
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    
    $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe"
    if (!(Test-Path $mongoPath)) {
        $mongoPath = "C:\Program Files\MongoDB\Server\7.0\bin\mongo.exe"
    }
    
    if (Test-Path $mongoPath) {
        try {
            $result = & $mongoPath --eval "db.adminCommand('ping')" --quiet 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✓ MongoDB connection successful" -ForegroundColor Green
                return $true
            } else {
                Write-Host "✗ MongoDB connection failed" -ForegroundColor Red
                return $false
            }
        }
        catch {
            Write-Host "✗ Error testing MongoDB connection: $($_.Exception.Message)" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "Warning: MongoDB shell not found, skipping connection test" -ForegroundColor Yellow
        return $true
    }
}

# Function to check application files
function Test-ApplicationFiles {
    Write-Host "Checking application files..." -ForegroundColor Yellow
    
    if (!(Test-Path $ApplicationPath)) {
        Write-Host "✗ Application executable not found: $ApplicationPath" -ForegroundColor Red
        return $false
    }
    
    $appDir = Split-Path $ApplicationPath -Parent
    $requiredFiles = @(
        "wwwroot\index.html",
        "appsettings.json",
        "appsettings.Production.json"
    )
    
    foreach ($file in $requiredFiles) {
        $filePath = Join-Path $appDir $file
        if (!(Test-Path $filePath)) {
            Write-Host "✗ Required file not found: $file" -ForegroundColor Red
            return $false
        }
    }
    
    Write-Host "✓ All application files found" -ForegroundColor Green
    return $true
}

# Function to check if application is already running
function Test-ApplicationRunning {
    $processName = "SceneryAddonsDB"
    $processes = Get-Process -Name $processName -ErrorAction SilentlyContinue
    
    if ($processes) {
        Write-Host "Application is already running (PID: $($processes.Id -join ', '))" -ForegroundColor Yellow
        Write-Host "Do you want to stop the existing instance and start a new one? (y/n): " -NoNewline
        
        $response = Read-Host
        if ($response -eq 'y' -or $response -eq 'Y') {
            Write-Host "Stopping existing application instances..." -ForegroundColor Yellow
            $processes | Stop-Process -Force
            Start-Sleep -Seconds 2
            Write-Host "✓ Existing instances stopped" -ForegroundColor Green
        } else {
            Write-Host "Startup cancelled" -ForegroundColor Yellow
            return $false
        }
    }
    
    return $true
}

# Function to start the application
function Start-Application {
    Write-Host "Starting SceneryAddonsDB application..." -ForegroundColor Cyan
    
    $appDir = Split-Path $ApplicationPath -Parent
    $env:ASPNETCORE_ENVIRONMENT = $Environment
    
    try {
        if ($ShowLogs) {
            Write-Host "Starting application with live logs..." -ForegroundColor Yellow
            Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
            Write-Host ""
            
            # Start application in foreground with logs
            & $ApplicationPath
        } else {
            Write-Host "Starting application in background..." -ForegroundColor Yellow
            
            # Start application in background
            $process = Start-Process -FilePath $ApplicationPath -WorkingDirectory $appDir -PassThru -WindowStyle Hidden
            
            # Wait a moment for startup
            Start-Sleep -Seconds 5
            
            # Check if process is still running
            if (Get-Process -Id $process.Id -ErrorAction SilentlyContinue) {
                Write-Host "✓ Application started successfully (PID: $($process.Id))" -ForegroundColor Green
                Write-Host ""
                Write-Host "Application Details:" -ForegroundColor Cyan
                Write-Host "  URL: http://localhost:5000" -ForegroundColor White
                Write-Host "  Environment: $Environment" -ForegroundColor White
                Write-Host "  Process ID: $($process.Id)" -ForegroundColor White
                Write-Host "  Log Level: Information" -ForegroundColor White
                Write-Host ""
                Write-Host "Open http://localhost:5000 in your browser to access the application" -ForegroundColor Green
                Write-Host "Use stop-application.ps1 to stop the application gracefully" -ForegroundColor Yellow
            } else {
                Write-Host "✗ Application failed to start or crashed immediately" -ForegroundColor Red
                Write-Host "  Check the application logs for more information" -ForegroundColor Yellow
                return $false
            }
        }
    }
    catch {
        Write-Host "✗ Error starting application: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Function to show startup summary
function Show-StartupSummary {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "Startup Summary" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "SceneryAddonsDB v3.0 is now running!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Web Interface: http://localhost:5000" -ForegroundColor Cyan
    Write-Host "Environment: $Environment" -ForegroundColor Cyan
    Write-Host "Database: MongoDB (Windows Service)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Available Features:" -ForegroundColor Yellow
    Write-Host "• Browse and search flight simulator addons" -ForegroundColor White
    Write-Host "• Real-time scraping with progress updates" -ForegroundColor White
    Write-Host "• BitTorrent downloads with session management" -ForegroundColor White
    Write-Host "• Automatic file organization by compatibility" -ForegroundColor White
    Write-Host "• System tray integration" -ForegroundColor White
    Write-Host ""
    Write-Host "Management:" -ForegroundColor Yellow
    Write-Host "• View logs: Use -ShowLogs parameter" -ForegroundColor White
    Write-Host "• Stop application: Run stop-application.ps1" -ForegroundColor White
    Write-Host "• Restart: Run stop-application.ps1 then start-application.ps1" -ForegroundColor White
    Write-Host ""
}

# Main execution
try {
    if ($CheckDependencies) {
        Write-Host "Performing dependency checks..." -ForegroundColor Cyan
        
        if (!(Test-MongoDBService)) {
            Write-Host "MongoDB service check failed. Please install MongoDB service first." -ForegroundColor Red
            exit 1
        }
        
        if (!(Test-MongoDBConnection)) {
            Write-Host "MongoDB connection check failed. Please check MongoDB installation." -ForegroundColor Red
            exit 1
        }
        
        if (!(Test-ApplicationFiles)) {
            Write-Host "Application files check failed. Please check installation." -ForegroundColor Red
            exit 1
        }
        
        Write-Host "✓ All dependency checks passed" -ForegroundColor Green
        Write-Host ""
    }
    
    if (!(Test-ApplicationRunning)) {
        exit 1
    }
    
    if (Start-Application) {
        if (-not $ShowLogs) {
            Show-StartupSummary
        }
    } else {
        Write-Host "Application startup failed" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "Startup Failed" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}
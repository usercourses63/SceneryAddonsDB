# MongoDB Windows Service Uninstaller Script
# SceneryAddonsDB v3.0 Production Deployment
# This script removes MongoDB Windows service

param(
    [string]$ServiceName = "MongoDB",
    [string]$MongoInstallPath = "C:\Program Files\MongoDB\Server\7.0",
    [switch]$RemoveData = $false,
    [switch]$RemoveInstallation = $false
)

Write-Host "======================================" -ForegroundColor Red
Write-Host "SceneryAddonsDB v3.0 MongoDB Service Uninstaller" -ForegroundColor Red
Write-Host "======================================" -ForegroundColor Red

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Red
    exit 1
}

# Function to stop and remove MongoDB service
function Remove-MongoDBService {
    Write-Host "Checking for MongoDB service..." -ForegroundColor Yellow
    
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    
    if ($service) {
        Write-Host "Stopping MongoDB service..." -ForegroundColor Yellow
        
        try {
            Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
            Write-Host "MongoDB service stopped" -ForegroundColor Green
        }
        catch {
            Write-Host "Warning: Could not stop MongoDB service: $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        Write-Host "Removing MongoDB service..." -ForegroundColor Yellow
        
        $mongodPath = "$MongoInstallPath\bin\mongod.exe"
        if (Test-Path $mongodPath) {
            try {
                & $mongodPath --remove
                Write-Host "MongoDB service removed successfully" -ForegroundColor Green
            }
            catch {
                Write-Host "Warning: Could not remove MongoDB service: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "Warning: MongoDB executable not found at $mongodPath" -ForegroundColor Yellow
        }
    } else {
        Write-Host "MongoDB service not found" -ForegroundColor Green
    }
}

# Function to remove data directories
function Remove-DataDirectories {
    if ($RemoveData) {
        Write-Host "Removing MongoDB data directories..." -ForegroundColor Yellow
        
        $dataPaths = @(
            "C:\data\db",
            "C:\data\log"
        )
        
        foreach ($path in $dataPaths) {
            if (Test-Path $path) {
                try {
                    Remove-Item $path -Recurse -Force
                    Write-Host "Removed: $path" -ForegroundColor Green
                }
                catch {
                    Write-Host "Warning: Could not remove $path : $($_.Exception.Message)" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "Data directories preserved (use -RemoveData to remove)" -ForegroundColor Cyan
    }
}

# Function to remove MongoDB installation
function Remove-MongoDBInstallation {
    if ($RemoveInstallation) {
        Write-Host "Removing MongoDB installation..." -ForegroundColor Yellow
        
        if (Test-Path $MongoInstallPath) {
            try {
                Remove-Item $MongoInstallPath -Recurse -Force
                Write-Host "MongoDB installation removed: $MongoInstallPath" -ForegroundColor Green
            }
            catch {
                Write-Host "Warning: Could not remove MongoDB installation: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "MongoDB installation not found at $MongoInstallPath" -ForegroundColor Green
        }
    } else {
        Write-Host "MongoDB installation preserved (use -RemoveInstallation to remove)" -ForegroundColor Cyan
    }
}

# Main execution
Write-Host "Starting MongoDB service uninstall..." -ForegroundColor Cyan

Remove-MongoDBService
Remove-DataDirectories
Remove-MongoDBInstallation

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "MongoDB Service Uninstall Complete!" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""

if (-not $RemoveData) {
    Write-Host "Note: Database data preserved in C:\data\db" -ForegroundColor Cyan
    Write-Host "Use -RemoveData parameter to remove data directories" -ForegroundColor Cyan
}

if (-not $RemoveInstallation) {
    Write-Host "Note: MongoDB installation preserved in $MongoInstallPath" -ForegroundColor Cyan
    Write-Host "Use -RemoveInstallation parameter to remove installation" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "MongoDB service has been uninstalled." -ForegroundColor Green
# MongoDB Windows Service Installation Script
# SceneryAddonsDB v3.0 Production Deployment
# This script installs MongoDB as a Windows service for production use

param(
    [string]$MongoInstallPath = "C:\Program Files\MongoDB\Server\7.0",
    [string]$DataPath = "C:\data\db",
    [string]$LogPath = "C:\data\log",
    [string]$ServiceName = "MongoDB",
    [string]$Port = "27017"
)

Write-Host "======================================" -ForegroundColor Green
Write-Host "SceneryAddonsDB v3.0 MongoDB Service Installer" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Red
    exit 1
}

# Function to check if MongoDB is installed
function Test-MongoDBInstalled {
    return (Test-Path "$MongoInstallPath\bin\mongod.exe")
}

# Function to download and install MongoDB
function Install-MongoDB {
    Write-Host "Downloading MongoDB Community Server 7.0..." -ForegroundColor Yellow
    
    $downloadUrl = "https://fastdl.mongodb.org/windows/mongodb-windows-x86_64-7.0.14-signed.msi"
    $installerPath = "$env:TEMP\mongodb-installer.msi"
    
    try {
        Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
        Write-Host "MongoDB downloaded successfully" -ForegroundColor Green
        
        Write-Host "Installing MongoDB..." -ForegroundColor Yellow
        Start-Process -FilePath "msiexec.exe" -ArgumentList "/i `"$installerPath`" /quiet /norestart" -Wait
        
        Remove-Item $installerPath -Force
        Write-Host "MongoDB installation completed" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to download or install MongoDB: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to create MongoDB directories
function New-MongoDBDirectories {
    Write-Host "Creating MongoDB directories..." -ForegroundColor Yellow
    
    $directories = @($DataPath, $LogPath)
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
            Write-Host "Created directory: $dir" -ForegroundColor Green
        }
    }
}

# Function to create MongoDB configuration file
function New-MongoDBConfig {
    $configPath = "$MongoInstallPath\mongod.cfg"
    
    $configContent = @"
# MongoDB Configuration File for SceneryAddonsDB v3.0
# Generated: $(Get-Date)

systemLog:
  destination: file
  path: $LogPath\mongod.log
  logAppend: true
  logRotate: rename

storage:
  dbPath: $DataPath
  journal:
    enabled: true
  engine: wiredTiger
  wiredTiger:
    engineConfig:
      journalCompressor: snappy
    collectionConfig:
      blockCompressor: snappy
    indexConfig:
      prefixCompression: true

net:
  port: $Port
  bindIp: 127.0.0.1,::1
  maxIncomingConnections: 1000

security:
  authorization: disabled

operationProfiling:
  slowOpThresholdMs: 100
  mode: slowOp

replication:
  replSetName: ""

processManagement:
  windowsService:
    serviceName: $ServiceName
    displayName: "MongoDB Database Service (SceneryAddonsDB)"
    description: "MongoDB database service for SceneryAddonsDB application"
    serviceUser: ""
    servicePassword: ""
"@

    Write-Host "Creating MongoDB configuration file..." -ForegroundColor Yellow
    $configContent | Out-File -FilePath $configPath -Encoding UTF8
    Write-Host "Configuration file created: $configPath" -ForegroundColor Green
}

# Function to install MongoDB as Windows service
function Install-MongoDBService {
    Write-Host "Installing MongoDB as Windows service..." -ForegroundColor Yellow
    
    $mongodPath = "$MongoInstallPath\bin\mongod.exe"
    $configPath = "$MongoInstallPath\mongod.cfg"
    
    if (!(Test-Path $mongodPath)) {
        Write-Host "ERROR: MongoDB executable not found at $mongodPath" -ForegroundColor Red
        exit 1
    }
    
    # Install the service
    & $mongodPath --config $configPath --install
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "MongoDB service installed successfully" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Failed to install MongoDB service" -ForegroundColor Red
        exit 1
    }
}

# Function to start MongoDB service
function Start-MongoDBService {
    Write-Host "Starting MongoDB service..." -ForegroundColor Yellow
    
    try {
        Start-Service -Name $ServiceName
        Write-Host "MongoDB service started successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "ERROR: Failed to start MongoDB service: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to test MongoDB connection
function Test-MongoDBConnection {
    Write-Host "Testing MongoDB connection..." -ForegroundColor Yellow
    
    $mongoPath = "$MongoInstallPath\bin\mongosh.exe"
    
    if (!(Test-Path $mongoPath)) {
        $mongoPath = "$MongoInstallPath\bin\mongo.exe"
    }
    
    if (Test-Path $mongoPath) {
        $testResult = & $mongoPath --eval "db.adminCommand('ping')" --quiet 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "MongoDB connection test successful" -ForegroundColor Green
            return $true
        } else {
            Write-Host "MongoDB connection test failed" -ForegroundColor Red
            return $false
        }
    } else {
        Write-Host "WARNING: MongoDB shell not found, skipping connection test" -ForegroundColor Yellow
        return $true
    }
}

# Main execution
Write-Host "Starting MongoDB installation process..." -ForegroundColor Cyan

# Check if MongoDB is already installed
if (Test-MongoDBInstalled) {
    Write-Host "MongoDB is already installed at $MongoInstallPath" -ForegroundColor Green
} else {
    Install-MongoDB
}

# Create directories
New-MongoDBDirectories

# Create configuration
New-MongoDBConfig

# Check if service already exists
$existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue

if ($existingService) {
    Write-Host "MongoDB service already exists. Stopping and removing..." -ForegroundColor Yellow
    Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
    
    $mongodPath = "$MongoInstallPath\bin\mongod.exe"
    & $mongodPath --remove
}

# Install and start service
Install-MongoDBService
Start-MongoDBService

# Test connection
if (Test-MongoDBConnection) {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "MongoDB Service Installation Complete!" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Service Details:" -ForegroundColor Cyan
    Write-Host "  Service Name: $ServiceName" -ForegroundColor White
    Write-Host "  Port: $Port" -ForegroundColor White
    Write-Host "  Data Path: $DataPath" -ForegroundColor White
    Write-Host "  Log Path: $LogPath" -ForegroundColor White
    Write-Host "  Connection String: mongodb://localhost:$Port" -ForegroundColor White
    Write-Host ""
    Write-Host "MongoDB is now ready for SceneryAddonsDB v3.0!" -ForegroundColor Green
} else {
    Write-Host "ERROR: MongoDB installation completed but connection test failed" -ForegroundColor Red
    exit 1
}
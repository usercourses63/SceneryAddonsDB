# SceneryAddonsDB v3.0 Production Build Script (Simplified)
# This script builds a complete production-ready deployment package

param(
    [string]$OutputPath = ".\publish",
    [string]$Configuration = "Release"
)

Write-Host "======================================" -ForegroundColor Green
Write-Host "SceneryAddonsDB v3.0 Production Build" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"
$StartTime = Get-Date
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$PublishPath = Join-Path $ProjectRoot $OutputPath

Write-Host "Project Root: $ProjectRoot" -ForegroundColor Cyan
Write-Host "Publish Path: $PublishPath" -ForegroundColor Cyan
Write-Host ""

# Clean and create output directory
Write-Host ">>> Cleaning output directory..." -ForegroundColor Cyan
if (Test-Path $PublishPath) {
    Remove-Item $PublishPath -Recurse -Force
}

$directories = @(
    $PublishPath,
    "$PublishPath\app",
    "$PublishPath\scripts",
    "$PublishPath\docs",
    "$PublishPath\config"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}
Write-Host "✓ Output directory prepared" -ForegroundColor Green

# Build frontend
Write-Host ""
Write-Host ">>> Building frontend..." -ForegroundColor Cyan
$FrontendPath = Join-Path $ProjectRoot "frontend"
Push-Location $FrontendPath

Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
npm ci --silent

Write-Host "Building frontend for production..." -ForegroundColor Yellow
npm run build

Pop-Location
Write-Host "✓ Frontend build completed" -ForegroundColor Green

# Publish .NET API
Write-Host ""
Write-Host ">>> Publishing .NET API..." -ForegroundColor Cyan
$ApiProjectPath = Join-Path $ProjectRoot "src\Addons.Api\Addons.Api.csproj"
$ApiOutputPath = Join-Path $PublishPath "app"

Write-Host "Publishing self-contained API..." -ForegroundColor Yellow
dotnet publish $ApiProjectPath --configuration $Configuration --output $ApiOutputPath --self-contained true --runtime win-x64 --property:PublishSingleFile=true --property:PublishTrimmed=false --property:IncludeNativeLibrariesForSelfExtract=true --property:EnableCompressionInSingleFile=true --verbosity minimal

Write-Host "✓ API published successfully" -ForegroundColor Green

# Copy frontend build
Write-Host ""
Write-Host ">>> Copying frontend build..." -ForegroundColor Cyan
$FrontendDistPath = Join-Path $ProjectRoot "frontend\dist"
$FrontendOutputPath = Join-Path $PublishPath "app\wwwroot"

if (Test-Path $FrontendOutputPath) {
    Remove-Item $FrontendOutputPath -Recurse -Force
}

Copy-Item $FrontendDistPath $FrontendOutputPath -Recurse -Force
Write-Host "✓ Frontend build copied" -ForegroundColor Green

# Copy deployment scripts
Write-Host ""
Write-Host ">>> Copying deployment scripts..." -ForegroundColor Cyan
$ScriptsOutputPath = Join-Path $PublishPath "scripts"

$scriptFiles = @(
    "install-mongodb-service.ps1",
    "uninstall-mongodb-service.ps1", 
    "start-application.ps1",
    "stop-application.ps1",
    "install.bat",
    "uninstall.bat",
    "start.bat",
    "stop.bat"
)

foreach ($script in $scriptFiles) {
    $sourcePath = Join-Path $ProjectRoot "scripts\$script"
    $destPath = Join-Path $ScriptsOutputPath $script
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✓ Copied $script" -ForegroundColor Green
    }
}

# Copy configuration files
Write-Host ""
Write-Host ">>> Copying configuration files..." -ForegroundColor Cyan
$ConfigOutputPath = Join-Path $PublishPath "config"

$productionConfig = Join-Path $ProjectRoot "src\Addons.Api\appsettings.Production.json"
if (Test-Path $productionConfig) {
    Copy-Item $productionConfig "$ConfigOutputPath\appsettings.Production.json" -Force
    Write-Host "✓ Copied production configuration" -ForegroundColor Green
}

$exampleConfig = Join-Path $ProjectRoot "src\Addons.Api\appsettings.json"
if (Test-Path $exampleConfig) {
    Copy-Item $exampleConfig "$ConfigOutputPath\appsettings.example.json" -Force
    Write-Host "✓ Copied example configuration" -ForegroundColor Green
}

# Copy documentation
Write-Host ""
Write-Host ">>> Copying documentation..." -ForegroundColor Cyan
$DocsOutputPath = Join-Path $PublishPath "docs"

$docFiles = @(
    "README.md",
    "CHANGELOG.md",
    "BUILD_SUMMARY.md"
)

foreach ($doc in $docFiles) {
    $sourcePath = Join-Path $ProjectRoot $doc
    $destPath = Join-Path $DocsOutputPath $doc
    
    if (Test-Path $sourcePath) {
        Copy-Item $sourcePath $destPath -Force
        Write-Host "✓ Copied $doc" -ForegroundColor Green
    }
}

# Copy docs directory
$docsDir = Join-Path $ProjectRoot "docs"
if (Test-Path $docsDir) {
    Copy-Item "$docsDir\*" $DocsOutputPath -Recurse -Force
    Write-Host "✓ Copied docs directory" -ForegroundColor Green
}
}

# Create deployment manifest
Write-Host ""
Write-Host ">>> Creating deployment manifest..." -ForegroundColor Cyan
$manifestPath = Join-Path $PublishPath "DEPLOYMENT_MANIFEST.json"

$manifest = @{
    Name = "SceneryAddonsDB"
    Version = "3.0.0"
    BuildDate = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
    BuildConfiguration = $Configuration
    Platform = "win-x64"
    Runtime = "self-contained"
    Requirements = @{
        OS = "Windows 10/11 or Windows Server 2016+"
        RAM = "4GB minimum, 8GB recommended"
        Storage = "1GB for application, additional space for downloads"
        Network = "Internet connection required"
    }
    Components = @{
        API = @{
            Framework = ".NET 9"
            Runtime = "Self-contained"
            Port = 5000
        }
        Frontend = @{
            Framework = "React 18 + TypeScript"
            BuildTool = "Vite"
            Bundled = $true
        }
        Database = @{
            Type = "MongoDB"
            Version = "7.0+"
            Installation = "Windows Service"
            Port = 27017
        }
    }
    Installation = @{
        MongoDB = "Run scripts\install-mongodb-service.ps1 as Administrator"
        Application = "Run scripts\install.bat as Administrator"
        Startup = "Run scripts\start.bat"
    }
    Files = @{
        Application = "app\SceneryAddonsDB.exe"
        Frontend = "app\wwwroot\"
        Scripts = "scripts\"
        Configuration = "config\"
        Documentation = "docs\"
    }
}

$manifest | ConvertTo-Json -Depth 10 | Out-File $manifestPath -Encoding UTF8
Write-Host "✓ Deployment manifest created" -ForegroundColor Green

# Create archive
Write-Host ""
Write-Host ">>> Creating deployment archive..." -ForegroundColor Cyan
$archivePath = Join-Path $ProjectRoot "SceneryAddonsDB-v3.0.0-Production.zip"

if (Test-Path $archivePath) {
    Remove-Item $archivePath -Force
}

Compress-Archive -Path "$PublishPath\*" -DestinationPath $archivePath -CompressionLevel Optimal

$archiveSize = (Get-Item $archivePath).Length / 1MB
Write-Host "✓ Deployment archive created: $archivePath ($([Math]::Round($archiveSize, 2)) MB)" -ForegroundColor Green

# Show summary
$EndTime = Get-Date
$Duration = $EndTime - $StartTime

Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "Build Summary" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "Status: SUCCESS" -ForegroundColor Green
Write-Host "Duration: $($Duration.ToString('mm\:ss'))" -ForegroundColor Cyan
Write-Host "Output Path: $PublishPath" -ForegroundColor Cyan
Write-Host "Archive: SceneryAddonsDB-v3.0.0-Production.zip" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Run scripts\install-mongodb-service.ps1 as Administrator" -ForegroundColor White
Write-Host "2. Run scripts\install.bat as Administrator" -ForegroundColor White
Write-Host "3. Run scripts\start.bat to start the application" -ForegroundColor White
Write-Host "4. Open http://localhost:5000 in your browser" -ForegroundColor White
Write-Host ""
Write-Host "SceneryAddonsDB v3.0 is ready for production deployment!" -ForegroundColor Green
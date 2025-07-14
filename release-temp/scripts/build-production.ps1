# SceneryAddonsDB v3.0 Production Build Script
# This script builds a complete production-ready deployment package

param(
    [string]$OutputPath = ".\publish",
    [string]$Configuration = "Release",
    [switch]$SkipTests = $false,
    [switch]$CleanOutput = $true
)

Write-Host "======================================" -ForegroundColor Green
Write-Host "SceneryAddonsDB v3.0 Production Build" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

$ErrorActionPreference = "Stop"
$StartTime = Get-Date
$ProjectRoot = Split-Path $PSScriptRoot -Parent
$PublishPath = Join-Path $ProjectRoot $OutputPath

# Function to Write-Progress with color
function Write-BuildStep {
    param($Message, $Color = "Cyan")
    Write-Host ""
    Write-Host ">>> $Message" -ForegroundColor $Color
    Write-Host ""
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-BuildStep "Checking prerequisites..." "Yellow"
    
    # Check .NET SDK
    try {
        $dotnetVersion = dotnet --version
        Write-Host "✓ .NET SDK: $dotnetVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ .NET SDK not found. Please install .NET 9 SDK." -ForegroundColor Red
        exit 1
    }
    
    # Check Node.js
    try {
        $nodeVersion = node --version
        Write-Host "✓ Node.js: $nodeVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Node.js not found. Please install Node.js 18 or later." -ForegroundColor Red
        exit 1
    }
    
    # Check npm
    try {
        $npmVersion = npm --version
        Write-Host "✓ npm: $npmVersion" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ npm not found. Please install npm." -ForegroundColor Red
        exit 1
    }
}

# Function to clean output directory
function Clear-OutputDirectory {
    if ($CleanOutput -and (Test-Path $PublishPath)) {
        Write-BuildStep "Cleaning output directory..." "Yellow"
        Remove-Item $PublishPath -Recurse -Force
        Write-Host "✓ Output directory cleaned" -ForegroundColor Green
    }
    
    # Create output directory structure
    $directories = @(
        $PublishPath,
        "$PublishPath\app",
        "$PublishPath\scripts",
        "$PublishPath\docs",
        "$PublishPath\config"
    )
    
    foreach ($dir in $directories) {
        if (!(Test-Path $dir)) {
            New-Item -ItemType Directory -Path $dir -Force | Out-Null
        }
    }
}

# Function to build frontend
function Build-Frontend {
    Write-BuildStep "Building frontend..." "Cyan"
    
    $FrontendPath = Join-Path $ProjectRoot "frontend"
    Push-Location $FrontendPath
    
    try {
        Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
        npm ci --silent
        
        Write-Host "Building frontend for production..." -ForegroundColor Yellow
        npm run build
        
        Write-Host "✓ Frontend build completed" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Frontend build failed: $($_.Exception.Message)" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    finally {
        Pop-Location
    }
}

# Function to run tests
function Invoke-Tests {
    if ($SkipTests) {
        Write-Host "Skipping tests..." -ForegroundColor Yellow
        return
    }
    
    Write-BuildStep "Running tests..." "Cyan"
    
    try {
        dotnet test "$ProjectRoot\SceneryAddons.sln" --configuration $Configuration --verbosity minimal
        Write-Host "✓ All tests passed" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Tests failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to publish .NET API
function Publish-API {
    Write-BuildStep "Publishing .NET API..." "Cyan"
    
    $ApiProjectPath = Join-Path $ProjectRoot "src\Addons.Api\Addons.Api.csproj"
    $ApiOutputPath = Join-Path $PublishPath "app"
    
    try {
        Write-Host "Publishing self-contained API..." -ForegroundColor Yellow
        
        dotnet publish $ApiProjectPath `
            --configuration $Configuration `
            --output $ApiOutputPath `
            --self-contained true `
            --runtime win-x64 `
            --property:PublishSingleFile=true `
            --property:PublishTrimmed=false `
            --property:IncludeNativeLibrariesForSelfExtract=true `
            --property:EnableCompressionInSingleFile=true `
            --verbosity minimal
        
        Write-Host "✓ API published successfully" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ API publish failed: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to copy frontend build
function Copy-FrontendBuild {
    Write-BuildStep "Copying frontend build..." "Cyan"
    
    $FrontendDistPath = Join-Path $ProjectRoot "frontend\dist"
    $FrontendOutputPath = Join-Path $PublishPath "app\wwwroot"
    
    if (!(Test-Path $FrontendDistPath)) {
        Write-Host "✗ Frontend build not found at $FrontendDistPath" -ForegroundColor Red
        exit 1
    }
    
    try {
        if (Test-Path $FrontendOutputPath) {
            Remove-Item $FrontendOutputPath -Recurse -Force
        }
        
        Copy-Item $FrontendDistPath $FrontendOutputPath -Recurse -Force
        Write-Host "✓ Frontend build copied to $FrontendOutputPath" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to copy frontend build: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to copy deployment scripts
function Copy-DeploymentScripts {
    Write-BuildStep "Copying deployment scripts..." "Cyan"
    
    $ScriptsOutputPath = Join-Path $PublishPath "scripts"
    
    # Copy PowerShell scripts
    $scriptFiles = @(
        "install-mongodb-service.ps1",
        "uninstall-mongodb-service.ps1",
        "start-application.ps1",
        "stop-application.ps1"
    )
    
    foreach ($script in $scriptFiles) {
        $sourcePath = Join-Path $ProjectRoot "scripts\$script"
        $destPath = Join-Path $ScriptsOutputPath $script
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $destPath -Force
            Write-Host "✓ Copied $script" -ForegroundColor Green
        }
    }
    
    # Copy batch files
    $batchFiles = @(
        "install.bat",
        "uninstall.bat",
        "start.bat",
        "stop.bat"
    )
    
    foreach ($batch in $batchFiles) {
        $sourcePath = Join-Path $ProjectRoot "scripts\$batch"
        $destPath = Join-Path $ScriptsOutputPath $batch
        
        if (Test-Path $sourcePath) {
            Copy-Item $sourcePath $destPath -Force
            Write-Host "✓ Copied $batch" -ForegroundColor Green
        }
    }
}

# Function to copy configuration files
function Copy-ConfigurationFiles {
    Write-BuildStep "Copying configuration files..." "Cyan"
    
    $ConfigOutputPath = Join-Path $PublishPath "config"
    
    # Copy production configuration
    $productionConfig = Join-Path $ProjectRoot "src\Addons.Api\appsettings.Production.json"
    if (Test-Path $productionConfig) {
        Copy-Item $productionConfig "$ConfigOutputPath\appsettings.Production.json" -Force
        Write-Host "✓ Copied production configuration" -ForegroundColor Green
    }
    
    # Copy example configuration
    $exampleConfig = Join-Path $ProjectRoot "src\Addons.Api\appsettings.json"
    if (Test-Path $exampleConfig) {
        Copy-Item $exampleConfig "$ConfigOutputPath\appsettings.example.json" -Force
        Write-Host "✓ Copied example configuration" -ForegroundColor Green
    }
}

# Function to copy documentation
function Copy-Documentation {
    Write-BuildStep "Copying documentation..." "Cyan"
    
    $DocsOutputPath = Join-Path $PublishPath "docs"
    
    # Copy documentation files
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
    
    # Copy docs directory if it exists
    $docsDir = Join-Path $ProjectRoot "docs"
    if (Test-Path $docsDir) {
        Copy-Item "$docsDir\*" $DocsOutputPath -Recurse -Force
        Write-Host "✓ Copied docs directory" -ForegroundColor Green
    }
}

# Function to create deployment manifest
function New-DeploymentManifest {
    Write-BuildStep "Creating deployment manifest..." "Cyan"
    
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
}

# Function to create archive
function New-DeploymentArchive {
    Write-BuildStep "Creating deployment archive..." "Cyan"
    
    $archivePath = Join-Path $ProjectRoot "SceneryAddonsDB-v3.0.0-Production.zip"
    
    try {
        if (Test-Path $archivePath) {
            Remove-Item $archivePath -Force
        }
        
        Compress-Archive -Path "$PublishPath\*" -DestinationPath $archivePath -CompressionLevel Optimal
        
        $archiveSize = (Get-Item $archivePath).Length / 1MB
        Write-Host "✓ Deployment archive created: $archivePath ($([Math]::Round($archiveSize, 2)) MB)" -ForegroundColor Green
    }
    catch {
        Write-Host "✗ Failed to create archive: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Function to display summary
function Show-BuildSummary {
    $EndTime = Get-Date
    $Duration = $EndTime - $StartTime
    
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Green
    Write-Host "Build Summary" -ForegroundColor Green
    Write-Host "======================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Status: " -NoNewline
    Write-Host "SUCCESS" -ForegroundColor Green
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
}

# Main execution
try {
    Test-Prerequisites
    Clear-OutputDirectory
    Build-Frontend
    Invoke-Tests
    Publish-API
    Copy-FrontendBuild
    Copy-DeploymentScripts
    Copy-ConfigurationFiles
    Copy-Documentation
    New-DeploymentManifest
    New-DeploymentArchive
    Show-BuildSummary
}
catch {
    Write-Host ""
    Write-Host "======================================" -ForegroundColor Red
    Write-Host "Build Failed" -ForegroundColor Red
    Write-Host "======================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    exit 1
}
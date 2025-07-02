# SceneryAddonsDB v2.0.0 Release Publishing Script
# Publishes both API and Console applications with download support

param(
    [string]$Version = "2.0.0",
    [string]$OutputDir = "publish-v2",
    [switch]$SkipBuild = $false
)

Write-Host "🚀 Publishing SceneryAddonsDB v$Version with Download Management" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan

# Set error action preference
$ErrorActionPreference = "Stop"

# Get script directory and project root
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$OutputPath = Join-Path $ProjectRoot $OutputDir

Write-Host "📁 Project Root: $ProjectRoot" -ForegroundColor Yellow
Write-Host "📁 Output Directory: $OutputPath" -ForegroundColor Yellow

# Clean output directory
if (Test-Path $OutputPath) {
    Write-Host "🧹 Cleaning existing output directory..." -ForegroundColor Yellow
    Remove-Item -Path $OutputPath -Recurse -Force
}

New-Item -Path $OutputPath -ItemType Directory -Force | Out-Null

# Build projects if not skipping
if (-not $SkipBuild) {
    Write-Host "🔨 Building solution..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    dotnet build --configuration Release --verbosity minimal
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed"
    }
}

# Define publish configurations
$PublishConfigs = @(
    @{
        Name = "API"
        Project = "src/Addons.Api/Addons.Api.csproj"
        OutputSubDir = "api"
        Description = "Web API with Download Management"
        Executable = "Addons.Api.exe"
    },
    @{
        Name = "Console"
        Project = "src/Addons.Console/Addons.Console.csproj"
        OutputSubDir = "console"
        Description = "Console Application with Download Support"
        Executable = "Addons.Console.exe"
    }
)

# Publish each configuration
foreach ($config in $PublishConfigs) {
    Write-Host "📦 Publishing $($config.Name) ($($config.Description))..." -ForegroundColor Green
    
    $projectOutputPath = Join-Path $OutputPath $config.OutputSubDir
    
    # Publish as self-contained executable
    dotnet publish $config.Project `
        --configuration Release `
        --output $projectOutputPath `
        --self-contained true `
        --runtime win-x64 `
        --verbosity minimal `
        /p:PublishSingleFile=true `
        /p:IncludeNativeLibrariesForSelfExtract=true `
        /p:PublishTrimmed=false
    
    if ($LASTEXITCODE -ne 0) {
        throw "Publish failed for $($config.Name)"
    }
    
    # Verify executable exists
    $exePath = Join-Path $projectOutputPath $config.Executable
    if (-not (Test-Path $exePath)) {
        throw "Executable not found: $exePath"
    }
    
    # Get file size
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "   ✅ Published: $($config.Executable) ($fileSize MB)" -ForegroundColor Green
}

# Create documentation and release notes
Write-Host "📝 Creating release documentation..." -ForegroundColor Yellow

# Copy README and CHANGELOG
Copy-Item -Path (Join-Path $ProjectRoot "README.md") -Destination $OutputPath
Copy-Item -Path (Join-Path $ProjectRoot "CHANGELOG.md") -Destination $OutputPath

# Create release notes
$releaseNotes = @"
# SceneryAddonsDB v$Version - Download Management Release

## 🎉 Major Release: Real BitTorrent Downloads

This release transforms SceneryAddonsDB from a data management tool into a complete addon download solution for the Microsoft Flight Simulator community.

## 🧲 New Download Features

### **Real BitTorrent Downloads**
* Download actual addon files (2+ GB .rar files) using MonoTorrent 3.0.2
* Automatic magnet link extraction from SceneryAddons.org
* Real-time progress monitoring and speed tracking

### **Concurrent Download Management**
* Configurable concurrent downloads (1-10 per session)
* Multiple download sessions running simultaneously
* Global concurrency control and queue management

### **Automatic File Organization**
* Files organized by MSFS compatibility:
  * Downloads/2020/ for MSFS 2020 only addons
  * Downloads/2024/ for MSFS 2024 only addons
  * Downloads/2020-2024/ for Compatible with both versions
  * Downloads/Other/ for Unknown compatibility

### **Enhanced API Endpoints**
* POST /api/downloads/start for Start download sessions
* GET /api/downloads/sessions/{id}/status for Monitor progress
* GET /api/downloads/sessions for List all sessions
* GET /api/downloads/stats for Download statistics
* GET /api/downloads/folders for View downloaded files

## 📦 What's Included

### **API Application** (api/Addons.Api.exe)
* Complete Web API with download management
* Swagger documentation at http://localhost:5269/swagger
* MongoDB integration with automated Docker management
* Background scraping and download processing

### **Console Application** (console/Addons.Console.exe)
* Command-line interface with download support
* Real-time progress display
* Configurable concurrency and filtering options

## 🚀 Quick Start

### API Usage
```bash
# Start the API
./api/Addons.Api.exe

# Start downloads via API
curl -X POST "http://localhost:5269/api/downloads/start" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "maxConcurrency": 3}'
```

### Console Usage
```bash
# Download 5 latest addons automatically
./console/Addons.Console.exe -c 5 -a

# Download with custom concurrency
./console/Addons.Console.exe -c 10 -a --concurrency 3

# Filter by MSFS 2024 and download
./console/Addons.Console.exe -c 5 -a --compatibility "MSFS 2024"
```

## 🔧 Configuration

The API uses `appsettings.json` for configuration:
```json
{
  "DownloadSettings": {
    "BaseDownloadPath": "Downloads",
    "MaxGlobalConcurrency": 5,
    "DownloadTimeoutMinutes": 30,
    "OrganizeByCompatibility": true,
    "SkipExistingFiles": true
  }
}
```

## 📊 Performance

* Download Speeds: 1+ MB/s combined speeds with concurrent downloads
* File Sizes: Successfully downloads 2+ GB addon files
* Success Rate: High success rate with robust error handling
* Concurrency: Up to 10 concurrent downloads per session

## 🎯 Use Cases

* Flight Sim Enthusiasts: Bulk download and organize addons automatically
* Developers: Integrate download functionality via REST API
* Content Creators: Automate addon collection workflows

## 🔄 Migration from v1.x

* All existing API endpoints remain unchanged
* Add DownloadSettings section to configuration
* New download endpoints are additive features

## 📞 Support

- GitHub Issues: https://github.com/usercourses63/SceneryAddonsDB/issues
- Documentation: See README.md and CHANGELOG.md

---

**Happy Flying with Real Addon Downloads!** ✈️🎮🧲
"@

$releaseNotes | Out-File -FilePath (Join-Path $OutputPath "RELEASE-NOTES.md") -Encoding UTF8

# Create usage instructions
$usageInstructions = @"
# SceneryAddonsDB v$Version - Usage Instructions

## 📦 Package Contents

* api/ for Web API application with download management
* console/ for Console application with download support
* README.md for Complete documentation
* CHANGELOG.md for Version history and changes
* RELEASE-NOTES.md for This release information

## 🚀 Getting Started

### 1. API Application

```bash
# Navigate to API directory
cd api

# Run the API (will auto-manage MongoDB via Docker)
./Addons.Api.exe
```

The API will be available at:
* Main API: http://localhost:5269
* Swagger Docs: http://localhost:5269/swagger

### 2. Console Application

```bash
# Navigate to console directory
cd console

# Download 5 latest addons automatically
./Addons.Console.exe -c 5 -a

# Show help for all options
./Addons.Console.exe --help
```

## 🧲 Download Examples

### API Downloads
```bash
# Start download session
curl -X POST "http://localhost:5269/api/downloads/start" \
  -H "Content-Type: application/json" \
  -d '{"count": 5, "maxConcurrency": 3, "compatibility": "MSFS 2024"}'

# Monitor progress (replace {sessionId} with actual ID)
curl -X GET "http://localhost:5269/api/downloads/sessions/{sessionId}/status"

# Get download statistics
curl -X GET "http://localhost:5269/api/downloads/stats"
```

### Console Downloads
```bash
# Basic download
./Addons.Console.exe -c 5 -a

# Advanced options
./Addons.Console.exe -c 10 -a --concurrency 3 --compatibility "MSFS 2024"

# View without downloading
./Addons.Console.exe -c 10 -d
```

## 📁 File Organization

Downloads are automatically organized:

Downloads/
├── 2020/           # MSFS 2020 only addons
├── 2024/           # MSFS 2024 only addons
├── 2020-2024/      # Compatible with both versions
└── Other/          # Unknown compatibility

## 🔧 Configuration

### API Configuration (appsettings.json)
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "SceneryAddonsDB"
  },
  "DownloadSettings": {
    "BaseDownloadPath": "Downloads",
    "MaxGlobalConcurrency": 5,
    "DownloadTimeoutMinutes": 30,
    "OrganizeByCompatibility": true,
    "SkipExistingFiles": true
  }
}
```

## 📋 Prerequisites

* Windows 10/11 (x64)
* Docker Desktop (for MongoDB - will be auto-managed)
* Internet Connection (for downloading addons)

## 🎯 Key Features

- ✅ Real BitTorrent downloads (2+ GB files)
- ✅ Concurrent download management
- ✅ Automatic file organization by compatibility
- ✅ Real-time progress monitoring
- ✅ RESTful API with Swagger documentation
- ✅ Command-line interface
- ✅ MongoDB integration with Docker management

## 📞 Support

For issues or questions:
1. Check the README.md for detailed documentation
2. Review CHANGELOG.md for version-specific information
3. Open an issue on GitHub: https://github.com/usercourses63/SceneryAddonsDB/issues

---

**Version**: $Version  
**Build Date**: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss UTC')  
**Platform**: Windows x64
"@

$usageInstructions | Out-File -FilePath (Join-Path $OutputPath "USAGE.md") -Encoding UTF8

# Create version info file
$versionInfo = @{
    Version = $Version
    BuildDate = Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ'
    Platform = "win-x64"
    Features = @(
        "Real BitTorrent Downloads",
        "Concurrent Download Management", 
        "Automatic File Organization",
        "RESTful API with Swagger",
        "Console Application",
        "MongoDB Integration",
        "Docker Management"
    )
    Components = @{
        API = @{
            Executable = "Addons.Api.exe"
            Description = "Web API with download management"
            Port = 5269
        }
        Console = @{
            Executable = "Addons.Console.exe"
            Description = "Console application with download support"
        }
    }
}

$versionInfo | ConvertTo-Json -Depth 3 | Out-File -FilePath (Join-Path $OutputPath "version.json") -Encoding UTF8

# Display summary
Write-Host ""
Write-Host "🎉 Publishing completed successfully!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan
Write-Host "📦 Output Directory: $OutputPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Published Applications:" -ForegroundColor Green

foreach ($config in $PublishConfigs) {
    $exePath = Join-Path $OutputPath "$($config.OutputSubDir)/$($config.Executable)"
    $fileSize = [math]::Round((Get-Item $exePath).Length / 1MB, 2)
    Write-Host "   • $($config.Name): $($config.OutputSubDir)/$($config.Executable) ($fileSize MB)" -ForegroundColor White
}

Write-Host ""
Write-Host "📝 Documentation:" -ForegroundColor Green
Write-Host "   • README.md - Complete documentation" -ForegroundColor White
Write-Host "   • CHANGELOG.md - Version history" -ForegroundColor White
Write-Host "   • RELEASE-NOTES.md - Release information" -ForegroundColor White
Write-Host "   • USAGE.md - Quick start guide" -ForegroundColor White
Write-Host "   • version.json - Version metadata" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Ready for release v$Version!" -ForegroundColor Green
Write-Host "===============================================================================" -ForegroundColor Cyan

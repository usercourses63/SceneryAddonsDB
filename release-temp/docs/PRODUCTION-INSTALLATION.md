# SceneryAddonsDB v3.0 Production Installation Guide

## Overview

SceneryAddonsDB v3.0 is a comprehensive flight simulator scenery addon management system featuring:
- **MongoDB Windows Service**: Replaces Docker with native Windows service installation
- **Self-contained .NET 9 Application**: Single-file deployment with all dependencies
- **React TypeScript Frontend**: Modern web interface with real-time updates
- **BitTorrent Download System**: Automated addon downloading with session management
- **System Tray Integration**: Background operation with system tray controls

## System Requirements

### Minimum Requirements
- **Operating System**: Windows 10 (version 1903 or later) or Windows 11
- **Processor**: Intel/AMD 64-bit processor (x64 architecture)
- **Memory**: 4 GB RAM minimum, 8 GB recommended
- **Storage**: 1 GB for application, additional space for addon downloads
- **Network**: Broadband internet connection

### Recommended Requirements
- **Operating System**: Windows 11 (latest updates)
- **Processor**: Intel Core i5 8th gen or AMD Ryzen 5 3600 or better
- **Memory**: 16 GB RAM or more
- **Storage**: SSD with 100+ GB free space for addon downloads
- **Network**: High-speed broadband (50+ Mbps recommended)

## Pre-Installation Checklist

### 1. Administrator Privileges
- Ensure you have Administrator access to the Windows system
- MongoDB service installation requires Administrator privileges
- Some operations may require elevated permissions

### 2. Windows Updates
- Install latest Windows updates
- Ensure .NET runtime components are up to date
- Verify Windows Defender or antivirus exclusions if needed

### 3. Firewall Configuration
- Application uses port 5000 (HTTP) and 27017 (MongoDB)
- Windows Firewall may prompt for access during first run
- Consider adding firewall exceptions for optimal performance

### 4. Antivirus Software
- Add application folder to antivirus exclusions
- MongoDB data directory should be excluded from real-time scanning
- BitTorrent downloads may trigger false positives

## Installation Steps

### Step 1: Extract Installation Package

1. **Download Release Package**
   - Download `SceneryAddonsDB-v3.0.0-Production.zip`
   - Extract to a permanent location (e.g., `C:\SceneryAddonsDB`)
   - Do not run from temporary directories

2. **Verify Package Contents**
   ```
   SceneryAddonsDB-v3.0/
   ├── app/                          # Application binaries
   │   ├── SceneryAddonsDB.exe       # Main application executable
   │   ├── wwwroot/                  # Frontend web interface
   │   └── appsettings.json          # Application configuration
   ├── scripts/                      # Installation and management scripts
   │   ├── install-mongodb-service.ps1
   │   ├── install.bat
   │   ├── start.bat
   │   ├── stop.bat
   │   └── uninstall.bat
   ├── config/                       # Configuration files
   │   ├── appsettings.Production.json
   │   └── appsettings.example.json
   ├── docs/                         # Documentation
   └── DEPLOYMENT_MANIFEST.json      # Installation manifest
   ```

### Step 2: Install MongoDB Windows Service

1. **Run Installation Script as Administrator**
   ```cmd
   # Right-click and select "Run as administrator"
   scripts\install.bat
   ```

2. **Manual MongoDB Installation (Alternative)**
   ```powershell
   # Open PowerShell as Administrator
   Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
   .\scripts\install-mongodb-service.ps1
   ```

3. **Verify MongoDB Installation**
   - Check Windows Services: `services.msc`
   - Look for "MongoDB Database Service (SceneryAddonsDB)"
   - Service should be running and set to "Automatic" startup

### Step 3: Configure Application Settings

1. **Review Configuration Files**
   - `config\appsettings.Production.json` - Production settings
   - `app\appsettings.json` - Default configuration

2. **Essential Configuration Options**
   ```json
   {
     "Mongo": {
       "ConnectionString": "mongodb://localhost:27017",
       "DatabaseName": "sceneryaddons"
     },
     "RefreshToken": "your-secure-token-here",
     "DownloadSettings": {
       "BaseDownloadPath": "Downloads",
       "MaxGlobalConcurrency": 10,
       "DownloadTimeoutMinutes": 60
     }
   }
   ```

3. **Security Configuration**
   - **Change RefreshToken**: Replace default token with secure value
   - **Download Path**: Specify addon download location
   - **Concurrency**: Adjust based on system capabilities

### Step 4: Start Application

1. **Using Batch Script**
   ```cmd
   scripts\start.bat
   ```

2. **Using PowerShell Script**
   ```powershell
   .\scripts\start-application.ps1
   ```

3. **Manual Startup**
   ```cmd
   cd app
   SceneryAddonsDB.exe
   ```

### Step 5: Verify Installation

1. **Web Interface Access**
   - Open browser to: `http://localhost:5000`
   - Verify frontend loads correctly
   - Check system tray for application icon

2. **Database Connectivity**
   - Navigate to addon browser
   - Check MongoDB connection status
   - Verify database operations work

3. **Download System Test**
   - Access download manager
   - Test download configuration
   - Verify BitTorrent functionality

## Post-Installation Configuration

### 1. System Tray Integration

The application runs in the system tray with the following features:
- **Show/Hide Interface**: Toggle web interface visibility
- **Download Management**: Quick access to download controls
- **System Status**: Real-time status indicators
- **Exit Application**: Graceful shutdown

### 2. Download Configuration

Configure download settings for optimal performance:

```json
{
  "DownloadSettings": {
    "BaseDownloadPath": "C:\\MSFS_Addons",
    "MaxGlobalConcurrency": 5,
    "DownloadTimeoutMinutes": 30,
    "OrganizeByCompatibility": true,
    "SkipExistingFiles": true,
    "MaxRetryAttempts": 3
  }
}
```

### 3. Performance Optimization

1. **Memory Settings**
   - Adjust MongoDB memory allocation
   - Configure .NET garbage collection
   - Set appropriate download concurrency

2. **Storage Configuration**
   - Use SSD for database storage
   - Separate download location if needed
   - Configure disk space monitoring

3. **Network Configuration**
   - Configure firewall rules
   - Set appropriate timeout values
   - Optimize BitTorrent settings

## Management Operations

### Starting the Application
```cmd
# Using batch script
scripts\start.bat

# Using PowerShell
.\scripts\start-application.ps1 -ShowLogs
```

### Stopping the Application
```cmd
# Using batch script
scripts\stop.bat

# Using PowerShell
.\scripts\stop-application.ps1 -Force
```

### Restart Application
```cmd
scripts\stop.bat
scripts\start.bat
```

### View Application Logs
```powershell
# Start with live logs
.\scripts\start-application.ps1 -ShowLogs

# Check MongoDB logs
C:\data\log\mongod.log
```

## Troubleshooting

### Common Issues

1. **MongoDB Service Won't Start**
   ```cmd
   # Check service status
   sc query MongoDB
   
   # Check MongoDB logs
   type C:\data\log\mongod.log
   
   # Restart service
   net stop MongoDB
   net start MongoDB
   ```

2. **Application Won't Start**
   - Verify MongoDB service is running
   - Check port 5000 is not in use
   - Review application logs
   - Ensure all dependencies are present

3. **Web Interface Not Accessible**
   - Verify application is running
   - Check firewall settings
   - Try different browser
   - Clear browser cache

4. **Download Issues**
   - Check internet connectivity
   - Verify download path permissions
   - Review BitTorrent settings
   - Check antivirus interference

### Advanced Troubleshooting

1. **Database Connection Issues**
   ```cmd
   # Test MongoDB connection
   "C:\Program Files\MongoDB\Server\7.0\bin\mongosh.exe" --eval "db.adminCommand('ping')"
   ```

2. **Performance Issues**
   - Monitor system resources
   - Adjust download concurrency
   - Check disk space
   - Review network bandwidth

3. **Configuration Problems**
   - Verify JSON syntax
   - Check file permissions
   - Validate configuration values
   - Review error logs

## Security Considerations

### 1. Access Control
- Application runs on localhost only
- No external network access by default
- Change default refresh token

### 2. File System Security
- Secure download directories
- Proper file permissions
- Regular security updates

### 3. Network Security
- Firewall configuration
- Port security
- VPN considerations

## Maintenance

### 1. Regular Updates
- Check for application updates
- Update MongoDB when available
- Keep Windows updated

### 2. Database Maintenance
- Regular backups
- Index optimization
- Log rotation

### 3. Performance Monitoring
- Monitor resource usage
- Track download performance
- Review system logs

## Uninstallation

### 1. Stop Application
```cmd
scripts\stop.bat
```

### 2. Remove MongoDB Service
```cmd
# Complete removal with data
scripts\uninstall.bat

# Or use PowerShell
.\scripts\uninstall-mongodb-service.ps1 -RemoveData -RemoveInstallation
```

### 3. Remove Application Files
- Delete installation directory
- Remove user data if desired
- Clean up shortcuts/registry entries

## Support and Resources

### Documentation
- Application documentation: `docs/` directory
- Configuration examples: `config/` directory
- Release notes: `CHANGELOG.md`

### Common Commands
```cmd
# Install MongoDB service
scripts\install.bat

# Start application
scripts\start.bat

# Stop application  
scripts\stop.bat

# Uninstall everything
scripts\uninstall.bat
```

### Version Information
- **Application Version**: 3.0.0
- **MongoDB Version**: 7.0+
- **Framework**: .NET 9
- **Platform**: Windows x64

This completes the comprehensive installation guide for SceneryAddonsDB v3.0 production deployment.
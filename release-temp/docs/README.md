# SceneryAddonsDB v3.0 - Production Release

**A comprehensive flight simulator scenery addon management system with Windows service MongoDB deployment.**

## 🚀 Quick Start (Production)

### Prerequisites
- Windows 10/11 (x64)
- Administrator privileges
- Internet connection

### Installation
1. Download `SceneryAddonsDB-v3.0.0-Production.zip`
2. Extract to `C:\SceneryAddonsDB`
3. Run `scripts\install.bat` **as Administrator**
4. Run `scripts\start.bat`
5. Open http://localhost:5000

## 📋 Overview

SceneryAddonsDB v3.0 is a production-ready flight simulator scenery addon management system featuring:

- **🗄️ MongoDB Windows Service**: Native Windows service installation (replaces Docker)
- **⚡ Self-contained .NET 9**: Single-file deployment with all dependencies
- **🌐 Modern React Frontend**: TypeScript-based SPA with real-time updates
- **📥 BitTorrent Downloads**: Automated addon downloading with session management
- **🔄 Real-time Updates**: SignalR integration for live progress tracking
- **🎯 System Tray Integration**: Background operation with system tray controls
- **📊 Performance Optimized**: Batch processing with concurrent operations

## 🏗️ Architecture

### Core Components
- **Backend**: .NET 9 Web API with SignalR hubs
- **Frontend**: React 18 + TypeScript + Vite
- **Database**: MongoDB 7.0+ (Windows Service)
- **Downloads**: MonoTorrent 3.0.2 with session management
- **UI**: Tailwind CSS with responsive design

### Data Flow
```
Frontend (React) ↔ SignalR Hub ↔ .NET API ↔ MongoDB Service
                                     ↓
                               BitTorrent Engine
                                     ↓
                               Download Manager
```

## 🛠️ Production Deployment

### System Requirements

**Minimum:**
- Windows 10 (1903+) or Windows 11
- 4 GB RAM, 8 GB recommended
- 1 GB for application + download space
- .NET 9 runtime (included in self-contained build)

**Recommended:**
- Windows 11 (latest updates)
- 16 GB RAM or more
- SSD with 100+ GB free space
- High-speed internet connection

### Installation Steps

#### 1. MongoDB Windows Service Setup
```cmd
# Run as Administrator
scripts\install-mongodb-service.ps1
```

**What this does:**
- Downloads MongoDB Community Server 7.0
- Configures Windows service with optimized settings
- Creates data and log directories
- Starts MongoDB service automatically

#### 2. Application Deployment
```cmd
# Run as Administrator
scripts\install.bat
```

**What this does:**
- Installs MongoDB service
- Configures service startup
- Verifies installation

#### 3. Start Application
```cmd
scripts\start.bat
```

**What this does:**
- Checks MongoDB service status
- Starts SceneryAddonsDB application
- Enables system tray integration
- Opens web interface on http://localhost:5000

### Configuration Files

#### Production Settings (`appsettings.Production.json`)
```json
{
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "sceneryaddons",
    "ConnectionTimeout": 30000,
    "MaxPoolSize": 100
  },
  "DownloadSettings": {
    "MaxGlobalConcurrency": 10,
    "DownloadTimeoutMinutes": 60,
    "OrganizeByCompatibility": true
  },
  "RefreshToken": "change-me-in-production"
}
```

#### MongoDB Configuration (`mongod.cfg`)
```yaml
systemLog:
  destination: file
  path: C:\data\log\mongod.log
  logAppend: true

storage:
  dbPath: C:\data\db
  engine: wiredTiger

net:
  port: 27017
  bindIp: 127.0.0.1,::1
```

### Management Commands

#### Application Management
```cmd
# Start application
scripts\start.bat

# Stop application
scripts\stop.bat

# Start with logs
scripts\start-application.ps1 -ShowLogs

# Force stop
scripts\stop-application.ps1 -Force
```

#### MongoDB Service Management
```cmd
# Check service status
sc query MongoDB

# Start/Stop service
net start MongoDB
net stop MongoDB

# View logs
type C:\data\log\mongod.log
```

## 🌟 Features

### Addon Management
- **Browse & Search**: 2,145+ addons with advanced filtering
- **Real-time Scraping**: Live updates with progress tracking
- **Batch Operations**: Bulk download and organization
- **Compatibility Sorting**: Automatic MSFS 2020/2024 organization

### Download System
- **BitTorrent Integration**: MonoTorrent 3.0.2 engine
- **Session Management**: Concurrent downloads with progress
- **Auto-organization**: Files sorted by compatibility
- **Resume Support**: Interrupted downloads resume automatically

### User Interface
- **Responsive Design**: Works on all screen sizes
- **Dark/Light Themes**: Customizable appearance
- **Real-time Updates**: Live progress via SignalR
- **System Tray**: Background operation with controls

### Performance
- **Batch Processing**: Optimized database operations
- **Concurrent Downloads**: Multiple simultaneous downloads
- **Memory Management**: Efficient resource usage
- **Caching**: Intelligent data caching

## 🔧 Development Setup

### Prerequisites
- .NET 9 SDK
- Node.js 18+
- MongoDB (Docker or Windows Service)

### Quick Start
```bash
# Clone repository
git clone https://github.com/yourusername/SceneryAddonsDB.git
cd SceneryAddonsDB

# Start MongoDB (Docker)
docker-compose up -d mongo

# Start API
cd src/Addons.Api
dotnet run

# Start Frontend
cd ../../frontend
npm install
npm run dev
```

### Build Commands
```bash
# Build production package
scripts\build-production-simple.ps1

# Build frontend only
cd frontend && npm run build

# Build API only
dotnet publish src/Addons.Api -c Release
```

## 🔒 Security

### Production Security
- **Local-only binding**: No external network access
- **Secure tokens**: Change default refresh token
- **File permissions**: Restricted download directories
- **Windows service**: Runs under system account

### Best Practices
- Change default refresh token
- Use firewall rules for additional security
- Regular security updates
- Monitor system logs

## 📊 Monitoring

### Application Logs
```cmd
# View application logs
scripts\start-application.ps1 -ShowLogs

# Check system tray status
# Look for SceneryAddonsDB icon in system tray
```

### MongoDB Logs
```cmd
# View MongoDB logs
type C:\data\log\mongod.log

# Check service status
sc query MongoDB
```

### Performance Monitoring
- **Task Manager**: Monitor CPU/Memory usage
- **Performance Counters**: .NET and MongoDB metrics
- **Application Insights**: Optional telemetry integration

## 🧪 Testing

### Functional Testing
```cmd
# Run all tests
dotnet test

# Run API tests only
dotnet test src/Addons.Api.Tests

# Frontend tests
cd frontend && npm test
```

### Integration Testing
- Database connectivity tests
- API endpoint validation
- SignalR connection tests
- Download system verification

## 🚨 Troubleshooting

### Common Issues

#### MongoDB Service Won't Start
```cmd
# Check service status
sc query MongoDB

# View logs
type C:\data\log\mongod.log

# Restart service
net stop MongoDB
net start MongoDB
```

#### Application Won't Start
- Verify MongoDB service is running
- Check port 5000 is available
- Review application logs
- Ensure Administrator privileges

#### Download Issues
- Check internet connectivity
- Verify download path permissions
- Review BitTorrent settings
- Check antivirus interference

#### Frontend Issues
- Clear browser cache
- Check console for errors
- Verify API connectivity
- Try different browser

### Support Resources
- **Documentation**: `docs/` directory
- **Installation Guide**: `docs/PRODUCTION-INSTALLATION.md`
- **API Documentation**: Available at `/swagger` endpoint
- **GitHub Issues**: Report bugs and feature requests

## 📝 Changelog

### v3.0.0 (Latest)
- **✨ NEW**: MongoDB Windows Service deployment
- **✨ NEW**: Self-contained .NET 9 application
- **✨ NEW**: Enhanced system tray integration
- **✨ NEW**: Real-time SignalR updates
- **✨ NEW**: Batch processing optimizations
- **✨ NEW**: Production deployment package
- **🚀 IMPROVED**: Download performance and reliability
- **🚀 IMPROVED**: UI responsiveness and design
- **🔧 FIXED**: Various stability and performance issues

### Previous Versions
- v2.x: Docker-based deployment
- v1.x: Console application

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:
- **GitHub Issues**: Bug reports and feature requests
- **Documentation**: Comprehensive guides in `docs/`
- **Installation Help**: Step-by-step guides included

---

**SceneryAddonsDB v3.0** - Production-ready flight simulator addon management system

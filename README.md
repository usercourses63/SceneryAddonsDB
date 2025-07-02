# SceneryAddonsDB

A comprehensive .NET 9 Web API for managing, tracking, and **downloading** Microsoft Flight Simulator scenery addons from SceneryAddons.org with **real BitTorrent integration**.

## 🚀 Features

### 🎯 Core Features
- **Real-time Scraping**: Automatically scrapes the latest addons from SceneryAddons.org
- **MongoDB Integration**: Stores addon data with full CRUD operations
- **RESTful API**: Complete API endpoints for addon management
- **Background Processing**: Automated hourly scraping with background workers
- **Docker Support**: Automated MongoDB container management
- **Swagger Documentation**: Interactive API documentation
- **Report Generation**: Detailed analytics and statistics

### 🧲 **NEW: Download Management**
- **Real BitTorrent Downloads**: Download actual addon files using MonoTorrent 3.0.2
- **Concurrent Downloads**: Configurable concurrent download limits (1-10 per session)
- **Automatic File Organization**: Files organized by compatibility (2020, 2024, 2020-2024)
- **Progress Monitoring**: Real-time download progress and speed tracking
- **Session Management**: Multiple download sessions with full control
- **Magnet Link Extraction**: Automatically extracts torrent magnet links
- **Download Statistics**: Comprehensive download metrics and reporting

## 🛠️ Technology Stack

- **.NET 9**: Latest .NET framework
- **ASP.NET Core Web API**: RESTful API framework
- **MongoDB.Entities**: Modern MongoDB ODM
- **MonoTorrent 3.0.2**: BitTorrent client library for real downloads
- **HtmlAgilityPack**: Web scraping library
- **Docker**: Container management for MongoDB
- **Swagger/OpenAPI**: API documentation
- **Background Services**: Automated data processing

## 📋 Prerequisites

- .NET 9 SDK
- Docker Desktop (for MongoDB)
- Git
- **BitTorrent Client** (optional, for manual downloads)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/usercourses63/SceneryAddonsDB.git
cd SceneryAddonsDB
```

### 2. Run the Application
```bash
# Start the API (MongoDB will be automatically managed)
dotnet run --project src/Addons.Api

# Or use the console application with download support
dotnet run --project src/Addons.Console -- -c 5 -a  # Auto-download 5 latest addons
```

### 3. Access the API
- **API**: http://localhost:5269
- **Swagger Documentation**: http://localhost:5269/swagger
- **Downloads**: Files saved to `Downloads/` folder organized by compatibility

## 📊 API Endpoints

### Addons Management
- `GET /api/addons` - Get all addons with filtering and pagination
- `GET /api/addons/{id}` - Get specific addon by ID
- `POST /api/addons` - Create new addon
- `PUT /api/addons/{id}` - Update existing addon
- `DELETE /api/addons/{id}` - Delete addon

### **🧲 Download Management (NEW)**
- `POST /api/downloads/start` - Start download session with concurrent downloads
- `GET /api/downloads/sessions/{id}/status` - Monitor download progress
- `GET /api/downloads/sessions` - List all active download sessions
- `POST /api/downloads/sessions/{id}/cancel` - Cancel download session
- `GET /api/downloads/stats` - Get download statistics
- `GET /api/downloads/folders` - View downloaded files by compatibility

### Data Management
- `POST /api/addons/scrape` - Trigger manual scraping
- `GET /api/addons/latest` - Get latest addons
- `GET /api/addons/stats` - Get database statistics

### Reports
- `GET /api/reports/summary` - Get comprehensive report
- `GET /api/reports/compatibility` - Get compatibility breakdown
- `GET /api/reports/recent` - Get recent additions report

## 🎮 Console Application

The console application now supports **real addon downloads**:

```bash
# Download latest addons automatically
dotnet run --project src/Addons.Console -- -c 5 -a

# Download with custom concurrency
dotnet run --project src/Addons.Console -- -c 10 -a --concurrency 3

# Get addons info without downloading
dotnet run --project src/Addons.Console -- -c 10 -d

# Filter by compatibility and download
dotnet run --project src/Addons.Console -- -c 5 -a --compatibility "MSFS 2024"

# Show help
dotnet run --project src/Addons.Console -- --help
```

### Console Options
- `-c, --count`: Number of addons to process (1-50)
- `-a, --auto-download`: Automatically download addons
- `-d, --detailed`: Show detailed information
- `--concurrency`: Max concurrent downloads (1-10)
- `--compatibility`: Filter by compatibility
- `--help`: Show help information

## 🧲 Download API Usage Examples

### Start Download Session
```bash
curl -X POST "http://localhost:5269/api/downloads/start" \
  -H "Content-Type: application/json" \
  -d '{
    "count": 5,
    "maxConcurrency": 3,
    "compatibility": "MSFS 2024",
    "forceRedownload": false
  }'
```

### Monitor Progress
```bash
curl -X GET "http://localhost:5269/api/downloads/sessions/{sessionId}/status"
```

### Get Download Statistics
```bash
curl -X GET "http://localhost:5269/api/downloads/stats"
```

## 🔧 Configuration

### Database & Download Settings (appsettings.json)
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

### Download Organization
Files are automatically organized by compatibility:
```
Downloads/
├── 2020/           # MSFS 2020 only addons
├── 2024/           # MSFS 2024 only addons
├── 2020-2024/      # Compatible with both versions
└── Other/          # Unknown compatibility
```

## 📈 Data Models

### Download Request
```csharp
public class DownloadRequest
{
    public int Count { get; set; } = 5;              // 1-50 addons
    public int MaxConcurrency { get; set; } = 3;     // 1-10 concurrent
    public string? Compatibility { get; set; }       // Filter
    public bool ForceRedownload { get; set; } = false;
}
```

### Download Progress
```csharp
public class DownloadItem
{
    public string FileName { get; set; }
    public string Name { get; set; }
    public string Compatibility { get; set; }
    public DownloadStatus Status { get; set; }       // Queued, Downloading, Completed, Failed
    public double Progress { get; set; }             // 0-100%
    public long SpeedBytesPerSecond { get; set; }
    public long TotalBytes { get; set; }
    public string? LocalPath { get; set; }
}
```

## 🔄 Background Processing

- **Automatic Scraping**: Runs every hour
- **Download Management**: Concurrent session handling
- **Progress Tracking**: Real-time monitoring
- **Error Recovery**: Robust error handling
- **Logging**: Comprehensive logging for monitoring

## 🧲 BitTorrent Integration

### MonoTorrent Features
- **Real Downloads**: Downloads actual .rar addon files (2+ GB each)
- **Magnet Links**: Extracts magnet links from SceneryAddons.org
- **Peer Discovery**: Connects to BitTorrent swarm
- **Progress Monitoring**: Real-time speed and progress
- **Automatic Cleanup**: Stops seeding after download completion

### Download Process
1. **Scrape**: Extract addon information and download URLs
2. **Extract**: Get magnet links from SceneryAddons.org torrent pages
3. **Download**: Use MonoTorrent to download via BitTorrent
4. **Organize**: Save files to compatibility-based folders
5. **Monitor**: Track progress and provide real-time updates

## 🐳 Docker Support

### MongoDB Container Management
```bash
# Manual container operations (handled automatically by the app)
docker run -d --name scenery-addons-mongodb -p 27017:27017 -v scenery-addons-data:/data/db mongo:latest
```

## 📝 Development

### Project Structure
```
SceneryAddonsDB/
├── src/
│   ├── Addons.Api/          # Web API with download endpoints
│   ├── Addons.Console/      # Console app with download support
│   └── Addons.Shared/       # Shared models and utilities
├── Downloads/               # Downloaded addon files (organized by compatibility)
├── tests/                   # Unit and integration tests
├── docs/                    # Documentation
└── scripts/                 # Build and deployment scripts
```

### Building
```bash
# Build all projects
dotnet build

# Build specific project
dotnet build src/Addons.Api

# Run tests
dotnet test
```

## 🚀 Deployment

### Production Deployment
```bash
# Publish API with download support
dotnet publish src/Addons.Api -c Release -o publish/api

# Publish Console App with download support
dotnet publish src/Addons.Console -c Release -o publish/console
```

### Environment Variables
- `ASPNETCORE_ENVIRONMENT`: Set to `Production` for production
- `MongoDb__ConnectionString`: Override MongoDB connection
- `MongoDb__DatabaseName`: Override database name
- `DownloadSettings__BaseDownloadPath`: Override download location
- `DownloadSettings__MaxGlobalConcurrency`: Override max concurrent downloads

## 📊 Monitoring and Logging

- **Download Progress**: Real-time progress monitoring
- **Session Management**: Track multiple download sessions
- **Performance Metrics**: Download speeds and completion rates
- **Error Tracking**: Comprehensive download error logging
- **Statistics**: Download success/failure rates

## 🎯 Use Cases

### For Flight Sim Enthusiasts
- **Bulk Downloads**: Download multiple addons automatically
- **Organization**: Files organized by MSFS version compatibility
- **Progress Tracking**: Monitor download progress in real-time
- **API Integration**: Build custom tools using the REST API

### For Developers
- **REST API**: Complete download management API
- **Real-time Updates**: WebSocket-style progress monitoring
- **Concurrent Processing**: Handle multiple downloads efficiently
- **Extensible**: Easy to add new download sources

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **SceneryAddons.org**: Source of addon data and download links
- **MonoTorrent**: Excellent BitTorrent client library
- **MongoDB.Entities**: Excellent MongoDB ODM
- **HtmlAgilityPack**: Powerful web scraping capabilities
- **Microsoft Flight Simulator Community**: Inspiration and support

## 📞 Support

For support, please open an issue on GitHub or contact the maintainers.

---

**Happy Flying with Real Addon Downloads!** ✈️🎮🧲

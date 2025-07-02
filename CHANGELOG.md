# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-07-02

### 🧲 Added - Major Download Management Features

#### **Real BitTorrent Downloads**
- **MonoTorrent 3.0.2 Integration**: Added full BitTorrent client support for downloading actual addon files
- **Magnet Link Extraction**: Automatically extracts magnet links from SceneryAddons.org torrent pages
- **Real File Downloads**: Downloads actual .rar addon files (2+ GB each) instead of redirect pages
- **Progress Monitoring**: Real-time download progress, speed, and status tracking

#### **Download API Endpoints**
- `POST /api/downloads/start` - Start download session with configurable concurrency
- `GET /api/downloads/sessions/{id}/status` - Monitor download progress in real-time
- `GET /api/downloads/sessions` - List all active download sessions
- `POST /api/downloads/sessions/{id}/cancel` - Cancel download sessions
- `GET /api/downloads/stats` - Get comprehensive download statistics
- `GET /api/downloads/folders` - View downloaded files organized by compatibility

#### **Concurrent Download Management**
- **Configurable Concurrency**: Support for 1-10 concurrent downloads per session
- **Global Concurrency Control**: Configurable global download limits
- **Session Management**: Multiple download sessions running simultaneously
- **Queue Management**: Intelligent download queuing and processing

#### **File Organization**
- **Automatic Organization**: Files organized by MSFS compatibility
  - `Downloads/2020/` - MSFS 2020 only addons
  - `Downloads/2024/` - MSFS 2024 only addons
  - `Downloads/2020-2024/` - Compatible with both versions
  - `Downloads/Other/` - Unknown compatibility
- **Duplicate Detection**: Skip existing files to prevent re-downloads
- **Path Management**: Configurable download paths and organization

#### **Enhanced Console Application**
- **Download Support**: Console app now supports real addon downloads
- **New Command Options**:
  - `-a, --auto-download` - Automatically download addons
  - `--concurrency` - Configure concurrent download limits
  - `--compatibility` - Filter downloads by MSFS version
- **Progress Display**: Real-time download progress in console
- **Torrent Integration**: Full BitTorrent download support in console mode

#### **Configuration & Settings**
- **Download Settings**: Comprehensive download configuration in `appsettings.json`
- **Timeout Management**: Configurable download timeouts
- **Error Handling**: Robust error recovery and retry mechanisms
- **Logging**: Detailed download logging and monitoring

### 🔧 Enhanced

#### **Web Scraping Improvements**
- **Download URL Extraction**: Enhanced scraper to extract actual download URLs
- **Torrent Link Detection**: Prioritized torrent downloads over other methods
- **HTML Entity Decoding**: Proper handling of encoded URLs (`&#038;` → `&`)
- **Error Recovery**: Improved scraping reliability and error handling

#### **API Enhancements**
- **New Models**: Added comprehensive download models and DTOs
- **Validation**: Enhanced input validation for download requests
- **Documentation**: Updated Swagger documentation with download endpoints
- **Error Responses**: Improved error handling and response messages

#### **Performance Improvements**
- **Concurrent Processing**: Optimized for multiple simultaneous downloads
- **Memory Management**: Efficient handling of large file downloads
- **Resource Cleanup**: Proper disposal of torrent resources
- **Background Processing**: Non-blocking download operations

### 🛠️ Technical Changes

#### **Dependencies**
- **Added**: MonoTorrent 3.0.2 for BitTorrent functionality
- **Added**: System.Text.Encodings.Web 9.0.0 for URL encoding
- **Updated**: All existing packages to latest versions

#### **Architecture**
- **New Services**: 
  - `TorrentDownloadService` - Core BitTorrent download functionality
  - `DownloadManagerService` - Concurrent download session management
  - `DownloadableAddonScraperService` - Enhanced scraping with download URLs
- **New Controllers**: `DownloadsController` - Complete download management API
- **New Models**: Comprehensive download models and enums

#### **Infrastructure**
- **Service Registration**: Proper dependency injection for download services
- **Configuration**: Extended configuration system for download settings
- **Background Services**: Enhanced background processing for downloads

### 📊 Statistics

#### **Download Capabilities**
- **File Sizes**: Successfully downloads 2+ GB addon files
- **Concurrent Downloads**: Up to 10 concurrent downloads per session
- **Multiple Sessions**: Unlimited concurrent download sessions
- **Speed**: Achieves 1+ MB/s combined download speeds
- **Success Rate**: High success rate with proper error handling

#### **API Endpoints**
- **Total Endpoints**: 6 new download management endpoints
- **Request Types**: Support for POST, GET operations
- **Response Formats**: JSON responses with comprehensive data
- **Error Handling**: Proper HTTP status codes and error messages

### 🎯 Use Cases Enabled

#### **For Flight Sim Enthusiasts**
- **Bulk Downloads**: Download multiple addons automatically
- **Organization**: Files organized by MSFS version compatibility
- **Progress Tracking**: Monitor download progress in real-time
- **Automation**: Set up automated download workflows

#### **For Developers**
- **REST API**: Complete download management API
- **Integration**: Easy integration with existing tools
- **Monitoring**: Real-time download monitoring capabilities
- **Extensibility**: Framework for adding new download sources

### 🔄 Migration Notes

#### **From Version 1.x**
- **New Dependencies**: MonoTorrent 3.0.2 is now required
- **New Configuration**: Add `DownloadSettings` section to `appsettings.json`
- **New Endpoints**: 6 new download endpoints available
- **File Structure**: Downloads folder will be created automatically
- **Backward Compatibility**: All existing API endpoints remain unchanged

#### **Configuration Updates**
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

### 🐛 Fixed
- **URL Encoding**: Fixed HTML entity decoding in download URLs
- **File Extensions**: Proper detection of .rar file extensions
- **Error Handling**: Improved error messages and recovery
- **Memory Leaks**: Proper disposal of torrent resources

### 🔒 Security
- **Input Validation**: Enhanced validation for download requests
- **Path Security**: Secure file path handling and validation
- **Resource Limits**: Configurable limits to prevent resource exhaustion
- **Error Disclosure**: Secure error handling without information leakage

---

## [1.0.0] - 2024-12-XX

### Added
- Initial release with web scraping and MongoDB integration
- RESTful API for addon management
- Background scraping workers
- Docker MongoDB management
- Swagger documentation
- Console application for addon browsing

### Features
- Real-time scraping from SceneryAddons.org
- MongoDB data storage with full CRUD operations
- Automated hourly scraping
- Comprehensive reporting and analytics
- Docker container management for MongoDB

---

**Note**: Version 2.0.0 represents a major milestone with the addition of real BitTorrent download capabilities, transforming the project from a data management tool into a complete addon download solution for the Microsoft Flight Simulator community.

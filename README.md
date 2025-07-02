
# 🎮 Scenery Addons Database API

A comprehensive .NET 9 Web API for managing and browsing flight simulator scenery addons with automated web scraping, MongoDB integration, and Docker container management.

## ✨ Features

### 🚀 **Core Functionality**
- **Automated Web Scraping**: Scrapes sceneryaddons.org for the latest addon information
- **MongoDB Integration**: Stores and manages 2,100+ scenery addons with full CRUD operations
- **RESTful API**: Full Web API with comprehensive endpoints for addon management
- **Real-time Updates**: Hourly automated scraping with manual trigger support

### 📊 **Advanced Features**
- **Interactive Swagger Documentation**: Available in both development and production
- **Embedded Console Reporting**: Beautiful formatted status reports displayed directly in console
- **Table & List Views**: Optimized data formats for different use cases
- **Advanced Filtering**: Search by compatibility, date ranges, and text queries
- **Pagination Support**: Efficient data browsing with configurable page sizes

### 🐳 **Infrastructure Management**
- **Automated MongoDB Docker Management**: Automatically detects, creates, and manages MongoDB containers
- **Persistent Data Storage**: Uses Docker volumes for data persistence
- **Smart Container Detection**: Works with existing MongoDB installations
- **Self-Contained Deployment**: Single executable with embedded .NET runtime

### 🎯 **Data Management**
- **Compatibility Tracking**: MSFS 2020, MSFS 2024, and MSFS 2020/2024 support
- **Duplicate Prevention**: Intelligent deduplication based on file names
- **Update Tracking**: Monitors new, updated, and unchanged addons
- **Error Handling**: Comprehensive logging and graceful error recovery

## 🏗️ **Architecture**

### **Technology Stack**
- **.NET 9**: Latest .NET framework with C# 13
- **ASP.NET Core**: Full Web API with controllers
- **MongoDB.Entities**: Modern MongoDB integration
- **HtmlAgilityPack**: Web scraping and HTML parsing
- **Swagger/OpenAPI**: Interactive API documentation
- **Docker**: Containerized MongoDB deployment
- **xUnit**: Comprehensive testing framework

### **Project Structure**
```
src/
├── Addons.Api/                 # Main Web API project
│   ├── Controllers/            # API controllers
│   ├── Services/               # Business logic services
│   ├── Models/                 # Data models and DTOs
│   ├── BackgroundJobs/         # Scheduled tasks
│   └── Extensions/             # Service extensions
├── Addons.Tests/               # Unit and integration tests
└── Addons.sln                 # Solution file
```

## 🚀 **Quick Start**

### **Prerequisites**
- .NET 9 SDK
- Docker Desktop (for MongoDB)
- Windows 10+ (for executable deployment)

### **Option 1: Run from Source**
```bash
# Clone the repository
git clone https://github.com/usercourses63/SceneryAddonsDB.git
cd SceneryAddonsDB

# Run the application
dotnet run --project src/Addons.Api

# Access Swagger UI
# Navigate to: http://localhost:5269/swagger
```

### **Option 2: Run Self-Contained Executable**
```bash
# Download the latest release
# Extract SceneryAddonsDB-Release.zip

# Run the executable
cd SceneryAddonsDB-Release
.\Addons.Api.exe

# Access Swagger UI
# Navigate to: http://localhost:5000/swagger
```

## 📡 **API Endpoints**

### **Core Endpoints**
```http
GET    /api/health                    # Health check
GET    /api/addons                    # List addons (supports table/list format)
GET    /api/addons/latest             # Get latest addons
GET    /api/addons/stats              # Addon statistics
GET    /api/addons/compatibility      # Compatibility information
```

### **Management Endpoints**
```http
POST   /api/scraper/refresh           # Manual scrape trigger (requires token)
GET    /api/reports/status            # Status report (JSON)
POST   /api/reports/status/console    # Display report to console
```

### **Example Usage**
```bash
# Get addons in table format
curl "http://localhost:5269/api/addons?format=table&pageSize=10"

# Filter by compatibility
curl "http://localhost:5269/api/addons?compatibility=MSFS%202024"

# Search addons
curl "http://localhost:5269/api/addons?search=airport&pageSize=5"

# Trigger manual scrape (requires authentication)
curl -X POST "http://localhost:5269/api/scraper/refresh" \
     -H "X-Refresh-Token: your-token-here"
```

## 🔧 **Configuration**

### **Application Settings** (`appsettings.json`)
```json
{
  "Mongo": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "sceneryaddons"
  },
  "RefreshToken": "your-secure-token-here",
  "Logging": {
    "LogLevel": {
      "Default": "Information"
    }
  }
}
```

### **Environment Variables**
- `ASPNETCORE_ENVIRONMENT`: Set to `Development` or `Production`
- `ASPNETCORE_URLS`: Override default listening URLs

## 📊 **Database Schema**

### **Addon Model**
```csharp
public class Addon
{
    public string ID { get; set; }              // MongoDB ObjectId
    public string FileName { get; set; }        // Unique file name
    public string Name { get; set; }            // Display name
    public string Compatibility { get; set; }   // MSFS version compatibility
    public DateTime DateAdded { get; set; }     // Date added to database
    public DateTime CreatedAt { get; set; }     // Record creation timestamp
    public DateTime UpdatedAt { get; set; }     // Last update timestamp
}
```

## 🐳 **Docker Integration**

The application automatically manages MongoDB through Docker:

### **Automatic Container Management**
- Detects existing MongoDB instances on port 27017
- Creates new MongoDB container if none exists
- Uses persistent Docker volumes for data storage
- Handles container lifecycle automatically

### **Manual Docker Commands**
```bash
# View MongoDB container
docker ps | grep scenery-addons-mongodb

# Access MongoDB directly
docker exec -it scenery-addons-mongodb mongosh

# View container logs
docker logs scenery-addons-mongodb
```

## 📈 **Monitoring & Reporting**

### **Console Reports**
The application displays beautiful formatted reports directly in the console:

```
🎯 Application Status & New Addon Check Results
================================================================================
✅ Application Status:
   Generated At: 2025-07-02 08:06:19 UTC
   Database Status: Connected
   Environment: Development

📊 Database Statistics:
   Total Addons: 2,132
   Recent Addons (7 days): 23
   Date Range: 2021-01-13 to 2025-06-26

🎯 Compatibility Breakdown:
   MSFS 2020/2024: 1,504 addons (70.5%)
   MSFS 2020: 456 addons (21.4%)
   MSFS 2024: 172 addons (8.1%)
```

### **API Monitoring**
- Health check endpoint for uptime monitoring
- Detailed logging with structured output
- Error tracking and reporting
- Performance metrics

## 🧪 **Testing**

### **Run Tests**
```bash
# Run all tests
dotnet test

# Run with coverage
dotnet test --collect:"XPlat Code Coverage"

# Run specific test category
dotnet test --filter Category=Integration
```

### **Test Categories**
- **Unit Tests**: Service logic and business rules
- **Integration Tests**: Database and API integration
- **Performance Tests**: Load and stress testing

## 🚀 **Deployment**

### **Self-Contained Executable**
```bash
# Build self-contained executable
dotnet publish src/Addons.Api -c Release -r win-x64 \
  --self-contained true -p:PublishSingleFile=true -o ./publish

# The executable includes:
# - .NET 9 runtime
# - All dependencies
# - Application files
# - Configuration
```

### **Production Considerations**
- Configure secure authentication tokens
- Set up proper logging and monitoring
- Configure MongoDB with authentication
- Use HTTPS in production environments
- Set up automated backups for MongoDB data

## 📝 **API Documentation**

### **Swagger UI**
- **Development**: `http://localhost:5269/swagger`
- **Production**: `http://localhost:5000/swagger`

### **OpenAPI Specification**
- Complete API documentation with examples
- Interactive testing interface
- Request/response schemas
- Authentication requirements

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **sceneryaddons.org** - Source of addon data
- **MongoDB.Entities** - Excellent MongoDB integration
- **HtmlAgilityPack** - Reliable web scraping
- **ASP.NET Core** - Robust web framework

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/usercourses63/SceneryAddonsDB/issues)
- **Discussions**: [GitHub Discussions](https://github.com/usercourses63/SceneryAddonsDB/discussions)

---

**Built with ❤️ for the flight simulation community**

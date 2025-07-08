# Complete Setup Guide - SceneryAddons UI

## Important Note
This frontend is designed to work with the existing .NET 9 SceneryAddonsDB API backend (not Flask). The API uses MongoDB and SignalR for real-time features.

## Prerequisites

### 1. Backend Requirements
- .NET 9 SDK installed
- Docker Desktop (for MongoDB)
- The SceneryAddonsDB API must be running on http://localhost:5269

### 2. Frontend Requirements  
- Node.js 18+ (LTS recommended)
- npm or yarn package manager

## Step-by-Step Setup

### Phase 1: Backend Setup (Required First)

1. **Start the .NET API Backend:**
```bash
# From the project root directory
cd src/Addons.Api
dotnet restore
dotnet run
```

2. **Verify API is running:**
- Open http://localhost:5269/swagger
- You should see the API documentation
- MongoDB will be automatically started via Docker

### Phase 2: Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```

4. **Open in browser:**
- Navigate to http://localhost:5173
- The frontend will proxy API calls to http://localhost:5269

## Verification Checklist

### ✅ Backend Verification
- [ ] .NET API running on http://localhost:5269
- [ ] Swagger UI accessible at http://localhost:5269/swagger
- [ ] MongoDB container running (check Docker Desktop)
- [ ] Health endpoint returns {"status":"Healthy"}

### ✅ Frontend Verification  
- [ ] React app loads at http://localhost:5173
- [ ] No console errors in browser dev tools
- [ ] API calls successful (check Network tab)
- [ ] SignalR connection established

## Architecture Overview

```
┌─────────────────┐    HTTP/SignalR    ┌──────────────────┐
│   React Frontend│ ←────────────────→ │  .NET 9 API      │
│   (Port 5173)   │                    │  (Port 5269)     │
└─────────────────┘                    └──────────────────┘
                                               │
                                               ▼
                                       ┌──────────────────┐
                                       │  MongoDB         │
                                       │  (Docker)        │
                                       └──────────────────┘
```

## Technology Stack Alignment

### Backend (Existing)
- .NET 9 with ASP.NET Core Web API
- MongoDB with MongoDB.Entities
- SignalR for real-time updates
- MonoTorrent for BitTorrent downloads
- Background services for automation

### Frontend (New)
- React 18 + TypeScript
- Vite for build tool
- Tailwind CSS for styling
- React Query for API state
- SignalR client for real-time updates
- Zustand for UI state

## Development Workflow

### 1. Start Backend First
```bash
# Terminal 1: Start .NET API
cd src/Addons.Api
dotnet run
```

### 2. Start Frontend Second  
```bash
# Terminal 2: Start React app
cd frontend
npm run dev
```

### 3. Development URLs
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5269
- **API Docs**: http://localhost:5269/swagger
- **SignalR Hub**: http://localhost:5269/downloadProgressHub

## Troubleshooting

### Common Issues

#### 1. API Connection Failed
```bash
# Check if API is running
curl http://localhost:5269/api/health

# Expected response:
{"status":"Healthy","timestamp":"2025-01-08T09:46:39Z"}
```

#### 2. MongoDB Connection Issues
```bash
# Check Docker containers
docker ps

# Should show MongoDB container running
# If not, restart the API (it auto-manages MongoDB)
```

#### 3. CORS Issues
The API is configured for frontend on localhost:5173. If you change ports, update:
```csharp
// In Program.cs
policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
```

#### 4. SignalR Connection Issues
Check browser console for WebSocket errors. Ensure:
- API is running
- No firewall blocking connections
- Browser supports WebSockets

## Next Steps

After setup is complete, you can:

1. **Browse Addons**: View addon collection with filtering
2. **Start Downloads**: Initiate download sessions  
3. **Monitor Progress**: Real-time download tracking
4. **System Status**: Check API and database health

## Support

If you encounter issues:
1. Check both API and frontend console logs
2. Verify all prerequisites are met
3. Ensure ports 5173 and 5269 are available
4. Try restarting both services

The frontend will show connection status and provide helpful error messages if the backend is unavailable.
# Complete Deployment Guide - SceneryAddons UI

## Overview

This guide provides step-by-step instructions for deploying the complete SceneryAddons UI frontend that integrates with the existing .NET 9 API backend.

## Important Architecture Note

**Backend**: This frontend is designed for the existing .NET 9 SceneryAddonsDB API (NOT Flask). The API uses:
- .NET 9 with ASP.NET Core Web API
- MongoDB database (auto-managed via Docker)
- SignalR for real-time updates
- MonoTorrent for BitTorrent downloads

## Prerequisites Checklist

### ✅ System Requirements
- [ ] Windows 10/11 (recommended) or Linux/macOS
- [ ] Node.js 18+ LTS (https://nodejs.org)
- [ ] .NET 9 SDK (https://dotnet.microsoft.com/download)
- [ ] Docker Desktop (https://docker.com/products/docker-desktop)
- [ ] Git (optional, for version control)

### ✅ Verify Prerequisites
```bash
# Check Node.js version
node --version  # Should be 18+

# Check .NET version  
dotnet --version  # Should be 9.0+

# Check Docker
docker --version  # Should be running
```

## Step-by-Step Deployment

### Phase 1: Backend Setup (Required First)

#### 1.1 Start the .NET API
```bash
# Navigate to API directory from project root
cd src/Addons.Api

# Restore dependencies
dotnet restore

# Start the API (this will auto-start MongoDB via Docker)
dotnet run
```

#### 1.2 Verify Backend
- Open http://localhost:5269/swagger
- You should see the Swagger API documentation
- Check http://localhost:5269/api/health - should return `{"status":"Healthy"}`
- MongoDB container should be running in Docker Desktop

### Phase 2: Frontend Setup

#### 2.1 Install Frontend Dependencies
```bash
# Navigate to frontend directory
cd frontend

# Install all dependencies
npm install
```

#### 2.2 Start Development Server
```bash
# Start the development server
npm run dev
```

#### 2.3 Verify Frontend
- Open http://localhost:5173
- You should see the SceneryAddons UI dashboard
- Check browser console for any errors
- Verify API calls are working (Network tab)

### Phase 3: Verification & Testing

#### 3.1 Connection Testing
```bash
# Test API health endpoint
curl http://localhost:5269/api/health

# Expected response:
# {"status":"Healthy","timestamp":"2025-01-08T..."}
```

#### 3.2 Frontend Features Test
- [ ] Dashboard loads successfully
- [ ] Navigation between pages works
- [ ] No console errors in browser dev tools
- [ ] Responsive design works on mobile

#### 3.3 API Integration Test
- [ ] Open browser Network tab
- [ ] Navigate through the UI
- [ ] Verify API calls to localhost:5269 are successful
- [ ] Check that CORS headers are present

## Production Deployment

### Option 1: Development Mode (Recommended for Testing)
```bash
# Terminal 1: Backend
cd src/Addons.Api
dotnet run

# Terminal 2: Frontend  
cd frontend
npm run dev
```

### Option 2: Production Build
```bash
# Build frontend for production
cd frontend
npm run build

# Serve built files (example with serve)
npx serve -s dist -l 5173

# Backend still runs with:
cd src/Addons.Api
dotnet run
```

### Option 3: Docker Deployment (Advanced)
```dockerfile
# Dockerfile for frontend (frontend/Dockerfile)
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting Guide

### Common Issues & Solutions

#### ❌ "Cannot find module 'react'" errors
**Solution**: Run `npm install` in the frontend directory
```bash
cd frontend
npm install
```

#### ❌ API connection failed
**Solutions**:
1. Ensure .NET API is running on port 5269
2. Check CORS configuration in Program.cs
3. Verify MongoDB Docker container is running
```bash
# Check if API is running
curl http://localhost:5269/api/health

# Check Docker containers
docker ps
```

#### ❌ "Port 5173 already in use"
**Solution**: Kill process or use different port
```bash
# Kill process on port 5173
npx kill-port 5173

# Or start on different port
npm run dev -- --port 3000
```

#### ❌ MongoDB connection errors
**Solutions**:
1. Restart Docker Desktop
2. Restart the .NET API (it auto-manages MongoDB)
3. Check Docker container logs
```bash
docker logs <container-id>
```

#### ❌ SignalR connection issues
**Solutions**:
1. Ensure WebSocket support in browser
2. Check browser console for WebSocket errors
3. Verify SignalR hub is configured correctly

### Performance Issues

#### Slow API responses
- Check MongoDB container memory usage
- Verify system resources
- Consider increasing timeout values

#### Frontend loading slowly
- Run production build: `npm run build`
- Check bundle size: inspect build output
- Enable browser caching

## Environment Configuration

### Development Environment
```env
# frontend/.env.development
VITE_API_BASE_URL=http://localhost:5269/api
VITE_SIGNALR_HUB_URL=http://localhost:5269/downloadProgressHub
VITE_NODE_ENV=development
```

### Production Environment
```env
# frontend/.env.production
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_SIGNALR_HUB_URL=https://your-api-domain.com/downloadProgressHub
VITE_NODE_ENV=production
```

## Monitoring & Maintenance

### Health Checks
- **Frontend**: http://localhost:5173 (should load without errors)
- **Backend**: http://localhost:5269/api/health
- **Database**: Check Docker Desktop for MongoDB container status

### Logs
- **Frontend**: Browser console and Network tab
- **Backend**: .NET API console output
- **Database**: Docker container logs

### Updates
```bash
# Update frontend dependencies
cd frontend
npm update

# Update backend dependencies
cd src/Addons.Api
dotnet restore
```

## Security Considerations

### Development
- APIs run on localhost only
- CORS configured for localhost:5173
- No authentication required for development

### Production
- Use HTTPS for all connections
- Configure proper CORS origins
- Implement authentication if required
- Use environment variables for sensitive data

## Performance Optimization

### Frontend
- Code splitting enabled via Vite
- Lazy loading for routes
- Image optimization
- Bundle analysis: `npm run build` and check dist/ size

### Backend
- Monitor API response times
- Check MongoDB query performance
- Monitor memory usage in Docker

## Backup & Recovery

### Database Backup
```bash
# Backup MongoDB data
docker exec <mongodb-container> mongodump --out /backup

# Copy backup from container
docker cp <container>:/backup ./mongodb-backup
```

### Configuration Backup
- Save all .env files
- Backup frontend/src/config files
- Save any custom API configurations

## Support & Contact

### Documentation
- Frontend: See frontend/README.md
- Backend: See project root README.md
- API: http://localhost:5269/swagger

### Common Resources
- React Documentation: https://react.dev
- Vite Documentation: https://vitejs.dev
- .NET Documentation: https://docs.microsoft.com/dotnet
- MongoDB Documentation: https://docs.mongodb.com

---

## Quick Reference Commands

```bash
# Start everything (run in separate terminals)
# Terminal 1: Backend
cd src/Addons.Api && dotnet run

# Terminal 2: Frontend  
cd frontend && npm run dev

# URLs
# Frontend: http://localhost:5173
# Backend: http://localhost:5269
# API Docs: http://localhost:5269/swagger
```

**✅ Deployment Complete!** Your SceneryAddons UI should now be running and connected to the .NET API backend.
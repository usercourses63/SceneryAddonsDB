# SceneryAddons UI Frontend

A modern React application for managing Microsoft Flight Simulator scenery addons with real-time download management.

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- .NET API running on http://localhost:5269

### Installation

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Start development server:**
```bash
npm run dev
```

3. **Open browser:**
Navigate to http://localhost:5173

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components
│   ├── layout/         # Layout components
│   ├── addon/          # Addon-specific components
│   ├── download/       # Download management components
│   └── system/         # System monitoring components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── services/           # API services
├── stores/             # Zustand stores
├── types/              # TypeScript definitions
└── utils/              # Utility functions
```

## Features

### Dashboard
- Real-time system metrics
- Recent addon activity feed
- Quick actions and navigation
- System health monitoring

### Addon Browser
- Advanced search and filtering
- Bulk selection and operations
- Responsive grid layout
- Compatibility-based organization

### Download Manager
- Real-time progress tracking
- Session-based management
- Concurrent download control
- Download history and statistics

### System Monitoring
- API health checks
- Database status monitoring
- Performance metrics
- Error tracking and logging

## Technology Stack

- **React 18** - Modern React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Server state management
- **Zustand** - Client state management
- **SignalR** - Real-time communication
- **Axios** - HTTP client
- **React Router** - Client-side routing

## API Integration

The frontend connects to the .NET API backend:
- **Base URL**: http://localhost:5269/api
- **SignalR Hub**: http://localhost:5269/downloadProgressHub
- **CORS**: Configured for localhost:5173

### Key Endpoints
- `GET /api/addons` - Browse addons with filtering
- `POST /api/downloads/start` - Start download session
- `GET /api/downloads/sessions` - Monitor sessions
- `GET /api/health` - System health check

## Development

### Code Style
- ESLint + Prettier for code formatting
- TypeScript strict mode enabled
- Component-first architecture
- Custom hooks for logic reuse

### Testing
- Vitest for unit testing
- React Testing Library for component testing
- Mock Service Worker for API mocking

### Performance
- Virtual scrolling for large lists
- React Query for intelligent caching
- Code splitting with lazy loading
- Image optimization

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables
```env
VITE_API_BASE_URL=http://localhost:5269/api
VITE_SIGNALR_HUB_URL=http://localhost:5269/downloadProgressHub
```

### Docker
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Ensure .NET API is running on port 5269
   - Check CORS configuration
   - Verify network connectivity

2. **SignalR Connection Issues**
   - Check WebSocket support in browser
   - Verify hub URL configuration
   - Monitor browser console for errors

3. **Build Errors**
   - Clear node_modules and reinstall
   - Update Node.js to latest LTS
   - Check TypeScript configuration

### Performance Issues
- Enable React DevTools Profiler
- Monitor bundle size with `npm run build`
- Check network tab for API response times
- Use Lighthouse for performance audits

## Contributing

1. Create feature branch from main
2. Follow existing code style and patterns
3. Add tests for new functionality
4. Update documentation as needed
5. Submit pull request with description

## License

MIT License - see LICENSE file for details
# Product Context

This file provides a high-level overview of the project and the expected product that will be created. Initially it is based upon projectBrief.md (if provided) and all other available project-related information in the working directory. This file is intended to be updated as the project evolves, and should be used to inform all other modes of the project's goals and context.

## Project Overview

SceneryAddonsDB is a comprehensive .NET 9 Web API for managing, tracking, and **downloading** Microsoft Flight Simulator scenery addons from SceneryAddons.org with **real BitTorrent integration**. The project consists of a mature backend API with full CRUD operations, real-time scraping, download management, and automated background processing.

## Project Goal

Develop a robust web-based user interface for the existing SceneryAddonsDB API to provide users with an intuitive way to browse, search, manage, and download Microsoft Flight Simulator scenery addons. The UI should leverage all existing API capabilities while providing a modern, responsive, and user-friendly experience.

## Key Features

### Backend API (Existing)
- **Real-time Scraping**: Automatically scrapes latest addons from SceneryAddons.org
- **MongoDB Integration**: Stores addon data with full CRUD operations
- **RESTful API**: Complete API endpoints for addon management
- **Download Management**: Real BitTorrent downloads with MonoTorrent 3.0.2
- **Concurrent Downloads**: Configurable concurrent download limits (1-10 per session)
- **Progress Monitoring**: Real-time download progress and speed tracking
- **Session Management**: Multiple download sessions with full control
- **Report Generation**: Detailed analytics and statistics
- **Background Processing**: Automated hourly scraping with background workers

### Frontend UI (To Be Developed)
- **Addon Browser**: Browse and search addons with advanced filtering
- **Download Manager**: Manage downloads with real-time progress tracking
- **Dashboard**: Overview of system statistics and recent activity
- **Session Management**: Control multiple download sessions
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Real-time Updates**: Live progress and status updates

## Overall Architecture

### Current Architecture
- **Backend**: .NET 9 Web API with ASP.NET Core
- **Database**: MongoDB with MongoDB.Entities ODM
- **Download Engine**: MonoTorrent 3.0.2 for BitTorrent downloads
- **Background Services**: Automated scraping and processing
- **API Documentation**: Swagger/OpenAPI integration

### Planned Frontend Architecture
- **Technology Stack**: React 18 + TypeScript + Vite + Tailwind CSS 4.0
- **State Management**: Context API with custom hooks
- **API Integration**: Axios with TypeScript definitions
- **Real-time Updates**: WebSocket/SignalR for progress tracking
- **Responsive Design**: Mobile-first with accessibility compliance

2025-01-08 09:25:42 - Initial Memory Bank creation for SceneryAddonsDB UI analysis and planning project
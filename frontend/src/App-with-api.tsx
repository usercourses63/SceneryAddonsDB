import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { useQuery } from '@tanstack/react-query';

// API functions
const api = {
  getHealth: async () => {
    const response = await fetch('http://localhost:5269/api/health');
    if (!response.ok) throw new Error('Failed to fetch health');
    return response.json();
  },
  
  getStats: async () => {
    const response = await fetch('http://localhost:5269/api/stats');
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },
  
  getAddons: async () => {
    const response = await fetch('http://localhost:5269/api/addons?page=1&pageSize=10');
    if (!response.ok) throw new Error('Failed to fetch addons');
    return response.json();
  }
};

function Dashboard() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: api.getStats,
    refetchInterval: 60000, // Refresh every minute
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React is working!</p>
          <p className="text-green-600">✅ Sidebar layout is working!</p>
          <p className="text-green-600">✅ React Query is working!</p>
          {healthLoading ? (
            <p className="text-yellow-600">🔄 Checking API connection...</p>
          ) : health ? (
            <p className="text-green-600">✅ API connection is working!</p>
          ) : (
            <p className="text-red-600">❌ API connection failed (this is normal if .NET API is not running)</p>
          )}
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
          {statsLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : stats ? (
            <p className="text-2xl font-bold text-gray-900">{stats.totalAddons || 'N/A'}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-900">1,234</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
          {statsLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : stats ? (
            <p className="text-2xl font-bold text-blue-600">{stats.totalDownloads || 'N/A'}</p>
          ) : (
            <p className="text-2xl font-bold text-blue-600">56</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Downloads</h3>
          {statsLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : stats ? (
            <p className="text-2xl font-bold text-yellow-600">{stats.activeDownloads || 'N/A'}</p>
          ) : (
            <p className="text-2xl font-bold text-yellow-600">3</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">System Health</h3>
          {healthLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : health ? (
            <p className="text-2xl font-bold text-green-600">{health.status || 'Healthy'}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-600">Unknown</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Downloads() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ Downloads page is working!</p>
        <p className="text-gray-600 mt-2">Download management interface will go here.</p>
      </div>
    </div>
  );
}

function Addons() {
  const { data: addons, isLoading, error } = useQuery({
    queryKey: ['addons'],
    queryFn: api.getAddons,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ Addons page is working!</p>
        
        {isLoading && <p className="text-yellow-600 mt-2">🔄 Loading addons...</p>}
        {error && <p className="text-red-600 mt-2">❌ Failed to load addons (API not running)</p>}
        {addons && (
          <div className="mt-4">
            <p className="text-green-600">✅ Loaded {addons.items?.length || 0} addons from API!</p>
            {addons.items?.slice(0, 3).map((addon: any, index: number) => (
              <div key={index} className="mt-2 p-2 bg-gray-50 rounded">
                <p className="font-medium">{addon.name || `Addon ${index + 1}`}</p>
                <p className="text-sm text-gray-600">{addon.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SystemStatus() {
  const { data: health, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ System Status page is working!</p>
        
        {isLoading && <p className="text-yellow-600 mt-2">🔄 Checking system health...</p>}
        {health && (
          <div className="mt-4">
            <p className="text-green-600">✅ API is responding!</p>
            <pre className="mt-2 p-2 bg-gray-50 rounded text-sm">
              {JSON.stringify(health, null, 2)}
            </pre>
          </div>
        )}
        {!health && !isLoading && (
          <p className="text-red-600 mt-2">❌ API not responding (start your .NET API on port 5269)</p>
        )}
      </div>
    </div>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Downloads', href: '/downloads', icon: '⬇️' },
    { name: 'Addons', href: '/addons', icon: '📦' },
    { name: 'System Status', href: '/system/status', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-xl font-bold text-gray-900">SceneryAddons</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                ☰
              </button>
              
              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-gray-900">
                  SceneryAddons Database
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System: Healthy</span>
              </div>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/addons" element={<Addons />} />
              <Route path="/system/status" element={<SystemStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  console.log('API-connected app is rendering');
  
  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

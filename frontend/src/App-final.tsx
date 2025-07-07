import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { useQuery } from '@tanstack/react-query';

// API functions with correct endpoints
const api = {
  getHealth: async () => {
    const response = await fetch('http://localhost:5269/api/health');
    if (!response.ok) throw new Error('Failed to fetch health');
    return response.json();
  },
  
  getStatusReport: async () => {
    const response = await fetch('http://localhost:5269/api/reports/status');
    if (!response.ok) throw new Error('Failed to fetch status report');
    return response.json();
  },
  
  getAddons: async (page = 1, pageSize = 10) => {
    const response = await fetch(`http://localhost:5269/api/addons?page=${page}&pageSize=${pageSize}`);
    if (!response.ok) throw new Error('Failed to fetch addons');
    return response.json();
  }
};

function Dashboard() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: api.getStatusReport,
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to SceneryAddons Database - Your central hub for MSFS addon management
        </p>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-green-600">✅ React Frontend</p>
            <p className="text-green-600">✅ Sidebar Layout</p>
            <p className="text-green-600">✅ React Query</p>
          </div>
          <div className="space-y-2">
            {healthLoading ? (
              <p className="text-yellow-600">🔄 Checking API...</p>
            ) : health ? (
              <p className="text-green-600">✅ API Connected</p>
            ) : (
              <p className="text-red-600">❌ API Disconnected</p>
            )}
            {statusLoading ? (
              <p className="text-yellow-600">🔄 Loading Database...</p>
            ) : statusReport ? (
              <p className="text-green-600">✅ Database Connected</p>
            ) : (
              <p className="text-red-600">❌ Database Unavailable</p>
            )}
          </div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
          {statusLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : statusReport?.databaseStats ? (
            <p className="text-2xl font-bold text-gray-900">{statusReport.databaseStats.totalAddons.toLocaleString()}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-400">N/A</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Recent Addons (7 days)</h3>
          {statusLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : statusReport?.databaseStats ? (
            <p className="text-2xl font-bold text-blue-600">{statusReport.databaseStats.recentAddons}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-400">N/A</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">MSFS 2020/2024</h3>
          {statusLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : statusReport?.compatibilityBreakdown ? (
            <p className="text-2xl font-bold text-green-600">{statusReport.compatibilityBreakdown.msfs2020And2024}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-400">N/A</p>
          )}
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">System Health</h3>
          {healthLoading ? (
            <p className="text-lg text-gray-400">Loading...</p>
          ) : health ? (
            <p className="text-2xl font-bold text-green-600">{health.status}</p>
          ) : (
            <p className="text-2xl font-bold text-gray-400">Unknown</p>
          )}
        </div>
      </div>

      {/* Latest Addons */}
      {statusReport?.latestAddons && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Latest Addons</h2>
          <div className="space-y-3">
            {statusReport.latestAddons.slice(0, 5).map((addon: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 truncate">{addon.addonName}</p>
                  <p className="text-sm text-gray-600">{addon.fileName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{addon.compatibility}</p>
                  <p className="text-xs text-gray-500">{addon.daysAgo}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Downloads() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your addon downloads and view download history
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ Downloads page is working!</p>
        <p className="text-gray-600 mt-2">Download management interface will be implemented here.</p>
      </div>
    </div>
  );
}

function Addons() {
  const { data: addons, isLoading, error } = useQuery({
    queryKey: ['addons'],
    queryFn: () => api.getAddons(1, 10),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse and search through available MSFS scenery addons
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Addon Browser</h2>
        
        {isLoading && <p className="text-yellow-600">🔄 Loading addons...</p>}
        {error && <p className="text-red-600">❌ Failed to load addons: {error.message}</p>}
        {addons && (
          <div className="space-y-4">
            <p className="text-green-600">✅ Loaded {addons.items?.length || 0} addons from API!</p>
            <div className="grid gap-4">
              {addons.items?.map((addon: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{addon.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{addon.description || 'No description available'}</p>
                  <div className="mt-2 flex justify-between items-center">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      {addon.compatibility || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {addon.dateAdded ? new Date(addon.dateAdded).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SystemStatus() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 5000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: api.getStatusReport,
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor system health and performance metrics
        </p>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Health</h2>
        {healthLoading && <p className="text-yellow-600">🔄 Checking system health...</p>}
        {health && (
          <div className="space-y-2">
            <p className="text-green-600">✅ API is responding!</p>
            <div className="bg-gray-50 p-3 rounded">
              <pre className="text-sm">{JSON.stringify(health, null, 2)}</pre>
            </div>
          </div>
        )}
        {!health && !healthLoading && (
          <p className="text-red-600">❌ API not responding</p>
        )}
      </div>

      {statusReport && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Database Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Database Statistics</h3>
              <div className="space-y-1 text-sm">
                <p>Total Addons: <span className="font-medium">{statusReport.databaseStats?.totalAddons}</span></p>
                <p>Recent Addons: <span className="font-medium">{statusReport.databaseStats?.recentAddons}</span></p>
                <p>Date Range: <span className="font-medium">{statusReport.databaseStats?.dateRange}</span></p>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Compatibility Breakdown</h3>
              <div className="space-y-1 text-sm">
                <p>MSFS 2020/2024: <span className="font-medium">{statusReport.compatibilityBreakdown?.msfs2020And2024}</span></p>
                <p>MSFS 2020: <span className="font-medium">{statusReport.compatibilityBreakdown?.msfs2020}</span></p>
                <p>MSFS 2024: <span className="font-medium">{statusReport.compatibilityBreakdown?.msfs2024}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
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
              <span className="text-lg font-semibold text-gray-900">SceneryAddons Database</span>
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
  console.log('Final SceneryAddons app is rendering');
  
  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';

// Simple notification state
function Dashboard() {
  const [notifications, setNotifications] = useState<string[]>([]);

  const showNotification = (message: string) => {
    setNotifications(prev => [...prev, message]);
    setTimeout(() => {
      setNotifications(prev => prev.slice(1));
    }, 3000);
  };

  return (
    <div className="space-y-6">
      {/* Simple notifications display */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-green-500 text-white px-4 py-2 rounded shadow-lg"
            >
              {notification}
            </div>
          ))}
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Downloads</h3>
          <p className="text-2xl font-bold text-blue-600">56</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active</h3>
          <p className="text-2xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-purple-600">53</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React Query Provider loaded</p>
          <p className="text-green-600">✅ Simple Notifications working</p>
          <p className="text-green-600">✅ Sidebar Layout working</p>
          <p className="text-green-600">✅ All systems working!</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Test Notifications</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button 
            onClick={() => showNotification('✅ Success!')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Success
          </button>
          <button 
            onClick={() => showNotification('❌ Error!')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Error
          </button>
          <button 
            onClick={() => showNotification('⚠️ Warning!')}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
          >
            Warning
          </button>
          <button 
            onClick={() => showNotification('ℹ️ Info!')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Info
          </button>
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
        <p className="text-gray-600">Download management page - Coming soon!</p>
      </div>
    </div>
  );
}

function Addons() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Addon browsing page - Coming soon!</p>
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">System monitoring page - Coming soon!</p>
      </div>
    </div>
  );
}

// Simple Layout with Sidebar
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/' },
    { name: 'Downloads', href: '/downloads' },
    { name: 'Addons', href: '/addons' },
    { name: 'System Status', href: '/system/status' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-900">SceneryAddons</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="pl-64">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-6">
            <h1 className="text-lg font-semibold text-gray-900">
              SceneryAddons Database
            </h1>
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System: Healthy</span>
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-6">
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
  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

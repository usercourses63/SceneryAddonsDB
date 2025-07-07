import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';
import { SimpleLayout } from './components/layout/SimpleLayout';
import { useToast } from './contexts/ToastContext';

// Test Dashboard with toast functionality
function Dashboard() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to SceneryAddons Database - Your central hub for MSFS addon management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
          <p className="text-2xl font-bold text-gray-900">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Recent Addons</h3>
          <p className="text-2xl font-bold text-gray-900">56</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Active Downloads</h3>
          <p className="text-2xl font-bold text-blue-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Downloaded</h3>
          <p className="text-2xl font-bold text-gray-900">2.4 GB</p>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">System Status</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React is working</p>
          <p className="text-green-600">✅ TypeScript is working</p>
          <p className="text-green-600">✅ Tailwind CSS is working</p>
          <p className="text-green-600">✅ React Query Provider loaded</p>
          <p className="text-green-600">✅ Toast Notifications loaded</p>
          <p className="text-green-600">✅ Simple Layout with Sidebar loaded</p>
        </div>
      </div>

      {/* Test Toast Notifications */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Test Toast Notifications</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button 
            onClick={() => showSuccess('Success!', 'Download completed successfully')}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
          >
            Success Toast
          </button>
          <button 
            onClick={() => showError('Error!', 'Download failed to start')}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Error Toast
          </button>
          <button 
            onClick={() => showWarning('Warning!', 'Low disk space detected')}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors"
          >
            Warning Toast
          </button>
          <button 
            onClick={() => showInfo('Info!', 'New addon available')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Info Toast
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            🔍 Search Addons
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            ⬇️ Start Download
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            📋 View Queue
          </button>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
            ⚙️ System Status
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

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <Router>
          <Routes>
            <Route path="/" element={<SimpleLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/addons" element={<Addons />} />
              <Route path="/system/status" element={<SystemStatus />} />
            </Route>
          </Routes>
        </Router>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

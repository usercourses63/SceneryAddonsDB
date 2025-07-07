import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';
import { useToast } from './contexts/ToastContext';

// Test component that uses toast
function Dashboard() {
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Addons</h3>
          <p className="text-3xl font-bold text-blue-600">1,234</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Downloads</h3>
          <p className="text-3xl font-bold text-green-600">56</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Active</h3>
          <p className="text-3xl font-bold text-yellow-600">3</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Completed</h3>
          <p className="text-3xl font-bold text-purple-600">53</p>
        </div>
      </div>
      
      <div className="mt-8 space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Status</h2>
          <p className="text-green-600 mb-2">✅ React Query Provider loaded</p>
          <p className="text-green-600 mb-4">✅ Toast Notifications loaded</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Toast Notifications</h2>
          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={() => showSuccess('Success!', 'This is a success message')}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Success
            </button>
            <button 
              onClick={() => showError('Error!', 'This is an error message')}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Test Error
            </button>
            <button 
              onClick={() => showWarning('Warning!', 'This is a warning message')}
              className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700"
            >
              Test Warning
            </button>
            <button 
              onClick={() => showInfo('Info!', 'This is an info message')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Info
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Downloads() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Downloads</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Download management page</p>
      </div>
    </div>
  );
}

function Addons() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Addons</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Addon browsing page</p>
      </div>
    </div>
  );
}

// Simple Layout
function Layout() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">SceneryAddons Database</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">System: Healthy</span>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <a href="/" className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium">
              Dashboard
            </a>
            <a href="/downloads" className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium">
              Downloads
            </a>
            <a href="/addons" className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium">
              Addons
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/downloads" element={<Downloads />} />
          <Route path="/addons" element={<Addons />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <Router>
          <Layout />
        </Router>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

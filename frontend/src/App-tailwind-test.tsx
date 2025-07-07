import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-2">
          <p className="text-green-600">✅ Dashboard page is working!</p>
          <p className="text-green-600">✅ React Router is working!</p>
          <p className="text-green-600">✅ Tailwind CSS is working!</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mt-8">
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
          <p className="text-2xl font-bold text-green-600">53</p>
        </div>
      </div>
    </div>
  );
}

function Downloads() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Downloads</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ Downloads page is working!</p>
        <p className="text-gray-600 mt-2">Download management interface will go here.</p>
      </div>
    </div>
  );
}

function Addons() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">Addons</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-green-600">✅ Addons page is working!</p>
        <p className="text-gray-600 mt-2">Addon browsing interface will go here.</p>
      </div>
    </div>
  );
}

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
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System: Healthy</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link 
              to="/" 
              className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link 
              to="/downloads" 
              className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium transition-colors"
            >
              Downloads
            </Link>
            <Link 
              to="/addons" 
              className="text-gray-300 hover:text-white px-3 py-4 text-sm font-medium transition-colors"
            >
              Addons
            </Link>
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
  console.log('Tailwind test app is rendering');
  
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

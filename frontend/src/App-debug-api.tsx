import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';

function Dashboard() {
  const [apiStatus, setApiStatus] = useState('Testing...');
  const [healthData, setHealthData] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    const testAPI = async () => {
      const testResults = [];
      
      // Test 1: Health endpoint
      try {
        console.log('Testing health endpoint...');
        const healthResponse = await fetch('http://localhost:5269/api/health');
        console.log('Health response status:', healthResponse.status);
        
        if (healthResponse.ok) {
          const healthJson = await healthResponse.json();
          console.log('Health data:', healthJson);
          setHealthData(healthJson);
          testResults.push('✅ Health endpoint working');
        } else {
          testResults.push(`❌ Health endpoint failed: ${healthResponse.status}`);
        }
      } catch (error) {
        console.error('Health endpoint error:', error);
        testResults.push(`❌ Health endpoint error: ${error.message}`);
      }

      // Test 2: Status endpoint
      try {
        console.log('Testing status endpoint...');
        const statusResponse = await fetch('http://localhost:5269/api/reports/status');
        console.log('Status response status:', statusResponse.status);
        
        if (statusResponse.ok) {
          const statusJson = await statusResponse.json();
          console.log('Status data:', statusJson);
          setStatusData(statusJson);
          testResults.push('✅ Status endpoint working');
        } else {
          testResults.push(`❌ Status endpoint failed: ${statusResponse.status}`);
        }
      } catch (error) {
        console.error('Status endpoint error:', error);
        testResults.push(`❌ Status endpoint error: ${error.message}`);
      }

      setErrors(testResults);
      setApiStatus('Testing complete');
    };

    testAPI();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">API Debug Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Testing API connectivity and data retrieval
        </p>
      </div>

      {/* API Test Results */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">API Test Results</h2>
        <p className="mb-4 font-medium">Status: {apiStatus}</p>
        
        <div className="space-y-2 mb-6">
          {errors.map((error, index) => (
            <p key={index} className={error.includes('✅') ? 'text-green-600' : 'text-red-600'}>
              {error}
            </p>
          ))}
        </div>

        {/* Health Data */}
        {healthData && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Health Data:</h3>
            <div className="bg-gray-50 p-3 rounded">
              <pre className="text-sm">{JSON.stringify(healthData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Status Data */}
        {statusData && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-900 mb-2">Status Data:</h3>
            <div className="bg-gray-50 p-3 rounded max-h-96 overflow-y-auto">
              <pre className="text-sm">{JSON.stringify(statusData, null, 2)}</pre>
            </div>
          </div>
        )}

        {/* Manual Test Buttons */}
        <div className="space-y-4">
          <h3 className="font-medium text-gray-900">Manual Tests:</h3>
          <div className="space-x-4">
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5269/api/health');
                  const data = await response.json();
                  alert(`Health: ${JSON.stringify(data)}`);
                } catch (error) {
                  alert(`Error: ${error.message}`);
                }
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Test Health
            </button>
            
            <button
              onClick={async () => {
                try {
                  const response = await fetch('http://localhost:5269/api/reports/status');
                  const data = await response.json();
                  alert(`Status loaded! Total addons: ${data.totalAddons}`);
                } catch (error) {
                  alert(`Error: ${error.message}`);
                }
              }}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Test Status
            </button>

            <button
              onClick={() => {
                console.log('=== CONSOLE DEBUG INFO ===');
                console.log('Current URL:', window.location.href);
                console.log('Health data:', healthData);
                console.log('Status data:', statusData);
                console.log('Errors:', errors);
                alert('Check browser console (F12) for detailed debug info');
              }}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Debug Console
            </button>
          </div>
        </div>
      </div>

      {/* Display parsed data if available */}
      {statusData && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Parsed Data Display</h2>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700">Total Addons</h3>
              <p className="text-2xl font-bold text-blue-900">{statusData.totalAddons}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-green-700">Recent Addons</h3>
              <p className="text-2xl font-bold text-green-900">{statusData.recentAddons}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-yellow-700">MSFS 2020/2024</h3>
              <p className="text-2xl font-bold text-yellow-900">{statusData.compatibilityBreakdown?.['MSFS 2020/2024']}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-purple-700">Database Status</h3>
              <p className="text-2xl font-bold text-purple-900">{statusData.databaseStatus}</p>
            </div>
          </div>

          {statusData.latestAddons && (
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Latest Addons:</h3>
              <div className="space-y-2">
                {statusData.latestAddons.slice(0, 3).map((addon, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded">
                    <p className="font-medium">{addon.name}</p>
                    <p className="text-sm text-gray-600">{addon.fileName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'API Debug', href: '/', icon: '🔍' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <span className="text-xl font-bold text-gray-900">API Debug</span>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center px-3 py-2 text-sm font-medium rounded-lg bg-blue-100 text-blue-700"
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      <div className="lg:pl-64">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center px-6">
            <h1 className="text-lg font-semibold text-gray-900">
              SceneryAddons API Debug
            </h1>
          </div>
        </header>
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  console.log('API Debug app is rendering');
  
  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

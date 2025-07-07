import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { SimpleLayout3 } from './components/layout/SimpleLayout3';

// Simple test page
function TestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Debug Mode - Step 7</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Complete Simple Layout</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React is working</p>
          <p className="text-green-600">✅ Router is working</p>
          <p className="text-green-600">✅ QueryProvider is working</p>
          <p className="text-green-600">✅ ToastProvider is working</p>
          <p className="text-green-600">✅ SignalRProvider is working</p>
          <p className="text-green-600">✅ Simple Layout is working</p>
          <p className="text-green-600">✅ Simple Header is working</p>
          <p className="text-green-600">✅ Simple Sidebar is working</p>
          <p className="text-green-600">✅ Tailwind is working</p>
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
        <p className="text-gray-600">Download management page - Working!</p>
      </div>
    </div>
  );
}

function Addons() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">Addon browsing page - Working!</p>
      </div>
    </div>
  );
}

function SystemStatus() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">System monitoring page - Working!</p>
      </div>
    </div>
  );
}

// Test Layout with providers
function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <SignalRProvider>
          <Router>
            <Routes>
              <Route path="/" element={<SimpleLayout3 />}>
                <Route index element={<TestPage />} />
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/addons" element={<Addons />} />
                <Route path="/system/status" element={<SystemStatus />} />
              </Route>
            </Routes>
          </Router>
        </SignalRProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

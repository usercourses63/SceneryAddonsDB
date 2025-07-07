import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { SimpleLayout2 } from './components/layout/SimpleLayout2';

// Simple test page
function TestPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Debug Mode - Step 6</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Layout Without SignalR Events</h2>
        <div className="space-y-2">
          <p className="text-green-600">✅ React is working</p>
          <p className="text-green-600">✅ Router is working</p>
          <p className="text-green-600">✅ QueryProvider is working</p>
          <p className="text-green-600">✅ ToastProvider is working</p>
          <p className="text-green-600">✅ SignalRProvider is working</p>
          <p className="text-green-600">✅ Simple Layout is working</p>
          <p className="text-green-600">✅ Tailwind is working</p>
        </div>
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
              <Route path="/" element={<SimpleLayout2 />}>
                <Route index element={<TestPage />} />
              </Route>
            </Routes>
          </Router>
        </SignalRProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

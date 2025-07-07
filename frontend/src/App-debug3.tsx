import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';

// Test ToastProvider
function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Debug Mode - Step 3
            </h1>
            <p className="text-gray-600 mb-4">
              Testing React + Router + QueryProvider + ToastProvider
            </p>
            <div className="space-y-2">
              <div className="bg-blue-100 p-3 rounded">
                <p className="text-blue-800 font-medium">✅ React is working</p>
              </div>
              <div className="bg-green-100 p-3 rounded">
                <p className="text-green-800 font-medium">✅ Router is working</p>
              </div>
              <div className="bg-purple-100 p-3 rounded">
                <p className="text-purple-800 font-medium">✅ QueryProvider is working</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded">
                <p className="text-yellow-800 font-medium">✅ ToastProvider is working</p>
              </div>
              <div className="bg-pink-100 p-3 rounded">
                <p className="text-pink-800 font-medium">✅ Tailwind is working</p>
              </div>
            </div>
          </div>
        </div>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

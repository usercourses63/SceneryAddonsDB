import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Test basic imports first
function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Debug Mode
        </h1>
        <p className="text-gray-600 mb-4">
          Testing basic React + Router setup
        </p>
        <div className="space-y-2">
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-blue-800 font-medium">✅ React is working</p>
          </div>
          <div className="bg-green-100 p-3 rounded">
            <p className="text-green-800 font-medium">✅ Router is working</p>
          </div>
          <div className="bg-purple-100 p-3 rounded">
            <p className="text-purple-800 font-medium">✅ Tailwind is working</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          SceneryAddons Database
        </h1>
        <p className="text-gray-600 mb-4">
          React frontend is working! 🎉
        </p>
        <div className="space-y-2">
          <div className="bg-blue-100 p-3 rounded">
            <p className="text-blue-800 font-medium">✅ React is loaded</p>
          </div>
          <div className="bg-green-100 p-3 rounded">
            <p className="text-green-800 font-medium">✅ Tailwind CSS is working</p>
          </div>
          <div className="bg-purple-100 p-3 rounded">
            <p className="text-purple-800 font-medium">✅ TypeScript is working</p>
          </div>
        </div>
        <button 
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          onClick={() => alert('Button clicked!')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;

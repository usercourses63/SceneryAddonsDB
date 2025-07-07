import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

function Dashboard() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#111827', marginBottom: '16px' }}>Dashboard</h1>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p>✅ Dashboard page is working!</p>
        <p>✅ React Router is working!</p>
      </div>
    </div>
  );
}

function Downloads() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#111827', marginBottom: '16px' }}>Downloads</h1>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p>✅ Downloads page is working!</p>
      </div>
    </div>
  );
}

function Addons() {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ color: '#111827', marginBottom: '16px' }}>Addons</h1>
      <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <p>✅ Addons page is working!</p>
      </div>
    </div>
  );
}

function Layout() {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb' }}>
      {/* Simple Header */}
      <header style={{ backgroundColor: 'white', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h1 style={{ margin: 0, color: '#111827' }}>SceneryAddons Database</h1>
      </header>
      
      {/* Simple Navigation */}
      <nav style={{ backgroundColor: '#374151', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <Link 
            to="/" 
            style={{ color: '#d1d5db', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Dashboard
          </Link>
          <Link 
            to="/downloads" 
            style={{ color: '#d1d5db', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Downloads
          </Link>
          <Link 
            to="/addons" 
            style={{ color: '#d1d5db', textDecoration: 'none', padding: '8px 12px', borderRadius: '4px' }}
            onMouseOver={(e) => e.target.style.backgroundColor = '#4b5563'}
            onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            Addons
          </Link>
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
  console.log('Router test app is rendering');
  
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;

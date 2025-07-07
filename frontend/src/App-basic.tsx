import React from 'react';

function App() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f3f4f6', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        maxWidth: '400px',
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        padding: '24px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold', 
          color: '#111827', 
          marginBottom: '16px' 
        }}>
          SceneryAddons Database
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '16px' }}>
          React frontend is working! 🎉
        </p>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ 
            backgroundColor: '#dbeafe', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '8px' 
          }}>
            <p style={{ color: '#1e40af', fontWeight: '500' }}>✅ React is loaded</p>
          </div>
          <div style={{ 
            backgroundColor: '#dcfce7', 
            padding: '12px', 
            borderRadius: '4px', 
            marginBottom: '8px' 
          }}>
            <p style={{ color: '#166534', fontWeight: '500' }}>✅ Basic styling works</p>
          </div>
          <div style={{ 
            backgroundColor: '#f3e8ff', 
            padding: '12px', 
            borderRadius: '4px' 
          }}>
            <p style={{ color: '#7c3aed', fontWeight: '500' }}>✅ TypeScript is working</p>
          </div>
        </div>
        <button 
          style={{
            width: '100%',
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={() => alert('Button clicked! React is working properly.')}
        >
          Test Button
        </button>
      </div>
    </div>
  );
}

export default App;

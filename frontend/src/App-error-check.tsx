import React from 'react';

// Error boundary to catch any React errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('React Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: '100vh', 
          backgroundColor: '#fee2e2', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontFamily: 'Arial, sans-serif',
          padding: '20px'
        }}>
          <div style={{
            maxWidth: '500px',
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            border: '2px solid #dc2626'
          }}>
            <h1 style={{ color: '#dc2626', marginBottom: '16px' }}>
              ❌ React Error Detected
            </h1>
            <p style={{ marginBottom: '16px' }}>
              There was an error in the React application:
            </p>
            <pre style={{ 
              backgroundColor: '#f3f4f6', 
              padding: '12px', 
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto'
            }}>
              {this.state.error?.toString()}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '8px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  // Log to console to verify this component is being called
  console.log('App component is rendering');

  return (
    <ErrorBoundary>
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
            🔍 Error Check Mode
          </h1>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            This version includes error checking and console logging.
          </p>
          <div style={{ marginBottom: '16px' }}>
            <div style={{ 
              backgroundColor: '#dbeafe', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '8px' 
            }}>
              <p style={{ color: '#1e40af', fontWeight: '500' }}>✅ React is rendering</p>
            </div>
            <div style={{ 
              backgroundColor: '#dcfce7', 
              padding: '12px', 
              borderRadius: '4px', 
              marginBottom: '8px' 
            }}>
              <p style={{ color: '#166534', fontWeight: '500' }}>✅ Error boundary is active</p>
            </div>
            <div style={{ 
              backgroundColor: '#f3e8ff', 
              padding: '12px', 
              borderRadius: '4px' 
            }}>
              <p style={{ color: '#7c3aed', fontWeight: '500' }}>✅ Console logging enabled</p>
            </div>
          </div>
          <div style={{ 
            backgroundColor: '#fef3c7', 
            padding: '12px', 
            borderRadius: '4px',
            marginBottom: '16px'
          }}>
            <p style={{ color: '#92400e', fontWeight: '500', fontSize: '14px' }}>
              📝 Check browser console (F12) for any error messages
            </p>
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
            onClick={() => {
              console.log('Button clicked successfully!');
              alert('Button works! Check console for logs.');
            }}
          >
            Test Button & Console
          </button>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;

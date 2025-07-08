import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppLayout } from '@/components/layout/AppLayout';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Dashboard } from '@/pages/Dashboard';
import AddonsPage from '@/pages/AddonsPage';
import EnhancedAddonsPage from '@/pages/EnhancedAddonsPage';
import AdvancedSearchPage from '@/pages/AdvancedSearchPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import Downloads from '@/pages/Downloads';
import { SystemStatus } from '@/pages/SystemStatus';

function App() {
  return (
    <ThemeProvider>
      <ErrorBoundary>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/addons" element={<AddonsPage />} />
            <Route path="/addons-enhanced" element={<EnhancedAddonsPage />} />
            <Route path="/advanced-search" element={<AdvancedSearchPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/downloads" element={<Downloads />} />
            <Route path="/system-status" element={<SystemStatus />} />
          </Routes>
        </AppLayout>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
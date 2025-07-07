import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { SignalRProvider } from './contexts/SignalRContext';
import { ToastProvider } from './contexts/ToastContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Downloads } from './pages/Downloads';
import { DownloadQueue } from './pages/DownloadQueue';
import { DownloadHistory } from './pages/DownloadHistory';
import { Addons } from './pages/Addons';
import { AddonDetails } from './pages/AddonDetails';
import { LatestAddons } from './pages/LatestAddons';
import { SystemStatus } from './pages/SystemStatus';
import { SystemLogs } from './pages/SystemLogs';

function App() {
  return (
    <QueryProvider>
      <SignalRProvider>
        <ToastProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                {/* Download Management Pages */}
                <Route path="/downloads" element={<Downloads />} />
                <Route path="/downloads/queue" element={<DownloadQueue />} />
                <Route path="/downloads/history" element={<DownloadHistory />} />
                <Route path="/downloads/sessions" element={<div>Download Sessions</div>} />
                <Route path="/downloads/start" element={<div>Start Download</div>} />
                {/* Addon Browsing Pages */}
                <Route path="/addons" element={<Addons />} />
                <Route path="/addons/search" element={<Addons />} />
                <Route path="/addons/latest" element={<LatestAddons />} />
                <Route path="/addons/:id" element={<AddonDetails />} />
                {/* System Monitoring Pages */}
                <Route path="/system/status" element={<SystemStatus />} />
                <Route path="/system/logs" element={<SystemLogs />} />
                <Route path="/performance" element={<div>Performance</div>} />
                <Route path="/reports" element={<div>Reports</div>} />
              </Route>
            </Routes>
          </Router>
        </ToastProvider>
      </SignalRProvider>
    </QueryProvider>
  );
}

export default App;

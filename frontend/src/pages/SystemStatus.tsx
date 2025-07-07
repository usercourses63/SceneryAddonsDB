import React from 'react';
import { useHealth } from '../services/queries';
import { useSignalR } from '../contexts/SignalRContext';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/charts/ProgressBar';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatRelativeTime } from '../utils/format';

export function SystemStatus() {
  const { data: health, isLoading, refetch } = useHealth();
  const { isConnected, connect, disconnect } = useSignalR();

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Healthy':
        return 'text-green-600';
      case 'Warning':
        return 'text-yellow-600';
      case 'Critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Healthy':
        return (
          <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Warning':
        return (
          <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
        );
      case 'Critical':
        return (
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );
      default:
        return (
          <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
          </svg>
        );
    }
  };

  const getServiceStatusIcon = (status: string) => {
    switch (status) {
      case 'Connected':
      case 'Running':
      case 'Active':
        return (
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
        );
      case 'Disconnected':
      case 'Stopped':
      case 'Error':
        return (
          <div className="h-2 w-2 bg-red-500 rounded-full"></div>
        );
      case 'Idle':
        return (
          <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
        );
      default:
        return (
          <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
        );
    }
  };

  if (isLoading) {
    return <LoadingOverlay>Loading system status...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor system health and service status
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => refetch()}>
            <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overall System Status</CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusIcon(health?.status)}
              <span className={`text-lg font-semibold ${getStatusColor(health?.status)}`}>
                {health?.status || 'Unknown'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium text-gray-600">Last Updated</p>
              <p className="text-lg text-gray-900">
                {health?.timestamp ? formatRelativeTime(health.timestamp) : 'Unknown'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Real-time Connection</p>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-lg text-gray-900">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                {!isConnected && (
                  <Button variant="outline" size="sm" onClick={connect}>
                    Reconnect
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Services Status */}
      <Card>
        <CardHeader>
          <CardTitle>Services Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getServiceStatusIcon(health?.services?.database || 'Unknown')}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Database</h4>
                  <p className="text-xs text-gray-500">MongoDB Connection</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {health?.services?.database || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getServiceStatusIcon(health?.services?.api || 'Unknown')}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">API Server</h4>
                  <p className="text-xs text-gray-500">Web API Service</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {health?.services?.api || 'Unknown'}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3">
                {getServiceStatusIcon(health?.services?.scraper || 'Unknown')}
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Scraper Service</h4>
                  <p className="text-xs text-gray-500">Addon Discovery</p>
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {health?.services?.scraper || 'Unknown'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      {health?.performance && (
        <Card>
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <ProgressBar
                  label="CPU Usage"
                  value={health.performance.cpuUsage}
                  max={100}
                  color={health.performance.cpuUsage > 80 ? 'red' : health.performance.cpuUsage > 60 ? 'yellow' : 'green'}
                  showPercentage={true}
                />
              </div>
              
              <div>
                <ProgressBar
                  label="Memory Usage"
                  value={health.performance.memoryUsage}
                  max={100}
                  color={health.performance.memoryUsage > 80 ? 'red' : health.performance.memoryUsage > 60 ? 'yellow' : 'green'}
                  showPercentage={true}
                />
              </div>
              
              <div>
                <ProgressBar
                  label="Disk Usage"
                  value={health.performance.diskUsage}
                  max={100}
                  color={health.performance.diskUsage > 90 ? 'red' : health.performance.diskUsage > 75 ? 'yellow' : 'green'}
                  showPercentage={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6h3.75m-3.75 3h3.75m-3.75 3h3.75M9 6h3.75M9 3h3.75m3 3h3.75m-3.75-3h3.75" />
              </svg>
              View Logs
            </Button>
            
            <Button variant="outline" className="justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
              Performance
            </Button>
            
            <Button variant="outline" className="justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Reports
            </Button>
            
            <Button variant="outline" className="justify-start">
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

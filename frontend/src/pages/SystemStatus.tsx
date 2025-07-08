import React, { useState } from 'react';
import { RefreshCw, AlertCircle, CheckCircle, Settings, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SystemOverview } from '@/components/system/SystemOverview';
import { SystemActions } from '@/components/system/SystemActions';
import { RealTimeMonitor } from '@/components/system/RealTimeMonitor';
import { useSystemMetrics } from '@/hooks/useSystemMonitoring';

export const SystemStatus: React.FC = () => {
  const { isLoading, isError, error, refetch } = useSystemMetrics();
  const [activeTab, setActiveTab] = useState<'overview' | 'monitoring' | 'actions'>('overview');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const handleRefresh = () => {
    refetch();
  };

  const tabs = [
    {
      id: 'overview' as const,
      label: 'System Overview',
      icon: Activity,
      description: 'Key metrics and system health'
    },
    {
      id: 'monitoring' as const,
      label: 'Real-time Monitoring',
      icon: RefreshCw,
      description: 'Live activity and status updates'
    },
    {
      id: 'actions' as const,
      label: 'System Actions',
      icon: Settings,
      description: 'Administrative controls and tools'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
            <p className="text-gray-600 mt-1">
              Monitor API health, database status, and system performance
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Auto-refresh toggle */}
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Auto-refresh</label>
              <button
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoRefresh ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoRefresh ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Manual refresh button */}
            <Button
              onClick={handleRefresh}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {/* System Status Banner */}
        <div className="mt-4">
          {isError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="text-red-800 font-medium">System Error</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                {error instanceof Error ? error.message : 'Unable to fetch system status'}
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-green-800 font-medium">System Operational</span>
              </div>
              <p className="text-green-700 text-sm mt-1">
                All systems are functioning normally
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-4 px-1 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <SystemOverview />
          </div>
        )}

        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <RealTimeMonitor />
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="space-y-6">
            <SystemActions />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div>
            <p>SceneryAddons System Monitor</p>
            <p>Last updated: {new Date().toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p>Auto-refresh: {autoRefresh ? 'Enabled' : 'Disabled'}</p>
            <p>Update interval: 30 seconds</p>
          </div>
        </div>
      </div>
    </div>
  );
};
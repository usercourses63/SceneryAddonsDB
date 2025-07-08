import React, { useState, useEffect } from 'react';
import { Activity, Clock, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { StatusIndicator, StatusBadge, HealthStatus } from '@/components/ui/StatusIndicator';
import { useSystemMetrics } from '@/hooks/useSystemMonitoring';

interface SystemEvent {
  id: string;
  timestamp: Date;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  source: string;
}

export const RealTimeMonitor: React.FC = () => {
  const { health, status, downloadStats, isLoading, error } = useSystemMetrics();
  const [events, setEvents] = useState<SystemEvent[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Simulate real-time events based on system data changes
  useEffect(() => {
    const now = new Date();
    const newEvents: SystemEvent[] = [];

    // Add system health events
    if (health?.status) {
      const healthStatus = health.status.toLowerCase();
      const eventType = healthStatus === 'healthy' ? 'success' : healthStatus === 'warning' ? 'warning' : 'error';
      
      newEvents.push({
        id: `health-${now.getTime()}`,
        timestamp: now,
        type: eventType,
        message: `System health check: ${health.status}`,
        source: 'Health Monitor'
      });
    }

    // Add download events
    if (downloadStats?.activeDownloads !== undefined) {
      const activeCount = downloadStats.activeDownloads;
      if (activeCount > 0) {
        newEvents.push({
          id: `download-${now.getTime()}`,
          timestamp: now,
          type: 'info',
          message: `${activeCount} active downloads in progress`,
          source: 'Download Manager'
        });
      }
    }

    // Add database events
    if (status?.databaseStatus) {
      const dbStatus = status.databaseStatus.toLowerCase();
      newEvents.push({
        id: `db-${now.getTime()}`,
        timestamp: now,
        type: dbStatus === 'connected' ? 'success' : 'error',
        message: `Database status: ${status.databaseStatus}`,
        source: 'Database'
      });
    }

    if (newEvents.length > 0) {
      setEvents(prev => [...newEvents, ...prev.slice(0, 19)]); // Keep only last 20 events
    }

    setLastUpdate(now);
  }, [health, status, downloadStats]);

  const getHealthStatusFromString = (statusStr?: string): HealthStatus => {
    if (!statusStr) return 'unknown';
    
    const status = statusStr.toLowerCase();
    if (status === 'healthy') return 'healthy';
    if (status === 'warning') return 'warning';
    if (status === 'error') return 'error';
    return 'unknown';
  };

  const getEventIcon = (type: SystemEvent['type']) => {
    switch (type) {
      case 'success':
        return CheckCircle;
      case 'warning':
        return AlertCircle;
      case 'error':
        return XCircle;
      default:
        return Activity;
    }
  };

  const getEventColor = (type: SystemEvent['type']) => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* System Health Panel */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">System Health</h3>
          <StatusBadge 
            status={isLoading ? 'loading' : getHealthStatusFromString(status?.systemHealth)} 
            size="sm" 
          />
        </div>

        <div className="space-y-4">
          <StatusIndicator
            status={isLoading ? 'loading' : getHealthStatusFromString(health?.status)}
            label="API Service"
            description={health?.timestamp ? `Last check: ${new Date(health.timestamp).toLocaleTimeString()}` : 'No recent checks'}
          />

          <StatusIndicator
            status={isLoading ? 'loading' : getHealthStatusFromString(status?.databaseStatus === 'Connected' ? 'healthy' : 'error')}
            label="Database"
            description={status?.databaseStatus || 'Status unknown'}
          />

          <StatusIndicator
            status={downloadStats?.activeDownloads ? (downloadStats.activeDownloads > 0 ? 'warning' : 'healthy') : 'unknown'}
            label="Download Service"
            description={`${downloadStats?.activeDownloads || 0} active downloads`}
          />
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <XCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-800 font-medium">Connection Error</span>
            </div>
            <p className="text-sm text-red-700 mt-1">
              Unable to fetch system status. Please check your connection.
            </p>
          </div>
        )}
      </div>

      {/* Live Activity Feed */}
      <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Live Activity</h3>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <Clock className="h-4 w-4" />
            <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            <RefreshCw className="h-4 w-4 animate-spin" />
          </div>
        </div>

        <div className="space-y-3 max-h-96 overflow-y-auto">
          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No recent activity</p>
              <p className="text-sm">System events will appear here</p>
            </div>
          ) : (
            events.map((event) => {
              const Icon = getEventIcon(event.type);
              const colorClass = getEventColor(event.type);
              
              return (
                <div key={event.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <Icon className={`h-5 w-5 mt-0.5 ${colorClass}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">{event.message}</p>
                      <span className="text-xs text-gray-500">
                        {event.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Source: {event.source}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
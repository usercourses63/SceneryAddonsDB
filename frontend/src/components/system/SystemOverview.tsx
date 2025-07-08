import React from 'react';
import { Server, Database, Download, Package, Activity, Clock } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { useSystemMetrics } from '@/hooks/useSystemMonitoring';

export const SystemOverview: React.FC = () => {
  const { health, status, downloadStats, addonStats, isLoading, isError } = useSystemMetrics();

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-medium">Error Loading System Metrics</h3>
        <p className="text-red-600 text-sm mt-1">Unable to fetch system status. Please try again.</p>
      </div>
    );
  }

  // Helper function to determine system health color
  const getHealthColor = (healthStatus?: string) => {
    switch (healthStatus?.toLowerCase()) {
      case 'healthy':
        return 'green';
      case 'warning':
        return 'yellow';
      case 'error':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Calculate uptime display
  const formatUptime = (uptime?: string) => {
    if (!uptime) return 'Unknown';
    // If uptime is in a duration format like "1.23:45:67", parse it
    return uptime;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {/* System Health */}
      <MetricCard
        title="System Health"
        value={status?.systemHealth || 'Unknown'}
        icon={Activity}
        color={getHealthColor(status?.systemHealth)}
        subtitle={`Status: ${health?.status || 'Unknown'}`}
        isLoading={isLoading}
        animated={status?.systemHealth === 'loading'}
      />

      {/* Database Status */}
      <MetricCard
        title="Database"
        value={status?.databaseStatus || 'Unknown'}
        icon={Database}
        color={status?.databaseStatus === 'Connected' ? 'green' : 'red'}
        subtitle="Connection Status"
        isLoading={isLoading}
      />

      {/* Total Addons */}
      <MetricCard
        title="Total Addons"
        value={status?.totalAddons?.toLocaleString() || '0'}
        icon={Package}
        color="blue"
        subtitle={`Recent: ${status?.recentAddons || 0}`}
        isLoading={isLoading}
      />

      {/* Active Downloads */}
      <MetricCard
        title="Active Downloads"
        value={downloadStats?.activeDownloads || 0}
        icon={Download}
        color="purple"
        subtitle={`${downloadStats?.activeSessions || 0} active sessions`}
        isLoading={isLoading}
        animated={downloadStats?.activeDownloads ? downloadStats.activeDownloads > 0 : false}
      />

      {/* Total Downloads */}
      <MetricCard
        title="Total Downloads"
        value={downloadStats?.totalDownloads?.toLocaleString() || '0'}
        icon={Download}
        color="green"
        subtitle={`Completed: ${downloadStats?.completedDownloads || 0}`}
        isLoading={isLoading}
      />

      {/* System Uptime */}
      <MetricCard
        title="System Uptime"
        value={formatUptime(status?.uptime)}
        icon={Clock}
        color="gray"
        subtitle="Since last restart"
        isLoading={isLoading}
      />

      {/* Download Speed */}
      <MetricCard
        title="Download Speed"
        value={downloadStats?.totalSpeedBytesPerSecond 
          ? `${(downloadStats.totalSpeedBytesPerSecond / 1024 / 1024).toFixed(1)} MB/s`
          : '0 MB/s'
        }
        icon={Activity}
        color="blue"
        subtitle="Current total speed"
        isLoading={isLoading}
        animated={downloadStats?.totalSpeedBytesPerSecond ? downloadStats.totalSpeedBytesPerSecond > 0 : false}
      />

      {/* API Status */}
      <MetricCard
        title="API Status"
        value={health?.status || 'Unknown'}
        icon={Server}
        color={health?.status === 'Healthy' ? 'green' : 'red'}
        subtitle={`Last check: ${health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'Unknown'}`}
        isLoading={isLoading}
      />
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  ClockIcon,
  CpuChipIcon,
  SignalIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useAnalytics, PerformanceMetrics, UsageStatistics } from '@/hooks/useAnalytics';
import { MetricCard } from '@/components/ui/MetricCard';
import { Button } from '@/components/ui/Button';

interface PerformanceAnalyticsProps {
  className?: string;
}

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string;
    borderColor: string;
  }[];
}

export const PerformanceAnalytics: React.FC<PerformanceAnalyticsProps> = ({ className }) => {
  const { getSessionMetrics, getUsageStatistics, isEnabled } = useAnalytics();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [statistics, setStatistics] = useState<UsageStatistics | null>(null);
  const [activeTab, setActiveTab] = useState<'performance' | 'usage' | 'errors'>('performance');

  useEffect(() => {
    if (isEnabled) {
      setMetrics(getSessionMetrics());
      setStatistics(getUsageStatistics());
    }
  }, [isEnabled, getSessionMetrics, getUsageStatistics]);

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getPerformanceColor = (value: number, thresholds: { good: number; warning: number }): 'green' | 'yellow' | 'red' => {
    if (value <= thresholds.good) return 'green';
    if (value <= thresholds.warning) return 'yellow';
    return 'red';
  };

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Page Load Time"
          value={metrics ? formatTime(metrics.pageLoadTime) : 'N/A'}
          icon={ClockIcon}
          color={metrics ? getPerformanceColor(metrics.pageLoadTime, { good: 1000, warning: 3000 }) : 'gray'}
          subtitle="Time to interactive"
        />
        
        <MetricCard
          title="API Response"
          value={metrics ? formatTime(metrics.apiResponseTime) : 'N/A'}
          icon={SignalIcon}
          color={metrics ? getPerformanceColor(metrics.apiResponseTime, { good: 500, warning: 1000 }) : 'gray'}
          subtitle="Average response time"
        />
        
        <MetricCard
          title="Search Time"
          value={metrics ? formatTime(metrics.searchTime) : 'N/A'}
          icon={MagnifyingGlassIcon}
          color={metrics ? getPerformanceColor(metrics.searchTime, { good: 300, warning: 1000 }) : 'gray'}
          subtitle="Search response time"
        />
        
        <MetricCard
          title="Memory Usage"
          value={metrics ? formatBytes(metrics.memoryUsage * 1024 * 1024) : 'N/A'}
          icon={CpuChipIcon}
          color={metrics ? getPerformanceColor(metrics.memoryUsage, { good: 50, warning: 100 }) : 'gray'}
          subtitle="JavaScript heap size"
        />
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>
        <div className="space-y-4">
          {metrics && (
            <>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Render Time</span>
                </div>
                <span className="text-sm text-gray-900">{formatTime(metrics.renderTime)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <ArrowDownTrayIcon className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Download Time</span>
                </div>
                <span className="text-sm text-gray-900">{formatTime(metrics.downloadTime)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <SignalIcon className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Network Speed</span>
                </div>
                <span className="text-sm text-gray-900">{metrics.networkSpeed.toFixed(1)} Mbps</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  const renderUsageTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value={statistics?.totalSessions || 0}
          icon={EyeIcon}
          color="blue"
          subtitle="User sessions"
        />
        
        <MetricCard
          title="Total Searches"
          value={statistics?.totalSearches || 0}
          icon={MagnifyingGlassIcon}
          color="green"
          subtitle="Search queries"
        />
        
        <MetricCard
          title="Total Downloads"
          value={statistics?.totalDownloads || 0}
          icon={ArrowDownTrayIcon}
          color="purple"
          subtitle="Addon downloads"
        />
        
        <MetricCard
          title="Error Rate"
          value={statistics ? `${statistics.errorRate.toFixed(1)}%` : '0%'}
          icon={ExclamationTriangleIcon}
          color={statistics ? getPerformanceColor(statistics.errorRate, { good: 1, warning: 5 }) : 'gray'}
          subtitle="Application errors"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Search Terms</h3>
          <div className="space-y-2">
            {statistics && Object.entries(statistics.popularSearchTerms)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([term, count]) => (
                <div key={term} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{term}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Actions</h3>
          <div className="space-y-2">
            {statistics && Object.entries(statistics.userActions)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 10)
              .map(([action, count]) => (
                <div key={action} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 truncate">{action}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderErrorsTab = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Analysis</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
              <span className="text-sm font-medium text-red-700">Error Rate</span>
            </div>
            <span className="text-sm text-red-900">
              {statistics ? `${statistics.errorRate.toFixed(1)}%` : '0%'}
            </span>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <EyeIcon className="h-5 w-5 text-yellow-600 mr-2" />
              <span className="text-sm font-medium text-yellow-700">Bounce Rate</span>
            </div>
            <span className="text-sm text-yellow-900">
              {statistics ? `${statistics.bounceRate.toFixed(1)}%` : '0%'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isEnabled) {
    return (
      <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mr-3" />
          <div>
            <h3 className="text-yellow-800 font-medium">Analytics Disabled</h3>
            <p className="text-yellow-700 text-sm mt-1">
              Enable analytics in settings to view performance data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Performance Analytics</h2>
        <Button
          variant="outline"
          onClick={() => {
            setMetrics(getSessionMetrics());
            setStatistics(getUsageStatistics());
          }}
        >
          <ChartBarIcon className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {[
            { key: 'performance', label: 'Performance', icon: CpuChipIcon },
            { key: 'usage', label: 'Usage', icon: ChartBarIcon },
            { key: 'errors', label: 'Errors', icon: ExclamationTriangleIcon },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'performance' && renderPerformanceTab()}
        {activeTab === 'usage' && renderUsageTab()}
        {activeTab === 'errors' && renderErrorsTab()}
      </div>
    </div>
  );
};

export default PerformanceAnalytics;
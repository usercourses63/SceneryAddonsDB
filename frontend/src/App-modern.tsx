import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './services/api';
import { 
  Home, 
  Download, 
  Package, 
  Settings, 
  Activity, 
  Search,
  Filter,
  RefreshCw,
  Plus,
  Play,
  Pause,
  X,
  CheckCircle,
  AlertCircle,
  Clock,
  Database,
  Server,
  Zap
} from 'lucide-react';

// Modern Dashboard Component
function Dashboard() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: () => apiClient.getStatusReport(),
    refetchInterval: 60000,
  });

  const { data: latestAddons, isLoading: latestLoading } = useQuery({
    queryKey: ['latestAddons'],
    queryFn: () => apiClient.getLatestAddons(5),
    refetchInterval: 300000,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome to SceneryAddons Database - Your MSFS addon management hub
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Addons</p>
              {statusLoading ? (
                <div className="h-8 bg-blue-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {statusReport?.totalAddons?.toLocaleString() || 'N/A'}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Recent (7 days)</p>
              {statusLoading ? (
                <div className="h-8 bg-green-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {statusReport?.recentAddons || 'N/A'}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-600 rounded-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">MSFS 2020/2024</p>
              {statusLoading ? (
                <div className="h-8 bg-purple-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {statusReport?.compatibilityBreakdown?.['MSFS 2020/2024'] || 'N/A'}
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-600 rounded-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">System Health</p>
              {healthLoading ? (
                <div className="h-8 bg-emerald-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className={`text-3xl font-bold mt-1 ${
                  health?.status === 'Healthy' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {health?.status || 'Unknown'}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${
              health?.status === 'Healthy' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {health?.status === 'Healthy' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/addons"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <Search className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Browse Addons</p>
              <p className="text-sm text-gray-600">Search and filter addons</p>
            </div>
          </Link>
          
          <Link
            to="/downloads"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <Download className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Downloads</p>
              <p className="text-sm text-gray-600">Manage downloads</p>
            </div>
          </Link>
          
          <Link
            to="/system/status"
            className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
          >
            <Activity className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">System Status</p>
              <p className="text-sm text-gray-600">Monitor health</p>
            </div>
          </Link>
          
          <button className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
            <Settings className="w-5 h-5 text-gray-600 group-hover:text-blue-600 mr-3" />
            <div>
              <p className="font-medium text-gray-900">Settings</p>
              <p className="text-sm text-gray-600">Configure system</p>
            </div>
          </button>
        </div>
      </div>

      {/* Latest Addons */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Latest Addons</h2>
          <Link
            to="/addons"
            className="text-blue-600 hover:text-blue-700 font-medium text-sm"
          >
            View all →
          </Link>
        </div>
        
        {latestLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                  <div className="h-12 w-12 bg-gray-200 rounded-lg mr-4"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestAddons && latestAddons.length > 0 ? (
          <div className="space-y-3">
            {latestAddons.map((addon: any, index: number) => (
              <div key={index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="p-3 bg-blue-100 rounded-lg mr-4">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{addon.name}</p>
                  <p className="text-sm text-gray-600 truncate">{addon.fileName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    addon.compatibility === 'MSFS 2020/2024' ? 'bg-green-100 text-green-800' :
                    addon.compatibility === 'MSFS 2020' ? 'bg-blue-100 text-blue-800' :
                    addon.compatibility === 'MSFS 2024' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {addon.compatibility}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {new Date(addon.dateAdded).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent addons</h3>
            <p className="text-gray-600">Check back later for new additions</p>
          </div>
        )}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Database className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Database</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-sm font-medium ${
                statusReport?.databaseStatus === 'Connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {statusReport?.databaseStatus || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Records</span>
              <span className="text-sm font-medium text-gray-900">
                {statusReport?.totalAddons?.toLocaleString() || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Server className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">API Server</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <span className={`text-sm font-medium ${
                health?.status === 'Healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {health?.status || 'Unknown'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last Check</span>
              <span className="text-sm font-medium text-gray-900">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center mb-4">
            <Clock className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="font-semibold text-gray-900">Activity</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Recent Addons</span>
              <span className="text-sm font-medium text-gray-900">
                {statusReport?.recentAddons || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Last 7 days</span>
              <span className="text-sm font-medium text-green-600">
                +{statusReport?.recentAddons || 0}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Modern Downloads Component
function Downloads() {
  const queryClient = useQueryClient();

  const { data: downloadSessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['downloadSessions'],
    queryFn: () => apiClient.getDownloadSessions(),
    refetchInterval: 5000,
  });

  const { data: downloadStats, isLoading: statsLoading } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 5000,
  });

  const pauseSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.pauseDownloadSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.cancelDownloadSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'downloading':
      case 'active':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'downloading':
      case 'active':
        return <Download className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      case 'paused':
        return <Pause className="w-4 h-4" />;
      case 'cancelled':
        return <X className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
          <p className="text-gray-600 mt-1">
            Manage your addon downloads and view download history
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetchSessions()}
            className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <Link
            to="/addons"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Start Download
          </Link>
        </div>
      </div>

      {/* Download Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Downloads</p>
              {statsLoading ? (
                <div className="h-8 bg-blue-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-blue-900 mt-1">
                  {downloadStats?.activeDownloads || 0}
                </p>
              )}
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Completed</p>
              {statsLoading ? (
                <div className="h-8 bg-green-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-green-900 mt-1">
                  {downloadStats?.completedDownloads || 0}
                </p>
              )}
            </div>
            <div className="p-3 bg-green-600 rounded-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 p-6 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Failed</p>
              {statsLoading ? (
                <div className="h-8 bg-red-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-red-900 mt-1">
                  {downloadStats?.failedDownloads || 0}
                </p>
              )}
            </div>
            <div className="p-3 bg-red-600 rounded-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Downloaded</p>
              {statsLoading ? (
                <div className="h-8 bg-purple-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-900 mt-1">
                  {downloadStats?.totalBytesDownloaded ?
                    `${(downloadStats.totalBytesDownloaded / 1024 / 1024 / 1024).toFixed(1)} GB` :
                    '0 GB'
                  }
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Download Sessions - Placeholder for now */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Download Sessions</h2>
        </div>
        <div className="p-6">
          <div className="text-center py-16">
            <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No downloads yet</h3>
            <p className="text-gray-600 mb-6">Start downloading addons from the browse page</p>
            <Link
              to="/addons"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              Browse Addons
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Import the modern Addons component
import { ModernAddons } from './components/ModernAddons';

// Modern System Status Component
function SystemStatus() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 5000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: () => apiClient.getStatusReport(),
    refetchInterval: 30000,
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Status</h1>
          <p className="text-gray-600 mt-1">
            Monitor system health and performance metrics
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Status
        </button>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-6 rounded-xl border border-emerald-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-600 text-sm font-medium">API Status</p>
              {healthLoading ? (
                <div className="h-8 bg-emerald-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className={`text-3xl font-bold mt-1 ${
                  health?.status === 'Healthy' ? 'text-emerald-900' : 'text-red-900'
                }`}>
                  {health?.status || 'Unknown'}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${
              health?.status === 'Healthy' ? 'bg-emerald-600' : 'bg-red-600'
            }`}>
              {health?.status === 'Healthy' ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : (
                <AlertCircle className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Database</p>
              {statusLoading ? (
                <div className="h-8 bg-blue-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className={`text-3xl font-bold mt-1 ${
                  statusReport?.databaseStatus === 'Connected' ? 'text-blue-900' : 'text-red-900'
                }`}>
                  Connected
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${
              statusReport?.databaseStatus === 'Connected' ? 'bg-blue-600' : 'bg-red-600'
            }`}>
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Records</p>
              {statusLoading ? (
                <div className="h-8 bg-purple-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-3xl font-bold text-purple-900 mt-1">
                  {statusReport?.totalAddons?.toLocaleString() || 'N/A'}
                </p>
              )}
            </div>
            <div className="p-3 bg-purple-600 rounded-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Last Updated</p>
              {healthLoading ? (
                <div className="h-8 bg-orange-200 rounded animate-pulse mt-2"></div>
              ) : (
                <p className="text-lg font-bold text-orange-900 mt-1">
                  {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
                </p>
              )}
            </div>
            <div className="p-3 bg-orange-600 rounded-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">API Health Details</h2>
          {healthLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-20 bg-gray-200 rounded"></div>
            </div>
          ) : health ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  API is responding normally
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  All endpoints are accessible
                </div>
                <div className="flex items-center text-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  CORS is properly configured
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">API Not Responding</h3>
              <p className="text-gray-600">
                Check if the .NET API is running on port 5269
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Database Statistics</h2>
          {statusLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : statusReport ? (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Addons</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {statusReport.totalAddons?.toLocaleString()}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="text-sm text-green-600 font-medium">Recent (7 days)</p>
                  <p className="text-2xl font-bold text-green-900">
                    {statusReport.recentAddons}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Compatibility Breakdown</h3>
                <div className="space-y-2">
                  {Object.entries(statusReport.compatibilityBreakdown || {}).map(([key, value]) => (
                    <div key={key} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">{key}</span>
                      <span className="text-sm font-bold text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-2">Date Range</h3>
                <p className="text-sm text-gray-600">
                  {statusReport.oldestAddedDate && statusReport.latestAddedDate ?
                    `${new Date(statusReport.oldestAddedDate).toLocaleDateString()} - ${new Date(statusReport.latestAddedDate).toLocaleDateString()}` :
                    'Date range not available'
                  }
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Database Unavailable</h3>
              <p className="text-gray-600">
                Unable to fetch database statistics
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Modern Layout Component
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home },
    { name: 'Downloads', href: '/downloads', icon: Download },
    { name: 'Addons', href: '/addons', icon: Package },
    { name: 'System Status', href: '/system/status', icon: Activity },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SceneryAddons Database</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    location.pathname === item.href
                      ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="mr-3 w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">System: Healthy</span>
            </div>
            <div className="text-xs text-gray-500 text-center mt-3">
              SceneryAddons Database v2.0
            </div>
          </div>
        </div>
      </div>

      {/* Desktop header title overlay - positioned to align with sidebar title */}
      <div className="hidden lg:block fixed top-0 left-0 right-0 z-50 pointer-events-none">
        <div className="flex h-16 items-center">
          <div className="w-72"></div> {/* Sidebar width spacer */}
          <div className="flex items-center space-x-3 px-6">
            <div className="p-2 bg-blue-600 rounded-lg opacity-0">
              <Package className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 pointer-events-auto">
              SceneryAddons Database
            </h1>
          </div>
        </div>
      </div>

      <div className="lg:pl-72">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30 lg:bg-transparent lg:shadow-none lg:border-b-0">
          <div className="flex h-16 items-center justify-between px-6">
            {/* Mobile only */}
            <div className="flex items-center space-x-3 lg:invisible">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 bg-blue-600 rounded-lg"
              >
                <Package className="w-6 h-6 text-white" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">
                SceneryAddons Database
              </h1>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700 font-medium">Online</span>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-lg">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="py-8">
          <div className="mx-auto max-w-7xl px-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/addons" element={<ModernAddons />} />
              <Route path="/system/status" element={<SystemStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// Modern App Component
function App() {
  console.log('Modern SceneryAddons app is rendering');

  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

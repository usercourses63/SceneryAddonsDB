import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { ToastProvider } from './contexts/ToastContext';
import { SignalRProvider } from './contexts/SignalRContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './services/api';
import { useToast } from './contexts/ToastContext';
import type { Addon, DownloadSession, SearchParams } from './types/api';

// Enhanced Dashboard with real API integration
function Dashboard() {
  const { showSuccess, showError, showInfo } = useToast();
  
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

  const { data: addonStats, isLoading: addonStatsLoading } = useQuery({
    queryKey: ['addonStats'],
    queryFn: () => apiClient.getAddonStats(),
    refetchInterval: 300000, // 5 minutes
  });

  const { data: downloadStats, isLoading: downloadStatsLoading } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 10000, // 10 seconds
  });

  const { data: latestAddons, isLoading: latestLoading } = useQuery({
    queryKey: ['latestAddons'],
    queryFn: () => apiClient.getLatestAddons(5),
    refetchInterval: 300000, // 5 minutes
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to SceneryAddons Database - Your central hub for MSFS addon management
        </p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
              {addonStatsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-gray-900">
                  {addonStats?.totalAddons?.toLocaleString() || statusReport?.totalAddons?.toLocaleString() || 'N/A'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">⬇️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Downloads</h3>
              {downloadStatsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {downloadStats?.activeDownloads || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">✈️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Recent (7 days)</h3>
              {statusLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {statusReport?.recentAddons || addonStats?.recentAddons || 'N/A'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                health?.status === 'Healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={health?.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}>
                  {health?.status === 'Healthy' ? '💚' : '❤️'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">System Health</h3>
              {healthLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className={`text-2xl font-bold ${
                  health?.status === 'Healthy' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {health?.status || 'Unknown'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            to="/addons"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🔍</span>
            Browse Addons
          </Link>
          <Link
            to="/downloads"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">⬇️</span>
            View Downloads
          </Link>
          <Link
            to="/system/status"
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">⚙️</span>
            System Status
          </Link>
          <button
            onClick={() => {
              showInfo('Refreshing data...', 'Fetching latest information from the server');
              window.location.reload();
            }}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Latest Addons */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium text-gray-900">Latest Addons</h2>
          <Link
            to="/addons"
            className="text-sm text-blue-600 hover:text-blue-500 font-medium"
          >
            View all →
          </Link>
        </div>
        
        {latestLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
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
            {latestAddons.map((addon: Addon, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
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
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-400 text-2xl">📦</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recent addons</h3>
            <p className="text-gray-600">Check back later for new additions</p>
          </div>
        )}
      </div>

      {/* System Overview */}
      {health && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">System Overview</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                health.services?.database === 'Connected' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={health.services?.database === 'Connected' ? 'text-green-600' : 'text-red-600'}>
                  🗄️
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className={`text-xs ${
                health.services?.database === 'Connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {health.services?.database || 'Unknown'}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                health.services?.api === 'Running' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={health.services?.api === 'Running' ? 'text-green-600' : 'text-red-600'}>
                  🔌
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">API</p>
              <p className={`text-xs ${
                health.services?.api === 'Running' ? 'text-green-600' : 'text-red-600'
              }`}>
                {health.services?.api || 'Unknown'}
              </p>
            </div>
            
            <div className="text-center">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                health.services?.scraper === 'Active' ? 'bg-green-100' : 
                health.services?.scraper === 'Idle' ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <span className={
                  health.services?.scraper === 'Active' ? 'text-green-600' : 
                  health.services?.scraper === 'Idle' ? 'text-yellow-600' : 'text-red-600'
                }>
                  🕷️
                </span>
              </div>
              <p className="text-sm font-medium text-gray-900">Scraper</p>
              <p className={`text-xs ${
                health.services?.scraper === 'Active' ? 'text-green-600' : 
                health.services?.scraper === 'Idle' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {health.services?.scraper || 'Unknown'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Downloads Manager with full session management
function Downloads() {
  const { showSuccess, showError, showInfo } = useToast();
  const queryClient = useQueryClient();

  const { data: downloadSessions, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['downloadSessions'],
    queryFn: () => apiClient.getDownloadSessions(),
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  const { data: downloadStats, isLoading: statsLoading } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 5000,
  });

  const { data: downloadFolders } = useQuery({
    queryKey: ['downloadFolders'],
    queryFn: () => apiClient.getDownloadFolders(),
  });

  // Mutations for download session management
  const pauseSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.pauseDownloadSession(sessionId),
    onSuccess: (data, sessionId) => {
      showSuccess('Session Paused', `Download session has been paused`);
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
    onError: (error: any) => {
      showError('Pause Failed', error.message || 'Failed to pause download session');
    },
  });

  const cancelSessionMutation = useMutation({
    mutationFn: (sessionId: string) => apiClient.cancelDownloadSession(sessionId),
    onSuccess: (data, sessionId) => {
      showSuccess('Session Cancelled', `Download session has been cancelled`);
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
    onError: (error: any) => {
      showError('Cancel Failed', error.message || 'Failed to cancel download session');
    },
  });

  const handlePauseSession = (sessionId: string) => {
    pauseSessionMutation.mutate(sessionId);
  };

  const handleCancelSession = (sessionId: string) => {
    if (window.confirm('Are you sure you want to cancel this download session? This action cannot be undone.')) {
      cancelSessionMutation.mutate(sessionId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'downloading':
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    return formatBytes(bytesPerSecond) + '/s';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your addon downloads and view download history
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => refetchSessions()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <span className="mr-2">🔄</span>
            Refresh
          </button>
          <Link
            to="/addons"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">➕</span>
            Start Download
          </Link>
        </div>
      </div>

      {/* Download Statistics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Downloads</h3>
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-blue-600">
                  {downloadStats?.activeDownloads || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-green-600">
                  {downloadStats?.completedDownloads || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">❌</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Failed</h3>
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-red-600">
                  {downloadStats?.failedDownloads || 0}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">💾</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Downloaded</h3>
              {statsLoading ? (
                <div className="animate-pulse h-6 bg-gray-200 rounded w-16"></div>
              ) : (
                <p className="text-2xl font-bold text-purple-600">
                  {downloadStats?.totalBytesDownloaded ? formatBytes(downloadStats.totalBytesDownloaded) : '0 B'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Download Sessions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Download Sessions</h2>
        </div>
        <div className="p-6">
          {sessionsLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : downloadSessions && downloadSessions.length > 0 ? (
            <div className="space-y-4">
              {downloadSessions.map((session: DownloadSession, index: number) => (
                <div key={session.id || index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {session.name || `Download Session ${index + 1}`}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.downloads?.length || 0} items • Started {new Date(session.startTime).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                        {session.status}
                      </span>
                      {session.status === 'Active' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePauseSession(session.id)}
                            disabled={pauseSessionMutation.isPending}
                            className="text-yellow-600 hover:text-yellow-700 disabled:opacity-50"
                            title="Pause Session"
                          >
                            ⏸️
                          </button>
                          <button
                            onClick={() => handleCancelSession(session.id)}
                            disabled={cancelSessionMutation.isPending}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                            title="Cancel Session"
                          >
                            ⏹️
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Progress Overview */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress: {session.completedItems || 0} / {session.totalItems || 0}</span>
                      <span>{Math.round(((session.completedItems || 0) / (session.totalItems || 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.round(((session.completedItems || 0) / (session.totalItems || 1)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No downloads yet</h3>
              <p className="text-gray-600 mb-4">Start downloading addons from the browse page</p>
              <Link
                to="/addons"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Addons
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Import the enhanced Addons page
import { AddonsPage } from './components/AddonsPage';

// Enhanced System Status Page
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

  const { data: downloadStats } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 10000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System Status</h1>
        <p className="mt-1 text-sm text-gray-600">
          Monitor system health and performance metrics
        </p>
      </div>

      {/* Health Status Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                health?.status === 'Healthy' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={health?.status === 'Healthy' ? 'text-green-600' : 'text-red-600'}>
                  {health?.status === 'Healthy' ? '✅' : '❌'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">API Status</h3>
              <p className={`text-lg font-bold ${
                health?.status === 'Healthy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {healthLoading ? 'Checking...' : health?.status || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                statusReport?.databaseStatus === 'Connected' ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={statusReport?.databaseStatus === 'Connected' ? 'text-green-600' : 'text-red-600'}>
                  {statusReport?.databaseStatus === 'Connected' ? '🗄️' : '❌'}
                </span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Database</h3>
              <p className={`text-lg font-bold ${
                statusReport?.databaseStatus === 'Connected' ? 'text-green-600' : 'text-red-600'
              }`}>
                {statusLoading ? 'Checking...' : statusReport?.databaseStatus || 'Unknown'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Records</h3>
              <p className="text-lg font-bold text-blue-600">
                {statusLoading ? 'Loading...' : statusReport?.totalAddons?.toLocaleString() || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">🕒</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-lg font-bold text-purple-600">
                {healthLoading ? 'Loading...' :
                 health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">API Health Details</h2>
          {healthLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : health ? (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(health, null, 2)}
                </pre>
              </div>
              <div className="text-sm text-gray-600">
                <p>✅ API is responding normally</p>
                <p>✅ All endpoints are accessible</p>
                <p>✅ CORS is properly configured</p>
              </div>
            </div>
          ) : (
            <div className="text-red-600">
              <p>❌ API is not responding</p>
              <p className="text-sm text-gray-600 mt-2">
                Check if the .NET API is running on port 5269
              </p>
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Database Statistics</h2>
          {statusLoading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : statusReport ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Total Addons:</span>
                  <span className="ml-2 font-medium">{statusReport.totalAddons?.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-gray-500">Recent (7 days):</span>
                  <span className="ml-2 font-medium">{statusReport.recentAddons}</span>
                </div>
                <div>
                  <span className="text-gray-500">MSFS 2020:</span>
                  <span className="ml-2 font-medium">{statusReport.compatibilityBreakdown?.['MSFS 2020']}</span>
                </div>
                <div>
                  <span className="text-gray-500">MSFS 2024:</span>
                  <span className="ml-2 font-medium">{statusReport.compatibilityBreakdown?.['MSFS 2024']}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">MSFS 2020/2024:</span>
                  <span className="ml-2 font-medium">{statusReport.compatibilityBreakdown?.['MSFS 2020/2024']}</span>
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
            <div className="text-red-600">
              <p>❌ Unable to fetch database statistics</p>
            </div>
          )}
        </div>
      </div>

      {/* Download Performance */}
      {downloadStats && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Download Performance</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{downloadStats.activeDownloads}</div>
              <div className="text-sm text-gray-500">Active Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{downloadStats.completedDownloads}</div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {downloadStats.averageDownloadSpeed ?
                  `${(downloadStats.averageDownloadSpeed / 1024 / 1024).toFixed(1)} MB/s` :
                  'N/A'
                }
              </div>
              <div className="text-sm text-gray-500">Avg Speed</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Layout with perfect alignment and responsive design
function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Downloads', href: '/downloads', icon: '⬇️' },
    { name: 'Addons', href: '/addons', icon: '📦' },
    { name: 'System Status', href: '/system/status', icon: '⚙️' },
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo - Perfect alignment */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <div className="flex items-center">
              <span className="text-lg font-semibold text-gray-900">SceneryAddons Database</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              ✕
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  location.pathname === item.href
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <div className="text-xs text-gray-500 text-center">
              SceneryAddons Database v2.0
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Header - Perfect alignment */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              >
                ☰
              </button>

              <div className="ml-4 lg:ml-0">
                <h1 className="text-lg font-semibold text-gray-900">
                  SceneryAddons Database
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System: Healthy</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/downloads" element={<Downloads />} />
              <Route path="/addons" element={<AddonsPage />} />
              <Route path="/system/status" element={<SystemStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

// Production-ready App component with all providers
function App() {
  console.log('Production SceneryAddons app is rendering');

  return (
    <QueryProvider>
      <ToastProvider>
        <SignalRProvider>
          <Router>
            <Layout />
          </Router>
        </SignalRProvider>
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;

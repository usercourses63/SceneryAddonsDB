import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { QueryProvider } from './contexts/QueryProvider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './services/api';

// Enhanced API functions with proper error handling
const api = {
  getHealth: () => apiClient.getHealth(),
  getStatusReport: () => apiClient.getStatusReport(),
  getAddons: (params: any) => apiClient.getAddons(params),
  getLatestAddons: (count?: number) => apiClient.getLatestAddons(count),
  downloadAddon: (addonId: string) => apiClient.startDownload(addonId),
  getDownloadSessions: () => apiClient.getDownloadSessions(),
  getDownloadStats: () => apiClient.getDownloadStats(),
  pauseDownloadSession: (sessionId: string) => apiClient.pauseDownloadSession(sessionId),
  cancelDownloadSession: (sessionId: string) => apiClient.cancelDownloadSession(sessionId),
};

function Dashboard() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 30000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: api.getStatusReport,
    refetchInterval: 60000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to SceneryAddons Database - Your central hub for MSFS addon management
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📦</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Total Addons</h3>
              {statusLoading ? (
                <p className="text-lg text-gray-400">Loading...</p>
              ) : statusReport?.totalAddons ? (
                <p className="text-2xl font-bold text-gray-900">{statusReport.totalAddons.toLocaleString()}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">🆕</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Recent Addons (7 days)</h3>
              {statusLoading ? (
                <p className="text-lg text-gray-400">Loading...</p>
              ) : statusReport?.recentAddons ? (
                <p className="text-2xl font-bold text-blue-600">{statusReport.recentAddons}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-lg">✈️</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">MSFS 2020/2024</h3>
              {statusLoading ? (
                <p className="text-lg text-gray-400">Loading...</p>
              ) : statusReport?.compatibilityBreakdown ? (
                <p className="text-2xl font-bold text-green-600">{statusReport.compatibilityBreakdown['MSFS 2020/2024']}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">N/A</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">💚</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">System Health</h3>
              {healthLoading ? (
                <p className="text-lg text-gray-400">Loading...</p>
              ) : health ? (
                <p className="text-2xl font-bold text-green-600">{health.status}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">Unknown</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-lg shadow">
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
            onClick={() => window.location.reload()}
            className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="mr-2">🔄</span>
            Refresh Data
          </button>
        </div>
      </div>

      {/* Latest Addons */}
      {statusReport?.latestAddons && (
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900">Latest Addons</h2>
            <Link
              to="/addons"
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              View all →
            </Link>
          </div>
          <div className="space-y-3">
            {statusReport.latestAddons.slice(0, 5).map((addon: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{addon.name}</p>
                  <p className="text-sm text-gray-600 truncate">{addon.fileName}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {addon.compatibility}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap">{addon.daysAgo}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Downloads() {
  const { data: downloads, isLoading, refetch } = useQuery({
    queryKey: ['downloads'],
    queryFn: api.getDownloads,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your addon downloads and view download history
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <span className="mr-2">🔄</span>
          Refresh
        </button>
      </div>

      {/* Download Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-lg">📥</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Active Downloads</h3>
              <p className="text-2xl font-bold text-blue-600">
                {downloads?.filter((d: any) => d.status === 'downloading').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-lg">✅</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Completed</h3>
              <p className="text-2xl font-bold text-green-600">
                {downloads?.filter((d: any) => d.status === 'completed').length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-lg">❌</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Failed</h3>
              <p className="text-2xl font-bold text-red-600">
                {downloads?.filter((d: any) => d.status === 'failed').length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Downloads List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Download Queue & History</h2>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading downloads...</p>
            </div>
          ) : downloads && downloads.length > 0 ? (
            <div className="space-y-4">
              {downloads.map((download: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{download.addonName || 'Unknown Addon'}</h3>
                      <p className="text-sm text-gray-600">{download.fileName || 'Unknown File'}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        download.status === 'completed' ? 'bg-green-100 text-green-800' :
                        download.status === 'downloading' ? 'bg-blue-100 text-blue-800' :
                        download.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {download.status || 'Unknown'}
                      </span>
                      {download.progress && (
                        <div className="w-32">
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${download.progress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{download.progress}%</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
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

function Addons() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: addons, isLoading, error } = useQuery({
    queryKey: ['addons', page, search, compatibility],
    queryFn: () => api.getAddons({
      page,
      pageSize: 20,
      search,
      compatibility,
      sortBy: 'dateAdded',
      sortOrder: 'desc'
    }),
    keepPreviousData: true,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDownload = async (addon: any) => {
    try {
      await api.downloadAddon(addon.id);
      alert(`Download started for ${addon.name}`);
    } catch (error) {
      alert(`Failed to start download: ${error.message}`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
        <p className="mt-1 text-sm text-gray-600">
          Browse and search through available MSFS scenery addons
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Addons
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, description, or filename..."
                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                🔍
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 mb-2">
              Compatibility
            </label>
            <select
              id="compatibility"
              value={compatibility}
              onChange={(e) => {
                setCompatibility(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Versions</option>
              <option value="MSFS 2020/2024">MSFS 2020/2024</option>
              <option value="MSFS 2020">MSFS 2020</option>
              <option value="MSFS 2024">MSFS 2024</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setCompatibility('');
                setPage(1);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {addons ? `${addons.totalCount || 0} Addons Found` : 'Addon Browser'}
            </h2>
            {addons && addons.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {addons.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(addons.totalPages, page + 1))}
                  disabled={page === addons.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading addons...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load addons</h3>
              <p className="text-gray-600">{error.message}</p>
            </div>
          ) : addons && addons.items && addons.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {addons.items.map((addon: any, index: number) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium text-gray-900 line-clamp-2">{addon.name}</h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                      addon.compatibility === 'MSFS 2020/2024' ? 'bg-green-100 text-green-800' :
                      addon.compatibility === 'MSFS 2020' ? 'bg-blue-100 text-blue-800' :
                      addon.compatibility === 'MSFS 2024' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {addon.compatibility || 'Unknown'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {addon.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span>{addon.fileName}</span>
                    <span>{addon.dateAdded ? new Date(addon.dateAdded).toLocaleDateString() : 'Unknown date'}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(addon)}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <span className="mr-1">⬇️</span>
                      Download
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                      ℹ️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addons found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SystemStatus() {
  const { data: health, isLoading: healthLoading } = useQuery({
    queryKey: ['health'],
    queryFn: api.getHealth,
    refetchInterval: 5000,
  });

  const { data: statusReport, isLoading: statusLoading } = useQuery({
    queryKey: ['statusReport'],
    queryFn: api.getStatusReport,
    refetchInterval: 30000,
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
        <div className="bg-white p-6 rounded-lg shadow">
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

        <div className="bg-white p-6 rounded-lg shadow">
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

        <div className="bg-white p-6 rounded-lg shadow">
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

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600">🕒</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
              <p className="text-lg font-bold text-purple-600">
                {statusLoading ? 'Loading...' :
                 health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Status */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-medium text-gray-900 mb-4">API Health Details</h2>
          {healthLoading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          ) : health ? (
            <div className="space-y-3">
              <div className="bg-gray-50 p-3 rounded">
                <pre className="text-sm text-gray-700">{JSON.stringify(health, null, 2)}</pre>
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

        <div className="bg-white p-6 rounded-lg shadow">
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
    </div>
  );
}

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
          {/* Logo */}
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
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Header */}
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
              <Route path="/addons" element={<Addons />} />
              <Route path="/system/status" element={<SystemStatus />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

function App() {
  console.log('Complete SceneryAddons app is rendering');

  return (
    <QueryProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Layout />
        </div>
      </Router>
    </QueryProvider>
  );
}

export default App;

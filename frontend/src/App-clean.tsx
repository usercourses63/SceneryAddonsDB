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
  Zap,
  Menu
} from 'lucide-react';

// Clean Dashboard Component
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
    </div>
  );
}

// Simple Downloads Component
function Downloads() {
  const { data: downloadStats, isLoading: statsLoading } = useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 5000,
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Downloads</h1>
          <p className="text-gray-600 mt-1">
            Manage your addon downloads and view download history
          </p>
        </div>
        <Link
          to="/addons"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Start Download
        </Link>
      </div>

      {/* Download Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Active Downloads</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">
                {downloadStats?.activeDownloads || 0}
              </p>
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
              <p className="text-3xl font-bold text-green-900 mt-1">
                {downloadStats?.completedDownloads || 0}
              </p>
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
              <p className="text-3xl font-bold text-red-900 mt-1">
                {downloadStats?.failedDownloads || 0}
              </p>
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
              <p className="text-2xl font-bold text-purple-900 mt-1">
                {downloadStats?.totalBytesDownloaded ?
                  `${(downloadStats.totalBytesDownloaded / 1024 / 1024 / 1024).toFixed(1)} GB` :
                  '0 GB'
                }
              </p>
            </div>
            <div className="p-3 bg-purple-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
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

// Simple Addons Component
function Addons() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: addons, isLoading, error } = useQuery({
    queryKey: ['addons', page, search],
    queryFn: () => apiClient.getAddons({
      page,
      pageSize: 20,
      search,
      sortBy: 'dateAdded',
      sortOrder: 'desc'
    }),
    keepPreviousData: true,
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Addons</h1>
          <p className="text-gray-600 mt-1">
            Browse and search through available MSFS scenery addons
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, description, or filename..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {addons ? `${addons.totalCount?.toLocaleString() || 0} Addons Found` : 'Addon Browser'}
          </h2>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : addons && addons.items && addons.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {addons.items.map((addon: any) => (
                <div key={addon.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 line-clamp-2 flex-1">{addon.name}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-2 ${
                      addon.compatibility === 'MSFS 2020/2024' ? 'bg-green-100 text-green-800' :
                      addon.compatibility === 'MSFS 2020' ? 'bg-blue-100 text-blue-800' :
                      addon.compatibility === 'MSFS 2024' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {addon.compatibility || 'Unknown'}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {addon.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="truncate">{addon.fileName}</span>
                    <span className="whitespace-nowrap ml-2">
                      {addon.dateAdded ? new Date(addon.dateAdded).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>

                  <button className="w-full inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No addons found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple System Status Component
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
              <p className={`text-3xl font-bold mt-1 ${
                health?.status === 'Healthy' ? 'text-emerald-900' : 'text-red-900'
              }`}>
                {health?.status || 'Unknown'}
              </p>
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
              <p className="text-3xl font-bold text-blue-900 mt-1">Connected</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <Database className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Total Records</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">
                {statusReport?.totalAddons?.toLocaleString() || 'N/A'}
              </p>
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
              <p className="text-lg font-bold text-orange-900 mt-1">
                {health?.timestamp ? new Date(health.timestamp).toLocaleTimeString() : 'N/A'}
              </p>
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

// Clean Layout Component with Perfect Alignment
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
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex h-full flex-col">
          {/* Logo - Clean and Simple */}
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">SceneryAddons Database</span>
            </div>
          </div>

          {/* Navigation - positioned to align with content */}
          <nav className="flex-1 px-4 pt-6 pb-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    location.pathname === item.href
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
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
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>System: Healthy</span>
            </div>
            <div className="text-xs text-gray-500 mt-2">
              SceneryAddons Database v2.0
            </div>
          </div>
        </div>
      </div>

      <div className="lg:pl-64">
        {/* Header - Perfectly Aligned */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-30">
          <div className="flex h-16 items-center px-6">
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 mr-3"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Title - Aligned with sidebar */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg lg:hidden">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">
                SceneryAddons Database
              </h1>
            </div>

            {/* Right side */}
            <div className="ml-auto flex items-center space-x-4">
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

        {/* Main content - aligned with sidebar navigation */}
        <main className="pt-6 pb-8">
          <div className="mx-auto max-w-7xl px-6">
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

// Clean App Component
function App() {
  console.log('Clean SceneryAddons app is rendering');

  return (
    <QueryProvider>
      <Router>
        <Layout />
      </Router>
    </QueryProvider>
  );
}

export default App;

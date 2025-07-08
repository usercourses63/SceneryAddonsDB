import React from 'react';
import { Link } from 'react-router-dom';
import { useDashboardData, calculateRecentAddons } from '@/hooks/useAddons';

interface DashboardMetrics {
  totalAddons: number;
  recentAddons: number;
  activeDownloads: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

export const Dashboard: React.FC = () => {
  const { addonStats, latestAddons, systemHealth, addonsWithStats, isLoading, isError } = useDashboardData();

  // Calculate metrics from real API data
  const metrics: DashboardMetrics = React.useMemo(() => {
    if (isLoading || isError) {
      return {
        totalAddons: 0,
        recentAddons: 0,
        activeDownloads: 0,
        systemHealth: 'error'
      };
    }

    const recentCount = addonsWithStats.data?.addons 
      ? calculateRecentAddons(addonsWithStats.data.addons)
      : 0;

    return {
      totalAddons: addonStats.data?.totalAddons || 0,
      recentAddons: recentCount,
      activeDownloads: 0, // Will be connected to download API later
      systemHealth: systemHealth.data?.status === 'Healthy' ? 'healthy' : 
                    systemHealth.data?.status ? 'warning' : 'error'
    };
  }, [addonStats.data, addonsWithStats.data, systemHealth.data, isLoading, isError]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Loading your scenery addon collection...</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                <div className="ml-4 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-error-600 mt-1">Unable to connect to API. Please ensure your .NET backend is running on port 5269.</p>
        </div>
        
        <div className="bg-error-50 border border-error-200 rounded-lg p-6">
          <div className="flex items-center">
            <svg className="w-6 h-6 text-error-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-error-900">API Connection Failed</h3>
              <p className="text-error-700 mt-1">
                Make sure your .NET API is running: <code className="bg-error-100 px-2 py-1 rounded">cd src/Addons.Api && dotnet run</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Overview of your scenery addon collection and system status
          {addonStats.data && (
            <span className="text-gray-500"> • Last updated: {new Date(addonStats.data.lastUpdated).toLocaleTimeString()}</span>
          )}
        </p>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Addons</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.totalAddons.toLocaleString()}</p>
              {addonStats.isRefetching && (
                <p className="text-xs text-primary-600">Updating...</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Addons</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.recentAddons}</p>
              <p className="text-sm text-gray-500">Last 7 days</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-info-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.activeDownloads}</p>
              {metrics.activeDownloads > 0 && (
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <p className="text-sm text-gray-500 ml-1">In progress</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                metrics.systemHealth === 'healthy' ? 'bg-success-100' :
                metrics.systemHealth === 'warning' ? 'bg-warning-100' : 'bg-error-100'
              }`}>
                <svg className={`w-5 h-5 ${
                  metrics.systemHealth === 'healthy' ? 'text-success-600' :
                  metrics.systemHealth === 'warning' ? 'text-warning-600' : 'text-error-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">System Health</p>
              <p className={`text-lg font-semibold capitalize ${
                metrics.systemHealth === 'healthy' ? 'text-success-600' :
                metrics.systemHealth === 'warning' ? 'text-warning-600' : 'text-error-600'
              }`}>
                {metrics.systemHealth}
              </p>
              {systemHealth.isRefetching && (
                <p className="text-xs text-gray-500">Checking...</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Compatibility Breakdown */}
      {addonsWithStats.data?.summary?.compatibilityBreakdown && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Compatibility Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(addonsWithStats.data.summary.compatibilityBreakdown).map(([compatibility, count]) => (
              <div key={compatibility} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      compatibility === 'MSFS 2024' ? 'bg-blue-100' :
                      compatibility === 'MSFS 2020' ? 'bg-orange-100' : 'bg-green-100'
                    }`}>
                      <svg className={`w-5 h-5 ${
                        compatibility === 'MSFS 2024' ? 'text-blue-600' :
                        compatibility === 'MSFS 2020' ? 'text-orange-600' : 'text-green-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{compatibility}</p>
                    <p className="text-2xl font-bold text-gray-900">{count.toLocaleString()}</p>
                    <p className="text-sm text-gray-500">
                      {((count / metrics.totalAddons) * 100).toFixed(1)}% of total
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Connection Status */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Connection Status</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">.NET API (localhost:5269)</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                systemHealth.data ? 'bg-success-500' : 'bg-error-500'
              }`}></div>
              <span className={`text-sm ${
                systemHealth.data ? 'text-success-600' : 'text-error-600'
              }`}>
                {systemHealth.data ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">MongoDB Database</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-2 ${
                addonStats.data ? 'bg-success-500' : 'bg-error-500'
              }`}></div>
              <span className={`text-sm ${
                addonStats.data ? 'text-success-600' : 'text-error-600'
              }`}>
                {addonStats.data ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/addons" className="block p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="font-medium text-gray-900">Browse Addons</p>
              <p className="text-sm text-gray-500">Search and filter addon collection</p>
            </div>
          </Link>

          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              <p className="font-medium text-gray-900">Start Download</p>
              <p className="text-sm text-gray-500">Download latest addons</p>
            </div>
          </button>

          <button className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors">
            <div className="text-center">
              <svg className="w-8 h-8 text-primary-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-500">System status and analytics</p>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity - Real Data */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        {latestAddons.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-gray-200 rounded-full mr-3"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 rounded w-48"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : latestAddons.data && latestAddons.data.length > 0 ? (
          <div className="space-y-3">
            {latestAddons.data.map((addon, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-success-500 rounded-full mr-3"></div>
                  <div>
                    <p className="font-medium text-gray-900">{addon.name}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {addon.compatibility} • Added
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {new Date(addon.dateAdded).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No recent addon activity</p>
        )}
      </div>
    </div>
  );
};
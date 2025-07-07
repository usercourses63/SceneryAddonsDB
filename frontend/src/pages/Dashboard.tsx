import React from 'react';
import { Link } from 'react-router-dom';
import { useAddonStats, useDownloadStats, useLatestAddons } from '../services/queries';
import { StatCard } from '../components/charts/StatCard';
import { ProgressBar } from '../components/charts/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatNumber, formatBytes, formatRelativeTime } from '../utils/format';

export function Dashboard() {
  const { data: addonStats, isLoading: addonStatsLoading } = useAddonStats();
  const { data: downloadStats, isLoading: downloadStatsLoading } = useDownloadStats();
  const { data: latestAddons, isLoading: latestAddonsLoading } = useLatestAddons(5);

  if (addonStatsLoading || downloadStatsLoading) {
    return <LoadingOverlay>Loading dashboard...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to SceneryAddons Database - Your central hub for MSFS addon management
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Addons"
          value={formatNumber(addonStats?.totalAddons || 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
          }
        />
        
        <StatCard
          title="Recent Addons"
          value={formatNumber(addonStats?.recentAddons || 0)}
          change={{ value: 12, type: 'increase' }}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        
        <StatCard
          title="Active Downloads"
          value={formatNumber(downloadStats?.activeDownloads || 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          }
        />
        
        <StatCard
          title="Total Downloaded"
          value={formatBytes(downloadStats?.totalBytesDownloaded || 0)}
          icon={
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          }
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Compatibility Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Compatibility Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <ProgressBar
                  label="MSFS 2020/2024"
                  value={addonStats?.compatibilityBoth || 0}
                  max={addonStats?.totalAddons || 1}
                  color="primary"
                />
              </div>
              <div>
                <ProgressBar
                  label="MSFS 2020 Only"
                  value={addonStats?.compatibility2020 || 0}
                  max={addonStats?.totalAddons || 1}
                  color="green"
                />
              </div>
              <div>
                <ProgressBar
                  label="MSFS 2024 Only"
                  value={addonStats?.compatibility2024 || 0}
                  max={addonStats?.totalAddons || 1}
                  color="yellow"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Latest Addons */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Latest Addons</CardTitle>
              <Link to="/addons/latest">
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {latestAddonsLoading ? (
              <LoadingOverlay>Loading latest addons...</LoadingOverlay>
            ) : (
              <div className="space-y-3">
                {latestAddons?.slice(0, 5).map((addon) => (
                  <div key={addon.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {addon.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {addon.compatibility} • {formatRelativeTime(addon.dateAdded)}
                      </p>
                    </div>
                    <Link to={`/addons/${addon.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/addons/search">
              <Button variant="outline" className="w-full justify-start">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                Search Addons
              </Button>
            </Link>
            
            <Link to="/downloads/start">
              <Button variant="outline" className="w-full justify-start">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                Start Download
              </Button>
            </Link>
            
            <Link to="/downloads/queue">
              <Button variant="outline" className="w-full justify-start">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                View Queue
              </Button>
            </Link>
            
            <Link to="/system/status">
              <Button variant="outline" className="w-full justify-start">
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                System Status
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

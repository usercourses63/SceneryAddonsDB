import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLatestAddons, useStartDownload } from '../services/queries';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatBytes, formatRelativeTime } from '../utils/format';
import type { Addon } from '../types/api';

export function LatestAddons() {
  const [count, setCount] = useState(50);
  const { data: addons, isLoading } = useLatestAddons(count);
  const startDownload = useStartDownload();

  const handleDownload = (addonId: string) => {
    startDownload.mutate(addonId, {
      onSuccess: () => {
        alert('Download started successfully!');
      },
      onError: (error) => {
        alert(`Failed to start download: ${error.message}`);
      },
    });
  };

  const getCompatibilityBadgeColor = (compatibility: string) => {
    switch (compatibility) {
      case 'MSFS 2020/2024':
        return 'bg-blue-100 text-blue-800';
      case 'MSFS 2020':
        return 'bg-green-100 text-green-800';
      case 'MSFS 2024':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingOverlay>Loading latest addons...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Latest Addons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Recently added MSFS scenery addons
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <label htmlFor="count" className="text-sm font-medium text-gray-700">
            Show:
          </label>
          <select
            id="count"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value={25}>25 addons</option>
            <option value={50}>50 addons</option>
            <option value={100}>100 addons</option>
            <option value={200}>200 addons</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Shown</p>
              <p className="text-2xl font-bold text-gray-900">{addons?.length || 0}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">MSFS 2020/2024</p>
              <p className="text-2xl font-bold text-blue-600">
                {addons?.filter(a => a.compatibility === 'MSFS 2020/2024').length || 0}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(addons?.reduce((sum, addon) => sum + (addon.size || 0), 0) || 0)}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Addons List */}
      {addons && addons.length > 0 ? (
        <div className="space-y-4">
          {addons.map((addon: Addon, index) => (
            <Card key={addon.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary-100 text-primary-600 font-medium">
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{addon.fileName}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                          {addon.compatibility}
                        </span>
                        {addon.size && (
                          <span className="text-sm text-gray-500">{formatBytes(addon.size)}</span>
                        )}
                        <span className="text-sm text-gray-500">
                          Added {formatRelativeTime(addon.dateAdded)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Link to={`/addons/${addon.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleDownload(addon.id)}
                      loading={startDownload.isPending}
                      size="sm"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No addons found</h3>
            <p className="mt-1 text-sm text-gray-500">No recent addons are available.</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
              <p className="text-sm text-gray-600">Explore more addon features</p>
            </div>
            <div className="flex space-x-3">
              <Link to="/addons">
                <Button variant="outline">
                  Browse All Addons
                </Button>
              </Link>
              <Link to="/addons/search">
                <Button>
                  Advanced Search
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

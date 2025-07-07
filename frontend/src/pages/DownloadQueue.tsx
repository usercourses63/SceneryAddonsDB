import React from 'react';
import { useDownloads } from '../services/queries';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatBytes, formatRelativeTime } from '../utils/format';
import type { DownloadItem } from '../types/api';

export function DownloadQueue() {
  const { data: downloads, isLoading } = useDownloads();

  const queuedDownloads = downloads?.filter(d => d.status === 'Queued') || [];
  const activeDownloads = downloads?.filter(d => d.status === 'Downloading') || [];

  if (isLoading) {
    return <LoadingOverlay>Loading download queue...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Download Queue</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage your download queue and priorities
        </p>
      </div>

      {/* Queue Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Active Downloads</p>
              <p className="text-2xl font-bold text-blue-600">{activeDownloads.length}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Queued Downloads</p>
              <p className="text-2xl font-bold text-yellow-600">{queuedDownloads.length}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Size</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatBytes(queuedDownloads.reduce((sum, d) => sum + d.totalBytes, 0))}
              </p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Downloads */}
      {activeDownloads.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Currently Downloading</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeDownloads.map((download: DownloadItem) => (
                <div key={download.id} className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{download.addonName}</h4>
                      <p className="text-xs text-gray-500">
                        {Math.round(download.progress)}% • {formatBytes(download.downloadedBytes)} / {formatBytes(download.totalBytes)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      Pause
                    </Button>
                    <Button variant="outline" size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Queued Downloads */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Download Queue</CardTitle>
            {queuedDownloads.length > 0 && (
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Clear Queue
                </Button>
                <Button size="sm">
                  Start All
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {queuedDownloads.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No downloads in queue</h3>
              <p className="mt-1 text-sm text-gray-500">Downloads will appear here when they are queued.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {queuedDownloads.map((download: DownloadItem, index) => (
                <div key={download.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{download.addonName}</h4>
                      <p className="text-xs text-gray-500">
                        {formatBytes(download.totalBytes)} • Queued {formatRelativeTime(download.startTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="sm" title="Move Up">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                      </svg>
                    </Button>
                    <Button variant="ghost" size="sm" title="Move Down">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </Button>
                    <Button variant="outline" size="sm">
                      Start Now
                    </Button>
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

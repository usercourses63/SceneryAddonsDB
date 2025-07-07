import React, { useState } from 'react';
import { useDownloads } from '../services/queries';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatBytes, formatRelativeTime, formatDuration } from '../utils/format';
import type { DownloadItem } from '../types/api';

export function DownloadHistory() {
  const { data: downloads, isLoading } = useDownloads();
  const [filter, setFilter] = useState<'all' | 'completed' | 'failed'>('all');

  const completedDownloads = downloads?.filter(d => d.status === 'Completed') || [];
  const failedDownloads = downloads?.filter(d => d.status === 'Failed') || [];
  
  const filteredDownloads = downloads?.filter(d => {
    if (filter === 'completed') return d.status === 'Completed';
    if (filter === 'failed') return d.status === 'Failed';
    return d.status === 'Completed' || d.status === 'Failed';
  }) || [];

  const getStatusIcon = (status: string) => {
    if (status === 'Completed') {
      return (
        <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      );
    }
  };

  const calculateDuration = (startTime: string, endTime?: string) => {
    if (!endTime) return 'N/A';
    const start = new Date(startTime);
    const end = new Date(endTime);
    const durationMs = end.getTime() - start.getTime();
    return formatDuration(durationMs / 1000);
  };

  if (isLoading) {
    return <LoadingOverlay>Loading download history...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Download History</h1>
        <p className="mt-1 text-sm text-gray-600">
          View your completed and failed downloads
        </p>
      </div>

      {/* History Stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Downloads</p>
              <p className="text-2xl font-bold text-gray-900">{completedDownloads.length + failedDownloads.length}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedDownloads.length}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{failedDownloads.length}</p>
            </div>
            <div className="flex-shrink-0">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setFilter('all')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'all'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            All ({completedDownloads.length + failedDownloads.length})
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'completed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Completed ({completedDownloads.length})
          </button>
          <button
            onClick={() => setFilter('failed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              filter === 'failed'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Failed ({failedDownloads.length})
          </button>
        </nav>
      </div>

      {/* Downloads List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Download History</CardTitle>
            {filteredDownloads.length > 0 && (
              <Button variant="outline" size="sm">
                Clear History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {filteredDownloads.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No download history</h3>
              <p className="mt-1 text-sm text-gray-500">Your completed and failed downloads will appear here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDownloads.map((download: DownloadItem) => (
                <div key={download.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(download.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">{download.addonName}</h4>
                      <p className="text-xs text-gray-500">{download.fileName}</p>
                      <div className="flex items-center space-x-4 mt-1 text-xs text-gray-500">
                        <span>{formatBytes(download.totalBytes)}</span>
                        <span>Duration: {calculateDuration(download.startTime, download.endTime)}</span>
                        <span>Completed {formatRelativeTime(download.endTime || download.startTime)}</span>
                      </div>
                      {download.status === 'Failed' && download.errorMessage && (
                        <p className="text-xs text-red-600 mt-1">Error: {download.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {download.status === 'Completed' && (
                      <Button variant="outline" size="sm">
                        Open Folder
                      </Button>
                    )}
                    {download.status === 'Failed' && (
                      <Button variant="outline" size="sm">
                        Retry
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">
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

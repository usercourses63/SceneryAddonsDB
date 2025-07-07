import React from 'react';
import { useDownloads, useDownloadStats, usePauseDownload, useResumeDownload, useCancelDownload } from '../services/queries';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { RealTimeDownloadProgress } from '../components/ui/RealTimeDownloadProgress';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatBytes } from '../utils/format';
import type { DownloadItem } from '../types/api';

export function Downloads() {
  const { data: downloads, isLoading: downloadsLoading } = useDownloads();
  const { data: stats, isLoading: statsLoading } = useDownloadStats();
  const pauseDownload = usePauseDownload();
  const resumeDownload = useResumeDownload();
  const cancelDownload = useCancelDownload();

  const handlePause = (downloadId: string) => {
    pauseDownload.mutate(downloadId);
  };

  const handleResume = (downloadId: string) => {
    resumeDownload.mutate(downloadId);
  };

  const handleCancel = (downloadId: string) => {
    if (confirm('Are you sure you want to cancel this download?')) {
      cancelDownload.mutate(downloadId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Downloading':
        return 'primary';
      case 'Completed':
        return 'green';
      case 'Failed':
        return 'red';
      case 'Paused':
        return 'yellow';
      default:
        return 'primary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Downloading':
        return (
          <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        );
      case 'Completed':
        return (
          <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'Failed':
        return (
          <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        );
      case 'Paused':
        return (
          <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
          </svg>
        );
      default:
        return (
          <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  if (downloadsLoading || statsLoading) {
    return <LoadingOverlay>Loading downloads...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Download Manager</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage and monitor your addon downloads
          </p>
        </div>
        <Button>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Start New Download
        </Button>
      </div>

      {/* Download Stats */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDownloads}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Active Downloads</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeDownloads}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600">{stats.completedDownloads}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Total Downloaded</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(stats.totalBytesDownloaded)}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Downloads List */}
      <Card>
        <CardHeader>
          <CardTitle>Current Downloads</CardTitle>
        </CardHeader>
        <CardContent>
          {!downloads || downloads.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No downloads</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by downloading your first addon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {downloads.map((download: DownloadItem) => (
                <div key={download.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <RealTimeDownloadProgress download={download} />
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {download.status === 'Downloading' && (
                        <Button variant="outline" size="sm" onClick={() => handlePause(download.id)}>
                          Pause
                        </Button>
                      )}
                      {download.status === 'Paused' && (
                        <Button variant="outline" size="sm" onClick={() => handleResume(download.id)}>
                          Resume
                        </Button>
                      )}
                      {(download.status === 'Downloading' || download.status === 'Paused' || download.status === 'Queued') && (
                        <Button variant="outline" size="sm" onClick={() => handleCancel(download.id)}>
                          Cancel
                        </Button>
                      )}
                    </div>
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

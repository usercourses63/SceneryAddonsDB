import React, { useEffect, useState } from 'react';
import { signalRService } from '../../services/signalr';
import { ProgressBar } from '../charts/ProgressBar';
import { formatBytes, formatSpeed, formatDuration } from '../../utils/format';
import type { DownloadItem } from '../../types/api';

interface RealTimeDownloadProgressProps {
  download: DownloadItem;
  onUpdate?: (download: DownloadItem) => void;
}

export function RealTimeDownloadProgress({ download, onUpdate }: RealTimeDownloadProgressProps) {
  const [currentDownload, setCurrentDownload] = useState(download);

  useEffect(() => {
    const handleDownloadProgress = (data: { downloadId: string; progress: number; speed: number }) => {
      if (data.downloadId === download.id) {
        const updatedDownload = {
          ...currentDownload,
          progress: data.progress,
          downloadSpeed: data.speed,
          downloadedBytes: (data.progress / 100) * currentDownload.totalBytes,
        };
        setCurrentDownload(updatedDownload);
        onUpdate?.(updatedDownload);
      }
    };

    const handleDownloadCompleted = (data: { downloadId: string }) => {
      if (data.downloadId === download.id) {
        const updatedDownload = {
          ...currentDownload,
          status: 'Completed' as const,
          progress: 100,
          downloadedBytes: currentDownload.totalBytes,
          endTime: new Date().toISOString(),
        };
        setCurrentDownload(updatedDownload);
        onUpdate?.(updatedDownload);
      }
    };

    const handleDownloadFailed = (data: { downloadId: string; error: string }) => {
      if (data.downloadId === download.id) {
        const updatedDownload = {
          ...currentDownload,
          status: 'Failed' as const,
          errorMessage: data.error,
          endTime: new Date().toISOString(),
        };
        setCurrentDownload(updatedDownload);
        onUpdate?.(updatedDownload);
      }
    };

    // Register event listeners
    signalRService.on('downloadProgress', handleDownloadProgress);
    signalRService.on('downloadCompleted', handleDownloadCompleted);
    signalRService.on('downloadFailed', handleDownloadFailed);

    // Cleanup
    return () => {
      signalRService.off('downloadProgress', handleDownloadProgress);
      signalRService.off('downloadCompleted', handleDownloadCompleted);
      signalRService.off('downloadFailed', handleDownloadFailed);
    };
  }, [download.id, currentDownload, onUpdate]);

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
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-blue-600 rounded-full animate-pulse"></div>
            <span className="text-blue-600">Downloading</span>
          </div>
        );
      case 'Completed':
        return (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-green-600">Completed</span>
          </div>
        );
      case 'Failed':
        return (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-red-600">Failed</span>
          </div>
        );
      case 'Paused':
        return (
          <div className="flex items-center space-x-1">
            <svg className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
            </svg>
            <span className="text-yellow-600">Paused</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center space-x-1">
            <div className="h-2 w-2 bg-gray-600 rounded-full"></div>
            <span className="text-gray-600">{status}</span>
          </div>
        );
    }
  };

  const calculateETA = () => {
    if (currentDownload.status !== 'Downloading' || currentDownload.downloadSpeed === 0) {
      return null;
    }
    
    const remainingBytes = currentDownload.totalBytes - currentDownload.downloadedBytes;
    const etaSeconds = remainingBytes / currentDownload.downloadSpeed;
    return etaSeconds;
  };

  const eta = calculateETA();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-medium text-gray-900">{currentDownload.addonName}</h4>
          <p className="text-xs text-gray-500">{currentDownload.fileName}</p>
        </div>
        {getStatusIcon(currentDownload.status)}
      </div>
      
      <ProgressBar
        value={currentDownload.progress}
        max={100}
        color={getStatusColor(currentDownload.status) as any}
        showPercentage={true}
      />
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          {formatBytes(currentDownload.downloadedBytes)} / {formatBytes(currentDownload.totalBytes)}
        </span>
        {currentDownload.status === 'Downloading' && (
          <span>
            {formatSpeed(currentDownload.downloadSpeed)}
            {eta && ` • ${formatDuration(eta)} remaining`}
          </span>
        )}
        {currentDownload.status === 'Failed' && currentDownload.errorMessage && (
          <span className="text-red-600">Error: {currentDownload.errorMessage}</span>
        )}
      </div>
    </div>
  );
}

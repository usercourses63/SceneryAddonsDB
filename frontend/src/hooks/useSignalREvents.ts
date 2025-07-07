import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { signalRService } from '../services/signalr';
import { queryKeys } from '../services/queries';
import { useToast } from '../contexts/ToastContext';

export function useSignalREvents() {
  const queryClient = useQueryClient();
  const { showSuccess, showError, showInfo } = useToast();

  useEffect(() => {
    // Download progress events
    const handleDownloadProgress = (data: { downloadId: string; progress: number; speed: number }) => {
      // Invalidate downloads query to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
    };

    const handleDownloadCompleted = (data: { downloadId: string }) => {
      showSuccess('Download Completed', 'Your addon download has finished successfully!');
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadStats });
    };

    const handleDownloadFailed = (data: { downloadId: string; error: string }) => {
      showError('Download Failed', `Download failed: ${data.error}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadStats });
    };

    const handleDownloadStarted = (data: { downloadId: string; addonName: string }) => {
      showInfo('Download Started', `Started downloading: ${data.addonName}`);
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadStats });
    };

    const handleSystemStatusUpdate = (status: any) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.health });
    };

    // Register event listeners
    signalRService.on('downloadProgress', handleDownloadProgress);
    signalRService.on('downloadCompleted', handleDownloadCompleted);
    signalRService.on('downloadFailed', handleDownloadFailed);
    signalRService.on('downloadStarted', handleDownloadStarted);
    signalRService.on('systemStatusUpdate', handleSystemStatusUpdate);

    // Cleanup on unmount
    return () => {
      signalRService.off('downloadProgress', handleDownloadProgress);
      signalRService.off('downloadCompleted', handleDownloadCompleted);
      signalRService.off('downloadFailed', handleDownloadFailed);
      signalRService.off('downloadStarted', handleDownloadStarted);
      signalRService.off('systemStatusUpdate', handleSystemStatusUpdate);
    };
  }, [queryClient, showSuccess, showError, showInfo]);
}

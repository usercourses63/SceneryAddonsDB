import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { downloadApi } from '@/services/api';
import type { 
  DownloadRequest, 
  DownloadStatusResponse, 
  DownloadStats, 
  DownloadFolder 
} from '@/types/api';
import toast from 'react-hot-toast';

// Hook for getting download statistics
export const useDownloadStats = () => {
  return useQuery({
    queryKey: ['downloadStats'],
    queryFn: () => downloadApi.getStats(),
    refetchInterval: 10000, // Refresh every 10 seconds
    staleTime: 5000, // Consider data stale after 5 seconds
  });
};

// Hook for getting all download sessions
export const useDownloadSessions = () => {
  return useQuery({
    queryKey: ['downloadSessions'],
    queryFn: () => downloadApi.getSessions(),
    refetchInterval: 5000, // Refresh every 5 seconds for active monitoring
    staleTime: 2000,
  });
};

// Hook for getting specific session status
export const useDownloadSessionStatus = (sessionId: string) => {
  return useQuery({
    queryKey: ['downloadSession', sessionId],
    queryFn: () => downloadApi.getSessionStatus(sessionId),
    refetchInterval: 3000, // Very frequent updates for active sessions
    staleTime: 1000,
    enabled: !!sessionId, // Only run if sessionId is provided
  });
};

// Hook for getting download folders
export const useDownloadFolders = () => {
  return useQuery({
    queryKey: ['downloadFolders'],
    queryFn: () => downloadApi.getFolders(),
    refetchInterval: 30000, // Less frequent, folders don't change often
    staleTime: 20000,
  });
};

// Hook for starting a download session
export const useStartDownloadSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: DownloadRequest) => downloadApi.startSession(request),
    onSuccess: (data) => {
      // Invalidate and refetch download sessions
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
      queryClient.invalidateQueries({ queryKey: ['downloadStats'] });
      
      toast.success(`Download session started with ${data.queuedCount} items`);
    },
    onError: (error: any) => {
      toast.error(`Failed to start download session: ${error.message}`);
    },
  });
};

// Hook for downloading a specific addon
export const useDownloadAddon = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addonId: string) => downloadApi.startSession({
      count: 1,
      maxConcurrency: 1,
      addonIds: [addonId]
    }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
      queryClient.invalidateQueries({ queryKey: ['downloadStats'] });
      
      toast.success(`Started downloading addon`);
    },
    onError: (error: any) => {
      toast.error(`Failed to start download: ${error.message}`);
    },
  });
};

// Hook for pausing a download session
export const usePauseDownloadSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => downloadApi.pauseSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
      queryClient.invalidateQueries({ queryKey: ['downloadSession', sessionId] });
      
      toast.success('Download session paused');
    },
    onError: (error: any) => {
      toast.error(`Failed to pause session: ${error.message}`);
    },
  });
};

// Hook for cancelling a download session
export const useCancelDownloadSession = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (sessionId: string) => downloadApi.cancelSession(sessionId),
    onSuccess: (_, sessionId) => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
      queryClient.invalidateQueries({ queryKey: ['downloadSession', sessionId] });
      queryClient.invalidateQueries({ queryKey: ['downloadStats'] });
      
      toast.success('Download session cancelled');
    },
    onError: (error: any) => {
      toast.error(`Failed to cancel session: ${error.message}`);
    },
  });
};

// Comprehensive hook for download management with all operations
export const useDownloadManagement = () => {
  const stats = useDownloadStats();
  const sessions = useDownloadSessions();
  const folders = useDownloadFolders();
  
  const startSession = useStartDownloadSession();
  const downloadAddon = useDownloadAddon();
  const pauseSession = usePauseDownloadSession();
  const cancelSession = useCancelDownloadSession();
  
  return {
    // Data
    stats,
    sessions,
    folders,
    
    // Actions
    startSession: startSession.mutate,
    downloadAddon: downloadAddon.mutate,
    pauseSession: pauseSession.mutate,
    cancelSession: cancelSession.mutate,
    
    // Loading states
    isStarting: startSession.isPending,
    isPausing: pauseSession.isPending,
    isCancelling: cancelSession.isPending,
    
    // Overall loading state
    isLoading: stats.isLoading || sessions.isLoading,
    isError: stats.isError || sessions.isError,
    error: stats.error || sessions.error,
  };
};

// Utility function to calculate active downloads count
export const calculateActiveDownloads = (sessions: DownloadStatusResponse[]): number => {
  return sessions
    .filter(session => session.status === 'Active')
    .reduce((total, session) => total + session.activeDownloads, 0);
};

// Utility function to get session by ID
export const getSessionById = (sessions: DownloadStatusResponse[], sessionId: string): DownloadStatusResponse | undefined => {
  return sessions.find(session => session.sessionId === sessionId);
};

// Utility function to format download speed
export const formatDownloadSpeed = (bytesPerSecond: number): string => {
  if (bytesPerSecond === 0) return '0 B/s';
  
  const units = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
  const k = 1024;
  const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
  
  return `${parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(1))} ${units[i]}`;
};

// Utility function to calculate estimated time remaining
export const calculateTimeRemaining = (totalBytes: number, downloadedBytes: number, speedBytesPerSecond: number): string => {
  if (speedBytesPerSecond === 0) return 'Unknown';
  
  const remainingBytes = totalBytes - downloadedBytes;
  const remainingSeconds = remainingBytes / speedBytesPerSecond;
  
  if (remainingSeconds < 60) {
    return `${Math.round(remainingSeconds)}s`;
  } else if (remainingSeconds < 3600) {
    return `${Math.round(remainingSeconds / 60)}m`;
  } else {
    const hours = Math.floor(remainingSeconds / 3600);
    const minutes = Math.round((remainingSeconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  }
};
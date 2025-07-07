import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './api';
import type { SearchParams } from '../types/api';

// Query keys
export const queryKeys = {
  health: ['health'] as const,
  addons: ['addons'] as const,
  addon: (id: string) => ['addons', id] as const,
  addonStats: ['addons', 'stats'] as const,
  latestAddons: (count: number) => ['addons', 'latest', count] as const,
  downloads: ['downloads'] as const,
  downloadStats: ['downloads', 'stats'] as const,
  downloadSessions: ['downloads', 'sessions'] as const,
  systemLogs: ['system', 'logs'] as const,
};

// Health queries
export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: () => apiClient.getHealth(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Addon queries
export function useAddons(params: SearchParams = {}) {
  return useQuery({
    queryKey: [...queryKeys.addons, params],
    queryFn: () => apiClient.getAddons(params),
    keepPreviousData: true,
  });
}

export function useAddon(id: string) {
  return useQuery({
    queryKey: queryKeys.addon(id),
    queryFn: () => apiClient.getAddon(id),
    enabled: !!id,
  });
}

export function useAddonStats() {
  return useQuery({
    queryKey: queryKeys.addonStats,
    queryFn: () => apiClient.getAddonStats(),
    refetchInterval: 60000, // Refetch every minute
  });
}

export function useLatestAddons(count = 10) {
  return useQuery({
    queryKey: queryKeys.latestAddons(count),
    queryFn: () => apiClient.getLatestAddons(count),
    refetchInterval: 300000, // Refetch every 5 minutes
  });
}

// Download queries
export function useDownloads() {
  return useQuery({
    queryKey: queryKeys.downloads,
    queryFn: () => apiClient.getDownloads(),
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });
}

export function useDownloadStats() {
  return useQuery({
    queryKey: queryKeys.downloadStats,
    queryFn: () => apiClient.getDownloadStats(),
    refetchInterval: 5000, // Refetch every 5 seconds
  });
}

export function useDownloadSessions() {
  return useQuery({
    queryKey: queryKeys.downloadSessions,
    queryFn: () => apiClient.getDownloadSessions(),
    refetchInterval: 10000, // Refetch every 10 seconds
  });
}

// System queries
export function useSystemLogs(params: { level?: string; limit?: number } = {}) {
  return useQuery({
    queryKey: [...queryKeys.systemLogs, params],
    queryFn: () => apiClient.getSystemLogs(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

// Mutations
export function useStartDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (addonId: string) => apiClient.startDownload(addonId),
    onSuccess: () => {
      // Invalidate and refetch download-related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadStats });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadSessions });
    },
  });
}

export function usePauseDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (downloadId: string) => apiClient.pauseDownload(downloadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
    },
  });
}

export function useResumeDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (downloadId: string) => apiClient.resumeDownload(downloadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
    },
  });
}

export function useCancelDownload() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (downloadId: string) => apiClient.cancelDownload(downloadId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.downloads });
      queryClient.invalidateQueries({ queryKey: queryKeys.downloadStats });
    },
  });
}

import { useQuery } from '@tanstack/react-query';
import { systemApi, downloadApi, addonApi } from '@/services/api';
import { ApplicationStatusReport, HealthResponse, DownloadStats } from '@/types/api';

// System health hook
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: systemApi.getHealth,
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 15000, // Data is fresh for 15 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Comprehensive system status hook
export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system', 'status'],
    queryFn: systemApi.getStatusReport,
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000, // Data is fresh for 30 seconds
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Download statistics hook
export const useDownloadStats = () => {
  return useQuery({
    queryKey: ['downloads', 'stats'],
    queryFn: downloadApi.getStats,
    refetchInterval: 15000, // Refresh every 15 seconds
    staleTime: 10000, // Data is fresh for 10 seconds
    retry: 3,
  });
};

// Addon statistics hook
export const useAddonStats = () => {
  return useQuery({
    queryKey: ['addons', 'stats'],
    queryFn: addonApi.getStats,
    refetchInterval: 300000, // Refresh every 5 minutes
    staleTime: 120000, // Data is fresh for 2 minutes
    retry: 3,
  });
};

// Combined system metrics hook
export const useSystemMetrics = () => {
  const healthQuery = useSystemHealth();
  const statusQuery = useSystemStatus();
  const downloadStatsQuery = useDownloadStats();
  const addonStatsQuery = useAddonStats();

  return {
    health: healthQuery.data,
    status: statusQuery.data,
    downloadStats: downloadStatsQuery.data,
    addonStats: addonStatsQuery.data,
    isLoading: healthQuery.isLoading || statusQuery.isLoading || downloadStatsQuery.isLoading || addonStatsQuery.isLoading,
    isError: healthQuery.isError || statusQuery.isError || downloadStatsQuery.isError || addonStatsQuery.isError,
    error: healthQuery.error || statusQuery.error || downloadStatsQuery.error || addonStatsQuery.error,
    refetch: () => {
      healthQuery.refetch();
      statusQuery.refetch();
      downloadStatsQuery.refetch();
      addonStatsQuery.refetch();
    },
  };
};

// System actions hook
export const useSystemActions = () => {
  const triggerConsoleReport = async () => {
    try {
      await systemApi.triggerConsoleReport();
      return { success: true, message: 'Console report triggered successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to trigger console report' };
    }
  };

  const triggerManualScrape = async (token: string) => {
    try {
      await systemApi.triggerScrape(token);
      return { success: true, message: 'Manual scrape triggered successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to trigger manual scrape' };
    }
  };

  return {
    triggerConsoleReport,
    triggerManualScrape,
  };
};
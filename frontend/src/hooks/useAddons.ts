import { useQuery } from '@tanstack/react-query';
import { addonApi, systemApi } from '@/services/api';
import type { AddonSummary } from '@/types/api';

// Hook for getting addon statistics
export const useAddonStats = () => {
  return useQuery({
    queryKey: ['addonStats'],
    queryFn: () => addonApi.getStats(),
    refetchInterval: 30000, // Refresh every 30 seconds
    staleTime: 10000, // Consider data stale after 10 seconds
  });
};

// Hook for getting latest addons
export const useLatestAddons = (count: number = 5) => {
  return useQuery({
    queryKey: ['latestAddons', count],
    queryFn: () => addonApi.getLatestAddons(count),
    refetchInterval: 30000,
    staleTime: 10000,
  });
};

// Hook for getting system health
export const useSystemHealth = () => {
  return useQuery({
    queryKey: ['systemHealth'],
    queryFn: () => systemApi.getHealth(),
    refetchInterval: 15000, // Check health every 15 seconds
    staleTime: 5000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });
};

// Hook for getting comprehensive addon list with stats
export const useAddonsWithStats = () => {
  return useQuery({
    queryKey: ['addonsWithStats'],
    queryFn: async () => {
      const response = await addonApi.getAddons({
        page: 1,
        pageSize: 50,
        sortBy: 'dateAdded',
        sortDirection: 'desc'
      });
      return response;
    },
    refetchInterval: 60000, // Refresh every minute
    staleTime: 30000,
  });
};

// Utility function to calculate recent addons (last 7 days)
export const calculateRecentAddons = (addons: AddonSummary[]): number => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return addons.filter(addon => {
    const addonDate = new Date(addon.dateAdded);
    return addonDate >= sevenDaysAgo;
  }).length;
};

// Hook for comprehensive dashboard data
export const useDashboardData = () => {
  const addonStats = useAddonStats();
  const latestAddons = useLatestAddons(5);
  const systemHealth = useSystemHealth();
  const addonsWithStats = useAddonsWithStats();

  return {
    addonStats,
    latestAddons,
    systemHealth,
    addonsWithStats,
    isLoading: addonStats.isLoading || latestAddons.isLoading || systemHealth.isLoading,
    isError: addonStats.isError || latestAddons.isError || systemHealth.isError,
    error: addonStats.error || latestAddons.error || systemHealth.error,
  };
};
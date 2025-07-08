import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { apiClient } from '@/services/api';
import { AddonsListRequest, AddonSummary, AddonsListResponse } from '@/types/api';

interface UseInfiniteAddonsParams extends Omit<AddonsListRequest, 'page'> {
  pageSize?: number;
  enabled?: boolean;
}

export const useInfiniteAddons = (params: UseInfiniteAddonsParams) => {
  const {
    pageSize = 50, // Larger page size for virtual scrolling
    enabled = true,
    ...otherParams
  } = params;

  const queryResult = useInfiniteQuery({
    queryKey: ['addons-infinite', { ...otherParams, pageSize }],
    queryFn: ({ pageParam = 1 }) =>
      apiClient.getAddons({
        ...otherParams,
        page: pageParam,
        pageSize,
      }),
    getNextPageParam: (lastPage) => {
      const { pagination } = lastPage;
      return pagination.hasNext ? pagination.currentPage + 1 : undefined;
    },
    initialPageParam: 1,
    enabled,
    staleTime: 30000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
  });

  // Flatten all pages into a single array of addons
  const allAddons = useMemo(() => {
    if (!queryResult.data?.pages) return [];
    
    return queryResult.data.pages.reduce<AddonSummary[]>((acc, page) => {
      return acc.concat(page.addons);
    }, []);
  }, [queryResult.data?.pages]);

  // Get summary from the first page
  const summary = queryResult.data?.pages[0]?.summary;

  // Calculate loading state for virtual scrolling
  const isLoadingInitial = queryResult.isLoading && !queryResult.data;
  const isLoadingMore = queryResult.isFetchingNextPage;

  return {
    ...queryResult,
    addons: allAddons,
    summary,
    isLoadingInitial,
    isLoadingMore,
    totalCount: summary?.totalAddons || 0,
    hasMoreData: queryResult.hasNextPage,
    loadMore: queryResult.fetchNextPage,
  };
};

// Hook for traditional pagination (keeping for backward compatibility)
export const usePaginatedAddons = (params: AddonsListRequest & { enabled?: boolean }) => {
  const { enabled = true, ...queryParams } = params;

  return useQuery({
    queryKey: ['addons-paginated', queryParams],
    queryFn: () => apiClient.getAddons(queryParams),
    enabled,
    staleTime: 30000,
    placeholderData: (previousData: AddonsListResponse | undefined) => previousData,
  });
};

// Performance monitoring hook for virtual scrolling
export const useVirtualScrollingPerformance = () => {
  const startTime = useMemo(() => performance.now(), []);
  
  const measureRenderTime = () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    if (renderTime > 16.67) { // More than 60fps threshold
      console.warn(`Virtual scrolling render took ${renderTime.toFixed(2)}ms (>16.67ms threshold)`);
    }
    
    return renderTime;
  };

  return { measureRenderTime };
};
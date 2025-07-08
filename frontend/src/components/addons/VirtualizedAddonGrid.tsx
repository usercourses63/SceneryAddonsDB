import React, { useMemo, useEffect } from 'react';
import { useVirtualScrolling } from '@/hooks/useVirtualScrolling';
import { AddonSummary } from '@/types/api';
import AddonCard from './AddonCard';

interface VirtualizedAddonGridProps {
  addons: AddonSummary[];
  selectMode: boolean;
  selectedAddons: Set<string>;
  onAddonSelect: (addonId: string, selected: boolean) => void;
  containerHeight?: number;
  itemHeight?: number;
  itemsPerRow?: number;
  hasMoreData?: boolean;
  loadMore?: () => void;
  isLoadingMore?: boolean;
}

export const VirtualizedAddonGrid: React.FC<VirtualizedAddonGridProps> = ({
  addons,
  selectMode,
  selectedAddons,
  onAddonSelect,
  containerHeight = 600,
  itemHeight = 320, // Increased to accommodate card + gap
  itemsPerRow = 4,
  hasMoreData = false,
  loadMore,
  isLoadingMore = false,
}) => {
  // Calculate rows from addons
  const rows = useMemo(() => {
    const result = [];
    for (let i = 0; i < addons.length; i += itemsPerRow) {
      result.push(addons.slice(i, i + itemsPerRow));
    }
    return result;
  }, [addons, itemsPerRow]);

  const {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    endIndex,
  } = useVirtualScrolling({
    itemHeight,
    containerHeight,
    totalItems: rows.length,
    overscan: 2,
  });

  // Infinite scroll detection
  useEffect(() => {
    if (!hasMoreData || isLoadingMore || !loadMore) return;
    
    // Load more when we're near the end (within 5 rows)
    const threshold = Math.max(0, rows.length - 5);
    if (endIndex >= threshold) {
      loadMore();
    }
  }, [endIndex, rows.length, hasMoreData, isLoadingMore, loadMore]);

  return (
    <div
      ref={scrollElementRef}
      className="h-full overflow-auto"
      style={{ height: containerHeight }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          {visibleItems.map((rowIndex) => {
            const row = rows[rowIndex];
            if (!row) return null;

            return (
              <div
                key={rowIndex}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 mb-6"
                style={{ minHeight: itemHeight }}
              >
                {row.map((addon) => (
                  <AddonCard
                    key={addon.id}
                    addon={addon}
                    selectMode={selectMode}
                    isSelected={selectedAddons.has(addon.id)}
                    onSelect={(selected: boolean) => onAddonSelect(addon.id, selected)}
                  />
                ))}
              </div>
            );
          })}
        </div>
        
        {/* Loading indicator */}
        {isLoadingMore && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading more addons...</span>
          </div>
        )}
      </div>
    </div>
  );
};

// Hook to calculate optimal grid dimensions
export const useGridDimensions = (containerWidth: number = 1200) => {
  return useMemo(() => {
    // Calculate items per row based on container width
    // Assuming each card is approximately 280px wide with 24px gap
    const cardWidth = 280;
    const gap = 24;
    const padding = 48; // 24px on each side
    
    const availableWidth = containerWidth - padding;
    const itemsPerRow = Math.max(1, Math.floor((availableWidth + gap) / (cardWidth + gap)));
    
    // Item height includes card height plus gap
    const itemHeight = 280; // Card height + gap
    
    return {
      itemsPerRow,
      itemHeight,
      cardWidth,
    };
  }, [containerWidth]);
};

// Performance optimized version with React.memo
export const VirtualizedAddonGridMemo = React.memo(VirtualizedAddonGrid, (prevProps, nextProps) => {
  // Custom comparison for better performance
  return (
    prevProps.addons === nextProps.addons &&
    prevProps.selectMode === nextProps.selectMode &&
    prevProps.selectedAddons === nextProps.selectedAddons &&
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.itemHeight === nextProps.itemHeight &&
    prevProps.itemsPerRow === nextProps.itemsPerRow
  );
});

VirtualizedAddonGridMemo.displayName = 'VirtualizedAddonGrid';
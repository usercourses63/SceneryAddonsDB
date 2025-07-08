import React, { useEffect } from 'react';
import { useVirtualScrolling } from '@/hooks/useVirtualScrolling';
import { AddonSummary } from '@/types/api';
import AddonListItem from './AddonListItem';

interface VirtualizedAddonListProps {
  addons: AddonSummary[];
  selectMode: boolean;
  selectedAddons: Set<string>;
  onAddonSelect: (addonId: string, selected: boolean) => void;
  containerHeight?: number;
  itemHeight?: number;
  hasMoreData?: boolean;
  loadMore?: () => void;
  isLoadingMore?: boolean;
}

export const VirtualizedAddonList: React.FC<VirtualizedAddonListProps> = ({
  addons,
  selectMode,
  selectedAddons,
  onAddonSelect,
  containerHeight = 600,
  itemHeight = 120, // Height of each list item
  hasMoreData = false,
  loadMore,
  isLoadingMore = false,
}) => {
  const {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    endIndex,
  } = useVirtualScrolling({
    itemHeight,
    containerHeight,
    totalItems: addons.length,
    overscan: 5,
  });

  // Infinite scroll detection
  useEffect(() => {
    if (!hasMoreData || isLoadingMore || !loadMore) return;
    
    const threshold = Math.max(0, addons.length - 5);
    if (endIndex >= threshold) {
      loadMore();
    }
  }, [endIndex, addons.length, hasMoreData, isLoadingMore, loadMore]);

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
          {visibleItems.map((index) => {
            const addon = addons[index];
            if (!addon) return null;

            return (
              <div
                key={addon.id}
                style={{ height: itemHeight }}
                className="px-6"
              >
                <AddonListItem
                  addon={addon}
                  selectMode={selectMode}
                  isSelected={selectedAddons.has(addon.id)}
                  onSelect={(selected: boolean) => onAddonSelect(addon.id, selected)}
                />
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

// Performance optimized version with React.memo
export const VirtualizedAddonListMemo = React.memo(VirtualizedAddonList, (prevProps, nextProps) => {
  return (
    prevProps.addons === nextProps.addons &&
    prevProps.selectMode === nextProps.selectMode &&
    prevProps.selectedAddons === nextProps.selectedAddons &&
    prevProps.containerHeight === nextProps.containerHeight &&
    prevProps.itemHeight === nextProps.itemHeight
  );
});

VirtualizedAddonListMemo.displayName = 'VirtualizedAddonList';
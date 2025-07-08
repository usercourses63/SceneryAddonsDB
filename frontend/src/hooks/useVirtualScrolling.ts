import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface VirtualScrollingOptions {
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
  totalItems: number;
  dynamicHeight?: boolean;
}

export interface VirtualScrollingResult {
  scrollElementRef: React.RefObject<HTMLDivElement>;
  startIndex: number;
  endIndex: number;
  visibleItems: number[];
  scrollToItem: (index: number) => void;
  totalHeight: number;
  offsetY: number;
}

export const useVirtualScrolling = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  totalItems,
  dynamicHeight = false,
}: VirtualScrollingOptions): VirtualScrollingResult => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Create ref for scroll container
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const { startIndex, endIndex, visibleItems } = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const visibleCount = Math.ceil(containerHeight / itemHeight);
    
    const startIdx = Math.max(0, start - overscan);
    const endIdx = Math.min(totalItems - 1, start + visibleCount + overscan);
    
    const items = [];
    for (let i = startIdx; i <= endIdx; i++) {
      items.push(i);
    }
    
    return {
      startIndex: startIdx,
      endIndex: endIdx,
      visibleItems: items,
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, totalItems]);

  // Calculate total height and offset
  const totalHeight = totalItems * itemHeight;
  const offsetY = startIndex * itemHeight;

  // Handle scroll events
  const handleScroll = useCallback(() => {
    if (!scrollElementRef.current) return;
    
    const newScrollTop = scrollElementRef.current.scrollTop;
    setScrollTop(newScrollTop);
    
    // Set scrolling state for performance optimizations
    setIsScrolling(true);
  }, []);

  // Debounce scroll end detection
  useEffect(() => {
    if (!isScrolling) return;
    
    const timer = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
    
    return () => clearTimeout(timer);
  }, [scrollTop, isScrolling]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (!scrollElementRef.current) return;
    
    const targetScrollTop = index * itemHeight;
    scrollElementRef.current.scrollTo({
      top: targetScrollTop,
      behavior: 'smooth',
    });
  }, [itemHeight]);

  // Attach scroll listener
  useEffect(() => {
    const element = scrollElementRef.current;
    if (!element) return;

    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return {
    scrollElementRef,
    startIndex,
    endIndex,
    visibleItems,
    scrollToItem,
    totalHeight,
    offsetY,
  };
};

// Hook for infinite scrolling with virtual scrolling
export const useInfiniteVirtualScrolling = ({
  itemHeight,
  containerHeight,
  overscan = 5,
  totalItems,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
}: VirtualScrollingOptions & {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
}) => {
  const virtualScrolling = useVirtualScrolling({
    itemHeight,
    containerHeight,
    overscan,
    totalItems,
  });

  const { scrollElementRef, endIndex } = virtualScrolling;

  // Trigger infinite scroll when near end
  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage || !fetchNextPage) return;
    
    // Trigger fetch when we're within 10 items of the end
    const threshold = totalItems - 10;
    if (endIndex >= threshold) {
      fetchNextPage();
    }
  }, [endIndex, totalItems, hasNextPage, isFetchingNextPage, fetchNextPage]);

  return virtualScrolling;
};
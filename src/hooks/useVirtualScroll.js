import { useState, useEffect, useCallback, useMemo } from 'react';

export const useVirtualScroll = (items, itemHeight = 80, containerHeight = 400) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [containerRef, setContainerRef] = useState(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );
    
    return {
      startIndex: Math.max(0, startIndex - 2), // Buffer
      endIndex: Math.min(items.length, endIndex + 2), // Buffer
      startOffset: startIndex * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex).map((item, index) => ({
      ...item,
      index: visibleRange.startIndex + index,
      style: {
        position: 'absolute',
        top: (visibleRange.startIndex + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange]);

  // Handle scroll
  const handleScroll = useCallback((event) => {
    setScrollTop(event.target.scrollTop);
  }, []);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (containerRef) {
      containerRef.scrollTop = index * itemHeight;
    }
  }, [containerRef, itemHeight]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (containerRef) {
      containerRef.scrollTop = containerRef.scrollHeight;
    }
  }, [containerRef]);

  return {
    visibleItems,
    totalHeight: items.length * itemHeight,
    scrollTop,
    handleScroll,
    scrollToItem,
    scrollToBottom,
    setContainerRef
  };
}; 
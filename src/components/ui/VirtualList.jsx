import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Virtual List Component for efficient rendering of large datasets
 * Only renders visible items to improve performance
 */
export const VirtualList = ({
  items = [],
  itemHeight = 80,
  containerHeight = 400,
  overscan = 5,
  renderItem,
  className = '',
  onScroll,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end).map((item, index) => ({
      ...item,
      virtualIndex: visibleRange.start + index,
      style: {
        position: 'absolute',
        top: (visibleRange.start + index) * itemHeight,
        height: itemHeight,
        width: '100%'
      }
    }));
  }, [items, visibleRange, itemHeight]);

  // Handle scroll
  const handleScroll = useCallback((e) => {
    const newScrollTop = e.target.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(e);
  }, [onScroll]);

  // Scroll to item
  const scrollToItem = useCallback((index) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = index * itemHeight;
    }
  }, [itemHeight]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    scrollToItem(0);
  }, [scrollToItem]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    scrollToItem(items.length - 1);
  }, [scrollToItem, items.length]);

  return (
    <div 
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{ height: containerHeight, overflow: 'hidden' }}
      {...props}
    >
      <div
        ref={scrollRef}
        className="virtual-list-scroll"
        style={{
          height: '100%',
          overflow: 'auto',
          position: 'relative'
        }}
        onScroll={handleScroll}
      >
        <div
          className="virtual-list-content"
          style={{
            height: items.length * itemHeight,
            position: 'relative'
          }}
        >
          <AnimatePresence>
            {visibleItems.map((item) => (
              <motion.div
                key={item.id || item.virtualIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                style={item.style}
              >
                {renderItem(item, item.virtualIndex)}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

/**
 * Hook for virtual list functionality
 */
export const useVirtualList = (items, options = {}) => {
  const {
    itemHeight = 80,
    containerHeight = 400,
    overscan = 5
  } = options;

  const [scrollTop, setScrollTop] = useState(0);

  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan,
      items.length
    );
    return {
      start: Math.max(0, start - overscan),
      end
    };
  }, [scrollTop, itemHeight, containerHeight, overscan, items.length]);

  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end);
  }, [items, visibleRange]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  return {
    visibleItems,
    visibleRange,
    handleScroll,
    totalHeight: items.length * itemHeight,
    scrollTop
  };
}; 
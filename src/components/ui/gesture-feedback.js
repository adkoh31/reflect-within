import React, { useCallback } from 'react';
import { motion } from 'framer-motion';

// Haptic feedback utility
const triggerHaptic = (type = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 50,
      heavy: 100,
      success: [50, 50, 50],
      error: [100, 50, 100]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

// Gesture-aware button with haptic feedback
export const GestureButton = ({ 
  children, 
  onPress, 
  hapticType = 'light',
  scale = 0.95,
  className = "",
  disabled = false,
  ...props 
}) => {
  const handlePress = useCallback(() => {
    if (!disabled) {
      triggerHaptic(hapticType);
      onPress?.();
    }
  }, [onPress, hapticType, disabled]);

  return (
    <motion.button
      className={className}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : scale }}
      onClick={handlePress}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Swipeable card with gesture feedback
export const SwipeableCard = ({ 
  children, 
  onSwipeLeft, 
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  threshold = 50,
  className = "",
  ...props 
}) => {
  const handleDragEnd = useCallback((event, info) => {
    const { offset, velocity } = info;
    
    if (Math.abs(offset.x) > threshold && Math.abs(velocity.x) > 0.5) {
      if (offset.x > 0) {
        triggerHaptic('medium');
        onSwipeRight?.();
      } else {
        triggerHaptic('medium');
        onSwipeLeft?.();
      }
    }
    
    if (Math.abs(offset.y) > threshold && Math.abs(velocity.y) > 0.5) {
      if (offset.y > 0) {
        triggerHaptic('medium');
        onSwipeDown?.();
      } else {
        triggerHaptic('medium');
        onSwipeUp?.();
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, threshold]);

  return (
    <motion.div
      className={className}
      drag
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      dragElastic={0.1}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Pull-to-refresh component
export const PullToRefresh = ({ 
  onRefresh, 
  children, 
  threshold = 80,
  className = "",
  ...props 
}) => {
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [pullDistance, setPullDistance] = React.useState(0);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    triggerHaptic('success');
    await onRefresh?.();
    setIsRefreshing(false);
  }, [onRefresh]);

  const handleScroll = useCallback((e) => {
    const scrollTop = e.target.scrollTop;
    if (scrollTop < 0) {
      setPullDistance(Math.abs(scrollTop));
    } else {
      setPullDistance(0);
    }
  }, []);

  const handleScrollEnd = useCallback(() => {
    if (pullDistance > threshold) {
      handleRefresh();
    }
    setPullDistance(0);
  }, [pullDistance, threshold, handleRefresh]);

  return (
    <div className={className} style={{ minHeight: '100vh', height: '100%', pointerEvents: 'auto' }} {...props}>
      {/* Pull indicator */}
      {pullDistance > 0 && (
        <motion.div
          className="absolute top-0 left-0 right-0 flex items-center justify-center py-4 pointer-events-none"
          style={{ transform: `translateY(${Math.min(pullDistance, threshold)}px)` }}
        >
          <motion.div
            className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full"
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0 }}
          />
        </motion.div>
      )}
      
      <div
        className="overflow-auto h-full min-h-screen pointer-events-auto"
        onScroll={handleScroll}
        onScrollEnd={handleScrollEnd}
        style={{ position: 'relative', zIndex: 1 }}
      >
        {children}
      </div>
    </div>
  );
};

// Long press handler
export const useLongPress = (onLongPress, ms = 500) => {
  const [isLongPressing, setIsLongPressing] = React.useState(false);
  const timeoutRef = React.useRef();

  const start = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      triggerHaptic('heavy');
      onLongPress?.();
    }, ms);
  }, [onLongPress, ms]);

  const stop = useCallback(() => {
    clearTimeout(timeoutRef.current);
    setIsLongPressing(false);
  }, []);

  return {
    isLongPressing,
    handlers: {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop,
    }
  };
}; 
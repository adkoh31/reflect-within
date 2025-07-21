import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Mobile gesture handling hook for enhanced touch interactions
 */
export const useMobileGestures = (options = {}) => {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onTap,
    onLongPress,
    threshold = 50,
    longPressDelay = 500,
    enableHaptic = true
  } = options;

  const [isLongPressing, setIsLongPressing] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const longPressTimeout = useRef(null);
  const elementRef = useRef(null);

  // Haptic feedback utility
  const triggerHaptic = useCallback((type = 'light') => {
    if (!enableHaptic || !('vibrate' in navigator)) return;
    
    const patterns = {
      light: 10,
      medium: 50,
      heavy: 100,
      success: [50, 50, 50],
      error: [100, 50, 100]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }, [enableHaptic]);

  // Touch start handler
  const handleTouchStart = useCallback((e) => {
    setTouchStart({
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
      time: Date.now()
    });

    // Start long press timer
    longPressTimeout.current = setTimeout(() => {
      setIsLongPressing(true);
      triggerHaptic('heavy');
      onLongPress?.(e);
    }, longPressDelay);
  }, [onLongPress, longPressDelay, triggerHaptic]);

  // Touch move handler
  const handleTouchMove = useCallback((e) => {
    // Cancel long press if user moves finger
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }
  }, []);

  // Touch end handler
  const handleTouchEnd = useCallback((e) => {
    // Clear long press timer
    if (longPressTimeout.current) {
      clearTimeout(longPressTimeout.current);
      longPressTimeout.current = null;
    }

    if (!touchStart) return;

    const touchEndData = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    setTouchEnd(touchEndData);

    // Calculate swipe distance and duration
    const deltaX = touchEndData.x - touchStart.x;
    const deltaY = touchEndData.y - touchStart.y;
    const deltaTime = touchEndData.time - touchStart.time;

    // Determine if it's a swipe or tap
    const isSwipe = Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold;
    const isQuickTouch = deltaTime < 300;

    if (isSwipe) {
      // Handle swipe gestures
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > threshold) {
          triggerHaptic('medium');
          onSwipeRight?.(e, { deltaX, deltaY, deltaTime });
        } else if (deltaX < -threshold) {
          triggerHaptic('medium');
          onSwipeLeft?.(e, { deltaX, deltaY, deltaTime });
        }
      } else {
        // Vertical swipe
        if (deltaY > threshold) {
          triggerHaptic('medium');
          onSwipeDown?.(e, { deltaX, deltaY, deltaTime });
        } else if (deltaY < -threshold) {
          triggerHaptic('medium');
          onSwipeUp?.(e, { deltaX, deltaY, deltaTime });
        }
      }
    } else if (isQuickTouch && !isLongPressing) {
      // Handle tap
      triggerHaptic('light');
      onTap?.(e);
    }

    // Reset state
    setIsLongPressing(false);
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onTap, isLongPressing, triggerHaptic]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeout.current) {
        clearTimeout(longPressTimeout.current);
      }
    };
  }, []);

  // Return gesture handlers and state
  return {
    gestureHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isLongPressing,
    touchStart,
    touchEnd,
    elementRef,
    triggerHaptic
  };
};

/**
 * Hook for mobile keyboard handling
 */
export const useMobileKeyboard = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const handleResize = () => {
      const visualViewport = window.visualViewport;
      if (visualViewport) {
        const heightDiff = window.innerHeight - visualViewport.height;
        setIsKeyboardVisible(heightDiff > 150);
        setKeyboardHeight(heightDiff);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport.removeEventListener('resize', handleResize);
    }
  }, []);

  return {
    isKeyboardVisible,
    keyboardHeight
  };
};

/**
 * Hook for mobile scroll optimization
 */
export const useMobileScroll = (options = {}) => {
  const {
    onScrollToTop,
    onScrollToBottom,
    threshold = 100
  } = options;

  const [isAtTop, setIsAtTop] = useState(true);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const element = e.target;
    const scrollTop = element.scrollTop;
    const scrollHeight = element.scrollHeight;
    const clientHeight = element.clientHeight;

    // Check if at top
    const atTop = scrollTop <= threshold;
    if (atTop !== isAtTop) {
      setIsAtTop(atTop);
      if (atTop) onScrollToTop?.();
    }

    // Check if at bottom
    const atBottom = scrollTop + clientHeight >= scrollHeight - threshold;
    if (atBottom !== isAtBottom) {
      setIsAtBottom(atBottom);
      if (atBottom) onScrollToBottom?.();
    }
  }, [isAtTop, isAtBottom, threshold, onScrollToTop, onScrollToBottom]);

  const scrollToTop = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ 
        top: scrollRef.current.scrollHeight, 
        behavior: 'smooth' 
      });
    }
  }, []);

  return {
    scrollRef,
    handleScroll,
    scrollToTop,
    scrollToBottom,
    isAtTop,
    isAtBottom
  };
}; 
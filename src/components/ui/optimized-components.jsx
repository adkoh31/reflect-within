import React, { memo, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

// Optimized Button Component
export const OptimizedButton = memo(({ 
  children, 
  onClick, 
  disabled = false, 
  variant = 'primary',
  size = 'md',
  className = '',
  ...props 
}) => {
  const handleClick = useCallback((e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  }, [disabled, onClick]);

  const buttonClasses = useMemo(() => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900';
    
    const variantClasses = {
      primary: 'bg-cyan-600 hover:bg-cyan-700 text-white focus:ring-cyan-500',
      secondary: 'bg-slate-700 hover:bg-slate-600 text-slate-200 focus:ring-slate-500',
      outline: 'border border-slate-600 hover:bg-slate-700 text-slate-300 focus:ring-slate-500',
      ghost: 'hover:bg-slate-700 text-slate-300 focus:ring-slate-500'
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    };
    
    return `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
  }, [variant, size, className]);

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

// Optimized Card Component
export const OptimizedCard = memo(({ 
  children, 
  className = '', 
  hover = true,
  ...props 
}) => {
  const cardClasses = useMemo(() => {
    const baseClasses = 'bg-slate-900/80 backdrop-blur-md rounded-xl border border-slate-700/50 p-6';
    const hoverClasses = hover ? 'hover:bg-slate-800/80 hover:border-slate-600/50 transition-all duration-200' : '';
    return `${baseClasses} ${hoverClasses} ${className}`;
  }, [className, hover]);

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
});

// Optimized List Component with Virtual Scrolling
export const OptimizedList = memo(({ 
  items = [], 
  renderItem, 
  itemHeight = 60,
  containerHeight = 400,
  className = '',
  ...props 
}) => {
  const containerStyle = useMemo(() => ({
    height: containerHeight,
    overflowY: 'auto'
  }), [containerHeight]);

  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  return (
    <div 
      className={`relative ${className}`} 
      style={containerStyle}
      {...props}
    >
      <div style={{ height: totalHeight }}>
        {items.map((item, index) => (
          <div
            key={item.id || index}
            style={{
              position: 'absolute',
              top: index * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
});

// Optimized Image Component
export const OptimizedImage = memo(({ 
  src, 
  alt, 
  className = '', 
  placeholder = null,
  onLoad,
  onError,
  ...props 
}) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    onLoad?.();
  }, [onLoad]);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  }, [onError]);

  return (
    <div className={`relative ${className}`}>
      {isLoading && placeholder && (
        <div className="absolute inset-0 bg-slate-700/50 animate-pulse rounded-lg" />
      )}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
          <span className="text-slate-400">⚠️</span>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        loading="lazy"
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
    </div>
  );
});

// Optimized Modal Component
export const OptimizedModal = memo(({ 
  isOpen, 
  onClose, 
  children, 
  title,
  className = '',
  ...props 
}) => {
  const handleBackdropClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const handleEscape = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 max-w-md w-full ${className}`}
        {...props}
      >
        {title && (
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <h2 className="text-lg font-semibold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-slate-700/50 rounded-lg transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
});

// Optimized Form Input Component
export const OptimizedInput = memo(({ 
  label,
  error,
  className = '',
  ...props 
}) => {
  const inputId = useMemo(() => `input-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-300">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 ${
          error ? 'border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  );
});

// Performance monitoring HOC
export const withPerformanceMonitoring = (Component, componentName) => {
  return memo((props) => {
    const renderStart = React.useRef(performance.now());
    
    React.useEffect(() => {
      const renderTime = performance.now() - renderStart.current;
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`[Performance] ${componentName} took ${renderTime.toFixed(2)}ms to render`);
      }
    });

    return <Component {...props} />;
  });
};

// Display names for debugging
OptimizedButton.displayName = 'OptimizedButton';
OptimizedCard.displayName = 'OptimizedCard';
OptimizedList.displayName = 'OptimizedList';
OptimizedImage.displayName = 'OptimizedImage';
OptimizedModal.displayName = 'OptimizedModal';
OptimizedInput.displayName = 'OptimizedInput'; 
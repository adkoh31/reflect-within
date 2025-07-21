import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

// Myra Logo Component - Pure Cyan Theme
const MyraLogo = memo(function MyraLogo({ 
  size = 'md', // 'sm', 'md', 'lg', 'xl'
  showText = true,
  className = '',
  animated = true
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg', 
    xl: 'text-2xl'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.div
        className={`relative ${sizeClasses[size]}`}
        initial={animated ? { scale: 0.8, opacity: 0 } : {}}
        animate={animated ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Outer ring with gradient */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-cyan-400 via-cyan-500 to-cyan-600 p-1"
          animate={animated ? { rotate: 360 } : {}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center">
            {/* Inner reflection effect */}
            <motion.div
              className="w-full h-full rounded-full bg-gradient-to-br from-cyan-100 to-cyan-200 dark:from-cyan-900/30 dark:to-cyan-800/30 flex items-center justify-center relative overflow-hidden"
              whileHover={animated ? { scale: 1.05 } : {}}
            >
              {/* Reflection shine */}
              {animated && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12"
                  animate={{ x: [-100, 100] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                />
              )}
              <Heart className={`${iconSizes[size]} text-cyan-600 dark:text-cyan-400`} />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {showText && (
        <div className="flex flex-col">
          <h2 className={`font-bold bg-gradient-to-r from-cyan-500 to-cyan-600 bg-clip-text text-transparent ${textSizes[size]}`}>
            Myra
          </h2>
          {size === 'xl' && (
            <p className="text-xs text-slate-400">AI Wellness Journal</p>
          )}
        </div>
      )}
    </div>
  );
});

// Logo Icon Only (for small spaces)
const MyraLogoIcon = memo(function MyraLogoIcon({ 
  size = 'md',
  className = '',
  animated = true 
}) {
  return (
    <MyraLogo 
      size={size} 
      showText={false} 
      className={className}
      animated={animated}
    />
  );
});

export { MyraLogo, MyraLogoIcon };
export default MyraLogo; 
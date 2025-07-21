import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

// Confetti piece component
const ConfettiPiece = ({ color, size, x, y, rotation, delay }) => (
  <motion.div
    className="absolute pointer-events-none"
    style={{
      left: x,
      top: y,
      width: size,
      height: size,
      backgroundColor: color,
      borderRadius: size < 4 ? '50%' : '2px',
    }}
    initial={{ 
      y: -20, 
      opacity: 0, 
      rotate: 0,
      scale: 0 
    }}
    animate={{ 
      y: window.innerHeight + 100, 
      opacity: [0, 1, 1, 0], 
      rotate: rotation,
      scale: [0, 1, 1, 0]
    }}
    transition={{ 
      duration: 3,
      delay,
      ease: "easeOut"
    }}
  />
);

// Main confetti component
export const Confetti = ({ 
  isActive = false, 
  colors = ['#60A5FA', '#34D399', '#FBBF24', '#F87171', '#A78BFA'],
  count = 50,
  className = ""
}) => {
  const containerRef = useRef(null);
  const [pieces, setPieces] = React.useState([]);

  useEffect(() => {
    if (isActive && containerRef.current) {
      const newPieces = [];
      const containerRect = containerRef.current.getBoundingClientRect();
      
      for (let i = 0; i < count; i++) {
        newPieces.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: Math.random() * 6 + 2,
          x: Math.random() * containerRect.width,
          y: -20,
          rotation: Math.random() * 360,
          delay: Math.random() * 0.5
        });
      }
      
      setPieces(newPieces);
      
      // Clear pieces after animation
      const timer = setTimeout(() => {
        setPieces([]);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [isActive, count, colors]);

  if (!isActive) return null;

  return (
    <div 
      ref={containerRef}
      className={`fixed inset-0 z-50 pointer-events-none ${className}`}
    >
      {pieces.map(piece => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
    </div>
  );
};

// Achievement celebration component
export const AchievementCelebration = ({ 
  isVisible, 
  title, 
  description, 
  onClose,
  type = 'streak' // 'streak', 'milestone', 'completion'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'streak':
        return '🔥';
      case 'milestone':
        return '🎯';
      case 'completion':
        return '🎉';
      default:
        return '✨';
    }
  };

  const getColors = () => {
    switch (type) {
      case 'streak':
        return ['#F59E0B', '#F97316', '#EF4444'];
      case 'milestone':
        return ['#3B82F6', '#8B5CF6', '#EC4899'];
      case 'completion':
        return ['#10B981', '#059669', '#047857'];
      default:
        return ['#60A5FA', '#34D399', '#FBBF24'];
    }
  };

  return (
    <>
      <Confetti 
        isActive={isVisible} 
        colors={getColors()}
        count={75}
      />
      
      <motion.div
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: isVisible ? 1 : 0 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 max-w-sm w-full text-center shadow-2xl"
          initial={{ scale: 0.8, y: 50 }}
          animate={{ 
            scale: isVisible ? 1 : 0.8, 
            y: isVisible ? 0 : 50 
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Icon */}
          <motion.div
            className="text-6xl mb-4"
            animate={isVisible ? { 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            } : {}}
            transition={{ 
              duration: 0.6,
              delay: 0.2
            }}
          >
            {getIcon()}
          </motion.div>
          
          {/* Title */}
          <motion.h3
            className="text-xl font-semibold text-slate-50 mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.3 }}
          >
            {title}
          </motion.h3>
          
          {/* Description */}
          <motion.p
            className="text-slate-300 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.4 }}
          >
            {description}
          </motion.p>
          
          {/* Close button */}
          <motion.button
            onClick={onClose}
            className="bg-cyan-500 text-slate-900 px-6 py-3 rounded-xl font-medium hover:bg-cyan-400 transition-colors"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ delay: 0.5 }}
          >
            Continue
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}; 
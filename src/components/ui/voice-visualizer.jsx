import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';

// Voice visualizer with animated bars
export const VoiceVisualizer = ({ 
  isListening = false, 
  volume = 0, 
  className = "",
  barCount = 20,
  ...props 
}) => {
  const [bars, setBars] = useState([]);
  const animationRef = useRef(null);
  const lastUpdateRef = useRef(0);

  // Memoize bar generation to prevent unnecessary recalculations
  const generateBars = useCallback(() => {
    return Array.from({ length: barCount }, () => ({
      height: Math.random() * 100,
      delay: Math.random() * 0.5
    }));
  }, [barCount]);

  // Memoize static bars for when not listening
  const staticBars = useMemo(() => 
    Array.from({ length: barCount }, () => ({ height: 0, delay: 0 })), 
    [barCount]
  );

  // Cleanup animation
  const cleanupAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  useEffect(() => {
    // Throttle updates to 60fps
    const throttleTime = 1000 / 60; // ~16ms

    if (isListening) {
      const animate = () => {
        const now = performance.now();
        if (now - lastUpdateRef.current >= throttleTime) {
          setBars(generateBars());
          lastUpdateRef.current = now;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animate();
    } else {
      cleanupAnimation();
      setBars(staticBars);
    }

    return cleanupAnimation;
  }, [isListening, generateBars, staticBars, cleanupAnimation]);

  // Memoize bar components to prevent unnecessary re-renders
  const barComponents = useMemo(() => 
    bars.map((bar, index) => (
      <motion.div
        key={index}
        className="w-1 bg-gradient-to-t from-cyan-400 to-blue-500 rounded-full"
        style={{ height: `${bar.height}%` }}
        animate={isListening ? {
          height: [`${bar.height}%`, `${Math.random() * 100}%`, `${bar.height}%`]
        } : { height: '0%' }}
        transition={{
          duration: 0.5,
          delay: bar.delay,
          repeat: isListening ? Infinity : 0,
          ease: "easeInOut"
        }}
      />
    )), [bars, isListening]
  );

  return (
    <div className={`flex items-end justify-center gap-1 h-16 ${className}`} {...props}>
      {barComponents}
    </div>
  );
};

// Circular voice visualizer
export const CircularVoiceVisualizer = ({ 
  isListening = false, 
  volume = 0, 
  size = 120,
  className = "",
  ...props 
}) => {
  const [pulseScale, setPulseScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulseScale(1 + Math.random() * 0.3);
        setRotation(prev => prev + 2);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setPulseScale(1);
      setRotation(0);
    }
  }, [isListening]);

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }} {...props}>
      {/* Outer pulse ring */}
      <motion.div
        className="absolute inset-0 border-2 border-cyan-400/30 rounded-full"
        animate={isListening ? {
          scale: [1, 1.2, 1],
          opacity: [0.5, 0.2, 0.5]
        } : { scale: 1, opacity: 0 }}
        transition={{ duration: 2, repeat: isListening ? Infinity : 0 }}
      />
      
      {/* Middle pulse ring */}
      <motion.div
        className="absolute inset-2 border-2 border-cyan-400/50 rounded-full"
        animate={isListening ? {
          scale: [1, 1.1, 1],
          opacity: [0.7, 0.3, 0.7]
        } : { scale: 1, opacity: 0 }}
        transition={{ duration: 1.5, repeat: isListening ? Infinity : 0, delay: 0.5 }}
      />
      
      {/* Inner circle */}
      <motion.div
        className="absolute inset-4 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center"
        animate={isListening ? {
          scale: pulseScale,
          rotate: rotation
        } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.1 }}
      >
        {/* Microphone icon */}
        <svg 
          className="w-8 h-8 text-white" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" 
          />
        </svg>
      </motion.div>
      
      {/* Volume indicator dots */}
      {isListening && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {[1, 2, 3].map((dot) => (
            <motion.div
              key={dot}
              className="w-2 h-2 bg-cyan-400 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: dot * 0.2
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Waveform visualizer
export const WaveformVisualizer = ({ 
  isListening = false, 
  audioData = [], 
  className = "",
  ...props 
}) => {
  const canvasRef = useRef(null);
  const animationRef = useRef();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const draw = () => {
      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      if (isListening && audioData.length > 0) {
        // Draw waveform
        ctx.strokeStyle = '#60A5FA';
        ctx.lineWidth = 2;
        ctx.beginPath();

        const barWidth = width / audioData.length;
        
        audioData.forEach((value, index) => {
          const x = index * barWidth;
          const barHeight = (value / 255) * height;
          const y = (height - barHeight) / 2;
          
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + barHeight);
        });

        ctx.stroke();
      }

      if (isListening) {
        animationRef.current = requestAnimationFrame(draw);
      }
    };

    if (isListening) {
      draw();
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isListening, audioData]);

  return (
    <canvas
      ref={canvasRef}
      width={300}
      height={60}
      className={`w-full h-15 bg-slate-800/50 rounded-lg ${className}`}
      {...props}
    />
  );
};

// Voice status indicator component
export const VoiceStatusIndicator = ({ status = 'idle' }) => {
  const statusConfig = useMemo(() => {
    switch (status) {
      case 'listening':
        return {
          text: 'Listening...',
          color: 'text-cyan-400',
          icon: '🎤'
        };
      case 'requesting':
        return {
          text: 'Requesting access...',
          color: 'text-yellow-400',
          icon: '⏳'
        };
      case 'denied':
        return {
          text: 'Access denied',
          color: 'text-red-400',
          icon: '❌'
        };
      default:
        return {
          text: 'Ready to listen',
          color: 'text-slate-400',
          icon: '🎤'
        };
    }
  }, [status]);

  return (
    <div className={`flex items-center space-x-2 text-sm ${statusConfig.color}`}>
      <span>{statusConfig.icon}</span>
      <span>{statusConfig.text}</span>
    </div>
  );
}; 
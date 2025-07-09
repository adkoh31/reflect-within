import React, { useState } from 'react';
import { motion } from 'framer-motion';

const RadialOrbitalTimeline = () => {
  const [activeFeature, setActiveFeature] = useState(null);

  const features = [
    {
      id: 1,
      title: "AI-Powered Reflection",
      description: "Deep, meaningful conversations with AI that adapts to your thinking style",
      icon: "🤖",
      position: { angle: 0, radius: 200 }
    },
    {
      id: 2,
      title: "Voice Conversations",
      description: "Speak naturally and let your thoughts flow freely",
      icon: "🎤",
      position: { angle: 60, radius: 200 }
    },
    {
      id: 3,
      title: "Personal Journal",
      description: "Keep track of your growth with automatic journaling",
      icon: "📝",
      position: { angle: 120, radius: 200 }
    },
    {
      id: 4,
      title: "Insights & Patterns",
      description: "Discover patterns in your thoughts and emotions over time",
      icon: "📊",
      position: { angle: 180, radius: 200 }
    },
    {
      id: 5,
      title: "Mood Tracking",
      description: "Visualize your emotional journey and growth",
      icon: "📈",
      position: { angle: 240, radius: 200 }
    },
    {
      id: 6,
      title: "Privacy First",
      description: "Your thoughts stay private with end-to-end encryption",
      icon: "🔒",
      position: { angle: 300, radius: 200 }
    }
  ];

  const centerX = 400;
  const centerY = 300;

  const getPosition = (angle, radius) => {
    const radian = (angle * Math.PI) / 180;
    return {
      x: centerX + radius * Math.cos(radian),
      y: centerY + radius * Math.sin(radian)
    };
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Central hub */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center z-20"
      >
        <div className="text-white text-2xl font-bold">Reflect</div>
      </motion.div>

      {/* Orbital rings */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 0.8 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/20 rounded-full"
      />
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 1 }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-white/10 rounded-full"
      />

      {/* Feature nodes */}
      {features.map((feature, index) => {
        const position = getPosition(feature.position.angle, feature.position.radius);
        
        return (
          <motion.div
            key={feature.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
            className="absolute cursor-pointer z-30"
            style={{ left: position.x - 20, top: position.y - 20 }}
            onClick={() => setActiveFeature(activeFeature === feature.id ? null : feature.id)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-10 h-10 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/20 hover:bg-white/20 transition-colors">
              <span className="text-lg">{feature.icon}</span>
            </div>
            
            {/* Feature details popup */}
            {activeFeature === feature.id && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 10 }}
                className="absolute top-12 left-1/2 transform -translate-x-1/2 w-64 bg-black/80 backdrop-blur-md rounded-lg p-4 border border-white/20 z-40"
              >
                <h3 className="text-white font-semibold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm">{feature.description}</p>
              </motion.div>
            )}
          </motion.div>
        );
      })}

      {/* Connecting lines */}
      {features.map((feature, index) => {
        const position = getPosition(feature.position.angle, feature.position.radius);
        const nextFeature = features[(index + 1) % features.length];
        const nextPosition = getPosition(nextFeature.position.angle, nextFeature.position.radius);
        
        return (
          <motion.div
            key={`line-${index}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.5 + index * 0.1 }}
            className="absolute top-0 left-0 w-full h-full z-10"
          >
            <svg className="w-full h-full absolute top-0 left-0">
              <line
                x1={position.x}
                y1={position.y}
                x2={nextPosition.x}
                y2={nextPosition.y}
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </svg>
          </motion.div>
        );
      })}
    </div>
  );
};

export default RadialOrbitalTimeline; 
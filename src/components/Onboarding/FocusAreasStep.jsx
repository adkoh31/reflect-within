import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Heart, Brain, TrendingUp } from 'lucide-react';

const FocusAreasStep = ({ onDataUpdate, user, initialData = {} }) => {
  const [selectedAreas, setSelectedAreas] = useState(initialData.focusAreas || []);

  const focusAreas = [
    {
      id: 'physical',
      title: 'Physical Health',
      description: 'Track workouts, nutrition, sleep, and body metrics',
      icon: Dumbbell,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'mental',
      title: 'Mental Wellness',
      description: 'Monitor mood, stress, energy, and emotional patterns',
      icon: Heart,
      color: 'from-purple-500 to-pink-500'
    },
    {
      id: 'growth',
      title: 'Personal Growth',
      description: 'Focus on goals, habits, learning, and self-improvement',
      icon: Brain,
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle & Habits',
      description: 'Track routines, balance, relationships, and daily patterns',
      icon: TrendingUp,
      color: 'from-orange-500 to-red-500'
    }
  ];

  const handleAreaToggle = (areaId) => {
    const newSelectedAreas = selectedAreas.includes(areaId)
      ? selectedAreas.filter(id => id !== areaId)
      : [...selectedAreas, areaId];
    
    setSelectedAreas(newSelectedAreas);
    
    // Update parent form data
    onDataUpdate({ focusAreas: newSelectedAreas });
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Focus Areas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg mx-auto mb-8">
          {focusAreas.map((area) => {
            const Icon = area.icon;
            const isSelected = selectedAreas.includes(area.id);
            
            return (
              <motion.button
                key={area.id}
                onClick={() => handleAreaToggle(area.id)}
                className={`relative p-4 rounded-xl border-2 transition-all duration-200 text-left ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-400/10'
                    : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </motion.div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${area.color} flex items-center justify-center mb-3`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-white font-semibold mb-1">{area.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{area.description}</p>
              </motion.button>
            );
          })}
        </div>

        {/* Helper Text */}
        <p className="text-white/50 text-sm mb-6">
          {selectedAreas.length === 0 
            ? "Select at least one area to continue"
            : `${selectedAreas.length} area${selectedAreas.length !== 1 ? 's' : ''} selected`
          }
        </p>
      </motion.div>
    </div>
  );
};

export default FocusAreasStep; 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LampBackground } from '../ui/lamp.jsx';
import { MyraLogo } from '../ui/MyraLogo.jsx';
import { 
  Scale, 
  Dumbbell, 
  Moon, 
  Apple, 
  Heart, 
  AlertTriangle, 
  Zap, 
  Brain, 
  Target, 
  RotateCcw, 
  BookOpen, 
  TrendingUp, 
  Calendar, 
  Users, 
  Palette, 
  Plus,
  MoreHorizontal
} from 'lucide-react';

// Metric Input Modal Component
const MetricInputModal = ({ metric, onSubmit, onSkip, currentValue }) => {
  const [inputValue, setInputValue] = useState(currentValue || '');
  const [customMetricName, setCustomMetricName] = useState('');
  const [customMetricType, setCustomMetricType] = useState('qualitative');

  const handleSubmit = () => {
    if (metric.inputType === 'custom') {
      if (!customMetricName.trim()) return;
      onSubmit({
        name: customMetricName,
        type: customMetricType,
        value: inputValue
      });
    } else {
      onSubmit(inputValue);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const renderInputField = () => {
    switch (metric.inputType) {
      case 'quantifiable':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <label className="block text-white/80 text-sm font-medium mb-2">
                {metric.placeholder}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  placeholder={`Enter ${metric.unit}`}
                  autoFocus
                />
                <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm">
                  {metric.unit}
                </span>
              </div>
            </div>
          </div>
        );

      case 'qualitative':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <label className="block text-white/80 text-sm font-medium mb-2">
                {metric.placeholder}
              </label>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                placeholder="Describe your current state..."
                rows={3}
                autoFocus
              />
            </div>
          </div>
        );

      case 'custom':
        return (
          <div className="space-y-4">
            <div className="text-center">
              <label className="block text-white/80 text-sm font-medium mb-2">
                What would you like to track?
              </label>
              <input
                type="text"
                value={customMetricName}
                onChange={(e) => setCustomMetricName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 mb-4"
                placeholder="e.g., Water intake, Steps, Reading time"
                autoFocus
              />
              
              <label className="block text-white/80 text-sm font-medium mb-2">
                How would you like to track it?
              </label>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => setCustomMetricType('quantifiable')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    customMetricType === 'quantifiable'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-white/70 hover:bg-slate-600'
                  }`}
                >
                  Numbers
                </button>
                <button
                  onClick={() => setCustomMetricType('qualitative')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    customMetricType === 'qualitative'
                      ? 'bg-cyan-500 text-white'
                      : 'bg-slate-700 text-white/70 hover:bg-slate-600'
                  }`}
                >
                  Description
                </button>
              </div>
              
              {customMetricType === 'quantifiable' && (
                <div className="mt-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Initial value
                  </label>
                  <input
                    type="number"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                    placeholder="Enter initial value"
                  />
                </div>
              )}
              
              {customMetricType === 'qualitative' && (
                <div className="mt-4">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Initial description
                  </label>
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/60 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none"
                    placeholder="Describe your current state..."
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 sm:p-8 max-w-md w-full"
      >
        <div className="text-center space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex justify-center mb-2">
              {metric.icon}
            </div>
            <h3 className="text-white text-lg sm:text-xl font-semibold">
              {metric.label}
            </h3>
            <p className="text-white/70 text-sm">
              {metric.description}
            </p>
          </div>

          {/* Input Field */}
          {renderInputField()}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSkip}
              className="flex-1 px-4 py-3 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium"
            >
              Skip for now
            </button>
            <button
              onClick={handleSubmit}
              disabled={metric.inputType === 'custom' ? !customMetricName.trim() : !inputValue.trim()}
              className="flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-700 disabled:text-white/40 transition-colors text-sm font-medium"
            >
              Continue
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const OnboardingFlow = ({ onComplete, onSkip, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);
  const [showInputModal, setShowInputModal] = useState(false);
  const [currentMetric, setCurrentMetric] = useState(null);
  const [formData, setFormData] = useState({
    focusAreas: [],
    selectedMetrics: {},
    metricValues: {} // Store initial values for selected metrics
  });

  const steps = [
    {
      id: 0,
      title: "Welcome to Myra",
      subtitle: "Your AI-powered fitness reflection companion",
      description: "Track your fitness journey, understand your body, and grow stronger through thoughtful reflection on your workouts and recovery.",
      component: 'welcome'
    },
    {
      id: 1,
      title: "What would you like to focus on?",
      subtitle: "Choose the areas that matter most to you",
      description: "Select the areas you'd like to track and reflect on. You can change these anytime.",
      component: 'focus-areas'
    },
    {
      id: 2,
      title: "What would you like to track?",
      subtitle: "Select your key metrics",
      description: "Choose the specific metrics that matter most to your fitness journey and recovery.",
      component: 'metrics'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSkip = useCallback(() => {
    if (isSkipping) return;
    
    setIsSkipping(true);
    onSkip();
    
    setTimeout(() => setIsSkipping(false), 1000);
  }, [isSkipping, onSkip]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    const onboardingData = {
      email: user?.email,
      name: user?.name,
      focusAreas: formData.focusAreas,
      selectedMetrics: formData.selectedMetrics,
      metricValues: formData.metricValues
    };
    onComplete(onboardingData);
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step always valid
      case 1: return formData.focusAreas.length > 0;
      case 2: return Object.values(formData.selectedMetrics).flat().length > 0;
      default: return false;
    }
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6 sm:space-y-8">
      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.2 
        }}
        className="flex justify-center mb-6 sm:mb-8"
      >
        <MyraLogo size="xl" animated={true} />
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.4 
        }}
        className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg px-4"
      >
        Welcome
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.6 
        }}
        className="text-white/80 text-base sm:text-lg md:text-xl mb-8 sm:mb-12 max-w-2xl mx-auto leading-relaxed px-4"
      >
        Your AI-powered fitness reflection companion
      </motion.p>

      {/* Preview Cards - Authentic to Your App */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.8, 
          ease: [0.25, 0.46, 0.45, 0.94],
          delay: 0.8 
        }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4"
      >
        {/* Journal Preview - Matches JournalEntry Component */}
        <motion.div 
          className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.0,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base sm:text-lg font-semibold text-slate-50">Today's Entry</h3>
              <div className="flex gap-2">
                <motion.div 
                  className="w-6 h-6 bg-slate-800/80 rounded-lg flex items-center justify-center"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ duration: 0.2 }}
                >
                  <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </motion.div>
              </div>
            </div>
            <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/30">
              <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                "Squats: 3x8 @ 185lbs. Quads sore, 7/10 intensity. Feeling strong but need more recovery time. Energy was good throughout the workout."
              </p>
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-slate-400">Topics:</span>
                <div className="flex gap-1">
                  <motion.span 
                    className="px-2 py-1 bg-cyan-500/20 text-cyan-300 text-xs rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Strength
                  </motion.span>
                  <motion.span 
                    className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-full"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    Recovery
                  </motion.span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Chat Preview - Matches ChatWindow Component */}
        <motion.div 
          className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
          whileHover={{ 
            scale: 1.02,
            transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
          }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ 
            duration: 0.6, 
            delay: 1.2,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <h3 className="text-base sm:text-lg font-semibold text-slate-50 mb-3">AI Chat</h3>
            <div className="space-y-3">
              {/* User Message */}
              <motion.div 
                className="flex justify-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.4 }}
              >
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg">
                  <p className="text-sm leading-relaxed">How did my workout affect my recovery?</p>
                  <p className="text-xs mt-1 text-cyan-100">2:30 PM</p>
                </div>
              </motion.div>
              {/* AI Message */}
              <motion.div 
                className="flex justify-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 1.6 }}
              >
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-slate-800 text-slate-100 border border-slate-700 shadow-lg">
                  <p className="text-sm leading-relaxed">I notice your quad soreness is higher than usual. Let's track this pattern and adjust your recovery strategy.</p>
                  <p className="text-xs mt-1 text-slate-400">2:31 PM</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );

  const renderFocusAreasStep = () => {
    const focusAreas = [
      {
        id: 'physical',
        title: 'Physical Health',
        description: 'Track workouts, nutrition, sleep, and body metrics',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        ),
        color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30',
        gradient: 'from-blue-500/10 via-cyan-500/5 to-blue-500/10'
      },
      {
        id: 'mental',
        title: 'Mental Wellness',
        description: 'Monitor mood, stress, energy, and emotional patterns',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        ),
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30',
        gradient: 'from-purple-500/10 via-pink-500/5 to-purple-500/10'
      },
      {
        id: 'growth',
        title: 'Personal Growth',
        description: 'Focus on goals, habits, learning, and self-improvement',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
        gradient: 'from-green-500/10 via-emerald-500/5 to-green-500/10'
      },
      {
        id: 'lifestyle',
        title: 'Lifestyle & Habits',
        description: 'Track routines, balance, relationships, and daily patterns',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        ),
        color: 'from-orange-500/20 to-red-500/20 border-orange-500/30',
        gradient: 'from-orange-500/10 via-red-500/5 to-orange-500/10'
      }
    ];

    const handleAreaToggle = (areaId) => {
      const newSelectedAreas = formData.focusAreas.includes(areaId)
        ? formData.focusAreas.filter(id => id !== areaId)
        : [...formData.focusAreas, areaId];
      
      handleInputChange('focusAreas', newSelectedAreas);
    };

    return (
      <div className="space-y-6 sm:space-y-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2 
          }}
        >
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">What would you like to focus on?</h2>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4">
            Select the areas that matter most to you. This helps AI personalize your experience.
          </p>
          <p className="text-white/50 text-xs sm:text-sm">
            You can change these anytime in your settings
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6 max-w-4xl mx-auto px-4">
          {focusAreas.map((area, index) => (
            <motion.button
              key={area.id}
              onClick={() => handleAreaToggle(area.id)}
              className={`p-4 sm:p-6 md:p-8 rounded-2xl border transition-all duration-300 min-h-[120px] sm:min-h-[140px] md:min-h-[160px] relative overflow-hidden group ${
                formData.focusAreas.includes(area.id)
                  ? `bg-gradient-to-br ${area.color} border-cyan-500/50 shadow-lg shadow-cyan-500/20`
                  : 'bg-black/40 backdrop-blur-md border-white/20 hover:bg-black/60 hover:border-white/30'
              }`}
              whileHover={{ 
                scale: 1.03,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ 
                duration: 0.6, 
                delay: 0.4 + (index * 0.1),
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              {/* Animated gradient background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${area.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Subtle glow effect when selected */}
              {formData.focusAreas.includes(area.id) && (
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-2xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}
              
              <div className="relative z-10 text-center space-y-3 sm:space-y-4 h-full flex flex-col justify-center">
                <motion.div 
                  className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                    formData.focusAreas.includes(area.id)
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-white/70'
                  }`}
                  whileHover={{ 
                    scale: 1.1, 
                    rotate: 5,
                    transition: { duration: 0.2 }
                  }}
                >
                  {area.icon}
                </motion.div>
                <h3 className="text-white font-semibold text-base sm:text-lg md:text-xl">{area.title}</h3>
                <p className="text-white/70 text-xs sm:text-sm md:text-base leading-relaxed">{area.description}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    );
  };

  const renderMetricsStep = () => {
    const metricsByCategory = {
      physical: [
        { 
          id: 'weight', 
          label: 'Weight', 
          icon: (
            <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 48 48" fill="currentColor">
              <path fillRule="evenodd" d="M10.085 6.973a1 1 0 0 0-1.081-.912l-1.993.17a1 1 0 0 0-.912 1.08l.329 3.869a1 1 0 0 0 .146 1.725l.35 4.122a1 1 0 0 0 1.082.912l1.993-.17a1 1 0 0 0 .911-1.08l-.369-4.346q.764-.137 1.503-.26c.106 1.65.41 4.449.973 7.085c.359 1.68.851 3.434 1.535 4.814c.34.688.782 1.392 1.367 1.948c.518.492 1.217.927 2.081 1.041v4.332l-.325-.117l-.223-.08c-1.005-.36-2.027-.726-2.806-.923c-.379-.096-.952-.221-1.514-.171a2.4 2.4 0 0 0-1.314.516A2.22 2.22 0 0 0 11 32.263c0 .823.281 2.94.52 4.631a276 276 0 0 0 .46 3.129l.032.209l.009.055l.002.014v.005L14 40l-1.976.307a2 2 0 0 0 3.971-.165l.37-5.176c1.11.398 2.408.857 3.688 1.217c1.273.358 2.67.66 3.947.66s2.674-.302 3.948-.66c1.27-.357 2.555-.812 3.66-1.207l.398 5.177a2 2 0 0 0 3.97.154L34 40l1.977.306V40.3l.003-.014l.008-.055l.032-.21a283 283 0 0 0 .46-3.128c.24-1.691.52-3.808.52-4.63c0-.59-.23-1.258-.817-1.736a2.4 2.4 0 0 0-1.315-.516c-.562-.05-1.135.075-1.513.17c-.78.198-1.801.564-2.806.924l-.223.08l-.326.117v-4.327c1.89-.211 3.035-1.743 3.667-2.962c.731-1.412 1.209-3.197 1.533-4.886c.508-2.639.709-5.41.774-7.032q.73.12 1.485.254l-.369 4.339a1 1 0 0 0 .912 1.08l1.993.17a1 1 0 0 0 1.08-.912l.351-4.122a.998.998 0 0 0 .146-1.725l.33-3.869a1 1 0 0 0-.913-1.08l-1.992-.17a1 1 0 0 0-1.081.912l-.287 3.376a121 121 0 0 0-1.877-.315a2 2 0 0 0-3.161-.453c-6.077-.767-11.222-.766-17.192-.01a2 2 0 0 0-3.144.453q-.925.147-1.884.318zm6.843 11.36a48.5 48.5 0 0 1-.912-6.825c5.531-.673 10.346-.673 15.975.014c-.037 1.332-.208 4.194-.719 6.85c-.3 1.561-.69 2.901-1.157 3.802c-.318.613-.535.785-.608.826H18.644c-.116-.121-.296-.366-.508-.794c-.462-.933-.872-2.304-1.208-3.874M28.5 16.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0" clipRule="evenodd"/>
            </svg>
          ),
          inputType: 'quantifiable',
          unit: 'lbs',
          placeholder: 'Enter your current weight',
          description: 'Track your body weight changes over time',
          category: 'physical'
        },
        { 
          id: 'workouts', 
          label: 'Workouts', 
          icon: <Dumbbell className="w-6 h-6 text-cyan-300" />,
          inputType: 'quantifiable',
          unit: 'per week',
          placeholder: 'How many workouts per week?',
          description: 'Track your workout frequency and consistency',
          category: 'physical'
        },
        { 
          id: 'sleep', 
          label: 'Sleep', 
          icon: (
            <svg className="w-6 h-6 text-cyan-300" viewBox="0 0 64 64" fill="currentColor">
              <path d="M7.684 41.188c.146-4.908-2.524-6.756-5.78-7.977c-1.082 4.199 1.904 7.693 5.78 7.977m.737-21.915c2.076-4.445.356-7.211-2.16-9.618c-2.641 3.432-1.283 7.82 2.16 9.618m1.171 12.374c-.143-4.905 2.524-6.761 5.782-7.977c1.078 4.197-1.906 7.69-5.782 7.977m0 7.565c-.143-4.905 2.524-6.756 5.782-7.975c1.078 4.196-1.906 7.69-5.782 7.975m0-15.127c-.143-4.907 2.524-6.763 5.782-7.982c1.078 4.201-1.906 7.693-5.782 7.982m-1.908 9.539c.146-4.905-2.524-6.761-5.78-7.977c-1.082 4.197 1.904 7.691 5.78 7.977m0-7.562c.146-4.908-2.524-6.763-5.78-7.984c-1.082 4.203 1.904 7.692 5.78 7.984m36.769 37.007H18.142l13.157-22.796zM23.369 60.05h15.858l-7.929-13.735zM3.843 47.54l55.741-15.164l-.828-3.063L3.011 44.479zM43.176.634s.408 8.041 7.456 7.359c0 0 .795-6.718-7.456-7.359m7.379 26.153a4.08 4.08 0 0 1-3.339 1.716c-1.123 0-2.223-.528-2.965-1.268c-1.518-1.656-3.486-5.358-3.486-5.358c-1.103-2.239-1.694-3.971-1.694-5.722c0-3.73 3.019-6.965 6.759-6.965a6.74 6.74 0 0 1 4.726 1.93a6.73 6.73 0 0 1 4.724-1.93c3.739 0 6.758 3.235 6.758 6.965c0 1.751-.592 3.483-1.694 5.722c0 0-1.968 3.701-3.486 5.358c-.742.74-1.842 1.268-2.966 1.268a4.08 4.08 0 0 1-3.338-1.716z"/>
            </svg>
          ),
          inputType: 'quantifiable',
          unit: 'hours',
          placeholder: 'Hours of sleep per night',
          description: 'Monitor your sleep quality and duration',
          category: 'physical'
        },
        { 
          id: 'nutrition', 
          label: 'Nutrition', 
          icon: <Apple className="w-6 h-6 text-cyan-300" />,
          inputType: 'qualitative',
          placeholder: 'Describe your dietary preferences',
          description: 'Track your eating habits and nutrition goals',
          category: 'physical'
        },
        { 
          id: 'other_physical', 
          label: 'Other', 
          icon: <MoreHorizontal className="w-6 h-6 text-cyan-300" />,
          inputType: 'custom',
          placeholder: 'Add your own metric',
          description: 'Track something specific to your fitness journey',
          category: 'physical'
        }
      ],
      mental: [
        { 
          id: 'mood', 
          label: 'Mood', 
          icon: (
            <svg className="w-6 h-6 text-purple-300" viewBox="0 0 48 48" fill="currentColor">
              <g fillRule="evenodd" clipRule="evenodd">
                <path d="M24 40c8.837 0 16-7.163 16-16S32.837 8 24 8S8 15.163 8 24s7.163 16 16 16m0 2c9.941 0 18-8.059 18-18S33.941 6 24 6S6 14.059 6 24s8.059 18 18 18"/>
                <path d="M16.695 28c1.555 3.832 4.42 6 7.305 6c2.886 0 5.75-2.168 7.305-6zM24 36c-4.038 0-7.538-3.048-9.258-7.5l-.05-.129C14.246 27.18 15.2 26 16.473 26h15.055c1.273 0 2.228 1.18 1.78 2.371l-.049.129C31.538 32.952 28.038 36 24 36"/>
                <path d="M21.302 22.442c.13-.358.091-.795-.016-1.193a4.2 4.2 0 0 0-.61-1.28c-.581-.829-1.544-1.59-2.845-1.646c-1.347-.056-2.353.799-2.973 1.706a5.6 5.6 0 0 0-.695 1.416c-.143.446-.219.902-.169 1.267a.5.5 0 0 0 .766.352c.4-.256.819-.607 1.207-.931c.176-.148.347-.29.505-.415c.562-.444 1-.697 1.362-.715c.345-.017.743.18 1.245.556c.18.134.354.276.534.424l.195.159c.244.197.504.399.766.557a.5.5 0 0 0 .728-.257m5.311 0c-.13-.358-.09-.795.017-1.193c.112-.416.319-.863.61-1.28c.58-.829 1.544-1.59 2.845-1.646c1.346-.056 2.353.799 2.973 1.706c.314.46.548.958.695 1.416c.142.446.218.902.168 1.267a.5.5 0 0 1-.765.352c-.4-.256-.82-.607-1.207-.931a25 25 0 0 0-.505-.415c-.563-.444-1-.697-1.363-.715c-.344-.017-.743.18-1.244.556c-.18.134-.354.276-.534.424l-.196.159a7 7 0 0 1-.765.557a.5.5 0 0 1-.729-.257"/>
              </g>
            </svg>
          ),
          inputType: 'qualitative',
          placeholder: 'How are you feeling today?',
          description: 'Track your emotional well-being over time',
          category: 'mental'
        },
        { 
          id: 'stress', 
          label: 'Stress', 
          icon: <AlertTriangle className="w-6 h-6 text-purple-300" />,
          inputType: 'qualitative',
          placeholder: 'Describe your stress level',
          description: 'Monitor stress patterns and triggers',
          category: 'mental'
        },
        { 
          id: 'energy', 
          label: 'Energy', 
          icon: <Zap className="w-6 h-6 text-purple-300" />,
          inputType: 'qualitative',
          placeholder: 'How is your energy level?',
          description: 'Track your daily energy fluctuations',
          category: 'mental'
        },
        { 
          id: 'meditation', 
          label: 'Meditation', 
          icon: <RotateCcw className="w-6 h-6 text-purple-300" />,
          inputType: 'quantifiable',
          unit: 'minutes',
          placeholder: 'Minutes of meditation per day',
          description: 'Track your mindfulness practice',
          category: 'mental'
        },
        { 
          id: 'other_mental', 
          label: 'Other', 
          icon: <MoreHorizontal className="w-6 h-6 text-purple-300" />,
          inputType: 'custom',
          placeholder: 'Add your own metric',
          description: 'Track something specific to your mental wellness',
          category: 'mental'
        }
      ],
      growth: [
        { 
          id: 'goals', 
          label: 'Goals', 
          icon: (
            <svg className="w-6 h-6 text-green-300" viewBox="0 0 48 48" fill="currentColor">
              <g fillRule="evenodd" clipRule="evenodd">
                <path d="M24 42c9.941 0 18-8.059 18-18S33.941 6 24 6S6 14.059 6 24s8.059 18 18 18m0 2c11.046 0 20-8.954 20-20S35.046 4 24 4S4 12.954 4 24s8.954 20 20 20"/>
                <path d="M34.67 16.259a1 1 0 0 1 .072 1.412L21.386 32.432l-8.076-7.709a1 1 0 0 1 1.38-1.446l6.59 6.29L33.259 16.33a1 1 0 0 1 1.413-.07"/>
              </g>
            </svg>
          ),
          inputType: 'qualitative',
          placeholder: 'What are your main goals?',
          description: 'Track progress toward your personal goals',
          category: 'growth'
        },
        { 
          id: 'habits', 
          label: 'Habits', 
          icon: <BookOpen className="w-6 h-6 text-green-300" />,
          inputType: 'qualitative',
          placeholder: 'What habits are you building?',
          description: 'Monitor habit formation and consistency',
          category: 'growth'
        },
        { 
          id: 'learning', 
          label: 'Learning', 
          icon: (
            <svg className="w-6 h-6 text-green-300" viewBox="0 0 48 48" fill="currentColor">
              <path fillRule="evenodd" d="M24 6a4 4 0 1 0 0 8a4 4 0 0 0 0-8m-6 4a6 6 0 1 1 12 0a6 6 0 0 1-12 0m-2.692 9.462A4 4 0 0 1 19 17h10a4 4 0 0 1 3.692 2.462l2.5 6c1.033 2.477-.618 5.193-3.192 5.508v.922a1 1 0 0 0 .47.848l5.548 3.467A4.217 4.217 0 0 1 35.783 44h-23.57a4.213 4.213 0 0 1-2.223-7.792l5.588-3.47a1 1 0 0 0 .472-.85v-.913c-2.603-.285-4.281-3.02-3.242-5.514zM18.05 31v.888a3 3 0 0 1-1.417 2.548l-5.587 3.47A2.213 2.213 0 0 0 12.213 42H30a1 1 0 0 0 1-1v-.13a1 1 0 0 0-.933-.997l-13.084-.875a1 1 0 0 1 .134-1.996l13.083.875a3 3 0 0 1 2.8 2.994V41c0 .35-.06.687-.17 1h2.953a2.217 2.217 0 0 0 1.175-4.097l-5.548-3.468A3 3 0 0 1 30 31.891V31h-2.757a4 4 0 0 1-2.829-1.172L24 29.414l-.414.414A4 4 0 0 1 20.757 31zM25 27.586l.828.828a2 2 0 0 0 1.415.586H31.5a2 2 0 0 0 1.846-2.77l-2.5-6A2 2 0 0 0 29 19H19a2 2 0 0 0-1.846 1.23l-2.5 6A2 2 0 0 0 16.5 29h4.257a2 2 0 0 0 1.415-.586l.828-.828v-2.32c-.226.13-.43.308-.6.534l-.6.8a1 1 0 0 1-.8.4h-3a1 1 0 0 1-.894-1.447l1-2a1 1 0 1 1 1.788.894l-.276.553h.882l.3-.4c1.6-2.133 4.8-2.133 6.4 0l.3.4h.882l-.276-.553a1 1 0 1 1 1.788-.894l1 2A1 1 0 0 1 30 27h-3a1 1 0 0 1-.8-.4l-.6-.8a2 2 0 0 0-.6-.534z" clipRule="evenodd"/>
            </svg>
          ),
          inputType: 'qualitative',
          placeholder: 'What are you learning?',
          description: 'Track your learning and skill development',
          category: 'growth'
        },
        { 
          id: 'productivity', 
          label: 'Productivity', 
          icon: <Calendar className="w-6 h-6 text-green-300" />,
          inputType: 'quantifiable',
          unit: 'hours',
          placeholder: 'Hours of focused work per day',
          description: 'Monitor your productivity and focus',
          category: 'growth'
        },
        { 
          id: 'other_growth', 
          label: 'Other', 
          icon: <MoreHorizontal className="w-6 h-6 text-green-300" />,
          inputType: 'custom',
          placeholder: 'Add your own metric',
          description: 'Track something specific to your personal growth',
          category: 'growth'
        }
      ],
      lifestyle: [
        { 
          id: 'routine', 
          label: 'Routine', 
          icon: <Calendar className="w-6 h-6 text-orange-300" />,
          inputType: 'qualitative',
          placeholder: 'Describe your daily routine',
          description: 'Track your daily patterns and routines',
          category: 'lifestyle'
        },
        { 
          id: 'social', 
          label: 'Social', 
          icon: <Users className="w-6 h-6 text-orange-300" />,
          inputType: 'qualitative',
          placeholder: 'How are your social connections?',
          description: 'Monitor your social well-being',
          category: 'lifestyle'
        },
        { 
          id: 'creative', 
          label: 'Creative', 
          icon: <Palette className="w-6 h-6 text-orange-300" />,
          inputType: 'qualitative',
          placeholder: 'What creative activities do you enjoy?',
          description: 'Track your creative pursuits and hobbies',
          category: 'lifestyle'
        },
        { 
                  id: 'balance',
        label: 'Balance',
        icon: <Scale className="w-6 h-6 text-orange-300" />,
        inputType: 'qualitative',
        placeholder: 'How is your work-life balance?',
        description: 'Monitor your overall life balance',
          category: 'lifestyle'
        },
        { 
          id: 'other_lifestyle', 
          label: 'Other', 
          icon: <MoreHorizontal className="w-6 h-6 text-orange-300" />,
          inputType: 'custom',
          placeholder: 'Add your own metric',
          description: 'Track something specific to your lifestyle',
          category: 'lifestyle'
        }
      ]
    };

    // Only show metrics for selected focus areas
    const availableMetrics = {};
    formData.focusAreas.forEach(area => {
      if (metricsByCategory[area]) {
        availableMetrics[area] = metricsByCategory[area];
      }
    });

    const handleMetricToggle = (metric) => {
      if (metric.inputType === 'custom') {
        // For "Other" option, show input modal immediately
        setCurrentMetric(metric);
        setShowInputModal(true);
        return;
      }

      const category = metric.category;
      const currentMetrics = formData.selectedMetrics[category] || [];
      const isSelected = currentMetrics.includes(metric.id);
      
      if (isSelected) {
        // Remove metric
        const newMetrics = currentMetrics.filter(id => id !== metric.id);
        handleInputChange('selectedMetrics', {
          ...formData.selectedMetrics,
          [category]: newMetrics
        });
        // Also remove the value
        const newValues = { ...formData.metricValues };
        delete newValues[metric.id];
        handleInputChange('metricValues', newValues);
      } else {
        // Add metric and show input modal
        const newMetrics = [...currentMetrics, metric.id];
        handleInputChange('selectedMetrics', {
          ...formData.selectedMetrics,
          [category]: newMetrics
        });
        setCurrentMetric(metric);
        setShowInputModal(true);
      }
    };

    const handleInputModalSubmit = (value) => {
      if (currentMetric) {
        const newValues = { ...formData.metricValues };
        newValues[currentMetric.id] = value;
        handleInputChange('metricValues', newValues);
      }
      setShowInputModal(false);
      setCurrentMetric(null);
    };

    const handleInputModalSkip = () => {
      setShowInputModal(false);
      setCurrentMetric(null);
    };

    return (
      <div className="space-y-6 sm:space-y-8">
        <motion.div 
          className="text-center mb-8 sm:mb-12 px-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.8, 
            ease: [0.25, 0.46, 0.45, 0.94],
            delay: 0.2 
          }}
        >
          <h2 className="text-white text-xl sm:text-2xl md:text-3xl font-bold mb-2 sm:mb-4">What would you like to track?</h2>
          <p className="text-white/70 text-sm sm:text-base md:text-lg max-w-2xl mx-auto mb-4">
            Choose the specific metrics that matter most to your fitness journey and recovery.
          </p>
          <p className="text-white/50 text-xs sm:text-sm">
            AI will use this data to provide personalized insights and recommendations
          </p>
        </motion.div>

        {Object.entries(availableMetrics).map(([category, metrics], categoryIndex) => (
          <motion.div 
            key={category} 
            className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.6, 
              delay: 0.4 + (categoryIndex * 0.2),
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            <h3 className="text-white font-semibold text-lg sm:text-xl capitalize text-center">{category} Metrics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
              {metrics.map((metric, metricIndex) => {
                const isSelected = (formData.selectedMetrics[metric.category] || []).includes(metric.id);
                const hasValue = formData.metricValues[metric.id];
                
                return (
                  <motion.button
                    key={metric.id}
                    onClick={() => handleMetricToggle(metric)}
                    className={`p-3 sm:p-4 md:p-6 rounded-xl border transition-all duration-300 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] relative overflow-hidden group ${
                      isSelected
                        ? 'bg-cyan-500 border-cyan-400 shadow-lg shadow-cyan-500/25'
                        : 'bg-black/40 backdrop-blur-md border-white/20 hover:bg-black/60 hover:border-white/30'
                    }`}
                    whileHover={{ 
                      scale: 1.08,
                      transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
                    }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.5, 
                      delay: 0.6 + (categoryIndex * 0.2) + (metricIndex * 0.1),
                      ease: [0.25, 0.46, 0.45, 0.94]
                    }}
                  >
                    {/* Subtle gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Glow effect when selected */}
                    {isSelected && (
                      <motion.div 
                        className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5 }}
                      />
                    )}
                    
                    <div className="relative z-10 text-center space-y-2 sm:space-y-3 h-full flex flex-col justify-center">
                      <motion.div 
                        className="flex justify-center"
                        whileHover={{ 
                          scale: 1.2, 
                          rotate: 10,
                          transition: { duration: 0.2 }
                        }}
                      >
                        {metric.icon}
                      </motion.div>
                      <p className={`text-xs sm:text-sm md:text-base font-medium ${
                        isSelected ? 'text-white' : 'text-white/70'
                      }`}>
                        {metric.label}
                      </p>
                      {hasValue && (
                        <p className="text-xs text-cyan-300 font-medium">
                          ✓ Set
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Input Modal */}
        {showInputModal && currentMetric && (
          <MetricInputModal
            metric={currentMetric}
            onSubmit={handleInputModalSubmit}
            onSkip={handleInputModalSkip}
            currentValue={formData.metricValues[currentMetric.id]}
          />
        )}
      </div>
    );
  };

  const renderStepContent = () => {
    switch (currentStepData.component) {
      case 'welcome':
        return renderWelcomeStep();
      case 'focus-areas':
        return renderFocusAreasStep();
      case 'metrics':
        return renderMetricsStep();
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen">
        <LampBackground />
        
        {/* Skip Button */}
        <div className="absolute top-4 sm:top-6 right-4 sm:right-6 z-50">
          <button
            onClick={handleSkip}
            disabled={isSkipping}
            className="text-white/70 hover:text-white transition-colors p-2 sm:p-3 disabled:opacity-50 text-sm sm:text-base"
            aria-label="Skip onboarding"
          >
            Skip
          </button>
        </div>

        {/* Main Content - Scrollable with Fixed Navigation */}
        <div className="absolute inset-0 flex flex-col">
          {/* Scrollable Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="min-h-full flex items-center justify-center">
              <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.5 }}
                  className="text-center"
                >
                  {renderStepContent()}
                </motion.div>
              </div>
            </div>
          </div>

          {/* Fixed Navigation */}
          <div className="flex-shrink-0 p-4 sm:p-6">
            <div className="flex justify-between items-center max-w-sm sm:max-w-md mx-auto">
              <button
                onClick={handleBack}
                disabled={currentStep === 0}
                className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-medium transition-colors text-sm sm:text-base ${
                  currentStep === 0
                    ? 'text-white/40 cursor-not-allowed'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                Back
              </button>

              <div className="flex items-center space-x-4 sm:space-x-6">
                {/* Progress Indicator */}
                <div className="flex space-x-2 sm:space-x-3">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`w-2 sm:w-3 h-2 sm:h-3 rounded-full transition-colors ${
                        index <= currentStep ? 'bg-cyan-500' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  onClick={handleNext}
                  disabled={!isStepValid()}
                  className={`px-4 sm:px-6 md:px-8 py-3 sm:py-4 rounded-xl font-medium transition-colors text-sm sm:text-base ${
                    isStepValid()
                      ? 'bg-white text-black hover:bg-slate-200'
                      : 'bg-white/20 text-white/40 cursor-not-allowed'
                  }`}
                  whileHover={isStepValid() ? { scale: 1.02 } : {}}
                  whileTap={isStepValid() ? { scale: 0.98 } : {}}
                >
                  {currentStep === steps.length - 1 ? 'Start Reflecting' : 'Continue'}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 
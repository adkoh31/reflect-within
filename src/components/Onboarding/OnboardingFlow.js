import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LampBackground } from '../ui/lamp';
import { TextPressure } from '../ui/interactive-text-pressure';
import GoalSettingStep from './GoalSettingStep';

const OnboardingFlow = ({ onComplete, onSkip, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSkipping, setIsSkipping] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null);
  const [formData, setFormData] = useState({
    preferredMode: 'chat'
  });

  // Touch gesture handling
  const touchStart = useRef(null);
  const touchEnd = useRef(null);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    touchEnd.current = null;
    touchStart.current = e.targetTouches[0].clientX;
    setSwipeDirection(null);
  };

  const onTouchMove = (e) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    
    const distance = touchStart.current - touchEnd.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentStep < steps.length - 1) {
      setSwipeDirection('left');
      setTimeout(() => {
        handleNext();
        setSwipeDirection(null);
      }, 150);
    } else if (isRightSwipe && currentStep > 0) {
      setSwipeDirection('right');
      setTimeout(() => {
        handleBack();
        setSwipeDirection(null);
      }, 150);
    }
  };

  const steps = [
    {
      id: 0,
      title: `Welcome to ReflectWithin, ${user?.name?.split(' ')[0] || 'there'}!`,
      subtitle: "Your AI-powered workout reflection companion",
      description: "Track your fitness journey, understand your body, and grow stronger through thoughtful reflection on your workouts and recovery.",
      icon: "",
      fields: []
    },
    {
      id: 1,
      title: "Track Your Workouts & Recovery",
      subtitle: "Detailed fitness logging",
      description:  "Our AI helps you reflect on your fitness journey and body responses.",
      icon: "",
      fields: [],
      example: {
        user: "Squats: 3x8 @ 185lbs. Quads sore, 7/10 intensity. Feeling strong but need more recovery time.",
        ai: "I notice your quad soreness is higher than usual after squats. Let's track this pattern and adjust your recovery strategy."
      }
    },
    {
      id: 2,
      title: "Two Ways to Reflect",
      subtitle: "Choose your preferred approach",
      description: "Chat with AI for guided conversations about your fitness journey, or use Journal mode for structured workout logging with AI insights.",
      icon: "",
      fields: []
    },
    {
      id: 3,
      type: 'goal-setting',
      title: "Set Your Goals",
      subtitle: "Personalize your experience",
      description: "Choose what matters most to you and set up your tracking preferences.",
      icon: "",
      fields: []
    },
    {
      id: 4,
      title: "You're Ready to Reflect!",
      subtitle: "Start your fitness journey",
      description: "Your workout reflection space is ready. Remember, every workout is progress - let's understand your body better together.",
      icon: "",
      fields: []
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSkip = useCallback(() => {
    if (isSkipping) return; // Prevent double-clicks
    
    setIsSkipping(true);
    onSkip();
    
    // Reset after a short delay in case the skip doesn't work
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
    // Include user data from authentication and goals
    const onboardingData = {
      email: user?.email,
      name: user?.name,
      preferredMode: formData.preferredMode,
      goals: formData.goals || null
    };
    onComplete(onboardingData);
  };

  const handleGoalSettingComplete = (goalData) => {
    // Store goal data and move to next step
    setFormData(prev => ({ ...prev, goals: goalData }));
    setCurrentStep(currentStep + 1);
  };

  const handleGoalSettingBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const isStepValid = () => {
    // For all steps, always valid since we removed the radio button requirement
    return true;
  };

  // If current step is goal-setting, render the GoalSettingStep component
  if (currentStepData.type === 'goal-setting') {
    return (
      <GoalSettingStep
        onComplete={handleGoalSettingComplete}
        onBack={handleGoalSettingBack}
        user={user}
      />
    );
  }

  const renderField = (field) => {
    const commonClasses = "w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-colors duration-200 backdrop-blur-sm";
    
    switch (field.type) {
      case "textarea":
        return (
          <textarea
            value={formData[field.key] || ''}
            onChange={(e) => handleInputChange(field.key, e.target.value)}
            placeholder={field.placeholder}
            className={`${commonClasses} resize-none h-24`}
            required={field.required}
          />
        );
      case "radio":
        return (
          <div className="space-y-3">
            {field.options.map((option) => (
              <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={formData[field.key] === option.value}
                  onChange={(e) => handleInputChange(field.key, e.target.value)}
                  className="mt-1 text-cyan-400 focus:ring-cyan-400"
                />
                <div className="flex-1">
                  <div className="font-medium text-white">{option.label}</div>
                  <div className="text-sm text-white/70">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  const renderExample = () => {
    if (!currentStepData.example) return null;
    
    return (
      <div className="mt-6 max-w-sm mx-auto">
        <div className="bg-black/40 backdrop-blur-md rounded-xl p-4 space-y-3 border border-white/20">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">You</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-4 py-3 max-w-xs border border-white/20">
              <p className="text-white text-sm">{currentStepData.example.user}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 justify-end">
            <div className="bg-gradient-to-r from-cyan-400 to-blue-600 rounded-2xl px-4 py-3 max-w-xs">
              <p className="text-white text-sm">{currentStepData.example.ai}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen">
        <LampBackground />
        
      {/* Progress Bar */}
        <div className="absolute top-0 left-0 right-0 z-10">
          <div className="w-full bg-white/10 h-1">
        <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-600"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
          </div>
      </div>

      {/* Skip Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleSkip}
          disabled={isSkipping}
            className={`text-white/70 hover:text-white text-sm font-medium transition-colors duration-200 ${
            isSkipping ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isSkipping ? 'Skipping...' : 'Skip'}
        </button>
      </div>

        {/* Main Content - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-full max-w-2xl mx-auto px-6">
        {/* Swipe Background Indicator */}
        {swipeDirection && (
          <motion.div
            className={`absolute inset-0 pointer-events-none ${
                  swipeDirection === 'left' ? 'bg-gradient-to-r from-transparent to-white/5' : 
                  swipeDirection === 'right' ? 'bg-gradient-to-l from-transparent to-white/5' : ''
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          />
        )}
        
            <div className="relative z-10"
                 onTouchStart={onTouchStart}
                 onTouchMove={onTouchMove}
                 onTouchEnd={onTouchEnd}>
          {/* Swipe Hint */}
          {currentStep < steps.length - 1 && (
            <div className="text-center mb-4">
                  <p className="text-xs text-white/60 animate-pulse">
                💡 Swipe left to continue
              </p>
            </div>
          )}
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ 
                opacity: 1, 
                x: 0,
                transform: swipeDirection === 'left' ? 'translateX(-10px)' : 
                          swipeDirection === 'right' ? 'translateX(10px)' : 'translateX(0px)'
              }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="text-center"
            >
              {/* Icon */}
              <motion.div
                className="text-6xl mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring" }}
              >
                {currentStepData.icon}
              </motion.div>

              {/* Title */}
                  {currentStep === 0 ? (
                    <div className="mb-6">
                      <TextPressure
                        text={`Hello, ${user?.name?.split(' ')[0] || 'there'}!`}
                        flex={false}
                        alpha={false}
                        stroke={false}
                        width={true}
                        weight={true}
                        italic={true}
                        textColor="#ffffff"
                        minFontSize={32}
                        className="drop-shadow-lg"
                      />
                    </div>
                  ) : (
                    <h1 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
                {currentStepData.title}
              </h1>
                  )}

              {/* Subtitle */}
                  <p className="text-white/80 text-lg mb-4">
                {currentStepData.subtitle}
              </p>

              {/* Description */}
                  <p className="text-white/70 mb-6 max-w-md mx-auto">
                {currentStepData.description}
              </p>

              {/* Example */}
              {renderExample()}

              {/* Form Fields */}
              {currentStepData.fields.length > 0 && (
                <div className="space-y-4 max-w-sm mx-auto">
                  {currentStepData.fields.map((field, index) => (
                    <div key={index} className="text-left">
                          <label className="block text-sm font-medium text-white mb-2">
                        {field.label}
                      </label>
                      {renderField(field)}
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
            </div>
        </div>
      </div>

      {/* Navigation - Fixed at Bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-10 px-6 py-6 border-t border-white/20">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              currentStep === 0
                  ? 'text-white/40 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
            disabled={currentStep === 0}
          >
            Back
          </button>

          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                    index === currentStep ? 'bg-cyan-400' : 'bg-white/30'
                }`}
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isStepValid()
                  ? 'bg-white text-black hover:bg-slate-200'
                  : 'bg-white/20 text-white/40 cursor-not-allowed'
            }`}
            disabled={!isStepValid()}
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </motion.button>
        </div>
        
        {/* Swipe Navigation Hints */}
          <div className="flex justify-between items-center mt-4 text-xs text-white/50">
          {currentStep > 0 && (
            <div className="flex items-center space-x-1">
              <span>←</span>
              <span>Swipe right to go back</span>
            </div>
          )}
          {currentStep < steps.length - 1 && (
            <div className="flex items-center space-x-1 ml-auto">
              <span>Swipe left to continue</span>
              <span>→</span>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 
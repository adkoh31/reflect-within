import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check } from 'lucide-react';
import FocusAreasStep from './FocusAreasStep';
import MetricsSelectionStep from './MetricsSelectionStep';
import JournalingPreferencesStep from './JournalingPreferencesStep';
import PersonalGoalsStep from './PersonalGoalsStep';

const GoalSettingModal = ({ isOpen, onClose, onComplete, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    focusAreas: [],
    selectedMetrics: {},
    journalingFrequency: 'daily',
    reminders: ['daily'],
    personalGoals: []
  });

  const steps = [
    {
      id: 0,
      title: "Welcome to ReflectWithin! 🎉",
      subtitle: "Let's personalize your experience",
      description: "Help us understand what matters most to you so we can provide more relevant insights and guidance.",
      component: 'focus-areas',
      required: true
    },
    {
      id: 1,
      title: "What would you like to track?",
      subtitle: "Choose your key metrics",
      description: "Select the specific metrics that matter most to your fitness journey and recovery.",
      component: 'metrics-selection',
      required: true
    },
    {
      id: 2,
      title: "How often do you want to reflect?",
      subtitle: "Set your journaling rhythm",
      description: "Choose your preferred journaling frequency and set up helpful reminders.",
      component: 'journaling-preferences',
      required: false
    },
    {
      id: 3,
      title: "Any specific goals?",
      subtitle: "Add personal milestones (optional)",
      description: "Set specific goals you'd like to work toward. This helps us provide more personalized insights and motivation.",
      component: 'personal-goals',
      required: false
    }
  ];

  const currentStepData = steps[currentStep];

  // Validation functions for each step
  const isStepValid = (stepIndex) => {
    switch (stepIndex) {
      case 0: // Focus Areas
        return formData.focusAreas.length > 0;
      case 1: // Metrics Selection
        return Object.values(formData.selectedMetrics).flat().length > 0;
      case 2: // Journaling Preferences
        return formData.journalingFrequency && formData.reminders.length > 0;
      case 3: // Personal Goals
        return true; // Always valid since it's optional
      default:
        return false;
    }
  };

  const handleStepDataUpdate = (stepData) => {
    setFormData(prev => ({ ...prev, ...stepData }));
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        handleComplete();
      }
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete({
      goals: {
        categories: formData.focusAreas,
        metrics: formData.selectedMetrics,
        preferences: {
          journalingGoal: formData.journalingFrequency,
          reminders: formData.reminders
        },
        goals: formData.personalGoals
      }
    });
  };

  const handleSkip = () => {
    onClose();
  };

  const renderStepContent = () => {
    const commonProps = {
      onDataUpdate: handleStepDataUpdate,
      user: user,
      initialData: formData
    };

    switch (currentStepData.component) {
      case 'focus-areas':
        return <FocusAreasStep {...commonProps} />;
      case 'metrics-selection':
        return <MetricsSelectionStep {...commonProps} />;
      case 'journaling-preferences':
        return <JournalingPreferencesStep {...commonProps} />;
      case 'personal-goals':
        return <PersonalGoalsStep {...commonProps} />;
      default:
        return null;
    }
  };

  const getValidationMessage = () => {
    switch (currentStep) {
      case 0:
        return formData.focusAreas.length === 0 ? "Please select at least one focus area" : "";
      case 1:
        return Object.values(formData.selectedMetrics).flat().length === 0 ? "Please select at least one metric" : "";
      default:
        return "";
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
      >
        <div className="min-h-screen flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-4xl bg-background rounded-2xl shadow-2xl overflow-hidden border border-white/10"
          >
            {/* Header */}
            <div className="relative bg-gradient-to-r from-cyan-500 to-blue-600 p-6">
              <button
                onClick={handleSkip}
                className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-3">
                  <Sparkles className="w-8 h-8 text-white mr-2" />
                  <h1 className="text-white text-2xl font-bold">
                    {currentStepData.title}
                  </h1>
                </div>
                <p className="text-white/80 text-lg mb-4">
                  {currentStepData.subtitle}
                </p>
                <p className="text-white/70 max-w-md mx-auto">
                  {currentStepData.description}
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-white/20 h-2 rounded-full">
                  <motion.div
                    className="h-full bg-white rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-white/60 text-sm">
                  <span>Step {currentStep + 1} of {steps.length}</span>
                  <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {renderStepContent()}
              
              {/* Validation Message */}
              {getValidationMessage() && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
                >
                  <p className="text-red-400 text-sm text-center">{getValidationMessage()}</p>
                </motion.div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-6 bg-white/5">
              <div className="flex justify-between items-center">
                <button
                  onClick={handleStepBack}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    currentStep === 0
                      ? 'text-white/40 cursor-not-allowed'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Back
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSkip}
                    className="px-6 py-3 rounded-lg font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  >
                    Skip for now
                  </button>
                  
                  <motion.button
                    onClick={handleNext}
                    disabled={!isStepValid(currentStep)}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isStepValid(currentStep)
                        ? 'bg-white text-black hover:bg-slate-200'
                        : 'bg-white/20 text-white/40 cursor-not-allowed'
                    }`}
                    whileHover={isStepValid(currentStep) ? { scale: 1.02 } : {}}
                    whileTap={isStepValid(currentStep) ? { scale: 0.98 } : {}}
                  >
                    <span>{currentStep === steps.length - 1 ? 'Complete' : 'Next'}</span>
                    {currentStep === steps.length - 1 && <Check className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default GoalSettingModal; 
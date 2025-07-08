import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const OnboardingFlow = ({ onComplete, onSkip, user }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    firstReflection: '',
    preferredMode: 'chat'
  });

  const steps = [
    {
      id: 0,
      title: `Welcome to ReflectWithin, ${user?.name?.split(' ')[0] || 'there'}!`,
      subtitle: "Your AI-powered companion for deeper self-reflection",
      description: "Let's get you started in just a few minutes. We'll show you how to make the most of your reflection journey.",
      icon: "💙",
      fields: []
    },
    {
      id: 1,
      title: "How ReflectWithin Works",
      subtitle: "AI-powered reflection questions",
      description: "Share your thoughts, feelings, or experiences. Our AI will ask thoughtful questions to help you explore deeper insights.",
      icon: "🤖",
      fields: [],
      example: {
        user: "I'm feeling overwhelmed with work today...",
        ai: "What's one small step you could take today to feel more in control?"
      }
    },
    {
      id: 2,
      title: "Two Ways to Reflect",
      subtitle: "Choose what works best for you",
      description: "Use AI Chat for guided conversations, or Journal mode for private writing with AI insights.",
      icon: "📝",
      fields: [
        {
          type: "radio",
          label: "I prefer to start with:",
          options: [
            { value: 'chat', label: 'AI Chat - Guided conversations', description: 'Perfect for exploring thoughts with AI questions' },
            { value: 'journal', label: 'Journal - Private writing', description: 'Great for personal reflection with AI insights' }
          ],
          key: "preferredMode",
          required: true
        }
      ]
    },
    {
      id: 3,
      title: "Your First Reflection",
      subtitle: "Let's start your journey",
      description: "Share something you'd like to reflect on - it could be about your day, goals, feelings, or anything on your mind.",
      icon: "✨",
      fields: [
        {
          type: "textarea",
          label: "Your first reflection",
          placeholder: "e.g., I want to run a 5K this month, or I'm feeling motivated to start my fitness journey, or I had a challenging day at work...",
          key: "firstReflection",
          required: false
        }
      ]
    },
    {
      id: 4,
      title: "You're All Set!",
      subtitle: "Ready to start reflecting",
      description: "Your reflection space is ready. Remember, there's no right or wrong way to reflect - just be honest with yourself.",
      icon: "🎉",
      fields: []
    }
  ];

  const currentStepData = steps[currentStep];

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

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
    // Include user data from authentication
    const onboardingData = {
      email: user?.email,
      name: user?.name,
      firstReflection: formData.firstReflection,
      preferredMode: formData.preferredMode
    };
    onComplete(onboardingData);
  };

  const isStepValid = () => {
    // For the first two steps, always valid
    if (currentStep <= 1) return true;
    
    // For the mode selection step, require a selection
    if (currentStep === 2) return formData.preferredMode;
    
    // For the reflection step, reflection is optional
    if (currentStep === 3) return true;
    
    // For the final step, always valid
    return true;
  };

  const renderField = (field) => {
    const commonClasses = "w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-colors duration-200";
    
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
                  className="mt-1 text-primary-400 focus:ring-primary-400"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{option.label}</div>
                  <div className="text-sm text-gray-500">{option.description}</div>
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
        <div className="bg-gray-50 rounded-xl p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">You</span>
            </div>
            <div className="bg-white rounded-2xl px-4 py-3 max-w-xs shadow-sm">
              <p className="text-gray-700 text-sm">{currentStepData.example.user}</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 justify-end">
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl px-4 py-3 max-w-xs shadow-sm">
              <p className="text-white text-sm">{currentStepData.example.ai}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
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
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      {/* Progress Bar */}
      <div className="w-full bg-gray-100 h-1">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-400 to-secondary-400"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Skip Button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={onSkip}
          className="text-gray-500 hover:text-gray-700 text-sm font-medium"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center px-6 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
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
            <h1 className="text-2xl font-display font-bold text-gray-900 mb-2">
              {currentStepData.title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 mb-4">
              {currentStepData.subtitle}
            </p>

            {/* Description */}
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              {currentStepData.description}
            </p>

            {/* Example */}
            {renderExample()}

            {/* Form Fields */}
            {currentStepData.fields.length > 0 && (
              <div className="space-y-4 max-w-sm mx-auto">
                {currentStepData.fields.map((field, index) => (
                  <div key={index} className="text-left">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
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

      {/* Navigation */}
      <div className="px-6 py-6 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              currentStep === 0
                ? 'text-gray-400 cursor-not-allowed'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
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
                  index === currentStep ? 'bg-primary-400' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>

          <motion.button
            onClick={handleNext}
            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
              isStepValid()
                ? 'bg-primary-400 text-white hover:bg-primary-500'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!isStepValid()}
            whileHover={isStepValid() ? { scale: 1.02 } : {}}
            whileTap={isStepValid() ? { scale: 0.98 } : {}}
          >
            {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingFlow; 
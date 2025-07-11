import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Dumbbell, 
  Heart, 
  Brain, 
  TrendingUp, 
  Check,
  Plus,
  X
} from 'lucide-react';

const GoalSettingStep = ({ onComplete, onBack, user }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [currentStep, setCurrentStep] = useState('categories'); // 'categories', 'metrics', 'goals'
  const [selectedMetrics, setSelectedMetrics] = useState({});
  const [customGoals, setCustomGoals] = useState([]);
  const [preferences, setPreferences] = useState({
    reminders: ['daily', 'weekly'],
    insights: ['weekly', 'monthly'],
    aiFeatures: ['suggestions', 'patterns']
  });

  // Available categories
  const categories = [
    {
      id: 'physical',
      name: 'Physical Health',
      icon: <Dumbbell className="w-6 h-6" />,
      description: 'Track fitness, weight, sleep, and physical wellness',
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'mental',
      name: 'Mental Wellness',
      icon: <Brain className="w-6 h-6" />,
      description: 'Monitor mood, stress, energy, and mental health',
      color: 'from-blue-500 to-purple-500'
    },
    {
      id: 'growth',
      name: 'Personal Growth',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Track learning, habits, goals, and development',
      color: 'from-green-500 to-emerald-500'
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Habits',
      icon: <Heart className="w-6 h-6" />,
      description: 'Monitor daily habits, nutrition, and lifestyle choices',
      color: 'from-pink-500 to-rose-500'
    }
  ];

  // Available metrics by category
  const metricsByCategory = {
    physical: [
      { id: 'weight', label: 'Weight', unit: 'lbs', type: 'number' },
      { id: 'workouts', label: 'Workout Frequency', unit: 'days/week', type: 'select', options: [3, 4, 5, 6, 7] },
      { id: 'sleep', label: 'Sleep Hours', unit: 'hours', type: 'select', options: [7, 8, 9] },
      { id: 'steps', label: 'Daily Steps', unit: 'steps', type: 'number' },
      { id: 'water', label: 'Water Intake', unit: 'glasses', type: 'number' }
    ],
    mental: [
      { id: 'mood', label: 'Daily Mood', unit: '1-10 scale', type: 'scale' },
      { id: 'stress', label: 'Stress Level', unit: '1-10 scale', type: 'scale' },
      { id: 'energy', label: 'Energy Level', unit: '1-10 scale', type: 'scale' },
      { id: 'meditation', label: 'Meditation', unit: 'minutes/day', type: 'number' },
      { id: 'gratitude', label: 'Gratitude Practice', unit: 'daily', type: 'boolean' }
    ],
    growth: [
      { id: 'reading', label: 'Reading', unit: 'pages/day', type: 'number' },
      { id: 'learning', label: 'Learning Time', unit: 'minutes/day', type: 'number' },
      { id: 'productivity', label: 'Focus Hours', unit: 'hours/day', type: 'number' },
      { id: 'habits', label: 'Habit Tracking', unit: 'habits', type: 'custom' }
    ],
    lifestyle: [
      { id: 'nutrition', label: 'Healthy Meals', unit: 'meals/day', type: 'number' },
      { id: 'screen_time', label: 'Screen Time', unit: 'hours/day', type: 'number' },
      { id: 'social', label: 'Social Activities', unit: 'events/week', type: 'number' },
      { id: 'creative', label: 'Creative Time', unit: 'minutes/day', type: 'number' }
    ]
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleMetricToggle = (categoryId, metricId) => {
    setSelectedMetrics(prev => ({
      ...prev,
      [categoryId]: prev[categoryId] 
        ? prev[categoryId].includes(metricId)
          ? prev[categoryId].filter(id => id !== metricId)
          : [...prev[categoryId], metricId]
        : [metricId]
    }));
  };

  const handleNext = () => {
    if (currentStep === 'categories' && selectedCategories.length > 0) {
      setCurrentStep('metrics');
    } else if (currentStep === 'metrics') {
      setCurrentStep('goals');
    } else if (currentStep === 'goals') {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep === 'metrics') {
      setCurrentStep('categories');
    } else if (currentStep === 'goals') {
      setCurrentStep('metrics');
    } else {
      onBack();
    }
  };

  const handleComplete = () => {
    const goalData = {
      categories: selectedCategories,
      metrics: selectedMetrics,
      goals: customGoals,
      preferences,
      createdAt: new Date().toISOString()
    };
    onComplete(goalData);
  };

  const addCustomGoal = () => {
    const newGoal = {
      id: Date.now(),
      title: '',
      description: '',
      target: '',
      deadline: '',
      category: selectedCategories[0] || 'general'
    };
    setCustomGoals(prev => [...prev, newGoal]);
  };

  const updateCustomGoal = (id, field, value) => {
    setCustomGoals(prev => 
      prev.map(goal => 
        goal.id === id ? { ...goal, [field]: value } : goal
      )
    );
  };

  const removeCustomGoal = (id) => {
    setCustomGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const renderCategoriesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Focus Areas</h2>
        <p className="text-white/70">Select 2-4 areas that matter most to you</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categories.map((category) => (
          <motion.button
            key={category.id}
            onClick={() => handleCategoryToggle(category.id)}
            className={`p-6 rounded-xl border-2 transition-all duration-200 text-left ${
              selectedCategories.includes(category.id)
                ? 'border-cyan-400 bg-cyan-500/10'
                : 'border-white/20 bg-white/5 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg bg-gradient-to-br ${category.color}`}>
                {category.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-1">{category.name}</h3>
                <p className="text-sm text-white/70">{category.description}</p>
              </div>
              {selectedCategories.includes(category.id) && (
                <div className="w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );

  const renderMetricsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Select Metrics to Track</h2>
        <p className="text-white/70">Choose what you want to monitor in each area</p>
      </div>

      {selectedCategories.map((categoryId) => {
        const category = categories.find(c => c.id === categoryId);
        const metrics = metricsByCategory[categoryId] || [];
        const selectedCategoryMetrics = selectedMetrics[categoryId] || [];

        return (
          <div key={categoryId} className="bg-white/5 rounded-xl p-6 border border-white/10">
            <div className="flex items-center space-x-3 mb-4">
              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.color}`}>
                {category.icon}
              </div>
              <h3 className="text-lg font-semibold text-white">{category.name}</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {metrics.map((metric) => (
                <motion.button
                  key={metric.id}
                  onClick={() => handleMetricToggle(categoryId, metric.id)}
                  className={`p-3 rounded-lg border transition-all duration-200 text-left ${
                    selectedCategoryMetrics.includes(metric.id)
                      ? 'border-cyan-400 bg-cyan-500/10'
                      : 'border-white/20 bg-white/5 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-white">{metric.label}</div>
                      <div className="text-sm text-white/60">{metric.unit}</div>
                    </div>
                    {selectedCategoryMetrics.includes(metric.id) && (
                      <Check className="w-4 h-4 text-cyan-400" />
                    )}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Set Your Goals</h2>
        <p className="text-white/70">What would success look like for you?</p>
      </div>

      {/* Writing Goal */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Journaling Goal</h3>
        <div className="space-y-3">
          {[
            { id: 'daily', label: 'Write daily', description: 'Journal every single day' },
            { id: 'weekly', label: 'Write 3-4 times per week', description: 'Regular but flexible schedule' },
            { id: 'inspired', label: 'Write when inspired', description: 'Journal when you feel motivated' }
          ].map((option) => (
            <label key={option.id} className="flex items-start space-x-3 cursor-pointer">
              <input
                type="radio"
                name="writingGoal"
                value={option.id}
                className="mt-1 text-cyan-400 focus:ring-cyan-400"
              />
              <div className="flex-1">
                <div className="font-medium text-white">{option.label}</div>
                <div className="text-sm text-white/70">{option.description}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Custom Goals */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Personal Goals</h3>
          <button
            onClick={addCustomGoal}
            className="flex items-center space-x-2 px-3 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-400 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Goal</span>
          </button>
        </div>

        <div className="space-y-4">
          {customGoals.map((goal) => (
            <div key={goal.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <input
                  type="text"
                  placeholder="Goal title (e.g., Lose 10 lbs)"
                  value={goal.title}
                  onChange={(e) => updateCustomGoal(goal.id, 'title', e.target.value)}
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
                <button
                  onClick={() => removeCustomGoal(goal.id)}
                  className="ml-2 p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <textarea
                placeholder="Description (optional)"
                value={goal.description}
                onChange={(e) => updateCustomGoal(goal.id, 'description', e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 resize-none h-20"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Tracking Preferences */}
      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Tracking Preferences</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-white mb-2">Reminders</h4>
            <div className="flex flex-wrap gap-2">
              {['daily', 'weekly', 'monthly'].map((freq) => (
                <label key={freq} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.reminders.includes(freq)}
                    onChange={(e) => {
                      setPreferences(prev => ({
                        ...prev,
                        reminders: e.target.checked
                          ? [...prev.reminders, freq]
                          : prev.reminders.filter(r => r !== freq)
                      }));
                    }}
                    className="text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-white capitalize">{freq}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-white mb-2">AI Features</h4>
            <div className="flex flex-wrap gap-2">
              {['suggestions', 'patterns', 'insights'].map((feature) => (
                <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.aiFeatures.includes(feature)}
                    onChange={(e) => {
                      setPreferences(prev => ({
                        ...prev,
                        aiFeatures: e.target.checked
                          ? [...prev.aiFeatures, feature]
                          : prev.aiFeatures.filter(f => f !== feature)
                      }));
                    }}
                    className="text-cyan-400 focus:ring-cyan-400"
                  />
                  <span className="text-white capitalize">{feature}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const canProceed = () => {
    if (currentStep === 'categories') {
      return selectedCategories.length >= 1 && selectedCategories.length <= 4;
    }
    if (currentStep === 'metrics') {
      return Object.keys(selectedMetrics).length > 0;
    }
    return true;
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-white/10 h-1 rounded-full">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep === 'categories' ? 1 : currentStep === 'metrics' ? 2 : 3) / 3) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Main Content - Scrollable */}
      <div className="max-h-[60vh] overflow-y-auto pr-2 pb-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {currentStep === 'categories' && renderCategoriesStep()}
          {currentStep === 'metrics' && renderMetricsStep()}
          {currentStep === 'goals' && renderGoalsStep()}
        </motion.div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-white/20">
        <button
          onClick={handleBack}
          className="px-6 py-3 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          Back
        </button>

        <div className="flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                (currentStep === 'categories' && step === 1) ||
                (currentStep === 'metrics' && step === 2) ||
                (currentStep === 'goals' && step === 3)
                  ? 'bg-cyan-400'
                  : 'bg-white/30'
              }`}
            />
          ))}
        </div>

        <motion.button
          onClick={handleNext}
          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
            canProceed()
              ? 'bg-white text-black hover:bg-slate-200'
              : 'bg-white/20 text-white/40 cursor-not-allowed'
          }`}
          disabled={!canProceed()}
          whileHover={canProceed() ? { scale: 1.02 } : {}}
          whileTap={canProceed() ? { scale: 0.98 } : {}}
        >
          {currentStep === 'goals' ? 'Complete Setup' : 'Next'}
        </motion.button>
      </div>
    </div>
  );
};

export default GoalSettingStep; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Dumbbell, 
  Heart, 
  Target, 
  Coffee, 
  Moon, 
  Sun, 
  BookOpen, 
  TrendingUp,
  Zap,
  Star
} from 'lucide-react';

const JournalTemplates = ({ onSelectTemplate, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const templates = {
    fitness: [
      {
        id: 'workout-reflection',
        title: 'Workout Reflection',
        description: 'Reflect on your training session, energy levels, and progress',
        icon: <Dumbbell className="w-5 h-5" />,
        prompts: [
          'What workout did you do today?',
          'How did you feel during the workout?',
          'What went well?',
          'What could you improve?',
          'How are you feeling now?'
        ],
        color: 'from-orange-500 to-red-500'
      },
      {
        id: 'recovery-check',
        title: 'Recovery Check',
        description: 'Assess your recovery, soreness, and readiness for next session',
        icon: <Heart className="w-5 h-5" />,
        prompts: [
          'How are you feeling today?',
          'Any areas of soreness or tightness?',
          'How did you sleep?',
          'What recovery methods are you using?',
          'How ready do you feel for your next workout?'
        ],
        color: 'from-green-500 to-emerald-500'
      },
      {
        id: 'goal-progress',
        title: 'Goal Progress',
        description: 'Track progress toward your fitness and wellness goals',
        icon: <Target className="w-5 h-5" />,
        prompts: [
          'What goals are you working toward?',
          'What progress have you made recently?',
          'What challenges are you facing?',
          'What adjustments do you need to make?',
          'What are you proud of today?'
        ],
        color: 'from-blue-500 to-cyan-500'
      }
    ],
    wellness: [
      {
        id: 'morning-routine',
        title: 'Morning Routine',
        description: 'Start your day with intention and energy',
        icon: <Sun className="w-5 h-5" />,
        prompts: [
          'How did you sleep last night?',
          'What\'s your energy level this morning?',
          'What are your intentions for today?',
          'What are you grateful for?',
          'What will make today great?'
        ],
        color: 'from-yellow-500 to-orange-500'
      },
      {
        id: 'evening-reflection',
        title: 'Evening Reflection',
        description: 'Wind down and reflect on your day',
        icon: <Moon className="w-5 h-5" />,
        prompts: [
          'How was your day overall?',
          'What was the highlight of your day?',
          'What challenged you today?',
          'What did you learn?',
          'What are you looking forward to tomorrow?'
        ],
        color: 'from-purple-500 to-indigo-500'
      },
      {
        id: 'stress-check',
        title: 'Stress Check',
        description: 'Monitor your stress levels and coping strategies',
        icon: <Coffee className="w-5 h-5" />,
        prompts: [
          'How stressed do you feel today? (1-10)',
          'What\'s causing stress right now?',
          'How are you coping with stress?',
          'What helps you feel more relaxed?',
          'What do you need right now?'
        ],
        color: 'from-pink-500 to-rose-500'
      }
    ],
    growth: [
      {
        id: 'learning-reflection',
        title: 'Learning Reflection',
        description: 'Reflect on new skills, knowledge, or insights gained',
        icon: <BookOpen className="w-5 h-5" />,
        prompts: [
          'What did you learn today?',
          'What new skill are you developing?',
          'What insight did you gain?',
          'How will you apply this learning?',
          'What questions do you still have?'
        ],
        color: 'from-indigo-500 to-purple-500'
      },
      {
        id: 'habit-tracker',
        title: 'Habit Tracker',
        description: 'Monitor your daily habits and routines',
        icon: <TrendingUp className="w-5 h-5" />,
        prompts: [
          'Which habits did you maintain today?',
          'Which habits did you struggle with?',
          'What helped you stay on track?',
          'What obstacles did you face?',
          'How can you improve tomorrow?'
        ],
        color: 'from-teal-500 to-cyan-500'
      },
      {
        id: 'gratitude-practice',
        title: 'Gratitude Practice',
        description: 'Cultivate gratitude and positive mindset',
        icon: <Star className="w-5 h-5" />,
        prompts: [
          'What are you grateful for today?',
          'Who made a positive impact on your day?',
          'What simple pleasure brought you joy?',
          'What challenge are you grateful for?',
          'How can you express gratitude to others?'
        ],
        color: 'from-amber-500 to-yellow-500'
      }
    ]
  };

  const categories = [
    { id: 'all', name: 'All Templates', icon: <Zap className="w-4 h-4" /> },
    { id: 'fitness', name: 'Fitness', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'wellness', name: 'Wellness', icon: <Heart className="w-4 h-4" /> },
    { id: 'growth', name: 'Growth', icon: <TrendingUp className="w-4 h-4" /> }
  ];

  const handleTemplateSelect = (template) => {
    onSelectTemplate(template);
  };

  const getFilteredTemplates = () => {
    if (selectedCategory === 'all') {
      return Object.values(templates).flat();
    }
    return templates[selectedCategory] || [];
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-50">Choose a Template</h2>
            <p className="text-slate-400 text-sm">Select a template to get started with your journal entry</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <span className="sr-only">Close</span>
            <div className="w-5 h-5 relative">
              <div className="absolute inset-0 rotate-45 border-t-2 border-slate-400"></div>
              <div className="absolute inset-0 -rotate-45 border-t-2 border-slate-400"></div>
            </div>
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                selectedCategory === category.id
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="overflow-y-auto max-h-[60vh] pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="wait">
              {getFilteredTemplates().map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className="group cursor-pointer"
                  onClick={() => handleTemplateSelect(template)}
                >
                  <div className="bg-slate-800/80 hover:bg-slate-700/80 rounded-xl p-4 border border-slate-600/50 hover:border-cyan-500/30 transition-all duration-200 h-full">
                    {/* Template Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${template.color} group-hover:scale-110 transition-transform duration-200`}>
                        {template.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-50 mb-1">{template.title}</h3>
                        <p className="text-xs text-slate-400">{template.description}</p>
                      </div>
                    </div>

                    {/* Template Prompts Preview */}
                    <div className="space-y-2">
                      {template.prompts.slice(0, 3).map((prompt, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-slate-500 rounded-full mt-2 flex-shrink-0"></div>
                          <p className="text-xs text-slate-300 leading-relaxed">{prompt}</p>
                        </div>
                      ))}
                      {template.prompts.length > 3 && (
                        <p className="text-xs text-slate-500 italic">
                          +{template.prompts.length - 3} more prompts
                        </p>
                      )}
                    </div>

                    {/* Use Template Button */}
                    <div className="mt-4 pt-3 border-t border-slate-600/50">
                      <button className="w-full px-3 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 rounded-lg text-sm font-medium transition-colors duration-200">
                        Use Template
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 text-center">
            Templates help you get started, but feel free to modify them to fit your needs
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default JournalTemplates; 
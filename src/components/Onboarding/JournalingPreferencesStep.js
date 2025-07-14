import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Sparkles, Bell } from 'lucide-react';

const JournalingPreferencesStep = ({ onDataUpdate, user, initialData = {} }) => {
  const [journalingFrequency, setJournalingFrequency] = useState(initialData.journalingFrequency || 'daily');
  const [reminders, setReminders] = useState(initialData.reminders || ['daily']);

  const frequencyOptions = [
    {
      id: 'daily',
      title: 'Daily',
      description: 'Journal every day for consistent reflection',
      icon: Calendar,
      color: 'from-green-500 to-emerald-500',
      recommended: true
    },
    {
      id: 'weekly',
      title: 'Weekly',
      description: 'Reflect once or twice a week',
      icon: Clock,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'inspired',
      title: 'When Inspired',
      description: 'Journal when you feel motivated',
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const reminderOptions = [
    { id: 'daily', label: 'Daily reminders', icon: Bell },
    { id: 'weekly', label: 'Weekly summaries', icon: Calendar },
    { id: 'insights', label: 'Progress insights', icon: Sparkles }
  ];

  const handleFrequencySelect = (frequency) => {
    setJournalingFrequency(frequency);
    
    // Update parent form data
    onDataUpdate({ journalingFrequency: frequency, reminders });
  };

  const handleReminderToggle = (reminderId) => {
    const newReminders = reminders.includes(reminderId)
      ? reminders.filter(id => id !== reminderId)
      : [...reminders, reminderId];
    
    setReminders(newReminders);
    
    // Update parent form data
    onDataUpdate({ journalingFrequency, reminders: newReminders });
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Frequency Options */}
        <div className="space-y-4 max-w-lg mx-auto mb-8">
          {frequencyOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = journalingFrequency === option.id;
            
            return (
              <motion.button
                key={option.id}
                onClick={() => handleFrequencySelect(option.id)}
                className={`relative w-full p-4 rounded-xl border-2 transition-all duration-200 text-left ${
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

                {/* Recommended Badge */}
                {option.recommended && (
                  <div className="absolute -top-2 -left-2 px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-xs text-white font-medium">
                    Recommended
                  </div>
                )}

                {/* Content */}
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-white font-semibold mb-1">{option.title}</h3>
                    <p className="text-white/70 text-sm">{option.description}</p>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Reminders Section */}
        <div className="max-w-lg mx-auto mb-8">
          <h3 className="text-white font-semibold mb-4">Optional Reminders</h3>
          <p className="text-white/70 text-sm mb-4">
            Choose how you'd like to stay on track with your journaling habit.
          </p>
          
          <div className="space-y-3">
            {reminderOptions.map((reminder) => {
              const ReminderIcon = reminder.icon;
              const isSelected = reminders.includes(reminder.id);
              
              return (
                <motion.button
                  key={reminder.id}
                  onClick={() => handleReminderToggle(reminder.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200 text-left w-full ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40 hover:bg-white/10'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-400'
                      : 'border-white/40'
                  }`}>
                    {isSelected && (
                      <motion.svg
                        className="w-3 h-3 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </motion.svg>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <ReminderIcon className="w-4 h-4 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="text-white font-medium">{reminder.label}</div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JournalingPreferencesStep; 
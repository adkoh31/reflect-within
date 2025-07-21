import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Dumbbell, Target, Heart, Flame, Zap } from 'lucide-react';
import { JollyTagGroup, Tag } from '../ui/tag-group';

// Custom Copy Icon Component
const CopyIcon = ({ className = "w-3 h-3" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d="M16 8V5L19 2L20 4L22 5L19 8H16ZM16 8L12 11.9999M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const TopicSelector = ({ selectedTopics = [], onTopicsSelect, className = '' }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const predefinedTopics = [
    { id: 'daily-reflection', label: 'Daily Reflection', icon: 'Sun' },
    { id: 'workout-fitness', label: 'Workout & Fitness', icon: 'Dumbbell' },
    { id: 'goals-progress', label: 'Goals & Progress', icon: 'Target' },
    { id: 'gratitude', label: 'Gratitude', icon: 'Heart' },
    { id: 'challenges', label: 'Challenges', icon: 'Flame' },
    { id: 'mood-energy', label: 'Mood & Energy', icon: 'Zap' }
  ];

  const getIcon = (iconName) => {
    const icons = { Sun, Dumbbell, Target, Heart, Flame, Zap };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent className="w-3 h-3" /> : null;
  };

  const handleSelectionChange = (selectedKeys) => {
    const selectedTopicsArray = Array.from(selectedKeys);
    onTopicsSelect(selectedTopicsArray);
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim() && !selectedTopics.includes(customTopic.trim())) {
      const newTopics = [...selectedTopics, customTopic.trim()];
      onTopicsSelect(newTopics);
      setShowCustom(false);
      setCustomTopic('');
    }
  };

  const handleCustomTopicCancel = () => {
    setShowCustom(false);
    setCustomTopic('');
  };

  const handleRemoveTopic = (topicToRemove) => {
    const newTopics = selectedTopics.filter(topic => topic !== topicToRemove);
    onTopicsSelect(newTopics);
  };

  return (
    <div className={className}>
      <JollyTagGroup
        label="Topics (optional)"
        description="Select one or more topics that relate to your entry"
        selectionMode="multiple"
        selectedKeys={new Set(selectedTopics)}
        onSelectionChange={handleSelectionChange}
        allowsRemoving={false}
        className="mb-3 sm:mb-4"
      >
        {/* Predefined Topics */}
        {predefinedTopics.map((topic) => (
          <Tag key={topic.id} id={topic.label}>
            <span className="mr-1 text-slate-300">{getIcon(topic.icon)}</span>
            {topic.label}
          </Tag>
        ))}
      </JollyTagGroup>

      {/* Custom Topic Input */}
      {showCustom ? (
        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter your custom topic..."
            className="w-full p-3 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-slate-50 placeholder-slate-400 font-normal text-sm min-h-[44px]"
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomTopicSubmit();
              }
            }}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleCustomTopicSubmit}
              disabled={!customTopic.trim() || selectedTopics.includes(customTopic.trim())}
              className="px-3 py-2 text-xs sm:text-sm bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 min-h-[44px]"
            >
              Add Topic
            </button>
            <button
              onClick={handleCustomTopicCancel}
              className="px-3 py-2 text-xs sm:text-sm bg-slate-800/80 text-slate-300 rounded-lg hover:bg-slate-700/80 font-medium transition-all duration-200 min-h-[44px]"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      ) : (
        <button
          onClick={() => setShowCustom(true)}
          className="flex items-center gap-2 px-3 py-2 text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-all duration-200 font-medium border border-slate-700/50 min-h-[44px]"
        >
          <CopyIcon className="w-3 h-3 sm:w-4 sm:h-4" />
          Add Custom Topic
        </button>
      )}

      {/* Selected Topics Display */}
      {selectedTopics.length > 0 && (
        <motion.div 
          className="mt-3 sm:mt-4 p-3 bg-slate-800/20 rounded-lg border border-slate-700/30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-xs text-slate-400 font-medium mb-2">
            Selected Topics ({selectedTopics.length}):
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTopics.map((topic, index) => (
              <motion.span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-800/80 text-slate-300 text-xs rounded-lg font-medium border border-slate-700/50"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                {topic}
                <button
                  onClick={() => handleRemoveTopic(topic)}
                  className="ml-1 text-slate-400 hover:text-slate-300 text-xs"
                >
                  ✕
                </button>
              </motion.span>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TopicSelector; 
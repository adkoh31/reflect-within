import React, { useState } from 'react';
import { motion } from 'framer-motion';

const TopicSelector = ({ selectedTopic, onTopicSelect, className = '' }) => {
  const [showCustom, setShowCustom] = useState(false);
  const [customTopic, setCustomTopic] = useState('');

  const predefinedTopics = [
    { id: 'daily-reflection', label: 'Daily Reflection', icon: '🌅' },
    { id: 'work-stress', label: 'Work Stress', icon: '💼' },
    { id: 'relationships', label: 'Relationships', icon: '❤️' },
    { id: 'health-wellness', label: 'Health & Wellness', icon: '🏃‍♀️' },
    { id: 'goals-dreams', label: 'Goals & Dreams', icon: '⭐' },
    { id: 'gratitude', label: 'Gratitude', icon: '🙏' },
    { id: 'challenges', label: 'Challenges', icon: '💪' },
    { id: 'creativity', label: 'Creativity', icon: '🎨' },
    { id: 'learning', label: 'Learning', icon: '📚' },
    { id: 'emotions', label: 'Emotions', icon: '😊' },
    { id: 'mindfulness', label: 'Mindfulness', icon: '🧘‍♀️' },
    { id: 'other', label: 'Other', icon: '📝' }
  ];

  const handleTopicClick = (topic) => {
    if (topic.id === 'other') {
      setShowCustom(true);
      setCustomTopic('');
    } else {
      onTopicSelect(topic.label);
      setShowCustom(false);
    }
  };

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      onTopicSelect(customTopic.trim());
      setShowCustom(false);
      setCustomTopic('');
    }
  };

  const handleCustomTopicCancel = () => {
    setShowCustom(false);
    setCustomTopic('');
  };

  return (
    <div className={className}>
      <label className="block text-sm font-light text-foreground mb-3">
        Topic (optional)
      </label>
      
      {showCustom ? (
        <div className="space-y-3">
          <input
            type="text"
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            placeholder="Enter your custom topic..."
            className="w-full p-3 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground font-light text-sm"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCustomTopicSubmit}
              disabled={!customTopic.trim()}
              className="px-3 py-1 text-sm bg-foreground text-background rounded-lg hover:bg-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed font-light transition-colors"
            >
              Add Topic
            </button>
            <button
              onClick={handleCustomTopicCancel}
              className="px-3 py-1 text-sm bg-muted text-foreground rounded-lg hover:bg-accent font-light transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {predefinedTopics.map((topic, index) => (
            <motion.button
              key={topic.id}
              onClick={() => handleTopicClick(topic)}
              className={`p-3 rounded-xl border transition-all duration-200 text-left ${
                selectedTopic === topic.label
                  ? 'bg-accent border-accent text-accent-foreground'
                  : 'bg-muted border-border hover:bg-accent hover:border-accent text-foreground'
              }`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{topic.icon}</span>
                <span className="text-xs font-light">{topic.label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
      
      {selectedTopic && !showCustom && (
        <div className="mt-3 p-3 bg-accent/20 rounded-lg border border-accent/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-accent-foreground font-medium">
              {selectedTopic}
            </p>
            <button
              onClick={() => onTopicSelect('')}
              className="text-xs text-accent-foreground hover:text-accent-foreground/70"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TopicSelector; 
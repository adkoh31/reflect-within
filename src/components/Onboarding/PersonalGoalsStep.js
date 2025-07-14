import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Plus, X } from 'lucide-react';

const PersonalGoalsStep = ({ onDataUpdate, user, initialData = {} }) => {
  const [goals, setGoals] = useState(initialData.personalGoals || []);
  const [newGoal, setNewGoal] = useState({ title: '', description: '' });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddGoal = () => {
    if (newGoal.title.trim()) {
      const newGoals = [...goals, { ...newGoal, id: Date.now() }];
      setGoals(newGoals);
      setNewGoal({ title: '', description: '' });
      setShowAddForm(false);
      
      // Update parent form data
      onDataUpdate({ personalGoals: newGoals });
    }
  };

  const handleRemoveGoal = (goalId) => {
    const newGoals = goals.filter(goal => goal.id !== goalId);
    setGoals(newGoals);
    
    // Update parent form data
    onDataUpdate({ personalGoals: newGoals });
  };

  return (
    <div className="text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Goals List */}
        <div className="max-w-lg mx-auto mb-8">
          {goals.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 border border-white/10">
              <Target className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <p className="text-white/60 text-sm">
                No goals added yet. Add your first goal to get started!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10 relative group"
                >
                  <button
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/10 hover:bg-red-500/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <X className="w-4 h-4 text-white/60 hover:text-red-400" />
                  </button>
                  
                  <div className="text-left">
                    <h3 className="text-white font-semibold mb-1">{goal.title}</h3>
                    {goal.description && (
                      <p className="text-white/70 text-sm">{goal.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Add Goal Button */}
          {!showAddForm && (
            <motion.button
              onClick={() => setShowAddForm(true)}
              className="w-full mt-4 p-4 border-2 border-dashed border-white/20 rounded-xl text-white/60 hover:text-white hover:border-white/40 transition-all duration-200 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus className="w-5 h-5" />
              <span>Add a goal</span>
            </motion.button>
          )}

          {/* Add Goal Form */}
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10"
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2 text-left">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="e.g., Improve my mood"
                    className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-colors duration-200 backdrop-blur-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-2 text-left">
                    Description (optional)
                  </label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="e.g., Work on maintaining a positive mindset throughout the day"
                    rows={3}
                    className="w-full px-4 py-3 border border-white/20 rounded-lg focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-colors duration-200 backdrop-blur-sm resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddGoal}
                    disabled={!newGoal.title.trim()}
                    className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                      newGoal.title.trim()
                        ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                        : 'bg-white/20 text-white/40 cursor-not-allowed'
                    }`}
                  >
                    Add Goal
                  </button>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewGoal({ title: '', description: '' });
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-white/70 hover:text-white hover:bg-white/10"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Helper Text */}
        <p className="text-white/50 text-sm mb-6">
          {goals.length === 0 
            ? "You can always add goals later in your profile"
            : `${goals.length} goal${goals.length !== 1 ? 's' : ''} added`
          }
        </p>
      </motion.div>
    </div>
  );
};

export default PersonalGoalsStep; 
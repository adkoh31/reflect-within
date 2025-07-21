import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  Target, 
  Heart, 
  TrendingUp, 
  Calendar,
  X,
  MessageCircle
} from 'lucide-react';

const SmartStarters = ({ 
  starters, 
  onStarterSelect, 
  isVisible, 
  onClose,
  conversationPersistence 
}) => {
  const [localStarters, setLocalStarters] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Generate starters when component mounts or when conversation changes
  useEffect(() => {
    if (conversationPersistence && isVisible) {
      generateStarters();
    }
  }, [conversationPersistence, isVisible]);

  const generateStarters = async () => {
    setIsGenerating(true);
    try {
      const smartStarters = conversationPersistence.generateSmartStarters();
      setLocalStarters(smartStarters);
    } catch (error) {
      console.error('Error generating starters:', error);
      setLocalStarters([]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStarterClick = (starter) => {
    onStarterSelect(starter.text);
    onClose();
  };

  const getStarterIcon = (type) => {
    switch (type) {
      case 'time-based':
        return <Clock className="w-4 h-4" />;
      case 'pattern-based':
        return <TrendingUp className="w-4 h-4" />;
      case 'achievement-based':
        return <Sparkles className="w-4 h-4" />;
      case 'emotional-support':
        return <Heart className="w-4 h-4" />;
      case 'celebration':
        return <Sparkles className="w-4 h-4" />;
      case 'goal-focused':
        return <Target className="w-4 h-4" />;
      case 'engagement-based':
        return <MessageCircle className="w-4 h-4" />;
      case 'reflection':
        return <TrendingUp className="w-4 h-4" />;
      case 'balance-focused':
        return <Calendar className="w-4 h-4" />;
      default:
        return <MessageCircle className="w-4 h-4" />;
    }
  };

  const getStarterColor = (type) => {
    switch (type) {
      case 'time-based':
        return 'from-blue-500/20 to-cyan-500/20 border-blue-500/30';
      case 'pattern-based':
        return 'from-purple-500/20 to-pink-500/20 border-purple-500/30';
      case 'achievement-based':
        return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30';
      case 'emotional-support':
        return 'from-red-500/20 to-pink-500/20 border-red-500/30';
      case 'celebration':
        return 'from-green-500/20 to-emerald-500/20 border-green-500/30';
      case 'goal-focused':
        return 'from-indigo-500/20 to-purple-500/20 border-indigo-500/30';
      case 'engagement-based':
        return 'from-cyan-500/20 to-blue-500/20 border-cyan-500/30';
      case 'reflection':
        return 'from-violet-500/20 to-purple-500/20 border-violet-500/30';
      case 'balance-focused':
        return 'from-emerald-500/20 to-teal-500/20 border-emerald-500/30';
      default:
        return 'from-slate-500/20 to-gray-500/20 border-slate-500/30';
    }
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-slate-800/90 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 mb-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-semibold text-slate-50">
              Conversation Starters
            </h4>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {isGenerating ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
            <span className="ml-2 text-slate-400 text-sm">Generating starters...</span>
          </div>
        ) : localStarters.length > 0 ? (
          <div className="space-y-2">
            {localStarters.map((starter, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleStarterClick(starter)}
                className={`w-full text-left p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] hover:shadow-lg ${getStarterColor(starter.type)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getStarterIcon(starter.type)}
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-100 text-sm leading-relaxed">
                      {starter.text}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-400 capitalize">
                        {starter.type.replace('-', ' ')}
                      </span>
                      <div className="flex space-x-1">
                        {[...Array(starter.priority)].map((_, i) => (
                          <div
                            key={i}
                            className="w-1 h-1 bg-cyan-400 rounded-full"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-slate-400 text-sm">
              Start a conversation to get personalized suggestions
            </p>
          </div>
        )}

        <div className="mt-3 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500">
            These suggestions are based on your conversation patterns and preferences
          </p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SmartStarters; 
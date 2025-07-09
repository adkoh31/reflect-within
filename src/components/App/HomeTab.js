import React from 'react';
import { motion } from 'framer-motion';
import { Typography } from '../Typography/Typography';

const HomeTab = ({ 
  user, 
  streak = 0, 
  last5JournalEntries = [], 
  onAction
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getReflectionPrompt = () => {
    const prompts = [
      "How are you feeling about your fitness journey today?",
      "What's one thing you're grateful for right now?",
      "What would make today feel successful for you?",
      "How has your perspective changed recently?",
      "What's something you're looking forward to?",
      "What's a challenge you're working through?",
      "How are you taking care of yourself today?",
      "What's something you've learned about yourself lately?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  };

  const getPhilosophicalQuote = () => {
    const quotes = [
      {
        text: "The only journey is the journey within.",
        author: "Rainer Maria Rilke"
      },
      {
        text: "Knowing yourself is the beginning of all wisdom.",
        author: "Aristotle"
      },
      {
        text: "The mind is everything. What you think you become.",
        author: "Buddha"
      },
      {
        text: "Self-reflection is the school of wisdom.",
        author: "Baltasar Gracián"
      },
      {
        text: "The unexamined life is not worth living.",
        author: "Socrates"
      }
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const quote = getPhilosophicalQuote();

  return (
    <div className="bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
        {/* Grid Layout - 3 columns for main cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Personalized Greeting */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-cyan-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 text-center h-full">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </div>
                <div>
                  <Typography 
                    variant="title" 
                    color="primary" 
                    weight="semibold" 
                    className="mb-2 text-slate-50"
                  >
                    {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
                  </Typography>
                  <Typography variant="body" color="muted" weight="normal" className="text-lg text-slate-300">
                    Ready to reflect on your journey?
                  </Typography>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Reflection Prompt */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-cyan-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-8 text-center h-full flex flex-col justify-center">
              <Typography variant="title" color="primary" weight="semibold" as="h2" className="mb-4 text-center text-slate-50">
                Today's Reflection
              </Typography>
              <Typography variant="body" color="muted" weight="normal" className="text-lg mb-6 leading-relaxed text-slate-300">
                {getReflectionPrompt()}
              </Typography>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={() => onAction('voice')}
                  className="w-full sm:w-auto bg-cyan-500 text-slate-900 py-4 px-8 rounded-xl font-medium hover:bg-cyan-400 transition-colors shadow-lg shadow-cyan-500/25 text-lg"
                >
                  Start Reflecting
                </button>
              </div>
            </div>
          </motion.div>

          {/* Philosophical Quote */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-cyan-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl p-8 text-center border border-slate-700/50 h-full flex flex-col justify-center">
              <blockquote className="text-slate-50 font-medium italic text-lg mb-4 leading-relaxed">
                "{quote.text}"
              </blockquote>
              <cite className="text-sm text-slate-400 font-medium">
                — {quote.author}
              </cite>
            </div>
          </motion.div>
        </div>

        {/* Streak Counter - Full Width Below Grid */}
        {streak > 0 && (
          <motion.div 
            className="relative mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-orange-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-orange-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-8 text-center max-w-md mx-auto">
              <div className="flex flex-col items-center space-y-3">
                <span className="text-4xl">🔥</span>
                <div>
                  <Typography variant="subtitle" color="primary" weight="medium" className="text-slate-50">
                    Your reflection streak
                  </Typography>
                  <Typography variant="heading" color="primary" weight="bold" className="text-orange-400">
                    {streak} day{streak !== 1 ? 's' : ''}
                  </Typography>
                </div>
                <Typography variant="caption" color="muted" weight="normal" className="text-slate-300">
                  Keep going!
                </Typography>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Journal Entries - Full Width */}
        {last5JournalEntries.length > 0 && (
          <motion.div 
            className="relative mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-cyan-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <Typography variant="subtitle" color="primary" weight="semibold" as="h3" className="text-slate-50">
                  Recent Reflections
                </Typography>
                <button
                  onClick={() => onAction('journal')}
                  className="text-sm text-slate-400 hover:text-cyan-400 font-medium transition-colors"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {last5JournalEntries.slice(0, 3).map((entry, index) => (
                  <div key={index} className="p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                    <Typography variant="body" color="muted" weight="normal" className="line-clamp-2 leading-relaxed text-slate-300">
                      {entry.text}
                    </Typography>
                    <Typography variant="caption" color="muted" weight="normal" className="mt-3 text-slate-400">
                      {new Date(entry.timestamp).toLocaleDateString()}
                    </Typography>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default HomeTab; 
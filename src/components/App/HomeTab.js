import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '../Typography/Typography';

const HomeTab = React.memo(({ 
  user, 
  streak = 0, 
  last5JournalEntries = [], 
  onAction
}) => {
  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const getReflectionPrompt = useMemo(() => {
    const prompts = [
      // Emotional check-ins
      "How are you feeling about your fitness journey today?",
      "What's one thing you're grateful for right now?",
      "How has your perspective changed recently?",
      "What's something you're looking forward to?",
      "What's a challenge you're working through?",
      "How are you taking care of yourself today?",
      "What's something you've learned about yourself lately?",
      
      // Movement and fitness
      "How is movement affecting your mental state today?",
      "What's your relationship with exercise and recovery like?",
      "How do you feel about your progress and goals?",
      "What's motivating you in your fitness journey?",
      
      // Personal development
      "What's something you're proud of accomplishing?",
      "How are your relationships and connections?",
      "What values are most important to you right now?",
      "What's something you're curious about or want to explore?",
      
      // Stress and well-being
      "What's helping you manage stress right now?",
      "How are you balancing different areas of your life?",
      "What does self-care look like for you today?",
      "How are you feeling about your overall well-being?",
      
      // Growth and learning
      "What's a lesson you've learned recently?",
      "How are you growing and evolving?",
      "What's something you're working on improving?",
      "What insights have you gained about yourself?"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, []);

  const getPhilosophicalQuote = useMemo(() => {
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
  }, []);

  const quote = getPhilosophicalQuote;
  const greeting = getGreeting;
  const reflectionPrompt = getReflectionPrompt;

  return (
    <div className="bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 pb-20">
        {/* Grid Layout - Responsive columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
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
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8 text-center h-full">
              <div className="flex flex-col items-center space-y-3 sm:space-y-4">
                <div>
                  <Typography 
                    variant="title" 
                    color="primary" 
                    weight="semibold" 
                    className="mb-2 text-slate-50 text-lg sm:text-xl lg:text-2xl"
                  >
                    {greeting}, {user?.name?.split(' ')[0] || 'there'}!
                  </Typography>
                  <Typography variant="body" color="muted" weight="normal" className="text-base sm:text-lg text-slate-300">
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
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 lg:p-8 text-center h-full flex flex-col justify-center">
              <Typography variant="title" color="primary" weight="semibold" as="h2" className="mb-3 sm:mb-4 text-center text-slate-50 text-lg sm:text-xl">
                Today's Reflection
              </Typography>
              <Typography variant="body" color="muted" weight="normal" className="text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed text-slate-300">
                {reflectionPrompt}
              </Typography>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
                <button
                  onClick={() => onAction('voice')}
                  className="w-full sm:w-auto bg-cyan-500 text-slate-900 py-3 sm:py-4 px-6 sm:px-8 rounded-xl font-medium hover:bg-cyan-400 transition-all duration-200 hover:scale-105 active:scale-95 focus:ring-2 focus:ring-cyan-500/50 shadow-lg shadow-cyan-500/25 text-base sm:text-lg min-h-[44px]"
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
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl p-4 sm:p-6 lg:p-8 text-center border border-slate-700/50 h-full flex flex-col justify-center">
              <blockquote className="text-slate-50 font-medium italic text-base sm:text-lg mb-3 sm:mb-4 leading-relaxed">
                "{quote.text}"
              </blockquote>
              <cite className="text-xs sm:text-sm text-slate-400 font-medium">
                — {quote.author}
              </cite>
            </div>
          </motion.div>
        </div>

        {/* Streak Counter - Full Width Below Grid */}
        {streak > 0 && (
          <motion.div 
            className="relative mt-6 sm:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-orange-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-orange-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 sm:p-6 lg:p-8 text-center max-w-md mx-auto">
              <div className="flex flex-col items-center space-y-2 sm:space-y-3">
                <span className="text-3xl sm:text-4xl">🔥</span>
                <div>
                  <Typography variant="subtitle" color="primary" weight="medium" className="text-slate-50 text-sm sm:text-base">
                    Your reflection streak
                  </Typography>
                  <Typography variant="heading" color="primary" weight="bold" className="text-orange-400 text-2xl sm:text-3xl">
                    {streak} day{streak !== 1 ? 's' : ''}
                  </Typography>
                </div>
                <Typography variant="caption" color="muted" weight="normal" className="text-slate-300 text-xs sm:text-sm">
                  Keep going!
                </Typography>
              </div>
            </div>
          </motion.div>
        )}

        {/* Recent Journal Entries - Full Width */}
        {last5JournalEntries.length > 0 && (
          <motion.div 
            className="relative mt-6 sm:mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Outer glow layers - extend beyond card */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/30 blur-2xl"></div>
            <div className="absolute -inset-6 rounded-2xl bg-cyan-400/20 blur-3xl"></div>
            
            {/* The actual card */}
            <div className="relative bg-slate-950/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <Typography variant="subtitle" color="primary" weight="semibold" as="h3" className="text-slate-50 text-base sm:text-lg">
                  Recent Reflections
                </Typography>
                <button
                  onClick={() => onAction('journal')}
                  className="text-xs sm:text-sm text-slate-400 hover:text-cyan-400 font-medium transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/50"
                >
                  View all
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {last5JournalEntries.slice(0, 3).map((entry, index) => (
                  <div key={index} className="p-3 sm:p-4 bg-slate-900/80 rounded-xl border border-slate-700/50">
                    <Typography variant="body" color="muted" weight="normal" className="line-clamp-2 leading-relaxed text-slate-300 text-sm sm:text-base">
                      {entry.text}
                    </Typography>
                    <Typography variant="caption" color="muted" weight="normal" className="mt-2 sm:mt-3 text-slate-400 text-xs sm:text-sm">
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
});

export default HomeTab; 
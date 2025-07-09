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
    <div className="max-w-2xl mx-auto space-y-6 px-4 pb-4">
      {/* Personalized Greeting */}
      <motion.div 
        className="bg-card rounded-2xl border border-border p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
            </svg>
          </div>
          <div>
            <Typography 
              variant="title" 
              color="primary" 
              weight="semibold" 
              className="mb-2"
            >
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}!
            </Typography>
            <Typography variant="body" color="muted" weight="normal" className="text-lg">
              Ready to reflect on your journey?
            </Typography>
          </div>
        </div>
      </motion.div>

      {/* Streak Counter */}
      {streak > 0 && (
        <motion.div 
          className="bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-2xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col items-center space-y-3">
            <span className="text-4xl">🔥</span>
            <div>
              <Typography variant="subtitle" color="primary" weight="medium">
                Your reflection streak
              </Typography>
              <Typography variant="heading" color="primary" weight="bold" className="text-orange-600">
                {streak} day{streak !== 1 ? 's' : ''}
              </Typography>
            </div>
            <Typography variant="caption" color="muted" weight="normal">
              Keep going!
            </Typography>
          </div>
        </motion.div>
      )}

      {/* Reflection Prompt */}
      <motion.div 
        className="bg-card rounded-2xl border border-border p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Typography variant="title" color="primary" weight="semibold" as="h2" className="mb-4 text-center">
          Today's Reflection
        </Typography>
        <Typography variant="body" color="muted" weight="normal" className="text-lg mb-6 leading-relaxed">
          {getReflectionPrompt()}
        </Typography>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={() => onAction('voice')}
            className="w-full sm:w-auto bg-foreground text-background py-4 px-8 rounded-xl font-medium hover:bg-muted-foreground transition-colors shadow-md text-lg"
          >
            Start Reflecting
          </button>
        </div>
      </motion.div>

      {/* Recent Journal Entries */}
      {last5JournalEntries.length > 0 && (
        <motion.div 
          className="bg-card rounded-2xl border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-6">
            <Typography variant="subtitle" color="primary" weight="semibold" as="h3">
              Recent Reflections
            </Typography>
            <button
              onClick={() => onAction('journal')}
              className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
            >
              View all
            </button>
          </div>
          <div className="space-y-4">
            {last5JournalEntries.slice(0, 3).map((entry, index) => (
              <div key={index} className="p-4 bg-muted/50 rounded-xl">
                <Typography variant="body" color="muted" weight="normal" className="line-clamp-2 leading-relaxed">
                  {entry.text}
                </Typography>
                <Typography variant="caption" color="muted" weight="normal" className="mt-3">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </Typography>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Philosophical Quote */}
      <motion.div 
        className="bg-gradient-to-br from-muted/50 to-accent/20 rounded-2xl p-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <blockquote className="text-foreground font-medium italic text-lg mb-4 leading-relaxed">
          "{quote.text}"
        </blockquote>
        <cite className="text-sm text-muted-foreground font-medium">
          — {quote.author}
        </cite>
      </motion.div>
    </div>
  );
};

export default HomeTab; 
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Typography } from '../Typography/Typography';
import { safeFormatDate, safeCreateDate } from '../../utils/dateUtils';
import { 
  Flame,
  Calendar,
  TrendingUp,
  Heart,
  Sparkles,
  Target,
  Clock,
  BarChart3
} from 'lucide-react';

const HomeTab = React.memo(({ 
  user, 
  streak = 0, 
  last5JournalEntries = [], 
  onAction
}) => {
  // Get today's date as a seed for consistent daily content
  const getTodaySeed = useMemo(() => {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  }, []);

  const getGreeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }, []);

  const getMotivationalMessage = useMemo(() => {
    const hour = new Date().getHours();
    const messages = {
      morning: [
        "Ready to make today amazing?",
        "Time to start your day with intention",
        "What will you accomplish today?",
        "Your potential is limitless",
        "Today is your day to shine"
      ],
      afternoon: [
        "How's your day going so far?",
        "Take a moment to check in with yourself",
        "You're doing great, keep going",
        "What's been your highlight today?",
        "Stay focused on your goals"
      ],
      evening: [
        "How did today go for you?",
        "Time to reflect on your day",
        "What are you grateful for today?",
        "You made it through another day",
        "Tomorrow is a new opportunity"
      ]
    };

    let timeOfDay;
    if (hour < 12) timeOfDay = 'morning';
    else if (hour < 17) timeOfDay = 'afternoon';
    else timeOfDay = 'evening';

    const timeMessages = messages[timeOfDay];
    // Use date seed to get consistent message for the day
    const seed = getTodaySeed.split('-').reduce((a, b) => a + parseInt(b), 0);
    return timeMessages[seed % timeMessages.length];
  }, [getTodaySeed]);

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
    
    // Use date seed to get consistent prompt for the day
    const seed = getTodaySeed.split('-').reduce((a, b) => a + parseInt(b), 0);
    return prompts[seed % prompts.length];
  }, [getTodaySeed]);

  const getMotivationalQuote = useMemo(() => {
    const quotes = [
      {
        text: "We are what we repeatedly do. Excellence then, is not an act, but a habit.",
        author: "Aristotle"
      },
      {
        text: "Success is the product of daily habits - not once in a lifetime transformation.",
        author: ""
      },
      {
        text: "If you don't believe in yourself, no one will do it for you.",
        author: ""
      },
      {
        text: "Show up, especially when you don't feel like it.",
        author: ""
      },
      {
        text: "Everyone fails at something. But don't stop trying.",
        author: ""
      },
      {
        text: "You have to believe in the process. You have to believe in yourself.",
        author: ""
      },
      {
        text: "It's hard to beat a person who never gives up.",
        author: "Babe Ruth"
      },
      {
        text: "You owe it to yourself to be the best you can be.",
        author: ""
      },
      {
        text: "You have to go through good times and bad times to get where you're trying to go.",
        author: ""
      }
    ];
    
    // Use date seed to get consistent quote for the day
    const seed = getTodaySeed.split('-').reduce((a, b) => a + parseInt(b), 0);
    return quotes[seed % quotes.length];
  }, [getTodaySeed]);

  // Calculate proper stats from real data
  const stats = useMemo(() => {
    if (!last5JournalEntries || last5JournalEntries.length === 0) {
      return {
        weeklyEntries: 0,
        monthlyEntries: 0,
        totalEntries: 0,
        averagePerWeek: 0
      };
    }

    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    
    const monthAgo = new Date(now);
    monthAgo.setDate(now.getDate() - 30);

    // Calculate weekly entries (last 7 days)
    const weeklyEntries = last5JournalEntries.filter(entry => {
      // Parse the date string from the entry
      const dateMatch = entry.date.match(/(\w+)\s+(\d+),\s+(\d+)/);
      if (!dateMatch) return false;
      
      const [, month, day, year] = dateMatch;
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const entryDate = new Date(parseInt(year), monthIndex, parseInt(day));
      
      return entryDate >= weekAgo;
    }).length;

    // Calculate monthly entries (last 30 days)
    const monthlyEntries = last5JournalEntries.filter(entry => {
      // Parse the date string from the entry
      const dateMatch = entry.date.match(/(\w+)\s+(\d+),\s+(\d+)/);
      if (!dateMatch) return false;
      
      const [, month, day, year] = dateMatch;
      const monthIndex = new Date(`${month} 1, 2000`).getMonth();
      const entryDate = new Date(parseInt(year), monthIndex, parseInt(day));
      
      return entryDate >= monthAgo;
    }).length;

    // Calculate total entries
    const totalEntries = last5JournalEntries.length;

    // Calculate average per week (based on available data)
    const averagePerWeek = totalEntries > 0 ? Math.round((totalEntries / 4) * 10) / 10 : 0;

    return {
      weeklyEntries,
      monthlyEntries,
      totalEntries,
      averagePerWeek
    };
  }, [last5JournalEntries]);

  const quote = getMotivationalQuote;
  const greeting = getGreeting;
  const motivationalMessage = getMotivationalMessage;
  const reflectionPrompt = getReflectionPrompt;

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:py-8 pb-20">
        <div className="space-y-8 sm:space-y-12">
          {/* Welcome Section */}
          <motion.div 
            className="text-center space-y-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.2 
            }}
          >
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.4 
              }}
              className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 drop-shadow-lg"
            >
              {greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.8, 
                ease: [0.25, 0.46, 0.45, 0.94],
                delay: 0.6 
              }}
              className="text-white/80 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed"
            >
              {motivationalMessage}
            </motion.p>
          </motion.div>

          {/* Progress Dashboard */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: [0.25, 0.46, 0.45, 0.94],
              delay: 0.8 
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6"
          >
            {/* Streak Card */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Flame className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                </div>
                <div className="text-cyan-400 text-2xl sm:text-3xl font-bold mb-1">
                  {streak}
                </div>
                <div className="text-slate-300 text-sm font-medium">
                  Day Streak
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  {streak > 0 ? "Keep it going! 🔥" : "Start your streak today!"}
                </div>
              </div>
            </motion.div>

            {/* Weekly Entries */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.2,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Calendar className="w-4 h-4 text-purple-400" />
                  </motion.div>
                </div>
                <div className="text-purple-400 text-2xl sm:text-3xl font-bold mb-1">
                  {stats.weeklyEntries}
                </div>
                <div className="text-slate-300 text-sm font-medium">
                  This Week
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Last 7 days
                </div>
              </div>
            </motion.div>

            {/* Monthly Entries */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.4,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10 text-center">
                <div className="flex items-center justify-center mb-3">
                  <motion.div 
                    className="w-8 h-8 bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  </motion.div>
                </div>
                <div className="text-green-400 text-2xl sm:text-3xl font-bold mb-1">
                  {stats.monthlyEntries}
                </div>
                <div className="text-slate-300 text-sm font-medium">
                  This Month
                </div>
                <div className="text-slate-400 text-xs mt-1">
                  Last 30 days
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Today's Focus Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Reflection Prompt */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.6,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-50">Today's Reflection</h3>
                  <motion.div 
                    className="w-6 h-6 bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sparkles className="w-3 h-3 text-slate-400" />
                  </motion.div>
                </div>
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/30">
                  <p className="text-slate-200 text-sm sm:text-base leading-relaxed">
                    {reflectionPrompt}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Motivational Quote */}
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 1.8,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-50">Daily Motivation</h3>
                  <motion.div 
                    className="w-6 h-6 bg-slate-800/80 rounded-lg flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Target className="w-3 h-3 text-slate-400" />
                  </motion.div>
                </div>
                <div className="bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/30">
                  <blockquote className="text-slate-200 text-sm sm:text-base leading-relaxed italic">
                    "{quote.text}"
                  </blockquote>
                  {quote.author && (
                    <cite className="text-xs text-slate-400 font-medium block mt-2">
                      — {quote.author}
                    </cite>
                  )}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Recent Activity */}
          {last5JournalEntries.length > 0 && (
            <motion.div 
              className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6 relative overflow-hidden group"
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: 2.0,
                ease: [0.25, 0.46, 0.45, 0.94]
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base sm:text-lg font-semibold text-slate-50">Recent Reflections</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Clock className="w-3 h-3" />
                    <span>Latest activity</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {last5JournalEntries.slice(0, 3).map((entry, index) => (
                    <motion.div 
                      key={index} 
                      className="group/entry bg-slate-800/60 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-slate-700/30 hover:bg-slate-800/80 transition-all duration-300"
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <p className="text-slate-200 text-sm leading-relaxed line-clamp-3 group-hover/entry:text-slate-100 transition-colors">
                        {entry.input}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-400">
                          {entry.date}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <p className="text-slate-400 text-sm">
                    Continue your reflection journey below ↓
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
});

HomeTab.displayName = 'HomeTab';

export default HomeTab; 
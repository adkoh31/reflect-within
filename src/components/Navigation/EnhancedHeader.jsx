import React from 'react';
import { motion } from 'framer-motion';
import { MyraLogo } from '../ui/MyraLogo.jsx';

const EnhancedHeader = ({ 
  user, 
  onProfileClick, 
  onSaveChat, 
  onClearChat, 
  messages, 
  streak = 0,
  showProfile = false,
  onTestPanelToggle = null
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const getUserInitials = (name) => {
    if (!name) return "?";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <motion.header 
      className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-700/50 px-4 py-3"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <MyraLogo size="sm" animated={false} />
            {user && (
              <div className="flex items-center space-x-2">
                <p className="text-sm text-slate-300">
                  {getGreeting()}, {user.name?.split(' ')[0] || 'there'}!
                </p>
                {streak > 0 && (
                  <motion.div 
                    className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                                          <span className="font-semibold">{streak} day{streak !== 1 ? 's' : ''} streak</span>
                  </motion.div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {messages.length > 0 && (
            <>
                              <motion.button
                onClick={onSaveChat}
                className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Save chat"
                title="Save chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
              </motion.button>
              
              <motion.button
                onClick={onClearChat}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800/50 rounded-lg transition-all duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Clear chat"
                title="Clear chat"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </motion.button>
            </>
          )}
          
          {/* Test Panel Toggle */}
          {onTestPanelToggle && (
            <motion.button
              onClick={onTestPanelToggle}
              className="p-2 text-slate-400 hover:text-slate-300 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              aria-label="Toggle Test Panel"
              title="Toggle Test Panel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </motion.button>
          )}

          {/* User Avatar - Always show */}
          <motion.button
            onClick={onProfileClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 border-2 ${
              showProfile 
                ? 'bg-cyan-100 text-cyan-700 border-cyan-300 shadow-md' 
                : user
                ? 'bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 hover:border-slate-500 hover:shadow-md'
                : 'bg-red-900/20 text-red-400 border-red-700/30 hover:bg-red-800/30 hover:border-red-600/50 hover:shadow-md'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="User profile"
            title={user ? "User profile" : "Login/Profile"}
          >
            {user?.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full rounded-full object-cover"
              />
            ) : user ? (
              getUserInitials(user.name)
            ) : (
              "👤"
            )}
          </motion.button>
        </div>
      </div>
    </motion.header>
  );
};

export default EnhancedHeader; 
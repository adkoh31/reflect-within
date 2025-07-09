import React from 'react';
import { motion } from 'framer-motion';

const EnhancedHeader = ({ 
  user, 
  onProfileClick, 
  onSaveChat, 
  onClearChat, 
  messages, 
  streak = 0,
  showProfile = false 
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
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-3"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-3">
          <div className="flex flex-col">
            <h1 className="text-base font-semibold text-gray-900 leading-tight">ReflectWithin</h1>
            {user && (
              <div className="flex items-center space-x-2">
                <p className="text-sm text-gray-600">
                  {getGreeting()}, {user.name?.split(' ')[0] || 'there'}!
                </p>
                {streak > 0 && (
                  <motion.div 
                    className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-semibold"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    <span>🔥</span>
                    <span>{streak}</span>
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
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
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
                className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
          
          {/* User Avatar - Always show */}
          <motion.button
            onClick={onProfileClick}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 border-2 ${
              showProfile 
                ? 'bg-blue-100 text-blue-700 border-blue-300 shadow-md' 
                : user
                ? 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:border-gray-300 hover:shadow-md'
                : 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200 hover:border-red-300 hover:shadow-md'
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
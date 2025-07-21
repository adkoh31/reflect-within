import React from 'react';
import { motion } from 'framer-motion';
import { getRelativeDate, safeCreateDate } from '../../utils/dateUtils';

const RecentEntries = ({ entries = [], onEntryClick }) => {
  const formatDate = (dateInput) => {
    return getRelativeDate(dateInput);
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
        <h3 className="text-lg font-light text-slate-50 mb-4">Recent Entries</h3>
        <div className="text-center py-8">
          <div className="text-slate-400 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-400 text-sm font-light">
            No entries yet. Start writing to see your reflections here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
      <h3 className="text-lg font-light text-slate-50 mb-4">Recent Entries</h3>
      <div className="max-h-64 overflow-y-auto space-y-3 pr-2 pb-2 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
        {entries.slice(0, 10).map((entry, index) => (
          <motion.button
            key={entry.date}
            onClick={() => {
              const safeDate = safeCreateDate(entry.date);
              if (safeDate) {
                onEntryClick(safeDate);
              }
            }}
            className="w-full text-left p-3 bg-slate-800/50 hover:bg-slate-700/50 rounded-xl transition-colors duration-200 border border-slate-700/50"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {entry.topics && entry.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-1">
                    {entry.topics.map((topic, index) => (
                      <span 
                        key={index}
                        className="text-xs text-slate-50 font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-slate-50 font-light leading-relaxed">
                  {truncateText(entry.content)}
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="text-xs text-slate-400 font-light">
                  {formatDate(entry.date)}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {entries.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400 font-light">
            And {entries.length - 10} more entries...
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentEntries; 
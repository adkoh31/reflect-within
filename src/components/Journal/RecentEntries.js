import React from 'react';
import { motion } from 'framer-motion';

const RecentEntries = ({ entries = [], onEntryClick }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (entries.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-border p-6">
        <h3 className="text-lg font-light text-foreground mb-4">Recent Entries</h3>
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-muted-foreground text-sm font-light">
            No entries yet. Start writing to see your reflections here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      <h3 className="text-lg font-light text-foreground mb-4">Recent Entries</h3>
      <div className="max-h-64 overflow-y-auto space-y-3 pr-2 pb-2 scrollbar-thin scrollbar-thumb-muted-foreground scrollbar-track-transparent">
        {entries.slice(0, 10).map((entry, index) => (
          <motion.button
            key={entry.date}
            onClick={() => onEntryClick(new Date(entry.date))}
            className="w-full text-left p-3 bg-muted hover:bg-accent rounded-xl transition-colors duration-200 border border-border"
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
                        className="text-xs text-accent-foreground font-medium"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-sm text-foreground font-light leading-relaxed">
                  {truncateText(entry.content)}
                </p>
              </div>
              <div className="ml-3 flex-shrink-0">
                <span className="text-xs text-muted-foreground font-light">
                  {formatDate(entry.date)}
                </span>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
      
      {entries.length > 10 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-muted-foreground font-light">
            And {entries.length - 10} more entries...
          </p>
        </div>
      )}
    </div>
  );
};

export default RecentEntries; 
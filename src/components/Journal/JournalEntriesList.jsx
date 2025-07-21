import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Trash2 } from 'lucide-react';
import { safeFormatTime, safeFormatDate, isToday } from '../../utils/dateUtils';

const JournalEntriesList = ({ 
  selectedDate, 
  entries = [], 
  onAddEntry,
  onEditEntry,
  onDeleteEntry,
  onSpeechToggle,
  isListening,
  browserSupportsSpeechRecognition,
  transcript
}) => {
  const formatTime = (timestamp) => {
    return safeFormatTime(timestamp, { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return safeFormatDate(date, { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isTodayDate = (date) => {
    return isToday(date);
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-light text-slate-50">
            {isTodayDate(selectedDate) ? "Today's Entries" : formatDate(selectedDate)}
          </h3>
          <p className="text-sm text-slate-400 font-light">
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-slate-50 text-lg font-light mb-2">No entries for this date</p>
          <p className="text-slate-400 text-sm font-light">
            Use the "Add Entry" button above to create your first entry
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {entry.topics && entry.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.topics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-slate-800/50 text-slate-50 text-xs rounded-lg font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-slate-400 font-light">
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-1 text-slate-400 hover:text-slate-50 transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Entry Content */}
              <div className="text-sm text-slate-50 font-light leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JournalEntriesList; 
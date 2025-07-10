import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit3, Trash2 } from 'lucide-react';

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
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <div className="bg-card rounded-2xl border border-border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-light text-foreground">
            {isToday(selectedDate) ? "Today's Entries" : formatDate(selectedDate)}
          </h3>
          <p className="text-sm text-muted-foreground font-light">
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
          </p>
        </div>
        <button
          onClick={onAddEntry}
          className="flex items-center space-x-2 px-4 py-2 bg-foreground text-background rounded-xl hover:bg-muted-foreground font-light transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Entry</span>
        </button>
      </div>

      {/* Entries List */}
      {entries.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-foreground text-lg font-light mb-2">No entries for this date</p>
          <p className="text-muted-foreground text-sm font-light mb-4">
            Start writing to create your first entry
          </p>
          <button
            onClick={onAddEntry}
            className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-muted-foreground font-light transition-colors"
          >
            Write Entry
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-muted rounded-xl p-4 border border-border"
            >
              {/* Entry Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  {entry.topics && entry.topics.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {entry.topics.map((topic, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-accent/20 text-accent-foreground text-xs rounded-lg font-medium"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground font-light">
                    {formatTime(entry.createdAt)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onEditEntry(entry)}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                    title="Edit entry"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteEntry(entry.id)}
                    className="p-1 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Delete entry"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {/* Entry Content */}
              <div className="text-sm text-foreground font-light leading-relaxed whitespace-pre-wrap">
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
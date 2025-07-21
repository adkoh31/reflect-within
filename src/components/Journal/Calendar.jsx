import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, MessageSquare, TrendingUp } from 'lucide-react';

const Calendar = ({ 
  currentDate, 
  onDateSelect, 
  entriesByDate = {},
  onMonthChange,
  selectedDate,
  entries = {} // Add entries prop for preview data
}) => {
  const [hoveredDay, setHoveredDay] = useState(null);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const getNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const isToday = (day) => {
    const today = new Date();
    return currentDate.getFullYear() === today.getFullYear() &&
           currentDate.getMonth() === today.getMonth() &&
           day === today.getDate();
  };

  const hasEntry = (day) => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return entriesByDate[dateKey] && entriesByDate[dateKey].length > 0;
  };

  const getEntryCount = (day) => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    return entriesByDate[dateKey] ? entriesByDate[dateKey].length : 0;
  };

  const getEntriesForDay = (day) => {
    const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
    if (!entriesByDate[dateKey]) return [];
    
    // Find actual entries for this date
    const dayEntries = Object.values(entries).filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.toISOString().split('T')[0] === dateKey;
    });
    
    return dayEntries.slice(0, 3); // Limit to 3 for preview
  };

  const handleDayHover = (day, event) => {
    if (hasEntry(day)) {
      const rect = event.currentTarget.getBoundingClientRect();
      setPreviewPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      });
      setHoveredDay(day);
    }
  };

  const handleDayLeave = () => {
    setHoveredDay(null);
  };

  const formatEntryPreview = (content) => {
    // Strip HTML tags and limit length
    const textContent = content.replace(/<[^>]*>/g, ' ').trim();
    return textContent.length > 100 ? textContent.substring(0, 100) + '...' : textContent;
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full relative">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.button
          onClick={getPreviousMonth}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              getPreviousMonth();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Go to previous month"
          className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors text-slate-300 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </motion.button>
        <h3 className="text-lg font-semibold text-slate-50">
          {getMonthName(currentDate)}
        </h3>
        <motion.button
          onClick={getNextMonth}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              getNextMonth();
            }
          }}
          tabIndex={0}
          role="button"
          aria-label="Go to next month"
          className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors text-slate-300 hover:text-slate-100 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-xs text-slate-400 font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="h-10"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const hasEntryOnDay = hasEntry(day);
          const entryCount = getEntryCount(day);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate &&
            selectedDate.getFullYear() === currentDate.getFullYear() &&
            selectedDate.getMonth() === currentDate.getMonth() &&
            selectedDate.getDate() === day;
          return (
            <motion.button
              key={day}
              onClick={() => onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDateSelect(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
                }
              }}
              onMouseEnter={(e) => handleDayHover(day, e)}
              onMouseLeave={handleDayLeave}
              tabIndex={0}
              role="button"
              aria-label={`${day} ${getMonthName(currentDate)}${hasEntryOnDay ? ` - ${entryCount} entries` : ''}${isTodayDate ? ' - Today' : ''}`}
              className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 relative group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50 ${
                isSelected
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-300'
                  : isTodayDate
                  ? 'bg-slate-600/80 text-slate-200 border border-slate-500/50'
                  : hasEntryOnDay
                  ? 'bg-slate-700/80 text-slate-200 hover:bg-slate-600/80 border border-slate-600/50'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-slate-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {day}
              {hasEntryOnDay && !isTodayDate && !isSelected && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"></div>
              )}
              {entryCount > 1 && !isSelected && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-slate-900 text-xs rounded-full flex items-center justify-center font-bold">
                  {entryCount}
                </div>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Entry Preview Cards */}
      <AnimatePresence>
        {hoveredDay && hasEntry(hoveredDay) && (
          <motion.div
            className="absolute z-50 pointer-events-none"
            style={{
              left: previewPosition.x,
              top: previewPosition.y,
              transform: 'translateX(-50%) translateY(-100%)'
            }}
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-xl border border-slate-700/50 p-4 shadow-2xl shadow-black/50 max-w-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm font-semibold text-slate-50">
                    {new Date(currentDate.getFullYear(), currentDate.getMonth(), hoveredDay).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-slate-400" />
                  <span className="text-xs text-slate-400">{getEntryCount(hoveredDay)} entries</span>
                </div>
              </div>
              
              <div className="space-y-3">
                {getEntriesForDay(hoveredDay).map((entry, index) => (
                  <div key={index} className="bg-slate-800/60 rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-slate-400" />
                        <span className="text-xs text-slate-400">
                          {new Date(entry.createdAt || entry.date).toLocaleTimeString('en-US', { 
                            hour: 'numeric', 
                            minute: '2-digit',
                            hour12: true 
                          })}
                        </span>
                      </div>
                      {entry.wordCount && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3 text-slate-400" />
                          <span className="text-xs text-slate-400">{entry.wordCount} words</span>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {formatEntryPreview(entry.content)}
                    </p>
                    {entry.mood && (
                      <div className="mt-2">
                        <span className="inline-block px-2 py-1 bg-slate-700/80 text-slate-300 rounded-full text-xs">
                          {entry.mood}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-3 pt-3 border-t border-slate-700/30">
                <p className="text-xs text-slate-400 text-center">
                  Click to view full entries
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Calendar; 
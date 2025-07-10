import React from 'react';
import { motion } from 'framer-motion';

const Calendar = ({ 
  currentDate, 
  onDateSelect, 
  entriesByDate = {},
  onMonthChange,
  selectedDate
}) => {
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

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={getPreviousMonth}
          className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors text-slate-300 hover:text-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-slate-50">
          {getMonthName(currentDate)}
        </h3>
        <button
          onClick={getNextMonth}
          className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors text-slate-300 hover:text-slate-100"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
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
              className={`h-10 rounded-lg text-sm font-medium transition-all duration-200 relative ${
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
    </div>
  );
};

export default Calendar; 
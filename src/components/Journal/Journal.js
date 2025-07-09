import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Edit3, Calendar, BookOpen, PenTool, Sparkles, Target, Heart, Zap, Star } from 'lucide-react';
import CalendarComponent from './Calendar';
import JournalEntry from './JournalEntry';
import JournalEntriesList from './JournalEntriesList';
import AIJournalAssistant from './AIJournalAssistant';
import RecentEntries from './RecentEntries';
import { useJournalEntries } from '../../hooks/useJournalEntries';

const Journal = ({
  onSpeechToggle,
  isListening,
  browserSupportsSpeechRecognition,
  transcript,
  microphoneStatus
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' or 'ai'
  const [editingEntry, setEditingEntry] = useState(null); // Track which entry is being edited
  
  const {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getRecentEntries
  } = useJournalEntries();

  // Get entries for current month for calendar
  const getEntriesForMonth = () => {
    const monthEntries = {};
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    Object.entries(entries).forEach(([id, entry]) => {
      const entryDate = new Date(entry.date);
      if (entryDate.getFullYear() === year && entryDate.getMonth() === month) {
        if (!monthEntries[entry.date]) {
          monthEntries[entry.date] = [];
        }
        monthEntries[entry.date].push({ id, ...entry });
      }
    });
    
    return monthEntries;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  const handleSaveEntry = async (date, content, topic = '') => {
    const success = await saveEntry(date, content, topic);
    if (success) {
      // Entry saved successfully - don't reset mode, let the component handle it
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const success = await deleteEntry(entryId);
    if (success) {
      // Entry deleted successfully
      setEntryMode('manual'); // Reset to manual mode when entry is deleted
    }
  };

  const handleRecentEntryClick = (date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
  };

  const handleCancelAI = () => {
    setEntryMode('manual');
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setEntryMode('manual');
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryMode('manual');
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);

  // Only show mode selection if there are no entries for the selected date
  const shouldShowModeSelection = selectedDateEntries.length === 0;

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-6 pb-20">
        {/* Header with Glow */}
        <motion.div 
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Header Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/25">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-50">Your Private Journal</h2>
                  <p className="text-slate-300 text-sm mt-1">
                    Write your private thoughts and reflections
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-600/50">
                  <PenTool className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300 font-medium">
                    {Object.keys(entries).length} entries
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Calendar with Glow */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Calendar Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Calendar Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Calendar className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-slate-50">Select Date</h3>
            </div>
            <CalendarComponent
              currentDate={currentMonth}
              onDateSelect={handleDateSelect}
              entriesByDate={getEntriesForMonth()}
              onMonthChange={handleMonthChange}
            />
          </div>
        </motion.div>

        {/* Entry Mode Selection with Icons */}
        {shouldShowModeSelection && (
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Mode Selection Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Mode Selection Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
              <div className="flex items-center space-x-3 mb-6">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-slate-50">Create New Entry</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={() => setEntryMode('ai')}
                  className="group flex items-center space-x-4 p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-cyan-500/30 text-left"
                >
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Bot className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-50 mb-2">AI Journal Assistant</h4>
                    <p className="text-sm text-slate-300">Tell me about your day and I'll create a structured entry</p>
                  </div>
                  <Zap className="w-4 h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
                
                <button
                  onClick={() => setEntryMode('manual')}
                  className="group flex items-center space-x-4 p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-cyan-500/30 text-left"
                >
                  <div className="p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Edit3 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-50 mb-2">Manual Entry</h4>
                    <p className="text-sm text-slate-300">Write your entry directly in the text area</p>
                  </div>
                  <PenTool className="w-4 h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode Switch for Existing Entries */}
        {selectedDateEntries.length > 0 && (
          <motion.div
            className="relative mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Mode Switch Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Mode Switch Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-slate-300 font-medium">Entry Mode:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEntryMode('manual')}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                      entryMode === 'manual' 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <PenTool className="w-4 h-4" />
                    <span>Manual</span>
                  </button>
                  <button
                    onClick={() => setEntryMode('ai')}
                    className={`flex items-center space-x-2 px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                      entryMode === 'ai' 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <Bot className="w-4 h-4" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Journal Entry or AI Assistant */}
        <motion.div
          className="relative mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Entry Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Entry Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
            {entryMode === 'ai' ? (
              <AIJournalAssistant
                onSaveEntry={handleSaveEntry}
                onCancel={handleCancelAI}
                onSpeechToggle={onSpeechToggle}
                isListening={isListening}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
                last5JournalEntries={getRecentEntries.slice(0, 5)}
              />
            ) : selectedDateEntries.length > 1 ? (
              <JournalEntriesList
                selectedDate={selectedDate}
                entries={selectedDateEntries}
                onAddEntry={handleAddEntry}
                onEditEntry={handleEditEntry}
                onDeleteEntry={handleDeleteEntry}
                onSpeechToggle={onSpeechToggle}
                isListening={isListening}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
              />
            ) : (
              <JournalEntry
                selectedDate={selectedDate}
                entry={editingEntry || selectedDateEntries[0] || null}
                onSave={handleSaveEntry}
                onDelete={handleDeleteEntry}
                isLoading={isLoading}
                onSpeechToggle={onSpeechToggle}
                isListening={isListening}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
                microphoneStatus={microphoneStatus}
              />
            )}
          </div>
        </motion.div>

        {/* Recent Entries with Glow */}
        <motion.div
          className="relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {/* Recent Entries Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Recent Entries Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Star className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-semibold text-slate-50">Recent Entries</h3>
            </div>
            <RecentEntries
              entries={getRecentEntries}
              onEntryClick={handleRecentEntryClick}
            />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Journal; 
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Calendar, 
  Bot,
  Edit3,
  PenTool,
  Target,
  Star,
  Zap
} from 'lucide-react';
import JournalEntry from './JournalEntry';
import JournalSearch from './JournalSearch';
import CalendarComponent from './Calendar';
import AIJournalAssistant from './AIJournalAssistant';
import JournalEntriesList from './JournalEntriesList';
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
  const [showSearch, setShowSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  
  const {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getRecentEntries,
    getStats
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
    setIsSearchMode(false); // Exit search mode when selecting a date
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  const handleSaveEntry = async (date, content, topics = [], options = {}) => {
    const result = await saveEntry(date, content, topics, options);
    if (result.success) {
      // Entry saved successfully - don't reset mode, let the component handle it
    }
  };

  const handleDeleteEntry = async (entryId) => {
    const result = await deleteEntry(entryId);
    if (result.success) {
      // Entry deleted successfully
      setEntryMode('manual'); // Reset to manual mode when entry is deleted
    }
  };

  const handleRecentEntryClick = (date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    setIsSearchMode(false);
  };

  const handleCancelAI = () => {
    setEntryMode('manual');
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setEntryMode('manual');
    setIsSearchMode(false);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryMode('manual');
    setIsSearchMode(false);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
    setIsSearchMode(true);
  };

  const handleSearchClose = () => {
    setShowSearch(false);
    setIsSearchMode(false);
  };

  const selectedDateEntries = getEntriesForDate(selectedDate);

  // Only show mode selection if there are no entries for the selected date
  const shouldShowModeSelection = selectedDateEntries.length === 0 && !isSearchMode;

  // Get current entries to display (either date-specific or search results)
  const currentEntries = isSearchMode ? searchResults : selectedDateEntries;

  return (
    <div className="bg-slate-950 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 py-4 sm:py-6 pb-20">
        {/* Header */}
        <motion.div 
          className="relative mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Header Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-50">Your Private Journal</h1>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowSearch(true)}
                  className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-600/50"
                  title="Search entries"
                >
                  <Search className="w-4 h-4 text-slate-300" />
                </button>
                {isSearchMode && (
                  <button
                    onClick={() => setIsSearchMode(false)}
                    className="px-3 py-2 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors border border-slate-600/50"
                  >
                    Exit Search
                  </button>
                )}
              </div>
            </div>
            <p className="text-slate-300 text-sm sm:text-base">
              Reflect on your fitness journey, track your progress, and capture your thoughts
            </p>
            
            {/* Stats Summary */}
            {!isSearchMode && (
              <div className="mt-3 flex flex-wrap gap-3 text-xs text-slate-400">
                <span>📝 {getStats.totalEntries} entries</span>
                <span>📊 {getStats.totalWords} words</span>
                <span>📎 {getStats.totalAttachments} attachments</span>
                <span>🏷️ {getStats.uniqueTopics.length} topics</span>
              </div>
            )}
          </div>
        </motion.div>

        {/* Search Results Header */}
        {isSearchMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-4 sm:mb-6"
          >
            <div className="absolute -inset-4 rounded-2xl bg-blue-500/20 blur-xl opacity-50"></div>
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Search className="w-5 h-5 text-blue-400" />
                  <h2 className="text-lg font-semibold text-slate-50">Search Results</h2>
                </div>
                <span className="text-sm text-slate-400">
                  {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'} found
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Calendar with Glow - Hide when in search mode */}
        {!isSearchMode && (
          <motion.div 
            className="relative mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Calendar Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Calendar Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-50">Select Date</h3>
              </div>
              <CalendarComponent
                currentDate={currentMonth}
                onDateSelect={handleDateSelect}
                entriesByDate={getEntriesForMonth()}
                onMonthChange={handleMonthChange}
                selectedDate={selectedDate}
              />
            </div>
          </motion.div>
        )}

        {/* Entry Mode Selection with Icons - Only show when not in search mode and no entries */}
        {shouldShowModeSelection && (
          <motion.div
            className="relative mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Mode Selection Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Mode Selection Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-slate-50">Create New Entry</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <button
                  onClick={() => setEntryMode('ai')}
                  className="group flex items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-cyan-500/30 text-left min-h-[44px]"
                >
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-50 mb-1 sm:mb-2 text-sm sm:text-base">AI Journal Assistant</h4>
                    <p className="text-xs sm:text-sm text-slate-300">Tell me about your day and I'll create a structured entry</p>
                  </div>
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
                
                <button
                  onClick={() => setEntryMode('manual')}
                  className="group flex items-center space-x-3 sm:space-x-4 p-4 sm:p-6 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-600/50 hover:border-cyan-500/30 text-left min-h-[44px]"
                >
                  <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl group-hover:scale-110 transition-transform duration-200">
                    <Edit3 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-50 mb-1 sm:mb-2 text-sm sm:text-base">Manual Entry</h4>
                    <p className="text-xs sm:text-sm text-slate-300">Write your entry directly in the text area</p>
                  </div>
                  <PenTool className="w-3 h-3 sm:w-4 sm:h-4 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Mode Switch for Existing Entries - Only show when not in search mode */}
        {!isSearchMode && selectedDateEntries.length > 0 && (
          <motion.div
            className="relative mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            {/* Mode Switch Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Mode Switch Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 sm:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm text-slate-300 font-medium">Entry Mode:</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEntryMode('manual')}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium min-h-[44px] ${
                      entryMode === 'manual' 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <PenTool className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Manual</span>
                  </button>
                  <button
                    onClick={() => setEntryMode('ai')}
                    className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium min-h-[44px] ${
                      entryMode === 'ai' 
                        ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <Bot className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>AI Assistant</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Journal Entry or AI Assistant or Search Results */}
        <motion.div
          className="relative mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Entry Glow Effect */}
          <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
          
          {/* Entry Content */}
          <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
            {isSearchMode ? (
              /* Search Results Display */
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">No entries found</h3>
                    <p className="text-slate-400">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {searchResults.map((entry) => (
                      <div
                        key={entry.id}
                        className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedDate(new Date(entry.date));
                          setCurrentMonth(new Date(entry.date));
                          setIsSearchMode(false);
                        }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-300">
                              {new Date(entry.date).toLocaleDateString()}
                            </span>
                            {entry.mood && (
                              <span className="text-lg">{entry.mood === 'happy' ? '😊' : entry.mood === 'excited' ? '🤩' : '😐'}</span>
                            )}
                          </div>
                          <span className="text-xs text-slate-500">
                            {entry.wordCount} words
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 line-clamp-3">
                          {entry.content.substring(0, 200)}...
                        </p>
                        {entry.topics && entry.topics.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {entry.topics.slice(0, 3).map((topic, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs"
                              >
                                {topic}
                              </span>
                            ))}
                            {entry.topics.length > 3 && (
                              <span className="px-2 py-1 bg-slate-700/80 text-slate-400 rounded-full text-xs">
                                +{entry.topics.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : entryMode === 'ai' ? (
              <AIJournalAssistant
                onSaveEntry={handleSaveEntry}
                onCancel={handleCancelAI}
                onSpeechToggle={onSpeechToggle}
                isListening={isListening}
                browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                transcript={transcript}
                last5JournalEntries={getRecentEntries.slice(0, 5)}
              />
            ) : currentEntries.length > 1 ? (
              <JournalEntriesList
                selectedDate={selectedDate}
                entries={currentEntries}
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
                entry={editingEntry || currentEntries[0] || null}
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

        {/* Recent Entries with Glow - Only show when not in search mode */}
        {!isSearchMode && (
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {/* Recent Entries Glow Effect */}
            <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
            
            {/* Recent Entries Content */}
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
              <div className="flex items-center space-x-3 mb-3 sm:mb-4">
                <Star className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                <h3 className="text-base sm:text-lg font-semibold text-slate-50">Recent Entries</h3>
              </div>
              <RecentEntries
                entries={getRecentEntries}
                onEntryClick={handleRecentEntryClick}
              />
            </div>
          </motion.div>
        )}
      </div>

      {/* Search Modal */}
      {showSearch && (
        <JournalSearch
          entries={entries}
          onSearchResults={handleSearchResults}
          onClose={handleSearchClose}
        />
      )}
    </div>
  );
};

export default Journal; 
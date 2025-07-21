import React, { useState, Suspense, lazy, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Bot, 
  PenTool, 
  Target, 
  Star, 
  Calendar,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  TrendingUp,
  Sparkles,
  Zap,
  BookOpen,
  CalendarDays
} from 'lucide-react';
import { ComponentErrorBoundary } from '../ui/ComponentErrorBoundary.jsx';
import CalendarComponent from './Calendar';
import JournalEntriesList from './JournalEntriesList';
import RecentEntries from './RecentEntries';
import DataManagementModal from '../DataManagement/DataManagementModal';
import { useJournalEntries } from '../../hooks/useJournalEntries';
import { SwipeableCard } from '../ui/gesture-feedback';
import { safeCreateDate, safeGetDateKey, safeFormatDate } from '../../utils/dateUtils';
import { JournalSkeleton } from '../ui/loading-states';
import { LoadingButton } from '../ui/LoadingButton.jsx';
import { MyraLogo } from '../ui/MyraLogo.jsx';

// Lazy load heavy components
const JournalSearch = lazy(() => import('./JournalSearch'));
const JournalEntry = lazy(() => import('./JournalEntry'));
const AIJournalAssistant = lazy(() => import('./AIJournalAssistant'));

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-2">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      <span className="text-sm text-slate-400">Loading editor...</span>
    </div>
  </div>
);

const Journal = ({
  onSpeechToggle,
  isListening,
  browserSupportsSpeechRecognition,
  transcript,
  microphoneStatus,
  isPremium = false,
  user = null,
  messages = [] // Add messages prop for chat export
}) => {
  // State management
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [entryMode, setEntryMode] = useState('manual'); // 'manual' or 'ai'
  const [showAddEntryMode, setShowAddEntryMode] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Use the journal entries hook
  const {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getRecentEntries,
    getStats
  } = useJournalEntries(isPremium, user);

  // Get entries for the current month (for calendar)
  const getEntriesForMonth = () => {
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    
    const monthEntries = {};
    Object.values(entries).forEach(entry => {
      const entryDate = safeCreateDate(entry.date);
      if (entryDate && entryDate >= monthStart && entryDate <= monthEnd) {
        const dateKey = safeGetDateKey(entryDate);
        if (dateKey) {
          monthEntries[dateKey] = (monthEntries[dateKey] || 0) + 1;
        }
      }
    });
    
    return monthEntries;
  };

  // Smart date navigation functions
  const navigateToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  const navigateToYesterday = () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    setSelectedDate(yesterday);
    setCurrentMonth(yesterday);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  const navigateToThisWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek);
    setSelectedDate(startOfWeek);
    setCurrentMonth(startOfWeek);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  const navigateToLastWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const startOfLastWeek = new Date(today);
    startOfLastWeek.setDate(today.getDate() - dayOfWeek - 7);
    setSelectedDate(startOfLastWeek);
    setCurrentMonth(startOfLastWeek);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  // Calculate progress stats
  const getProgressStats = () => {
    const stats = getStats;
    const totalEntries = stats.totalEntries || 0;
    const totalWords = stats.totalWords || 0;
    const uniqueTopics = stats.uniqueTopics?.length || 0;
    
    // Calculate weekly progress
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyEntries = Object.values(entries).filter(entry => {
      const entryDate = safeCreateDate(entry.date);
      return entryDate && entryDate >= weekAgo;
    }).length;

    // Calculate monthly progress
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthlyEntries = Object.values(entries).filter(entry => {
      const entryDate = safeCreateDate(entry.date);
      return entryDate && entryDate >= monthAgo;
    }).length;

    return {
      totalEntries,
      totalWords,
      uniqueTopics,
      weeklyEntries,
      monthlyEntries,
      averageWordsPerEntry: totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0
    };
  };

  // Event handlers
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  const handleMonthChange = (date) => {
    setCurrentMonth(date);
  };

  const handleSaveEntry = async (date, content, topics = [], options = {}) => {
    try {
      setErrorMessage('');
      const result = await saveEntry(date, content, topics, options);
      if (result.success) {
        setShowAddEntryMode(false);
        setEntryMode('manual');
        setEditingEntry(null);
        console.log('✅ Entry saved successfully');
      } else {
        setErrorMessage(result.error || 'Failed to save entry.');
        console.error('❌ Failed to save entry:', result.error);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save entry.');
      console.error('❌ Error saving entry:', err);
    }
  };

  const handleDeleteEntry = async (entryId) => {
    try {
      setErrorMessage('');
      const result = await deleteEntry(entryId);
      if (result.success) {
        setEntryMode('manual');
        setEditingEntry(null);
        console.log('✅ Entry deleted successfully');
      } else {
        setErrorMessage(result.error || 'Failed to delete entry.');
        console.error('❌ Failed to delete entry:', result.error);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to delete entry.');
      console.error('❌ Error deleting entry:', err);
    }
  };

  const handleRecentEntryClick = (date) => {
    setSelectedDate(date);
    setCurrentMonth(date);
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    setEditingEntry(null);
  };

  const handleCancelAI = () => {
    setEntryMode('manual');
    setShowAddEntryMode(false);
  };

  const handleAddEntry = () => {
    setEditingEntry(null);
    setShowAddEntryMode(true);
    setEntryMode('manual'); // Set default mode to manual
    setIsSearchMode(false);
    console.log('➕ Add entry clicked');
  };

  const handleSmartAddEntry = () => {
    // Always show mode selection when adding an entry
    setEditingEntry(null);
    setShowAddEntryMode(true);
    setEntryMode('manual'); // Default to manual
    setIsSearchMode(false);
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setEntryMode('manual');
    setIsSearchMode(false);
    setShowAddEntryMode(false);
    console.log('✏️ Edit entry clicked:', entry.id);
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
  const progressStats = getProgressStats();

  // Show mode selection when user clicks "Add Entry" (for new entries) or when adding to existing entries
  const shouldShowModeSelection = showAddEntryMode;

  // Get current entries to display (either date-specific or search results)
  const currentEntries = isSearchMode ? searchResults : selectedDateEntries;

  if (isLoading) {
    return (
      <div aria-busy="true" data-testid="journal-skeleton">
        <JournalSkeleton />
      </div>
    );
  }

  return (
    <ComponentErrorBoundary>
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
            <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6" data-testid="journal-header">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="flex items-center space-x-3">
                  <MyraLogo size="md" animated={false} />
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-50">Your Private Journal</h1>
                  {isPremium && (
                    <span data-testid="premium-indicator" className="px-2 py-1 bg-cyan-500 text-slate-900 text-xs rounded-full font-medium">
                      Premium
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <LoadingButton
                    onClick={handleSmartAddEntry}
                    loading={isLoading}
                    loadingText="Loading..."
                    variant="primary"
                    size="medium"
                    className="flex items-center gap-2"
                    data-testid="add-entry-button"
                  >
                    <Plus className="w-4 h-4" />
                    Add Entry
                  </LoadingButton>
                  <button
                    onClick={() => setShowDataManagement(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowDataManagement(true);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Open data management"
                    className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                    title="Data management"
                    data-testid="data-management-button"
                  >
                    <Settings className="w-4 h-4 text-slate-300" />
                  </button>
                  <button
                    onClick={() => setShowSearch(true)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setShowSearch(true);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Search journal entries"
                    className="p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-colors border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                    title="Search entries"
                    data-testid="search-button"
                  >
                    <Search className="w-4 h-4 text-slate-300" />
                  </button>
                  {isSearchMode && (
                    <button
                      onClick={() => setIsSearchMode(false)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setIsSearchMode(false);
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Exit search mode"
                      className="px-3 py-2 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors border border-slate-600/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                    >
                      Exit Search
                    </button>
                  )}
                </div>
              </div>
              <p className="text-slate-300 text-sm sm:text-base">
                Reflect on your fitness journey, track your progress, and capture your thoughts
              </p>
              {/* Error Message */}
              {errorMessage && (
                <div data-testid="journal-error" className="mt-3 p-2 bg-red-500/10 text-red-500 rounded">
                  {errorMessage}
                </div>
              )}
              
              {/* Enhanced Stats Summary */}
              {!isSearchMode && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className="w-3 h-3 text-cyan-400" />
                      <span className="text-xs text-slate-400">Entries</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{progressStats.totalEntries}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <TrendingUp className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-slate-400">Words</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{progressStats.totalWords.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-3 h-3 text-green-400" />
                      <span className="text-xs text-slate-400">Topics</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{progressStats.uniqueTopics}</div>
                  </div>
                  <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-3 h-3 text-yellow-400" />
                      <span className="text-xs text-slate-400">Avg/Entry</span>
                    </div>
                    <div className="text-lg font-bold text-slate-50">{progressStats.averageWordsPerEntry}</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Smart Date Navigation Bar */}
          {!isSearchMode && (
            <motion.div
              className="relative mb-4 sm:mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {/* Navigation Glow Effect */}
              <div className="absolute -inset-4 rounded-2xl bg-purple-500/10 blur-xl opacity-50"></div>
              
              {/* Navigation Content */}
              <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-3 sm:p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm sm:text-base font-semibold text-slate-50 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-purple-400" />
                    Quick Navigation
                  </h3>
                  <div className="text-xs text-slate-400">
                    {safeFormatDate(selectedDate)}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <motion.button
                    onClick={navigateToToday}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Clock className="w-3 h-3 text-cyan-400 group-hover:text-cyan-300" />
                    <span className="text-xs text-slate-300 group-hover:text-slate-200">Today</span>
                  </motion.button>
                  <motion.button
                    onClick={navigateToYesterday}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronLeft className="w-3 h-3 text-purple-400 group-hover:text-purple-300" />
                    <span className="text-xs text-slate-300 group-hover:text-slate-200">Yesterday</span>
                  </motion.button>
                  <motion.button
                    onClick={navigateToThisWeek}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Calendar className="w-3 h-3 text-green-400 group-hover:text-green-300" />
                    <span className="text-xs text-slate-300 group-hover:text-slate-200">This Week</span>
                  </motion.button>
                  <motion.button
                    onClick={navigateToLastWeek}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-700/60 rounded-lg transition-all duration-200 border border-slate-600/30 hover:border-slate-500/50 group"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <ChevronRight className="w-3 h-3 text-yellow-400 group-hover:text-yellow-300" />
                    <span className="text-xs text-slate-300 group-hover:text-slate-200">Last Week</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Search Results Header */}
          {isSearchMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-4 sm:mb-6"
            >
              {/* Header Glow Effect */}
              <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
              
              {/* Header Content */}
              <div className="relative bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Search className="w-5 h-5 text-cyan-400" />
                    <h2 className="text-lg font-semibold text-slate-50">Search Results</h2>
                  </div>
                  <span className="text-sm text-slate-400">
                    {searchResults?.length ?? 0} entries found
                  </span>
                </div>
                <p className="text-slate-300 text-sm">
                  Click on any entry to view it in detail
                </p>
              </div>
            </motion.div>
          )}

          {/* Calendar */}
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
                  <h3 className="text-base sm:text-lg font-semibold text-slate-50">Calendar</h3>
                </div>
                <CalendarComponent
                  selectedDate={selectedDate}
                  currentDate={currentMonth}
                  onDateSelect={handleDateSelect}
                  onMonthChange={handleMonthChange}
                  entriesByDate={getEntriesForMonth()}
                  entries={entries}
                />
              </div>
            </motion.div>
          )}

          {/* Mode Selection - Only show when no entries for selected date */}
          {shouldShowModeSelection && (
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
                      onClick={() => {
                        setEntryMode('manual');
                        setShowAddEntryMode(true);
                      }}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium min-h-[44px] ${
                        entryMode === 'manual' 
                          ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                      }`}
                      data-testid="manual-mode-button"
                    >
                      <PenTool className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Manual</span>
                    </button>
                    <button
                      onClick={() => {
                        setEntryMode('ai');
                        setShowAddEntryMode(true);
                      }}
                      className={`flex items-center space-x-2 px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg transition-all duration-200 font-medium min-h-[44px] ${
                        entryMode === 'ai' 
                          ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25' 
                          : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                      }`}
                      data-testid="ai-mode-button"
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
                <div className="space-y-4" data-testid="search-results">
                  {(searchResults?.length ?? 0) === 0 ? (
                    <div className="text-center py-8">
                      <Search className="w-12 h-12 text-slate-500 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-300 mb-2">No entries found</h3>
                      <p className="text-slate-400">Try adjusting your search criteria</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {searchResults?.map((entry) => (
                        <div
                          key={entry.id}
                          className="p-4 bg-slate-800/50 rounded-lg border border-slate-600/50 hover:bg-slate-700/50 transition-colors"
                        >
                          <div 
                            className="cursor-pointer"
                            onClick={() => {
                              const entryDate = safeCreateDate(entry.date);
                              if (entryDate) {
                                setSelectedDate(entryDate);
                                setCurrentMonth(entryDate);
                                setIsSearchMode(false);
                              }
                            }}
                          >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-slate-300">
                                {safeFormatDate(entry.date)}
                              </span>
                              {entry.mood && (
                                <span className="text-sm font-medium text-slate-300">{entry.mood || 'No mood'}</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-slate-500">
                                {entry.wordCount} words
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (window.confirm('Are you sure you want to delete this entry?')) {
                                    handleDeleteEntry(entry.id);
                                  }
                                }}
                                className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                                title="Delete entry"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p className="text-sm text-slate-300 line-clamp-3">
                            {entry.content.substring(0, 200)}...
                          </p>
                          {entry.topics && (entry.topics?.length ?? 0) > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {entry.topics?.slice(0, 3).map((topic, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs"
                                >
                                  {topic}
                                </span>
                              ))}
                              {(entry.topics?.length ?? 0) > 3 && (
                                <span className="px-2 py-1 bg-slate-700/80 text-slate-400 rounded-full text-xs">
                                  +{(entry.topics?.length ?? 0) - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : showAddEntryMode && entryMode === 'ai' ? (
                /* AI Assistant Mode */
                <Suspense fallback={<LoadingSpinner />}>
                  <AIJournalAssistant
                    selectedDate={selectedDate}
                    onSaveEntry={handleSaveEntry}
                    onCancel={handleCancelAI}
                    onSpeechToggle={onSpeechToggle}
                    isListening={isListening}
                    browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                    transcript={transcript}
                    last5JournalEntries={Array.isArray(getRecentEntries()) ? getRecentEntries().slice(0, 5) : []}
                    data-testid="ai-assistant"
                  />
                </Suspense>
              ) : showAddEntryMode && entryMode === 'manual' ? (
                /* Manual Entry Mode */
                <Suspense fallback={<LoadingSpinner />}>
                  <SwipeableCard
                    onSwipeLeft={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    onSwipeRight={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="w-full"
                  >
                    <JournalEntry
                      selectedDate={selectedDate}
                      entry={null} // New entry, so no existing entry
                      onSave={handleSaveEntry}
                      onDelete={handleDeleteEntry}
                      isLoading={isLoading}
                      onSpeechToggle={onSpeechToggle}
                      isListening={isListening}
                      browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                      transcript={transcript}
                      microphoneStatus={microphoneStatus}
                    />
                  </SwipeableCard>
                </Suspense>
              ) : (currentEntries?.length ?? 0) > 1 ? (
                /* Multiple Entries - Show List */
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
              ) : (currentEntries?.length ?? 0) === 1 ? (
                /* Single Entry - Show Entry Component */
                <Suspense fallback={<LoadingSpinner />}>
                  <SwipeableCard
                    onSwipeLeft={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() - 1);
                      setSelectedDate(newDate);
                    }}
                    onSwipeRight={() => {
                      const newDate = new Date(selectedDate);
                      newDate.setDate(newDate.getDate() + 1);
                      setSelectedDate(newDate);
                    }}
                    className="w-full"
                  >
                    <JournalEntry
                      selectedDate={selectedDate}
                      entry={editingEntry || (currentEntries?.[0] || null)}
                      onSave={handleSaveEntry}
                      onDelete={handleDeleteEntry}
                      isLoading={isLoading}
                      onSpeechToggle={onSpeechToggle}
                      isListening={isListening}
                      browserSupportsSpeechRecognition={browserSupportsSpeechRecognition}
                      transcript={transcript}
                      microphoneStatus={microphoneStatus}
                    />
                  </SwipeableCard>
                </Suspense>
              ) : (
                /* Enhanced Empty State */
                <div className="text-center py-12">
                  <motion.div 
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                  >
                    <div className="relative mb-6">
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full blur-2xl"></div>
                      <div className="relative bg-slate-800/60 backdrop-blur-sm rounded-full p-6 w-24 h-24 mx-auto flex items-center justify-center border border-slate-700/50">
                        <PenTool className="w-12 h-12 text-cyan-400" />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-50 mb-3">
                      No entry for {safeFormatDate(selectedDate)}
                    </h3>
                    <p className="text-slate-300 text-base max-w-md mx-auto leading-relaxed mb-6">
                      This is your space to reflect, grow, and capture your thoughts. Every entry is a step forward in your journey.
                    </p>
                    
                    {/* Progress Indicators */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8 max-w-lg mx-auto">
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                        <div className="text-2xl font-bold text-cyan-400 mb-1">{progressStats.weeklyEntries}</div>
                        <div className="text-xs text-slate-400">This Week</div>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                        <div className="text-2xl font-bold text-purple-400 mb-1">{progressStats.monthlyEntries}</div>
                        <div className="text-xs text-slate-400">This Month</div>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                        <div className="text-2xl font-bold text-green-400 mb-1">{progressStats.totalWords.toLocaleString()}</div>
                        <div className="text-xs text-slate-400">Total Words</div>
                      </div>
                      <div className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-3 border border-slate-700/30">
                        <div className="text-2xl font-bold text-yellow-400 mb-1">{progressStats.averageWordsPerEntry}</div>
                        <div className="text-xs text-slate-400">Avg/Entry</div>
                      </div>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-center"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <motion.button
                      onClick={handleSmartAddEntry}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleSmartAddEntry();
                        }
                      }}
                      tabIndex={0}
                      role="button"
                      aria-label="Start writing a new journal entry"
                      className="flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-900 rounded-xl transition-all duration-300 font-semibold shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 group focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-opacity-50"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      data-testid="add-entry-button"
                    >
                      <Plus className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                      <span>Start Writing</span>
                    </motion.button>
                  </motion.div>
                </div>
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
                  entries={Array.isArray(getRecentEntries()) ? getRecentEntries() : []}
                  onEntryClick={handleRecentEntryClick}
                />
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Search Modal */}
        {showSearch && (
          <Suspense fallback={<LoadingSpinner />}>
            <JournalSearch
              entries={entries}
              onSearchResults={handleSearchResults}
              onClose={handleSearchClose}
              data-testid="journal-search"
            />
          </Suspense>
        )}

        {/* Data Management Modal */}
        <DataManagementModal
          isOpen={showDataManagement}
          onClose={() => setShowDataManagement(false)}
          journalEntries={entries}
          chatMessages={messages}
          data-testid="data-management-modal"
        />
      </ComponentErrorBoundary>
    );
};

export default Journal; 
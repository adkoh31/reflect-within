import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  X, 
  Calendar, 
  Clock, 
  MessageSquare, 
  TrendingUp, 
  Zap, 
  Heart,
  Filter
} from 'lucide-react';

const JournalSearch = ({ entries, onSearchResults, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    dateRange: 'all',
    topics: [],
    hasAttachments: false,
    dateFrom: '',
    dateTo: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  // Get unique topics from all entries
  const allTopics = useMemo(() => {
    const topics = new Set();
    Object.values(entries).forEach(entry => {
      if (entry.topics && Array.isArray(entry.topics)) {
        entry.topics.forEach(topic => topics.add(topic));
      }
    });
    return Array.from(topics).sort();
  }, [entries]);

  // Search and filter entries
  useEffect(() => {
    const results = Object.entries(entries)
      .map(([id, entry]) => ({ id, ...entry }))
      .filter(entry => {
        // Text search
        const matchesSearch = !searchQuery || 
          entry.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          entry.topics?.some(topic => 
            topic.toLowerCase().includes(searchQuery.toLowerCase())
          );

        // Date range filter
        let matchesDateRange = true;
        if (selectedFilters.dateRange !== 'all') {
          const entryDate = new Date(entry.date);
          const today = new Date();
          const daysDiff = Math.floor((today - entryDate) / (1000 * 60 * 60 * 24));

          switch (selectedFilters.dateRange) {
            case 'today':
              matchesDateRange = daysDiff === 0;
              break;
            case 'week':
              matchesDateRange = daysDiff <= 7;
              break;
            case 'month':
              matchesDateRange = daysDiff <= 30;
              break;
            case 'custom':
              if (selectedFilters.dateFrom && selectedFilters.dateTo) {
                const fromDate = new Date(selectedFilters.dateFrom);
                const toDate = new Date(selectedFilters.dateTo);
                matchesDateRange = entryDate >= fromDate && entryDate <= toDate;
              }
              break;
            default:
              matchesDateRange = true;
              break;
          }
        }

        // Topics filter
        const matchesTopics = selectedFilters.topics.length === 0 ||
          selectedFilters.topics.some(topic => 
            entry.topics?.includes(topic)
          );

        // Attachments filter
        const matchesAttachments = !selectedFilters.hasAttachments ||
          (entry.attachments && entry.attachments.length > 0);

        return matchesSearch && matchesDateRange && matchesTopics && matchesAttachments;
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    setSearchResults(results);
    onSearchResults(results);
  }, [searchQuery, selectedFilters, entries, onSearchResults]);

  const handleFilterChange = (filterType, value) => {
    setSelectedFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleTopicToggle = (topic) => {
    setSelectedFilters(prev => ({
      ...prev,
      topics: prev.topics.includes(topic)
        ? prev.topics.filter(t => t !== topic)
        : [...prev.topics, topic]
    }));
  };

  const clearFilters = () => {
    setSelectedFilters({
      dateRange: 'all',
      topics: [],
      hasAttachments: false,
      dateFrom: '',
      dateTo: ''
    });
    setSearchQuery('');
  };

  const hasActiveFilters = searchQuery || 
    selectedFilters.dateRange !== 'all' ||
    selectedFilters.topics.length > 0 ||
    selectedFilters.hasAttachments ||
    selectedFilters.dateFrom ||
    selectedFilters.dateTo;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4"
    >
      {/* Search Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-50">Search Journal</h3>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-slate-800/80 rounded-lg transition-colors"
        >
          <X className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search entries, topics, or content..."
          className="w-full pl-10 pr-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 text-slate-50 placeholder-slate-400"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
            showFilters
              ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
              : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
          }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <div className="w-2 h-2 bg-red-400 rounded-full"></div>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filters Panel */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Date Range
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'all', label: 'All Time', icon: <Clock className="w-4 h-4" /> },
                    { value: 'today', label: 'Today', icon: <Calendar className="w-4 h-4" /> },
                    { value: 'week', label: 'This Week', icon: <TrendingUp className="w-4 h-4" /> },
                    { value: 'month', label: 'This Month', icon: <Calendar className="w-4 h-4" /> }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleFilterChange('dateRange', option.value)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedFilters.dateRange === option.value
                          ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                          : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 border border-slate-600/50'
                      }`}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {selectedFilters.dateRange === 'custom' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      From
                    </label>
                    <input
                      type="date"
                      value={selectedFilters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/80 border border-slate-600/50 rounded-lg text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      To
                    </label>
                    <input
                      type="date"
                      value={selectedFilters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 bg-slate-700/80 border border-slate-600/50 rounded-lg text-sm text-slate-50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>
              )}

              {/* Topics Filter */}
              {allTopics.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Topics
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleTopicToggle(topic)}
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          selectedFilters.topics.includes(topic)
                            ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                            : 'bg-slate-700/80 text-slate-300 hover:bg-slate-600/80 border border-slate-600/50'
                        }`}
                      >
                        <MessageSquare className="w-3 h-3" />
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Attachments Filter */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedFilters.hasAttachments}
                    onChange={(e) => handleFilterChange('hasAttachments', e.target.checked)}
                    className="w-4 h-4 text-cyan-500 bg-slate-700/80 border-slate-600/50 rounded focus:ring-cyan-500/50"
                  />
                  <span className="text-sm font-medium text-slate-300">
                    Only entries with attachments
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Results Summary */}
      <div className="flex items-center justify-between text-sm text-slate-400">
        <span>
          {searchResults.length} {searchResults.length === 1 ? 'entry' : 'entries'} found
        </span>
        {hasActiveFilters && (
          <span className="text-cyan-400">
            Filters applied
          </span>
        )}
      </div>
    </motion.div>
  );
};

export default JournalSearch; 
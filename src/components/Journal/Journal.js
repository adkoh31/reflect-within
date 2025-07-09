import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Edit3, X } from 'lucide-react';
import Calendar from './Calendar';
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
  const [showVoiceGuide, setShowVoiceGuide] = useState(false);
  
  const {
    entries,
    isLoading,
    saveEntry,
    deleteEntry,
    getEntriesForDate,
    getRecentEntries
  } = useJournalEntries();

  // Show voice guide on first use
  useEffect(() => {
    const hasUsedVoice = localStorage.getItem('reflectWithin_voiceUsed');
    if (!hasUsedVoice && browserSupportsSpeechRecognition) {
      setShowVoiceGuide(true);
    }
  }, [browserSupportsSpeechRecognition]);

  const handleFirstVoiceUse = () => {
    localStorage.setItem('reflectWithin_voiceUsed', 'true');
    setShowVoiceGuide(false);
    onSpeechToggle();
  };

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
    <div className="space-y-6 pb-4">
      {/* Voice Input Guide */}
      {showVoiceGuide && (
        <motion.div 
          className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-200 rounded-xl p-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="text-sm font-medium text-primary-900 mb-2">🎤 Voice Input Tips</h3>
              <ul className="text-xs text-primary-700 space-y-1 font-light">
                <li>• Speak clearly and at a normal pace</li>
                <li>• I'll listen for up to 30 seconds</li>
                <li>• I'll stop after 3 seconds of silence</li>
                <li>• Say "stop listening" to stop early</li>
              </ul>
            </div>
            <button
              onClick={() => setShowVoiceGuide(false)}
              className="ml-3 p-1 text-primary-600 hover:text-primary-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={handleFirstVoiceUse}
            className="mt-3 w-full px-3 py-2 bg-primary-600 text-white rounded-lg text-sm font-light hover:bg-primary-700 transition-colors"
          >
            Try Voice Input
          </button>
        </motion.div>
      )}

      {/* Header */}
      <motion.div 
        className="bg-card rounded-2xl border border-border p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-light text-foreground">Your Private Journal</h2>
            <p className="text-muted-foreground text-sm font-light mt-1">
              Write your private thoughts and reflections
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground font-light">
              {Object.keys(entries).length} entries
            </span>
          </div>
        </div>
      </motion.div>

      {/* Calendar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Calendar
          currentDate={currentMonth}
          onDateSelect={handleDateSelect}
          entriesByDate={getEntriesForMonth()}
          onMonthChange={handleMonthChange}
        />
      </motion.div>

      {/* Entry Mode Selection */}
      {shouldShowModeSelection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-6"
        >
          <h3 className="text-lg font-light text-foreground mb-4">Create New Entry</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => setEntryMode('ai')}
              className="flex items-center space-x-3 p-4 bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl hover:bg-primary-200 transition-colors text-left"
            >
              <div className="p-2 bg-primary-600 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-medium text-primary-900">AI Journal Assistant</h4>
                <p className="text-sm text-primary-700">Tell me about your day and I'll create a structured entry</p>
              </div>
            </button>
            
            <button
              onClick={() => setEntryMode('manual')}
              className="flex items-center space-x-3 p-4 bg-muted border border-border rounded-xl hover:bg-accent transition-colors text-left"
            >
              <div className="p-2 bg-foreground rounded-lg">
                <Edit3 className="w-5 h-5 text-background" />
              </div>
              <div>
                <h4 className="font-medium text-foreground">Manual Entry</h4>
                <p className="text-sm text-muted-foreground">Write your entry directly in the text area</p>
              </div>
            </button>
          </div>
        </motion.div>
      )}

      {/* Mode Switch for Existing Entries */}
      {selectedDateEntries.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="bg-card rounded-2xl border border-border p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-light">Entry Mode:</span>
            <div className="flex gap-2">
              <button
                onClick={() => setEntryMode('manual')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors font-light ${
                  entryMode === 'manual' 
                    ? 'bg-foreground text-background' 
                    : 'bg-muted text-foreground hover:bg-accent'
                }`}
              >
                Manual
              </button>
              <button
                onClick={() => setEntryMode('ai')}
                className={`px-3 py-1 text-sm rounded-lg transition-colors font-light ${
                  entryMode === 'ai' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-muted text-foreground hover:bg-accent'
                }`}
              >
                AI Assistant
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Journal Entry or AI Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
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
      </motion.div>

      {/* Recent Entries */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecentEntries
          entries={getRecentEntries}
          onEntryClick={handleRecentEntryClick}
        />
      </motion.div>
    </div>
  );
};

export default Journal; 
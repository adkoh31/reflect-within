import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Bot, Edit3, Target, Heart, BookOpen, Zap } from 'lucide-react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { ComponentErrorBoundary } from '../ui/ComponentErrorBoundary.jsx';
import { LoadingButton } from '../ui/LoadingButton.jsx';

const AIJournalAssistant = ({ 
  selectedDate,
  onSaveEntry,
  onCancel,
  onSpeechToggle,
  isListening,
  browserSupportsSpeechRecognition,
  transcript,
  last5JournalEntries = [],
  microphoneStatus
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [structuredEntry, setStructuredEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableEntry, setEditableEntry] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const inputRef = useRef(null);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Quick action prompts
  const quickActions = [
    {
      id: 'workout',
      title: 'Workout Entry',
      description: 'Log your workout details',
      prompt: 'Tell me about your workout today - what exercises, how it felt, any achievements?',
      icon: Zap,
      color: 'from-orange-500 to-red-500'
    },
    {
      id: 'mood',
      title: 'Mood Check',
      description: 'How are you feeling today?',
      prompt: 'How are you feeling today? What\'s affecting your mood?',
      icon: Heart,
      color: 'from-pink-500 to-purple-500'
    },
    {
      id: 'daily',
      title: 'Daily Reflection',
      description: 'Reflect on your day',
      prompt: 'What happened today? What are you grateful for? Any insights or learnings?',
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'goals',
      title: 'Goal Check-in',
      description: 'Check in on your goals',
      prompt: 'How are your goals progressing? What steps did you take today?',
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    }
  ];

  const handleQuickAction = (action) => {
    setSelectedPrompt(action);
    setInputText('');
    setStructuredEntry(null);
    setEditableEntry(null);
    setIsEditing(false);
    inputRef.current?.focus();
  };

  const handleGenerateEntry = async () => {
    if (!inputText.trim() || !selectedPrompt) return;

    setIsLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('reflectWithin_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      const response = await axios.post(API_ENDPOINTS.JOURNAL.GENERATE_ENTRY, {
        message: inputText,
        pastEntries: last5JournalEntries,
        promptType: selectedPrompt.id,
        prompt: selectedPrompt.prompt,
        isReadyForEntry: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.structuredEntry) {
        setStructuredEntry(response.data.structuredEntry);
        setEditableEntry(response.data.structuredEntry);
        setIsEditing(false);
      }

    } catch (error) {
      console.error('Generate entry error:', error);
      // Show error message to user
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateEntry();
    }
  };

  const handleSaveEntry = () => {
    const entryToSave = isEditing ? editableEntry : structuredEntry;
    if (entryToSave) {
      const content = formatStructuredEntry(entryToSave);
      onSaveEntry(selectedDate, content, ['AI Generated']);
    }
  };

  const handleEditEntry = () => {
    setEditableEntry({ ...structuredEntry });
    setIsEditing(true);
  };

  const handleSaveEdits = () => {
    if (editableEntry) {
      setStructuredEntry(editableEntry);
      setIsEditing(false);
      setEditableEntry(null);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditableEntry(null);
  };

  const updateEditableField = (field, value) => {
    if (editableEntry) {
      setEditableEntry(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const updateWorkoutExercise = (index, field, value) => {
    if (editableEntry && editableEntry.workout && editableEntry.workout.exercises) {
      const updatedExercises = [...editableEntry.workout.exercises];
      updatedExercises[index] = {
        ...updatedExercises[index],
        [field]: value
      };
      setEditableEntry(prev => ({
        ...prev,
        workout: {
          ...prev.workout,
          exercises: updatedExercises
        }
      }));
    }
  };

  const updateGoal = (index, value) => {
    if (editableEntry && editableEntry.goals) {
      const updatedGoals = [...editableEntry.goals];
      updatedGoals[index] = value;
      setEditableEntry(prev => ({
        ...prev,
        goals: updatedGoals
      }));
    }
  };

  const formatStructuredEntry = (entry) => {
    // If the entry has natural language content, use it directly
    if (entry.content && typeof entry.content === 'string') {
      return entry.content;
    }
    
    // Fallback to old structured format if needed
    let content = `Date: ${entry.date}\nMood: ${entry.mood}\n\n`;

    if (entry.workout && entry.workout.exercises && entry.workout.exercises.length > 0) {
      content += `Workout Summary:\n\n`;
      entry.workout.exercises.forEach(exercise => {
        content += `${exercise.name}: ${exercise.sets || ''}x${exercise.reps || ''} ${exercise.weight || ''}\n\n`;
        if (exercise.notes) {
          content += `Notes: ${exercise.notes}\n\n`;
        }
      });
    }

    if (entry.activities && entry.activities.length > 0) {
      content += `Activities: ${entry.activities.join(', ')}\n\n`;
    }

    if (entry.reflection) {
      content += `Reflections:\n${entry.reflection}\n\n`;
    }

    if (entry.goals && entry.goals.length > 0) {
      content += `Goals Moving Forward:\n`;
      entry.goals.forEach(goal => {
        content += `${goal}\n`;
      });
    }

    return content;
  };

  const renderStructuredEntry = (entry) => {
    return (
      <motion.div 
        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-50">Generated Journal Entry</h3>
          <div className="flex gap-2">
            <button
              onClick={handleEditEntry}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800/80 text-slate-50 rounded-lg hover:bg-slate-700/80 transition-colors"
            >
              <Edit3 className="w-3 h-3" />
              Edit
            </button>
            <button
              onClick={() => {
                setStructuredEntry(null);
                setMessages([{
                  id: Date.now(),
                  text: "I've discarded the generated entry. Would you like to start over or try a different approach?",
                  sender: 'ai',
                  timestamp: new Date().toLocaleTimeString()
                }]);
              }}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Discard
            </button>
          </div>
        </div>
        
        <div className="space-y-3 text-sm">
          {/* Display natural language content */}
          {entry.content && typeof entry.content === 'string' ? (
            <div className="text-slate-100 leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </div>
          ) : (
            /* Fallback to old structured format */
            <>
              <div><span className="font-medium">Date:</span> {entry.date}</div>
              <div><span className="font-medium">Mood:</span> {entry.mood}</div>
              
              {entry.workout && entry.workout.exercises && entry.workout.exercises.length > 0 && (
                <div>
                  <div className="font-medium mb-2">Workout Summary:</div>
                  {entry.workout.exercises.map((exercise, index) => (
                    <div key={index} className="ml-2 mb-2">
                      <div className="font-medium">• {exercise.name}: {exercise.sets || ''}x{exercise.reps || ''} {exercise.weight || ''}</div>
                      {exercise.notes && (
                        <div className="ml-4 text-xs text-slate-400 mt-1">
                          <span className="font-medium">Notes:</span> {exercise.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              {entry.activities && entry.activities.length > 0 && (
                <div><span className="font-medium">Activities:</span> {entry.activities.join(', ')}</div>
              )}
              
              {entry.reflection && (
                <div>
                  <div className="font-medium mb-1">Reflections:</div>
                  <div className="ml-2 text-xs text-slate-400">{entry.reflection}</div>
                </div>
              )}

              {entry.goals && entry.goals.length > 0 && (
                <div>
                  <div className="font-medium mb-1">Goals Moving Forward:</div>
                  {entry.goals.map((goal, index) => (
                    <div key={index} className="ml-2 text-xs text-slate-400">• {goal}</div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };

  const renderEditableEntry = (entry) => {
    return (
      <motion.div 
        className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-slate-50">Edit Journal Entry</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSaveEdits}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Save
            </button>
            <button
              onClick={handleCancelEdit}
              className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800/80 text-slate-50 rounded-lg hover:bg-slate-700/80 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Cancel
            </button>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Main content editing */}
          <div>
            <label className="block text-xs font-medium text-slate-50 mb-1">Journal Entry:</label>
            <textarea
              value={entry.content || entry.reflection || ''}
              onChange={(e) => updateEditableField('content', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-50 text-sm resize-none"
              placeholder="Your journal entry..."
              rows="12"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-50 mb-1">Date:</label>
            <input
              type="text"
              value={entry.date || ''}
              onChange={(e) => updateEditableField('date', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-50 text-sm"
              placeholder="Date"
            />
          </div>

          {/* Mood */}
          <div>
            <label className="block text-xs font-medium text-slate-50 mb-1">Mood:</label>
            <input
              type="text"
              value={entry.mood || ''}
              onChange={(e) => updateEditableField('mood', e.target.value)}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-50 text-sm"
              placeholder="How you're feeling"
            />
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <ComponentErrorBoundary>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-semibold text-slate-50">AI Journal Assistant</h3>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-300 transition-colors"
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Actions */}
        {!selectedPrompt && (
          <div className="space-y-3">
            <p className="text-slate-400 text-sm">
              Choose a quick action to create your journal entry:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const IconComponent = action.icon;
                return (
                  <button
                    key={action.id}
                    onClick={() => handleQuickAction(action)}
                    className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200 text-left group"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${action.color} group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-50">{action.title}</h4>
                        <p className="text-sm text-slate-400">{action.description}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Prompt */}
        {selectedPrompt && !structuredEntry && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <div className="flex items-center space-x-2 mb-2">
                <selectedPrompt.icon className="w-5 h-5 text-cyan-400" />
                <h4 className="font-medium text-slate-50">{selectedPrompt.title}</h4>
              </div>
              <p className="text-slate-300 text-sm">{selectedPrompt.prompt}</p>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Share your thoughts..."
                className="w-full h-32 p-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
              
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    setSelectedPrompt(null);
                    setInputText('');
                  }}
                  className="text-slate-400 hover:text-slate-300 transition-colors text-sm"
                >
                  ← Choose different action
                </button>
                
                <LoadingButton
                  onClick={handleGenerateEntry}
                  loading={isLoading}
                  disabled={!inputText.trim()}
                  size="small"
                >
                  Generate Entry
                </LoadingButton>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
              <span className="text-sm text-slate-400">Creating your journal entry...</span>
            </div>
          </div>
        )}

        {/* Structured Entry Preview */}
        {structuredEntry && !isEditing && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <h4 className="font-medium text-slate-50 mb-3">Generated Entry</h4>
              <div className="prose prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{structuredEntry.content}</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <LoadingButton
                onClick={() => setIsEditing(true)}
                size="small"
                variant="secondary"
              >
                Edit Entry
              </LoadingButton>
              <LoadingButton
                onClick={handleSaveEntry}
                size="small"
              >
                Save Entry
              </LoadingButton>
              <button
                onClick={() => {
                  setStructuredEntry(null);
                  setSelectedPrompt(null);
                  setInputText('');
                }}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Start Over
              </button>
            </div>
          </div>
        )}

        {/* Editable Entry */}
        {isEditing && editableEntry && (
          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
              <h4 className="font-medium text-slate-50 mb-3">Edit Entry</h4>
              <textarea
                value={editableEntry.content}
                onChange={(e) => setEditableEntry({...editableEntry, content: e.target.value})}
                className="w-full h-48 p-4 bg-slate-800 border border-slate-700 rounded-xl text-slate-100 placeholder-slate-400 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex space-x-3">
              <LoadingButton
                onClick={handleSaveEdits}
                size="small"
              >
                Save Changes
              </LoadingButton>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm text-slate-400 hover:text-slate-300 transition-colors"
              >
                Cancel Edit
              </button>
            </div>
          </div>
        )}
      </div>
    </ComponentErrorBoundary>
  );
};

export default AIJournalAssistant; 
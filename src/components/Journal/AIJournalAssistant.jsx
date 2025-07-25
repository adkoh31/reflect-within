import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Bot, Edit3 } from 'lucide-react';
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
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [structuredEntry, setStructuredEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editableEntry, setEditableEntry] = useState(null);
  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);

  // Show welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: Date.now(),
        text: "Hi! I'm here to help you create a journal entry. Tell me about your day - what you did, how you felt, any workouts, activities, or thoughts you'd like to record.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [messages.length]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputText,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('reflectWithin_token');
      console.log('Journal AI Assistant - Token:', token ? 'Present' : 'Missing');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Prepare conversation history for the API
      const conversationHistory = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      
      // Determine if we should generate an entry or continue conversation
      const isReadyForEntry = messages.length >= 4; // After 2 exchanges (4 messages)
      
      const response = await axios.post(API_ENDPOINTS.JOURNAL.GENERATE_ENTRY, {
        message: inputText,
        pastEntries: last5JournalEntries,
        conversationHistory: conversationHistory,
        isReadyForEntry: isReadyForEntry
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.conversation) {
        // Conversation phase - show AI response
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.conversation,
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // If we have enough conversation, show option to generate entry
        if (isReadyForEntry && !response.data.shouldGenerateEntry) {
          const generateOptionMessage = {
            id: Date.now() + 2,
            text: "I think I have a good understanding of your day now. Would you like me to create a journal entry based on our conversation?",
            sender: 'ai',
            timestamp: new Date().toLocaleTimeString(),
            showGenerateButton: true
          };
          setMessages(prev => [...prev, generateOptionMessage]);
        }
      } else if (response.data.structuredEntry) {
        // Entry generation phase - show structured entry
        const aiMessage = {
          id: Date.now() + 1,
          text: "I've created a structured journal entry based on our conversation. Would you like me to ask any follow-up questions to add more details, or are you ready to save this entry?",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiMessage]);
        setStructuredEntry(response.data.structuredEntry);
        setIsEditing(false); // Show preview first, not edit mode
      }

    } catch (error) {
      console.error('AI Journal Assistant error:', error);
      
      let errorMessage = "I'm having trouble processing that right now. Could you try again or tell me more about your day?";
      
      if (error.message === 'No authentication token found. Please log in again.') {
        errorMessage = "Authentication error. Please log out and log back in.";
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log out and log back in.";
      } else if (error.response?.status === 500) {
        errorMessage = "Server error. Please try again in a moment.";
      }
      
      const aiErrorMessage = {
        id: Date.now() + 1,
        text: errorMessage,
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateEntry = async () => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('reflectWithin_token');
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }
      
      // Prepare conversation history
      const conversationHistory = messages.map(msg => ({
        sender: msg.sender,
        text: msg.text
      }));
      
      const response = await axios.post(API_ENDPOINTS.JOURNAL.GENERATE_ENTRY, {
        message: "Generate entry from conversation",
        pastEntries: last5JournalEntries,
        conversationHistory: conversationHistory,
        isReadyForEntry: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.structuredEntry) {
        const aiMessage = {
          id: Date.now() + 1,
          text: "I've created a structured journal entry based on our conversation. Would you like me to ask any follow-up questions to add more details, or are you ready to save this entry?",
          sender: 'ai',
          timestamp: new Date().toLocaleTimeString()
        };

        setMessages(prev => [...prev, aiMessage]);
        setStructuredEntry(response.data.structuredEntry);
        setIsEditing(false);
      }

    } catch (error) {
      console.error('Generate entry error:', error);
      
      const aiErrorMessage = {
        id: Date.now() + 1,
        text: "I'm having trouble generating the entry right now. Please try again.",
        sender: 'ai',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setMessages(prev => [...prev, aiErrorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
      <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-slate-700/50 bg-slate-900/80">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
          <h2 className="text-base sm:text-lg font-semibold text-slate-50">AI Journal Assistant</h2>
        </div>
        <button
          onClick={onCancel}
          className="text-xs sm:text-sm text-slate-400 hover:text-slate-200 transition-colors py-2 px-3 rounded-lg hover:bg-slate-800/50"
        >
          Cancel
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-3 sm:px-4 py-2 sm:py-3 rounded-2xl shadow-sm ${
                message.sender === 'user'
                  ? 'bg-cyan-500 text-slate-900'
                  : 'bg-slate-800/80 text-slate-50 border border-slate-700/50'
              }`}
            >
              <p className="text-sm sm:text-base leading-relaxed font-normal">{message.text}</p>
              <p className={`text-xs mt-2 font-normal ${
                message.sender === 'user' 
                  ? 'text-slate-900/70' 
                  : 'text-slate-400'
              }`}>
                {message.timestamp}
              </p>
              
              {/* Show Generate Entry button if message has showGenerateButton flag */}
              {message.showGenerateButton && (
                <div className="mt-3">
                  <button
                    onClick={handleGenerateEntry}
                    disabled={isLoading}
                    className="px-4 py-2 bg-cyan-500 text-slate-900 rounded-lg hover:bg-cyan-400 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Generating...' : 'Generate Journal Entry'}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800/80 border border-slate-700/50 px-3 sm:px-4 py-2 sm:py-3 rounded-xl max-w-[85%]">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-xs sm:text-sm text-slate-300 font-normal">Creating entry...</span>
              </div>
            </div>
          </div>
        )}

        {/* Structured Entry Preview */}
        {structuredEntry && !isEditing && renderStructuredEntry(structuredEntry)}
        
        {isEditing && editableEntry && renderEditableEntry(editableEntry)}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-slate-700/50 bg-slate-900/95 backdrop-blur-sm p-3 sm:p-4 pb-6">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tell me about your day..."
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-slate-50 placeholder-slate-400 font-normal text-sm sm:text-base min-h-[44px]"
            />
          </div>
          
          <button
            onClick={onSpeechToggle}
            disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
            className="p-2 sm:p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-xl transition-all duration-200 border border-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[44px] flex items-center justify-center"
            title={
              !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
              microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
              microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
              isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
            }
          >
            {microphoneStatus === 'requesting' ? (
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
            ) : isListening ? (
              <MicOff className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            ) : (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
            )}
          </button>
          
          <LoadingButton
            onClick={handleSendMessage}
            disabled={!inputText.trim()}
            loading={isLoading}
            loadingText="Sending..."
            size="large"
            className="min-w-[80px]"
          >
            Send
          </LoadingButton>
        </div>
        
        {/* Listening Indicator */}
        {isListening && (
          <div className="mt-3 p-3 sm:p-4 bg-slate-800/80 rounded-lg border border-slate-700/50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-slate-300 font-normal">
                <span className="font-medium">Listening...</span>
              </p>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
            <p className="text-sm text-slate-300 font-normal mb-2">
              {transcript || 'Start speaking...'}
            </p>
            <div className="text-xs text-slate-400 font-normal">
              💡 Tell me about your day, workouts, or feelings. I'll stop listening after 3 seconds of silence.
            </div>
          </div>
        )}

        {/* Microphone Access Error */}
        {microphoneStatus === 'denied' && (
          <div className="mt-3 p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-sm text-red-300 font-normal">
              <span className="font-medium">Microphone access denied.</span> Please allow microphone access in your browser settings to use voice input.
            </p>
          </div>
        )}

        {/* Save Button */}
        {structuredEntry && (
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <LoadingButton
              onClick={handleSaveEntry}
              loading={isLoading}
              loadingText="Saving..."
              size="large"
              className="flex-1"
            >
              {isEditing ? 'Save Edited Entry' : 'Save Journal Entry'}
            </LoadingButton>
            {!isEditing && (
              <LoadingButton
                onClick={() => {
                  setStructuredEntry(null);
                  setMessages([{
                    id: Date.now(),
                    text: "Let me ask you some follow-up questions to improve your journal entry. What else would you like to add?",
                    sender: 'ai',
                    timestamp: new Date().toLocaleTimeString()
                  }]);
                }}
                variant="secondary"
                size="large"
              >
                Add More
              </LoadingButton>
            )}
            <LoadingButton
              onClick={() => {
                setStructuredEntry(null);
                setMessages([{
                  id: Date.now(),
                  text: "I've discarded the generated entry. Would you like to start over or try a different approach?",
                  sender: 'ai',
                  timestamp: new Date().toLocaleTimeString()
                }]);
              }}
              variant="danger"
              size="large"
            >
              Discard Entry
            </LoadingButton>
          </div>
        )}
      </div>
      </div>
    </ComponentErrorBoundary>
  );
};

export default AIJournalAssistant; 
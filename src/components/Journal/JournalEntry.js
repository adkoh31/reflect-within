import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import TopicSelector from './TopicSelector';

const JournalEntry = ({ 
  selectedDate, 
  entry, 
  onSave, 
  onDelete,
  isLoading = false,
  onSpeechToggle,
  isListening,
  browserSupportsSpeechRecognition,
  transcript,
  microphoneStatus
}) => {
  const [content, setContent] = useState(entry?.content || '');
  const [topic, setTopic] = useState(entry?.topic || '');
  const [isEditing, setIsEditing] = useState(!entry);
  const textareaRef = useRef(null);

  useEffect(() => {
    setContent(entry?.content || '');
    setTopic(entry?.topic || '');
    setIsEditing(!entry);
  }, [entry, selectedDate]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  // Update content when transcript changes
  useEffect(() => {
    if (transcript && isEditing) {
      setContent(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript, isEditing]);

  const handleSave = () => {
    if (content.trim()) {
      onSave(selectedDate, content.trim(), topic.trim());
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (entry && window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id); // Use entry.id instead of selectedDate
    }
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
      {/* Entry Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-light text-foreground">
            {isToday(selectedDate) ? "Today's Entry" : formatDate(selectedDate)}
          </h3>
          {entry && (
            <p className="text-sm text-muted-foreground font-light">
              Last updated: {new Date(entry.updatedAt || entry.createdAt).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {entry && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-muted hover:bg-accent text-foreground rounded-lg transition-colors font-light"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors font-light"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entry Content */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Topic Input */}
          <div>
            <TopicSelector
              selectedTopic={topic}
              onTopicSelect={setTopic}
            />
          </div>
          
          {/* Content Textarea */}
          <div>
            <label className="block text-sm font-light text-foreground mb-2">
              Your Entry
            </label>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your private thoughts, reflections, or experiences for today..."
                className="w-full h-48 p-4 pr-12 border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent bg-background text-foreground placeholder-muted-foreground font-light text-sm resize-none"
              />
              {/* Voice Input Button */}
              <button
                onClick={onSpeechToggle}
                disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
                className="absolute top-3 right-3 p-2 bg-muted hover:bg-accent rounded-lg transition-colors duration-200 border border-border disabled:opacity-50 disabled:cursor-not-allowed"
                title={
                  !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
                  microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
                  microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
                  isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
                }
              >
                {microphoneStatus === 'requesting' ? (
                  <div className="w-4 h-4 border-2 border-foreground border-t-transparent rounded-full animate-spin"></div>
                ) : isListening ? (
                  <MicOff className="w-4 h-4 text-accent-foreground" />
                ) : (
                  <Mic className="w-4 h-4 text-foreground" />
                )}
              </button>
            </div>
          </div>
          
          {/* Listening Indicator for Journal */}
          {isListening && (
            <div className="p-4 bg-accent rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-accent-foreground font-light">
                  <span className="font-medium">Listening...</span>
                </p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-accent-foreground rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-sm text-accent-foreground font-light mb-2">
                {transcript || 'Start speaking...'}
              </p>
              <div className="text-xs text-accent-foreground/70 font-light">
                💡 Speak your thoughts naturally. I'll stop listening after 3 seconds of silence.
              </div>
            </div>
          )}

          {/* Microphone Access Error */}
          {microphoneStatus === 'denied' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700 font-light">
                <span className="font-medium">Microphone access denied.</span> Please allow microphone access in your browser settings to use voice input.
              </p>
            </div>
          )}
          
          <div className="flex gap-3">
            <button
              onClick={handleSave}
              disabled={!content.trim() || isLoading}
              className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed font-light transition-colors"
            >
              {isLoading ? 'Saving...' : 'Save Entry'}
            </button>
            {entry && (
              <button
                onClick={() => {
                  setContent(entry.content || '');
                  setTopic(entry.topic || '');
                  setIsEditing(false);
                }}
                className="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-accent font-light transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : entry ? (
        <div className="space-y-4">
          {/* Topic Display */}
          {entry.topic && (
            <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
              <p className="text-sm text-accent-foreground font-medium">
                {entry.topic}
              </p>
            </div>
          )}
          
          {/* Content Display */}
          <div className="bg-muted rounded-xl p-4">
            <p className="text-sm text-foreground font-light leading-relaxed whitespace-pre-wrap">
              {entry.content}
            </p>
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-muted text-foreground rounded-xl hover:bg-accent font-light transition-colors"
          >
            Edit Entry
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-muted-foreground mb-4">
            <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-foreground text-lg font-light mb-2">No entry for this date</p>
          <p className="text-muted-foreground text-sm font-light mb-4">
            Start writing to create your first entry
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-foreground text-background rounded-xl hover:bg-muted-foreground font-light transition-colors"
          >
            Write Entry
          </button>
        </div>
      )}
    </div>
  );
};

export default JournalEntry; 
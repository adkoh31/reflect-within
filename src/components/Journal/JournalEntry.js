import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Zap, 
  Heart,
  FileText,
  Image,
  Mic,
  MicOff,
  Save,
  Sparkles
} from 'lucide-react';
import MediaAttachment from './MediaAttachment';
import JournalTemplates from './JournalTemplates';
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
  const [topics, setTopics] = useState(entry?.topics || []);
  const [attachments, setAttachments] = useState(entry?.attachments || []);
  const [mood, setMood] = useState(entry?.mood || null);
  const [energy, setEnergy] = useState(entry?.energy || null);
  const [template, setTemplate] = useState(entry?.template || null);
  const [isEditing, setIsEditing] = useState(!entry);
  const [showTemplates, setShowTemplates] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const textareaRef = useRef(null);

  // Mood options
  const moodOptions = [
    { value: 'excited', label: 'Excited', emoji: '🤩', color: 'from-yellow-500 to-orange-500' },
    { value: 'happy', label: 'Happy', emoji: '😊', color: 'from-green-500 to-emerald-500' },
    { value: 'calm', label: 'Calm', emoji: '😌', color: 'from-blue-500 to-cyan-500' },
    { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'from-slate-500 to-gray-500' },
    { value: 'tired', label: 'Tired', emoji: '😴', color: 'from-purple-500 to-indigo-500' },
    { value: 'stressed', label: 'Stressed', emoji: '😰', color: 'from-red-500 to-pink-500' },
    { value: 'frustrated', label: 'Frustrated', emoji: '😤', color: 'from-orange-500 to-red-500' }
  ];

  // Energy levels
  const energyLevels = [
    { value: 1, label: 'Very Low', color: 'from-red-500 to-pink-500' },
    { value: 2, label: 'Low', color: 'from-orange-500 to-red-500' },
    { value: 3, label: 'Medium', color: 'from-yellow-500 to-orange-500' },
    { value: 4, label: 'High', color: 'from-green-500 to-emerald-500' },
    { value: 5, label: 'Very High', color: 'from-blue-500 to-cyan-500' }
  ];

  useEffect(() => {
    setContent(entry?.content || '');
    setTopics(entry?.topics || []);
    setAttachments(entry?.attachments || []);
    setMood(entry?.mood || null);
    setEnergy(entry?.energy || null);
    setTemplate(entry?.template || null);
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

  // Calculate word count
  useEffect(() => {
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const handleSave = () => {
    if (content.trim()) {
      const saveOptions = {
        entryId: entry?.id,
        attachments,
        template,
        mood,
        energy,
        tags: topics // Use topics as tags for now
      };
      onSave(selectedDate, content.trim(), topics, saveOptions);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    if (entry && window.confirm('Are you sure you want to delete this entry?')) {
      onDelete(entry.id);
    }
  };

  const handleTemplateSelect = (selectedTemplate) => {
    setTemplate(selectedTemplate.id);
    setShowTemplates(false);
    
    // If content is empty, populate with template prompts
    if (!content.trim()) {
      const templateContent = selectedTemplate.prompts
        .map((prompt, index) => `${index + 1}. ${prompt}`)
        .join('\n\n');
      setContent(templateContent);
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

  const getMoodEmoji = (moodValue) => {
    const moodOption = moodOptions.find(m => m.value === moodValue);
    return moodOption ? moodOption.emoji : '😐';
  };

  const getEnergyColor = (level) => {
    const energyLevel = energyLevels.find(e => e.value === level);
    return energyLevel ? energyLevel.color : 'from-slate-500 to-gray-500';
  };

  return (
    <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-4 sm:p-6">
      {/* Entry Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-slate-50">
            {isToday(selectedDate) ? "Today's Entry" : formatDate(selectedDate)}
          </h3>
          {entry && (
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              Last updated: {new Date(entry.updatedAt || entry.createdAt).toLocaleString()}
            </p>
          )}
        </div>
        
        <div className="flex gap-2">
          {entry && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-2 text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-all duration-200 font-medium min-h-[44px] flex items-center gap-2"
              >
                <Edit3 className="w-3 h-3" />
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-2 text-xs sm:text-sm bg-red-900/20 hover:bg-red-800/30 text-red-300 rounded-lg transition-all duration-200 font-medium min-h-[44px] flex items-center gap-2"
              >
                <Trash2 className="w-3 h-3" />
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Entry Content */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Template Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-300">
                Template
              </label>
              <button
                onClick={() => setShowTemplates(true)}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-lg transition-colors"
              >
                <Sparkles className="w-3 h-3" />
                {template ? 'Change' : 'Choose'}
              </button>
            </div>
            {template && (
              <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
                <p className="text-xs text-slate-300">
                  <span className="font-medium">Using template:</span> {template}
                </p>
              </div>
            )}
          </div>

          {/* Mood and Energy Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Mood Selection */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                How are you feeling?
              </label>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((moodOption) => (
                  <button
                    key={moodOption.value}
                    onClick={() => setMood(moodOption.value)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      mood === moodOption.value
                        ? `bg-gradient-to-r ${moodOption.color} text-white shadow-lg`
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <span>{moodOption.emoji}</span>
                    {moodOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                Energy Level (1-5)
              </label>
              <div className="flex gap-1">
                {energyLevels.map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setEnergy(level.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      energy === level.value
                        ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    {level.value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Topic Input */}
          <div>
            <TopicSelector
              selectedTopics={topics}
              onTopicsSelect={setTopics}
            />
          </div>
          
          {/* Content Textarea */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-300">
                Your Entry
              </label>
              <span className="text-xs text-slate-500">
                {wordCount} words
              </span>
            </div>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your private thoughts, reflections, or experiences for today..."
                className="w-full h-32 sm:h-48 p-3 sm:p-4 pr-12 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-slate-50 placeholder-slate-400 font-normal text-sm resize-none"
              />
              {/* Voice Input Button */}
              <button
                onClick={onSpeechToggle}
                disabled={!browserSupportsSpeechRecognition || microphoneStatus === 'requesting'}
                className="absolute top-2 sm:top-3 right-2 sm:right-3 p-2 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg transition-all duration-200 border border-slate-700/50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[32px] min-w-[32px] flex items-center justify-center"
                title={
                  !browserSupportsSpeechRecognition ? 'Speech recognition not supported' : 
                  microphoneStatus === 'requesting' ? 'Requesting microphone access...' :
                  microphoneStatus === 'denied' ? 'Microphone access denied. Please allow access in browser settings.' :
                  isListening ? 'Stop listening' : 'Click to speak - I\'ll listen for up to 30 seconds'
                }
              >
                {microphoneStatus === 'requesting' ? (
                  <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                ) : isListening ? (
                  <MicOff className="w-4 h-4 text-slate-300" />
                ) : (
                  <Mic className="w-4 h-4 text-slate-300" />
                )}
              </button>
            </div>
          </div>

          {/* Media Attachments */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
              Media Attachments
            </label>
            <MediaAttachment
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={false}
            />
          </div>
          
          {/* Listening Indicator for Journal */}
          {isListening && (
            <div className="p-3 sm:p-4 bg-slate-800/80 rounded-lg border border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-slate-300 font-normal">
                  <span className="font-medium">Listening...</span>
                </p>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 font-normal mb-2">
                {transcript || 'Start speaking...'}
              </p>
              <div className="text-xs text-slate-400 font-normal">
                💡 Speak your thoughts naturally. I'll stop listening after 3 seconds of silence.
              </div>
            </div>
          )}

          {/* Microphone Access Error */}
          {microphoneStatus === 'denied' && (
            <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
              <p className="text-xs sm:text-sm text-red-300 font-normal">
                <span className="font-medium">Microphone access denied.</span> Please allow microphone access in your browser settings to use voice input.
              </p>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={!content.trim() || isLoading}
              className="px-4 py-3 bg-cyan-500 text-slate-900 rounded-xl hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 min-h-[44px] flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isLoading ? 'Saving...' : 'Save Entry'}
            </button>
            {entry && (
              <button
                onClick={() => {
                  setContent(entry.content || '');
                  setTopics(entry.topics || []);
                  setAttachments(entry.attachments || []);
                  setMood(entry.mood || null);
                  setEnergy(entry.energy || null);
                  setTemplate(entry.template || null);
                  setIsEditing(false);
                }}
                className="px-4 py-3 bg-slate-800/80 text-slate-300 rounded-xl hover:bg-slate-700/80 font-medium transition-all duration-200 min-h-[44px]"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Read-only view */
        <div className="space-y-4">
          {/* Entry Metadata */}
          {(mood || energy || template || attachments.length > 0) && (
            <div className="flex flex-wrap gap-2 p-3 bg-slate-800/50 rounded-lg border border-slate-600/50">
              {mood && (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 rounded-full text-xs">
                  <span>{getMoodEmoji(mood)}</span>
                  <span className="text-slate-300">Mood</span>
                </div>
              )}
              {energy && (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 rounded-full text-xs">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  <span className="text-slate-300">Energy: {energy}/5</span>
                </div>
              )}
              {template && (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 rounded-full text-xs">
                  <FileText className="w-3 h-3 text-cyan-400" />
                  <span className="text-slate-300">{template}</span>
                </div>
              )}
              {attachments.length > 0 && (
                <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/80 rounded-full text-xs">
                  <Image className="w-3 h-3 text-green-400" />
                  <span className="text-slate-300">{attachments.length} attachment{attachments.length !== 1 ? 's' : ''}</span>
                </div>
              )}
            </div>
          )}

          {/* Topics */}
          {topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {topics.map((topic, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none">
            <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
              {content}
            </p>
          </div>

          {/* Attachments Display */}
          {attachments.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-slate-300">Attachments</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="aspect-square bg-slate-800/80 rounded-lg overflow-hidden border border-slate-600/50"
                  >
                    {attachment.type === 'image' ? (
                      <img
                        src={attachment.url}
                        alt={attachment.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={attachment.url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Word Count */}
          <div className="text-xs text-slate-500 text-right">
            {wordCount} words
          </div>
        </div>
      )}

      {/* Templates Modal */}
      <AnimatePresence>
        {showTemplates && (
          <JournalTemplates
            onSelectTemplate={handleTemplateSelect}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEntry; 
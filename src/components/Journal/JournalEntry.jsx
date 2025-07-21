import { useState, useEffect, Suspense, lazy } from 'react';
import { AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Trash2, 
  Mic,
  MicOff,
  Save,
  Sparkles,
  Loader2
} from 'lucide-react';
import MediaAttachment from './MediaAttachment';
import JournalTemplates from './JournalTemplates';
import TopicSelector from './TopicSelector';
import { LoadingButton } from '../ui/LoadingButton.jsx';

// Lazy load RichTextEditor
const RichTextEditor = lazy(() => import('../RichTextEditor'));

// Loading component for rich text editor
const EditorLoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-2">
      <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
      <span className="text-sm text-slate-400">Loading editor...</span>
    </div>
  </div>
);

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
  const [useRichText, setUseRichText] = useState(true); // Default to rich text

  // Mood options
  const moodOptions = [
    { value: 'excited', label: 'Excited', color: 'from-yellow-500 to-orange-500' },
    { value: 'happy', label: 'Happy', color: 'from-green-500 to-emerald-500' },
    { value: 'calm', label: 'Calm', color: 'from-blue-500 to-cyan-500' },
    { value: 'neutral', label: 'Neutral', color: 'from-slate-500 to-gray-500' },
    { value: 'tired', label: 'Tired', color: 'from-purple-500 to-indigo-500' },
    { value: 'stressed', label: 'Stressed', color: 'from-red-500 to-pink-500' },
    { value: 'frustrated', label: 'Frustrated', color: 'from-orange-500 to-red-500' }
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

  // Update content when transcript changes
  useEffect(() => {
    if (transcript && isEditing) {
      if (useRichText) {
        // For rich text, append as plain text
        setContent(prev => prev + (prev ? ' ' : '') + transcript);
      } else {
        // For plain text, append directly
        setContent(prev => prev + (prev ? ' ' : '') + transcript);
      }
    }
  }, [transcript, isEditing, useRichText]);

  // Calculate word count (strip HTML tags for rich text)
  useEffect(() => {
    const textContent = useRichText 
      ? content.replace(/<[^>]*>/g, ' ') // Strip HTML tags
      : content;
    const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [content, useRichText]);

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

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const isToday = (dateString) => {
    const today = new Date();
    const date = new Date(dateString);
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
                className="p-2 text-slate-400 hover:text-slate-50 transition-colors rounded-lg hover:bg-slate-800/50"
                title="Edit entry"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-slate-800/50"
                title="Delete entry"
              >
                <Trash2 className="w-4 h-4" />
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
                  <span className="font-medium">Using template:</span> {template.title || template}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  {template.description || 'Template selected'}
                </p>
              </div>
            )}
          </div>

          {/* Mood and Energy Tracking */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                How are you feeling?
              </label>
              <div className="flex gap-1">
                {moodOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setMood(option.value)}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                      mood === option.value
                        ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50'
                    }`}
                  >
                    <span className="mr-1">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

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
          
          {/* Content Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs sm:text-sm font-medium text-slate-300">
                Your Entry
              </label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">
                  {wordCount} words
                </span>
                <button
                  onClick={() => setUseRichText(!useRichText)}
                  className="text-xs text-slate-400 hover:text-slate-300 transition-colors"
                  title={useRichText ? "Switch to plain text" : "Switch to rich text"}
                >
                  {useRichText ? "Plain Text" : "Rich Text"}
                </button>
              </div>
            </div>
            
            {useRichText ? (
              <Suspense fallback={<EditorLoadingSpinner />}>
                <RichTextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="Write your private thoughts, reflections, or experiences for today..."
                  autoFocus={isEditing}
                  className="min-h-[200px]"
                />
              </Suspense>
            ) : (
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your private thoughts, reflections, or experiences for today..."
                  className="w-full h-32 sm:h-48 p-3 sm:p-4 pr-12 border border-slate-700/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 bg-slate-800/50 text-slate-50 placeholder-slate-400 font-normal text-sm resize-none"
                />
                {/* Voice Input Button */}
                {browserSupportsSpeechRecognition && (
                  <button
                    onClick={onSpeechToggle}
                    disabled={isListening}
                    className="absolute right-3 bottom-3 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-slate-100 transition-all duration-200 disabled:opacity-50"
                    title={isListening ? "Stop recording" : "Start voice input"}
                  >
                    {isListening ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Media Attachments */}
          <div>
            <MediaAttachment
              attachments={attachments}
              onAttachmentsChange={setAttachments}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <LoadingButton
              onClick={handleSave}
              disabled={!content.trim()}
              loading={isLoading}
              loadingText="Saving..."
              size="large"
              className="flex-1"
            >
              <Save className="w-4 h-4" />
              Save Entry
            </LoadingButton>
            {entry ? (
              <LoadingButton
                onClick={() => {
                  setContent(entry.content || '');
                  setTopics(entry.topics || []);
                  setAttachments(entry.attachments || []);
                  setMood(entry.mood || null);
                  setEnergy(entry.energy || null);
                  setTemplate(entry.template || null);
                  setIsEditing(false);
                }}
                variant="secondary"
                size="large"
              >
                Cancel
              </LoadingButton>
            ) : (
              <LoadingButton
                onClick={() => {
                  setContent('');
                  setTopics([]);
                  setAttachments([]);
                  setMood(null);
                  setEnergy(null);
                  setTemplate(null);
                  setIsEditing(false);
                }}
                variant="danger"
                size="large"
              >
                Discard Entry
              </LoadingButton>
            )}
          </div>
        </div>
      ) : (
        // Read-only view
        <div className="space-y-4">
          {/* Mood and Energy Display */}
          {(mood || energy) && (
            <div className="flex flex-wrap gap-2">
              {mood && (
                <span className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-full text-sm font-medium">
                  {moodOptions.find(m => m.value === mood)?.emoji} {moodOptions.find(m => m.value === mood)?.label}
                </span>
              )}
              {energy && (
                <span className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-full text-sm font-medium">
                  Energy: {energy}/5
                </span>
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
            {useRichText ? (
              <div 
                className="text-slate-300 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                {content}
              </p>
            )}
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
            onSelectTemplate={(selectedTemplate) => {
              setTemplate(selectedTemplate);
              // Populate content with template prompts
              const templateContent = selectedTemplate.prompts.map((prompt, index) => 
                `${index + 1}. ${prompt}\n\n`
              ).join('');
              setContent(templateContent);
              setShowTemplates(false);
            }}
            onClose={() => setShowTemplates(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default JournalEntry; 
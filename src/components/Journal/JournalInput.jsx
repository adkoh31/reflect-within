import React from 'react';

const JournalInput = ({ 
  inputText, 
  onInputChange, 
  onSend, 
  onSpeechToggle, 
  isListening, 
  isLoading, 
  browserSupportsSpeechRecognition, 
  transcript, 
  inputRef, 
  handleKeyPress 
}) => (
  <div className="p-6">
    <div className="mb-4">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Write a New Journal Entry</h3>
      <p className="text-sm text-gray-600">Share your workout, daily life, or mental state. The AI will ask a progress-aware question.</p>
    </div>
    
    <div className="flex gap-3 mb-4">
      <input
        ref={inputRef}
        type="text"
        value={inputText}
        onChange={onInputChange}
        onKeyPress={handleKeyPress}
        placeholder="Speak or type your reflection..."
        className="flex-1 px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        style={{ borderRadius: '10px' }}
      />
      <button
        onClick={onSpeechToggle}
        disabled={!browserSupportsSpeechRecognition}
        className={`px-4 py-3 rounded-lg font-medium transition-colors ${
          isListening 
            ? 'bg-red-500 hover:bg-red-600 text-white' 
            : 'bg-blue-500 hover:bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed'
        }`}
        style={{ borderRadius: '10px' }}
        title={!browserSupportsSpeechRecognition ? 'Speech recognition not supported' : isListening ? 'Stop listening' : 'Start listening'}
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <button
        onClick={onSend}
        disabled={!inputText.trim() || isLoading}
        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
        style={{ borderRadius: '10px' }}
      >
        Send
      </button>
    </div>
    
    {isListening && (
      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-700">
          <span className="font-medium">Listening...</span> {transcript || 'Start speaking...'}
        </p>
      </div>
    )}
    
    {!browserSupportsSpeechRecognition && (
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm text-yellow-700">
          Speech recognition not supported in this browser. Please type your thoughts.
        </p>
      </div>
    )}
    
    {isLoading && (
      <div className="flex items-center space-x-2 text-blue-600">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
        <span className="text-sm">Getting a reflective question...</span>
      </div>
    )}
  </div>
);

export default JournalInput; 
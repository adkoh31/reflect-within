import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Image, 
  Video, 
  Play,
  Download
} from 'lucide-react';

const MediaAttachment = ({ attachments = [], onAttachmentsChange, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [loadedImages, setLoadedImages] = useState(new Set());
  const fileInputRef = useRef(null);
  const videoRefs = useRef({});

  const handleFileSelect = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    onAttachmentsChange([...attachments, ...newAttachments]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleRemoveAttachment = (id) => {
    const attachment = attachments.find(a => a.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleVideoPlayPause = (id) => {
    const video = videoRefs.current[id];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    }
  };

  const handleImageLoad = (id) => {
    setLoadedImages(prev => new Set([...prev, id]));
  };

  // Optimized image component with lazy loading
  const OptimizedImage = ({ attachment }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 bg-slate-700/50 animate-pulse rounded-lg" />
        )}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-700/50 rounded-lg">
            <Image className="w-8 h-8 text-slate-400" />
          </div>
        )}
        <img
          src={attachment.url}
          alt={attachment.name}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => {
            setIsLoading(false);
            handleImageLoad(attachment.id);
          }}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
        />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-400 bg-cyan-400/10'
            : 'border-slate-600 hover:border-slate-500'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="space-y-2">
          <div className="flex justify-center">
            <div className="p-3 bg-slate-800/50 rounded-full">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">
              Drop files here or click to upload
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Images and videos supported
            </p>
          </div>
        </div>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-slate-300">Attachments ({attachments.length})</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {attachments.map((attachment) => (
              <motion.div
                key={attachment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="relative group aspect-square bg-slate-800/80 rounded-lg overflow-hidden border border-slate-600/50"
              >
                {/* Media Content */}
                {attachment.type === 'image' ? (
                  <OptimizedImage attachment={attachment} />
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[attachment.id] = el)}
                    src={attachment.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
                    preload="metadata"
                  />
                )}

                {/* Video Play Button */}
                {attachment.type === 'video' && (
                  <button
                    onClick={() => handleVideoPlayPause(attachment.id)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <div className="p-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <Play className="w-4 h-4 text-white" />
                    </div>
                  </button>
                )}

                {/* File Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <p className="text-xs text-white truncate">{attachment.name}</p>
                  <p className="text-xs text-slate-300">{formatFileSize(attachment.size)}</p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAttachment(attachment.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaAttachment; 
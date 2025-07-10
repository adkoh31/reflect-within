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

  return (
    <div className="space-y-4">
      {/* Media Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all duration-200 ${
          isDragOver
            ? 'border-cyan-500 bg-cyan-500/10'
            : 'border-slate-600/50 hover:border-slate-500/50'
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
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          disabled={disabled}
        />
        
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-slate-800/80 rounded-xl">
              <FileText className="w-6 h-6 text-slate-400" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-slate-300 mb-1">
            Add Photos or Videos
          </h3>
          <p className="text-xs text-slate-500">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Supports: JPG, PNG, GIF, MP4, MOV
          </p>
        </div>

        {/* Drag Over Indicator */}
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-cyan-500/20 rounded-xl flex items-center justify-center"
            >
              <div className="text-center">
                <FileText className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                <p className="text-cyan-400 font-medium">Drop files here</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Attachments Grid */}
      {attachments.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-300">
              Attachments ({attachments.length})
            </h4>
            <button
              onClick={() => onAttachmentsChange([])}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear All
            </button>
          </div>
          
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
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[attachment.id] = el)}
                    src={attachment.url}
                    className="w-full h-full object-cover"
                    muted
                    loop
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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white truncate">{attachment.name}</p>
                      <p className="text-xs text-slate-300">{formatFileSize(attachment.size)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {attachment.type === 'image' ? (
                        <Image className="w-3 h-3 text-slate-300" />
                      ) : (
                        <Video className="w-3 h-3 text-slate-300" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Remove Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAttachment(attachment.id);
                  }}
                  className="absolute top-2 right-2 p-1 bg-red-500/80 hover:bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <FileText className="w-3 h-3" />
                </button>

                {/* Download Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const link = document.createElement('a');
                    link.href = attachment.url;
                    link.download = attachment.name;
                    link.click();
                  }}
                  className="absolute top-2 left-2 p-1 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                >
                  <Download className="w-3 h-3" />
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
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const OfflineSyncProgress = ({ 
  syncStatus, 
  syncProgress, 
  pendingOperations, 
  onRetry 
}) => {
  if (syncStatus === 'idle' && pendingOperations.length === 0) {
    return null;
  }

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'bg-blue-500';
      case 'synced':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'synced':
        return <CheckCircle className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing data...';
      case 'synced':
        return 'Sync complete';
      case 'failed':
        return 'Sync failed';
      default:
        return 'Ready to sync';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed bottom-20 left-4 right-4 z-50"
        initial={{ opacity: 0, y: 20, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-slate-800/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-slate-700/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              <span className="text-sm font-medium text-slate-50">
                {getStatusText()}
              </span>
            </div>
            
            {syncStatus === 'failed' && onRetry && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors"
              >
                Retry
              </button>
            )}
          </div>

          {/* Progress bar */}
          {syncStatus === 'syncing' && (
            <div className="w-full bg-slate-700 rounded-full h-2 mb-2">
              <motion.div
                className={`h-2 rounded-full ${getStatusColor()}`}
                initial={{ width: 0 }}
                animate={{ width: `${syncProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Pending operations info */}
          {pendingOperations.length > 0 && (
            <div className="text-xs text-slate-400">
              <div className="flex items-center justify-between">
                <span>{pendingOperations.length} pending operations</span>
                <span>{Math.round(syncProgress)}% complete</span>
              </div>
              
              {/* Operation types */}
              <div className="mt-1 flex flex-wrap gap-1">
                {[...new Set(pendingOperations.map(op => op.type))].map(type => (
                  <span
                    key={type}
                    className="px-2 py-1 bg-slate-700/50 rounded text-xs"
                  >
                    {type.replace('_', ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Failed operations */}
          {pendingOperations.some(op => op.retries > 0) && (
            <div className="mt-2 text-xs text-red-400">
              {pendingOperations.filter(op => op.retries > 0).length} operations failed
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OfflineSyncProgress; 
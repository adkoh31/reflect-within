import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const NetworkStatus = ({ 
  isOnline: appIsOnline, 
  pendingOperations = [], 
  syncStatus = 'idle',
  onRetrySync,
  onManualSync 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [localSyncStatus, setLocalSyncStatus] = useState('idle');

  // Use app sync status if provided, otherwise use local state
  const currentSyncStatus = syncStatus || localSyncStatus;
  const currentIsOnline = appIsOnline !== undefined ? appIsOnline : isOnline;

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      // Trigger sync when coming back online
      if (currentSyncStatus === 'failed' && onManualSync) {
        onManualSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
      setLocalSyncStatus('failed');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentSyncStatus, onManualSync]);

  const handleSync = async () => {
    if (onManualSync) {
      onManualSync();
    } else {
      setLocalSyncStatus('syncing');
      try {
        // Simulate sync process - in real app, this would sync pending operations
        await new Promise(resolve => setTimeout(resolve, 2000));
        setLocalSyncStatus('synced');
        setTimeout(() => setLocalSyncStatus('idle'), 3000);
      } catch (error) {
        setLocalSyncStatus('failed');
      }
    }
  };

  const getSyncIcon = () => {
    switch (currentSyncStatus) {
      case 'syncing':
        return <RefreshCw className="w-4 h-4 animate-spin" />;
      case 'synced':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  const getSyncText = () => {
    switch (currentSyncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'failed':
        return 'Sync failed';
      default:
        return '';
    }
  };

  const getPendingCountText = () => {
    if (pendingOperations.length === 0) return '';
    if (pendingOperations.length === 1) return '1 pending';
    return `${pendingOperations.length} pending`;
  };

  if (currentIsOnline && currentSyncStatus === 'idle' && pendingOperations.length === 0) return null;

  return (
    <>
      {/* Network status indicator */}
      <AnimatePresence>
        {(currentIsOnline || currentSyncStatus !== 'idle' || pendingOperations.length > 0) && (
          <motion.div 
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
              currentIsOnline 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              {currentIsOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {currentIsOnline ? 'Online' : 'Offline'}
              </span>
              {getSyncIcon()}
              {getSyncText() && (
                <span className="text-xs opacity-90">{getSyncText()}</span>
              )}
              {pendingOperations.length > 0 && (
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs opacity-90">{getPendingCountText()}</span>
                </div>
              )}
              {currentSyncStatus === 'failed' && onRetrySync && (
                <button
                  onClick={onRetrySync}
                  className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
                  title="Retry sync"
                >
                  <RefreshCw className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Offline message - Non-blocking notification */}
      <AnimatePresence>
        {showOfflineMessage && (
          <motion.div 
            className="fixed top-4 left-4 z-50 max-w-sm"
            initial={{ opacity: 0, x: -20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-700/50">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <WifiOff className="w-5 h-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-50">
                    You're Offline
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">
                    Your reflections will be saved locally and synced when you're back online
                  </p>
                </div>
                <button
                  onClick={() => setShowOfflineMessage(false)}
                  className="text-slate-400 hover:text-slate-300 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Offline features info */}
              <div className="space-y-2 text-xs text-slate-400">
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Journal entries saved locally</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                  <span>Basic AI features available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                  <span>Advanced insights require connection</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync status toast */}
      <AnimatePresence>
        {currentSyncStatus === 'synced' && (
          <motion.div 
            className="fixed bottom-4 right-4 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-green-500/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Data synced successfully</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending operations indicator */}
      <AnimatePresence>
        {pendingOperations.length > 0 && currentIsOnline && currentSyncStatus === 'idle' && (
          <motion.div 
            className="fixed bottom-4 left-4 z-50"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center space-x-2 bg-amber-500/90 text-white px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">{getPendingCountText()} operations</span>
              <button
                onClick={handleSync}
                className="ml-2 p-1 rounded hover:bg-white/20 transition-colors"
                title="Sync now"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NetworkStatus; 
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const NetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle', 'syncing', 'synced', 'failed'

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
      // Trigger sync when coming back online
      if (syncStatus === 'failed') {
        handleSync();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncStatus]);

  const handleSync = async () => {
    setSyncStatus('syncing');
    try {
      // Simulate sync process - in real app, this would sync pending operations
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSyncStatus('synced');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (error) {
      setSyncStatus('failed');
    }
  };

  const getSyncIcon = () => {
    switch (syncStatus) {
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
    switch (syncStatus) {
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

  if (isOnline && syncStatus === 'idle') return null;

  return (
    <>
      {/* Network status indicator */}
      <AnimatePresence>
        {(isOnline || syncStatus !== 'idle') && (
          <motion.div 
            className="fixed top-4 right-4 z-50"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg shadow-lg backdrop-blur-sm ${
              isOnline 
                ? 'bg-green-500/90 text-white' 
                : 'bg-red-500/90 text-white'
            }`}>
              {isOnline ? (
                <Wifi className="w-4 h-4" />
              ) : (
                <WifiOff className="w-4 h-4" />
              )}
              <span className="text-sm font-medium">
                {isOnline ? 'Online' : 'Offline'}
              </span>
              {getSyncIcon()}
              {getSyncText() && (
                <span className="text-xs opacity-90">{getSyncText()}</span>
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
                    Your reflections will be saved locally
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sync status toast */}
      <AnimatePresence>
        {syncStatus === 'synced' && (
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
    </>
  );
};

export default NetworkStatus; 
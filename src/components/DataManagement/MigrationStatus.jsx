import React from 'react';
import { motion } from 'framer-motion';
import { 
  Database, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Download,
  Upload,
  Archive,
  RefreshCw
} from 'lucide-react';

const MigrationStatus = ({ 
  migrationStatus, 
  isLoading, 
  error, 
  dataStats,
  onRetry,
  onCleanup 
}) => {
  if (!migrationStatus) return null;

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-6 h-6 animate-spin text-blue-500" />;
    }
    
    if (error) {
      return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
    
    if (migrationStatus.completed) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    
    return <Database className="w-6 h-6 text-slate-500" />;
  };

  const getStatusText = () => {
    if (isLoading) {
      return 'Migrating your data...';
    }
    
    if (error) {
      return 'Migration failed';
    }
    
    if (migrationStatus.completed) {
      return 'Migration completed';
    }
    
    return 'Migration needed';
  };

  const getStatusDescription = () => {
    if (isLoading) {
      return 'We\'re upgrading your data to the new format. This may take a few moments.';
    }
    
    if (error) {
      return `Error: ${error}. Please try again or contact support.`;
    }
    
    if (migrationStatus.completed) {
      return `Your data was successfully migrated on ${migrationStatus.date?.toLocaleDateString()}.`;
    }
    
    return 'Your data needs to be migrated to the new format for better performance and features.';
  };

  const getDataStatsDisplay = () => {
    if (!dataStats) return null;

    return (
      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Journal Entries</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{dataStats.journalEntries}</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Chat Messages</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{dataStats.chatMessages}</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Tracking Data</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">{dataStats.trackingData}</p>
        </div>
        
        <div className="bg-slate-50 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700">Data Size</span>
          </div>
          <p className="text-lg font-semibold text-slate-900">
            {(dataStats.dataSize / 1024).toFixed(1)} KB
          </p>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-start gap-4">
        {getStatusIcon()}
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-1">
            {getStatusText()}
          </h3>
          
          <p className="text-slate-600 mb-4">
            {getStatusDescription()}
          </p>
          
          {migrationStatus.completed && dataStats && (
            <>
              <div className="mb-4">
                <h4 className="text-sm font-medium text-slate-700 mb-2">
                  Migration Summary
                </h4>
                {getDataStatsDisplay()}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={onCleanup}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cleanup Old Data
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Refresh App
                </button>
              </div>
            </>
          )}
          
          {error && (
            <div className="flex gap-3">
              <button
                onClick={onRetry}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Retry Migration
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="mt-4">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <motion.div
              className="bg-blue-500 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>
          <p className="text-xs text-slate-500 mt-2 text-center">
            Please don't close this window during migration
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default MigrationStatus; 
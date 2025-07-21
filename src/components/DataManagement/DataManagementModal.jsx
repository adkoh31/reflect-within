import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  HardDrive,
  RefreshCw
} from 'lucide-react';
import { LoadingButton } from '../ui/LoadingButton.jsx';
import { 
  exportJournalEntriesAsPDF, 
  exportChatAsPDF, 
  exportDataAsJSON, 
  importDataFromJSON,
  createBackup,
  restoreFromBackup,
  getDataStats,
  clearAllData
} from '../../utils/dataManagement';
import { safeFormatDate, safeFormatTime } from '../../utils/dateUtils';

const DataManagementModal = ({ isOpen, onClose, journalEntries = {}, chatMessages = [] }) => {
  const [activeTab, setActiveTab] = useState('export');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [stats, setStats] = useState(null);
  const fileInputRef = React.useRef(null);

  // Load stats when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setStats(getDataStats());
    }
  }, [isOpen]);

  const showMessage = (type, text, duration = 3000) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), duration);
  };

  const handleExportJournalPDF = async () => {
    setIsLoading(true);
    try {
      const result = await exportJournalEntriesAsPDF(journalEntries);
      if (result.success) {
        showMessage('success', `Journal exported as PDF: ${result.filename}`);
      } else {
        showMessage('error', `Export failed: ${result.error}`);
      }
    } catch (error) {
      showMessage('error', 'Export failed: Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportChatPDF = async () => {
    setIsLoading(true);
    try {
      const result = await exportChatAsPDF(chatMessages);
      if (result.success) {
        showMessage('success', `Chat exported as PDF: ${result.filename}`);
      } else {
        showMessage('error', `Export failed: ${result.error}`);
      }
    } catch (error) {
      showMessage('error', 'Export failed: Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = async () => {
    setIsLoading(true);
    try {
      const data = {
        journalEntries,
        chatMessages,
        userPreferences: {
          theme: localStorage.getItem('reflectWithin_theme') || 'auto',
          isPremium: localStorage.getItem('reflectWithin_isPremium') === 'true'
        },
        insights: JSON.parse(localStorage.getItem('reflectWithin_insights') || '{}'),
        stats: getDataStats()
      };

      const result = exportDataAsJSON(data);
      if (result.success) {
        showMessage('success', `Data exported as JSON: ${result.filename}`);
        // Update last backup timestamp
        localStorage.setItem('reflectWithin_last_backup', new Date().toISOString());
        setStats(getDataStats());
      } else {
        showMessage('error', `Export failed: ${result.error}`);
      }
    } catch (error) {
      showMessage('error', 'Export failed: Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportJSON = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const result = await importDataFromJSON(file);
      if (result.success) {
        showMessage('success', `Data imported successfully from ${file.name}`);
        // Refresh stats
        setStats(getDataStats());
        // Trigger page reload to reflect imported data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        showMessage('error', `Import failed: ${result.error}`);
      }
    } catch (error) {
      showMessage('error', 'Import failed: Invalid file format');
    } finally {
      setIsLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleCreateBackup = async () => {
    setIsLoading(true);
    try {
      const result = createBackup();
      if (result.success) {
        const exportResult = exportDataAsJSON(result.backup.data, `reflectwithin_backup_${new Date().toISOString().split('T')[0]}.json`);
        if (exportResult.success) {
          showMessage('success', `Backup created: ${exportResult.filename}`);
          localStorage.setItem('reflectWithin_last_backup', new Date().toISOString());
          setStats(getDataStats());
        } else {
          showMessage('error', 'Backup creation failed');
        }
      } else {
        showMessage('error', `Backup failed: ${result.error}`);
      }
    } catch (error) {
      showMessage('error', 'Backup failed: Unexpected error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        const result = clearAllData();
        if (result.success) {
          showMessage('success', `Cleared ${result.cleared} data items`);
          setStats(getDataStats());
          // Trigger page reload to reflect cleared data
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showMessage('error', `Clear failed: ${result.error}`);
        }
      } catch (error) {
        showMessage('error', 'Clear failed: Unexpected error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const tabs = [
    { id: 'export', label: 'Export', icon: Download },
    { id: 'import', label: 'Import', icon: Upload },
    { id: 'backup', label: 'Backup', icon: HardDrive },
    { id: 'stats', label: 'Statistics', icon: Database }
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-700/50">
            <div className="flex items-center space-x-3">
              <HardDrive className="w-6 h-6 text-cyan-400" />
              <h2 className="text-xl font-semibold text-slate-50">Data Management</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-700/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-cyan-400 border-b-2 border-cyan-400 bg-slate-800/50'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            <AnimatePresence mode="wait">
              {activeTab === 'export' && (
                <motion.div
                  key="export"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-slate-300 mb-4">
                    Export your data in different formats for backup or sharing.
                  </div>

                  <div className="grid gap-4">
                    <LoadingButton
                      onClick={handleExportJournalPDF}
                      disabled={Object.keys(journalEntries).length === 0}
                      loading={isLoading}
                      loadingText="Exporting..."
                      variant="secondary"
                      size="large"
                      className="flex items-center space-x-3 p-4 w-full justify-start"
                    >
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="font-medium text-slate-50">Export Journal as PDF</div>
                        <div className="text-sm text-slate-400">
                          {Object.keys(journalEntries).length} entries
                        </div>
                      </div>
                    </LoadingButton>

                    <LoadingButton
                      onClick={handleExportChatPDF}
                      disabled={chatMessages.length === 0}
                      loading={isLoading}
                      loadingText="Exporting..."
                      variant="secondary"
                      size="large"
                      className="flex items-center space-x-3 p-4 w-full justify-start"
                    >
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="font-medium text-slate-50">Export Chat as PDF</div>
                        <div className="text-sm text-slate-400">
                          {chatMessages.length} messages
                        </div>
                      </div>
                    </LoadingButton>

                    <LoadingButton
                      onClick={handleExportJSON}
                      loading={isLoading}
                      loadingText="Exporting..."
                      variant="secondary"
                      size="large"
                      className="flex items-center space-x-3 p-4 w-full justify-start"
                    >
                      <FileText className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="font-medium text-slate-50">Export All Data as JSON</div>
                        <div className="text-sm text-slate-400">
                          Complete backup with all data
                        </div>
                      </div>
                    </LoadingButton>
                  </div>
                </motion.div>
              )}

              {activeTab === 'import' && (
                <motion.div
                  key="import"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-slate-300 mb-4">
                    Import data from a previously exported JSON backup file.
                  </div>

                  <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-600/50">
                    <div className="flex items-center space-x-3 mb-3">
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium text-slate-50">Important</span>
                    </div>
                    <div className="text-sm text-slate-300 space-y-2">
                      <p>• Importing will replace existing data</p>
                      <p>• Make sure to backup your current data first</p>
                      <p>• Only JSON files exported from Myra are supported</p>
                    </div>
                  </div>

                  <LoadingButton
                    onClick={handleImportJSON}
                    loading={isLoading}
                    loadingText="Importing..."
                    variant="primary"
                    size="large"
                    className="w-full flex items-center justify-center space-x-3"
                  >
                    <Upload className="w-5 h-5" />
                    <span>Select JSON File to Import</span>
                  </LoadingButton>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </motion.div>
              )}

              {activeTab === 'backup' && (
                <motion.div
                  key="backup"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-slate-300 mb-4">
                    Create comprehensive backups and manage your data.
                  </div>

                  <div className="grid gap-4">
                    <LoadingButton
                      onClick={handleCreateBackup}
                      loading={isLoading}
                      loadingText="Creating Backup..."
                      variant="secondary"
                      size="large"
                      className="flex items-center space-x-3 p-4 w-full justify-start"
                    >
                      <HardDrive className="w-5 h-5 text-cyan-400" />
                      <div className="text-left">
                        <div className="font-medium text-slate-50">Create Backup</div>
                        <div className="text-sm text-slate-400">
                          Export all data as JSON backup
                        </div>
                      </div>
                    </LoadingButton>

                    <LoadingButton
                      onClick={handleClearData}
                      loading={isLoading}
                      loadingText="Clearing..."
                      variant="danger"
                      size="large"
                      className="flex items-center space-x-3 p-4 w-full justify-start"
                    >
                      <Trash2 className="w-5 h-5 text-red-400" />
                      <div className="text-left">
                        <div className="font-medium text-slate-50">Clear All Data</div>
                        <div className="text-sm text-slate-400">
                          Permanently delete all local data
                        </div>
                      </div>
                    </LoadingButton>
                  </div>
                </motion.div>
              )}

              {activeTab === 'stats' && (
                <motion.div
                  key="stats"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  <div className="text-sm text-slate-300 mb-4">
                    Overview of your data and storage usage.
                  </div>

                  {stats && (
                    <div className="grid gap-4">
                      <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                        <h3 className="font-medium text-slate-50 mb-3">Data Summary</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Journal Entries:</span>
                            <span className="text-slate-50">{stats.journalEntries}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Chat Messages:</span>
                            <span className="text-slate-50">{stats.chatMessages}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Total Words:</span>
                            <span className="text-slate-50">{stats.totalWords}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Data Size:</span>
                            <span className="text-slate-50">{(stats.backupSize / 1024).toFixed(1)} KB</span>
                          </div>
                        </div>
                      </div>

                      {stats.dateRange && (
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                          <h3 className="font-medium text-slate-50 mb-3">Date Range</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Earliest Entry:</span>
                              <span className="text-slate-50">{safeFormatDate(stats.dateRange.earliest)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Latest Entry:</span>
                              <span className="text-slate-50">{safeFormatDate(stats.dateRange.latest)}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {stats.lastBackup && (
                        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-600/50">
                          <h3 className="font-medium text-slate-50 mb-3">Last Backup</h3>
                          <div className="text-sm text-slate-400">
                            {safeFormatTime(stats.lastBackup)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center">
              <div className="flex items-center space-x-3 text-slate-50">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}
        </motion.div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              className="fixed top-4 right-4 z-60"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
            >
              <div className={`flex items-center space-x-3 p-4 rounded-xl shadow-lg ${
                message.type === 'success' 
                  ? 'bg-green-900/90 border border-green-700/50' 
                  : 'bg-red-900/90 border border-red-700/50'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400" />
                )}
                <span className="text-slate-50 font-medium">{message.text}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
};

export default DataManagementModal; 
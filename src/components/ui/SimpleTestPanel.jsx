import React, { useState } from 'react';

const SimpleTestPanel = ({ isVisible = false, onToggle }) => {
  const [testResults, setTestResults] = useState({});
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState('');

  const runTest = async (testName, testFunction) => {
    setIsRunning(true);
    setCurrentTest(testName);
    
    try {
      const result = await testFunction();
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'success', result, timestamp: new Date().toISOString() }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [testName]: { status: 'error', error: error.message, timestamp: new Date().toISOString() }
      }));
    } finally {
      setIsRunning(false);
      setCurrentTest('');
    }
  };

  const tests = [
    {
      name: 'Network Status',
      description: 'Test network status component',
      function: () => window.OfflineTestUtils.testNetworkStatus()
    },
    {
      name: 'Offline Storage',
      description: 'Test offline data storage',
      function: () => window.OfflineTestUtils.testOfflineStorage()
    },
    {
      name: 'Sync Process',
      description: 'Test sync functionality',
      function: () => window.OfflineTestUtils.testSync()
    },
    {
      name: 'Service Worker',
      description: 'Test service worker registration',
      function: () => window.OfflineTestUtils.testServiceWorker()
    },
    {
      name: 'Comprehensive Test',
      description: 'Run all tests in sequence',
      function: () => window.OfflineTestUtils.runComprehensiveTest()
    }
  ];

  const clearResults = () => {
    setTestResults({});
  };

  const clearTestData = async () => {
    try {
      await window.OfflineTestUtils.clearTestData();
      alert('Test data cleared successfully!');
    } catch (error) {
      alert('Failed to clear test data: ' + error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-4 z-50 w-80 max-h-96 overflow-y-auto bg-slate-800 rounded-xl p-4 shadow-2xl border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <span className="text-cyan-400">🧪</span>
          <h3 className="text-sm font-semibold text-slate-50">Offline Test Panel</h3>
        </div>
        <button
          onClick={onToggle}
          className="text-slate-400 hover:text-slate-300 transition-colors"
        >
          ✕
        </button>
      </div>

      {/* Test Controls */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={clearResults}
          className="flex-1 px-2 py-1 bg-slate-700 hover:bg-slate-600 text-xs text-slate-300 rounded transition-colors"
        >
          Clear Results
        </button>
        <button
          onClick={clearTestData}
          className="flex-1 px-2 py-1 bg-red-600 hover:bg-red-700 text-xs text-white rounded transition-colors"
        >
          Clear Data
        </button>
      </div>

      {/* Test List */}
      <div className="space-y-2">
        {tests.map((test) => {
          const result = testResults[test.name];
          const isCurrentlyRunning = isRunning && currentTest === test.name;
          
          return (
            <div
              key={test.name}
              className="bg-slate-700 rounded-lg p-3 border border-slate-600"
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-slate-50">{test.name}</h4>
                <div className="flex items-center space-x-2">
                  {result && <span>{getStatusIcon(result.status)}</span>}
                  {isCurrentlyRunning && <span className="animate-spin">🔄</span>}
                </div>
              </div>
              
              <p className="text-xs text-slate-400 mb-2">{test.description}</p>
              
              <button
                onClick={() => runTest(test.name, test.function)}
                disabled={isRunning}
                className={`w-full px-2 py-1 text-xs rounded transition-colors ${
                  isCurrentlyRunning
                    ? 'bg-cyan-600 text-white cursor-not-allowed'
                    : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                }`}
              >
                {isCurrentlyRunning ? 'Running...' : 'Run Test'}
              </button>

              {/* Test Results */}
              {result && (
                <div className="mt-2 p-2 bg-slate-600 rounded text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-medium ${
                      result.status === 'success' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {result.status === 'success' ? '✅ Passed' : '❌ Failed'}
                    </span>
                    <span className="text-slate-400">
                      {new Date(result.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  {result.status === 'success' && result.result && (
                    <pre className="text-xs text-slate-300 overflow-x-auto">
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  )}
                  
                  {result.status === 'error' && result.error && (
                    <div className="text-red-400 text-xs">
                      Error: {result.error}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-4 border-t border-slate-600">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => window.OfflineTestUtils.simulateOffline()}
            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-xs text-white rounded transition-colors"
          >
            Go Offline
          </button>
          <button
            onClick={() => window.OfflineTestUtils.simulateOnline()}
            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-xs text-white rounded transition-colors"
          >
            Go Online
          </button>
        </div>
      </div>
    </div>
  );
};

export default SimpleTestPanel; 
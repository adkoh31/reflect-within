import React from 'react';

const TabNavigation = ({ activeTab, onTabChange }) => (
  <div className="px-4 py-3">
    <div className="bg-white rounded-2xl shadow-sm p-1">
      <div className="flex">
        <button
          onClick={() => onTabChange('chat')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'chat'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
            </svg>
            <span>Chat</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('journal')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'journal'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Journal</span>
          </div>
        </button>
        <button
          onClick={() => onTabChange('insights')}
          className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            activeTab === 'insights'
              ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md'
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>Insights</span>
          </div>
        </button>
      </div>
    </div>
  </div>
);

export default TabNavigation; 
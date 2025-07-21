import React from 'react';

const PremiumToggle = ({ isPremium, onToggle }) => (
  <div className="max-w-4xl mx-auto px-6 py-2">
    <div className="bg-white rounded-lg shadow-sm p-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">Premium Features</h3>
          <p className="text-xs text-gray-500">Enable server-side storage and enhanced insights</p>
        </div>
        <button
          onClick={onToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            isPremium ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              isPremium ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  </div>
);

export default PremiumToggle; 
import React from 'react';

const DisclaimerModal = ({ showDisclaimer, onClose }) => {
  if (!showDisclaimer) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6" style={{ borderRadius: '10px' }}>
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Welcome to ReflectWithin</h3>
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            ReflectWithin is designed for self-reflection and personal growth, not as a substitute for professional therapy or mental health treatment. 
            If you're experiencing mental health concerns, please contact a qualified professional or call 988 in the US for support.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            style={{ borderRadius: '10px' }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default DisclaimerModal; 
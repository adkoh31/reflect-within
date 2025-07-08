import React from 'react';
import ThemeChart from './ThemeChart';
import MoodChart from './MoodChart';

const InsightsDashboard = ({ insights, isGeneratingInsights, isPremium, onPremiumToggle }) => {
  if (!isPremium) {
    return (
      <div className="bg-card rounded-2xl border border-border p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-xl font-light text-foreground mb-2">Premium Insights Dashboard</h2>
          <p className="text-muted-foreground font-light">
            Unlock personalized insights about your fitness and mental well-being patterns
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Discover recurring themes in your reflections</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Track your mood and emotional patterns</span>
          </div>
          <div className="flex items-center space-x-3 text-left">
            <div className="w-2 h-2 bg-primary-400 rounded-full"></div>
            <span className="text-sm text-foreground font-light">Visualize your personal growth journey</span>
          </div>
        </div>
        
        <button
          onClick={onPremiumToggle}
          className="w-full bg-foreground text-background py-3 px-6 rounded-xl font-light hover:bg-muted-foreground transition-colors shadow-md"
        >
          Enable Premium Features
        </button>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden pb-4">
      <div className="p-6 border-b border-border">
        <h2 className="text-xl font-light text-foreground">Your Reflection Insights</h2>
        <p className="text-sm text-muted-foreground mt-1 font-light">
          Discover patterns in your fitness and mental well-being reflections
        </p>
      </div>
      <div className="p-6 space-y-6">
        {isGeneratingInsights ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-primary-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-primary-600 font-light">Analyzing your reflections...</p>
          </div>
        ) : insights.themes.length > 0 ? (
          <>
            <ThemeChart insights={insights} />
            <MoodChart insights={insights} />
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-foreground text-lg font-light mb-2">No insights yet</p>
            <p className="text-muted-foreground text-sm font-light">
              Start reflecting to see patterns in your thoughts
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InsightsDashboard; 
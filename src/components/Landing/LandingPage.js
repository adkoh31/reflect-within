import React from 'react';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
        
        <div className="relative px-6 pt-16 pb-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-white text-2xl font-bold">R</span>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4 leading-tight">
            Reflect Within
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your AI-powered companion for deeper self-reflection and personal growth
          </p>

          {/* CTA Button */}
          <button
            onClick={onGetStarted}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 mb-12"
          >
            Start Your Journey
          </button>

          {/* App Preview */}
          <div className="relative mx-auto max-w-sm">
            <div className="bg-white rounded-3xl shadow-2xl p-6 border border-gray-100">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-sm font-semibold">R</span>
                  </div>
                  <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-gray-700 text-sm">I'm feeling overwhelmed with work today...</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 justify-end">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl px-4 py-3 max-w-xs">
                    <p className="text-white text-sm">What's one small step you could take today to feel more in control?</p>
                  </div>
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          Why ReflectWithin?
        </h2>

        <div className="space-y-8">
          {/* Feature 1 */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 leading-relaxed">
                Get thoughtful, personalized questions that help you explore your thoughts and feelings deeper than ever before.
              </p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Progress Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                See your growth over time with detailed insights and patterns from your reflection journey.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice & Text</h3>
              <p className="text-gray-600 leading-relaxed">
                Express yourself naturally with voice-to-text or traditional typing - whatever feels most comfortable.
              </p>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Privacy First</h3>
              <p className="text-gray-600 leading-relaxed">
                Your thoughts are yours alone. We use industry-standard encryption to keep your reflections secure and private.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="px-6 py-16 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-12">
          What People Are Saying
        </h2>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">S</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sarah M.</p>
                <p className="text-sm text-gray-500">Daily user for 3 months</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "ReflectWithin has completely changed how I process my thoughts. The AI questions are surprisingly insightful and help me see things from new perspectives."
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm font-semibold">M</span>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Mike T.</p>
                <p className="text-sm text-gray-500">Weekly user for 6 months</p>
              </div>
            </div>
            <p className="text-gray-700 italic">
              "I love how it remembers my previous reflections and asks follow-up questions. It feels like having a wise friend who really knows me."
            </p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="px-6 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Ready to Start Your Reflection Journey?
        </h2>
        <p className="text-gray-600 mb-8">
          Join thousands of others who are discovering themselves through mindful reflection.
        </p>
        <button
          onClick={onGetStarted}
          className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
        >
          Get Started Free
        </button>
        <p className="text-sm text-gray-500 mt-4">
          No credit card required • Cancel anytime
        </p>
      </div>

      {/* Footer */}
      <div className="px-6 py-8 border-t border-gray-100">
        <div className="text-center text-gray-500 text-sm">
          <p>&copy; 2024 ReflectWithin. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-gray-700">Privacy</a>
            <a href="#" className="hover:text-gray-700">Terms</a>
            <a href="#" className="hover:text-gray-700">Support</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage; 
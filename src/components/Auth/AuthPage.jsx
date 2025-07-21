import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { LampBackground } from '../ui/lamp.jsx';
import { Button } from '../ui/button.jsx';
import { API_ENDPOINTS } from '../../config/api.js';
import ForgotPasswordModal from './ForgotPasswordModal.jsx';
import { MyraLogo } from '../ui/MyraLogo.jsx';

const AuthPage = ({ onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const endpoint = isLogin ? API_ENDPOINTS.AUTH.LOGIN : API_ENDPOINTS.AUTH.REGISTER;
      const response = await axios.post(endpoint, formData);

      // Store token and user data
      localStorage.setItem('reflectWithin_token', response.data.token);
      localStorage.setItem('reflectWithin_user', JSON.stringify(response.data.user));

      onAuthSuccess(response.data.user, response.data.token);
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setFormData({ email: '', password: '', name: '' });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative min-h-screen">
        <LampBackground />
        
        {/* Back Button - Top Left */}
        <div className="absolute top-6 left-6 z-50">
          <button
            onClick={onBack}
            className="flex items-center text-white/70 hover:text-white transition-colors p-2"
            aria-label="Go back"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Main Content - Centered */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full max-w-md mx-auto px-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="flex justify-center mb-8"
            >
              <MyraLogo size="xl" animated={true} />
            </motion.div>

            {/* Header */}
            <motion.div 
              className="mb-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-white text-2xl font-bold mb-2 drop-shadow-lg">
                {isLogin ? 'Welcome Back' : 'Join Myra'}
              </h1>
              <p className="text-white/80 text-sm">
                {isLogin 
                  ? 'Sign in to continue your reflection journey' 
                  : 'Create your account to start reflecting'
                }
              </p>
            </motion.div>

            {/* Form */}
            <motion.div 
              className="bg-black/40 backdrop-blur-md rounded-2xl border border-white/20 p-6 shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required={!isLogin}
                      className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                      placeholder="Enter your full name"
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="your@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 border border-white/20 rounded-xl focus:ring-2 focus:ring-cyan-400 focus:border-transparent bg-white/10 text-white placeholder-white/50 transition-all duration-200 backdrop-blur-sm"
                    placeholder="••••••••"
                  />
                  {!isLogin && (
                    <p className="text-xs text-white/60 mt-1">
                      Must be at least 6 characters long
                    </p>
                  )}
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 transition-colors"
                    >
                      Forgot your password?
                    </button>
                  )}
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-black hover:bg-slate-200 py-4 px-6 rounded-xl font-semibold shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLogin ? 'Signing in...' : 'Creating account...'}
                    </div>
                  ) : (
                    isLogin ? 'Sign In' : 'Create Account'
                  )}
                </Button>
              </form>

              {/* Only show toggle for sign-in page */}
              {isLogin && (
                <div className="mt-8 text-center">
                  <button
                    onClick={toggleMode}
                    className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              )}

              <div className={`pt-6 border-t border-white/20 ${isLogin ? 'mt-8' : 'mt-4'}`}>
                <p className="text-xs text-white/60 text-center">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {showForgotPassword && (
        <ForgotPasswordModal 
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)} 
          onShowLogin={() => setShowForgotPassword(false)}
        />
      )}
    </div>
  );
};

export default AuthPage; 
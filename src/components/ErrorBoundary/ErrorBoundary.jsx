import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Generate unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    this.setState({
      error,
      errorInfo,
      errorId
    });

    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo, errorId);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleGoBack = () => {
    window.history.back();
  };

  render() {
    if (this.state.hasError) {
      const { error, errorId } = this.state;
      
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
          <motion.div
            className="max-w-md w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Error Card */}
            <div className="bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-700/50 p-6 text-center">
              {/* Error Icon */}
              <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              
              {/* Error Title */}
              <h1 className="text-xl font-semibold text-slate-50 mb-2">
                Oops! Something went wrong
              </h1>
              
              {/* Error Message */}
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                We encountered an unexpected error. Don't worry, your data is safe. 
                You can try again or go back to the home page.
              </p>
              
              {/* Error ID for support */}
              {errorId && (
                <div className="bg-slate-800/50 rounded-lg p-3 mb-6">
                  <p className="text-xs text-slate-400 mb-1">Error ID for support:</p>
                  <code className="text-xs text-slate-300 font-mono break-all">
                    {errorId}
                  </code>
                </div>
              )}
              
              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-cyan-500 text-slate-900 py-3 px-4 rounded-xl font-medium hover:bg-cyan-400 transition-colors flex items-center justify-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
                
                <div className="flex space-x-3">
                  <button
                    onClick={this.handleGoBack}
                    className="flex-1 bg-slate-800/80 text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-slate-700/80 transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go Back</span>
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="flex-1 bg-slate-800/80 text-slate-300 py-3 px-4 rounded-xl font-medium hover:bg-slate-700/80 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>Home</span>
                  </button>
                </div>
              </div>
              
              {/* Development Error Details */}
              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-6 text-left">
                  <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                    Error Details (Development)
                  </summary>
                  <div className="mt-2 p-3 bg-slate-800/50 rounded-lg">
                    <pre className="text-xs text-red-300 overflow-auto">
                      {error.toString()}
                    </pre>
                  </div>
                </details>
              )}
            </div>
            
            {/* Contact Support */}
            <div className="mt-4 text-center">
              <p className="text-xs text-slate-400">
                Still having issues? Contact support with error ID: {errorId}
              </p>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
        <motion.div
          className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Error Icon */}
            <div className="mb-6">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Error Message */}
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. Don't worry, your data is safe.
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Reset App
              </button>
            </div>

            {/* Technical Details (Development Only) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                  Technical Details
                </summary>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg text-xs text-gray-600 font-mono overflow-auto max-h-32">
                  <div><strong>Error:</strong> {this.state.error.toString()}</div>
                  <div><strong>Stack:</strong></div>
                  <pre className="whitespace-pre-wrap">{this.state.errorInfo?.componentStack}</pre>
                </div>
              </details>
            )}

            {/* Retry Count */}
            {this.state.retryCount > 0 && (
              <p className="text-xs text-gray-400 mt-4">
                Retry attempt: {this.state.retryCount}
              </p>
            )}
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 
import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

export class ComponentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ComponentErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error for debugging
    if (process.env.NODE_ENV === 'development') {
      console.group('Component Error Details');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleDismiss = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border border-red-200 rounded-xl p-4 m-2"
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertCircle className="w-5 h-5 text-red-400" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-red-800">
                Something went wrong
              </h3>
              <p className="text-sm text-red-600 mt-1">
                This component encountered an error. You can try again or continue using other parts of the app.
              </p>
              
              {/* Action buttons */}
              <div className="flex items-center space-x-2 mt-3">
                <button
                  onClick={this.handleRetry}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Try Again
                </button>
                
                <button
                  onClick={this.handleDismiss}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-3 h-3 mr-1" />
                  Dismiss
                </button>
              </div>

              {/* Development details */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-3">
                  <summary className="text-xs text-red-500 cursor-pointer hover:text-red-600">
                    Technical Details
                  </summary>
                  <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700 font-mono">
                    <div><strong>Error:</strong> {this.state.error.message}</div>
                    {this.state.errorInfo && (
                      <div><strong>Component:</strong> {this.state.errorInfo.componentStack.split('\n')[1]}</div>
                    )}
                  </div>
                </details>
              )}
            </div>
          </div>
        </motion.div>
      );
    }

    return this.props.children;
  }
} 
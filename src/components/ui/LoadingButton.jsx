import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export const LoadingButton = ({ 
  children, 
  loading = false, 
  disabled = false,
  loadingText = null,
  variant = 'primary', // 'primary', 'secondary', 'danger', 'ghost'
  size = 'medium', // 'small', 'medium', 'large'
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses = {
    primary: 'bg-cyan-500 text-slate-900 hover:bg-cyan-400 focus:ring-cyan-500/50 shadow-lg shadow-cyan-500/25',
    secondary: 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-600/50 focus:ring-slate-500/50',
    danger: 'bg-red-500 text-white hover:bg-red-400 focus:ring-red-500/50',
    ghost: 'bg-transparent text-slate-300 hover:bg-slate-800/50 focus:ring-slate-500/50'
  };
  
  const sizeClasses = {
    small: 'px-3 py-1.5 text-xs min-h-[32px]',
    medium: 'px-4 py-2 text-sm min-h-[40px]',
    large: 'px-6 py-3 text-base min-h-[48px]'
  };
  
  const isDisabled = disabled || loading;
  
  return (
    <motion.button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={isDisabled}
      onClick={onClick}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      {...props}
    >
      {loading && (
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
      )}
      {loading && loadingText ? loadingText : children}
    </motion.button>
  );
}; 
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';

const InsightCard = ({ 
  title, 
  subtitle, 
  icon, 
  status, 
  statusColor = 'default',
  children, 
  expandedContent,
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    default: 'bg-slate-100 text-slate-900',
    secondary: 'bg-slate-100 text-slate-900',
    destructive: 'bg-red-100 text-red-900',
    outline: 'border border-slate-200 text-slate-900'
  };

  return (
    <motion.div
      className={`relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Outer glow layers - extend beyond card */}
      <div className="absolute -inset-4 rounded-2xl bg-cyan-500/20 blur-xl opacity-50"></div>
      <div className="absolute -inset-6 rounded-2xl bg-cyan-400/10 blur-2xl opacity-30"></div>
      
      {/* The actual card */}
      <Card className="relative bg-slate-950/95 backdrop-blur-md border-slate-700/50 shadow-xl">
        <CardHeader className="p-4 sm:p-6 pb-3 sm:pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 sm:p-3 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl">
                {icon}
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-slate-50 mb-1">
                  {title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-400">
                  {subtitle}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge 
                variant={statusColor} 
                className={`text-xs px-2 py-1 ${statusColors[statusColor]}`}
              >
                {status}
              </Badge>
              {expandedContent && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1 sm:p-2 text-slate-400 hover:text-slate-200 transition-colors rounded-lg hover:bg-slate-800/50 min-h-[32px] min-w-[32px] flex items-center justify-center"
                >
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="space-y-3 sm:space-y-4">
            {children}
            
            <AnimatePresence>
              {isExpanded && expandedContent && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="pt-3 sm:pt-4 border-t border-slate-700/50">
                    {expandedContent}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default InsightCard; 
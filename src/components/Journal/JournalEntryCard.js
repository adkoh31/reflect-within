import React from 'react';
import { motion } from 'framer-motion';

const JournalEntryCard = ({ entry }) => (
  <motion.div 
    className="bg-card rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow duration-200"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <p className="text-xs text-muted-foreground mb-4 font-light">
      {entry.timestamp}
    </p>
    <div className="space-y-4">
      <div>
        <p className="text-sm font-light text-muted-foreground mb-2">You:</p>
        <p className="text-sm text-foreground bg-muted rounded-xl p-4 font-light leading-relaxed">
          {entry.userInput}
        </p>
      </div>
      <div>
        <p className="text-sm font-light text-muted-foreground mb-2">ReflectWithin:</p>
        <p className="text-sm text-foreground bg-accent rounded-xl p-4 font-light leading-relaxed">
          {entry.aiQuestion}
        </p>
      </div>
    </div>
  </motion.div>
);

export default JournalEntryCard; 
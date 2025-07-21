import React, { memo } from 'react';
import { motion } from 'framer-motion';

const EmptyState = memo(({ 
  type = 'default',
  title,
  subtitle,
  actionText,
  onAction,
  showAction = true 
}) => {
  const getEmptyStateData = () => {
    switch (type) {
      case 'journal':
        return {
          icon: (
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          title: title || "Start your reflection journey!",
          subtitle: subtitle || "Share your thoughts, goals, or how you're feeling today. Every entry helps you grow.",
          actionText: actionText || "Write your first entry",
          prompts: [
            "What's on your mind today?",
            "How are you feeling about your goals?",
            "What's something you're grateful for?",
            "What challenge are you facing?",
            "What's a recent success you want to celebrate?",
            "What's something you're learning about yourself?",
            "How has your mood been lately?",
            "What would you like to improve?"
          ],
          examples: [
            "I'm feeling overwhelmed with work today...",
            "I want to work on my self-confidence...",
            "I had a great conversation with a friend...",
            "I'm excited about a new opportunity..."
          ]
        };
      case 'insights':
        return {
          icon: (
            <svg className="w-24 h-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
          title: title || "Your insights are waiting to be discovered",
          subtitle: subtitle || "Start journaling to see patterns, themes, and progress in your reflection journey.",
          actionText: actionText || "Start journaling",
          prompts: [
            "Reflect on your week so far",
            "What patterns have you noticed?",
            "How have you grown recently?",
            "What's your biggest learning?",
            "What themes keep coming up?",
            "How has your perspective changed?",
            "What's working well for you?",
            "What would you like to understand better?"
          ],
          examples: [
            "I've noticed I'm more stressed on Mondays...",
            "I keep thinking about my career goals...",
            "I feel most energized when I exercise...",
            "I'm learning to be more patient with myself..."
          ]
        };
      case 'chat':
        return {
          icon: (
            <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          ),
          title: title || "Ready to reflect?",
          subtitle: subtitle || "Ask me anything about your thoughts, feelings, or experiences. I'm here to help you explore deeper insights.",
          actionText: actionText || "Start chatting",
          prompts: [
            "I'm feeling overwhelmed today...",
            "I want to work on my self-confidence",
            "I had a challenging conversation",
            "I'm excited about a new opportunity",
            "I'm struggling with a decision",
            "I want to understand my emotions better",
            "I need help processing something",
            "I want to explore my goals"
          ],
          examples: [
            "I'm feeling overwhelmed with work today...",
            "I want to work on my self-confidence...",
            "I had a great conversation with a friend...",
            "I'm excited about a new opportunity..."
          ]
        };
      case 'meditation':
        return {
          icon: (
            <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
          title: title || "Take a moment to breathe",
          subtitle: subtitle || "Reflection is a powerful tool for growth. Start with a simple thought or feeling.",
          actionText: actionText || "Begin reflecting",
          prompts: [
            "How am I feeling right now?",
            "What's bringing me peace today?",
            "What do I need to let go of?",
            "What am I grateful for?",
            "What's on my heart?",
            "What do I need to hear?",
            "What's calling for my attention?",
            "What would serve me right now?"
          ],
          examples: [
            "I'm feeling calm and centered...",
            "I'm grateful for my morning routine...",
            "I need to let go of perfectionism...",
            "I want to focus on what matters most..."
          ]
        };
      default:
        return {
          icon: (
            <svg className="w-24 h-24 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          ),
          title: title || "Nothing here yet",
          subtitle: subtitle || "Get started by creating your first entry.",
          actionText: actionText || "Get started",
          prompts: [
            "What's on your mind?",
            "How are you feeling?",
            "What would you like to explore?",
            "Share a thought or experience",
            "What's important to you?",
            "What are you curious about?",
            "What's challenging you?",
            "What are you celebrating?"
          ],
          examples: [
            "I want to understand myself better...",
            "I'm going through a transition...",
            "I want to work on my personal growth...",
            "I need help processing my thoughts..."
          ]
        };
    }
  };

  const data = getEmptyStateData();

  const handlePromptClick = (prompt) => {
    // This will be handled by the parent component
    if (onAction) {
      onAction(prompt);
    }
  };

  return (
    <motion.div 
      className="flex flex-col items-center justify-center py-12 px-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Icon */}
      <motion.div
        className="mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
      >
        {data.icon}
      </motion.div>

      {/* Title */}
      <motion.h3
        className="text-xl font-light text-foreground mb-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {data.title}
      </motion.h3>

      {/* Subtitle */}
      <motion.p
        className="text-muted-foreground mb-8 max-w-md font-light"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {data.subtitle}
      </motion.p>

      {/* Conversation Starters */}
      <motion.div
        className="w-full max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-muted-foreground mb-4 font-light">Try one of these conversation starters:</p>
        <div className="grid grid-cols-1 gap-3">
          {data.prompts.map((prompt, index) => (
            <motion.button
              key={index}
              onClick={() => handlePromptClick(prompt)}
              className="text-left p-3 bg-card hover:bg-accent rounded-xl border border-border transition-colors duration-200"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm text-foreground font-light">{prompt}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Examples Section */}
      <motion.div
        className="w-full max-w-md mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <p className="text-sm text-muted-foreground mb-4 font-light">Or start with an example:</p>
        <div className="grid grid-cols-1 gap-2">
          {data.examples.map((example, index) => (
            <motion.button
              key={index}
              onClick={() => handlePromptClick(example)}
              className="text-left p-2 bg-primary-50 hover:bg-primary-100 rounded-xl border border-primary-200 transition-colors duration-200"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 + index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="text-sm text-primary-700 italic font-light">"{example}"</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Action Button */}
      {showAction && onAction && (
        <motion.button
          onClick={() => onAction()}
          className="bg-foreground hover:bg-muted-foreground text-background px-6 py-3 rounded-xl font-light transition-colors duration-200 shadow-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {data.actionText}
        </motion.button>
      )}
    </motion.div>
  );
});

EmptyState.displayName = 'EmptyState';

export default EmptyState; 
import { useConversations } from './useConversations.js';
import { useConversationAnalytics } from './useConversationAnalytics.js';

/**
 * Enhanced Hook for managing conversation persistence with advanced memory features
 * Composed from focused hooks for better maintainability and performance
 */
export const useConversationPersistence = (user, isPremium) => {
  // Core conversation management
  const conversations = useConversations(user, isPremium);
  
  // Analytics and insights
  const analytics = useConversationAnalytics(conversations.conversations);

        return {
    // State from conversations
    conversations: conversations.conversations,
    currentConversationId: conversations.currentConversationId,
    currentConversation: conversations.currentConversation,
    isLoadingConversations: conversations.isLoadingConversations,
    memoryInsights: analytics.memoryInsights,
    
    // Actions from conversations
    createNewConversation: conversations.createNewConversation,
    addMessageToConversation: conversations.addMessageToConversation,
    switchToConversation: conversations.switchToConversation,
    deleteConversation: conversations.deleteConversation,
    updateConversationTitle: conversations.updateConversationTitle,
    
    // Getters from conversations
    getConversationMessages: conversations.getConversationMessages,
    getConversationSummary: conversations.getConversationSummary,
    searchConversations: conversations.searchConversations,
    
    // Analytics functions
    getMemoryInsightsForAI: analytics.getMemoryInsightsForAI,
    generateSmartStarters: analytics.generateSmartStarters,
    getDefaultStarters: analytics.getDefaultStarters,
    
    // Utilities from conversations
    extractTopicsFromText: conversations.extractTopicsFromText,
    analyzeEmotionalState: conversations.analyzeEmotionalState
  };
}; 
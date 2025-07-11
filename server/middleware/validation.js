const createDOMPurify = require('dompurify');
const { JSDOM } = require('jsdom');

// Create a DOM environment for DOMPurify
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Content size limits
const MAX_CONTENT_SIZE = 50 * 1024; // 50KB
const MAX_TOPICS_COUNT = 20;
const MAX_TOPIC_LENGTH = 50;
const MAX_TAG_LENGTH = 30;

// Sanitize HTML content from rich text editor
const sanitizeHTML = (html) => {
  if (!html) return '';
  
  // Allow only safe HTML tags and attributes
  const allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote', 'code', 'pre', 'a', 'img', 'mark', 'span'
  ];
  
  const allowedAttributes = {
    'a': ['href', 'title'],
    'img': ['src', 'alt', 'title', 'width', 'height'],
    'span': ['style'],
    '*': ['class']
  };
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: allowedAttributes,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur']
  });
};

// Validate and sanitize journal entry data
const validateJournalEntry = (req, res, next) => {
  try {
    const { content, topics = [], tags = [], attachments = [], mood, energy } = req.body;
    
    // Check content size
    if (content && content.length > MAX_CONTENT_SIZE) {
      return res.status(400).json({
        error: 'Content too large',
        message: `Journal entry content cannot exceed ${MAX_CONTENT_SIZE / 1024}KB`,
        maxSize: MAX_CONTENT_SIZE / 1024
      });
    }
    
    // Sanitize HTML content
    if (content) {
      req.body.content = sanitizeHTML(content);
      
      // Check if content was stripped too much (potential XSS attempt)
      const originalLength = content.length;
      const sanitizedLength = req.body.content.length;
      if (sanitizedLength < originalLength * 0.5) {
        return res.status(400).json({
          error: 'Invalid content',
          message: 'Content contains potentially unsafe elements'
        });
      }
    }
    
    // Validate topics
    if (topics && Array.isArray(topics)) {
      if (topics.length > MAX_TOPICS_COUNT) {
        return res.status(400).json({
          error: 'Too many topics',
          message: `Maximum ${MAX_TOPICS_COUNT} topics allowed`
        });
      }
      
      req.body.topics = topics
        .filter(topic => topic && typeof topic === 'string')
        .map(topic => topic.trim().substring(0, MAX_TOPIC_LENGTH))
        .filter(topic => topic.length > 0);
    } else {
      req.body.topics = [];
    }
    
    // Validate tags
    if (tags && Array.isArray(tags)) {
      req.body.tags = tags
        .filter(tag => tag && typeof tag === 'string')
        .map(tag => tag.trim().substring(0, MAX_TAG_LENGTH))
        .filter(tag => tag.length > 0);
    } else {
      req.body.tags = [];
    }
    
    // Validate attachments
    if (attachments && Array.isArray(attachments)) {
      if (attachments.length > 10) {
        return res.status(400).json({
          error: 'Too many attachments',
          message: 'Maximum 10 attachments allowed'
        });
      }
      
      req.body.attachments = attachments.filter(attachment => 
        attachment && 
        attachment.url && 
        typeof attachment.url === 'string' &&
        attachment.url.startsWith('http')
      );
    } else {
      req.body.attachments = [];
    }
    
    // Validate mood
    if (mood && typeof mood === 'string') {
      const validMoods = ['excited', 'happy', 'calm', 'neutral', 'tired', 'stressed', 'frustrated'];
      if (!validMoods.includes(mood)) {
        return res.status(400).json({
          error: 'Invalid mood',
          message: 'Mood must be one of: ' + validMoods.join(', ')
        });
      }
    }
    
    // Validate energy level
    if (energy !== undefined && energy !== null) {
      const energyNum = parseInt(energy);
      if (isNaN(energyNum) || energyNum < 1 || energyNum > 5) {
        return res.status(400).json({
          error: 'Invalid energy level',
          message: 'Energy level must be between 1 and 5'
        });
      }
      req.body.energy = energyNum;
    }
    
    next();
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      error: 'Validation failed',
      message: 'Internal server error during validation'
    });
  }
};

// Validate user input for search and filtering
const validateSearchInput = (req, res, next) => {
  try {
    const { searchQuery, dateRange, topics, hasAttachments } = req.query;
    
    // Validate search query
    if (searchQuery && typeof searchQuery === 'string') {
      if (searchQuery.length > 200) {
        return res.status(400).json({
          error: 'Search query too long',
          message: 'Search query cannot exceed 200 characters'
        });
      }
      req.query.searchQuery = searchQuery.trim();
    }
    
    // Validate date range
    if (dateRange && typeof dateRange === 'string') {
      const validRanges = ['all', 'today', 'week', 'month', 'custom'];
      if (!validRanges.includes(dateRange)) {
        return res.status(400).json({
          error: 'Invalid date range',
          message: 'Date range must be one of: ' + validRanges.join(', ')
        });
      }
    }
    
    // Validate topics filter
    if (topics && Array.isArray(topics)) {
      req.query.topics = topics
        .filter(topic => topic && typeof topic === 'string')
        .map(topic => topic.trim().substring(0, MAX_TOPIC_LENGTH))
        .filter(topic => topic.length > 0);
    }
    
    // Validate hasAttachments
    if (hasAttachments !== undefined) {
      req.query.hasAttachments = hasAttachments === 'true';
    }
    
    next();
  } catch (error) {
    console.error('Search validation error:', error);
    res.status(500).json({
      error: 'Search validation failed',
      message: 'Internal server error during search validation'
    });
  }
};

module.exports = {
  validateJournalEntry,
  validateSearchInput,
  sanitizeHTML,
  MAX_CONTENT_SIZE,
  MAX_TOPICS_COUNT
}; 
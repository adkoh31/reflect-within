const fs = require('fs');
const path = require('path');

// Enhance training data with Priority 1 improvements
function enhanceTrainingData() {
  console.log('🔧 Enhancing Training Data with Priority 1 Improvements\n');
  
  const filePath = path.join(__dirname, '../fine-tuning-data/current/unified-training-data/CURRENT_WORKING_DATASET.jsonl');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  
  let enhancedCount = 0;
  const enhancedData = [];
  
  lines.forEach((line, index) => {
    try {
      const conversation = JSON.parse(line);
      const enhancedMessages = [];
      
      conversation.messages.forEach(msg => {
        if (msg.role === 'assistant') {
          const enhanced = enhanceResponse(msg.content, index + 1);
          enhancedMessages.push({
            ...msg,
            content: enhanced
          });
          if (enhanced !== msg.content) {
            enhancedCount++;
            console.log(`📝 Enhanced response ${enhancedCount}: Line ${index + 1}`);
          }
        } else {
          enhancedMessages.push(msg);
        }
      });
      
      enhancedData.push({
        ...conversation,
        messages: enhancedMessages
      });
      
    } catch (error) {
      console.error(`Error processing line ${index + 1}:`, error.message);
      // Keep original line if there's an error
      enhancedData.push(JSON.parse(line));
    }
  });
  
  // Update the existing file
  const jsonlContent = enhancedData.map(item => JSON.stringify(item)).join('\n');
  fs.writeFileSync(filePath, jsonlContent);
  
  console.log(`\n✅ Enhancement Complete:`);
  console.log(`- Total responses processed: ${lines.length}`);
  console.log(`- Responses enhanced: ${enhancedCount}`);
  console.log(`- File updated: ${filePath}`);
  
  return {
    enhancedCount,
    totalResponses: lines.length,
    filePath
  };
}

// Enhance individual response
function enhanceResponse(response, lineNumber) {
  const content = response.toLowerCase();
  let enhanced = response;
  
  // 1. Add empathy if missing
  if (!hasEmpathy(content)) {
    enhanced = addEmpathy(enhanced);
  }
  
  // 2. Add specific instructions if missing
  if (!hasSpecificity(content)) {
    enhanced = addSpecificity(enhanced);
  }
  
  // 3. Shorten if too long
  if (enhanced.length > 400) {
    enhanced = shortenResponse(enhanced);
  }
  
  return enhanced;
}

// Check if response has empathy
function hasEmpathy(content) {
  return content.includes('understand') || content.includes('hear') || 
         content.includes('feel') || content.includes('sounds') ||
         content.includes('incredibly') || content.includes('really') ||
         content.includes('can be') || content.includes('must be') ||
         content.includes('sounds like') || content.includes('seems like');
}

// Add empathy to response
function addEmpathy(response) {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return response;
  
  // Add empathetic phrase to the beginning
  const empatheticPhrases = [
    "I understand how challenging this can be.",
    "I hear how difficult this feels.",
    "That sounds really tough.",
    "I can see this is really affecting you.",
    "This must be really frustrating.",
    "I understand this is overwhelming."
  ];
  
  const randomPhrase = empatheticPhrases[Math.floor(Math.random() * empatheticPhrases.length)];
  
  // Insert empathy at the beginning
  return randomPhrase + ' ' + response;
}

// Check if response has specificity
function hasSpecificity(content) {
  return /\d+ (minutes?|sets?|reps?|times?|weeks?|days?)/.test(content) ||
         content.includes('focus on') || content.includes('try') ||
         content.includes('start with') || content.includes('begin with') ||
         content.includes('do this') || content.includes('try this');
}

// Add specificity to response
function addSpecificity(response) {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) return response;
  
  // Add specific instruction
  const specificInstructions = [
    "Try this for 5 minutes and see how it feels.",
    "Start with 3 sets of this exercise.",
    "Focus on this for the next 10 minutes.",
    "Do this 3 times today.",
    "Try this approach for the next week."
  ];
  
  const randomInstruction = specificInstructions[Math.floor(Math.random() * specificInstructions.length)];
  
  // Add instruction before the last sentence
  if (sentences.length > 1) {
    const lastSentence = sentences[sentences.length - 1];
    const otherSentences = sentences.slice(0, -1);
    return otherSentences.join('. ') + '. ' + randomInstruction + ' ' + lastSentence;
  } else {
    return response + ' ' + randomInstruction;
  }
}

// Shorten response if too long
function shortenResponse(response) {
  if (response.length <= 400) return response;
  
  // Extract key components
  const components = extractKeyComponents(response);
  
  // Build shortened response prioritizing valuable content
  let shortened = '';
  
  // 1. Always include empathetic acknowledgment
  if (components.empatheticAcknowledgment) {
    shortened += components.empatheticAcknowledgment;
  }
  
  // 2. Include safety warnings (critical)
  if (components.safetyWarnings.length > 0) {
    shortened += ' ' + components.safetyWarnings[0];
  }
  
  // 3. Include specific instructions (valuable)
  if (components.specificInstructions.length > 0) {
    shortened += ' ' + components.specificInstructions[0];
  }
  
  // 4. Include memory references (personalization)
  if (components.memoryReferences.length > 0) {
    shortened += ' ' + components.memoryReferences[0];
  }
  
  // 5. Include follow-up question (engagement)
  if (components.followUpQuestions.length > 0) {
    shortened += ' ' + components.followUpQuestions[0];
  }
  
  // 6. Include breathing techniques
  if (shortened.length < 200 && components.breathingTechniques.length > 0) {
    shortened += ' ' + components.breathingTechniques[0];
  }
  
  // 7. Include general supportive content
  if (shortened.length < 150 && components.supportiveContent.length > 0) {
    shortened += ' ' + components.supportiveContent[0];
  }
  
  // 8. Fallback: keep first 2-3 sentences
  if (shortened.length < 100) {
    const fallbackContent = getFallbackContent(response);
    if (fallbackContent) {
      shortened = fallbackContent;
    }
  }
  
  // Clean up and ensure proper length
  shortened = cleanUpResponse(shortened);
  
  if (shortened.length > 400) {
    shortened = intelligentTruncate(shortened, 400);
  }
  
  return shortened;
}

// Extract key components from response
function extractKeyComponents(response) {
  const content = response.toLowerCase();
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const components = {
    empatheticAcknowledgment: '',
    safetyWarnings: [],
    specificInstructions: [],
    memoryReferences: [],
    followUpQuestions: [],
    breathingTechniques: [],
    detailedExplanations: [],
    supportiveContent: []
  };
  
  sentences.forEach(sentence => {
    const sentenceLower = sentence.toLowerCase();
    
    // Empathetic acknowledgment
    if (!components.empatheticAcknowledgment && 
        (sentenceLower.includes('understand') || sentenceLower.includes('hear') || 
         sentenceLower.includes('feel') || sentenceLower.includes('sounds') ||
         sentenceLower.includes('incredibly') || sentenceLower.includes('really') ||
         sentenceLower.includes('can be') || sentenceLower.includes('must be') ||
         sentenceLower.includes('sounds like') || sentenceLower.includes('seems like'))) {
      components.empatheticAcknowledgment = sentence.trim();
    }
    
    // Safety warnings
    if (sentenceLower.includes('stop') || sentenceLower.includes('consult') || 
        sentenceLower.includes('professional') || sentenceLower.includes('doctor')) {
      components.safetyWarnings.push(sentence.trim());
    }
    
    // Specific instructions
    if (/\d+ (minutes?|sets?|reps?|times?|weeks?|days?)/.test(sentenceLower) ||
        sentenceLower.includes('focus on') || sentenceLower.includes('try') ||
        sentenceLower.includes('start with') || sentenceLower.includes('begin with')) {
      components.specificInstructions.push(sentence.trim());
    }
    
    // Memory references
    if (sentenceLower.includes('remember') || sentenceLower.includes('looking at') || 
        sentenceLower.includes('noticed') || sentenceLower.includes('pattern')) {
      components.memoryReferences.push(sentence.trim());
    }
    
    // Follow-up questions
    if (sentence.includes('?') && sentence.length < 150) {
      components.followUpQuestions.push(sentence.trim());
    }
    
    // Breathing techniques
    if (sentenceLower.includes('4-7-8') || sentenceLower.includes('breathing') || 
        sentenceLower.includes('inhale') || sentenceLower.includes('exhale')) {
      components.breathingTechniques.push(sentence.trim());
    }
    
    // Detailed explanations (to be removed)
    if (sentenceLower.includes('because') || sentenceLower.includes('this is') || 
        sentenceLower.includes('which means') || sentenceLower.includes('this creates')) {
      components.detailedExplanations.push(sentence.trim());
    }
    
    // General supportive content
    if (sentenceLower.includes('can be') || sentenceLower.includes('great way') ||
        sentenceLower.includes('help') || sentenceLower.includes('support') ||
        sentenceLower.includes('encourage') || sentenceLower.includes('suggest') ||
        sentenceLower.includes('try') || sentenceLower.includes('consider')) {
      components.supportiveContent.push(sentence.trim());
    }
  });
  
  return components;
}

// Fallback content extraction
function getFallbackContent(response) {
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  const meaningfulSentences = sentences.filter(s => 
    s.trim().length > 20 && 
    !s.toLowerCase().includes('because') &&
    !s.toLowerCase().includes('this is') &&
    !s.toLowerCase().includes('which means')
  );
  
  if (meaningfulSentences.length >= 2) {
    return meaningfulSentences.slice(0, 2).join('. ').trim() + '.';
  } else if (meaningfulSentences.length === 1) {
    return meaningfulSentences[0].trim() + '.';
  } else if (sentences.length >= 2) {
    return sentences.slice(0, 2).join('. ').trim() + '.';
  }
  
  return null;
}

// Clean up response
function cleanUpResponse(response) {
  return response
    .replace(/\s+/g, ' ')
    .replace(/\s+([.!?])/g, '$1')
    .replace(/\s+,/g, ',')
    .trim();
}

// Intelligent truncation
function intelligentTruncate(text, maxLength) {
  if (text.length <= maxLength) return text;
  
  const sentences = text.split(/[.!?]+/);
  let result = '';
  
  for (const sentence of sentences) {
    const trimmed = sentence.trim();
    if (trimmed.length === 0) continue;
    
    if ((result + ' ' + trimmed).length <= maxLength) {
      result += (result ? ' ' : '') + trimmed;
    } else {
      break;
    }
  }
  
  if (result.length === 0 || result.length > maxLength) {
    const words = text.split(' ');
    result = '';
    
    for (const word of words) {
      if ((result + ' ' + word).length <= maxLength) {
        result += (result ? ' ' : '') + word;
      } else {
        break;
      }
    }
  }
  
  return result.trim();
}

// Run the enhancement
const result = enhanceTrainingData(); 
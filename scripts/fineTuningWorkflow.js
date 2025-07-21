#!/usr/bin/env node

/**
 * Fine-tuning Workflow Script for ReflectWithin
 * Automates the process of collecting, analyzing, and preparing training data
 */

const fs = require('fs');
const path = require('path');

// Import utilities (you'll need to adjust paths based on your setup)
// const { analyzeConversationForTraining, convertToOpenAIFormat, generateTrainingDataReport } = require('../src/utils/fineTuningDataCollector');
// const { getAllTrainingExamples, exportTrainingData } = require('../src/utils/manualTrainingDataGenerator');

class FineTuningWorkflow {
  constructor() {
    this.outputDir = path.join(__dirname, '../fine-tuning-data');
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Step 1: Collect existing conversations
   */
  async collectExistingConversations() {
    console.log('🔍 Step 1: Collecting existing conversations...');
    
    try {
      // This would typically load from your database or API
      // For now, we'll create a sample structure
      const conversations = this.loadSampleConversations();
      
      const outputPath = path.join(this.outputDir, 'raw-conversations.json');
      fs.writeFileSync(outputPath, JSON.stringify(conversations, null, 2));
      
      console.log(`✅ Collected ${conversations.length} conversations`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return conversations;
    } catch (error) {
      console.error('❌ Error collecting conversations:', error);
      throw error;
    }
  }

  /**
   * Step 2: Analyze conversation quality
   */
  async analyzeConversations(conversations) {
    console.log('📊 Step 2: Analyzing conversation quality...');
    
    try {
      const analysis = {
        totalConversations: conversations.length,
        highQualityCount: 0,
        mediumQualityCount: 0,
        lowQualityCount: 0,
        trainingExamples: [],
        patterns: {},
        issues: {},
        recommendations: []
      };

      conversations.forEach((conversation, index) => {
        // Simulate analysis (replace with actual analysis logic)
        const qualityScore = this.simulateQualityAnalysis(conversation);
        
        if (qualityScore > 0.8) {
          analysis.highQualityCount++;
        } else if (qualityScore > 0.6) {
          analysis.mediumQualityCount++;
        } else {
          analysis.lowQualityCount++;
        }

        // Extract training examples
        const examples = this.extractTrainingExamples(conversation);
        analysis.trainingExamples.push(...examples);
      });

      const outputPath = path.join(this.outputDir, 'conversation-analysis.json');
      fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
      
      console.log(`✅ Analyzed ${conversations.length} conversations`);
      console.log(`📊 Quality breakdown: ${analysis.highQualityCount} high, ${analysis.mediumQualityCount} medium, ${analysis.lowQualityCount} low`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return analysis;
    } catch (error) {
      console.error('❌ Error analyzing conversations:', error);
      throw error;
    }
  }

  /**
   * Step 3: Generate manual training examples
   */
  async generateManualExamples() {
    console.log('✍️ Step 3: Generating manual training examples...');
    
    try {
      const manualExamples = this.createManualExamples();
      
      const outputPath = path.join(this.outputDir, 'manual-examples.json');
      fs.writeFileSync(outputPath, JSON.stringify(manualExamples, null, 2));
      
      console.log(`✅ Generated ${manualExamples.length} manual examples`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return manualExamples;
    } catch (error) {
      console.error('❌ Error generating manual examples:', error);
      throw error;
    }
  }

  /**
   * Step 4: Combine and prepare final dataset
   */
  async prepareFinalDataset(analysis, manualExamples) {
    console.log('🔧 Step 4: Preparing final dataset...');
    
    try {
      const finalDataset = {
        metadata: {
          totalExamples: analysis.trainingExamples.length + manualExamples.length,
          sourceConversations: analysis.totalConversations,
          manualExamples: manualExamples.length,
          generatedAt: new Date().toISOString(),
          version: '1.0.0'
        },
        trainingData: [
          ...analysis.trainingExamples,
          ...manualExamples
        ]
      };

      const outputPath = path.join(this.outputDir, 'final-training-dataset.json');
      fs.writeFileSync(outputPath, JSON.stringify(finalDataset, null, 2));
      
      console.log(`✅ Prepared final dataset with ${finalDataset.metadata.totalExamples} examples`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return finalDataset;
    } catch (error) {
      console.error('❌ Error preparing final dataset:', error);
      throw error;
    }
  }

  /**
   * Step 5: Generate OpenAI format
   */
  async generateOpenAIFormat(finalDataset) {
    console.log('🤖 Step 5: Generating OpenAI format...');
    
    try {
      const openAIFormat = finalDataset.trainingData.map(example => ({
        messages: [
          {
            role: 'system',
            content: 'You are ReflectWithin, an empathetic AI companion focused on fitness, wellness, and personal growth. Always use the user\'s actual name when provided.'
          },
          {
            role: 'user',
            content: example.user || example.messages?.find(m => m.role === 'user')?.content || ''
          },
          {
            role: 'assistant',
            content: example.assistant || example.messages?.find(m => m.role === 'assistant')?.content || ''
          }
        ]
      }));

      const outputPath = path.join(this.outputDir, 'openai-training-data.jsonl');
      
      // Write as JSONL format (one JSON object per line)
      const jsonlContent = openAIFormat.map(example => JSON.stringify(example)).join('\n');
      fs.writeFileSync(outputPath, jsonlContent);
      
      console.log(`✅ Generated OpenAI format with ${openAIFormat.length} examples`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return openAIFormat;
    } catch (error) {
      console.error('❌ Error generating OpenAI format:', error);
      throw error;
    }
  }

  /**
   * Step 6: Generate training report
   */
  async generateTrainingReport(finalDataset, openAIFormat) {
    console.log('📋 Step 6: Generating training report...');
    
    try {
      const report = {
        summary: {
          totalExamples: finalDataset.metadata.totalExamples,
          sourceConversations: finalDataset.metadata.sourceConversations,
          manualExamples: finalDataset.metadata.manualExamples,
          openAIFormatExamples: openAIFormat.length
        },
        qualityMetrics: {
          averageResponseLength: this.calculateAverageResponseLength(openAIFormat),
          questionFrequency: this.calculateQuestionFrequency(openAIFormat),
          empathyIndicators: this.calculateEmpathyIndicators(openAIFormat)
        },
        recommendations: [
          'Review the dataset for consistency in tone and style',
          'Ensure examples cover a wide range of user scenarios',
          'Validate that responses are empathetic and supportive',
          'Check for appropriate use of user names when provided'
        ],
        nextSteps: [
          'Upload the JSONL file to OpenAI for fine-tuning',
          'Monitor training progress and validation loss',
          'Test the new model with sample conversations',
          'Compare performance with the current model'
        ]
      };

      const outputPath = path.join(this.outputDir, 'training-report.md');
      const markdownReport = this.generateMarkdownReport(report);
      fs.writeFileSync(outputPath, markdownReport);
      
      console.log(`✅ Generated training report`);
      console.log(`📁 Saved to: ${outputPath}`);
      
      return report;
    } catch (error) {
      console.error('❌ Error generating training report:', error);
      throw error;
    }
  }

  /**
   * Run the complete workflow
   */
  async runWorkflow() {
    console.log('🚀 Starting Fine-tuning Workflow...\n');
    
    try {
      // Step 1: Collect conversations
      const conversations = await this.collectExistingConversations();
      
      // Step 2: Analyze conversations
      const analysis = await this.analyzeConversations(conversations);
      
      // Step 3: Generate manual examples
      const manualExamples = await this.generateManualExamples();
      
      // Step 4: Prepare final dataset
      const finalDataset = await this.prepareFinalDataset(analysis, manualExamples);
      
      // Step 5: Generate OpenAI format
      const openAIFormat = await this.generateOpenAIFormat(finalDataset);
      
      // Step 6: Generate report
      const report = await this.generateTrainingReport(finalDataset, openAIFormat);
      
      console.log('\n🎉 Fine-tuning workflow completed successfully!');
      console.log(`📊 Total training examples: ${report.summary.totalExamples}`);
      console.log(`📁 All files saved to: ${this.outputDir}`);
      console.log('\n📋 Next steps:');
      report.nextSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
      
    } catch (error) {
      console.error('\n❌ Workflow failed:', error);
      process.exit(1);
    }
  }

  // Helper methods (simplified for demonstration)
  loadSampleConversations() {
    return [
      {
        id: '1',
        messages: [
          { sender: 'user', text: 'I\'m feeling really stressed about work lately', timestamp: '2024-01-01T10:00:00Z' },
          { sender: 'ai', text: 'I can hear how heavy that work stress feels. What\'s been the most challenging part of it lately?', timestamp: '2024-01-01T10:01:00Z' },
          { sender: 'user', text: 'I have this big presentation coming up and I\'m worried I\'ll mess it up', timestamp: '2024-01-01T10:02:00Z' },
          { sender: 'ai', text: 'That presentation anxiety is so real. What specifically are you worried about with the presentation?', timestamp: '2024-01-01T10:03:00Z' }
        ]
      },
      {
        id: '2',
        messages: [
          { sender: 'user', text: 'I\'m trying to get back into working out', timestamp: '2024-01-02T15:00:00Z' },
          { sender: 'ai', text: 'That\'s great! Getting back into a fitness routine can feel both exciting and challenging. What\'s motivating you to start again?', timestamp: '2024-01-02T15:01:00Z' }
        ]
      }
    ];
  }

  simulateQualityAnalysis(conversation) {
    // Simulate quality analysis based on conversation characteristics
    const messageCount = conversation.messages?.length || 0;
    const hasQuestions = conversation.messages?.some(msg => 
      msg.sender === 'ai' && msg.text?.includes('?')
    );
    const hasEmpathy = conversation.messages?.some(msg => 
      msg.sender === 'ai' && (
        msg.text?.includes('hear') || 
        msg.text?.includes('feel') || 
        msg.text?.includes('understand')
      )
    );
    
    let score = 0.5; // Base score
    if (messageCount > 4) score += 0.2;
    if (hasQuestions) score += 0.2;
    if (hasEmpathy) score += 0.1;
    
    return Math.min(score, 1.0);
  }

  extractTrainingExamples(conversation) {
    const examples = [];
    
    for (let i = 0; i < (conversation.messages?.length || 0) - 1; i++) {
      const currentMsg = conversation.messages[i];
      const nextMsg = conversation.messages[i + 1];
      
      if (currentMsg.sender === 'user' && nextMsg.sender === 'ai') {
        examples.push({
          user: currentMsg.text || '',
          assistant: nextMsg.text || '',
          context: this.extractContext(conversation, i),
          quality: this.simulateQualityAnalysis(conversation)
        });
      }
    }
    
    return examples;
  }

  extractContext(conversation, messageIndex) {
    const contextMessages = conversation.messages
      ?.slice(Math.max(0, messageIndex - 2), messageIndex)
      .filter(msg => msg.sender === 'user')
      .map(msg => msg.text)
      .join(' ') || '';
    
    return contextMessages;
  }

  createManualExamples() {
    return [
      {
        user: 'I\'m feeling really discouraged about my fitness progress. I\'ve been working out for months but don\'t see the results I want.',
        assistant: 'I can hear how frustrating that must be. Progress can feel invisible sometimes, even when you\'re putting in the work. What specific results were you hoping to see? And more importantly, how are you measuring your progress beyond just the visible changes?'
      },
      {
        user: 'I\'m having trouble sleeping lately. My mind just won\'t shut off.',
        assistant: 'That sounds really challenging. Sleep is so fundamental to everything else. What\'s been on your mind when you\'re trying to fall asleep? And have you noticed any patterns in what makes it harder or easier to quiet your thoughts?'
      },
      {
        user: 'I want to set some goals but I\'m not sure what\'s realistic for me right now.',
        assistant: 'That\'s a thoughtful approach. Setting realistic goals is so important for sustainable progress. What areas of your life feel most important to focus on right now? And what would success look like to you in each of those areas?'
      }
    ];
  }

  calculateAverageResponseLength(openAIFormat) {
    const lengths = openAIFormat.map(example => {
      const assistantMessage = example.messages.find(m => m.role === 'assistant');
      return assistantMessage?.content?.length || 0;
    });
    
    return lengths.reduce((sum, length) => sum + length, 0) / lengths.length;
  }

  calculateQuestionFrequency(openAIFormat) {
    const questions = openAIFormat.filter(example => {
      const assistantMessage = example.messages.find(m => m.role === 'assistant');
      return assistantMessage?.content?.includes('?');
    });
    
    return (questions.length / openAIFormat.length) * 100;
  }

  calculateEmpathyIndicators(openAIFormat) {
    const empathyWords = ['hear', 'feel', 'understand', 'sounds', 'seems', 'must'];
    const empathetic = openAIFormat.filter(example => {
      const assistantMessage = example.messages.find(m => m.role === 'assistant');
      return empathyWords.some(word => 
        assistantMessage?.content?.toLowerCase().includes(word)
      );
    });
    
    return (empathetic.length / openAIFormat.length) * 100;
  }

  generateMarkdownReport(report) {
    return `# Fine-tuning Training Report

## Summary
- **Total Examples**: ${report.summary.totalExamples}
- **Source Conversations**: ${report.summary.sourceConversations}
- **Manual Examples**: ${report.summary.manualExamples}
- **OpenAI Format Examples**: ${report.summary.openAIFormatExamples}

## Quality Metrics
- **Average Response Length**: ${Math.round(report.qualityMetrics.averageResponseLength)} characters
- **Question Frequency**: ${Math.round(report.qualityMetrics.questionFrequency)}%
- **Empathy Indicators**: ${Math.round(report.qualityMetrics.empathyIndicators)}%

## Recommendations
${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## Next Steps
${report.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

---
*Generated on ${new Date().toLocaleDateString()}*
`;
  }
}

// Run the workflow if this script is executed directly
if (require.main === module) {
  const workflow = new FineTuningWorkflow();
  workflow.runWorkflow();
}

module.exports = FineTuningWorkflow; 
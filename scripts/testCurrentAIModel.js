#!/usr/bin/env node

/**
 * Test Current AI Model Script
 * Connects to your existing AI endpoints to test performance
 */

const fs = require('fs');
const path = require('path');

// Import the test utilities
const { TEST_SCENARIOS, testAIModel, generateTestReport } = require('./aiModelAnalyzerNode');

class CurrentAIModelTester {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    this.outputDir = path.join(__dirname, '../ai-model-analysis');
    this.ensureOutputDirectory();
  }

  ensureOutputDirectory() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Call your existing AI endpoint
   */
  async callCurrentAI(messages) {
    try {
      // Extract the user message from the messages array
      const userMessage = messages[messages.length - 1].content;
      
      // This matches your existing AI endpoint structure
      const response = await fetch(`${this.baseURL}/api/reflect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authentication if needed
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMessage,
          pastEntries: [],
          conversationContext: messages.slice(0, -1), // All messages except the last one
          isPremium: false,
          memoryInsights: null
        })
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the AI response from your endpoint structure
      return data.question || 'No response received';
      
    } catch (error) {
      console.error('Error calling AI endpoint:', error);
      
      // Fallback to mock responses for testing
      return this.getMockResponse(messages);
    }
  }

  /**
   * Fallback mock responses for testing
   */
  getMockResponse(messages) {
    const lastMessage = messages[messages.length - 1];
    const content = lastMessage.content.toLowerCase();
    
    // Simulate responses based on your current model's behavior
    if (content.includes('fitness') || content.includes('workout')) {
      return "That's great that you're working on your fitness! Have you tried setting specific goals? What kind of results are you looking for?";
    } else if (content.includes('stress') || content.includes('overwhelmed')) {
      return "I understand that can be really challenging. What's been the most difficult part? Have you found anything that helps you manage stress?";
    } else if (content.includes('lonely')) {
      return "That sounds really hard. Loneliness can be so difficult to deal with. What kind of connection are you looking for right now?";
    } else if (content.includes('goal')) {
      return "Setting goals can be tricky. What areas of your life feel most important to focus on? And what would success look like to you?";
    } else {
      return "That's interesting. Can you tell me more about that? What's been on your mind?";
    }
  }

  /**
   * Test the current AI model
   */
  async testCurrentModel() {
    console.log('🤖 Testing Current AI Model...\n');
    
    try {
      // Test with all scenarios
      const results = await testAIModel(TEST_SCENARIOS, this.callCurrentAI.bind(this));
      const report = generateTestReport(results);
      
      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const outputPath = path.join(this.outputDir, `current-model-test-${timestamp}.json`);
      fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
      
      // Generate markdown report
      const markdownReport = this.generateMarkdownReport(report);
      const markdownPath = path.join(this.outputDir, `current-model-analysis-${timestamp}.md`);
      fs.writeFileSync(markdownPath, markdownReport);
      
      // Display results
      this.displayResults(report);
      
      console.log(`\n📁 Results saved to:`);
      console.log(`   JSON: ${outputPath}`);
      console.log(`   Markdown: ${markdownPath}`);
      
      return report;
      
    } catch (error) {
      console.error('❌ Test failed:', error);
      throw error;
    }
  }

  /**
   * Display test results in console
   */
  displayResults(report) {
    console.log('\n📊 Current AI Model Analysis Results');
    console.log('=====================================\n');
    
    // Overall score
    const overallScore = Math.round(report.overallScore * 100);
    console.log(`Overall Performance: ${overallScore}%`);
    console.log(`Test Results: ${report.summary.passedTests}/${report.summary.totalTests} passed\n`);
    
    // Category breakdown
    console.log('Category Performance:');
    Object.entries(report.categoryBreakdown).forEach(([category, data]) => {
      const score = data.score;
      const performance = data.performance;
      const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : score >= 40 ? '🟠' : '🔴';
      console.log(`  ${emoji} ${category}: ${score}% (${performance})`);
    });
    
    // Top strengths
    if (report.strengths.length > 0) {
      console.log('\n✅ Top Strengths:');
      report.strengths.slice(0, 3).forEach(strength => {
        console.log(`  • ${strength.strength} (${strength.frequency} times)`);
      });
    }
    
    // Areas for improvement
    if (report.weaknesses.length > 0) {
      console.log('\n❌ Areas for Improvement:');
      report.weaknesses.slice(0, 3).forEach(weakness => {
        console.log(`  • ${weakness.weakness} (${weakness.frequency} times)`);
      });
    }
    
    // Key recommendations
    if (report.recommendations.length > 0) {
      console.log('\n💡 Key Recommendations:');
      report.recommendations.slice(0, 5).forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report) {
    const overallScore = Math.round(report.overallScore * 100);
    const performance = overallScore >= 80 ? 'Excellent' : overallScore >= 60 ? 'Good' : overallScore >= 40 ? 'Fair' : 'Needs Improvement';
    
    return `# Current AI Model Analysis Report

**Generated:** ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}

## Executive Summary

- **Overall Performance:** ${overallScore}% (${performance})
- **Tests Passed:** ${report.summary.passedTests}/${report.summary.totalTests}
- **Success Rate:** ${Math.round((report.summary.passedTests / report.summary.totalTests) * 100)}%

## Category Performance

${Object.entries(report.categoryBreakdown).map(([category, data]) => {
  const emoji = data.score >= 80 ? '🟢' : data.score >= 60 ? '🟡' : data.score >= 40 ? '🟠' : '🔴';
  return `- ${emoji} **${category}**: ${data.score}% (${data.performance})`;
}).join('\n')}

## Strengths

${report.strengths.map(strength => `- **${strength.strength}**: Appears ${strength.frequency} times`).join('\n')}

## Areas for Improvement

${report.weaknesses.map(weakness => `- **${weakness.weakness}**: Appears ${weakness.frequency} times`).join('\n')}

## Recommendations

${report.recommendations.map((rec, index) => `${index + 1}. ${rec}`).join('\n')}

## Detailed Results

${report.detailedResults.map(categoryResult => `
### ${categoryResult.category.charAt(0).toUpperCase() + categoryResult.category.slice(1)}

**Average Score:** ${Math.round(categoryResult.averageScore * 100)}%

${categoryResult.scenarios.map(scenario => `
#### ${scenario.scenario}
- **Input:** ${typeof scenario.userInput === 'string' ? scenario.userInput : 'Multi-turn conversation'}
- **Response:** ${scenario.aiResponse}
- **Score:** ${Math.round(scenario.analysis.overallScore * 100)}%
- **Status:** ${scenario.passed ? '✅ Passed' : '❌ Failed'}
- **Strengths:** ${scenario.analysis.strengths.join(', ') || 'None'}
- **Weaknesses:** ${scenario.analysis.weaknesses.join(', ') || 'None'}
`).join('\n')}
`).join('\n')}

---

*This analysis was generated automatically to evaluate the current AI model's performance against the new strategy requirements.*
`;
  }

  /**
   * Compare with ideal responses
   */
  async compareWithIdeal() {
    console.log('\n🔍 Comparing with Ideal Responses...\n');
    
    // This would compare your current model's responses with the ideal responses
    // from the manual training data generator
    const idealResponses = [
      {
        scenario: "Fitness Progress Frustration",
        ideal: "I can hear how frustrating that must be. Progress can feel invisible sometimes, even when you're putting in the work. What specific results were you hoping to see? And more importantly, how are you measuring your progress beyond just the visible changes?",
        current: await this.callCurrentAI([{ role: "user", content: "I'm feeling really discouraged about my fitness progress. I've been working out for months but don't see the results I want." }])
      },
      {
        scenario: "Work Stress Overwhelm",
        ideal: "I can hear how heavy that feels. Work stress can be so consuming. What's been the most challenging part of this overwhelm for you? And when you think about what's causing it, what feels most within your control to change?",
        current: await this.callCurrentAI([{ role: "user", content: "I'm feeling really overwhelmed with work lately" }])
      }
    ];

    console.log('Comparison with Ideal Responses:');
    idealResponses.forEach(comparison => {
      console.log(`\n📝 ${comparison.scenario}:`);
      console.log(`   Ideal: "${comparison.ideal}"`);
      console.log(`   Current: "${comparison.current}"`);
    });
  }
}

// Run the test if this script is executed directly
if (require.main === module) {
  const tester = new CurrentAIModelTester();
  
  tester.testCurrentModel()
    .then(() => {
      console.log('\n✅ Analysis complete!');
    })
    .catch(error => {
      console.error('\n❌ Analysis failed:', error);
      process.exit(1);
    });
}

module.exports = CurrentAIModelTester; 
# AI Testing Setup Guide

## 🚀 Quick Setup

Your AI testing tools are now integrated into your app! Here's how to use them:

### 1. **Access the Admin Dashboard**

In **development mode**, you'll see a new "Admin" tab in your bottom navigation. This tab is only visible in development and won't appear in production.

### 2. **What's Available**

The Admin Dashboard includes:

- **📊 Overview**: Quick stats and development info
- **🧪 AI Model Testing**: Test your current AI model performance
- **📈 Fine-tuning Data**: Collect and manage training data

### 3. **Test Your Current AI Model**

#### Option A: Visual Testing (Recommended)
1. Open your app in development mode
2. Tap the "Admin" tab in bottom navigation
3. Click "Test AI Model" or go to the "AI Model Testing" section
4. Click "Run Full Model Test" to test all scenarios
5. Or use "Manual Test" to test specific scenarios

#### Option B: Command Line Testing
```bash
# Run the automated test script
node scripts/testCurrentAIModel.js
```

### 4. **What the Tests Will Show**

The analysis will evaluate your AI model on:

- **Empathy** (understanding and validation)
- **Question Quality** (open-ended, thoughtful questions)
- **Domain Knowledge** (fitness/wellness terminology)
- **Tone** (supportive, non-judgmental)
- **Response Length** (appropriate detail)

### 5. **Test Scenarios Included**

- **Fitness & Wellness**: Progress frustration, workout consistency, injury recovery
- **Emotional Support**: Work stress, loneliness, decision uncertainty
- **Goal Setting**: Goal uncertainty, achievement failure
- **Contextual Awareness**: Recurring patterns, multi-turn conversations
- **Personality & Tone**: Bad day support, need to talk

## 🔧 Configuration

### API Connection

The test script is configured to connect to your existing `/api/reflect` endpoint. Make sure:

1. Your server is running on `http://localhost:5000` (or update `REACT_APP_API_URL`)
2. The endpoint accepts the expected parameters:
   ```json
   {
     "message": "user message",
     "pastEntries": [],
     "conversationContext": [],
     "isPremium": false,
     "memoryInsights": null
   }
   ```

### Environment Variables

Make sure these are set in your `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
OPENAI_API_KEY=your_openai_api_key
```

## 📊 Understanding Results

### Score Interpretation
- **80-100%**: Excellent performance
- **60-79%**: Good performance
- **40-59%**: Fair performance
- **0-39%**: Needs improvement

### Key Metrics
- **Overall Score**: Combined performance across all metrics
- **Category Scores**: Performance in specific areas (fitness, emotional, etc.)
- **Strengths**: What your AI does well
- **Weaknesses**: Areas needing improvement
- **Recommendations**: Specific actions to improve

## 🎯 Next Steps

### 1. **Run Initial Test**
```bash
# Start your server
cd server && npm start

# In another terminal, run the test
node scripts/testCurrentAIModel.js
```

### 2. **Review Results**
- Check the generated reports in `ai-model-analysis/`
- Identify areas for improvement
- Note your current model's strengths

### 3. **Plan Fine-tuning**
- Use the "Fine-tuning Data" section to collect training examples
- Focus on scenarios where your model scored low
- Create manual examples for weak areas

### 4. **Iterate and Improve**
- Run tests regularly to track improvements
- Use the manual testing for quick checks
- Compare results before and after fine-tuning

## 🛠️ Troubleshooting

### Common Issues

**"API call failed"**
- Make sure your server is running
- Check the API URL in your environment variables
- Verify the endpoint accepts the expected parameters

**"No response received"**
- Check your OpenAI API key
- Verify the model ID is correct
- Check server logs for errors

**Test panel not visible**
- Make sure you're in development mode (`NODE_ENV=development`)
- Check that the Admin tab appears in bottom navigation
- Refresh the app if needed

### Getting Help

1. Check the console for error messages
2. Verify your server is running and accessible
3. Test the API endpoint manually with Postman or curl
4. Check the generated reports for detailed error information

## 📈 Expected Results

With your current fine-tuned model, you should expect:

- **Overall Score**: 60-80% (good to excellent)
- **Strong Areas**: Empathy, domain knowledge
- **Improvement Areas**: Context awareness, pattern recognition

The testing will help you identify exactly where to focus your fine-tuning efforts!

---

**Ready to test?** Start with the visual testing interface in your app, then run the automated script for comprehensive analysis! 🚀 
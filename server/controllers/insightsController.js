const axios = require('axios');

// POST /api/insights
exports.insightsHandler = async (req, res) => {
  try {
    const { reflections } = req.body;
    if (!reflections || !Array.isArray(reflections)) {
      return res.status(400).json({ error: 'Reflections array is required' });
    }
    const reflectionTexts = reflections.map(r => 
      `User: "${r.userInput}" AI: "${r.aiQuestion}"`
    ).join('\n');
    const analysisPrompt = `Analyze these reflections and identify the top 3 themes and mood trends. Return ONLY a JSON object with this structure:
{
  "themes": [{"name": "Theme Name", "count": number}],
  "moods": [{"name": "Mood Name", "count": number}]
}

Reflections to analyze:
${reflectionTexts}`;
    let apiResponse;
    if (process.env.OPENAI_API_KEY) {
      apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: process.env.FINE_TUNED_MODEL_ID || 'ft:gpt-4o-mini-2024-07-18:personal:unified-enhanced:By8h6kBm',
        messages: [
          { role: 'system', content: 'You are an expert at analyzing emotional and psychological themes in personal reflections. Return only valid JSON.' },
          { role: 'user', content: analysisPrompt }
        ],
        max_tokens: 500,
        temperature: 0.3
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
      const insights = JSON.parse(apiResponse.data.choices[0].message.content.trim());
      res.json(insights);
    } else {
      const mockInsights = {
        themes: [
          { name: "Stress", count: Math.floor(Math.random() * 10) + 5 },
          { name: "Purpose", count: Math.floor(Math.random() * 8) + 3 },
          { name: "Relationships", count: Math.floor(Math.random() * 6) + 2 }
        ],
        moods: [
          { name: "Stressed", count: Math.floor(Math.random() * 12) + 8 },
          { name: "Positive", count: Math.floor(Math.random() * 6) + 2 },
          { name: "Anxious", count: Math.floor(Math.random() * 4) + 1 }
        ]
      };
      res.json(mockInsights);
    }
  } catch (error) {
    console.error('Error generating insights:', error);
    
    // Handle specific API errors
    if (error.response?.status === 401) {
      return res.status(500).json({ 
        error: 'API key is invalid or expired',
        message: 'Please check your OpenAI API key configuration',
        themes: [{ name: "Stress", count: 5 }, { name: "Purpose", count: 3 }, { name: "Relationships", count: 2 }],
        moods: [{ name: "Stressed", count: 8 }, { name: "Positive", count: 2 }, { name: "Anxious", count: 1 }]
      });
    }
    
    if (error.response?.status === 429) {
      return res.status(500).json({ 
        error: 'Rate limit exceeded',
        message: 'Please wait a moment before trying again',
        themes: [{ name: "Stress", count: 5 }, { name: "Purpose", count: 3 }, { name: "Relationships", count: 2 }],
        moods: [{ name: "Stressed", count: 8 }, { name: "Positive", count: 2 }, { name: "Anxious", count: 1 }]
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to generate insights',
      themes: [{ name: "Stress", count: 5 }, { name: "Purpose", count: 3 }, { name: "Relationships", count: 2 }],
      moods: [{ name: "Stressed", count: 8 }, { name: "Positive", count: 2 }, { name: "Anxious", count: 1 }]
    });
  }
}; 
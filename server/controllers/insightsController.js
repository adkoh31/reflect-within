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
    const analysisPrompt = `Analyze these reflections and identify the top 3 themes and mood trends. Return ONLY a JSON object with this exact structure:\n{\n  "themes": [\n    {"name": "Theme Name", "count": number},\n    {"name": "Theme Name", "count": number},\n    {"name": "Theme Name", "count": number}\n  ],\n  "moods": [\n    {"name": "Mood Name", "count": number},\n    {"name": "Mood Name", "count": number},\n    {"name": "Mood Name", "count": number}\n  ]\n}\n\nCommon themes: Purpose, Stress, Relationships, Career, Health, Growth, Family, Work, Love, Fear, Joy, Creativity, Identity, Change, Success, Failure, Dreams, Goals, Anxiety, Confidence, Self-worth, Spirituality, Community, Learning, Balance, Time, Money, Friendship, Trust, Communication, Boundaries, Expectations, Gratitude, Forgiveness, Acceptance, Courage, Vulnerability, Strength, Weakness, Hope, Despair, Excitement, Boredom, Loneliness, Connection, Independence, Dependence, Control, Surrender, Perfectionism, Authenticity, Comparison, Competition, Cooperation, Leadership, Followership, Innovation, Tradition, Risk, Safety, Adventure, Comfort, Challenge, Support, Criticism, Praise, Recognition, Invisibility, Belonging, Isolation, Inclusion, Exclusion, Power, Powerlessness, Freedom, Constraint, Choice, Obligation, Desire, Need, Want, Should, Must, Can, Will, Might, Could, Would, Should, Must, Can, Will, Might, Could, Would.\n\nCommon moods: Positive, Negative, Stressed, Calm, Excited, Anxious, Happy, Sad, Angry, Grateful, Frustrated, Hopeful, Despairing, Confident, Insecure, Motivated, Overwhelmed, Inspired, Tired, Energetic, Peaceful, Agitated, Content, Dissatisfied, Proud, Ashamed, Loved, Lonely, Connected, Isolated, Empowered, Helpless, Curious, Bored, Interested, Indifferent, Passionate, Apathetic, Optimistic, Pessimistic, Realistic, Idealistic, Practical, Dreamy, Focused, Scattered, Present, Distracted, Mindful, Unconscious, Aware, Oblivious, Conscious, Unconscious, Awake, Sleepy, Alert, Drowsy, Sharp, Dull, Quick, Slow, Fast, Slow, Active, Passive, Dynamic, Static, Fluid, Rigid, Flexible, Stiff, Adaptable, Inflexible, Resilient, Fragile, Strong, Weak, Brave, Fearful, Courageous, Cowardly, Bold, Timid, Adventurous, Cautious, Spontaneous, Planned, Impulsive, Deliberate, Intuitive, Logical, Emotional, Rational, Irrational, Sensible, Foolish, Wise, Foolish, Smart, Stupid, Intelligent, Ignorant, Knowledgeable, Uninformed, Educated, Uneducated, Skilled, Unskilled, Talented, Untalented, Gifted, Ordinary, Special, Common, Unique, Similar, Different, Alike, Unlike, Same, Other, Identical, Distinct, Similar, Different, Alike, Unlike, Same, Other, Identical, Distinct.\n\nReflections to analyze:\n${reflectionTexts}`;
    let apiResponse;
    if (process.env.OPENAI_API_KEY) {
      apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'ft:gpt-4o-mini-2024-07-18:personal:unifieddataset:BrLSoSLz',
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
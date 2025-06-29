const { OpenAI } = require('openai');

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * Analyze text to determine mood, sentiment, emotions, and generate an insight
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} Analysis result with mood, sentiment, sentimentScore, emotions, insight
 */
const analyzeText = async (text) => {
  try {
    // Default result in case API call fails
    const defaultResult = {
      mood: 'neutral',
      sentiment: 'neutral',
      sentimentScore: 0,
      emotions: [],
      insight: 'No insight available.'
    };

    // If no API key is set, return default values
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OpenAI API key not found, returning default analysis');
      return defaultResult;
    }

    // Prepare the prompt for analysis
    const prompt = `
    Analyze the following journal entry and provide:
    1. The primary mood (choose from: happy, sad, anxious, angry, neutral, excited, confused, mixed)
    2. Overall sentiment (positive, negative, or neutral)
    3. Sentiment score (-1 to +1, where -1 is most negative, +1 is most positive)
    4. Top 3 emotions expressed (single words like joy, fear, gratitude, stress, etc.)
    5. A short, thoughtful insight or suggestion (1-2 sentences) that might help the person

    Format your response as a JSON object with the following keys: mood, sentiment, sentimentScore, emotions (array), insight.

    Journal entry: "${text.replace(/"/g, '\\"')}"
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_tokens: 300,
    });

    // Parse the result
    const content = response.choices[0].message.content.trim();
    let result;

    try {
      // Try to parse the JSON response
      result = JSON.parse(content);

      // Validate response format
      if (!result.mood || !result.sentiment || result.sentimentScore === undefined || !Array.isArray(result.emotions) || !result.insight) {
        console.warn('AI response missing required fields, using partial result');
        return { 
          ...defaultResult, 
          ...result 
        };
      }

      return result;
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return defaultResult;
    }
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      mood: 'neutral',
      sentiment: 'neutral',
      sentimentScore: 0,
      emotions: [],
      insight: 'No insight available.'
    };
  }
};

/**
 * Calls the AI with a specific prompt expecting a structured JSON object in return.
 * @param {string} prompt - The complete prompt to send to the AI.
 * @returns {Promise<Object>} The parsed JSON object from the AI.
 */
const generateInsightsFromText = async (prompt) => {
  const defaultResult = {
    summary: 'AI analysis could not be completed at this time.',
    mood_trend: 'unknown',
    emotional_anchors: [],
    behavioral_patterns: [],
    warning_signs: [],
    insightful_advice: 'Please try again later.',
    ai_suggestions: []
  };

  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, returning default insights.');
    return defaultResult;
  }

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-0125", // Updated model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      max_tokens: 800, // Increased tokens for detailed insights
    });

    const content = response.choices[0].message.content.trim();
    // Attempt to parse the string as JSON
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", content);
      // Return the raw content in the summary if parsing fails
      return { ...defaultResult, summary: content };
    }

  } catch (error) {
    console.error('AI insight generation error:', error);
    return defaultResult;
  }
};

/**
 * Generate a weekly summary based on a user's journal entries
 * @param {Array} entries - Array of journal entries
 * @returns {Promise<Object>} Summary object with insights and suggestions
 */
const generateWeeklySummary = async (entries) => {
  try {
    // Default result in case API call fails
    const defaultResult = {
      insights: [
        'You expressed gratitude in several entries this week, which is linked to improved well-being.',
        'Your writing shows a balance of both positive and challenging emotions.',
        'You've mentioned important relationships several times, indicating they're significant to you right now.'
      ],
      suggestions: [
        'Consider journaling at a consistent time each day to build a helpful routine.',
        'Try incorporating a few minutes of mindfulness before writing to enhance emotional awareness.',
        'Your entries are more detailed when you write for at least 5 minutes.'
      ]
    };

    // If no API key is set or no entries, return default values
    if (!process.env.OPENAI_API_KEY || entries.length === 0) {
      return defaultResult;
    }

    // Prepare a condensed version of the entries for the prompt
    const entrySummaries = entries.map(entry => ({
      date: new Date(entry.createdAt).toISOString().split('T')[0],
      content: entry.content.substring(0, 300) + (entry.content.length > 300 ? '...' : ''),
      mood: entry.mood,
      sentiment: entry.sentiment
    }));

    // Prepare the prompt for analysis
    const prompt = `
    Analyze these journal entries from the past week and provide:
    1. Three meaningful insights about patterns, emotions, or behaviors
    2. Three helpful suggestions for the user based on their journaling

    Format your response as a JSON object with these keys: insights (array of 3 strings), suggestions (array of 3 strings).

    Journal entries: ${JSON.stringify(entrySummaries)}
    `;

    // Call the OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    // Parse the result
    const content = response.choices[0].message.content.trim();
    
    try {
      // Try to parse the JSON response
      const result = JSON.parse(content);

      // Validate response format
      if (!Array.isArray(result.insights) || !Array.isArray(result.suggestions)) {
        return defaultResult;
      }

      return {
        insights: result.insights.slice(0, 3),
        suggestions: result.suggestions.slice(0, 3)
      };
    } catch (parseError) {
      console.error('Failed to parse AI summary response:', parseError);
      return defaultResult;
    }
  } catch (error) {
    console.error('AI summary generation error:', error);
    return {
      insights: [
        'You expressed a range of emotions this week.',
        'Your writing shows reflection on your daily experiences.',
        'Consider how your journaling helps you process emotions.'
      ],
      suggestions: [
        'Try writing at different times of day to see when you feel most reflective.',
        'Consider adding a gratitude section to your entries.',
        'Use your journal to set intentions for the following day.'
      ]
    };
  }
};

module.exports = {
  analyzeText,
  generateInsightsFromText,
  generateWeeklySummary
}; 
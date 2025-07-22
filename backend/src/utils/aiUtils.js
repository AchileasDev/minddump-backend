const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini client
const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze text to determine mood, sentiment, emotions, and generate an insight
 * @param {string} text - The text to analyze
 * @returns {Promise<Object>} Analysis result with mood, sentiment, sentimentScore, emotions, insight
 */
const analyzeText = async (text) => {
  const defaultResult = {
    mood: 'neutral',
    sentiment: 'neutral',
    sentimentScore: 0,
    emotions: [],
    insight: 'No insight available.'
  };

  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not found, returning default analysis');
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

    Journal entry: "${text.replace(/"/g, '\"')}"
  `;

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    let parsed;
    try {
      parsed = JSON.parse(content);
      if (!parsed.mood || !parsed.sentiment || parsed.sentimentScore === undefined || !Array.isArray(parsed.emotions) || !parsed.insight) {
        console.warn('Gemini response missing required fields, using partial result');
        return { ...defaultResult, ...parsed };
      }
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError, content);
      return defaultResult;
    }
  } catch (error) {
    console.error('Gemini analysis error:', error);
    return defaultResult;
  }
};

/**
 * Calls Gemini with a specific prompt expecting a structured JSON object in return.
 * @param {string} prompt - The complete prompt to send to Gemini.
 * @returns {Promise<Object>} The parsed JSON object from Gemini.
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

  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not found, returning default insights.');
    return defaultResult;
  }

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', content);
      return { ...defaultResult, summary: content };
    }
  } catch (error) {
    console.error('Gemini insight generation error:', error);
    return defaultResult;
  }
};

/**
 * Generate a weekly summary based on a user's journal entries
 * @param {Array} entries - Array of journal entries
 * @returns {Promise<Object>} Summary object with insights and suggestions
 */
const generateWeeklySummary = async (entries) => {
  const defaultResult = {
    insights: [
      'You expressed gratitude in several entries this week, which is linked to improved well-being.',
      'Your writing shows a balance of both positive and challenging emotions.',
      'You have mentioned important relationships several times, indicating they are significant to you right now.'
    ],
    suggestions: [
      'Consider journaling at a consistent time each day to build a helpful routine.',
      'Try incorporating a few minutes of mindfulness before writing to enhance emotional awareness.',
      'Your entries are more detailed when you write for at least 5 minutes.'
    ]
  };

  if (!process.env.GEMINI_API_KEY || entries.length === 0) {
    return defaultResult;
  }

  // Prepare a condensed version of the entries for the prompt
  const entrySummaries = entries.map(entry => ({
    date: new Date(entry.createdAt).toISOString().split('T')[0],
    content: entry.content.substring(0, 300) + (entry.content.length > 300 ? '...' : ''),
    mood: entry.mood,
    sentiment: entry.sentiment
  }));

  const prompt = `
    Analyze these journal entries from the past week and provide:
    1. Three meaningful insights about patterns, emotions, or behaviors
    2. Three helpful suggestions for the user based on their journaling

    Format your response as a JSON object with these keys: insights (array of 3 strings), suggestions (array of 3 strings).

    Journal entries: ${JSON.stringify(entrySummaries)}
  `;

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    try {
      const parsed = JSON.parse(content);
      if (!Array.isArray(parsed.insights) || !Array.isArray(parsed.suggestions)) {
        return defaultResult;
      }
      return {
        insights: parsed.insights.slice(0, 3),
        suggestions: parsed.suggestions.slice(0, 3)
      };
    } catch (parseError) {
      console.error('Failed to parse Gemini summary response:', parseError, content);
      return defaultResult;
    }
  } catch (error) {
    console.error('Gemini summary generation error:', error);
    return defaultResult;
  }
};

/**
 * Call Gemini AI with a prompt and return the response
 * @param {string} prompt - The prompt to send to Gemini
 * @returns {Promise<Object>} The parsed JSON response from Gemini
 */
const callGemini = async (prompt) => {
  const defaultResult = {
    keywords: [],
    themes: []
  };

  if (!process.env.GEMINI_API_KEY) {
    console.warn('Gemini API key not found, returning default result');
    return defaultResult;
  }

  try {
    const model = geminiClient.getGenerativeModel({ model: 'gemini-pro' });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text().trim();
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', content);
      return defaultResult;
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    return defaultResult;
  }
};

module.exports = {
  analyzeText,
  generateInsightsFromText,
  generateWeeklySummary,
  callGemini
}; 
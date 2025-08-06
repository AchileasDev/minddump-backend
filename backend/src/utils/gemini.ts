import axios from 'axios';

export interface GeminiInsights {
  summary: string;
  moodTrend: string;
  emotionalAnchors: string[];
  behavioralPatterns: string[];
  advice: string;
  suggestions: string[];
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export async function callGemini(text: string): Promise<GeminiInsights> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');
  try {
    const prompt = `Analyze the following journal entry and return a JSON object with the following fields: summary, moodTrend, emotionalAnchors (array), behavioralPatterns (array), advice, suggestions (array).\n\nEntry: ${text}`;
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    // Defensive: Try to parse the model's response as JSON
    let result: GeminiInsights = {
      summary: '',
      moodTrend: '',
      emotionalAnchors: [],
      behavioralPatterns: [],
      advice: '',
      suggestions: [],
    };
    const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    try {
      const parsed = JSON.parse(textResponse);
      result = {
        summary: parsed.summary || '',
        moodTrend: parsed.moodTrend || '',
        emotionalAnchors: parsed.emotionalAnchors || [],
        behavioralPatterns: parsed.behavioralPatterns || [],
        advice: parsed.advice || '',
        suggestions: parsed.suggestions || [],
      };
    } catch (err) {
      console.error('Failed to parse Gemini response as JSON:', err, textResponse);
      result.summary = textResponse || 'No summary available.';
    }
    return result;
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      summary: 'AI analysis unavailable.',
      moodTrend: '',
      emotionalAnchors: [],
      behavioralPatterns: [],
      advice: '',
      suggestions: [],
    };
  }
}
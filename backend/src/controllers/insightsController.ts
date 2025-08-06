import { callGemini } from '../utils/gemini';
import { getRecentInsights } from '../services/insightsService';

export const analyzeDump = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return res.status(400).json({ error: 'Text input is required and must be at least 10 characters.' });
    }
    const insights = await callGemini(text);
    return res.json(insights);
  } catch (error) {
    console.error('Error in analyzeDump:', error);
    return res.status(500).json({ error: 'Failed to analyze entry.' });
  }
};

export const getRecentInsightsController = async (req, res) => {
  try {
    const userId = req.user.id;
    const insights = await getRecentInsights(userId);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
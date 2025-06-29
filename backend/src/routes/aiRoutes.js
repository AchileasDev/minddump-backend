const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const { analyzeText, generateWeeklySummary, generateInsightsFromText } = require('../utils/aiUtils');
const { generateInsightsPrompt } = require('../utils/promptUtils');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// New route for generating insights from multiple entries (premium feature)
router.post('/insights', [requireAuth, requirePremium], async (req, res) => {
  try {
    const { entries } = req.body;
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ message: 'An array of entries is required.' });
    }

    // Generate the prompt and get insights
    const prompt = generateInsightsPrompt(entries);
    const insights = await generateInsightsFromText(prompt);

    res.json(insights);
  } catch (error) {
    console.error('Error in /insights route:', error);
    res.status(500).json({ message: 'Error generating insights.' });
  }
});

// New route for analyzing a single dump (premium feature)
router.post('/analyze-dump', [requireAuth, requirePremium], async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ message: 'Content is required for analysis.' });
    }

    const analysis = await analyzeText(content);
    res.json(analysis);
  } catch (error) {
    console.error('Error in /analyze-dump route:', error);
    res.status(500).json({ message: 'Error analyzing dump.' });
  }
});

// Analyze text
router.post('/analyze', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const analysis = await analyzeText(text);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing text:', error);
    res.status(500).json({ message: 'Error analyzing text' });
  }
});

// Generate weekly summary
router.get('/summary/weekly', requireAuth, async (req, res) => {
  try {
    // Get dumps from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: dumps, error } = await supabase
      .from('dumps')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    if (dumps.length === 0) {
      return res.json({
        entriesCount: 0,
        moodDistribution: [],
        topEmotions: [],
        sentimentTrend: [],
        insights: [],
        suggestions: []
      });
    }

    const summary = await generateWeeklySummary(dumps);
    res.json(summary);
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    res.status(500).json({ message: 'Error generating weekly summary' });
  }
});

// Reprocess dumps with AI
router.post('/reprocess', requireAuth, async (req, res) => {
  try {
    const { dumpIds } = req.body;
    if (!Array.isArray(dumpIds)) {
      return res.status(400).json({ message: 'dumpIds must be an array' });
    }

    const { data: dumps, error } = await supabase
      .from('dumps')
      .select('*')
      .eq('user_id', req.user.id)
      .in('id', dumpIds);

    if (error) throw error;

    const results = await Promise.all(
      dumps.map(async (dump) => {
        try {
          const analysis = await analyzeText(dump.content);
          
          const { error: updateError } = await supabase
            .from('dumps')
            .update({
              mood: analysis.mood,
              sentiment: analysis.sentiment,
              sentiment_score: analysis.sentimentScore,
              insight: analysis.insight,
              emotions: analysis.emotions,
              is_processed: true,
              updated_at: new Date().toISOString()
            })
            .eq('id', dump.id);

          if (updateError) throw updateError;

          return { id: dump.id, success: true };
        } catch (error) {
          console.error(`Error processing dump ${dump.id}:`, error);
          return { id: dump.id, success: false, error: error.message };
        }
      })
    );

    res.json({ results });
  } catch (error) {
    console.error('Error reprocessing dumps:', error);
    res.status(500).json({ message: 'Error reprocessing dumps' });
  }
});

// Get mood trends
router.get('/trends/mood', requireAuth, async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    let startDate = new Date();

    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        return res.status(400).json({ message: 'Invalid period' });
    }

    const { data: dumps, error } = await supabase
      .from('dumps')
      .select('mood, created_at')
      .eq('user_id', req.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    const moodCounts = {};
    dumps.forEach(dump => {
      if (dump.mood) {
        moodCounts[dump.mood] = (moodCounts[dump.mood] || 0) + 1;
      }
    });

    const moodDistribution = Object.entries(moodCounts).map(([mood, count]) => ({
      mood,
      count,
      percentage: Math.round((count / dumps.length) * 100)
    })).sort((a, b) => b.count - a.count);

    res.json({
      totalEntries: dumps.length,
      moodDistribution
    });
  } catch (error) {
    console.error('Error fetching mood trends:', error);
    res.status(500).json({ message: 'Error fetching mood trends' });
  }
});

// This route proxies the request to the Supabase edge function for analyzing an entry.
// A better long-term solution would be to call the AI model directly here.
router.post('/analyze-entry', requireAuth, async (req, res) => {
    const { content } = req.body;
    if (!content) {
        return res.status(400).json({ error: 'Content is required.' });
    }

    try {
        const response = await fetch(
            `${process.env.SUPABASE_URL}/functions/v1/analyze-entry`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
                },
                body: JSON.stringify({ content }),
            }
        );

        if (!response.ok) {
            const errorBody = await response.text();
            console.error('Supabase function error:', errorBody);
            return res.status(response.status).json({ error: 'Failed to analyze entry via Supabase function.' });
        }

        const data = await response.json();
        return res.status(200).json(data);
    } catch (error) {
        console.error('Error proxying to analyze-entry function:', error);
        return res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router; 
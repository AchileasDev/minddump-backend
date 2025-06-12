const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const { analyzeText, generateWeeklySummary } = require('../utils/aiUtils');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Analyze text
router.post('/analyze', auth, async (req, res) => {
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
router.get('/summary/weekly', auth, async (req, res) => {
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
router.post('/reprocess', auth, async (req, res) => {
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
router.get('/trends/mood', auth, async (req, res) => {
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

module.exports = router; 
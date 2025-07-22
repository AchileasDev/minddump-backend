const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');
const { validateRequired, sanitizeInput } = require('../middleware/validation');
const { createClient } = require('@supabase/supabase-js');
const { analyzeText, generateWeeklySummary, generateInsightsFromText } = require('../utils/aiUtils');
const { generateInsightsPrompt } = require('../utils/promptUtils');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// New route for generating insights from multiple entries (premium feature)
router.post('/insights', [requireAuth, requirePremium], validateRequired(['entries']), async (req, res, next) => {
  try {
    const { entries } = req.body;
    
    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'An array of entries is required' 
      });
    }

    // Generate the prompt and get insights
    const prompt = generateInsightsPrompt(entries);
    const insights = await generateInsightsFromText(prompt);

    res.json({
      success: true,
      data: insights
    });
  } catch (error) {
    console.error('Error in /insights route:', error);
    next(error);
  }
});

// New route for analyzing a single dump (premium feature)
router.post('/analyze-dump', [requireAuth, requirePremium], validateRequired(['content']), sanitizeInput, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (content.length > 10000) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Content is too long (maximum 10,000 characters)' 
      });
    }

    const analysis = await analyzeText(content);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error in /analyze-dump route:', error);
    next(error);
  }
});

// Analyze text
router.post('/analyze', requireAuth, validateRequired(['text']), sanitizeInput, async (req, res, next) => {
  try {
    const { text } = req.body;

    if (text.length > 10000) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Text is too long (maximum 10,000 characters)' 
      });
    }

    const analysis = await analyzeText(text);
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Error analyzing text:', error);
    next(error);
  }
});

// Generate weekly summary
router.get('/summary/weekly', requireAuth, async (req, res, next) => {
  try {
    // Get dumps from the last 7 days
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { data: dumps, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .gte('created_at', oneWeekAgo.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly entries:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching weekly entries' 
      });
    }

    if (dumps.length === 0) {
      return res.json({
        success: true,
        data: {
          entriesCount: 0,
          moodDistribution: [],
          topEmotions: [],
          sentimentTrend: [],
          insights: [],
          suggestions: []
        }
      });
    }

    const summary = await generateWeeklySummary(dumps);
    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error generating weekly summary:', error);
    next(error);
  }
});

// Reprocess dumps with AI
router.post('/reprocess', requireAuth, validateRequired(['dumpIds']), async (req, res, next) => {
  try {
    const { dumpIds } = req.body;
    
    if (!Array.isArray(dumpIds)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'dumpIds must be an array' 
      });
    }

    const { data: dumps, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', req.user.id)
      .in('id', dumpIds);

    if (error) {
      console.error('Error fetching dumps for reprocessing:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching entries for reprocessing' 
      });
    }

    const results = await Promise.all(
      dumps.map(async (dump) => {
        try {
          const analysis = await analyzeText(dump.content);
          
          const { error: updateError } = await supabase
            .from('journal_entries')
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

          if (updateError) {
            console.error(`Error updating dump ${dump.id}:`, updateError);
            return { id: dump.id, success: false, error: updateError.message };
          }

          return { id: dump.id, success: true };
        } catch (error) {
          console.error(`Error processing dump ${dump.id}:`, error);
          return { id: dump.id, success: false, error: error.message };
        }
      })
    );

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    console.error('Error reprocessing dumps:', error);
    next(error);
  }
});

// Get mood trends
router.get('/trends/mood', requireAuth, async (req, res, next) => {
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
        return res.status(400).json({ 
          error: 'Invalid period',
          message: 'Period must be week, month, or year' 
        });
    }

    const { data: dumps, error } = await supabase
      .from('journal_entries')
      .select('mood, created_at')
      .eq('user_id', req.user.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching mood trends:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error fetching mood trends' 
      });
    }

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
      success: true,
      data: {
        totalEntries: dumps.length,
        moodDistribution
      }
    });
  } catch (error) {
    console.error('Error fetching mood trends:', error);
    next(error);
  }
});

// This route proxies the request to the Supabase edge function for analyzing an entry.
// A better long-term solution would be to call the AI model directly here.
router.post('/analyze-entry', requireAuth, validateRequired(['content']), sanitizeInput, async (req, res, next) => {
  try {
    const { content } = req.body;

    if (content.length > 10000) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Content is too long (maximum 10,000 characters)' 
      });
    }

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
      return res.status(response.status).json({ 
        error: 'Function call failed',
        message: 'Failed to analyze entry via Supabase function' 
      });
    }

    const data = await response.json();
    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error proxying to analyze-entry function:', error);
    next(error);
  }
});

module.exports = router; 
const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');
const { validateRequired } = require('../middleware/validation');
const { createClient } = require('@supabase/supabase-js');
const { subDays, format, eachDayOfInterval } = require('date-fns');
const { callGemini } = require('../utils/aiUtils');
const { buildKeywordsPrompt } = require('../utils/promptUtils');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// All routes here require a valid user session
router.use(requireAuth);

// POST /api/stats/start-trial
router.post('/start-trial', async (req, res, next) => {
  try {
    const { id } = req.user;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', id)
      .single();

    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch user profile' 
      });
    }

    const { subscription_status } = profile;
    if (subscription_status === 'trialing' || subscription_status === 'active') {
      return res.status(400).json({ 
        error: 'Trial already used',
        message: 'Trial already used or subscription is active' 
      });
    }
    
    const trial_ends_at = new Date();
    trial_ends_at.setDate(trial_ends_at.getDate() + 14);

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ 
        role: 'premium', 
        subscription_status: 'trialing', 
        trial_ends_at: trial_ends_at.toISOString() 
      })
      .eq('id', id);

    if (updateError) {
      console.error('Error starting trial:', updateError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to start trial' 
      });
    }

    res.status(200).json({
      success: true,
      data: { trial_ends_at },
      message: 'Trial started successfully'
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/mood-history
router.get('/mood-history', async (req, res, next) => {
  try {
    const { id } = req.user;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('journal_entries')
      .select('created_at, mood')
      .eq('user_id', id)
      .gte('created_at', since)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching mood history:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch mood history' 
      });
    }

    const result = (data || []).map(e => ({ 
      date: e.created_at, 
      mood: e.mood || 'neutral' 
    }));
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

// The routes below are for premium users only
router.use(requirePremium);

// GET /api/stats/keywords
router.get('/keywords', async (req, res, next) => {
  try {
    const { id } = req.user;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('content')
      .eq('user_id', id)
      .gte('created_at', since)
      .limit(50);

    if (error) {
      console.error('Error fetching entries for keyword analysis:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch entries for keyword analysis' 
      });
    }
    
    if (!entries || entries.length === 0) {
      return res.status(200).json({
        success: true,
        data: { keywords: [], themes: [] }
      });
    }
    
    const prompt = buildKeywordsPrompt(entries);
    try {
      const analysis = await callGemini(prompt);
      res.status(200).json({
        success: true,
        data: analysis
      });
    } catch (e) {
      console.error('AI analysis for keywords failed:', e);
      res.status(500).json({ 
        error: 'AI analysis failed',
        message: 'AI analysis for keywords failed' 
      });
    }
  } catch (error) {
    next(error);
  }
});

// GET /api/stats/weekly
router.get('/weekly', async (req, res, next) => {
  try {
    const { id } = req.user;
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('content, created_at, emotions')
      .eq('user_id', id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly entries:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch weekly entries' 
      });
    }
    
    // Aggregate the pre-calculated emotions
    const emotionCounts = {};
    const dailyEmotionMap = {};

    eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
      dailyEmotionMap[format(day, 'yyyy-MM-dd')] = {};
    });

    entries.forEach(entry => {
      const entryDate = format(new Date(entry.created_at), 'yyyy-MM-dd');
      const emotions = entry.emotions || [];
      emotions.forEach(emotion => {
        emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        if (dailyEmotionMap[entryDate]) {
          dailyEmotionMap[entryDate][emotion] = (dailyEmotionMap[entryDate][emotion] || 0) + 1;
        }
      });
    });

    const dailyEmotions = Object.entries(dailyEmotionMap).map(([date, emotions]) => ({
      date,
      emotions,
    }));
    
    const stats = {
      totalEntries: entries.length,
      emotions: emotionCounts,
      dailyEmotions,
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router; 
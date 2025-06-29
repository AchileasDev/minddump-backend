const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');
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
router.post('/start-trial', async (req, res) => {
    const { id } = req.user;

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_status')
        .eq('id', id)
        .single();

    if (profileError) {
        return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    const { subscription_status } = profile;
    if (subscription_status === 'trialing' || subscription_status === 'active') {
        return res.status(400).json({ error: 'Trial already used or subscription is active.' });
    }
    
    const trial_ends_at = new Date();
    trial_ends_at.setDate(trial_ends_at.getDate() + 14);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'premium', subscription_status: 'trialing', trial_ends_at: trial_ends_at.toISOString() })
        .eq('id', id);

    if (updateError) {
        return res.status(500).json({ error: 'Failed to start trial.' });
    }

    res.status(200).json({ message: 'Trial started successfully.', trial_ends_at });
});


// GET /api/stats/mood-history
router.get('/mood-history', async (req, res) => {
    const { id } = req.user;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
        .from('journal_entries')
        .select('created_at, mood')
        .eq('user_id', id)
        .gte('created_at', since)
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch mood history.' });
    }

    const result = (data || []).map(e => ({ date: e.created_at, mood: e.mood || 'neutral' }));
    res.status(200).json(result);
});


// The routes below are for premium users only
router.use(requirePremium);

// GET /api/stats/keywords
router.get('/keywords', async (req, res) => {
    const { id } = req.user;
    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('content')
        .eq('user_id', id)
        .gte('created_at', since)
        .limit(50);

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch entries for keyword analysis.' });
    }
    if (!entries || entries.length === 0) {
        return res.status(200).json({ keywords: [], themes: [] });
    }
    
    const prompt = buildKeywordsPrompt(entries);
    try {
        const analysis = await callGemini(prompt);
        res.status(200).json(analysis);
    } catch (e) {
        res.status(500).json({ error: 'AI analysis for keywords failed.' });
    }
});

// GET /api/stats/weekly
router.get('/weekly', async (req, res) => {
    const { id } = req.user;
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    const { data: entries, error } = await supabase
        .from('journal_entries')
        .select('content, created_at, emotions') // Assuming emotions are pre-calculated
        .eq('user_id', id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

    if (error) {
        return res.status(500).json({ error: 'Failed to fetch weekly entries.' });
    }
    
    // This is a simplified version of the original logic.
    // The original logic called an edge function for each entry, which is inefficient.
    // Here we aggregate the pre-calculated emotions.
    const emotionCounts = {};
    const dailyEmotionMap = {};

    eachDayOfInterval({ start: startDate, end: endDate }).forEach(day => {
        dailyEmotionMap[format(day, 'yyyy-MM-dd')] = {};
    });

    entries.forEach(entry => {
        const entryDate = format(new Date(entry.created_at), 'yyyy-MM-dd');
        const emotions = entry.emotions || []; // Assuming entry.emotions is an array of strings
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

    res.status(200).json(stats);
});

module.exports = router; 
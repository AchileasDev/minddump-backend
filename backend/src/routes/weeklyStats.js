const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');
const { subDays, format } = require('date-fns');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/weekly-stats/weekly-stats (premium only)
router.get('/weekly-stats', requireAuth, requirePremium, async (req, res, next) => {
  try {
    const { id } = req.user;
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    // Get entries from the last week
    const { data: entries, error } = await supabase
      .from('journal_entries')
      .select('content, created_at, mood, emotions')
      .eq('user_id', id)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching weekly stats:', error);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch weekly statistics' 
      });
    }

    // Calculate basic stats
    const totalEntries = entries.length;
    const moodCounts = {};
    const emotionCounts = {};
    const dailyEntries = {};

    // Initialize daily entries
    for (let i = 0; i < 7; i++) {
      const date = format(subDays(endDate, i), 'yyyy-MM-dd');
      dailyEntries[date] = 0;
    }

    entries.forEach(entry => {
      // Count moods
      if (entry.mood) {
        moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      }

      // Count emotions
      if (entry.emotions && Array.isArray(entry.emotions)) {
        entry.emotions.forEach(emotion => {
          emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
        });
      }

      // Count daily entries
      const entryDate = format(new Date(entry.created_at), 'yyyy-MM-dd');
      if (dailyEntries[entryDate] !== undefined) {
        dailyEntries[entryDate]++;
      }
    });

    // Get top emotions
    const topEmotions = Object.entries(emotionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([emotion, count]) => ({ emotion, count }));

    // Get dominant mood
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'neutral';

    const stats = {
      totalEntries,
      dominantMood,
      topEmotions,
      dailyEntries: Object.entries(dailyEntries).map(([date, count]) => ({ date, count })),
      averageEntriesPerDay: totalEntries / 7,
      mostActiveDay: Object.entries(dailyEntries)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || null
    };

    res.json({
      success: true,
      data: stats,
      message: 'Weekly statistics retrieved successfully'
    });
  } catch (error) {
    console.error('Error in weekly stats:', error);
    next(error);
  }
});

module.exports = router; 
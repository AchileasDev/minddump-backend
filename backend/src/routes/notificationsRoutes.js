const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');

// Use the service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// GET /api/notifications/daily-check
router.get('/daily-check', async (req, res) => {
  // Simple origin check for now
  if (req.headers.origin !== 'http://localhost:3000') {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    // 1. Get all active users from profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, notifications_enabled')
      .eq('is_active', true);

    if (usersError) {
      return res.status(500).json({ error: 'Failed to fetch users' });
    }

    const usersToNotify = [];
    const now = new Date();
    // 2. For each user, check their most recent dump
    for (const user of users) {
      // Skip if notifications are disabled
      if (user.notifications_enabled === false) continue;
      const { data: lastDump, error: dumpError } = await supabase
        .from('dumps')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (dumpError && dumpError.code !== 'PGRST116') {
        // PGRST116: No rows found, treat as no dumps
        console.error('Error fetching dump for user', user.id, dumpError);
        continue;
      }

      let lastDumpDate = lastDump ? new Date(lastDump.created_at) : null;
      let daysSinceLastDump = lastDumpDate ? (now - lastDumpDate) / (1000 * 60 * 60 * 24) : Infinity;

      if (daysSinceLastDump >= 3) {
        usersToNotify.push({
          user_id: user.id,
          email: user.email,
          lastDumpDate: lastDumpDate ? lastDumpDate.toISOString().slice(0, 10) : null
        });
      }
    }

    return res.json({ usersToNotify });
  } catch (err) {
    console.error('Error in daily-check:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 
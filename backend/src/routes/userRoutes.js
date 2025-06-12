const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Get user profile
router.get('/profile', auth, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// Update user profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, full_name, avatar_url } = req.body;

    const { data: profile, error } = await supabase
      .from('profiles')
      .update({
        username,
        full_name,
        avatar_url,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(profile);
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Error updating profile' });
  }
});

// Get user settings
router.get('/settings', auth, async (req, res) => {
  try {
    const { data: settings, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) throw error;
    if (!settings) {
      return res.status(404).json({ message: 'Settings not found' });
    }

    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Error fetching settings' });
  }
});

// Update user settings
router.put('/settings', auth, async (req, res) => {
  try {
    const { theme, notifications_enabled, email_notifications } = req.body;

    const { data: settings, error } = await supabase
      .from('user_settings')
      .update({
        theme,
        notifications_enabled,
        email_notifications,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(settings);
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Error updating settings' });
  }
});

module.exports = router; 
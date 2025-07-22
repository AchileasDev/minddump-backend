const express = require('express');
const router = express.Router();
const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
const { requireAuth } = require('../middleware/auth');

// Use the service role key for admin access
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize Firebase Admin SDK
let firebaseAdmin;
try {
  if (!admin.apps.length) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } else {
    firebaseAdmin = admin.app();
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
}

// Apply authentication to all notification routes except daily-check
router.use(requireAuth);

// POST /api/notifications/token - Save FCM token for user
router.post('/token', async (req, res, next) => {
  try {
    const { token } = req.body;
    const userId = req.user.id; // Now guaranteed to exist due to requireAuth

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'Missing token',
        message: 'FCM token is required'
      });
    }

    // Save token to user's profile
    const { data, error } = await supabase
      .from('profiles')
      .update({ 
        fcm_token: token,
        notifications_enabled: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error saving FCM token:', error);
      return res.status(500).json({
        success: false,
        error: 'Database error',
        message: 'Failed to save notification token'
      });
    }

    console.log(`FCM token saved for user ${userId}`);

    return res.json({
      success: true,
      data: { message: 'Token saved successfully' },
      message: 'Notification token saved successfully'
    });
  } catch (err) {
    console.error('Error in token endpoint:', err);
    next(err);
  }
});

// POST /api/notifications/test - Send test notification
router.post('/test', async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    const requestingUserId = req.user.id; // Now guaranteed to exist due to requireAuth

    if (!firebaseAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Firebase not configured',
        message: 'Firebase Admin SDK not initialized'
      });
    }

    let targetToken = token;
    let targetUserId = userId;

    // If no token provided, get it from user ID
    if (!targetToken && targetUserId) {
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('fcm_token')
        .eq('id', targetUserId)
        .single();

      if (userError || !user?.fcm_token) {
        return res.status(404).json({
          success: false,
          error: 'Token not found',
          message: 'No FCM token found for this user'
        });
      }

      targetToken = user.fcm_token;
    }

    if (!targetToken) {
      return res.status(400).json({
        success: false,
        error: 'Missing token',
        message: 'Either token or userId must be provided'
      });
    }

    // Send test notification
    const message = {
      notification: {
        title: 'Test Notification',
        body: 'This is a test notification from MindDump! 🎉',
      },
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      token: targetToken,
    };

    const response = await firebaseAdmin.messaging().send(message);
    
    console.log(`Test notification sent successfully: ${response}`);

    return res.json({
      success: true,
      data: { 
        messageId: response,
        message: 'Test notification sent successfully'
      },
      message: 'Test notification sent successfully'
    });
  } catch (err) {
    console.error('Error sending test notification:', err);
    
    // Handle specific Firebase errors
    if (err.code === 'messaging/invalid-registration-token') {
      return res.status(400).json({
        success: false,
        error: 'Invalid token',
        message: 'The provided FCM token is invalid'
      });
    }
    
    if (err.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({
        success: false,
        error: 'Token not registered',
        message: 'The FCM token is not registered with Firebase'
      });
    }

    next(err);
  }
});

// GET /api/notifications/daily-check - No authentication required (called by cron jobs)
router.get('/daily-check', async (req, res, next) => {
  try {
    // Security: Check for a secret token or API key
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const expectedApiKey = process.env.DAILY_CHECK_API_KEY;
    
    if (expectedApiKey && apiKey !== expectedApiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid API key for daily check' 
      });
    }

    // Simple origin check for additional security
    const allowedOrigins = [
      'http://localhost:3000',
      'https://yourdomain.com', // Add your production domain
      process.env.SITE_URL
    ].filter(Boolean);

    if (req.headers.origin && !allowedOrigins.includes(req.headers.origin)) {
      return res.status(403).json({ 
        error: 'Forbidden',
        message: 'Origin not allowed' 
      });
    }

    // 1. Get all active users from profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, notifications_enabled, fcm_token')
      .eq('is_active', true);

    if (usersError) {
      console.error('Error fetching users for notifications:', usersError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Failed to fetch users' 
      });
    }

    const usersToNotify = [];
    const now = new Date();
    
    // 2. For each user, check their most recent entry
    for (const user of users) {
      // Skip if notifications are disabled or no FCM token
      if (user.notifications_enabled === false || !user.fcm_token) continue;
      
      const { data: lastEntry, error: entryError } = await supabase
        .from('journal_entries')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (entryError && entryError.code !== 'PGRST116') {
        // PGRST116: No rows found, treat as no entries
        console.error('Error fetching entry for user', user.id, entryError);
        continue;
      }

      let lastEntryDate = lastEntry ? new Date(lastEntry.created_at) : null;
      let daysSinceLastEntry = lastEntryDate ? (now - lastEntryDate) / (1000 * 60 * 60 * 24) : Infinity;

      if (daysSinceLastEntry >= 3) {
        usersToNotify.push({
          user_id: user.id,
          email: user.email,
          fcm_token: user.fcm_token,
          lastEntryDate: lastEntryDate ? lastEntryDate.toISOString().slice(0, 10) : null
        });
      }
    }

    // 3. Send push notifications to users who haven't journaled in 3+ days
    if (firebaseAdmin && usersToNotify.length > 0) {
      const notificationPromises = usersToNotify.map(async (user) => {
        try {
          const message = {
            notification: {
              title: 'Time to Journal! 📝',
              body: 'It\'s been a few days since your last entry. Take a moment to reflect on your thoughts and feelings.',
            },
            data: {
              type: 'reminder',
              daysSinceLastEntry: '3',
              timestamp: new Date().toISOString(),
            },
            token: user.fcm_token,
          };

          const response = await firebaseAdmin.messaging().send(message);
          console.log(`Reminder notification sent to user ${user.user_id}: ${response}`);
          return { user_id: user.user_id, success: true, messageId: response };
        } catch (error) {
          console.error(`Failed to send notification to user ${user.user_id}:`, error);
          return { user_id: user.user_id, success: false, error: error.message };
        }
      });

      const results = await Promise.all(notificationPromises);
      console.log(`Daily check completed. ${results.filter(r => r.success).length}/${results.length} notifications sent successfully.`);
    }

    return res.json({
      success: true,
      data: { 
        usersToNotify: usersToNotify.map(u => ({ user_id: u.user_id, email: u.email, lastEntryDate: u.lastEntryDate })),
        notificationsSent: firebaseAdmin ? usersToNotify.length : 0
      },
      count: usersToNotify.length
    });
  } catch (err) {
    console.error('Error in daily-check:', err);
    next(err);
  }
});

module.exports = router; 
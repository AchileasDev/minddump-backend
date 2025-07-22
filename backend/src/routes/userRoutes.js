const express = require('express');
const router = express.Router();
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { validateRequired, sanitizeInput, validateEmail } = require('../middleware/validation');
const { createClient } = require('@supabase/supabase-js');
const {
  getProfile,
  updateProfile,
  deleteAccount,
  exportData,
  toggleNotifications,
  getAllUsers,
  updateUserRole
} = require('../controllers/userController');

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// POST /api/users/request-password-reset
router.post('/request-password-reset', validateRequired(['email']), sanitizeInput, async (req, res, next) => {
  try {
    const { email } = req.body;
    
    if (!validateEmail(email)) {
      return res.status(400).json({ 
        error: 'Invalid email',
        message: 'Please provide a valid email address' 
      });
    }

    // Use the regular client for password reset
    const supabaseClient = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Password reset error:', error);
      return res.status(500).json({ 
        error: 'Password reset failed',
        message: error.message 
      });
    }

    return res.status(200).json({ 
      success: true,
      message: 'Password reset email sent successfully' 
    });
  } catch (error) {
    next(error);
  }
});

// All routes below require authentication
router.use(requireAuth);

// GET /api/users/profile
router.get('/profile', getProfile);

// PUT /api/users/profile
router.put('/profile', sanitizeInput, validateRequired(['name']), updateProfile);

// POST /api/users/delete-account
router.post('/delete-account', deleteAccount);

// GET /api/users/export-data
router.get('/export-data', exportData);

// POST /api/users/toggle-notifications
router.post('/toggle-notifications', validateRequired(['enabled']), toggleNotifications);

// POST /api/users/update-questions
router.post('/update-questions', validateRequired(['entryId', 'questions']), async (req, res, next) => {
  try {
    const { entryId, questions } = req.body;
    
    if (!Array.isArray(questions)) {
      return res.status(400).json({ 
        error: 'Invalid input',
        message: 'Questions must be an array' 
      });
    }

    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/update-questions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify({ entryId, questions, userId: req.user.id }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase function error:', errorText);
      return res.status(response.status).json({ 
        error: 'Function call failed',
        message: 'Failed to update questions' 
      });
    }

    const data = await response.json();
    res.status(200).json({
      success: true,
      data,
      message: 'Questions updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/users/toggle-favorite
router.post('/toggle-favorite', validateRequired(['entryId', 'question']), async (req, res, next) => {
  try {
    const { entryId, question } = req.body;
    
    const response = await fetch(
      `${process.env.SUPABASE_URL}/functions/v1/toggle-favorite`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`, 
        },
        body: JSON.stringify({ entryId, question, userId: req.user.id }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Supabase function error:', errorText);
      return res.status(response.status).json({ 
        error: 'Function call failed',
        message: 'Failed to toggle favorite' 
      });
    }

    const data = await response.json();
    res.status(200).json({
      success: true,
      data,
      message: 'Favorite toggled successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Admin routes
router.use(requireAdmin);

// GET /api/users/all
router.get('/all', getAllUsers);

// PUT /api/users/:userId/role
router.put('/:userId/role', validateRequired(['role']), updateUserRole);

module.exports = router;
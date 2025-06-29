const express = require('express');
const router = express.Router();
const { requireAuth, requirePremium } = require('../middleware/auth');

// GET /weekly-stats (premium only)
router.get('/weekly-stats', requireAuth, requirePremium, (req, res) => {
  // Mock data
  res.json({ entries: 5, mood: 'positive', message: 'Premium weekly stats!' });
});

module.exports = router; 
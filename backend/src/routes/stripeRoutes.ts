import express from 'express';
import { createCheckoutSession, createCustomerPortal, getUserSubscriptionStatus } from '../services/stripeService';
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/stripe/checkout-session
router.post('/checkout-session', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const url = await createCheckoutSession(userId);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/stripe/customer-portal
router.post('/customer-portal', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const url = await createCustomerPortal(userId);
    res.json({ url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/stripe/status
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const status = await getUserSubscriptionStatus(userId);
    res.json({ status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
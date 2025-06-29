const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const User = require('../models/userModel');
const { requireAuth, requirePremium } = require('../middleware/auth');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create a subscription checkout session
router.post('/create-checkout-session', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // Check if user already has an active subscription
    if (user.subscriptionStatus === 'active') {
      return res.status(400).json({ message: 'You already have an active subscription' });
    }

    // Create or get Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user._id.toString()
        }
      });

      // Save customer ID to user
      user.stripeCustomerId = customer.id;
      await user.save({ validateBeforeSave: false });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/dashboard?payment=success`,
      cancel_url: `${req.headers.origin}/dashboard?payment=canceled`,
      metadata: {
        userId: user._id.toString()
      }
    });

    res.status(200).json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session error:', error);
    res.status(500).json({ message: 'Error creating subscription session' });
  }
});

// Get subscription status
router.get('/subscription-status', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // If user doesn't have a Stripe subscription yet
    if (!user.stripeSubscriptionId) {
      return res.status(200).json({
        status: user.subscriptionStatus,
        trialEnds: user.trialEnds,
        isActive: user.hasActiveSubscription()
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);

    res.status(200).json({
      status: user.subscriptionStatus,
      trialEnds: user.trialEnds,
      isActive: user.hasActiveSubscription(),
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    res.status(500).json({ message: 'Error retrieving subscription status' });
  }
});

// Cancel subscription
router.post('/cancel-subscription', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });

    // Update user's subscription status
    user.subscriptionStatus = 'canceled';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: 'Subscription will be canceled at the end of the billing period',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Error canceling subscription' });
  }
});

// Resume canceled subscription
router.post('/resume-subscription', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No subscription found' });
    }

    // Resume subscription by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: false
    });

    // Update user's subscription status
    user.subscriptionStatus = 'active';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: 'Subscription resumed successfully',
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    res.status(500).json({ message: 'Error resuming subscription' });
  }
});

// Create a Stripe Customer Portal session
router.post('/create-customer-portal-session', requireAuth, async (req, res) => {
  try {
    const user = req.user;

    // The user object from requireAuth contains the profile from Supabase.
    // We need the stripe_customer_id stored in our database.
    const stripeCustomerId = user.stripe_customer_id;

    if (!stripeCustomerId) {
      return res.status(400).json({ message: 'Stripe customer ID not found for this user.' });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${req.headers.origin}/account`,
    });

    res.status(200).json({ url: portalSession.url });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    res.status(500).json({ message: 'Error creating customer portal session' });
  }
});

module.exports = router; 
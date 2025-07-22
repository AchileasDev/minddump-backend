const express = require('express');
const router = express.Router();
const Stripe = require('stripe');
const { requireAuth } = require('../middleware/auth');
const { validateRequired, sanitizeInput } = require('../middleware/validation');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Create a subscription checkout session
router.post('/create-checkout-session', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    // Check if user already has an active subscription
    if (user.subscription_status === 'active') {
      return res.status(400).json({ 
        error: 'Subscription exists',
        message: 'You already have an active subscription' 
      });
    }

    // Create or get Stripe customer
    let customer;
    if (user.stripe_customer_id) {
      customer = await stripe.customers.retrieve(user.stripe_customer_id);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId: user.id
        }
      });

      // Save customer ID to user profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ stripe_customer_id: customer.id })
        .eq('id', user.id);

      if (updateError) {
        console.error('Error updating user with Stripe customer ID:', updateError);
        return res.status(500).json({ 
          error: 'Database error',
          message: 'Error saving customer information' 
        });
      }
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
        userId: user.id
      }
    });

    res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        url: session.url
      }
    });
  } catch (error) {
    console.error('Stripe session error:', error);
    next(error);
  }
});

// Get subscription status
router.get('/subscription-status', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    // If user doesn't have a Stripe subscription yet
    if (!user.stripe_subscription_id) {
      return res.status(200).json({
        success: true,
        data: {
          status: user.subscription_status,
          trial_ends_at: user.trial_ends_at,
          isActive: user.role === 'premium'
        }
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(user.stripe_subscription_id);

    res.status(200).json({
      success: true,
      data: {
        status: user.subscription_status,
        trial_ends_at: user.trial_ends_at,
        isActive: user.role === 'premium',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      }
    });
  } catch (error) {
    console.error('Subscription status error:', error);
    next(error);
  }
});

// Cancel subscription
router.post('/cancel-subscription', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.stripe_subscription_id) {
      return res.status(400).json({ 
        error: 'No subscription',
        message: 'No active subscription found' 
      });
    }

    // Cancel at period end
    const subscription = await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    // Update user's subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'canceled' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating subscription status:', updateError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating subscription status' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Subscription will be canceled at the end of the billing period',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      }
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    next(error);
  }
});

// Resume canceled subscription
router.post('/resume-subscription', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.stripe_subscription_id) {
      return res.status(400).json({ 
        error: 'No subscription',
        message: 'No subscription found' 
      });
    }

    // Resume subscription by removing cancel_at_period_end
    const subscription = await stripe.subscriptions.update(user.stripe_subscription_id, {
      cancel_at_period_end: false
    });

    // Update user's subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ subscription_status: 'active' })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating subscription status:', updateError);
      return res.status(500).json({ 
        error: 'Database error',
        message: 'Error updating subscription status' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        message: 'Subscription resumed successfully',
        subscription: {
          id: subscription.id,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          cancelAtPeriodEnd: subscription.cancel_at_period_end
        }
      }
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    next(error);
  }
});

// Create a Stripe Customer Portal session
router.post('/create-customer-portal-session', requireAuth, async (req, res, next) => {
  try {
    const user = req.user;

    if (!user.stripe_customer_id) {
      return res.status(400).json({ 
        error: 'No customer',
        message: 'Stripe customer ID not found for this user' 
      });
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: `${req.headers.origin}/account`,
    });

    res.status(200).json({
      success: true,
      data: {
        url: portalSession.url
      }
    });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    next(error);
  }
});

module.exports = router; 
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Handle Stripe webhook events
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error(`❌ Error message: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const stripeCustomerId = session.customer;
      const stripeSubscriptionId = session.subscription;

      if (!userId) {
        console.error('Webhook Error: Missing userId in session metadata');
        return res.status(400).send('Webhook Error: Missing userId in session metadata.');
      }

      try {
        // Update user's role to 'premium' in Supabase
        const { error } = await supabaseAdmin
          .from('profiles')
          .update({ 
            role: 'premium',
            stripe_customer_id: stripeCustomerId,
            stripe_subscription_id: stripeSubscriptionId,
          })
          .eq('id', userId);

        if (error) {
          throw error;
        }

        console.log(`User ${userId} upgraded to premium.`);
      } catch (error) {
        console.error('Error updating user profile in Supabase:', error);
        return res.status(500).json({ error: 'Database error' });
      }
      break;
    }
    // You can handle other events here, like 'customer.subscription.deleted'
    // to downgrade the user's role.
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).json({ received: true });
};

module.exports = {
  handleStripeWebhook
}; 
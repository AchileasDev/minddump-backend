import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2022-11-15' });
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const TRIAL_PRICE_ID = process.env.STRIPE_TRIAL_PRICE_ID!;
const DOMAIN = process.env.STRIPE_DOMAIN || 'http://localhost:3000';

export async function getStripeCustomerId(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();
  if (error || !data?.stripe_customer_id) throw new Error('Stripe customer ID not found');
  return data.stripe_customer_id;
}

export async function createCheckoutSession(userId: string): Promise<string> {
  const customerId = await getStripeCustomerId(userId);
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'subscription',
    customer: customerId,
    line_items: [
      {
        price: TRIAL_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${DOMAIN}/dashboard?checkout=success`,
    cancel_url: `${DOMAIN}/dashboard?checkout=cancel`,
    allow_promotion_codes: true,
    subscription_data: {
      trial_period_days: 14,
    },
  });
  return session.url!;
}

export async function createCustomerPortal(userId: string): Promise<string> {
  const customerId = await getStripeCustomerId(userId);
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${DOMAIN}/dashboard`,
  });
  return portalSession.url;
}

export async function getUserSubscriptionStatus(userId: string): Promise<'active' | 'inactive'> {
  const customerId = await getStripeCustomerId(userId);
  const subscriptions = await stripe.subscriptions.list({ customer: customerId, status: 'all', limit: 1 });
  const sub = subscriptions.data.find(s => ['active', 'trialing', 'past_due'].includes(s.status));
  return sub ? 'active' : 'inactive';
}
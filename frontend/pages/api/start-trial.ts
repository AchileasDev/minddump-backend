import { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Create authenticated Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name) => req.cookies[name],
          set: (name, value, options) => {
            res.setHeader('Set-Cookie', `${name}=${value}`);
          },
          remove: (name, options) => {
            res.setHeader('Set-Cookie', `${name}=`);
          },
        },
      }
    );

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's current subscription status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('subscription_status')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return res.status(500).json({ error: 'Failed to fetch user profile' });
    }

    // Check if user is eligible for trial
    const currentStatus = profile?.subscription_status;
    if (currentStatus === 'trial' || currentStatus === 'active' || currentStatus === 'expired') {
      return res.status(400).json({ 
        error: 'Trial already used or subscription active',
        currentStatus
      });
    }

    if (currentStatus !== null && currentStatus !== 'none') {
      return res.status(400).json({ 
        error: 'Invalid subscription status',
        currentStatus
      });
    }

    // Calculate trial end date (14 days from now)
    const trialEnds = new Date();
    trialEnds.setDate(trialEnds.getDate() + 14);

    // Update user's profile with trial information
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'trial',
        trial_ends: trialEnds.toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Error updating trial status:', updateError);
      return res.status(500).json({ error: 'Failed to start trial' });
    }

    return res.status(200).json({ 
      message: 'Trial activated successfully',
      trialEnds: trialEnds.toISOString()
    });
  } catch (error) {
    console.error('Error in start-trial:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
} 
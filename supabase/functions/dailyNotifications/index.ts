// @deno-types="deno"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from '@supabase/supabase-js';
import * as admin from 'firebase-admin';

// Firebase Admin initialization
if (admin.apps.length === 0) {
  const credentialsPath = process.env.FIREBASE_CREDENTIALS_PATH;
  if (!credentialsPath) {
    throw new Error('FIREBASE_CREDENTIALS_PATH env variable is missing.');
  }
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const serviceAccount = require(credentialsPath);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

serve(async (req) => {
  try {
    // 1. Get all active users from profiles
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id, email, notification_token, notifications_enabled, is_active')
      .eq('is_active', true);

    if (usersError) {
      return new Response(JSON.stringify({ error: 'Failed to fetch users' }), { status: 500 });
    }

    const usersToNotify: { user_id: string; email: string; notification_token: string }[] = [];
    const notifiedUsers: { user_id: string; email: string }[] = [];
    const now = new Date();

    for (const user of users) {
      if (user.notifications_enabled === false || !user.notification_token) continue;
      // 2. Get most recent dump for user
      const { data: lastDump } = await supabase
        .from('dumps')
        .select('created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      let lastDumpDate = lastDump ? new Date(lastDump.created_at) : null;
      let daysSinceLastDump = lastDumpDate ? (now.getTime() - lastDumpDate.getTime()) / (1000 * 60 * 60 * 24) : Infinity;

      if (daysSinceLastDump >= 3) {
        usersToNotify.push({
          user_id: user.id,
          email: user.email,
          notification_token: user.notification_token
        });
      }
    }

    // 4. Send push notification to each user
    for (const user of usersToNotify) {
      try {
        await admin.messaging().send({
          token: user.notification_token,
          notification: {
            title: 'MindDump',
            body: 'Μήπως ήρθε η ώρα να ξαναγράψεις τις σκέψεις σου;',
          },
          data: { type: 'reminder' },
        });
        notifiedUsers.push({ user_id: user.user_id, email: user.email });
      } catch (err) {
        // Log and skip failed notifications
        console.error('Failed to notify', user.user_id, err);
      }
    }

    return new Response(JSON.stringify({ notifiedUsers }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error', details: err.message }), { status: 500 });
  }
}); 
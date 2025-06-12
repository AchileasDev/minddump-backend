import { createClient } from '@supabase/supabase-js';
import { getMessaging } from 'firebase-admin/messaging';
import { initializeApp, getApps, cert } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
  icon?: string;
}

export class NotificationService {
  static async sendToUser(userId: string, payload: NotificationPayload) {
    try {
      // Get user's notification token
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('notification_token')
        .eq('id', userId)
        .single();

      if (error || !profile?.notification_token) {
        console.error('Error fetching notification token:', error);
        return false;
      }

      // Send notification
      await getMessaging().send({
        token: profile.notification_token,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data,
      });

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  static async sendToMultipleUsers(userIds: string[], payload: NotificationPayload) {
    try {
      // Get notification tokens for all users
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('notification_token')
        .in('id', userIds)
        .not('notification_token', 'is', null);

      if (error || !profiles?.length) {
        console.error('Error fetching notification tokens:', error);
        return false;
      }

      // Send notifications to all tokens
      const tokens = profiles.map(p => p.notification_token);
      await getMessaging().sendMulticast({
        tokens,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.icon,
        },
        data: payload.data,
      });

      return true;
    } catch (error) {
      console.error('Error sending notifications:', error);
      return false;
    }
  }

  // Example usage for sending weekly insights
  static async sendWeeklyInsights(userId: string, insights: string[]) {
    return this.sendToUser(userId, {
      title: 'Your Weekly Journal Insights',
      body: insights.join('\n'),
      icon: '/icons/insights-icon.png',
      data: {
        type: 'weekly-insights',
        timestamp: new Date().toISOString(),
      },
    });
  }

  // Example usage for sending new feature notifications
  static async sendFeatureUpdate(userIds: string[], featureName: string, description: string) {
    return this.sendToMultipleUsers(userIds, {
      title: `New Feature: ${featureName}`,
      body: description,
      icon: '/icons/feature-icon.png',
      data: {
        type: 'feature-update',
        feature: featureName,
        timestamp: new Date().toISOString(),
      },
    });
  }
} 
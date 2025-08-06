import { useState, useEffect, useCallback } from 'react';
import { getToken, deleteToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging } from '@/lib/firebase-config';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export type NotificationStatus = 'enabled' | 'blocked' | 'default';

interface UseNotifications {
  isSupported: boolean;
  isPermissionGranted: boolean;
  isLoading: boolean;
  status: NotificationStatus;
  error: string | null;
  enableNotifications: () => Promise<void>;
  disableNotifications: () => Promise<void>;
  triggerTestNotification: () => Promise<void>;
}

export const useNotifications = (): UseNotifications => {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [status, setStatus] = useState<NotificationStatus>('default');
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Check browser support and permission status
  useEffect(() => {
    setIsSupported('Notification' in window && messaging !== undefined);
    if ('Notification' in window) {
      setStatus(Notification.permission as NotificationStatus);
      setIsPermissionGranted(Notification.permission === 'granted');
    }
  }, []);

  // Remove FCM token from Supabase on logout
  useEffect(() => {
    if (!user) {
      // Remove token from Supabase if user logs out
      (async () => {
        try {
          const { supabase } = await import('@/lib/supabase');
          await supabase
            .from('profiles')
            .update({ notification_token: null })
            .eq('id', user?.id);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [user]);

  // Enable notifications and save token
  const enableNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!isSupported) throw new Error('Notifications not supported');
      if (!user) throw new Error('You must be logged in');

      // Request permission
      const permission = await Notification.requestPermission();
      setStatus(permission as NotificationStatus);
      setIsPermissionGranted(permission === 'granted');
      if (permission !== 'granted') throw new Error('Permission denied');

      // Register service worker
      let swRegistration: ServiceWorkerRegistration | undefined;
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      } catch (err) {
        throw new Error('Service worker registration failed');
      }

      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });
      if (!token) throw new Error('Failed to get FCM token');

      // Save token to Supabase
      const { supabase } = await import('@/lib/supabase');
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ notification_token: token })
        .eq('id', user.id);
      if (dbError) throw dbError;

      toast.success('Notifications enabled!');
    } catch (e: any) {
      setError(e.message || 'Failed to enable notifications');
      toast.error(e.message || 'Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user]);

  // Disable notifications and remove token
  const disableNotifications = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in');
      // Delete FCM token
      await deleteToken(messaging);
      // Remove token from Supabase
      const { supabase } = await import('@/lib/supabase');
      await supabase
        .from('profiles')
        .update({ notification_token: null })
        .eq('id', user.id);
      setIsPermissionGranted(false);
      setStatus('default');
      toast.success('Notifications disabled');
    } catch (e: any) {
      setError(e.message || 'Failed to disable notifications');
      toast.error(e.message || 'Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Trigger test notification via backend, fallback to toast
  const triggerTestNotification = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in');
      // Call backend endpoint to send test notification
      const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!res.ok) throw new Error('Backend not ready or failed to send notification');
      toast.success('Test notification sent!');
    } catch (e: any) {
      // Fallback: show local toast
      toast('🔔 This is a test notification (local fallback)');
      setError(e.message || 'Failed to send test notification');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Listen for foreground messages
  useEffect(() => {
    if (!isSupported) return;
    const unsubscribe = onMessage(messaging, (payload: MessagePayload) => {
      toast.custom((t) => (
        <div className="bg-white shadow-lg rounded-lg p-4 flex items-center">
          <span className="mr-2">🔔</span>
          <span>{payload.notification?.title || 'Notification'}</span>
          <button className="ml-4 text-xs text-gray-500" onClick={() => toast.dismiss(t.id)}>Close</button>
        </div>
      ));
    });
    return () => {
      // No unsubscribe needed for onMessage in web
    };
  }, [isSupported]);

  return {
    isSupported,
    isPermissionGranted,
    isLoading,
    status,
    error,
    enableNotifications,
    disableNotifications,
    triggerTestNotification,
  };
};
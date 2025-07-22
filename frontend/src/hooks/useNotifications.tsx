import React, { useState, useEffect } from 'react';
import { getToken, onMessage, MessagePayload } from 'firebase/messaging';
import { messaging } from '@/lib/firebase-config';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

interface UseNotificationsResult {
  isPermissionGranted: boolean;
  isLoading: boolean;
  requestPermission: () => Promise<void>;
}

interface NotificationToastProps {
  payload: MessagePayload;
  onClose: () => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ payload, onClose }) => {
  const title = payload.notification?.title || 'New Notification';
  const body = payload.notification?.body || '';
  const icon = payload.notification?.icon || '/default-icon.png';

  return (
    <div className="max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5 mx-2 sm:mx-0">
      <div className="flex-1 w-0 p-3 sm:p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-0.5 mr-2 sm:mr-0">
            <img className="h-8 w-8 sm:h-10 sm:w-10 rounded-full" src={icon} alt={`${title} notification icon`} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{title}</p>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 line-clamp-2">{body}</p>
          </div>
        </div>
      </div>
      <div className="flex border-l border-gray-200 flex-shrink-0">
        <button
          onClick={onClose}
          className="w-full border border-transparent rounded-none rounded-r-lg p-3 sm:p-4 flex items-center justify-center text-xs sm:text-sm font-medium text-[#EC7CA5] hover:text-[#EC7CA5] focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export const useNotifications = (): UseNotificationsResult => {
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const initializeNotifications = async () => {
      try {
        // Check if the browser supports notifications
        if (!('Notification' in window)) {
          console.log('This browser does not support notifications');
          setIsLoading(false);
          return;
        }

        // Register service worker for FCM
        let swRegistration: ServiceWorkerRegistration | undefined;
        try {
          swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        } catch (err) {
          console.error('Service worker registration failed:', err);
          return;
        }

        // Request permission
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') return;

        // Get FCM token with service worker
        if (messaging && swRegistration) {
          const token = await getToken(messaging, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
            serviceWorkerRegistration: swRegistration,
          });

          // Save token to Supabase
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { error } = await supabase
              .from('profiles')
              .update({ notification_token: token })
              .eq('id', user.id);

            if (error) {
              console.error('Error saving notification token:', error);
            }
          }

          // Handle foreground messages
          onMessage(messaging, (payload: MessagePayload) => {
            toast.custom((t) => (
              <NotificationToast 
                payload={payload} 
                onClose={() => toast.dismiss(t.id)} 
              />
            ));
          });
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
        throw error; // Re-throw to handle it in the UI if needed
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, [supabase]);

  const requestPermission = async (): Promise<void> => {
    try {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === 'granted');
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      throw error; // Re-throw to handle it in the UI if needed
    }
  };

  return {
    isPermissionGranted,
    isLoading,
    requestPermission
  };
}; 
import { useState, useEffect } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '@/lib/firebase-config';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import toast from 'react-hot-toast';

export const useNotifications = () => {
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

        // Check if we have permission
        const permission = await Notification.requestPermission();
        setIsPermissionGranted(permission === 'granted');

        if (permission === 'granted') {
          // Get FCM token
          const token = await getToken(messaging!, {
            vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          });

          // Save token to Supabase
          const { error } = await supabase
            .from('profiles')
            .update({ notification_token: token })
            .eq('id', (await supabase.auth.getUser()).data.user?.id);

          if (error) {
            console.error('Error saving notification token:', error);
          }

          // Handle foreground messages
          onMessage(messaging!, (payload) => {
            toast.custom((t) => (
              <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
                <div className="flex-1 w-0 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 pt-0.5">
                      <img
                        className="h-10 w-10 rounded-full"
                        src={payload.notification?.icon || '/icons/notification-icon.png'}
                        alt=""
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {payload.notification?.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {payload.notification?.body}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex border-l border-gray-200">
                  <button
                    onClick={() => toast.dismiss(t.id)}
                    className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-[#EC7CA5] hover:text-[#EC7CA5] focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
                  >
                    Close
                  </button>
                </div>
              </div>
            ));
          });
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, [supabase]);

  const requestPermission = async () => {
    try {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === 'granted');
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  };

  return {
    isPermissionGranted,
    isLoading,
    requestPermission
  };
}; 
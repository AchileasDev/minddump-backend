import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase-config';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiBell, FiX } from 'react-icons/fi';

interface NotificationPromptProps {
  onClose?: () => void;
  showCloseButton?: boolean;
}

export default function NotificationPrompt({ onClose, showCloseButton = false }: NotificationPromptProps) {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check current permission status
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Received foreground message:', payload);
      
      // Show a toast notification for foreground messages
      if (payload.notification) {
        toast.success(payload.notification.title || 'New notification received!', {
          duration: 4000,
          icon: '🔔',
        });
      }
    });

    return () => unsubscribe();
  }, []);

  const handleRequestPermission = async () => {
    if (!user) {
      toast.error('You must be logged in to enable notifications');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = await requestNotificationPermission();
      
      if (token) {
        setPermission('granted');
        
        // Send token to backend
        setIsSubmitting(true);
        const response = await api.saveNotificationToken(token);
        
        if (response.success) {
          toast.success('Notifications enabled successfully!');
          setIsDismissed(true);
        } else {
          toast.error(response.message || 'Failed to save notification token');
        }
      } else {
        setPermission('denied');
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onClose?.();
  };

  // Don't show if permission is already granted or component is dismissed
  if (permission === 'granted' || isDismissed) {
    return null;
  }

  // Don't show if permission is denied (user explicitly denied)
  if (permission === 'denied') {
    return null;
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 relative">
      {showCloseButton && (
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification prompt"
        >
          <FiX className="w-4 h-4" />
        </button>
      )}
      
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FiBell className="w-5 h-5 text-blue-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-blue-900">
            Enable Push Notifications
          </h3>
          <p className="mt-1 text-sm text-blue-700">
            Get notified about daily journaling reminders and insights. We'll only send you relevant updates.
          </p>
          
          <div className="mt-3 flex space-x-3">
            <button
              onClick={handleRequestPermission}
              disabled={isLoading || isSubmitting}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting...
                </>
              ) : isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Enabling...
                </>
              ) : (
                <>
                  <FiBell className="w-4 h-4 mr-2" />
                  Enable Notifications
                </>
              )}
            </button>
            
            {showCloseButton && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Maybe Later
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 
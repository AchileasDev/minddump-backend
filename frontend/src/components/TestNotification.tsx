import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { FiBell, FiSend } from 'react-icons/fi';

export default function TestNotification() {
  const { user } = useAuth();
  const [isSending, setIsSending] = useState(false);

  const handleTestNotification = async () => {
    if (!user) {
      toast.error('You must be logged in to test notifications');
      return;
    }

    setIsSending(true);
    
    try {
      const response = await api.testNotification(user.id);
      
      if (response.success) {
        toast.success('Test notification sent! Check your browser notifications.');
      } else {
        toast.error(response.message || 'Failed to send test notification');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Failed to send test notification');
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <FiBell className="w-5 h-5 text-yellow-600" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-yellow-900">
            Test Push Notifications
          </h3>
          <p className="mt-1 text-sm text-yellow-700">
            Send yourself a test notification to verify the system is working.
          </p>
          
          <div className="mt-3">
            <button
              onClick={handleTestNotification}
              disabled={isSending}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                <>
                  <FiSend className="w-4 h-4 mr-2" />
                  Send Test Notification
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
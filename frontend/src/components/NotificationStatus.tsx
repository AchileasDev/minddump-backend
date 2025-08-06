import React from 'react';
import { useNotifications } from '@/hooks/useNotifications';

const NotificationStatus: React.FC = () => {
  const {
    isSupported,
    isPermissionGranted,
    isLoading,
    status,
    error,
    enableNotifications,
    disableNotifications,
    triggerTestNotification,
  } = useNotifications();

  if (!isSupported) {
    return <div className="text-gray-500">Notifications are not supported in this browser.</div>;
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-sm">
        <span>Status: </span>
        {status === 'granted' || isPermissionGranted ? (
          <span className="text-green-600 font-semibold">Enabled</span>
        ) : status === 'denied' || status === 'blocked' ? (
          <span className="text-red-600 font-semibold">Blocked</span>
        ) : (
          <span className="text-yellow-600 font-semibold">Not Enabled</span>
        )}
      </div>
      {error && <div className="text-xs text-red-500">{error}</div>}
      <div className="flex space-x-2">
        {!isPermissionGranted && (
          <button
            className="px-4 py-2 bg-[#EC7CA5] text-white rounded hover:bg-[#d66f94] disabled:opacity-50"
            onClick={enableNotifications}
            disabled={isLoading}
          >
            Enable Notifications
          </button>
        )}
        {isPermissionGranted && (
          <>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
              onClick={disableNotifications}
              disabled={isLoading}
            >
              Disable
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              onClick={triggerTestNotification}
              disabled={isLoading}
            >
              Test Notification
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default NotificationStatus;
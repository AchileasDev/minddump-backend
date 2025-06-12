import React from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { FiBell, FiBellOff } from 'react-icons/fi';

export const NotificationSettings = () => {
  const { isPermissionGranted, isLoading, requestPermission } = useNotifications();

  const handleToggleNotifications = async () => {
    if (!isPermissionGranted) {
      const granted = await requestPermission();
      if (!granted) {
        // Show error toast or message
        console.log('Notification permission denied');
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isPermissionGranted ? (
              <FiBell className="w-5 h-5 text-[#EC7CA5]" />
            ) : (
              <FiBellOff className="w-5 h-5 text-gray-400" />
            )}
            <div>
              <p className="font-medium text-gray-800">Push Notifications</p>
              <p className="text-sm text-gray-500">
                {isPermissionGranted
                  ? 'You will receive notifications for new insights and updates'
                  : 'Enable notifications to stay updated with your journal insights'}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleToggleNotifications}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              isPermissionGranted
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-[#EC7CA5] text-white hover:bg-opacity-90'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : isPermissionGranted ? (
              'Disable'
            ) : (
              'Enable'
            )}
          </button>
        </div>

        {isPermissionGranted && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">You'll receive notifications for:</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#EC7CA5] rounded-full mr-2" />
                New journal insights and reflections
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#EC7CA5] rounded-full mr-2" />
                Weekly emotional trend reports
              </li>
              <li className="flex items-center">
                <span className="w-1.5 h-1.5 bg-[#EC7CA5] rounded-full mr-2" />
                Important updates and features
              </li>
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
}; 
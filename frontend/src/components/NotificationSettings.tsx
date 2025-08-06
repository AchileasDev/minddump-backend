import React from 'react';
import { motion } from 'framer-motion';
import NotificationStatus from './NotificationStatus';

export const NotificationSettings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Notification Settings</h2>
      <div className="space-y-4">
        <NotificationStatus />
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
      </div>
    </motion.div>
  );
}; 
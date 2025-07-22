import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { FiBell, FiBellOff } from 'react-icons/fi';
import toast from 'react-hot-toast';

export const NotificationSettings = () => {
  const { isPermissionGranted } = useNotifications();
  const { user } = useAuth();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSetting = async () => {
      if (!user) return;
      setLoading(true);
      
      try {
        const response = await api.getUserProfile();
        
        if (response.success && response.data) {
          const userData = response.data as any;
          setEnabled(userData.notifications_enabled ?? true);
        } else {
          setEnabled(true); // Default to enabled
        }
      } catch (error) {
        console.error('Failed to fetch notification setting:', error);
        setEnabled(true); // Default to enabled
      } finally {
        setLoading(false);
      }
    };
    
    fetchSetting();
  }, [user]);

  const handleToggle = async () => {
    if (enabled === null) return;
    setLoading(true);
    
    try {
      const response = await api.toggleNotifications(!enabled);
      
      if (response.success) {
        setEnabled(!enabled);
        toast.success(`Notifications ${!enabled ? 'enabled' : 'disabled'}`);
      } else {
        toast.error(response.message || 'Failed to update setting');
      }
    } catch (error) {
      console.error('Failed to update notification setting:', error);
      toast.error('Failed to update setting');
    } finally {
      setLoading(false);
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
          
          <input
            id="notifications-toggle"
            type="checkbox"
            checked={!!enabled}
            onChange={handleToggle}
            disabled={loading || enabled === null}
            className="w-12 h-6 bg-gray-200 rounded-full checked:bg-[#EC7CA5] checked:border-transparent focus:outline-none focus:ring-0 focus:ring-offset-0"
          />
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
import React from 'react';
import { useSubscription } from '@/hooks/useSubscription';

const SubscriptionPanel: React.FC = () => {
  const { status, loading, startCheckout, openPortal } = useSubscription();

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md flex flex-col items-center space-y-4">
      <h2 className="text-xl font-bold text-gray-800 dark:text-white">Subscription</h2>
      <div className="text-gray-700 dark:text-gray-300">
        Status: {loading ? <span className="text-yellow-500">Loading...</span> : status === 'active' ? <span className="text-green-600">Active</span> : <span className="text-red-600">Inactive</span>}
      </div>
      {status === 'inactive' ? (
        <button
          className="px-6 py-3 bg-[#EC7CA5] text-white rounded-xl font-semibold hover:bg-[#d66f94] disabled:opacity-50"
          onClick={startCheckout}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Start Free Trial'}
        </button>
      ) : (
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 disabled:opacity-50"
          onClick={openPortal}
          disabled={loading}
        >
          {loading ? 'Loading...' : 'Manage Subscription'}
        </button>
      )}
    </div>
  );
};

export default SubscriptionPanel;
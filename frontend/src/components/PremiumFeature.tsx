import React from 'react';
import { useTrial } from '../hooks/useTrial';

interface PremiumFeatureProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PremiumFeature({ children, fallback }: PremiumFeatureProps) {
  const { canAccessPremium, isLoading, daysRemaining, subscriptionStatus } = useTrial();

  if (isLoading) {
    return <div className="animate-pulse bg-gray-100 rounded-lg p-4">Loading...</div>;
  }

  if (!canAccessPremium()) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Premium Feature</h3>
          <p className="text-gray-600 mb-4">
            {subscriptionStatus === 'trial' && daysRemaining === 0
              ? "Your trial has expired. Upgrade to continue accessing premium features."
              : "Upgrade to premium to access this feature."}
          </p>
          <button
            onClick={() => window.location.href = '/pricing'}
            className="px-4 py-2 bg-[#EC7CA5] text-white rounded-lg hover:bg-opacity-90 transition duration-300"
          >
            {subscriptionStatus === 'trial' && daysRemaining === 0
              ? "Upgrade Now"
              : "Start Free Trial"}
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
} 
import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { createBrowserClient } from '@supabase/ssr';

interface TrialStatus {
  isActive: boolean;
  daysRemaining: number;
  subscriptionStatus: 'none' | 'trial' | 'active' | 'expired' | null;
  trialEnds: string | null;
}

export function useTrial() {
  const { user } = useAuth();
  const [trialStatus, setTrialStatus] = useState<TrialStatus>({
    isActive: false,
    daysRemaining: 0,
    subscriptionStatus: null,
    trialEnds: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTrialStatus() {
      if (!user) {
        setTrialStatus({
          isActive: false,
          daysRemaining: 0,
          subscriptionStatus: null,
          trialEnds: null,
        });
        setIsLoading(false);
        return;
      }

      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('subscription_status, trial_ends')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        const now = new Date();
        const trialEnds = profile.trial_ends ? new Date(profile.trial_ends) : null;
        const daysRemaining = trialEnds
          ? Math.max(0, Math.ceil((trialEnds.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          : 0;

        const isActive = profile.subscription_status === 'trial' && daysRemaining > 0;

        setTrialStatus({
          isActive,
          daysRemaining,
          subscriptionStatus: profile.subscription_status,
          trialEnds: profile.trial_ends,
        });
      } catch (err) {
        console.error('Error fetching trial status:', err);
        setError('Failed to fetch trial status');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTrialStatus();
  }, [user]);

  const canAccessPremium = () => {
    return trialStatus.subscriptionStatus === 'active' || 
           (trialStatus.subscriptionStatus === 'trial' && trialStatus.isActive);
  };

  return {
    ...trialStatus,
    isLoading,
    error,
    canAccessPremium,
  };
} 
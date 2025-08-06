import { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useSubscription = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'active' | 'inactive'>('inactive');
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!user?.access_token) return;
    setLoading(true);
    try {
      const s = await api.getSubscriptionStatus(user.access_token);
      setStatus(s);
    } catch (e: any) {
      toast.error(e.message || 'Failed to fetch subscription status');
    } finally {
      setLoading(false);
    }
  }, [user?.access_token]);

  useEffect(() => {
    if (user?.access_token) fetchStatus();
  }, [user?.access_token, fetchStatus]);

  const startCheckout = async () => {
    if (!user?.access_token) return;
    setLoading(true);
    try {
      const url = await api.createCheckoutSession(user.access_token);
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  const openPortal = async () => {
    if (!user?.access_token) return;
    setLoading(true);
    try {
      const url = await api.createCustomerPortal(user.access_token);
      window.location.href = url;
    } catch (e: any) {
      toast.error(e.message || 'Failed to open portal');
    } finally {
      setLoading(false);
    }
  };

  return { status, loading, startCheckout, openPortal };
};
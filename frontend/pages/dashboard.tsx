import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import InsightsCard from '@/components/InsightsCard';
import MoodChart from '@/components/MoodChart';
import KeywordCloud from '@/components/KeywordCloud';
import { useAuth, User } from '@/hooks/useAuth';
import { loadStripe } from '@stripe/stripe-js';
import toast from 'react-hot-toast';
import Header from '@/components/Header';
import NotificationPrompt from '@/components/NotificationPrompt';
import { api } from '@/lib/api';
import { supabase } from '@/lib/supabase';

// Initialize Stripe.js with the publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function DashboardPage() {
  const { user, loading, startTrial } = useAuth();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [isStartingTrial, setIsStartingTrial] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      try {
        if (typeof window !== 'undefined' && router) {
          router.replace('/login');
        }
      } catch (error) {
        console.error('Navigation error:', error);
        // Fallback: reload to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }

    // Show payment status messages
    if (router.query.payment === 'success') {
      if (typeof window !== 'undefined' && window.gtag && user?.id) {
        window.gtag('event', 'upgrade_to_pro', {
          method: 'stripe',
          user_id: user.id,
        });
      }
      try {
        if (typeof window !== 'undefined' && router) {
          router.replace('/dashboard', undefined, { shallow: true });
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
      toast.success("Welcome back! Your payment was successful.");
    } else if (router.query.payment === 'canceled') {
      try {
        if (typeof window !== 'undefined' && router) {
          router.replace('/dashboard', undefined, { shallow: true });
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }
      toast.error("Your payment was canceled.");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session error:", error);
        } else if (session) {
          console.log("JWT Token:", session.access_token);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      }
    };
    fetchToken();
  }, []);

  // Removed old Firebase messaging code - now handled by NotificationPrompt component

  const handleStartTrial = async () => {
    setIsStartingTrial(true);
    try {
      const promise = startTrial();

      toast.promise(promise, {
        loading: 'Activating your trial...',
        success: () => {
          if (typeof window !== 'undefined' && window.gtag && user?.id) {
            window.gtag('event', 'start_trial', {
              method: 'button',
              user_id: user.id,
            });
          }
          return 'Trial activated! You now have access to all premium features.';
        },
        error: (err) => {
          return <b>{err.message || 'Could not start trial.'}</b>;
        },
      });
    } catch (error) {
      console.error('Start trial error:', error);
      toast.error('Failed to start trial. Please try again.');
    } finally {
      setIsStartingTrial(false);
    }
  };

  const handleUpgrade = async () => {
    if (!user) return;
    setIsRedirecting(true);

    try {
      const response = await api.createCheckoutSession();
      
      if (!response.success || !response.data) {
        throw new Error(response.message || 'Failed to create checkout session');
      }

      const { sessionId } = response.data as { sessionId: string };
      const stripe = await stripePromise;
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId });
      } else {
        throw new Error('Stripe.js not loaded');
      }
    } catch (error) {
      setIsRedirecting(false);
      toast.error(error instanceof Error ? error.message : 'Could not initiate checkout.');
    }
  };

  // Show loading state while authentication is being determined
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F8E4EC] dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-md text-center animate-pulse">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2 mx-auto"></div>
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  // Show loading state if no user and we're on client side
  if (!user && typeof window !== 'undefined') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-[#F8E4EC] dark:from-gray-900 dark:to-gray-800">
        <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-md text-center animate-pulse">
          <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2 mx-auto"></div>
          <div className="h-4 w-56 bg-gray-200 dark:bg-gray-700 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-white to-[#F8E4EC] dark:from-gray-900 dark:to-gray-800 py-8 px-2">
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white flex items-center justify-center gap-3">
              <svg className="w-8 h-8 text-[#EC7CA5]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Your AI Dashboard
            </h1>
            <p className="mt-2 text-gray-500 dark:text-gray-300 text-lg">Personalized insights, mood trends & key themes at a glance</p>
            
            {/* Create New Entry Button */}
            <div className="mt-6">
              <button
                onClick={() => router.push('/dashboard/new-entry')}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create New Entry
              </button>
            </div>
          </header>

          {/* Notification Prompt */}
          <NotificationPrompt showCloseButton={true} />
          
          {/* Premium Badge and Upgrade Button */}
          <div className="flex justify-center items-center mb-6 space-x-4">
            {(user as User)?.role === 'premium' ? (
              <span className="bg-green-100 text-green-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
                Premium Member
              </span>
            ) : (
              <>
                {(user as User)?.subscription_status !== 'trialing' && (
                  <button
                    onClick={handleStartTrial}
                    disabled={isStartingTrial}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isStartingTrial ? 'Starting...' : 'Start 14-day Free Trial'}
                  </button>
                )}
                <button
                  onClick={handleUpgrade}
                  disabled={isRedirecting}
                  className="bg-[#EC7CA5] hover:bg-[#d66f94] text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {isRedirecting ? 'Redirecting...' : 'Upgrade to Premium'}
                </button>
              </>
            )}
          </div>

          <main>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <section className="col-span-1">
                <InsightsCard />
              </section>
              <section className="col-span-1">
                <MoodChart />
              </section>
            </div>
            <section className="mb-6">
              <KeywordCloud />
            </section>
          </main>
        </div>
      </div>
    </>
  );
} 
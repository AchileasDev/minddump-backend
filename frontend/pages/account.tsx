import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth, UserProfile } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import toast from 'react-hot-toast';
import Head from 'next/head';
import Header from '@/components/Header';

const AccountPage = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [isBillingLoading, setIsBillingLoading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleManageBilling = async () => {
    setIsBillingLoading(true);
    toast.loading('Redirecting to billing portal...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('User not logged in');

      const response = await fetch('/api/stripe/create-customer-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const { message } = await response.json();
        throw new Error(message || 'Failed to create billing session.');
      }

      const { url } = await response.json();
      window.location.href = url;
    } catch (error: any) {
      toast.dismiss();
      toast.error(error.message || 'Could not redirect to billing.');
      setIsBillingLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully.');
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  const typedUser = user as UserProfile;

  return (
    <>
      <Header />
      <Head>
        <title>My Account - MindDump</title>
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-center">My Account</h1>
          </header>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Email Address</h3>
                <p>{typedUser.email}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Subscription Status</h3>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  typedUser.role === 'premium' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {typedUser.role === 'premium' ? 'Premium' : 'Free'}
                </span>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleManageBilling}
                disabled={isBillingLoading}
                className="w-full sm:w-auto flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#EC7CA5] hover:bg-[#d66f94] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC7CA5] disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isBillingLoading ? 'Redirecting...' : 'Manage Billing'}
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full sm:w-auto flex-1 justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountPage; 
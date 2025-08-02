import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      const promise = signOut();
      toast.promise(promise, {
        loading: 'Signing out...',
        success: () => {
          try {
            if (typeof window !== 'undefined' && router) {
              router.push('/login');
            }
          } catch (navError) {
            console.error('Navigation error:', navError);
            // Fallback: reload to login
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          return <b>Signed out successfully!</b>;
        },
        error: (err) => <b>{err?.message || 'Could not sign out.'}</b>,
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    }
  };

  return (
    <header className="bg-white shadow-sm dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/dashboard" className="text-2xl font-bold text-primary dark:text-white">
            MindDump
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/dashboard" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/history" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              History
            </Link>
            <Link href="/favorites" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              Favorites
            </Link>
            <Link href="/weekly" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              Weekly
            </Link>
            <Link href="/profile" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              Profile
            </Link>
            <Link href="/dashboard/new-entry" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
              + New Entry
            </Link>
            <Link href="/account" className="text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-white transition">
              Account
            </Link>
            {user && (
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Sign Out
              </button>
            )}
          </nav>
          {/* Mobile Menu Button can be added here if needed */}
        </div>
      </div>
    </header>
  );
} 
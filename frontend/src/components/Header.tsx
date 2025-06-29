import Link from 'next/link';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';

export default function Header() {
  const { user, signOut } = useAuthContext();
  const router = useRouter();

  const handleSignOut = async () => {
    const promise = signOut();
    toast.promise(promise, {
      loading: 'Signing out...',
      success: () => {
        router.push('/login');
        return <b>Signed out successfully!</b>;
      },
      error: (err) => <b>{err.message || 'Could not sign out.'}</b>,
    });
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
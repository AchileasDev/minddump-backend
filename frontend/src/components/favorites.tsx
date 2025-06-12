import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHeart, FiArrowLeft } from 'react-icons/fi';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-secondary">
      <Head>
        <title>Favorite Questions | MindDump</title>
      </Head>

      <div className="container mx-auto px-4 py-6">
        <header className="flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center">
            <h1 className="text-3xl font-bold text-primary">MindDump</h1>
          </Link>
          
          <nav className="flex items-center">
            <Link href="/dashboard" className="mr-6 text-gray-600 hover:text-primary">
              Dashboard
            </Link>
            <Link href="/dashboard/settings" className="mr-6 text-gray-600 hover:text-primary">
              Settings
            </Link>
            <button 
              onClick={() => {
                localStorage.removeItem('isLoggedIn');
                router.push('/login');
              }}
              className="text-gray-600 hover:text-primary"
            >
              Logout
            </button>
          </nav>
        </header>

        <div className="max-w-4xl mx-auto">
          <Link 
            href="/dashboard"
            className="inline-flex items-center text-sm text-[#EC7CA5] hover:underline mb-4"
          >
            <FiArrowLeft className="mr-1" />
            Back to Dashboard
          </Link>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-primary text-xl">Loading your favorite questions...</div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-xl">{error}</div>
            </div>
          ) : (
            // ... rest of the existing code ...
          )}
        </div>
      </div>
    </div>
  );
} 
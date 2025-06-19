import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiArrowLeft } from 'react-icons/fi';

interface FavoriteQuestion {
  id: string;
  question: string;
}

export default function FavoritesPage() {
  const [favorites] = useState<FavoriteQuestion[]>([]);
  const [isLoading] = useState(true);
  const [error] = useState<string | null>(null);
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
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-xl">No favorite questions yet.</div>
            </div>
          ) : (
            <div className="space-y-4">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="bg-white p-4 rounded-lg shadow">
                  <p className="text-gray-800">{favorite.question}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
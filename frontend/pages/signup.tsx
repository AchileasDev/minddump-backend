import React, { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    const promise = signUp(email, password);

    toast.promise(promise, {
      loading: 'Creating your account...',
      success: () => {
        setIsLoading(false);
        setShowSuccess(true);
        if (typeof window !== 'undefined' && window.gtag) {
          window.gtag('event', 'sign_up', {
            method: 'email',
            email,
          });
        }
        return <b>Account created! Please check your email to verify.</b>;
      },
      error: (err) => {
        setIsLoading(false);
        return <b>{err.message || 'Signup failed. Please try again.'}</b>;
      },
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F8E4EC] flex items-center justify-center px-4 py-8">
      <Head>
        <title>Sign Up | MindDump</title>
        <meta name="description" content="Create your MindDump account and start your journey of self-discovery" />
      </Head>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[#EC7CA5]">MindDump</h1>
          </Link>
          <h2 className="text-xl mt-2 text-gray-600">Create your account</h2>
          <p className="text-sm text-gray-500 mt-2">Start your 14-day free trial today</p>
        </div>

        {showSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <b>Account created! Please check your email to verify.</b>
              <Link href="/login" className="mt-4 inline-block bg-[#EC7CA5] hover:bg-[#d66f94] text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Go to Login
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6" style={{ display: showSuccess ? 'none' : undefined }}>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EC7CA5] focus:border-[#EC7CA5] transition-colors"
              required
              placeholder="John Doe"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EC7CA5] focus:border-[#EC7CA5] transition-colors"
              required
              placeholder="your@email.com"
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EC7CA5] focus:border-[#EC7CA5] transition-colors"
              required
              placeholder="••••••••"
              minLength={8}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EC7CA5] focus:border-[#EC7CA5] transition-colors"
              required
              placeholder="••••••••"
              minLength={8}
              disabled={isLoading}
            />
          </div>

          <div className="flex items-start">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="h-4 w-4 text-[#EC7CA5] border-gray-300 rounded focus:ring-[#EC7CA5] mt-1"
              disabled={isLoading}
            />
            <label htmlFor="terms" className="ml-3 block text-sm text-gray-700">
              I agree to the{' '}
              <Link href="/terms" className="text-[#EC7CA5] hover:underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-[#EC7CA5] hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#EC7CA5] text-white py-4 rounded-xl hover:bg-[#d66f94] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC7CA5] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating your account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-[#EC7CA5] hover:underline font-medium">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
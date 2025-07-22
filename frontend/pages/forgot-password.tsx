import { useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const response = await api.requestPasswordReset(email);
      
      if (response.success) {
        setSuccess(true);
        toast.success('Password reset email sent!');
      } else {
        toast.error(response.message || 'Failed to send reset email');
      }
    } catch (error) {
      console.error('Error requesting password reset:', error);
      toast.error('Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-[#F8E4EC] flex items-center justify-center px-4 py-8">
      <Head>
        <title>Forgot Password | MindDump</title>
        <meta name="description" content="Reset your MindDump password" />
      </Head>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-[#EC7CA5]">MindDump</h1>
          </Link>
          <h2 className="text-xl mt-2 text-gray-600">Forgot Password?</h2>
          <p className="text-sm text-gray-500 mt-2">Enter your email to reset your password</p>
        </div>

        {success ? (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl mb-6 text-center">
            <div className="flex flex-col items-center">
              <svg className="w-8 h-8 mb-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <b>Check your email!</b>
              <p className="mt-2 text-sm">
                We've sent you a password reset link. Please check your email and follow the instructions.
              </p>
              <Link href="/login" className="mt-4 inline-block bg-[#EC7CA5] hover:bg-[#d66f94] text-white font-bold py-2 px-6 rounded-lg transition-colors">
                Back to Login
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#EC7CA5] focus:border-[#EC7CA5] transition-colors"
                placeholder="you@example.com"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full bg-[#EC7CA5] text-white py-4 rounded-xl hover:bg-[#d66f94] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#EC7CA5] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{' '}
            <Link href="/login" className="text-[#EC7CA5] hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 
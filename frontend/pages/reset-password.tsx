import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react';

export default function ResetPasswordPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Αν δεν υπάρχει session, redirect στο login
    if (user === null) {
      router.replace('/login');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    if (password !== confirm) {
      setError('Οι κωδικοί δεν ταιριάζουν.');
      setLoading(false);
      return;
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError('Αποτυχία αλλαγής κωδικού.');
    } else {
      setSuccess('Ο κωδικός άλλαξε! Μπορείς να συνδεθείς.');
      setTimeout(() => router.replace('/login'), 2000);
    }
    setLoading(false);
  };

  if (user === null) {
    return null;
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Επαναφορά Κωδικού</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Νέος κωδικός</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Επιβεβαίωση κωδικού</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !password || !confirm}
          className="w-full px-5 py-2 rounded-lg bg-[#EC7CA5] text-white font-semibold hover:bg-[#d96b97] transition disabled:opacity-60"
        >
          {loading ? 'Αποθήκευση...' : 'Αποθήκευση'}
        </button>
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
} 
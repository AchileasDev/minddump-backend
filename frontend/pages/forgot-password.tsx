import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    const res = await fetch('/api/request-password-reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setSuccess('Στάλθηκε email επαναφοράς (αν υπάρχει λογαριασμός με αυτό το email).');
    } else {
      setError('Αποτυχία αποστολής. Δοκίμασε ξανά.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Ανάκτηση Κωδικού</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#EC7CA5]"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !email}
          className="w-full px-5 py-2 rounded-lg bg-[#EC7CA5] text-white font-semibold hover:bg-[#d96b97] transition disabled:opacity-60"
        >
          {loading ? 'Αποστολή...' : 'Αποστολή συνδέσμου επαναφοράς'}
        </button>
        {success && <div className="text-green-600 text-center mt-2">{success}</div>}
        {error && <div className="text-red-600 text-center mt-2">{error}</div>}
      </form>
    </div>
  );
} 
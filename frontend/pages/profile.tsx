import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useUser, useSupabaseClient } from '@supabase/auth-helpers-react';

export default function ProfilePage() {
  const user = useUser();
  const supabase = useSupabaseClient();
  const router = useRouter();
  const [profile, setProfile] = useState<{ username?: string; role?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace('/login');
      return;
    }
    const fetchProfile = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('username, role')
        .eq('id', user.id)
        .single();
      if (error) {
        setProfile(null);
      } else {
        setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, [user, supabase, router]);

  if (!user || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-lg text-gray-500 animate-pulse">Φόρτωση προφίλ...</div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border border-gray-100 px-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Το Προφίλ μου</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Email</label>
          <input
            type="email"
            value={user.email || ''}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Όνομα χρήστη</label>
          <input
            type="text"
            value={profile?.username || ''}
            readOnly
            className="w-full px-3 py-2 border rounded bg-gray-100 text-gray-700 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Συνδρομή</label>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
              profile?.role === 'premium'
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                : 'bg-gray-100 text-gray-600 border border-gray-200'
            }`}
          >
            {profile?.role === 'premium' ? 'Premium' : 'Free'}
          </span>
        </div>
        <div className="pt-4 text-center">
          <button
            onClick={() => router.push('/account')}
            className="px-5 py-2 rounded-lg bg-[#EC7CA5] text-white font-semibold hover:bg-[#d96b97] transition"
          >
            Επεξεργασία
          </button>
        </div>
      </div>
    </div>
  );
} 
import { supabase } from '../src/lib/supabase';
import { ProtectedRoute } from '../src/components/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div>Welcome to your dashboard!</div>
    </ProtectedRoute>
  );
}

export async function getServerSideProps({ req, res }) {
  // SSR protection example (requires supabase auth helpers for Next.js)
  // This is a placeholder; for production, use @supabase/auth-helpers-nextjs
  const token = req.cookies['sb-access-token'];
  if (!token) {
    return { redirect: { destination: '/login', permanent: false } };
  }
  // Optionally, verify token with Supabase here
  return { props: {} };
} 
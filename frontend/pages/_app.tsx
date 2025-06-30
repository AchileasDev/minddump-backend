import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 
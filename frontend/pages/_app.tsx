import React, { useState } from 'react';
import type { AppProps } from 'next/app';
import Head from 'next/head';
import '@/styles/globals.css';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Head>
        <Component {...pageProps} />
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              borderRadius: '8px',
              padding: '12px 16px',
            },
            success: {
              iconTheme: {
                primary: '#EC7CA5',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </QueryClientProvider>
  );
} 
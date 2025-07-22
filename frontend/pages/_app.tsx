import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-ZH4XEMJQ1G"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-ZH4XEMJQ1G');
        `}
      </Script>
      <Toaster position="top-center" reverseOrder={false} />
      <Component {...pageProps} />
    </AuthProvider>
  );
}

export default MyApp; 
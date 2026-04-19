import type { Metadata, Viewport } from 'next';
import { SessionProvider } from 'next-auth/react';
import { getLocale } from 'next-intl/server';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Receipt Scanner',
  description: 'Scan receipts and track family & company expenses',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Receipt Scanner',
  },
  icons: {
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#6366f1',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale().catch(() => 'en');
  return (
    <html lang={locale} className="dark">
      <body className="bg-slate-900 text-slate-100 antialiased">
        <ServiceWorkerRegistration />
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';
import 'leaflet/dist/leaflet.css';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { TranslationProvider } from '@/hooks/use-translation';

import { Suspense } from "react";

export const metadata: Metadata = {
  title: 'AI Crop Recommendation for Farmers',
  description: 'An AI-powered assistant for farmers.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@300..700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        <Suspense fallback={<div>Loading...</div>}>
          <TranslationProvider>
            <AppLayout>{children}</AppLayout>
          </TranslationProvider>
        </Suspense>
        <Toaster />
      </body>
    </html>
  );
}

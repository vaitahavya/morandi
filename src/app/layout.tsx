import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PromoBar from '@/components/layout/PromoBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Morandi Lifestyle',
  description: 'Modern e-commerce platform built with Next.js and WordPress',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <PromoBar />
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
        </SessionProvider>
      </body>
    </html>
  );
}

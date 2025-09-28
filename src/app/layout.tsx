import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import PromoBar from '@/components/layout/PromoBar';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/providers/SessionProvider';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });

export const metadata: Metadata = {
  title: 'Morandi Lifestyle - Where Every Mother Blooms',
  description: 'Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women\'s wear you\'ll love to live in.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
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

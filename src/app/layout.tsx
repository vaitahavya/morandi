import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/components/providers/SessionProvider';
import QueryProvider from '@/components/providers/QueryProvider';
import CanonicalLink from '@/components/seo/CanonicalLink';
import JsonLd from '@/components/seo/JsonLd';
import { absoluteUrl, getSiteUrl } from '@/lib/seo';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-serif' });
const siteUrl = getSiteUrl();
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Morandi Lifestyle',
  url: siteUrl,
  logo: absoluteUrl('/images/logo/morandi lifestyle.png'),
  sameAs: [
    'https://www.instagram.com/morandilifestyle',
    'https://www.facebook.com/morandilifestyle',
  ],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'hello@morandilifestyle.com',
      areaServed: 'IN',
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'Morandi Lifestyle - Where Every Mother Blooms',
  description: 'Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women\'s wear you\'ll love to live in.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Morandi Lifestyle - Where Every Mother Blooms',
    description:
      'Comfortable maternity and baby apparel crafted for every stage. Shop postpartum wear, babywear, and stylish women\'s wear you\'ll love to live in.',
    url: siteUrl,
    siteName: 'Morandi Lifestyle',
    images: [
      {
        url: absoluteUrl('/images/banners/hero-main.jpg'),
        width: 1200,
        height: 630,
        alt: 'Morandi Lifestyle hero image',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Morandi Lifestyle - Where Every Mother Blooms',
    description:
      'Comfortable maternity and baby apparel crafted for every stage.',
    images: [absoluteUrl('/images/banners/hero-main.jpg')],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        <CanonicalLink />
        <JsonLd data={organizationJsonLd} />
        <QueryProvider>
          <SessionProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
            <Toaster position="bottom-right" />
          </SessionProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

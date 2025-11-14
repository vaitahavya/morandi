'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { getSiteUrl } from '@/lib/seo';

export default function CanonicalLink() {
  const pathname = usePathname();
  const siteUrl = getSiteUrl();

  if (!pathname) return null;

  const href =
    pathname === '/' ? siteUrl : `${siteUrl}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;

  return (
    <Head>
      <link rel="canonical" href={href} />
    </Head>
  );
}


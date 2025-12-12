'use client';

import { usePathname } from 'next/navigation';
import PromoBar from './PromoBar';
import Header from './Header';
import Footer from './Footer';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && (
        <>
          <PromoBar />
          <Header />
        </>
      )}
      <main className="min-h-screen w-full overflow-x-hidden">{children}</main>
      {!isAdminRoute && <Footer />}
    </>
  );
}


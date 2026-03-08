'use client';

import { usePathname } from 'next/navigation';
import PromoBar from './PromoBar';
import Header from './Header';
import Footer from './Footer';
import NewsOfferModal from '@/components/ui/NewsOfferModal';
import { currentOffer } from '@/lib/offer-config';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && currentOffer && <NewsOfferModal config={currentOffer} />}
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






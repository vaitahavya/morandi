'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function OrderSuccessPage() {
  const params = useSearchParams();
  const orderId = params.get('orderId');

  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="mb-4 text-3xl font-bold text-primary-700">Thank you for your order!</h1>
      {orderId && <p className="mb-6 text-lg">Your order ID is <span className="font-semibold">#{orderId}</span>.</p>}
      <Link href="/" className="rounded-md bg-primary-600 px-8 py-3 text-white hover:bg-primary-700">
        Back to Home
      </Link>
    </div>
  );
}

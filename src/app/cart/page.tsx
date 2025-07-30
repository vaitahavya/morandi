'use client';

import Link from 'next/link';
import { useCartStore } from '@/store/cart-store';
import CartItemRow from '@/components/cart/CartItemRow';

export default function CartPage() {
  const { items, getTotal } = useCartStore((state) => ({
    items: state.items,
    getTotal: state.getTotal,
  }));

  if (!items.length) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">
        <h2 className="mb-4 text-2xl font-semibold">Your cart is empty</h2>
        <Link
          href="/products"
          className="rounded-md bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>
      <div className="space-y-6">
        {items.map((item) => (
          <CartItemRow key={item.id} item={item} />
        ))}
      </div>
      <div className="mt-10 flex items-center justify-between border-t pt-6">
        <span className="text-lg font-medium">Subtotal:</span>
        <span className="text-xl font-bold">${getTotal().toFixed(2)}</span>
      </div>
      <div className="mt-6 text-right">
        <Link
          href="/checkout"
          className="rounded-md bg-primary-600 px-8 py-3 text-white hover:bg-primary-700"
        >
          Proceed to Checkout
        </Link>
      </div>
    </div>
  );
}

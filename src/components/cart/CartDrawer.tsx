'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Trash2 } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  return (
    <>
      {/* Cart button */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative inline-flex items-center text-gray-700 hover:text-primary-700"
      >
        <ShoppingCart size={24} />
        {items.length > 0 && (
          <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary-600 px-1 text-[11px] font-medium text-white">
            {items.length}
          </span>
        )}
      </button>

      {/* Cart drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={() => setIsOpen(false)}>
          <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex h-full flex-col">
              {/* Header */}
              <div className="flex items-center justify-between border-b px-6 py-4">
                <h2 className="text-lg font-semibold">Shopping Cart</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Cart items */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {items.length === 0 ? (
                  <div className="text-center py-8">
                    <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-500 mb-4">Your cart is empty</p>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="rounded-md bg-primary-600 px-4 py-2 text-white hover:bg-primary-700"
                    >
                      Continue Shopping
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 border-b pb-4">
                        <div className="relative h-16 w-16 overflow-hidden rounded-md">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-500">₹{item.price}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="rounded border px-2 py-1 text-sm hover:bg-gray-100"
                            >
                              -
                            </button>
                            <span className="text-sm min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="rounded border px-2 py-1 text-sm hover:bg-gray-100"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="ml-2 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {items.length > 0 && (
                <div className="border-t px-6 py-4">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-lg font-semibold">Total:</span>
                    <span className="text-lg font-semibold">₹{getTotal().toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/cart"
                      onClick={() => setIsOpen(false)}
                      className="block w-full rounded-md bg-primary-600 px-4 py-2 text-center text-white hover:bg-primary-700"
                    >
                      View Cart
                    </Link>
                    <button
                      onClick={clearCart}
                      className="block w-full rounded-md border border-gray-300 px-4 py-2 text-center text-gray-700 hover:bg-gray-50"
                    >
                      Clear Cart
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
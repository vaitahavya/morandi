'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, useCartStore } from '@/store/cart-store';

interface Props {
  item: CartItem;
}

export default function CartItemRow({ item }: Props) {
  const { updateQuantity, removeItem } = useCartStore((state) => ({
    updateQuantity: state.updateQuantity,
    removeItem: state.removeItem,
  }));

  const increment = () => {
    updateQuantity(item.id, item.quantity + 1);
  };
  const decrement = () => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  return (
    <div className="flex items-center gap-4 border-b py-4">
      <Image
        src={item.image || '/placeholder.png'}
        alt={item.name}
        width={80}
        height={80}
        className="rounded-md object-cover"
      />
      <div className="flex-1">
        <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
        <p className="text-sm text-gray-600">₹{item.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={decrement}
          className="rounded-md border p-1 text-gray-700 hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
        <span className="w-8 text-center">{item.quantity}</span>
        <button
          onClick={increment}
          className="rounded-md border p-1 text-gray-700 hover:bg-gray-100"
        >
          <Plus size={16} />
        </button>
      </div>
      <button
        onClick={() => removeItem(item.id)}
        className="ml-4 text-red-500 hover:text-red-600"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
}

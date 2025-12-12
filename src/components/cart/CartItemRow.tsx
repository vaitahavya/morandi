'use client';

import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem, useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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

  const itemTotal = item.price * item.quantity;
  const isMinimumQuantity = item.quantity === 1;

  return (
    <div className="p-4 md:p-6 hover:bg-muted/30 transition-colors">
      <div className="flex gap-4 md:gap-6">
        {/* Product Image */}
        <div className="relative h-24 w-24 md:h-32 md:w-32 flex-shrink-0 overflow-hidden rounded-lg bg-muted border">
          <Image
            src={item.image || '/placeholder.svg'}
            alt={item.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 128px"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-base md:text-lg text-foreground line-clamp-2 mb-1">
                  {item.name}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-lg font-bold text-clay-pink">₹{item.price.toFixed(2)}</span>
                  {item.quantity > 1 && (
                    <span className="text-sm text-muted-foreground">
                      × {item.quantity}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Delete Button */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:h-10 md:w-10 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                onClick={() => removeItem(item.id)}
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
            </div>
          </div>

          {/* Quantity Controls and Total */}
          <div className="flex items-center justify-between gap-4 mt-4 pt-4 border-t">
            {/* Quantity Controls */}
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={decrement}
                disabled={isMinimumQuantity}
                aria-label="Decrease quantity"
              >
                <Minus className="h-4 w-4" />
              </Button>
              
              <div className="min-w-[3rem] text-center">
                <Badge variant="outline" className="px-4 py-2 text-sm font-semibold">
                  {item.quantity}
                </Badge>
              </div>
              
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 md:h-10 md:w-10"
                onClick={increment}
                aria-label="Increase quantity"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Item Total */}
            <div className="text-right">
              <p className="text-xs text-muted-foreground mb-1">Item Total</p>
              <p className="text-xl md:text-2xl font-bold text-foreground">
                ₹{itemTotal.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ShoppingCart, Trash2, Minus, Plus, ArrowRight } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { items, removeItem, updateQuantity, getTotal, clearCart, getItemCount } = useCartStore();

  // Prevent hydration mismatch by only accessing store after client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeItem(productId);
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const itemCount = isClient ? getItemCount() : 0;
  const uniqueItemCount = isClient ? items.length : 0;
  const total = isClient ? getTotal() : 0;
  const isMinimumQuantity = (quantity: number) => quantity === 1;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-9 w-9 lg:h-auto lg:py-2 lg:px-3 lg:gap-2 hover:bg-muted/50 transition-colors"
        >
          <ShoppingCart className="h-5 w-5 lg:h-5 lg:w-5" />
          {itemCount > 0 && (
            <Badge 
              className="absolute -right-1 -top-1 lg:static lg:relative lg:right-auto lg:top-auto h-5 min-w-[20px] items-center justify-center rounded-full bg-clay-pink text-white border-0 px-1.5 text-[10px] lg:text-xs font-semibold"
            >
              {itemCount}
            </Badge>
          )}
          <span className="hidden lg:block text-sm font-medium text-foreground">
            Cart
          </span>
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 pt-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-2xl font-serif">Shopping Cart</SheetTitle>
              {uniqueItemCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {uniqueItemCount} {uniqueItemCount === 1 ? 'item' : 'items'}
                </Badge>
              )}
            </div>
          </SheetHeader>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 space-y-6">
                <div className="w-28 h-28 rounded-full bg-muted/50 flex items-center justify-center">
                  <ShoppingCart className="h-14 w-14 text-muted-foreground" />
                </div>
                <div className="text-center space-y-2">
                  <p className="text-xl font-semibold font-serif">Your cart is empty</p>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Add some products to get started with your shopping
                  </p>
                </div>
                <Button 
                  onClick={() => setIsOpen(false)}
                  className="bg-clay-pink hover:bg-clay-pink/90 text-white gap-2"
                  size="lg"
                >
                  Continue Shopping
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const itemTotal = item.price * item.quantity;
                return (
                  <div 
                    key={item.id} 
                    className="flex gap-4 p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                  >
                    {/* Product Image */}
                    <div className="relative h-24 w-24 md:h-28 md:w-28 overflow-hidden rounded-lg bg-muted flex-shrink-0 border">
                      <Image
                        src={item.image || '/placeholder.svg'}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 96px, 112px"
                      />
                    </div>
                    
                    {/* Product Details */}
                    <div className="flex-1 min-w-0 space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm md:text-base line-clamp-2 mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-muted-foreground">₹{item.price.toFixed(2)} each</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                          onClick={() => removeItem(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Quantity Controls and Total */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={isMinimumQuantity(item.quantity)}
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </Button>
                          <Badge variant="outline" className="px-3 py-1.5 min-w-[2.5rem] text-center font-semibold">
                            {item.quantity}
                          </Badge>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                        <div className="text-right">
                          <p className="text-lg md:text-xl font-bold text-clay-pink">
                            ₹{itemTotal.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {items.length > 0 && (
            <>
              <Separator />
              <div className="px-6 py-4 space-y-4 bg-muted/20">
                {/* Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">₹{total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Shipping calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-2xl text-clay-pink">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 pt-2">
                  <Button 
                    asChild
                    size="lg"
                    className="w-full bg-clay-pink hover:bg-clay-pink/90 text-white gap-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={clearCart}
                      className="w-full text-sm"
                    >
                      Clear Cart
                    </Button>
                    <Button 
                      asChild
                      variant="outline"
                      className="w-full text-sm"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/cart">
                        View Full Cart
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
} 
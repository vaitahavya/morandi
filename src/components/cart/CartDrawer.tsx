'use client';

import { useState } from 'react';
import Image from 'next/image';
import { X, ShoppingCart, Trash2, Minus, Plus } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {items.length > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-clay-pink text-white border-0 px-1 text-[10px]">
              {items.length}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="text-2xl font-serif">Shopping Cart</SheetTitle>
        </SheetHeader>

        <Separator className="my-4" />

        {/* Cart items */}
        <div className="flex-1 overflow-y-auto pr-2">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-lg font-medium">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">Add some products to get started</p>
              </div>
              <Button 
                onClick={() => setIsOpen(false)}
                className="bg-clay-pink hover:bg-clay-pink/90"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="relative h-20 w-20 overflow-hidden rounded-md bg-muted flex-shrink-0">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-sm line-clamp-2 pr-2">{item.name}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-lg font-bold text-primary">₹{item.price}</p>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="text-sm font-medium min-w-[24px] text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <>
            <Separator className="my-4" />
            <SheetFooter className="flex-col gap-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold">Total:</span>
                <span className="font-bold text-2xl text-primary">₹{getTotal().toFixed(2)}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 w-full">
                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="w-full"
                >
                  Clear Cart
                </Button>
                <Button 
                  asChild
                  className="w-full bg-clay-pink hover:bg-clay-pink/90"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/cart">
                    View Cart
                  </Link>
                </Button>
              </div>
              
              <Button 
                asChild
                size="lg"
                className="w-full bg-soft-sage hover:bg-soft-sage/90 text-deep-charcoal"
                onClick={() => setIsOpen(false)}
              >
                <Link href="/checkout">
                  Proceed to Checkout
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
} 
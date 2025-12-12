'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import CartItemRow from '@/components/cart/CartItemRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

export default function CartPage() {
  const [isClient, setIsClient] = useState(false);
  const { items, getTotal, getItemCount } = useCartStore((state) => ({
    items: state.items,
    getTotal: state.getTotal,
    getItemCount: state.getItemCount,
  }));

  // Prevent hydration mismatch by only accessing store after client-side mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  const subtotal = isClient ? getTotal() : 0;
  const itemCount = isClient ? getItemCount() : 0;

  if (!items.length) {
    return (
      <div className="section-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <Card className="border-2 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6">
                <ShoppingCart className="h-12 w-12 text-muted-foreground" />
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold mb-3">Your cart is empty</h2>
              <p className="text-muted-foreground mb-8 max-w-md">
                Looks like you haven't added anything to your cart yet. Start shopping to add items!
              </p>
              <Button 
                asChild 
                size="lg"
                className="bg-clay-pink hover:bg-clay-pink/90 text-white"
              >
                <Link href="/products" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-8 md:py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">Shopping Cart</h1>
            <p className="text-muted-foreground">
              {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
            </p>
          </div>
          <Button
            variant="outline"
            asChild
            className="gap-2"
          >
            <Link href="/products">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Continue Shopping</span>
              <span className="sm:hidden">Shop</span>
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardContent className="p-0">
                {items.map((item, index) => (
                  <div key={item.id}>
                    <CartItemRow item={item} />
                    {index < items.length - 1 && <Separator />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-serif">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal ({itemCount} items)</span>
                    <span className="font-medium">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-medium text-green-600">Calculated at checkout</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-2xl text-clay-pink">₹{subtotal.toFixed(2)}</span>
                  </div>
                </div>
                
                <Badge variant="secondary" className="w-full justify-center py-2 bg-muted/50">
                  Free shipping on orders over ₹999
                </Badge>
              </CardContent>
              <CardFooter className="flex-col gap-3 pt-4">
                <Button 
                  asChild
                  size="lg"
                  className="w-full bg-clay-pink hover:bg-clay-pink/90 text-white"
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full"
                >
                  <Link href="/products">
                    Continue Shopping
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

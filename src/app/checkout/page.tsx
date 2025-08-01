'use client';

import { useForm } from 'react-hook-form';
import { useCartStore } from '@/store/cart-store';
import { createOrder, CreateOrderData } from '@/lib/orders-api';
import { processPayment, loadRazorpayScript } from '@/lib/payment-api';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  country: string;
  postcode: string;
  // Shipping address (optional - will copy from billing if not provided)
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostcode?: string;
  // Payment and additional info
  paymentMethod: string;
  customerNotes?: string;
  sameAsShipping: boolean;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore((state) => ({
    items: state.items,
    clearCart: state.clearCart,
  }));
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    defaultValues: {
      paymentMethod: 'razorpay',
      country: 'IN',
      sameAsShipping: true,
      email: session?.user?.email || '',
      firstName: session?.user?.name?.split(' ')[0] || '',
      lastName: session?.user?.name?.split(' ').slice(1).join(' ') || ''
    }
  });


  const watchedSameAsShipping = watch('sameAsShipping');

  // Load Razorpay script on component mount
  useEffect(() => {
    const loadScript = async () => {
      const loaded = await loadRazorpayScript();
      setRazorpayLoaded(loaded);
      if (!loaded) {
        toast.error('Failed to load payment system. Please refresh and try again.');
      }
    };
    loadScript();
  }, []);

  // Pre-fill user information if logged in
  useEffect(() => {
    if (session?.user) {
      setValue('email', session.user.email || '');
      const nameParts = (session.user.name || '').split(' ');
      setValue('firstName', nameParts[0] || '');
      setValue('lastName', nameParts.slice(1).join(' ') || '');
    }
  }, [session, setValue]);

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!items.length) {
      toast.error('Your cart is empty');
      return;
    }

    if (!razorpayLoaded) {
      toast.error('Payment system not ready. Please refresh and try again.');
      return;
    }

    setLoading(true);

    try {
      // Calculate order totals
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
      const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
      const total = subtotal + shippingCost + taxAmount;

      // Prepare order data
      const orderData: CreateOrderData = {
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          variantId: item.variation_id
        })),
        customerEmail: data.email,
        customerPhone: data.phone,
        
        // Billing address
        billingFirstName: data.firstName,
        billingLastName: data.lastName,
        billingAddress1: data.address1,
        billingAddress2: data.address2,
        billingCity: data.city,
        billingState: data.state,
        billingPostcode: data.postcode,
        billingCountry: data.country,
        
        // Shipping address (copy from billing if same)
        shippingFirstName: data.sameAsShipping ? data.firstName : data.shippingFirstName,
        shippingLastName: data.sameAsShipping ? data.lastName : data.shippingLastName,
        shippingAddress1: data.sameAsShipping ? data.address1 : data.shippingAddress1,
        shippingAddress2: data.sameAsShipping ? data.address2 : data.shippingAddress2,
        shippingCity: data.sameAsShipping ? data.city : data.shippingCity,
        shippingState: data.sameAsShipping ? data.state : data.shippingState,
        shippingPostcode: data.sameAsShipping ? data.postcode : data.shippingPostcode,
        shippingCountry: data.sameAsShipping ? data.country : data.shippingCountry,
        
        // Payment and shipping details
        paymentMethod: 'razorpay',
        paymentMethodTitle: 'Razorpay',
        shippingCost,
        taxAmount,
        customerNotes: data.customerNotes,
        currency: 'INR'
      };

      // Create the order
      const createdOrder = await createOrder(orderData);

      if (!createdOrder) {
        throw new Error('Failed to create order');
      }

      toast.success('Order created successfully!');

      // Process payment using Razorpay
      await processPayment(
        createdOrder.id,
        total,
        // Success callback
        (order) => {
          clearCart();
          toast.success('Payment successful! Order confirmed.');
          router.push(`/order-success?order=${order.id}`);
        },
        // Error callback
        (error) => {
          toast.error(`Payment failed: ${error}`);
          // Redirect to order page where they can retry payment
          router.push(`/orders/${createdOrder.id}?payment=failed`);
        }
      );
    } catch (error: any) {
      console.error('Checkout error:', error);
      toast.error(error.message || 'Failed to process checkout. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate order totals for display
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingCost = subtotal >= 500 ? 0 : 50; // Free shipping over ₹500
  const taxAmount = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
  const total = subtotal + shippingCost + taxAmount;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>
      {items.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="rounded-lg border bg-white p-6">
              <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">₹{item.price * item.quantity}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Checkout Form */}
          <div className="lg:col-span-1">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">First Name</label>
                  <input
                    {...register('firstName', { required: true })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.firstName && <span className="text-sm text-red-600">Required</span>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Last Name</label>
                  <input
                    {...register('lastName', { required: true })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.lastName && <span className="text-sm text-red-600">Required</span>}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Email</label>
                <input
                  type="email"
                  {...register('email', { required: true })}
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.email && <span className="text-sm text-red-600">Required</span>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  {...register('phone', { required: true, pattern: /^[0-9+\-\s()]+$/ })}
                  className="w-full rounded-md border px-3 py-2"
                  placeholder="+91 98765 43210"
                />
                {errors.phone && <span className="text-sm text-red-600">Valid phone number required</span>}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Address</label>
                <input
                  {...register('address1', { required: true })}
                  className="w-full rounded-md border px-3 py-2"
                />
                {errors.address1 && <span className="text-sm text-red-600">Required</span>}
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">City</label>
                  <input
                    {...register('city', { required: true })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.city && <span className="text-sm text-red-600">Required</span>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Country</label>
                  <input
                    {...register('country', { required: true })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.country && <span className="text-sm text-red-600">Required</span>}
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Postcode</label>
                  <input
                    {...register('postcode', { required: true })}
                    className="w-full rounded-md border px-3 py-2"
                  />
                  {errors.postcode && <span className="text-sm text-red-600">Required</span>}
                </div>
              </div>

              {/* Payment Method - Razorpay Only */}
              <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-600">
                    <div className="h-2 w-2 rounded-full bg-white"></div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Pay Online with Razorpay</span>
                    <p className="text-sm text-gray-600">Secure payment via UPI, Cards, Net Banking & Wallets</p>
                  </div>
                </div>
                {/* Hidden input for payment method */}
                <input
                  type="hidden"
                  value="razorpay"
                  {...register('paymentMethod')}
                />
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary-600 px-8 py-3 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Proceed to Payment - ₹${total}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

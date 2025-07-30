'use client';

import { useForm } from 'react-hook-form';
import { useCartStore } from '@/store/cart-store';
import { createPendingOrder, getWordPressCheckoutUrl, CreateOrderInput, OrderLineItem } from '@/lib/wordpress-api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address1: string;
  city: string;
  country: string;
  postcode: string;
  paymentMethod: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore((state) => ({
    items: state.items,
    clearCart: state.clearCart,
  }));
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormValues>();

  const watchedPaymentMethod = watch('paymentMethod');

  const onSubmit = async (data: CheckoutFormValues) => {
    if (!items.length) return;
    setLoading(true);

    try {
      // Create line items for the order
      const line_items: OrderLineItem[] = items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
        variation_id: item.variation_id,
      }));

      // Determine payment method details
      let paymentMethod = 'bacs';
      let paymentMethodTitle = 'Direct Bank Transfer';
      
      if (data.paymentMethod === 'paypal') {
        paymentMethod = 'paypal';
        paymentMethodTitle = 'PayPal';
      } else if (data.paymentMethod === 'cod') {
        paymentMethod = 'cod';
        paymentMethodTitle = 'Cash on Delivery';
      } else if (data.paymentMethod === 'razorpay') {
        paymentMethod = 'razorpay';
        paymentMethodTitle = 'Pay Online (Razorpay)';
      }

      const order: CreateOrderInput = {
        payment_method: paymentMethod,
        payment_method_title: paymentMethodTitle,
        set_paid: false, // Will be set to true after payment
        billing: {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address_1: data.address1,
          city: data.city,
          country: data.country,
          postcode: data.postcode,
        } as any,
        shipping: {
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          address_1: data.address1,
          city: data.city,
          country: data.country,
          postcode: data.postcode,
        } as any,
        line_items,
      };

      // Create pending order in WordPress
      const created = await createPendingOrder(order);
      setLoading(false);

      if (created && created.id) {
        // For Razorpay, redirect to WordPress checkout
        if (data.paymentMethod === 'razorpay') {
          const checkoutUrl = getWordPressCheckoutUrl(created.id);
          toast.success('Redirecting to secure payment gateway...');
          // Clear cart before redirecting
          clearCart();
          // Redirect to WordPress checkout
          window.location.href = checkoutUrl;
        } else {
          // For other payment methods, create the order directly
          toast.success('Order created successfully!');
          clearCart();
          router.push(`/order-success?orderId=${created.id}`);
        }
      } else {
        toast.error('Failed to create order. Please try again.');
      }
    } catch (error) {
      setLoading(false);
      toast.error('Something went wrong. Please try again.');
    }
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

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

              {/* Payment Method Selection */}
              <div>
                <label className="mb-1 block text-sm font-medium">Payment Method</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="cod"
                      {...register('paymentMethod', { required: true })}
                      className="text-primary-600"
                    />
                    <span>Cash on Delivery</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="bacs"
                      {...register('paymentMethod', { required: true })}
                      className="text-primary-600"
                    />
                    <span>Direct Bank Transfer</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="razorpay"
                      {...register('paymentMethod', { required: true })}
                      className="text-primary-600"
                    />
                    <span>Pay Online (Razorpay)</span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="radio"
                      value="paypal"
                      {...register('paymentMethod', { required: true })}
                      className="text-primary-600"
                    />
                    <span>PayPal</span>
                  </label>
                </div>
                {errors.paymentMethod && <span className="text-sm text-red-600">Please select a payment method</span>}
              </div>

              {/* Payment Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-primary-600 px-8 py-3 text-white hover:bg-primary-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 
                  watchedPaymentMethod === 'razorpay' ? `Proceed to Payment - ₹${total}` : 
                  `Place Order - ₹${total}`
                }
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

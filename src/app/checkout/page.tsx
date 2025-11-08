'use client';

import { useForm } from 'react-hook-form';
import { useCartStore } from '@/store/cart-store';
import { createOrder, CreateOrderData } from '@/lib/orders-api';
import { processPayment, loadRazorpayScript } from '@/lib/payment-api';
import { useRouter } from 'next/navigation';
import { useState, useEffect, useMemo, useCallback } from 'react';
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

interface ShippingQuoteResult {
  rateId: string;
  name?: string | null;
  zone?: string | null;
  pincode?: string | null;
  pincodePrefix?: string | null;
  shippingCost: number;
  isFree: boolean;
  freeShippingThreshold?: number | null;
  estimatedDeliveryMin?: number | null;
  estimatedDeliveryMax?: number | null;
}

interface AppliedCouponState {
  couponId: string;
  code: string;
  type: string;
  value: number;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(value);

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { items, clearCart } = useCartStore((state) => ({
    items: state.items,
    clearCart: state.clearCart,
  }));
  const [loading, setLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [shippingQuote, setShippingQuote] = useState<ShippingQuoteResult | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCouponState | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  
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
  const watchedPostcode = watch('postcode');
  const watchedShippingPostcode = watch('shippingPostcode');

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [items]
  );

  const taxAmount = useMemo(
    () => Math.round(subtotal * 0.18 * 100) / 100,
    [subtotal]
  );

  const baseShippingCost = useMemo(() => {
    if (!shippingQuote) return 0;
    if (shippingQuote.isFree) return 0;
    return Math.max(0, shippingQuote.shippingCost);
  }, [shippingQuote]);

  const shippingCost = useMemo(() => {
    if (appliedCoupon?.freeShipping) {
      return 0;
    }
    return baseShippingCost;
  }, [appliedCoupon?.freeShipping, baseShippingCost]);

  const discountAmount = useMemo(
    () => appliedCoupon?.discountAmount ?? 0,
    [appliedCoupon]
  );

  const total = useMemo(
    () => Math.max(0, subtotal + shippingCost + taxAmount - discountAmount),
    [subtotal, shippingCost, taxAmount, discountAmount]
  );

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

  useEffect(() => {
    if (!items.length || subtotal <= 0) {
      setShippingQuote(null);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }

    const effectivePostcode = (watchedSameAsShipping ? watchedPostcode : watchedShippingPostcode)?.trim();

    if (!effectivePostcode || effectivePostcode.length < 4) {
      setShippingQuote(null);
      setShippingError(null);
      setShippingLoading(false);
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    setShippingLoading(true);
    setShippingError(null);

    const timeoutId = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/shipping/quote?pincode=${encodeURIComponent(effectivePostcode)}&subtotal=${subtotal}`,
          { signal: controller.signal }
        );
        const result = await response.json();

        if (isCancelled) {
          return;
        }

        if (!response.ok || !result.success) {
          setShippingQuote(null);
          setShippingError(
            result.error ||
              'Unable to calculate shipping for the entered postcode. Please verify the details.'
          );
          return;
        }

        setShippingQuote(result.data);
        setShippingError(null);
      } catch (error: any) {
        if (isCancelled || error?.name === 'AbortError') {
          return;
        }
        console.error('Shipping quote error:', error);
        setShippingQuote(null);
        setShippingError('Unable to calculate shipping right now. Please try again shortly.');
      } finally {
        if (!isCancelled) {
          setShippingLoading(false);
        }
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, [
    items.length,
    subtotal,
    watchedSameAsShipping,
    watchedPostcode,
    watchedShippingPostcode,
  ]);

  const handleApplyCoupon = useCallback(async () => {
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('Enter a coupon code to apply.');
      return;
    }

    if (subtotal <= 0) {
      setCouponError('Add items to your cart before applying a coupon.');
      return;
    }

    setCouponLoading(true);
    setCouponError(null);

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          subtotal,
          zone: shippingQuote?.zone ?? null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setCouponError(result.error || 'Unable to apply coupon. Please try another code.');
        return;
      }

      setAppliedCoupon(result.data);
      setCouponInput(result.data.code);
      toast.success(result.data.message || 'Coupon applied successfully.');
    } catch (error) {
      console.error('Coupon apply error:', error);
      setCouponError('Unable to apply coupon right now. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  }, [couponInput, subtotal, shippingQuote]);

  const handleRemoveCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
  }, []);

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
      if (shippingLoading) {
        toast.error('Please wait until shipping is calculated.');
        setLoading(false);
        return;
      }

      if (!shippingQuote && subtotal > 0 && !appliedCoupon?.freeShipping) {
        toast.error('Unable to calculate shipping for the provided postcode.');
        setLoading(false);
        return;
      }

      // Prepare order data
      const shippingFirstName = data.sameAsShipping ? data.firstName : data.shippingFirstName;
      const shippingLastName = data.sameAsShipping ? data.lastName : data.shippingLastName;
      const shippingAddress1 = data.sameAsShipping ? data.address1 : data.shippingAddress1;
      const shippingAddress2 = data.sameAsShipping ? data.address2 : data.shippingAddress2;
      const shippingCity = data.sameAsShipping ? data.city : data.shippingCity;
      const shippingState = data.sameAsShipping ? data.state : data.shippingState;
      const shippingPostcode = data.sameAsShipping ? data.postcode : data.shippingPostcode;
      const shippingCountry = data.sameAsShipping ? data.country : data.shippingCountry;

      const orderData: CreateOrderData = {
        status: 'pending',
        paymentStatus: 'pending',
        total,
        subtotal,
        items: items.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          variantId: item.variation_id,
          price: item.price,
          productName: item.name,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity,
          productImage: item.image
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
        shippingFirstName,
        shippingLastName,
        shippingAddress1,
        shippingAddress2,
        shippingCity,
        shippingState,
        shippingPostcode,
        shippingCountry,
        
        // Payment and shipping details
        paymentMethod: 'razorpay',
        paymentMethodTitle: 'Razorpay',
        shippingCost,
        taxAmount,
        discountAmount,
        couponCode: appliedCoupon?.code,
        shippingRateId: shippingQuote?.rateId,
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
          setAppliedCoupon(null);
          setCouponInput('');
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
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <label className="mb-1 block text-sm font-medium">Coupon Code</label>
                <div className="flex gap-2">
                  <input
                    value={couponInput}
                    onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                    placeholder="SAVE10"
                    className="w-full rounded-md border px-3 py-2 uppercase"
                    disabled={couponLoading || !!appliedCoupon}
                  />
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-60"
                    >
                      {couponLoading ? 'Applying...' : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && <p className="mt-1 text-sm text-red-600">{couponError}</p>}
                {appliedCoupon && !couponError && (
                  <p className="mt-1 text-sm text-green-600">{appliedCoupon.message}</p>
                )}
              </div>
              <div className="mt-6 space-y-2 border-t pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingLoading
                      ? 'Calculating...'
                      : appliedCoupon?.freeShipping || shippingQuote?.isFree
                        ? 'Free'
                        : formatCurrency(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tax (18% GST)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-green-600">
                    <span>Discount</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total Due</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
              {shippingError && (
                <p className="mt-2 text-sm text-red-600">{shippingError}</p>
              )}
              {shippingQuote && !shippingError && (
                <p className="mt-2 text-xs text-gray-500">
                  {shippingQuote.estimatedDeliveryMin
                    ? `Estimated delivery ${shippingQuote.estimatedDeliveryMin}-${shippingQuote.estimatedDeliveryMax ?? shippingQuote.estimatedDeliveryMin
                      } days.`
                    : 'Estimated delivery will be shared after payment.'}
                </p>
              )}
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
                {loading ? 'Processing...' : `Proceed to Payment - ${formatCurrency(total)}`}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

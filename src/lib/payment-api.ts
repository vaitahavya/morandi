// Native Payment API - Direct Razorpay integration
// This library provides functions for payment processing without WordPress dependency

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
  key: string;
  order_id: string;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
  notes: Record<string, any>;
}

export interface PaymentConfirmation {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  order_id?: string;
}

export interface PaymentDetails {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  created_at: number;
}

export interface PaymentStatus {
  order: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: number;
    currency: string;
  };
  payment?: PaymentDetails;
}

export interface PaymentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Base API URL
const API_BASE = '/api';

// Helper function for API calls
async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

// Payment API Functions

export const createPaymentIntent = async (
  orderId: string,
  amount: number,
  currency: string = 'INR'
): Promise<PaymentIntent> => {
  try {
    const response = await apiCall<PaymentResponse<PaymentIntent>>('/payment/create-intent', {
      method: 'POST',
      body: JSON.stringify({ orderId, amount, currency }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create payment intent');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

export const confirmPayment = async (confirmation: PaymentConfirmation): Promise<any> => {
  try {
    const response = await apiCall<PaymentResponse>('/payment/confirm', {
      method: 'POST',
      body: JSON.stringify(confirmation),
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to confirm payment');
    }

    return response.data;
  } catch (error) {
    console.error('Error confirming payment:', error);
    throw error;
  }
};

export const getPaymentStatus = async (
  orderId?: string,
  razorpayOrderId?: string
): Promise<PaymentStatus> => {
  try {
    const params = new URLSearchParams();
    if (orderId) params.append('orderId', orderId);
    if (razorpayOrderId) params.append('razorpayOrderId', razorpayOrderId);

    const response = await apiCall<PaymentResponse<PaymentStatus>>(
      `/payment/create-intent?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get payment status');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};

export const getPaymentConfirmation = async (
  orderId?: string,
  paymentId?: string
): Promise<PaymentStatus> => {
  try {
    const params = new URLSearchParams();
    if (orderId) params.append('orderId', orderId);
    if (paymentId) params.append('paymentId', paymentId);

    const response = await apiCall<PaymentResponse<PaymentStatus>>(
      `/payment/confirm?${params.toString()}`
    );

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to get payment confirmation');
    }

    return response.data;
  } catch (error) {
    console.error('Error getting payment confirmation:', error);
    throw error;
  }
};

// Razorpay Frontend Integration Helper
export const initializeRazorpayPayment = (
  paymentIntent: PaymentIntent,
  onSuccess: (response: any) => void,
  onError: (error: any) => void
): void => {
  if (typeof window === 'undefined') {
    console.error('Razorpay can only be initialized in browser environment');
    return;
  }

  // Check if Razorpay script is loaded
  if (!(window as any).Razorpay) {
    console.error('Razorpay script not loaded');
    onError({ error: 'Razorpay script not loaded' });
    return;
  }

  const options = {
    key: paymentIntent.key,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    name: 'Morandi Store',
    description: `Payment for Order ${paymentIntent.receipt}`,
    order_id: paymentIntent.order_id,
    image: '/logo-placeholder.svg',
    prefill: paymentIntent.prefill,
    theme: paymentIntent.theme,
    notes: paymentIntent.notes,
    handler: function (response: any) {
      console.log('Payment successful:', response);
      onSuccess(response);
    },
    modal: {
      ondismiss: function () {
        console.log('Payment modal dismissed');
        onError({ error: 'Payment cancelled by user' });
      }
    }
  };

  const razorpay = new (window as any).Razorpay(options);

  razorpay.on('payment.failed', function (response: any) {
    console.error('Payment failed:', response);
    onError(response.error);
  });

  razorpay.open();
};

// Payment utility functions
export const formatAmount = (amount: number, currency: string = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount);
};

export const getPaymentMethodIcon = (method: string): string => {
  const iconMap: Record<string, string> = {
    'card': '💳',
    'netbanking': '🏦',
    'wallet': '📱',
    'upi': '📲',
    'emi': '📅',
    'paylater': '💰'
  };
  return iconMap[method] || '💳';
};

export const getPaymentStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'pending': 'yellow',
    'paid': 'green',
    'failed': 'red',
    'refunded': 'gray',
    'partially_refunded': 'orange'
  };
  return colorMap[status] || 'gray';
};

export const getPaymentStatusLabel = (status: string): string => {
  const labelMap: Record<string, string> = {
    'pending': 'Pending',
    'paid': 'Paid',
    'failed': 'Failed',
    'refunded': 'Refunded',
    'partially_refunded': 'Partially Refunded'
  };
  return labelMap[status] || status;
};

// Razorpay script loader
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Complete payment flow helper
export const processPayment = async (
  orderId: string,
  amount: number,
  onSuccess?: (order: any) => void,
  onError?: (error: string) => void
): Promise<void> => {
  try {
    // Step 1: Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      throw new Error('Failed to load Razorpay script');
    }

    // Step 2: Create payment intent
    const paymentIntent = await createPaymentIntent(orderId, amount);

    // Step 3: Initialize Razorpay payment
    initializeRazorpayPayment(
      paymentIntent,
      async (razorpayResponse) => {
        try {
          // Step 4: Confirm payment
          const confirmation = await confirmPayment({
            razorpay_order_id: razorpayResponse.razorpay_order_id,
            razorpay_payment_id: razorpayResponse.razorpay_payment_id,
            razorpay_signature: razorpayResponse.razorpay_signature,
            order_id: orderId
          });

          if (onSuccess) {
            onSuccess(confirmation.order);
          }
        } catch (error) {
          console.error('Error confirming payment:', error);
          if (onError) {
            onError(error.message || 'Payment confirmation failed');
          }
        }
      },
      (error) => {
        console.error('Razorpay payment error:', error);
        if (onError) {
          onError(error.error?.description || 'Payment failed');
        }
      }
    );
  } catch (error) {
    console.error('Error processing payment:', error);
    if (onError) {
      onError(error.message || 'Payment processing failed');
    }
  }
};

// Legacy compatibility functions for migration
export const createPendingOrder = async (orderData: any): Promise<any> => {
  // This function will be replaced by the order creation flow
  console.warn('createPendingOrder is deprecated, use createOrder from orders-api');
  throw new Error('Use native order creation flow');
};

export const getWordPressCheckoutUrl = (orderId: string): string => {
  // Redirect to our native payment flow instead of WordPress
  return `/checkout/payment?order=${orderId}`;
};
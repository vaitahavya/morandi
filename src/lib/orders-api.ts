// Orders API - Native e-commerce order management
// This library provides functions to interact with our native order APIs

export interface OrderItem {
  id: string;
  productId: string;
  variantId?: string;
  productName: string;
  productSku?: string;
  variantName?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  attributes?: any;
  productImage?: string;
  product?: {
    id: string;
    name: string;
    slug: string;
    images: string[];
    featuredImage?: string;
  };
}

export interface OrderStatusHistory {
  id: string;
  status: string;
  notes?: string;
  changedBy?: string;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  status: string;
  paymentStatus: string;
  
  // Customer information
  customerEmail: string;
  customerPhone?: string;
  
  // Billing address
  billingFirstName: string;
  billingLastName: string;
  billingCompany?: string;
  billingAddress1: string;
  billingAddress2?: string;
  billingCity: string;
  billingState?: string;
  billingPostcode: string;
  billingCountry: string;
  
  // Shipping address
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostcode?: string;
  shippingCountry?: string;
  
  // Financial details
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  total: number;
  currency: string;
  
  // Payment information
  paymentMethod?: string;
  paymentMethodTitle?: string;
  transactionId?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Shipping information
  shippingMethod?: string;
  shippingMethodTitle?: string;
  trackingNumber?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Notes and metadata
  customerNotes?: string;
  adminNotes?: string;
  sourceChannel?: string;
  
  // Relations
  items: OrderItem[];
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  statusHistory?: OrderStatusHistory[];
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderData {
  status: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  orderNumber?: string;
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
    price: number;
    productName: string;
    productSku?: string;
    variantName?: string;
    unitPrice?: number;
    totalPrice?: number;
    attributes?: any;
    productImage?: string;
  }[];
  customerEmail: string;
  customerPhone?: string;
  billingFirstName: string;
  billingLastName: string;
  billingCompany?: string;
  billingAddress1: string;
  billingAddress2?: string;
  billingCity: string;
  billingState?: string;
  billingPostcode: string;
  billingCountry: string;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingCompany?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPostcode?: string;
  shippingCountry?: string;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  shippingMethod?: string;
  shippingMethodTitle?: string;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  customerNotes?: string;
  currency?: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: string;
  paymentStatus?: string;
  userId?: string;
  search?: string;
  fromDate?: string;
  toDate?: string;
}

export interface OrderListResponse {
  success: boolean;
  data: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export interface OrderResponse {
  success: boolean;
  data?: Order;
  error?: string;
  message?: string;
}

export interface OrderStatusResponse {
  success: boolean;
  data?: {
    currentStatus: string;
    currentPaymentStatus: string;
    history: OrderStatusHistory[];
  };
  error?: string;
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

// Order API Functions

export const getOrders = async (filters: OrderFilters = {}): Promise<OrderListResponse> => {
  try {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await apiCall<OrderListResponse>(`/orders?${params.toString()}`);
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrder = async (id: string): Promise<Order | null> => {
  try {
    const response = await apiCall<OrderResponse>(`/orders/${id}`);
    return response.data || null;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const response = await apiCall<OrderResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to create order');
    }

    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const updateOrder = async (id: string, updateData: Partial<Order>): Promise<Order> => {
  try {
    const response = await apiCall<OrderResponse>(`/orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update order');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating order:', error);
    throw error;
  }
};

export const updateOrderStatus = async (
  id: string, 
  status: string, 
  notes?: string, 
  notify: boolean = true
): Promise<Order> => {
  try {
    const response = await apiCall<OrderResponse>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes, notify }),
    });

    if (!response.success || !response.data) {
      throw new Error(response.error || 'Failed to update order status');
    }

    return response.data;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const cancelOrder = async (id: string): Promise<void> => {
  try {
    const response = await apiCall<{ success: boolean; error?: string }>(`/orders/${id}`, {
      method: 'DELETE',
    });

    if (!response.success) {
      throw new Error(response.error || 'Failed to cancel order');
    }
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

export const getOrderStatusHistory = async (id: string): Promise<OrderStatusHistory[]> => {
  try {
    const response = await apiCall<OrderStatusResponse>(`/orders/${id}/status`);
    return response.data?.history || [];
  } catch (error) {
    console.error('Error fetching order status history:', error);
    throw error;
  }
};

// Order calculation utilities
export const calculateOrderTotals = (
  items: { quantity: number; unitPrice: number }[],
  shippingCost: number = 0,
  taxRate: number = 0.18, // 18% GST
  discountAmount: number = 0
) => {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = subtotal + shippingCost + taxAmount - discountAmount;
  
  return {
    subtotal,
    taxAmount,
    shippingCost,
    discountAmount,
    total
  };
};

// Order status utilities
export const getOrderStatusColor = (status: string): string => {
  const statusColors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'purple',
    shipped: 'indigo',
    delivered: 'green',
    cancelled: 'red',
    refunded: 'gray',
    failed: 'red'
  };
  return (statusColors as any)[status] || 'gray';
};

export const getPaymentStatusColor = (status: string): string => {
  const statusColors = {
    pending: 'yellow',
    paid: 'green',
    failed: 'red',
    refunded: 'gray',
    partially_refunded: 'orange'
  };
  return (statusColors as any)[status] || 'gray';
};

export const getOrderStatusLabel = (status: string): string => {
  const statusLabels = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    refunded: 'Refunded',
    failed: 'Failed'
  };
  return (statusLabels as any)[status] || status;
};

export const getPaymentStatusLabel = (status: string): string => {
  const statusLabels = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partially_refunded: 'Partially Refunded'
  };
  return (statusLabels as any)[status] || status;
};

// Legacy compatibility functions
export const createPendingOrder = async (orderData: CreateOrderData): Promise<Order> => {
  // Create order with pending status - same as createOrder but explicitly pending
  return createOrder({ ...orderData, paymentMethod: 'razorpay' });
};

export const getLegacyCheckoutUrl = (orderId: string): string => {
  // For migration period, redirect to our own checkout success page
  return `/order-success?order=${orderId}`;
};

export const getOrderStatus = async (orderId: string): Promise<string | null> => {
  try {
    const order = await getOrder(orderId);
    return order?.status || null;
  } catch (error) {
    console.error('Error getting order status:', error);
    return null;
  }
};
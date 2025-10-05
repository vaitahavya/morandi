export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByOrderNumber(orderNumber: string): Promise<Order | null>;
  findMany(filters: OrderFilters): Promise<{ orders: Order[]; pagination: PaginationInfo }>;
  create(orderData: CreateOrderData): Promise<Order>;
  update(id: string, orderData: UpdateOrderData): Promise<Order>;
  updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order>;
  delete(id: string): Promise<void>;
  findByUserId(userId: string, filters?: OrderFilters): Promise<Order[]>;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  billingFirstName: string;
  billingLastName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress: Address;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
}

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
  attributes?: Record<string, any>;
  productImage?: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded';

export type PaymentStatus = 
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export interface OrderFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  userId?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateOrderData {
  userId?: string;
  customerEmail: string;
  customerPhone?: string;
  billingFirstName: string;
  billingLastName: string;
  billingEmail: string;
  billingPhone?: string;
  billingAddress: Address;
  shippingFirstName?: string;
  shippingLastName?: string;
  shippingEmail?: string;
  shippingPhone?: string;
  shippingAddress?: Address;
  items: CreateOrderItemData[];
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  paymentMethod?: string;
  paymentMethodTitle?: string;
  notes?: string;
}

export interface CreateOrderItemData {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface UpdateOrderData {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  trackingNumber?: string;
  notes?: string;
  subtotal?: number;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
  total?: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

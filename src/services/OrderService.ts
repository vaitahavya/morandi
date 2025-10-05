import { 
  orderRepository, 
  CreateOrderInput, 
  UpdateOrderInput, 
  OrderFilters,
  FindManyOptions,
  PaginatedResult,
  OrderWithItems
} from '@/repositories';

/**
 * Order Service - Business logic layer
 */
export class OrderService {
  /**
   * Create a new order with business validation
   */
  async createOrder(orderData: CreateOrderInput): Promise<OrderWithItems> {
    // Business validation
    if (!orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
      throw new Error('Customer email and items are required');
    }

    if (orderData.total <= 0) {
      throw new Error('Order total must be greater than 0');
    }

    if (!orderData.billingFirstName || !orderData.billingLastName) {
      throw new Error('Billing name is required');
    }

    if (!orderData.billingAddress1 || !orderData.billingCity || !orderData.billingCountry) {
      throw new Error('Complete billing address is required');
    }

    // Validate order items
    for (const item of orderData.items) {
      if (!item.productId || !item.productName || item.quantity <= 0) {
        throw new Error('Invalid order item data');
      }
    }

    // Generate order number if not provided
    if (!orderData.orderNumber) {
      orderData.orderNumber = this.generateOrderNumber();
    }

    // Check if order number already exists
    const existingOrder = await orderRepository.findByOrderNumber(orderData.orderNumber);
    if (existingOrder) {
      throw new Error('Order number already exists');
    }

    // Create order
    return await orderRepository.create(orderData);
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string): Promise<OrderWithItems | null> {
    if (!id) {
      throw new Error('Order ID is required');
    }

    return await orderRepository.findById(id);
  }

  /**
   * Get order by order number
   */
  async getOrderByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    if (!orderNumber) {
      throw new Error('Order number is required');
    }

    return await orderRepository.findByOrderNumber(orderNumber);
  }

  /**
   * Get paginated orders with filters
   */
  async getOrders(filters?: OrderFilters, options?: FindManyOptions): Promise<PaginatedResult<OrderWithItems>> {
    return await orderRepository.findMany(filters, options);
  }

  /**
   * Update order with business validation
   */
  async updateOrder(id: string, orderData: UpdateOrderInput): Promise<OrderWithItems> {
    if (!id) {
      throw new Error('Order ID is required');
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Business validation for status changes
    if (orderData.status && orderData.status !== existingOrder.status) {
      const currentStatus = existingOrder.status || 'pending';
      const allowedStatuses = this.getAllowedStatusTransitions(currentStatus);
      if (!allowedStatuses.includes(orderData.status)) {
        throw new Error(`Cannot change status from ${currentStatus} to ${orderData.status}`);
      }
    }

    return await orderRepository.update(id, orderData);
  }

  /**
   * Delete order with business validation
   */
  async deleteOrder(id: string): Promise<void> {
    if (!id) {
      throw new Error('Order ID is required');
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Business rule: Cannot delete orders that are paid or shipped
    if (['paid', 'shipped', 'delivered'].includes(existingOrder.status || '')) {
      throw new Error('Cannot delete orders that are paid, shipped, or delivered');
    }

    await orderRepository.delete(id);
  }

  /**
   * Update order status with business validation
   */
  async updateOrderStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<OrderWithItems> {
    if (!id || !status) {
      throw new Error('Order ID and status are required');
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Validate status transition
    const currentStatus = existingOrder.status || 'pending';
    const allowedStatuses = this.getAllowedStatusTransitions(currentStatus);
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Cannot change status from ${currentStatus} to ${status}`);
    }

    return await orderRepository.updateStatus(id, status, notes, changedBy);
  }

  /**
   * Get orders by user
   */
  async getOrdersByUser(userId: string, options?: FindManyOptions): Promise<PaginatedResult<OrderWithItems>> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await orderRepository.getOrdersByUser(userId, options);
  }

  /**
   * Get order statistics
   */
  async getOrderStats(filters?: OrderFilters): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
    monthlyStats: Array<{
      month: string;
      orders: number;
      revenue: number;
    }>;
  }> {
    const stats = await orderRepository.getOrderStats(filters);
    
    // Get monthly statistics (last 12 months)
    const monthlyStats = await this.getMonthlyOrderStats(filters);

    return {
      ...stats,
      monthlyStats,
    };
  }

  /**
   * Cancel order with business validation
   */
  async cancelOrder(id: string, reason?: string): Promise<OrderWithItems> {
    if (!id) {
      throw new Error('Order ID is required');
    }

    // Check if order exists
    const existingOrder = await orderRepository.findById(id);
    if (!existingOrder) {
      throw new Error('Order not found');
    }

    // Business rule: Cannot cancel orders that are shipped or delivered
    const currentStatus = existingOrder.status || 'pending';
    if (['shipped', 'delivered'].includes(currentStatus)) {
      throw new Error('Cannot cancel orders that are shipped or delivered');
    }

    const notes = reason ? `Cancelled: ${reason}` : 'Order cancelled';
    return await orderRepository.updateStatus(id, 'cancelled', notes);
  }

  /**
   * Generate unique order number
   */
  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ORD-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Get allowed status transitions
   */
  private getAllowedStatusTransitions(currentStatus: string): string[] {
    const statusTransitions: Record<string, string[]> = {
      'pending': ['paid', 'cancelled'],
      'paid': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'returned'],
      'delivered': ['returned'],
      'cancelled': [],
      'returned': ['refunded'],
      'refunded': [],
    };

    return statusTransitions[currentStatus] || [];
  }

  /**
   * Get monthly order statistics
   */
  private async getMonthlyOrderStats(filters?: OrderFilters): Promise<Array<{
    month: string;
    orders: number;
    revenue: number;
  }>> {
    const now = new Date();
    const months = [];
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthFilters = {
        ...filters,
        dateFrom: date,
        dateTo: new Date(date.getFullYear(), date.getMonth() + 1, 0),
      };
      
      const stats = await orderRepository.getOrderStats(monthFilters);
      
      months.push({
        month: date.toISOString().substring(0, 7), // YYYY-MM
        orders: stats.totalOrders,
        revenue: stats.totalRevenue,
      });
    }
    
    return months;
  }
}

// Export singleton instance
export const orderService = new OrderService();
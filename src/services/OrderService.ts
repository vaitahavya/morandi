import { IOrderRepository } from '@/interfaces/IOrderRepository';
import { IProductRepository } from '@/interfaces/IProductRepository';
import { IEmailService } from '@/interfaces/IEmailService';
import { Order, CreateOrderData, OrderStatus } from '@/interfaces/IOrderRepository';

export class OrderService {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private emailService: IEmailService
  ) {}

  async getOrder(id: string) {
    return this.orderRepository.findById(id);
  }

  async getOrderByNumber(orderNumber: string) {
    return this.orderRepository.findByOrderNumber(orderNumber);
  }

  async getOrders(filters: any) {
    return this.orderRepository.findMany(filters);
  }

  async getUserOrders(userId: string, filters?: any) {
    return this.orderRepository.findByUserId(userId, filters);
  }

  async createOrder(orderData: CreateOrderData) {
    // Validate order data
    this.validateOrderData(orderData);

    // Validate and calculate order items
    const validatedItems = await this.validateAndCalculateItems(orderData.items);

    // Calculate totals
    const subtotal = validatedItems.reduce((sum, item) => sum + item.totalPrice, 0);
    const shippingCost = orderData.shippingCost || 0;
    const taxAmount = orderData.taxAmount || this.calculateTax(subtotal);
    const discountAmount = orderData.discountAmount || 0;
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    // Create the order
    const order = await this.orderRepository.create({
      ...orderData,
      items: validatedItems.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }))
    });

    // Update order with calculated totals
    const updatedOrder = await this.orderRepository.update(order.id, {
      subtotal,
      shippingCost,
      taxAmount,
      discountAmount,
      total
    });

    // Send order confirmation email
    await this.emailService.sendOrderConfirmation(updatedOrder);

    return updatedOrder;
  }

  async updateOrderStatus(id: string, status: OrderStatus, notes?: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // Validate status transition
    this.validateStatusTransition(order.status, status);

    const updatedOrder = await this.orderRepository.updateStatus(id, status, notes);

    // Send status update email
    await this.emailService.sendOrderStatusUpdate(updatedOrder, status);

    // Update inventory if order is delivered or cancelled
    if (status === 'delivered' || status === 'cancelled') {
      await this.updateInventoryForOrder(updatedOrder, status);
    }

    return updatedOrder;
  }

  async cancelOrder(id: string, reason?: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (['delivered', 'cancelled', 'refunded'].includes(order.status)) {
      throw new Error('Cannot cancel order in current status');
    }

    return this.updateOrderStatus(id, 'cancelled', reason);
  }

  async refundOrder(id: string, amount?: number, reason?: string) {
    const order = await this.orderRepository.findById(id);
    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'delivered') {
      throw new Error('Order must be delivered to process refund');
    }

    const refundAmount = amount || order.total;
    if (refundAmount > order.total) {
      throw new Error('Refund amount cannot exceed order total');
    }

    const updatedOrder = await this.orderRepository.update(id, {
      status: refundAmount === order.total ? 'refunded' : 'partially_refunded',
      notes: reason
    });

    // Process refund through payment gateway
    // await this.paymentService.processRefund(order.paymentMethod, refundAmount);

    return updatedOrder;
  }

  private async validateAndCalculateItems(items: any[]) {
    const validatedItems = [];

    for (const item of items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      // Check stock availability
      const availableStock = item.variantId 
        ? product.variants?.find(v => v.id === item.variantId)?.stockQuantity || 0
        : product.stockQuantity;

      if (availableStock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`);
      }

      // Calculate pricing
      const unitPrice = item.variantId 
        ? product.variants?.find(v => v.id === item.variantId)?.salePrice || 
          product.variants?.find(v => v.id === item.variantId)?.price || 
          product.price
        : product.salePrice || product.price;

      const totalPrice = Number(unitPrice) * item.quantity;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId,
        productName: product.name,
        productSku: item.variantId ? 
          product.variants?.find(v => v.id === item.variantId)?.sku : 
          product.sku,
        variantName: item.variantId ? 
          product.variants?.find(v => v.id === item.variantId)?.name : 
          null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        attributes: item.variantId ? 
          product.variants?.find(v => v.id === item.variantId)?.attributes : 
          null,
        productImage: product.featuredImage || product.images[0] || null
      });
    }

    return validatedItems;
  }

  private calculateTax(subtotal: number, taxRate = 0.18): number {
    return Math.round(subtotal * taxRate);
  }

  private validateOrderData(orderData: CreateOrderData) {
    if (!orderData.customerEmail) {
      throw new Error('Customer email is required');
    }

    if (!orderData.billingFirstName || !orderData.billingLastName) {
      throw new Error('Billing name is required');
    }

    if (!orderData.billingAddress) {
      throw new Error('Billing address is required');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(orderData.customerEmail)) {
      throw new Error('Invalid email format');
    }
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['processing', 'cancelled'],
      processing: ['shipped', 'cancelled'],
      shipped: ['delivered', 'cancelled'],
      delivered: ['refunded', 'partially_refunded'],
      cancelled: [],
      refunded: [],
      partially_refunded: ['refunded']
    };

    if (!validTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }

  private async updateInventoryForOrder(order: Order, status: OrderStatus) {
    for (const item of order.items) {
      const product = await this.productRepository.findById(item.productId);
      if (!product) continue;

      if (status === 'delivered') {
        // Reduce stock for delivered orders
        const newStock = product.stockQuantity - item.quantity;
        await this.productRepository.update(item.productId, {
          stockQuantity: Math.max(0, newStock),
          stockStatus: newStock > 0 ? 'instock' : 'outofstock'
        });
      } else if (status === 'cancelled') {
        // Restore stock for cancelled orders
        const newStock = product.stockQuantity + item.quantity;
        await this.productRepository.update(item.productId, {
          stockQuantity: newStock,
          stockStatus: 'instock'
        });
      }
    }
  }
}

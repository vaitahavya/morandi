import { PrismaClient, Order, OrderItem } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Order creation input type
 */
export interface CreateOrderInput {
  userId?: string;
  status: string;
  total: number;
  orderNumber: string;
  paymentStatus: string;
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
  items: CreateOrderItemInput[];
}

/**
 * Order item creation input type
 */
export interface CreateOrderItemInput {
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
}

/**
 * Order update input type
 */
export interface UpdateOrderInput {
  status?: string;
  total?: number;
  paymentStatus?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerNotes?: string;
  shippingCost?: number;
  taxAmount?: number;
  discountAmount?: number;
}

/**
 * Order filter input type
 */
export interface OrderFilters {
  userId?: string;
  status?: string;
  paymentStatus?: string;
  customerEmail?: string;
  orderNumber?: string;
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
}

/**
 * Order with items type
 */
export interface OrderWithItems extends Order {
  order_items: OrderItem[];
}

/**
 * Order repository interface
 */
export interface IOrderRepository {
  create(data: CreateOrderInput): Promise<OrderWithItems>;
  findById(id: string): Promise<OrderWithItems | null>;
  findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null>;
  findMany(filters?: OrderFilters, options?: FindManyOptions): Promise<PaginatedResult<OrderWithItems>>;
  update(id: string, data: UpdateOrderInput): Promise<OrderWithItems>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<OrderWithItems>;
  getOrdersByUser(userId: string, options?: FindManyOptions): Promise<PaginatedResult<OrderWithItems>>;
  getOrderStats(filters?: OrderFilters): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
  }>;
}

/**
 * Order repository implementation
 */
export class OrderRepository extends BaseRepository<OrderWithItems, CreateOrderInput, UpdateOrderInput, OrderFilters> 
  implements IOrderRepository {

  async create(data: CreateOrderInput): Promise<OrderWithItems> {
    return await this.prisma.$transaction(async (tx) => {
      // Create the order
      const order = await tx.order.create({
        data: {
          user_id: data.userId,
          status: data.status,
          total: data.total,
          order_number: data.orderNumber,
          payment_status: data.paymentStatus,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone,
          billing_first_name: data.billingFirstName,
          billing_last_name: data.billingLastName,
          billing_company: data.billingCompany,
          billing_address1: data.billingAddress1,
          billing_address2: data.billingAddress2,
          billing_city: data.billingCity,
          billing_state: data.billingState,
          billing_postcode: data.billingPostcode,
          billing_country: data.billingCountry,
          shipping_first_name: data.shippingFirstName,
          shipping_last_name: data.shippingLastName,
          shipping_company: data.shippingCompany,
          shipping_address1: data.shippingAddress1,
          shipping_address2: data.shippingAddress2,
          shipping_city: data.shippingCity,
          shipping_state: data.shippingState,
          shipping_postcode: data.shippingPostcode,
          shipping_country: data.shippingCountry,
          payment_method: data.paymentMethod,
          payment_method_title: data.paymentMethodTitle,
          shipping_method: data.shippingMethod,
          shipping_method_title: data.shippingMethodTitle,
          shipping_cost: data.shippingCost,
          tax_amount: data.taxAmount,
          discount_amount: data.discountAmount,
          customer_notes: data.customerNotes,
          currency: data.currency,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        data.items.map(item =>
          tx.orderItem.create({
            data: {
              order_id: order.id,
              product_id: item.productId,
              variant_id: item.variantId,
              quantity: item.quantity,
              price: item.price,
              product_name: item.productName,
              product_sku: item.productSku,
              variant_name: item.variantName,
              unit_price: item.unitPrice,
              total_price: item.totalPrice,
              attributes: item.attributes,
              product_image: item.productImage,
            },
          })
        )
      );

      // Return order with items
      return {
        ...order,
        order_items: orderItems,
      };
    });
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_items: true,
      },
    });
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    return await this.prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        order_items: true,
      },
    });
  }

  async findMany(filters: OrderFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<OrderWithItems>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build where clause
    const where: any = {};
    
    if (filters.userId) {
      where.user_id = filters.userId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.paymentStatus) {
      where.payment_status = filters.paymentStatus;
    }
    if (filters.customerEmail) {
      where.customer_email = { contains: filters.customerEmail, mode: 'insensitive' };
    }
    if (filters.orderNumber) {
      where.order_number = { contains: filters.orderNumber, mode: 'insensitive' };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) {
        where.created_at.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.created_at.lte = filters.dateTo;
      }
    }
    if (filters.minTotal !== undefined || filters.maxTotal !== undefined) {
      where.total = {};
      if (filters.minTotal !== undefined) {
        where.total.gte = filters.minTotal;
      }
      if (filters.maxTotal !== undefined) {
        where.total.lte = filters.maxTotal;
      }
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { created_at: 'desc' },
        include: {
          order_items: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateOrderInput): Promise<OrderWithItems> {
    const updateData: any = { ...data };
    
    // Map camelCase to snake_case for database fields
    if (data.paymentStatus !== undefined) updateData.payment_status = data.paymentStatus;
    if (data.customerEmail !== undefined) updateData.customer_email = data.customerEmail;
    if (data.customerPhone !== undefined) updateData.customer_phone = data.customerPhone;
    if (data.customerNotes !== undefined) updateData.customer_notes = data.customerNotes;
    if (data.shippingCost !== undefined) updateData.shipping_cost = data.shippingCost;
    if (data.taxAmount !== undefined) updateData.tax_amount = data.taxAmount;
    if (data.discountAmount !== undefined) updateData.discount_amount = data.discountAmount;
    
    // Always update the updatedAt timestamp
    updateData.updated_at = new Date();

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        order_items: true,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<OrderWithItems> {
    return await this.prisma.$transaction(async (tx) => {
      // Update the order
      const order = await tx.order.update({
        where: { id },
        data: {
          status,
          updated_at: new Date(),
        },
      });

      // Create status history entry
      await tx.orderStatusHistory.create({
        data: {
          order_id: id,
          status,
          notes,
          changed_by: changedBy,
        },
      });

      // Return order with items
      return await this.findById(id) as OrderWithItems;
    });
  }

  async getOrdersByUser(userId: string, options: FindManyOptions = {}): Promise<PaginatedResult<OrderWithItems>> {
    return await this.findMany(
      { userId },
      options
    );
  }

  async getOrderStats(filters: OrderFilters = {}): Promise<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    statusBreakdown: Record<string, number>;
  }> {
    // Build where clause
    const where: any = {};
    
    if (filters.userId) where.user_id = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.payment_status = filters.paymentStatus;
    if (filters.customerEmail) where.customer_email = { contains: filters.customerEmail, mode: 'insensitive' };
    if (filters.dateFrom || filters.dateTo) {
      where.created_at = {};
      if (filters.dateFrom) where.created_at.gte = filters.dateFrom;
      if (filters.dateTo) where.created_at.lte = filters.dateTo;
    }

    const [totalOrders, orders, statusBreakdown] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        select: { total: true, status: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where,
        _count: { status: true },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const statusBreakdownMap = statusBreakdown.reduce((acc, item) => {
      acc[item.status || 'unknown'] = item._count.status;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusBreakdown: statusBreakdownMap,
    };
  }
}

// Export singleton instance
export const orderRepository = new OrderRepository(new PrismaClient());
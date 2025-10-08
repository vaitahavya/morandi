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
  orderItems: OrderItem[];
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
          userId: data.userId,
          status: data.status,
          total: data.total,
          orderNumber: data.orderNumber,
          paymentStatus: data.paymentStatus,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          billingFirstName: data.billingFirstName,
          billingLastName: data.billingLastName,
          billingCompany: data.billingCompany,
          billingAddress1: data.billingAddress1,
          billingAddress2: data.billingAddress2,
          billingCity: data.billingCity,
          billingState: data.billingState,
          billingPostcode: data.billingPostcode,
          billingCountry: data.billingCountry,
          shippingFirstName: data.shippingFirstName,
          shippingLastName: data.shippingLastName,
          shippingCompany: data.shippingCompany,
          shippingAddress1: data.shippingAddress1,
          shippingAddress2: data.shippingAddress2,
          shippingCity: data.shippingCity,
          shippingState: data.shippingState,
          shippingPostcode: data.shippingPostcode,
          shippingCountry: data.shippingCountry,
          paymentMethod: data.paymentMethod,
          subtotal: data.total - (data.shippingCost || 0) - (data.taxAmount || 0) + (data.discountAmount || 0),
          tax: data.taxAmount,
          shipping: data.shippingCost,
          discount: data.discountAmount,
          notes: data.customerNotes,
          currency: data.currency,
        },
      });

      // Create order items
      const orderItems = await Promise.all(
        data.items.map(item =>
          tx.orderItem.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
              productName: item.productName,
              unitPrice: item.unitPrice || item.price,
            },
          })
        )
      );

      // Return order with items
      return {
        ...order,
        orderItems: orderItems,
      } as OrderWithItems;
    });
  }

  async findById(id: string): Promise<OrderWithItems | null> {
    return await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    }) as OrderWithItems | null;
  }

  async findByOrderNumber(orderNumber: string): Promise<OrderWithItems | null> {
    return await this.prisma.order.findUnique({
      where: { orderNumber: orderNumber },
      include: {
        orderItems: true,
      },
    }) as OrderWithItems | null;
  }

  async findMany(filters: OrderFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<OrderWithItems>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder);

    // Build where clause
    const where: any = {};
    
    if (filters.userId) {
      where.userId = filters.userId;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.paymentStatus) {
      where.paymentStatus = filters.paymentStatus;
    }
    if (filters.customerEmail) {
      where.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    }
    if (filters.orderNumber) {
      where.orderNumber = { contains: filters.orderNumber, mode: 'insensitive' };
    }
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) {
        where.createdAt.gte = filters.dateFrom;
      }
      if (filters.dateTo) {
        where.createdAt.lte = filters.dateTo;
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
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          orderItems: true,
        },
      }),
      this.prisma.order.count({ where }),
    ]);

    return {
      data: orders as OrderWithItems[],
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateOrderInput): Promise<OrderWithItems> {
    const updateData: any = { ...data };
    
    // Map camelCase for database fields
    if (data.paymentStatus !== undefined) updateData.paymentStatus = data.paymentStatus;
    if (data.customerEmail !== undefined) updateData.customerEmail = data.customerEmail;
    if (data.customerPhone !== undefined) updateData.customerPhone = data.customerPhone;
    if (data.customerNotes !== undefined) updateData.notes = data.customerNotes;
    if (data.shippingCost !== undefined) updateData.shipping = data.shippingCost;
    if (data.taxAmount !== undefined) updateData.tax = data.taxAmount;
    if (data.discountAmount !== undefined) updateData.discount = data.discountAmount;
    
    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    return await this.prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        orderItems: true,
      },
    }) as OrderWithItems;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id },
    });
  }

  async updateStatus(id: string, status: string, notes?: string, changedBy?: string): Promise<OrderWithItems> {
    // Update the order - Note: OrderStatusHistory model doesn't exist in schema
    // If needed, add it to the schema or track status changes differently
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        notes: notes || undefined,
        updatedAt: new Date(),
      },
      include: {
        orderItems: true,
      },
    });

    return order as OrderWithItems;
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
    
    if (filters.userId) where.userId = filters.userId;
    if (filters.status) where.status = filters.status;
    if (filters.paymentStatus) where.paymentStatus = filters.paymentStatus;
    if (filters.customerEmail) where.customerEmail = { contains: filters.customerEmail, mode: 'insensitive' };
    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
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
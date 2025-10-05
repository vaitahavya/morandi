import { PrismaClient } from '@prisma/client';
import { 
  IOrderRepository, 
  Order, 
  OrderFilters, 
  CreateOrderData, 
  UpdateOrderData,
  OrderStatus,
  PaginationInfo 
} from '@/interfaces/IOrderRepository';

export class OrderRepository implements IOrderRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        order_items: true,
        statusHistory: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    return order ? this.mapToOrder(order) : null;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order | null> {
    const order = await this.prisma.order.findUnique({
      where: { order_number: orderNumber },
      include: {
        order_items: true,
        statusHistory: {
          orderBy: { created_at: 'desc' }
        }
      }
    });

    return order ? this.mapToOrder(order) : null;
  }

  async findMany(filters: OrderFilters): Promise<{ orders: Order[]; pagination: PaginationInfo }> {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    if (filters.userId) {
      whereConditions.user_id = filters.userId;
    }

    if (filters.status) {
      whereConditions.status = filters.status;
    }

    if (filters.paymentStatus) {
      whereConditions.payment_status = filters.paymentStatus;
    }

    if (filters.search) {
      whereConditions.OR = [
        { order_number: { contains: filters.search, mode: 'insensitive' } },
        { customer_email: { contains: filters.search, mode: 'insensitive' } },
        { billing_first_name: { contains: filters.search, mode: 'insensitive' } },
        { billing_last_name: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    if (filters.fromDate || filters.toDate) {
      whereConditions.created_at = {};
      if (filters.fromDate) {
        whereConditions.created_at.gte = new Date(filters.fromDate);
      }
      if (filters.toDate) {
        whereConditions.created_at.lte = new Date(filters.toDate);
      }
    }

    // Build order by
    const orderBy: any = {};
    if (filters.sortBy) {
      orderBy[filters.sortBy] = filters.sortOrder || 'desc';
    } else {
      orderBy.created_at = 'desc';
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereConditions,
        include: {
          order_items: true,
          statusHistory: {
            orderBy: { created_at: 'desc' }
          }
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      this.prisma.order.count({ where: whereConditions })
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      orders: orders.map(order => this.mapToOrder(order)),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  async create(orderData: CreateOrderData): Promise<Order> {
    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    const order = await this.prisma.order.create({
      data: {
        order_number: orderNumber,
        user_id: orderData.userId,
        customer_email: orderData.customerEmail,
        customer_phone: orderData.customerPhone,
        status: 'pending',
        payment_status: 'pending',
        billing_first_name: orderData.billingFirstName,
        billing_last_name: orderData.billingLastName,
        billing_address1: orderData.billingAddress.line1,
        billing_address2: orderData.billingAddress.line2,
        billing_city: orderData.billingAddress.city,
        billing_state: orderData.billingAddress.state,
        billing_postcode: orderData.billingAddress.postalCode,
        billing_country: orderData.billingAddress.country,
        shipping_first_name: orderData.shippingFirstName || orderData.billingFirstName,
        shipping_last_name: orderData.shippingLastName || orderData.billingLastName,
        shipping_address1: orderData.shippingAddress?.line1 || orderData.billingAddress.line1,
        shipping_address2: orderData.shippingAddress?.line2 || orderData.billingAddress.line2,
        shipping_city: orderData.shippingAddress?.city || orderData.billingAddress.city,
        shipping_state: orderData.shippingAddress?.state || orderData.billingAddress.state,
        shipping_postcode: orderData.shippingAddress?.postalCode || orderData.billingAddress.postalCode,
        shipping_country: orderData.shippingAddress?.country || orderData.billingAddress.country,
        subtotal: 0, // Will be calculated
        shipping_cost: orderData.shippingCost || 0,
        tax_amount: orderData.taxAmount || 0,
        discount_amount: orderData.discountAmount || 0,
        total: 0, // Will be calculated
        currency: 'INR',
        payment_method: orderData.paymentMethod,
        payment_method_title: orderData.paymentMethodTitle,
        customer_notes: orderData.notes,
        order_items: {
          create: orderData.items.map(item => ({
            product_id: item.productId,
            variant_id: item.variantId,
            quantity: item.quantity,
            price: 0, // Required field - will be calculated
            unit_price: 0, // Will be calculated
            total_price: 0 // Will be calculated
          }))
        }
      },
      include: {
        order_items: true,
        statusHistory: true
      }
    });

    return this.mapToOrder(order);
  }

  async update(id: string, orderData: UpdateOrderData): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        ...(orderData.status && { status: orderData.status }),
        ...(orderData.paymentStatus && { payment_status: orderData.paymentStatus }),
        ...(orderData.trackingNumber !== undefined && { tracking_number: orderData.trackingNumber }),
        ...(orderData.notes !== undefined && { notes: orderData.notes }),
        ...(orderData.shippingCost !== undefined && { shipping_cost: orderData.shippingCost }),
        ...(orderData.taxAmount !== undefined && { tax_amount: orderData.taxAmount }),
        ...(orderData.discountAmount !== undefined && { discount_amount: orderData.discountAmount }),
        updated_at: new Date()
      },
      include: {
        order_items: true,
        statusHistory: true
      }
    });

    return this.mapToOrder(order);
  }

  async updateStatus(id: string, status: OrderStatus, notes?: string): Promise<Order> {
    const order = await this.prisma.order.update({
      where: { id },
      data: {
        status,
        admin_notes: notes,
        updated_at: new Date(),
        statusHistory: {
          create: {
            status,
            notes,
            created_at: new Date()
          }
        }
      },
      include: {
        order_items: true,
        statusHistory: true
      }
    });

    return this.mapToOrder(order);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.order.delete({
      where: { id }
    });
  }

  async findByUserId(userId: string, filters?: OrderFilters): Promise<Order[]> {
    const result = await this.findMany({
      ...filters,
      userId
    });
    return result.orders;
  }

  private async generateOrderNumber(): Promise<string> {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const orderNumber = `${prefix}${timestamp}${random}`;

    // Check if order number already exists
    const existingOrder = await this.prisma.order.findUnique({
      where: { order_number: orderNumber }
    });

    if (existingOrder) {
      // Recursively generate a new one if it exists
      return this.generateOrderNumber();
    }

    return orderNumber;
  }

  private mapToOrder(prismaOrder: any): Order {
    return {
      id: prismaOrder.id,
      orderNumber: prismaOrder.order_number,
      userId: prismaOrder.user_id,
      customerEmail: prismaOrder.customer_email,
      customerPhone: prismaOrder.customer_phone,
      status: prismaOrder.status,
      paymentStatus: prismaOrder.payment_status,
      paymentMethod: prismaOrder.payment_method,
      paymentMethodTitle: prismaOrder.payment_method_title,
      billingFirstName: prismaOrder.billing_first_name,
      billingLastName: prismaOrder.billing_last_name,
      billingEmail: prismaOrder.billing_email,
      billingPhone: prismaOrder.billing_phone,
      billingAddress: prismaOrder.billing_address,
      shippingFirstName: prismaOrder.shipping_first_name,
      shippingLastName: prismaOrder.shipping_last_name,
      shippingEmail: prismaOrder.shipping_email,
      shippingPhone: prismaOrder.shipping_phone,
      shippingAddress: prismaOrder.shipping_address,
      items: prismaOrder.order_items?.map((item: any) => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
        productName: item.product_name,
        productSku: item.product_sku,
        variantName: item.variant_name,
        quantity: item.quantity,
        unitPrice: Number(item.unit_price),
        totalPrice: Number(item.total_price),
        attributes: item.attributes,
        productImage: item.product_image
      })) || [],
      subtotal: Number(prismaOrder.subtotal),
      shippingCost: Number(prismaOrder.shipping_cost),
      taxAmount: Number(prismaOrder.tax_amount),
      discountAmount: Number(prismaOrder.discount_amount),
      total: Number(prismaOrder.total),
      currency: prismaOrder.currency,
      trackingNumber: prismaOrder.tracking_number,
      notes: prismaOrder.notes,
      createdAt: prismaOrder.created_at.toISOString(),
      updatedAt: prismaOrder.updated_at.toISOString(),
      deliveredAt: prismaOrder.delivered_at?.toISOString()
    };
  }
}

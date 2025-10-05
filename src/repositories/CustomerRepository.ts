import { PrismaClient } from '@prisma/client';
import { FindManyOptions, PaginatedResult } from './base/BaseRepository';

/**
 * Customer data type (aggregated from orders and user data)
 */
export interface Customer {
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  fullName: string;
  city?: string;
  country?: string;
  userId?: string;
  totalSpent: number;
  totalOrders: number;
  avgOrderValue: number;
  segment: string;
  customerLifetimeValue: number;
  daysSinceFirstOrder: number;
  daysSinceLastOrder: number;
  isActive: boolean;
  firstOrderDate: string;
  lastOrderDate: string;
  orders: CustomerOrder[];
  statusCounts: Record<string, number>;
  monthlySpending: Record<string, number>;
}

/**
 * Customer order type
 */
export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  status: string;
  paymentStatus: string;
  total: number;
  currency: string;
  itemCount: number;
  items: any[];
}

/**
 * Customer filter input type
 */
export interface CustomerFilters {
  email?: string;
  phone?: string;
  city?: string;
  country?: string;
  segment?: string;
  isActive?: boolean;
  minTotalSpent?: number;
  maxTotalSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

/**
 * Customer details type
 */
export interface CustomerDetails extends Customer {
  billingAddress: {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  shippingAddress?: {
    firstName?: string;
    lastName?: string;
    company?: string;
    address1?: string;
    address2?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
  topProducts: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  activityLog: Array<{
    id: string;
    date: string;
    action: string;
    description?: string;
    orderId?: string;
    changedBy?: string;
  }>;
}

/**
 * Customer repository interface
 */
export interface ICustomerRepository {
  findMany(filters?: CustomerFilters, options?: FindManyOptions): Promise<PaginatedResult<Customer>>;
  findByEmail(email: string): Promise<CustomerDetails | null>;
  getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    averageOrderValue: number;
    totalRevenue: number;
    segmentBreakdown: Record<string, number>;
  }>;
  getCustomersBySegment(segment: string, options?: FindManyOptions): Promise<PaginatedResult<Customer>>;
  getTopCustomers(limit?: number): Promise<Customer[]>;
  searchCustomers(query: string, options?: FindManyOptions): Promise<PaginatedResult<Customer>>;
}

/**
 * Customer repository implementation
 */
export class CustomerRepository implements ICustomerRepository {
  constructor(private prisma: PrismaClient) {}

  async findMany(filters: CustomerFilters = {}, options: FindManyOptions = {}): Promise<PaginatedResult<Customer>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    
    // Build where clause for orders
    const orderWhere: any = {};
    if (filters.dateFrom || filters.dateTo) {
      orderWhere.created_at = {};
      if (filters.dateFrom) orderWhere.created_at.gte = filters.dateFrom;
      if (filters.dateTo) orderWhere.created_at.lte = filters.dateTo;
    }

    // Get all orders with customer data
    const orders = await this.prisma.order.findMany({
      where: orderWhere,
      include: {
        order_items: true,
      },
      orderBy: { created_at: 'desc' },
    });

    // Process customer data
    const customerMap = new Map<string, Customer>();

    orders.forEach(order => {
      const email = order.customer_email;
      if (!email) return;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          phone: order.customer_phone || undefined,
          firstName: order.billing_first_name || undefined,
          lastName: order.billing_last_name || undefined,
          fullName: `${order.billing_first_name || ''} ${order.billing_last_name || ''}`.trim(),
          city: order.billing_city || undefined,
          country: order.billing_country || undefined,
          userId: order.user_id || undefined,
          orders: [],
          totalSpent: 0,
          totalOrders: 0,
          avgOrderValue: 0,
          segment: 'New',
          customerLifetimeValue: 0,
          daysSinceFirstOrder: 0,
          daysSinceLastOrder: 0,
          isActive: false,
          firstOrderDate: order.created_at?.toISOString() || '',
          lastOrderDate: order.created_at?.toISOString() || '',
          statusCounts: {},
          monthlySpending: {},
        });
      }

      const customer = customerMap.get(email)!;
      customer.orders.push({
        id: order.id,
        orderNumber: order.order_number || '',
        date: order.created_at?.toISOString() || '',
        status: order.status || 'unknown',
        paymentStatus: order.payment_status || 'unknown',
        total: Number(order.total) || 0,
        currency: order.currency || 'INR',
        itemCount: order.order_items?.length || 0,
        items: order.order_items || [],
      });

      customer.totalSpent += Number(order.total) || 0;
      customer.totalOrders += 1;

      // Update date ranges
      if (order.created_at) {
        const orderDate = order.created_at.toISOString();
        if (!customer.firstOrderDate || orderDate < customer.firstOrderDate) {
          customer.firstOrderDate = orderDate;
        }
        if (!customer.lastOrderDate || orderDate > customer.lastOrderDate) {
          customer.lastOrderDate = orderDate;
        }
      }

      // Update status counts
      const status = order.status || 'unknown';
      customer.statusCounts[status] = (customer.statusCounts[status] || 0) + 1;
    });

    // Convert to array and apply additional filters
    let customers = Array.from(customerMap.values()).map((customer) => {
      // Calculate derived fields
      customer.avgOrderValue = customer.totalOrders > 0 ? customer.totalSpent / customer.totalOrders : 0;
      
      // Calculate days since orders
      const now = new Date();
      customer.daysSinceFirstOrder = customer.firstOrderDate ? 
        Math.floor((now.getTime() - new Date(customer.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      customer.daysSinceLastOrder = customer.lastOrderDate ? 
        Math.floor((now.getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
      
      // Determine if active (ordered in last 90 days)
      customer.isActive = customer.daysSinceLastOrder <= 90;
      
      // Calculate CLV (simplified)
      customer.customerLifetimeValue = customer.totalSpent;
      
      // Determine segment
      if (customer.totalSpent >= 10000) {
        customer.segment = 'VIP';
      } else if (customer.totalSpent >= 5000) {
        customer.segment = 'Premium';
      } else if (customer.totalSpent >= 1000) {
        customer.segment = 'Regular';
      } else {
        customer.segment = 'New';
      }

      return customer;
    });

    // Apply filters
    if (filters.email) {
      customers = customers.filter(c => c.email.toLowerCase().includes(filters.email!.toLowerCase()));
    }
    if (filters.phone) {
      customers = customers.filter(c => c.phone?.includes(filters.phone!));
    }
    if (filters.city) {
      customers = customers.filter(c => c.city?.toLowerCase().includes(filters.city!.toLowerCase()));
    }
    if (filters.country) {
      customers = customers.filter(c => c.country?.toLowerCase().includes(filters.country!.toLowerCase()));
    }
    if (filters.segment) {
      customers = customers.filter(c => c.segment === filters.segment);
    }
    if (filters.isActive !== undefined) {
      customers = customers.filter(c => c.isActive === filters.isActive);
    }
    if (filters.minTotalSpent !== undefined) {
      customers = customers.filter(c => c.totalSpent >= filters.minTotalSpent!);
    }
    if (filters.maxTotalSpent !== undefined) {
      customers = customers.filter(c => c.totalSpent <= filters.maxTotalSpent!);
    }
    if (filters.minOrders !== undefined) {
      customers = customers.filter(c => c.totalOrders >= filters.minOrders!);
    }
    if (filters.maxOrders !== undefined) {
      customers = customers.filter(c => c.totalOrders <= filters.maxOrders!);
    }

    // Apply pagination
    const total = customers.length;
    const paginatedCustomers = customers.slice(skip, skip + limit);

    return {
      data: paginatedCustomers,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async findByEmail(email: string): Promise<CustomerDetails | null> {
    // Get customer basic data
    const customersResult = await this.findMany({ email });
    if (customersResult.data.length === 0) {
      return null;
    }

    const customer = customersResult.data[0];

    // Get detailed order information
    const orders = await this.prisma.order.findMany({
      where: { customer_email: email },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Get billing and shipping addresses from latest order
    const latestOrder = orders[0];
    const billingAddress = {
      firstName: latestOrder?.billing_first_name || undefined,
      lastName: latestOrder?.billing_last_name || undefined,
      company: latestOrder?.billing_company || undefined,
      address1: latestOrder?.billing_address1 || undefined,
      address2: latestOrder?.billing_address2 || undefined,
      city: latestOrder?.billing_city || undefined,
      state: latestOrder?.billing_state || undefined,
      postcode: latestOrder?.billing_postcode || undefined,
      country: latestOrder?.billing_country || undefined,
    };

    const shippingAddress = {
      firstName: latestOrder?.shipping_first_name || undefined,
      lastName: latestOrder?.shipping_last_name || undefined,
      company: latestOrder?.shipping_company || undefined,
      address1: latestOrder?.shipping_address1 || undefined,
      address2: latestOrder?.shipping_address2 || undefined,
      city: latestOrder?.shipping_city || undefined,
      state: latestOrder?.shipping_state || undefined,
      postcode: latestOrder?.shipping_postcode || undefined,
      country: latestOrder?.shipping_country || undefined,
    };

    // Calculate top products
    const productMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        const productName = item.product_name || 'Unknown Product';
        if (!productMap.has(productName)) {
          productMap.set(productName, { name: productName, quantity: 0, revenue: 0 });
        }
        const product = productMap.get(productName)!;
        product.quantity += item.quantity;
        product.revenue += Number(item.price) * item.quantity;
      });
    });

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Calculate monthly spending
    const monthlySpending: Record<string, number> = {};
    orders.forEach(order => {
      if (order.created_at) {
        const month = order.created_at.toISOString().substring(0, 7); // YYYY-MM
        monthlySpending[month] = (monthlySpending[month] || 0) + Number(order.total);
      }
    });

    // Create activity log
    const activityLog = orders.map(order => ({
      id: order.id,
      date: order.created_at?.toISOString() || '',
      action: 'order_placed',
      description: `Order ${order.order_number} placed`,
      orderId: order.id,
    }));

    return {
      ...customer,
      billingAddress,
      shippingAddress,
      topProducts,
      monthlySpending,
      activityLog,
    };
  }

  async getCustomerStats(): Promise<{
    totalCustomers: number;
    activeCustomers: number;
    averageOrderValue: number;
    totalRevenue: number;
    segmentBreakdown: Record<string, number>;
  }> {
    const customersResult = await this.findMany();
    const customers = customersResult.data;

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageOrderValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    const segmentBreakdown = customers.reduce((acc, customer) => {
      acc[customer.segment] = (acc[customer.segment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalCustomers,
      activeCustomers,
      averageOrderValue,
      totalRevenue,
      segmentBreakdown,
    };
  }

  async getCustomersBySegment(segment: string, options: FindManyOptions = {}): Promise<PaginatedResult<Customer>> {
    return await this.findMany({ segment }, options);
  }

  async getTopCustomers(limit: number = 10): Promise<Customer[]> {
    const result = await this.findMany({}, { limit, sortBy: 'totalSpent', sortOrder: 'desc' });
    return result.data;
  }

  async searchCustomers(query: string, options: FindManyOptions = {}): Promise<PaginatedResult<Customer>> {
    // Search by email, name, or phone
    const result = await this.findMany({}, options);
    const filteredCustomers = result.data.filter(customer => 
      customer.email.toLowerCase().includes(query.toLowerCase()) ||
      customer.fullName.toLowerCase().includes(query.toLowerCase()) ||
      customer.phone?.includes(query)
    );

    return {
      data: filteredCustomers,
      pagination: result.pagination,
    };
  }

  private buildPaginationOptions(options: FindManyOptions = {}) {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(100, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  }

  private buildPaginationMeta(page: number, limit: number, total: number) {
    const totalPages = Math.ceil(total / limit);
    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
  }
}

// Export singleton instance
export const customerRepository = new CustomerRepository(new PrismaClient());

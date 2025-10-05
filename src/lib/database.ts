import { prisma } from './db';
import bcrypt from 'bcryptjs';

// Generic database service to replace Supabase
export class DatabaseService {
  // User operations
  static async createUser(userData: {
    name: string;
    email: string;
    password: string;
    image?: string;
  }) {
    const hashedPassword = await bcrypt.hash(userData.password, 12);
    
    return await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
        image: userData.image,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  static async findUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  static async findUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        email_verified: true,
        created_at: true,
        updated_at: true,
      },
    });
  }

  // Product operations
  static async getProducts(filters: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    inStock?: boolean;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      category,
      inStock,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    if (category) {
      where.product_categories = {
        some: {
          categories: {
            slug: category,
          },
        },
      };
    }

    if (inStock !== undefined) {
      where.in_stock = inStock;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product_categories: {
            include: {
              categories: true,
            },
          },
          variants: true,
          reviews: {
            select: {
              rating: true,
            },
          },
        },
      }),
      prisma.product.count({ where }),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getProductById(id: string) {
    return await prisma.product.findUnique({
      where: { id },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
        reviews: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async getProductBySlug(slug: string) {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        variants: true,
        reviews: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Order operations
  static async createOrder(orderData: {
    user_id?: string;
    customer_email: string;
    customer_phone?: string;
    billing_first_name?: string;
    billing_last_name?: string;
    billing_company?: string;
    billing_address1?: string;
    billing_address2?: string;
    billing_city?: string;
    billing_state?: string;
    billing_postcode?: string;
    billing_country?: string;
    shipping_first_name?: string;
    shipping_last_name?: string;
    shipping_company?: string;
    shipping_address1?: string;
    shipping_address2?: string;
    shipping_city?: string;
    shipping_state?: string;
    shipping_postcode?: string;
    shipping_country?: string;
    total: number;
    subtotal?: number;
    tax_amount?: number;
    shipping_cost?: number;
    discount_amount?: number;
    currency?: string;
    payment_method?: string;
    payment_method_title?: string;
    transaction_id?: string;
    razorpay_order_id?: string;
    razorpay_payment_id?: string;
    razorpay_signature?: string;
    items: Array<{
      product_id: string;
      quantity: number;
      price: number;
      variant_id?: string;
      product_name?: string;
      product_sku?: string;
      variant_name?: string;
      unit_price?: number;
      total_price?: number;
      attributes?: any;
      product_image?: string;
    }>;
  }) {
    const { items, ...orderInfo } = orderData;

    return await prisma.order.create({
      data: {
        ...orderInfo,
        order_number: `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        order_items: {
          create: items,
        },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });
  }

  static async getOrders(filters: {
    page?: number;
    limit?: number;
    status?: string;
    user_id?: string;
    customer_email?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      user_id,
      customer_email,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (user_id) where.user_id = user_id;
    if (customer_email) where.customer_email = customer_email;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          order_items: {
            include: {
              products: true,
            },
          },
          users: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return {
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getOrderById(id: string) {
    return await prisma.order.findUnique({
      where: { id },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
        users: {
          select: {
            name: true,
            email: true,
          },
        },
        statusHistory: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  static async updateOrderStatus(id: string, status: string, notes?: string, changedBy?: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.update({
        where: { id },
        data: { status, updated_at: new Date() },
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: id,
          status,
          notes,
          changed_by: changedBy,
        },
      });

      return order;
    });
  }

  // Customer operations (derived from orders)
  static async getCustomers(filters: {
    page?: number;
    limit?: number;
    search?: string;
    segment?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 20,
      search,
      segment,
      sortBy = 'lastOrderDate',
      sortOrder = 'desc',
    } = filters;

    // Get all orders with customer data
    const where: any = {
      customer_email: { not: null },
    };

    if (search) {
      where.OR = [
        { customer_email: { contains: search, mode: 'insensitive' } },
        { billing_first_name: { contains: search, mode: 'insensitive' } },
        { billing_last_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        customer_email: true,
        customer_phone: true,
        billing_first_name: true,
        billing_last_name: true,
        billing_city: true,
        billing_country: true,
        created_at: true,
        total: true,
        status: true,
        user_id: true,
        id: true,
      },
    });

    // Group and process customer data
    const customerMap = new Map();

    orders.forEach((order) => {
      const email = order.customer_email;
      if (!email) return;

      if (!customerMap.has(email)) {
        customerMap.set(email, {
          email,
          phone: order.customer_phone,
          firstName: order.billing_first_name,
          lastName: order.billing_last_name,
          city: order.billing_city,
          country: order.billing_country,
          userId: order.user_id,
          orders: [],
          totalSpent: 0,
          totalOrders: 0,
          firstOrderDate: order.created_at,
          lastOrderDate: order.created_at,
          status: 'active',
        });
      }

      const customer = customerMap.get(email);
      customer.orders.push({
        id: order.id,
        date: order.created_at,
        total: order.total,
        status: order.status,
      });

      customer.totalSpent += Number(order.total) || 0;
      customer.totalOrders += 1;

      // Update date ranges
      if (new Date(order.created_at) < new Date(customer.firstOrderDate)) {
        customer.firstOrderDate = order.created_at;
      }
      if (new Date(order.created_at) > new Date(customer.lastOrderDate)) {
        customer.lastOrderDate = order.created_at;
      }
    });

    // Convert to array and add segmentation
    let customers = Array.from(customerMap.values()).map((customer) => {
      const daysSinceFirstOrder = Math.floor(
        (new Date().getTime() - new Date(customer.firstOrderDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const daysSinceLastOrder = Math.floor(
        (new Date().getTime() - new Date(customer.lastOrderDate).getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate customer segment
      let customerSegment = 'New';
      if (customer.totalSpent >= 10000) {
        customerSegment = 'VIP';
      } else if (customer.totalOrders >= 3 && customer.totalSpent >= 2000) {
        customerSegment = 'Loyal';
      } else if (customer.totalSpent >= 5000) {
        customerSegment = 'High-Spending';
      } else if (customer.totalOrders >= 2) {
        customerSegment = 'Regular';
      }

      // Customer lifetime value (simple calculation)
      const avgOrderValue = customer.totalSpent / customer.totalOrders;
      const customerLifetimeValue = avgOrderValue * 2.5; // Simple CLV estimate

      return {
        ...customer,
        segment: customerSegment,
        avgOrderValue,
        customerLifetimeValue,
        daysSinceFirstOrder,
        daysSinceLastOrder,
        isActive: daysSinceLastOrder <= 180, // Active if ordered in last 6 months
        fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown',
      };
    });

    // Apply segment filter
    if (segment) {
      customers = customers.filter((customer) => customer.segment.toLowerCase() === segment.toLowerCase());
    }

    // Apply sorting
    customers.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'fullName') {
        aValue = a.fullName.toLowerCase();
        bValue = b.fullName.toLowerCase();
      }

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });

    // Calculate pagination
    const total = customers.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedCustomers = customers.slice(offset, offset + limit);

    // Calculate summary statistics
    const stats = {
      totalCustomers: total,
      newCustomers: customers.filter((c) => c.segment === 'New').length,
      loyalCustomers: customers.filter((c) => c.segment === 'Loyal').length,
      vipCustomers: customers.filter((c) => c.segment === 'VIP').length,
      avgCustomerValue: total > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / total : 0,
      activeCustomers: customers.filter((c) => c.isActive).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
    };

    return {
      customers: paginatedCustomers,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      stats,
    };
  }

  // Returns operations
  static async getReturns(filters: {
    page?: number;
    limit?: number;
    status?: string;
    orderId?: string;
    customerEmail?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      orderId,
      customerEmail,
      sortBy = 'created_at',
      sortOrder = 'desc',
    } = filters;

    const skip = (page - 1) * limit;
    const where: any = {};

    if (status) where.status = status;
    if (orderId) where.order_id = orderId;
    if (customerEmail) where.customer_email = customerEmail;

    const [returns, total] = await Promise.all([
      prisma.returns.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          return_items: {
            include: {
              products: true,
              order_items: true,
            },
          },
          orders: true,
          return_status_history: {
            include: {
              users: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      }),
      prisma.returns.count({ where }),
    ]);

    return {
      returns,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1,
    };
  }

  static async createReturn(returnData: {
    order_id: string;
    customer_email: string;
    customer_phone?: string;
    return_reason: string;
    return_description?: string;
    return_type?: string;
    refund_amount?: number;
    images?: string[];
    videos?: string[];
    items: Array<{
      order_item_id: string;
      product_id: string;
      product_name: string;
      quantity_returned: number;
      unit_price: number;
      total_refund_amount: number;
      restockable?: boolean;
    }>;
  }) {
    const { items, ...returnInfo } = returnData;

    // Generate return number
    const returnNumber = `RET-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    return await prisma.$transaction(async (tx) => {
      const newReturn = await tx.returns.create({
        data: {
          ...returnInfo,
          return_number: returnNumber,
          status: 'pending',
          requested_at: new Date(),
        },
      });

      await tx.return_items.createMany({
        data: items.map((item) => ({
          ...item,
          return_id: newReturn.id,
          restockable: item.restockable ?? true,
        })),
      });

      return newReturn;
    });
  }

  static async getReturnById(id: string) {
    return await prisma.returns.findUnique({
      where: { id },
      include: {
        return_items: {
          include: {
            products: true,
            order_items: true,
          },
        },
        orders: true,
        return_status_history: {
          include: {
            users: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });
  }

  // Wishlist operations
  static async addToWishlist(userId: string, productId: string) {
    return await prisma.wishlistItem.create({
      data: {
        user_id: userId,
        product_id: productId,
      },
      include: {
        products: true,
      },
    });
  }

  static async removeFromWishlist(userId: string, productId: string) {
    return await prisma.wishlistItem.delete({
      where: {
        user_id_product_id: {
          user_id: userId,
          product_id: productId,
        },
      },
    });
  }

  static async getUserWishlist(userId: string) {
    return await prisma.wishlistItem.findMany({
      where: { user_id: userId },
      include: {
        products: {
          include: {
            product_categories: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
    });
  }

  // Review operations
  static async createReview(reviewData: {
    user_id: string;
    product_id: string;
    rating: number;
    comment?: string;
  }) {
    return await prisma.review.create({
      data: reviewData,
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });
  }

  static async getProductReviews(productId: string) {
    return await prisma.review.findMany({
      where: { product_id: productId },
      include: {
        users: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  // Category operations
  static async getCategories() {
    return await prisma.category.findMany({
      where: { is_visible: true },
      orderBy: { display_order: 'asc' },
      include: {
        children: {
          where: { is_visible: true },
          orderBy: { display_order: 'asc' },
        },
      },
    });
  }

  static async getCategoryBySlug(slug: string) {
    return await prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { is_visible: true },
          orderBy: { display_order: 'asc' },
        },
        product_categories: {
          include: {
            products: {
              where: { status: 'published' },
              include: {
                product_categories: {
                  include: {
                    categories: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  // Marketing operations
  static async getBanners(filters: {
    position?: string;
    isActive?: boolean;
  } = {}) {
    const { position, isActive = true } = filters;
    const where: any = {};

    if (isActive) where.is_active = true;
    if (position) where.position = position;

    return await prisma.banners.findMany({
      where,
      orderBy: { priority: 'desc' },
    });
  }

  static async getCoupons(filters: {
    isActive?: boolean;
    code?: string;
  } = {}) {
    const { isActive = true, code } = filters;
    const where: any = {};

    if (isActive) where.is_active = true;
    if (code) where.code = code;

    return await prisma.coupon.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
  }

  // Product recommendations
  static async getProductRecommendations(productId: string, limit: number = 5) {
    const recommendations = await prisma.productRecommendation.findMany({
      where: { product_id: productId },
      include: {
        products_product_recommendations_recommended_product_idToproducts: {
          include: {
            product_categories: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return recommendations.map((rec) => rec.products_product_recommendations_recommended_product_idToproducts);
  }

  static async getPersonalizedRecommendations(userId: string, limit: number = 10) {
    // Get user's purchase history
    const userOrders = await prisma.order.findMany({
      where: {
        user_id: userId,
        status: { in: ['delivered', 'shipped'] },
      },
      include: {
        order_items: {
          include: {
            products: true,
          },
        },
      },
    });

    // Get user's wishlist
    const userWishlist = await prisma.wishlistItem.findMany({
      where: { user_id: userId },
      include: {
        products: true,
      },
    });

    // Get user's reviews
    const userReviews = await prisma.review.findMany({
      where: {
        user_id: userId,
        rating: { gte: 4 },
      },
      include: {
        products: true,
      },
    });

    // Collect all product IDs from user's history
    const purchasedProductIds = userOrders.flatMap((order) =>
      order.order_items.map((item) => item.product_id).filter(Boolean)
    );
    const wishlistProductIds = userWishlist.map((item) => item.product_id).filter(Boolean);
    const reviewedProductIds = userReviews.map((review) => review.product_id).filter(Boolean);

    const allUserProductIds = [...purchasedProductIds, ...wishlistProductIds, ...reviewedProductIds];

    if (allUserProductIds.length === 0) {
      // If no user history, return popular products
      return this.getPopularProducts(limit);
    }

    // Get recommendations based on user's products
    const recommendations = await prisma.productRecommendation.findMany({
      where: {
        product_id: { in: allUserProductIds },
        recommended_product_id: { notIn: allUserProductIds },
      },
      include: {
        products_product_recommendations_recommended_product_idToproducts: {
          include: {
            product_categories: {
              include: {
                categories: true,
              },
            },
          },
        },
      },
      orderBy: { score: 'desc' },
      take: limit,
    });

    return recommendations.map((rec) => rec.products_product_recommendations_recommended_product_idToproducts);
  }

  static async getPopularProducts(limit: number = 10) {
    // Get products with most orders
    const popularProducts = await prisma.product.findMany({
      include: {
        product_categories: {
          include: {
            categories: true,
          },
        },
        order_items: {
          select: {
            id: true,
          },
        },
        reviews: {
          select: {
            id: true,
          },
        },
      },
      orderBy: [
        {
          order_items: {
            _count: 'desc',
          },
        },
        {
          reviews: {
            _count: 'desc',
          },
        },
      ],
      take: limit,
    });

    return popularProducts;
  }

  // Newsletter operations
  static async subscribeToNewsletter(email: string, firstName?: string, lastName?: string) {
    return await prisma.newsletter_subscribers.upsert({
      where: { email },
      update: {
        is_active: true,
        first_name: firstName,
        last_name: lastName,
        subscribed_at: new Date(),
        unsubscribed_at: null,
      },
      create: {
        email,
        first_name: firstName,
        last_name: lastName,
        is_active: true,
        subscribed_at: new Date(),
      },
    });
  }

  static async unsubscribeFromNewsletter(email: string) {
    return await prisma.newsletter_subscribers.update({
      where: { email },
      data: {
        is_active: false,
        unsubscribed_at: new Date(),
      },
    });
  }
}

export default DatabaseService;

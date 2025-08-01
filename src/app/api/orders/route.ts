import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Helper function to generate order number
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Get today's order count
  const todayOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999))
      }
    }
  });
  
  const counter = todayOrders + 1;
  let orderNumber = `ORD-${dateStr}-${counter.toString().padStart(4, '0')}`;
  
  // Ensure uniqueness
  while (await prisma.order.findUnique({ where: { orderNumber } })) {
    const nextCounter = counter + Math.floor(Math.random() * 1000);
    orderNumber = `ORD-${dateStr}-${nextCounter.toString().padStart(4, '0')}`;
  }
  
  return orderNumber;
}

// GET /api/orders - List orders (admin view or user's own orders)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100);
    const status = searchParams.get('status');
    const paymentStatus = searchParams.get('paymentStatus');
    const userId = searchParams.get('userId');
    const search = searchParams.get('search'); // Search by order number or customer email
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    // For non-admin users, only show their own orders
    if (!session?.user?.id && !userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // If user is requesting their own orders or is admin
    if (userId && session?.user?.id !== userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    if (session?.user?.id) {
      whereConditions.userId = session.user.id;
    }

    // Status filters
    if (status) {
      whereConditions.status = status;
    }

    if (paymentStatus) {
      whereConditions.paymentStatus = paymentStatus;
    }

    // Search functionality
    if (search) {
      whereConditions.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { billingFirstName: { contains: search, mode: 'insensitive' } },
        { billingLastName: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      whereConditions.createdAt = {};
      if (fromDate) whereConditions.createdAt.gte = new Date(fromDate);
      if (toDate) whereConditions.createdAt.lte = new Date(toDate);
    }

    // Execute queries
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereConditions,
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  featuredImage: true
                }
              }
            }
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      }),
      prisma.order.count({ where: whereConditions })
    ]);

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNextPage,
        hasPrevPage
      }
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validate required fields
    const {
      items,
      customerEmail,
      billingFirstName,
      billingLastName,
      billingAddress1,
      billingCity,
      billingPostcode,
      billingCountry,
      paymentMethod = 'razorpay'
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order items are required'
      }, { status: 400 });
    }

    if (!customerEmail || !billingFirstName || !billingLastName || !billingAddress1) {
      return NextResponse.json({
        success: false,
        error: 'Customer and billing information is required'
      }, { status: 400 });
    }

    // Validate and calculate order totals
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: item.variantId ? {
            where: { id: item.variantId }
          } : false
        }
      });

      if (!product) {
        return NextResponse.json({
          success: false,
          error: `Product not found: ${item.productId}`
        }, { status: 400 });
      }

      // Check stock availability
      const availableStock = item.variantId 
        ? product.variants?.[0]?.stockQuantity || 0
        : product.stockQuantity;

      if (availableStock < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
        }, { status: 400 });
      }

      // Calculate pricing
      const unitPrice = item.variantId 
        ? (product.variants?.[0]?.salePrice || product.variants?.[0]?.price || product.price)
        : (product.salePrice || product.price);

      const totalPrice = unitPrice * item.quantity;
      subtotal += totalPrice;

      validatedItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        productName: product.name,
        productSku: item.variantId ? product.variants?.[0]?.sku : product.sku,
        variantName: item.variantId ? product.variants?.[0]?.name : null,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        attributes: item.variantId ? product.variants?.[0]?.attributes : null,
        productImage: product.featuredImage || product.images[0] || null
      });
    }

    // Calculate shipping and taxes (placeholder logic)
    const shippingCost = body.shippingCost || 0;
    const taxAmount = body.taxAmount || Math.round(subtotal * 0.18); // 18% GST
    const discountAmount = body.discountAmount || 0;
    const total = subtotal + shippingCost + taxAmount - discountAmount;

    // Generate order number
    const orderNumber = await generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: session?.user?.id || null,
        status: 'pending',
        paymentStatus: 'pending',
        customerEmail,
        customerPhone: body.customerPhone,
        
        // Billing address
        billingFirstName,
        billingLastName,
        billingCompany: body.billingCompany,
        billingAddress1,
        billingAddress2: body.billingAddress2,
        billingCity,
        billingState: body.billingState,
        billingPostcode,
        billingCountry,
        
        // Shipping address (copy from billing if not provided)
        shippingFirstName: body.shippingFirstName || billingFirstName,
        shippingLastName: body.shippingLastName || billingLastName,
        shippingCompany: body.shippingCompany || body.billingCompany,
        shippingAddress1: body.shippingAddress1 || billingAddress1,
        shippingAddress2: body.shippingAddress2 || body.billingAddress2,
        shippingCity: body.shippingCity || billingCity,
        shippingState: body.shippingState || body.billingState,
        shippingPostcode: body.shippingPostcode || billingPostcode,
        shippingCountry: body.shippingCountry || billingCountry,
        
        // Financial details
        subtotal,
        taxAmount,
        shippingCost,
        discountAmount,
        total,
        currency: body.currency || 'INR',
        
        // Payment details
        paymentMethod,
        paymentMethodTitle: body.paymentMethodTitle || 'Razorpay',
        
        // Shipping details
        shippingMethod: body.shippingMethod,
        shippingMethodTitle: body.shippingMethodTitle,
        
        // Notes
        customerNotes: body.customerNotes,
        sourceChannel: 'website',
        
        // Order items
        items: {
          create: validatedItems
        }
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    // Send order confirmation email
    try {
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'order_confirmation',
          recipient: customerEmail,
          orderId: order.id,
          userId: order.userId,
          data: {
            userName: `${billingFirstName} ${billingLastName}`.trim()
          }
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send order confirmation email:', await emailResponse.text());
      } else {
        console.log('Order confirmation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the order creation if email fails
    }

    return NextResponse.json({
      success: true,
      data: order,
      message: 'Order created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to create order'
    }, { status: 500 });
  }
}
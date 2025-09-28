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
      created_at: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999))
      }
    }
  });
  
  const counter = todayOrders + 1;
  let order_number = `ORD-${dateStr}-${counter.toString().padStart(4, '0')}`;
  
  // Ensure uniqueness
  while (await prisma.order.findUnique({ where: { order_number } })) {
    const nextCounter = counter + Math.floor(Math.random() * 1000);
    order_number = `ORD-${dateStr}-${nextCounter.toString().padStart(4, '0')}`;
  }
  
  return order_number;
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
    const payment_status = searchParams.get('payment_status');
    const user_id = searchParams.get('user_id');
    const search = searchParams.get('search'); // Search by order number or customer email
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};

    // For non-admin users, only show their own orders
    if (!session?.user?.id && !user_id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // If user is requesting their own orders or is admin
    if (user_id && session?.user?.id !== user_id) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    if (session?.user?.id) {
      whereConditions.user_id = session.user.id;
    }

    // Status filters
    if (status) {
      whereConditions.status = status;
    }

    if (payment_status) {
      whereConditions.payment_status = payment_status;
    }

    // Search functionality
    if (search) {
      whereConditions.OR = [
        { order_number: { contains: search, mode: 'insensitive' } },
        { customer_email: { contains: search, mode: 'insensitive' } },
        { billing_first_name: { contains: search, mode: 'insensitive' } },
        { billing_last_name: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Date range filter
    if (fromDate || toDate) {
      whereConditions.created_at = {};
      if (fromDate) whereConditions.created_at.gte = new Date(fromDate);
      if (toDate) whereConditions.created_at.lte = new Date(toDate);
    }

    // Execute queries
    const [orders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where: whereConditions,
        include: {
          order_items: {
            include: {
              products: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                  images: true,
                  featured_image: true
                }
              }
            }
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          statusHistory: {
            orderBy: { created_at: 'desc' },
            take: 5
          }
        },
        orderBy: { created_at: 'desc' },
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
      customer_email,
      billing_first_name,
      billing_last_name,
      billing_address1,
      billing_city,
      billing_postcode,
      billing_country,
      payment_method = 'razorpay'
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Order items are required'
      }, { status: 400 });
    }

    if (!customer_email || !billing_first_name || !billing_last_name || !billing_address1) {
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
        ? product.variants?.[0]?.stock_quantity || 0
        : (product.stock_quantity || 0);

      if ((availableStock || 0) < item.quantity) {
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${availableStock}, Requested: ${item.quantity}`
        }, { status: 400 });
      }

      // Calculate pricing
      const unitPrice = item.variantId 
        ? (product.variants?.[0]?.sale_price || product.variants?.[0]?.price || product.price)
        : (product.sale_price || product.price);

      const totalPrice = Number(unitPrice) * item.quantity;
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
        productImage: product.featured_image || product.images[0] || null
      });
    }

    // Calculate shipping and taxes (placeholder logic)
    const shipping_cost = body.shipping_cost || 0;
    const tax_amount = body.tax_amount || Math.round(subtotal * 0.18); // 18% GST
    const discount_amount = body.discount_amount || 0;
    const total = subtotal + shipping_cost + tax_amount - discount_amount;

    // Generate order number
    const order_number = await generateOrderNumber();

    // Create order
    const order = await prisma.order.create({
      data: {
        order_number,
        user_id: session?.user?.id || null,
        status: 'pending',
        payment_status: 'pending',
        customer_email,
        customer_phone: body.customer_phone,
        
        // Billing address
        billing_first_name,
        billing_last_name,
        billing_company: body.billing_company,
        billing_address1,
        billing_address2: body.billing_address2,
        billing_city,
        billing_state: body.billing_state,
        billing_postcode,
        billing_country,
        
        // Shipping address (copy from billing if not provided)
        shipping_first_name: body.shipping_first_name || billing_first_name,
        shipping_last_name: body.shipping_last_name || billing_last_name,
        shipping_company: body.shipping_company || body.billing_company,
        shipping_address1: body.shipping_address1 || billing_address1,
        shipping_address2: body.shipping_address2 || body.billing_address2,
        shipping_city: body.shipping_city || billing_city,
        shipping_state: body.shipping_state || body.billing_state,
        shipping_postcode: body.shipping_postcode || billing_postcode,
        shipping_country: body.shipping_country || billing_country,
        
        // Financial details
        subtotal,
        tax_amount,
        shipping_cost,
        discount_amount,
        total,
        currency: body.currency || 'INR',
        
        // Payment details
        payment_method,
        payment_method_title: body.payment_methodTitle || 'Razorpay',
        
        // Shipping details
        shippingMethod: body.shippingMethod,
        shippingMethodTitle: body.shippingMethodTitle,
        
        // Notes
        customerNotes: body.customerNotes,
        sourceChannel: 'website',
        
        // Order items
        order_items: {
          create: validatedItems.map(item => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            productSku: item.productSku,
            variantName: item.variantName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            attributes: item.attributes,
            productImage: item.productImage
          })) as any
        }
      },
      include: {
        order_items: true,
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
          recipient: customer_email,
          orderId: order.id,
          user_id: order.user_id,
          data: {
            userName: `${billing_first_name} ${billing_last_name}`.trim()
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
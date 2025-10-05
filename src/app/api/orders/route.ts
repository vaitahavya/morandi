import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { container } from '@/container/Container';
import { OrderFilters, OrderStatus, PaymentStatus } from '@/interfaces/IOrderRepository';

// GET /api/orders - List orders (admin view or user's own orders)
export async function GET(request: NextRequest) {
  try {
    const orderService = container.getOrderService();
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const statusParam = searchParams.get('status');
    const paymentStatusParam = searchParams.get('payment_status');
    
    const filters: OrderFilters = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
      status: statusParam ? (statusParam as OrderStatus) : undefined,
      paymentStatus: paymentStatusParam ? (paymentStatusParam as PaymentStatus) : undefined,
      userId: searchParams.get('user_id') || undefined,
      search: searchParams.get('search') || undefined,
      fromDate: searchParams.get('fromDate') || undefined,
      toDate: searchParams.get('toDate') || undefined,
      sortBy: searchParams.get('sortBy') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc'
    };

    // For non-admin users, only show their own orders
    if (!session?.user?.id && !filters.userId) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 });
    }

    // If user is requesting their own orders or is admin
    if (filters.userId && session?.user?.id !== filters.userId) {
      return NextResponse.json({
        success: false,
        error: 'Access denied'
      }, { status: 403 });
    }

    if (session?.user?.id) {
      filters.userId = session.user.id;
    }

    const result = await orderService.getOrders(filters);

    return NextResponse.json({
      success: true,
      data: result.orders,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch orders'
    }, { status: 500 });
  }
}

// POST /api/orders - Create new order
export async function POST(request: NextRequest) {
  try {
    const orderService = container.getOrderService();
    const body = await request.json();

    // Validate required fields
    if (!body.customerEmail || !body.billingFirstName || !body.billingLastName || !body.items) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields'
      }, { status: 400 });
    }

    const order = await orderService.createOrder(body);

    return NextResponse.json({
      success: true,
      data: order
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create order'
    }, { status: 500 });
  }
}

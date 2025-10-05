import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { orderService } from '@/services';
import { OrderFilters, FindManyOptions } from '@/repositories';

// GET /api/orders - List orders (admin view or user's own orders)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const filters: OrderFilters = {
      status: searchParams.get('status') || undefined,
      paymentStatus: searchParams.get('payment_status') || undefined,
      userId: searchParams.get('user_id') || undefined,
      customerEmail: searchParams.get('customer_email') || undefined,
      orderNumber: searchParams.get('order_number') || undefined,
      dateFrom: searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined,
      dateTo: searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined,
      minTotal: searchParams.get('minTotal') ? parseFloat(searchParams.get('minTotal')!) : undefined,
      maxTotal: searchParams.get('maxTotal') ? parseFloat(searchParams.get('maxTotal')!) : undefined,
    };

    const options: FindManyOptions = {
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 100),
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

    const result = await orderService.getOrders(filters, options);

    return NextResponse.json({
      success: true,
      data: result.data,
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
    const body = await request.json();

    // Create order using service layer (includes all validation)
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

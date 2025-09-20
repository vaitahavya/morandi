import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const segment = searchParams.get('segment') || '';
    const sortBy = searchParams.get('sortBy') || 'lastOrderDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build the query for customer data
    let query = supabase
      .from('orders')
      .select(`
        customer_email,
        customer_phone,
        billing_first_name,
        billing_last_name,
        billing_city,
        billing_country,
        created_at,
        total,
        status,
        user_id,
        order_id
      `)
      .not('customer_email', 'is', null);

    // Apply search filter
    if (search) {
      query = query.or(`customer_email.ilike.%${search}%,billing_first_name.ilike.%${search}%,billing_last_name.ilike.%${search}%`);
    }

    const { data: orderData, error: orderError } = await query;
    
    if (orderError) {
      console.error('Error fetching customer orders:', orderError);
      return NextResponse.json({ success: false, error: 'Failed to fetch customer data' }, { status: 500 });
    }

    // Group and process customer data
    const customerMap = new Map();
    
    orderData?.forEach(order => {
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
          status: 'active'
        });
      }

      const customer = customerMap.get(email);
      customer.orders.push({
        id: order.order_id,
        date: order.created_at,
        total: order.total,
        status: order.status
      });
      
      customer.totalSpent += order.total || 0;
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
    let customers = Array.from(customerMap.values()).map(customer => {
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
        fullName: `${customer.firstName || ''} ${customer.lastName || ''}`.trim() || 'Unknown'
      };
    });

    // Apply segment filter
    if (segment) {
      customers = customers.filter(customer => customer.segment.toLowerCase() === segment.toLowerCase());
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
    const paginatedCustomers = customers.slice(offset, offset + limit);

    // Calculate summary statistics
    const stats = {
      totalCustomers: total,
      newCustomers: customers.filter(c => c.segment === 'New').length,
      loyalCustomers: customers.filter(c => c.segment === 'Loyal').length,
      vipCustomers: customers.filter(c => c.segment === 'VIP').length,
      avgCustomerValue: total > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / total : 0,
      activeCustomers: customers.filter(c => c.isActive).length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0)
    };

    return NextResponse.json({
      success: true,
      data: paginatedCustomers,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
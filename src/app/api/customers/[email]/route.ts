import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const supabase = createClient();
    const customerEmail = decodeURIComponent(params.email);

    // Fetch customer orders
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          quantity,
          unit_price,
          total_price
        )
      `)
      .eq('customer_email', customerEmail)
      .order('created_at', { ascending: false });

    if (ordersError) {
      console.error('Error fetching customer orders:', ordersError);
      return NextResponse.json({ success: false, error: 'Failed to fetch customer data' }, { status: 500 });
    }

    if (!orders || orders.length === 0) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // Fetch order status history for activity log
    const orderIds = orders.map(order => order.id);
    const { data: statusHistory, error: historyError } = await supabase
      .from('order_status_history')
      .select('*')
      .in('order_id', orderIds)
      .order('created_at', { ascending: false })
      .limit(20);

    if (historyError) {
      console.error('Error fetching order history:', historyError);
    }

    // Process customer data
    const firstOrder = orders[orders.length - 1];
    const lastOrder = orders[0];
    
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalSpent / totalOrders;

    // Calculate segments and metrics
    let segment = 'New';
    if (totalSpent >= 10000) {
      segment = 'VIP';
    } else if (totalOrders >= 3 && totalSpent >= 2000) {
      segment = 'Loyal';
    } else if (totalSpent >= 5000) {
      segment = 'High-Spending';
    } else if (totalOrders >= 2) {
      segment = 'Regular';
    }

    const daysSinceFirstOrder = Math.floor(
      (new Date().getTime() - new Date(firstOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const daysSinceLastOrder = Math.floor(
      (new Date().getTime() - new Date(lastOrder.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate order frequency
    const orderFrequency = daysSinceFirstOrder > 0 ? totalOrders / (daysSinceFirstOrder / 30) : 0; // orders per month

    // Top purchased products
    const productCounts = new Map();
    orders.forEach(order => {
      order.order_items?.forEach(item => {
        const productKey = item.product_name || `Product ${item.product_id}`;
        const existing = productCounts.get(productKey) || { name: productKey, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.total_price || (item.unit_price * item.quantity);
        productCounts.set(productKey, existing);
      });
    });

    const topProducts = Array.from(productCounts.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Order status distribution
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Monthly spending pattern
    const monthlySpending = orders.reduce((acc, order) => {
      const month = new Date(order.created_at).toISOString().substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + (order.total || 0);
      return acc;
    }, {} as Record<string, number>);

    const customer = {
      email: customerEmail,
      phone: firstOrder.customer_phone,
      firstName: firstOrder.billing_first_name,
      lastName: firstOrder.billing_last_name,
      fullName: `${firstOrder.billing_first_name || ''} ${firstOrder.billing_last_name || ''}`.trim() || 'Unknown',
      userId: firstOrder.user_id,
      
      // Address info (from most recent order)
      billingAddress: {
        firstName: lastOrder.billing_first_name,
        lastName: lastOrder.billing_last_name,
        company: lastOrder.billing_company,
        address1: lastOrder.billing_address1,
        address2: lastOrder.billing_address2,
        city: lastOrder.billing_city,
        state: lastOrder.billing_state,
        postcode: lastOrder.billing_postcode,
        country: lastOrder.billing_country
      },
      
      shippingAddress: lastOrder.shipping_address1 ? {
        firstName: lastOrder.shipping_first_name,
        lastName: lastOrder.shipping_last_name,
        company: lastOrder.shipping_company,
        address1: lastOrder.shipping_address1,
        address2: lastOrder.shipping_address2,
        city: lastOrder.shipping_city,
        state: lastOrder.shipping_state,
        postcode: lastOrder.shipping_postcode,
        country: lastOrder.shipping_country
      } : null,

      // Metrics
      totalSpent,
      totalOrders,
      avgOrderValue,
      segment,
      customerLifetimeValue: avgOrderValue * 2.5,
      daysSinceFirstOrder,
      daysSinceLastOrder,
      orderFrequency,
      isActive: daysSinceLastOrder <= 180,
      
      // Dates
      firstOrderDate: firstOrder.created_at,
      lastOrderDate: lastOrder.created_at,
      joinDate: firstOrder.created_at, // Assuming first order date as join date

      // Analytics
      topProducts,
      statusCounts,
      monthlySpending,
      
      // Complete order history
      orders: orders.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        status: order.status,
        paymentStatus: order.payment_status,
        total: order.total,
        currency: order.currency,
        itemCount: order.order_items?.length || 0,
        items: order.order_items
      })),

      // Activity log from order status history
      activityLog: (statusHistory || []).map(activity => ({
        id: activity.id,
        date: activity.created_at,
        action: activity.status,
        description: activity.notes,
        orderId: activity.order_id
      }))
    };

    return NextResponse.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error in customer detail API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
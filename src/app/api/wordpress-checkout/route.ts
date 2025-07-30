import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Get WordPress site URL from environment
    const wordpressUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '') || '';
    
    if (!wordpressUrl) {
      return NextResponse.json({ error: 'WordPress URL not configured' }, { status: 500 });
    }

    // Create checkout URL with order ID
    const checkoutUrl = `${wordpressUrl}/checkout/?order_id=${orderId}`;

    return NextResponse.json({ 
      success: true, 
      checkoutUrl,
      message: 'Redirecting to WordPress checkout...'
    });

  } catch (error) {
    console.error('Error creating checkout URL:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
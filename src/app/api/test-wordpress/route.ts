import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/lib/wordpress-api';

export async function GET() {
  try {
    // Test WordPress API connection
    const response = await wordpressApi.get('/wc/v3/products', {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
        per_page: 1, // Just get 1 product to test
      },
    });

    return NextResponse.json({
      success: true,
      message: 'WordPress API connection successful',
      productsCount: response.data.length,
      sampleProduct: response.data[0] ? {
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price,
      } : null,
    });

  } catch (error: any) {
    console.error('WordPress API test failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      message: 'WordPress API connection failed',
      error: error.response?.data || error.message,
      credentials: {
        hasUrl: !!process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
        hasKey: !!process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        hasSecret: !!process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
        url: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
      }
    }, { status: 500 });
  }
} 
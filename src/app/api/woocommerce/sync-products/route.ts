import { NextRequest, NextResponse } from 'next/server';
import { wordpressApi } from '@/lib/wordpress-api';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Check if we have valid WooCommerce credentials
    const hasValidCredentials = process.env.NEXT_PUBLIC_WORDPRESS_API_URL && 
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-actual-wordpress-site.com/wp-json' &&
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-wordpress-site.com/wp-json/wp/v2' &&
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY && 
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your_actual_consumer_key' &&
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your-consumer-key';

    let woocommerceProducts: any[] = [];

    if (!hasValidCredentials) {
      return NextResponse.json({
        success: false,
        message: 'WooCommerce credentials not configured',
        error: 'Please configure NEXT_PUBLIC_WORDPRESS_API_URL, NEXT_PUBLIC_WC_CONSUMER_KEY, and NEXT_PUBLIC_WC_CONSUMER_SECRET in your environment variables'
      }, { status: 400 });
    } else {
      // Fetch products from WooCommerce
      console.log('Fetching products from WooCommerce...');
      try {
        const response = await wordpressApi.get('/wc/v3/products', {
          params: {
            consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
            consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
            per_page: 100, // Get up to 100 products
            status: 'publish', // Only published products
          },
        });

        woocommerceProducts = response.data;
        console.log(`Found ${woocommerceProducts.length} products in WooCommerce`);
      } catch (error) {
        console.error('WooCommerce API error:', error);
        return NextResponse.json({
          success: false,
          message: 'Failed to fetch products from WooCommerce',
          error: error.response?.data || error.message,
        }, { status: 500 });
      }
    }



    // Transform WooCommerce products to match our Supabase schema
    const transformedProducts = woocommerceProducts.map((product: any) => ({
      // Let Supabase generate UUID automatically, store WooCommerce ID separately
      woocommerce_id: product.id.toString(),
      name: product.name,
      description: product.description || product.short_description || '',
      price: parseFloat(product.price) || 0,
      images: product.images?.map((img: any) => img.src) || [],
      category: product.categories?.[0]?.name || 'uncategorized',
      tags: product.tags?.map((tag: any) => tag.name) || [],
      in_stock: product.stock_status === 'instock' || product.in_stock,
      created_at: new Date().toISOString(), // Use current date for mock data
      updated_at: new Date().toISOString(),
    }));

    // Upsert products into Supabase (update existing, insert new)
    const { data: insertedProducts, error: insertError } = await supabase
      .from('products')
      .upsert(transformedProducts, {
        onConflict: 'woocommerce_id',
        ignoreDuplicates: false
      })
      .select();

    if (insertError) {
      console.error('Error inserting products:', insertError);
      return NextResponse.json({
        success: false,
        message: 'Failed to sync products to Supabase',
        error: insertError.message
      }, { status: 500 });
    }

    console.log(`Successfully synced ${insertedProducts?.length || 0} products`);

    return NextResponse.json({
      success: true,
      message: 'Products synced successfully',
      syncedCount: insertedProducts?.length || 0,
      totalProducts: woocommerceProducts.length,
      sampleProduct: insertedProducts?.[0] ? {
        id: insertedProducts[0].id,
        name: insertedProducts[0].name,
        price: insertedProducts[0].price,
        category: insertedProducts[0].category,
      } : null,
    });

  } catch (error: any) {
    console.error('WooCommerce sync failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      message: 'Failed to sync WooCommerce products',
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

export async function GET() {
  try {
    // Check if we have valid WooCommerce credentials
    const hasValidCredentials = process.env.NEXT_PUBLIC_WORDPRESS_API_URL && 
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-actual-wordpress-site.com/wp-json' &&
      process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-wordpress-site.com/wp-json/wp/v2' &&
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY && 
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your_actual_consumer_key' &&
      process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your-consumer-key';

    let woocommerceProducts: any[] = [];
    let sampleProduct: any = null;

    if (!hasValidCredentials) {
      return NextResponse.json({
        success: false,
        message: 'WooCommerce credentials not configured',
        error: 'Please configure NEXT_PUBLIC_WORDPRESS_API_URL, NEXT_PUBLIC_WC_CONSUMER_KEY, and NEXT_PUBLIC_WC_CONSUMER_SECRET in your environment variables'
      }, { status: 400 });
    } else {
      // Test WooCommerce connection and return product count
      const response = await wordpressApi.get('/wc/v3/products', {
        params: {
          consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
          consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
          per_page: 1,
        },
      });

      woocommerceProducts = response.data;
      sampleProduct = response.data[0] ? {
        id: response.data[0].id,
        name: response.data[0].name,
        price: response.data[0].price,
      } : null;
    }

    // Get count of products in Supabase
    const { count: supabaseCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: 'WooCommerce connection successful',
      woocommerceProducts: woocommerceProducts.length,
      supabaseProducts: supabaseCount || 0,
      sampleProduct: sampleProduct,
    });

  } catch (error: any) {
    console.error('WooCommerce test failed:', error.response?.data || error.message);
    
    return NextResponse.json({
      success: false,
      message: 'WooCommerce connection failed',
      error: error.response?.data || error.message,
    }, { status: 500 });
  }
} 
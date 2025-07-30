import axios from 'axios';

// ----- Axios instance -----
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';

export const wordpressApi = axios.create({
  baseURL: WORDPRESS_API_URL,
  timeout: 10000,
});

// ----- Product types & API helpers -----
export interface ProductImage {
  id: number;
  src: string;
  alt: string;
}

export interface ProductCategory {
  id: number;
  name: string;
  slug: string;
}

export interface ProductVariant {
  id: number;
  name: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number;
  stock_status: string;
  attributes: {
    name: string;
    value: string;
  }[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  regular_price: string;
  sale_price: string;
  description: string;
  short_description: string;
  images: ProductImage[];
  categories: ProductCategory[];
  stock_status: string;
  in_stock: boolean;
  variations?: ProductVariant[];
  attributes?: {
    name: string;
    options: string[];
  }[];
}

export const getProducts = async (): Promise<Product[]> => {
  // Check if we have valid API credentials
  const hasValidCredentials = process.env.NEXT_PUBLIC_WORDPRESS_API_URL && 
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-actual-wordpress-site.com/wp-json' &&
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY && 
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your_actual_consumer_key';

  if (!hasValidCredentials) {
    // Use mock data if no valid credentials
    console.log('Using mock data - no valid WordPress API credentials found');
    const { mockProducts } = await import('./mock-data');
    return mockProducts;
  }

  try {
    const response = await wordpressApi.get('/wc/v3/products', {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock data on API error
    const { mockProducts } = await import('./mock-data');
    return mockProducts;
  }
};

export const getProduct = async (id: number): Promise<Product | null> => {
  // Check if we have valid API credentials
  const hasValidCredentials = process.env.NEXT_PUBLIC_WORDPRESS_API_URL && 
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-actual-wordpress-site.com/wp-json' &&
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY && 
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your_actual_consumer_key';

  if (!hasValidCredentials) {
    // Use mock data if no valid credentials
    const { mockProducts } = await import('./mock-data');
    return mockProducts.find(product => product.id === id) || null;
  }

  try {
    const response = await wordpressApi.get(`/wc/v3/products/${id}`, {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
};

export const getProductBySlug = async (slug: string): Promise<Product | null> => {
  // Check if we have valid API credentials
  const hasValidCredentials = process.env.NEXT_PUBLIC_WORDPRESS_API_URL && 
    process.env.NEXT_PUBLIC_WORDPRESS_API_URL !== 'https://your-actual-wordpress-site.com/wp-json' &&
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY && 
    process.env.NEXT_PUBLIC_WC_CONSUMER_KEY !== 'your_actual_consumer_key';

  if (!hasValidCredentials) {
    // Use mock data if no valid credentials
    const { mockProducts } = await import('./mock-data');
    return mockProducts.find(product => product.slug === slug) || null;
  }

  try {
    const response = await wordpressApi.get('/wc/v3/products', {
      params: {
        slug: slug,
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
    });
    return response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error('Error fetching product by slug:', error);
    return null;
  }
};

export const getProductVariations = async (productId: number): Promise<ProductVariant[]> => {
  try {
    const response = await wordpressApi.get(`/wc/v3/products/${productId}/variations`, {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching product variations:', error);
    return [];
  }
};

// ----- Order creation -----
export interface OrderLineItem {
  product_id: number;
  quantity: number;
  variation_id?: number;
}

export interface CreateOrderInput {
  payment_method: string;
  payment_method_title: string;
  set_paid: boolean;
  billing: Record<string, string>;
  shipping: Record<string, string>;
  line_items: OrderLineItem[];
}

export const createOrder = async (
  order: CreateOrderInput
): Promise<any | null> => {
  try {
    const response = await wordpressApi.post('/wc/v3/orders', order, {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// ----- WordPress Checkout Integration -----
export const createPendingOrder = async (
  order: CreateOrderInput
): Promise<any | null> => {
  try {
    // Create order with pending status
    const pendingOrder = {
      ...order,
      status: 'pending',
      set_paid: false, // Keep as unpaid initially
    };

    const response = await wordpressApi.post('/wc/v3/orders', pendingOrder, {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error creating pending order:', error);
    return null;
  }
};

export const getWordPressCheckoutUrl = (orderId: number): string => {
  const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/wp-json', '') || '';
  return `${baseUrl}/checkout/?order_id=${orderId}`;
};

export const getOrderStatus = async (orderId: number): Promise<string | null> => {
  try {
    const response = await wordpressApi.get(`/wc/v3/orders/${orderId}`, {
      params: {
        consumer_key: process.env.NEXT_PUBLIC_WC_CONSUMER_KEY,
        consumer_secret: process.env.NEXT_PUBLIC_WC_CONSUMER_SECRET,
      },
    });
    return response.data.status;
  } catch (error) {
    console.error('Error fetching order status:', error);
    return null;
  }
};

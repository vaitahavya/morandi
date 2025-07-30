import { supabase } from './supabase';

export interface RecommendationAlgorithm {
  name: string;
  weight: number;
}

interface RecommendationWithProduct {
  product_id: string;
  recommended_product_id: string;
  score: number;
  reason?: string;
  recommended_product: any;
}

interface OrderWithItems {
  id: string;
  user_id: string;
  status: string;
  total: number;
  order_items?: Array<{
    product_id: string;
    quantity: number;
    price: number;
  }>;
}

export async function getProductRecommendations(
  productId: string,
  userId?: string,
  limit: number = 5
) {
  const { data: recommendations, error } = await supabase
    .from('product_recommendations')
    .select(`
      *,
      recommended_product:products!product_recommendations_recommended_product_id_fkey(*)
    `)
    .eq('product_id', productId)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }

  return (recommendations as RecommendationWithProduct[])?.map(rec => rec.recommended_product) || [];
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
) {
  // Get user's purchase history
  const { data: userOrders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      )
    `)
    .eq('user_id', userId)
    .in('status', ['delivered', 'shipped']);

  // Get user's wishlist
  const { data: userWishlist } = await supabase
    .from('wishlist_items')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId);

  // Get user's reviews
  const { data: userReviews } = await supabase
    .from('reviews')
    .select(`
      *,
      product:products(*)
    `)
    .eq('user_id', userId)
    .gte('rating', 4);

  // Collect all product IDs from user's history
  const purchasedProductIds = (userOrders as OrderWithItems[])?.flatMap(order => 
    order.order_items?.map((item: any) => item.product_id) || []
  ) || [];
  const wishlistProductIds = userWishlist?.map((item: any) => item.product_id) || [];
  const reviewedProductIds = userReviews?.map((review: any) => review.product_id) || [];

  const allUserProductIds = [
    ...purchasedProductIds,
    ...wishlistProductIds,
    ...reviewedProductIds,
  ];

  if (allUserProductIds.length === 0) {
    // If no user history, return popular products
    return getPopularProducts(limit);
  }

  // Get recommendations based on user's products
  const { data: recommendations, error } = await supabase
    .from('product_recommendations')
    .select(`
      *,
      recommended_product:products!product_recommendations_recommended_product_id_fkey(*)
    `)
    .in('product_id', allUserProductIds)
    .not('recommended_product_id', 'in', `(${allUserProductIds.join(',')})`)
    .order('score', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching personalized recommendations:', error);
    return [];
  }

  return (recommendations as RecommendationWithProduct[])?.map(rec => rec.recommended_product) || [];
}

export async function getPopularProducts(limit: number = 10) {
  // Get products with most orders
  const { data: popularProducts, error } = await supabase
    .from('products')
    .select(`
      *,
      order_items(count),
      reviews(count)
    `)
    .order('order_items(count)', { ascending: false })
    .order('reviews(count)', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching popular products:', error);
    return [];
  }

  return popularProducts || [];
}

export async function getSimilarProducts(
  productId: string,
  limit: number = 5
) {
  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', productId)
    .single();

  if (!product) return [];

  // Find products in the same category
  const { data: similarProducts, error } = await supabase
    .from('products')
    .select('*')
    .eq('category', product.category)
    .neq('id', productId)
    .limit(limit);

  if (error) {
    console.error('Error fetching similar products:', error);
    return [];
  }

  return similarProducts || [];
}

export async function generateRecommendations() {
  const { data: products } = await supabase
    .from('products')
    .select('*');
  
  if (!products) return;

  for (const product of products) {
    // Find products in the same category
    const { data: categoryProducts } = await supabase
      .from('products')
      .select('*')
      .eq('category', product.category)
      .neq('id', product.id);

    // Create recommendations for category similarity
    for (const categoryProduct of categoryProducts || []) {
      await supabase
        .from('product_recommendations')
        .upsert({
          product_id: product.id,
          recommended_product_id: categoryProduct.id,
          score: 0.7,
          reason: 'category_similarity',
        }, {
          onConflict: 'product_id,recommended_product_id'
        });
    }

    // Find products with similar tags
    const { data: tagSimilarProducts } = await supabase
      .from('products')
      .select('*')
      .overlaps('tags', product.tags)
      .neq('id', product.id);

    for (const tagProduct of tagSimilarProducts || []) {
      const commonTags = product.tags.filter((tag: string) => 
        tagProduct.tags.includes(tag)
      );
      const similarityScore = commonTags.length / Math.max(product.tags.length, tagProduct.tags.length);

      await supabase
        .from('product_recommendations')
        .upsert({
          product_id: product.id,
          recommended_product_id: tagProduct.id,
          score: Math.max(0.5, similarityScore),
          reason: 'tag_similarity',
        }, {
          onConflict: 'product_id,recommended_product_id'
        });
    }
  }
}

export async function updateRecommendationsForUser(userId: string) {
  const { data: userOrders } = await supabase
    .from('orders')
    .select(`
      *,
      order_items(
        *,
        product:products(*)
      )
    `)
    .eq('user_id', userId)
    .in('status', ['delivered', 'shipped']);

  // Find products that are frequently bought together
  for (const order of userOrders || []) {
    const orderProductIds = order.order_items?.map((item: any) => item.product_id) || [];
    
    for (let i = 0; i < orderProductIds.length; i++) {
      for (let j = i + 1; j < orderProductIds.length; j++) {
        const product1Id = orderProductIds[i];
        const product2Id = orderProductIds[j];

        // Create bidirectional recommendations
        await supabase
          .from('product_recommendations')
          .upsert({
            product_id: product1Id,
            recommended_product_id: product2Id,
            score: 0.8,
            reason: 'bought_together',
          }, {
            onConflict: 'product_id,recommended_product_id'
          });

        await supabase
          .from('product_recommendations')
          .upsert({
            product_id: product2Id,
            recommended_product_id: product1Id,
            score: 0.8,
            reason: 'bought_together',
          }, {
            onConflict: 'product_id,recommended_product_id'
          });
      }
    }
  }
} 
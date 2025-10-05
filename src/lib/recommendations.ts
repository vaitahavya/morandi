import { DatabaseService } from './database';
import { prisma } from './db';

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
  return await DatabaseService.getProductRecommendations(productId, limit);
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
) {
  return await DatabaseService.getPersonalizedRecommendations(userId, limit);
}

export async function getPopularProducts(limit: number = 10) {
  return await DatabaseService.getPopularProducts(limit);
}

export async function getSimilarProducts(
  productId: string,
  limit: number = 5
) {
  const product = await DatabaseService.getProductById(productId);
  if (!product) return [];

  // Find products in the same category
  const categorySlugs = product.product_categories.map(pc => pc.categories.slug);
  if (categorySlugs.length === 0) return [];

  const { products } = await DatabaseService.getProducts({
    limit,
    category: categorySlugs[0], // Use first category
  });

  // Filter out the current product
  return products.filter(p => p.id !== productId);
}

export async function generateRecommendations() {
  const { products } = await DatabaseService.getProducts({ limit: 1000 });
  
  if (!products) return;

  for (const product of products) {
    // Find products in the same category
    const categorySlugs = product.product_categories.map(pc => pc.categories.slug);
    
    for (const categorySlug of categorySlugs) {
      const { products: categoryProducts } = await DatabaseService.getProducts({
        category: categorySlug,
        limit: 50,
      });

      // Create recommendations for category similarity
      for (const categoryProduct of categoryProducts) {
        if (categoryProduct.id !== product.id) {
          await prisma.productRecommendation.upsert({
            where: {
              product_id_recommended_product_id: {
                product_id: product.id,
                recommended_product_id: categoryProduct.id,
              },
            },
            update: {
              score: 0.7,
              reason: 'category_similarity',
            },
            create: {
              product_id: product.id,
              recommended_product_id: categoryProduct.id,
              score: 0.7,
              reason: 'category_similarity',
            },
          });
        }
      }
    }

    // Find products with similar tags
    if (product.tags.length > 0) {
      const { products: allProducts } = await DatabaseService.getProducts({ limit: 1000 });
      
      for (const tagProduct of allProducts) {
        if (tagProduct.id !== product.id && tagProduct.tags.length > 0) {
          const commonTags = product.tags.filter((tag: string) => 
            tagProduct.tags.includes(tag)
          );
          
          if (commonTags.length > 0) {
            const similarityScore = commonTags.length / Math.max(product.tags.length, tagProduct.tags.length);

            await prisma.productRecommendation.upsert({
              where: {
                product_id_recommended_product_id: {
                  product_id: product.id,
                  recommended_product_id: tagProduct.id,
                },
              },
              update: {
                score: Math.max(0.5, similarityScore),
                reason: 'tag_similarity',
              },
              create: {
                product_id: product.id,
                recommended_product_id: tagProduct.id,
                score: Math.max(0.5, similarityScore),
                reason: 'tag_similarity',
              },
            });
          }
        }
      }
    }
  }
}

export async function updateRecommendationsForUser(userId: string) {
  const { orders } = await DatabaseService.getOrders({ user_id: userId, limit: 1000 });

  // Find products that are frequently bought together
  for (const order of orders) {
    const orderProductIds = order.order_items?.map((item) => item.product_id).filter(Boolean) || [];
    
    for (let i = 0; i < orderProductIds.length; i++) {
      for (let j = i + 1; j < orderProductIds.length; j++) {
        const product1Id = orderProductIds[i];
        const product2Id = orderProductIds[j];

        // Create bidirectional recommendations
        await prisma.productRecommendation.upsert({
          where: {
            product_id_recommended_product_id: {
              product_id: product1Id,
              recommended_product_id: product2Id,
            },
          },
          update: {
            score: 0.8,
            reason: 'bought_together',
          },
          create: {
            product_id: product1Id,
            recommended_product_id: product2Id,
            score: 0.8,
            reason: 'bought_together',
          },
        });

        await prisma.productRecommendation.upsert({
          where: {
            product_id_recommended_product_id: {
              product_id: product2Id,
              recommended_product_id: product1Id,
            },
          },
          update: {
            score: 0.8,
            reason: 'bought_together',
          },
          create: {
            product_id: product2Id,
            recommended_product_id: product1Id,
            score: 0.8,
            reason: 'bought_together',
          },
        });
      }
    }
  }
} 
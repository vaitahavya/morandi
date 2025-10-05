import { productRepository } from '@/repositories';
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
  // Get product recommendations from database
  const recommendations = await prisma.productRecommendation.findMany({
    where: { product_id: productId },
    take: limit,
    include: {
      products_product_recommendations_recommended_product_idToproducts: true,
    },
    orderBy: { score: 'desc' },
  });

  return recommendations.map(rec => ({
    id: rec.products_product_recommendations_recommended_product_idToproducts?.id,
    name: rec.products_product_recommendations_recommended_product_idToproducts?.name,
    price: rec.products_product_recommendations_recommended_product_idToproducts?.price,
    images: rec.products_product_recommendations_recommended_product_idToproducts?.images,
    score: rec.score,
    reason: rec.reason,
  })).filter(rec => rec.id);
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
) {
  // Get user's order history
  const userOrders = await prisma.order.findMany({
    where: { user_id: userId },
    include: { order_items: true },
  });

  if (userOrders.length === 0) {
    return await getPopularProducts(limit);
  }

  // Get product IDs from user's history
  const userProductIds = userOrders.flatMap(order => 
    order.order_items.map(item => item.product_id).filter((id): id is string => id !== null)
  );

  // Get recommendations based on user's products
  const recommendations = await prisma.productRecommendation.findMany({
    where: {
      product_id: { in: userProductIds },
      recommended_product_id: { notIn: userProductIds },
    },
    take: limit,
    include: {
      products_product_recommendations_recommended_product_idToproducts: true,
    },
    orderBy: { score: 'desc' },
  });

  return recommendations.map(rec => ({
    id: rec.products_product_recommendations_recommended_product_idToproducts?.id,
    name: rec.products_product_recommendations_recommended_product_idToproducts?.name,
    price: rec.products_product_recommendations_recommended_product_idToproducts?.price,
    images: rec.products_product_recommendations_recommended_product_idToproducts?.images,
    score: rec.score,
    reason: rec.reason,
  })).filter(rec => rec.id);
}

export async function getPopularProducts(limit: number = 10) {
  // Get popular products based on order frequency
  const popularProducts = await prisma.product.findMany({
    where: { status: 'published' },
    take: limit,
    orderBy: { created_at: 'desc' },
  });

  return popularProducts.map(product => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    images: product.images,
    score: 1.0,
    reason: 'popular',
  }));
}

export async function getSimilarProducts(
  productId: string,
  limit: number = 5
) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: {
      product_categories: {
        include: {
          categories: true,
        },
      },
    },
  });
  if (!product) return [];

  // Find products in the same category
  const categorySlugs = product.product_categories.map(pc => pc.categories.slug);
  if (categorySlugs.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      status: 'published',
      id: { not: productId },
      product_categories: {
        some: {
          categories: {
            slug: categorySlugs[0], // Use first category
          },
        },
      },
    },
    take: limit,
    orderBy: { created_at: 'desc' },
  });

  // Filter out the current product
  return products.filter(p => p.id !== productId);
}

export async function generateRecommendations() {
  const products = await prisma.product.findMany({
    where: { status: 'published' },
    take: 1000,
    include: {
      product_categories: {
        include: {
          categories: true,
        },
      },
    },
  });
  
  if (!products) return;

  for (const product of products) {
    // Find products in the same category
    const categorySlugs = product.product_categories.map(pc => pc.categories.slug);
    
    for (const categorySlug of categorySlugs) {
      const categoryProducts = await prisma.product.findMany({
        where: {
          status: 'published',
          product_categories: {
            some: {
              categories: {
                slug: categorySlug,
              },
            },
          },
        },
        take: 50,
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
      const allProducts = await prisma.product.findMany({
        where: { status: 'published' },
        take: 1000,
      });
      
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
  const orders = await prisma.order.findMany({
    where: { user_id: userId },
    include: { order_items: true },
    take: 1000,
  });

  // Find products that are frequently bought together
  for (const order of orders) {
    const orderProductIds = order.order_items?.map((item) => item.product_id).filter(Boolean) || [];
    
    for (let i = 0; i < orderProductIds.length; i++) {
      for (let j = i + 1; j < orderProductIds.length; j++) {
        const product1Id = orderProductIds[i];
        const product2Id = orderProductIds[j];

        if (!product1Id || !product2Id) continue;

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
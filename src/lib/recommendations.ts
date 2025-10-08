import { productRepository } from '@/repositories';
import { prisma } from './db';

export interface RecommendationAlgorithm {
  name: string;
  weight: number;
}

interface RecommendationWithProduct {
  productId: string;
  recommendedProductId: string;
  score: number;
  reason?: string;
  recommendedProduct: any;
}

interface OrderWithItems {
  id: string;
  userId: string;
  status: string;
  total: number;
  orderItems?: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
}

export async function getProductRecommendations(
  productId: string,
  userId?: string,
  limit: number = 5
) {
  // Get product recommendations from database - Note: This table may need to be populated first
  const recommendations = await prisma.productRecommendation.findMany({
    where: { productId: productId },
    take: limit,
    orderBy: { score: 'desc' },
  });

  // For now, return similar products from same category
  return await getSimilarProducts(productId, limit);
}

export async function getPersonalizedRecommendations(
  userId: string,
  limit: number = 10
) {
  // Get user's order history
  const userOrders = await prisma.order.findMany({
    where: { userId: userId },
    include: { orderItems: true },
  });

  if (userOrders.length === 0) {
    return await getPopularProducts(limit);
  }

  // Get product IDs from user's history
  const userProductIds = userOrders.flatMap(order => 
    order.orderItems.map(item => item.productId).filter((id): id is string => id !== null)
  );

  // For now, just return popular products that user hasn't purchased
  const products = await prisma.product.findMany({
    where: { 
      status: 'published',
      id: { notIn: userProductIds }
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  return products.map(product => ({
    id: product.id,
    name: product.name,
    price: Number(product.price),
    images: product.images,
    score: 0.8,
    reason: 'personalized',
  }));
}

export async function getPopularProducts(limit: number = 10) {
  // Get popular products based on order frequency
  const popularProducts = await prisma.product.findMany({
    where: { status: 'published' },
    take: limit,
    orderBy: { createdAt: 'desc' },
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
      productCategories: {
        include: {
          category: true,
        },
      },
    },
  });
  if (!product) return [];

  // Find products in the same category
  const categorySlugs = product.productCategories.map(pc => pc.category.slug);
  if (categorySlugs.length === 0) return [];

  const products = await prisma.product.findMany({
    where: {
      status: 'published',
      id: { not: productId },
      productCategories: {
        some: {
          category: {
            slug: categorySlugs[0], // Use first category
          },
        },
      },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  // Filter out the current product
  return products.filter(p => p.id !== productId);
}

export async function generateRecommendations() {
  const products = await prisma.product.findMany({
    where: { status: 'published' },
    take: 1000,
    include: {
      productCategories: {
        include: {
          category: true,
        },
      },
    },
  });
  
  if (!products) return;

  for (const product of products) {
    // Find products in the same category
    const categorySlugs = product.productCategories.map(pc => pc.category.slug);
    
    for (const categorySlug of categorySlugs) {
      const categoryProducts = await prisma.product.findMany({
        where: {
          status: 'published',
          productCategories: {
            some: {
              category: {
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
              productId_recommendedProductId: {
                productId: product.id,
                recommendedProductId: categoryProduct.id,
              },
            },
            update: {
              score: 0.7,
              reason: 'category_similarity',
            },
            create: {
              productId: product.id,
              recommendedProductId: categoryProduct.id,
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
                productId_recommendedProductId: {
                  productId: product.id,
                  recommendedProductId: tagProduct.id,
                },
              },
              update: {
                score: Math.max(0.5, similarityScore),
                reason: 'tag_similarity',
              },
              create: {
                productId: product.id,
                recommendedProductId: tagProduct.id,
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
    where: { userId: userId },
    include: { orderItems: true },
    take: 1000,
  });

  // Find products that are frequently bought together
  for (const order of orders) {
    const orderProductIds = order.orderItems?.map((item) => item.productId).filter(Boolean) || [];
    
    for (let i = 0; i < orderProductIds.length; i++) {
      for (let j = i + 1; j < orderProductIds.length; j++) {
        const product1Id = orderProductIds[i];
        const product2Id = orderProductIds[j];

        if (!product1Id || !product2Id) continue;

        // Create bidirectional recommendations
        await prisma.productRecommendation.upsert({
          where: {
            productId_recommendedProductId: {
              productId: product1Id,
              recommendedProductId: product2Id,
            },
          },
          update: {
            score: 0.8,
            reason: 'bought_together',
          },
          create: {
            productId: product1Id,
            recommendedProductId: product2Id,
            score: 0.8,
            reason: 'bought_together',
          },
        });

        await prisma.productRecommendation.upsert({
          where: {
            productId_recommendedProductId: {
              productId: product2Id,
              recommendedProductId: product1Id,
            },
          },
          update: {
            score: 0.8,
            reason: 'bought_together',
          },
          create: {
            productId: product2Id,
            recommendedProductId: product1Id,
            score: 0.8,
            reason: 'bought_together',
          },
        });
      }
    }
  }
} 
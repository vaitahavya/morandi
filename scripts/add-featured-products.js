const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addFeaturedProducts() {
  try {
    console.log('Adding featured products...');

    // First, let's get some existing products and mark them as featured
    const existingProducts = await prisma.product.findMany({
      where: {
        status: 'published',
        stockStatus: 'instock'
      },
      take: 8
    });

    if (existingProducts.length === 0) {
      console.log('No products found. Please add some products first.');
      return;
    }

    // Mark first 4 products as featured
    const featuredProductIds = existingProducts.slice(0, 4).map(p => p.id);
    
    await prisma.product.updateMany({
      where: {
        id: {
          in: featuredProductIds
        }
      },
      data: {
        featured: true
      }
    });

    console.log(`Marked ${featuredProductIds.length} products as featured`);

    // Also create some sample categories if they don't exist
    const categories = [
      {
        name: 'Maternity Wear',
        slug: 'maternity-wear',
        description: 'Comfortable and stylish maternity clothing',
        displayOrder: 1,
        isVisible: true
      },
      {
        name: 'Baby Products',
        slug: 'baby-products',
        description: 'Essential baby clothing and accessories',
        displayOrder: 2,
        isVisible: true
      },
      {
        name: 'Feeding Essentials',
        slug: 'feeding-essentials',
        description: 'Practical feeding accessories for mothers',
        displayOrder: 3,
        isVisible: true
      },
      {
        name: 'Home Bedding',
        slug: 'home-bedding',
        description: 'Cozy and neutral bedding sets',
        displayOrder: 4,
        isVisible: true
      },
      {
        name: 'Postpartum Care',
        slug: 'postpartum-care',
        description: 'Essential items for postpartum recovery',
        displayOrder: 5,
        isVisible: true
      },
      {
        name: 'Lounge Wear',
        slug: 'lounge-wear',
        description: 'Comfortable loungewear for every stage',
        displayOrder: 6,
        isVisible: true
      }
    ];

    for (const categoryData of categories) {
      await prisma.category.upsert({
        where: { slug: categoryData.slug },
        update: categoryData,
        create: categoryData
      });
    }

    console.log('Created/updated categories');

    // Assign some products to categories
    const allProducts = await prisma.product.findMany({
      where: { status: 'published' },
      take: 10
    });

    const allCategories = await prisma.category.findMany();

    // Randomly assign products to categories
    for (const product of allProducts) {
      const randomCategories = allCategories
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);

      for (const category of randomCategories) {
        await prisma.productCategory.upsert({
          where: {
            productId_categoryId: {
              productId: product.id,
              categoryId: category.id
            }
          },
          update: {},
          create: {
            productId: product.id,
            categoryId: category.id
          }
        });
      }
    }

    console.log('Assigned products to categories');

    console.log('✅ Featured products setup completed successfully!');
    
  } catch (error) {
    console.error('Error adding featured products:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addFeaturedProducts();

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { 
  getProductRecommendations, 
  getPersonalizedRecommendations, 
  getSimilarProducts,
  getPopularProducts 
} from '@/lib/recommendations';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const type = searchParams.get('type') || 'personalized';
    const limit = parseInt(searchParams.get('limit') || '10');

    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    let recommendations;

    switch (type) {
      case 'product':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID required for product recommendations' },
            { status: 400 }
          );
        }
        recommendations = await getProductRecommendations(productId, userId, limit);
        break;

      case 'personalized':
        if (!userId) {
          // If no user, return popular products
          recommendations = await getPopularProducts(limit);
        } else {
          recommendations = await getPersonalizedRecommendations(userId, limit);
        }
        break;

      case 'similar':
        if (!productId) {
          return NextResponse.json(
            { error: 'Product ID required for similar products' },
            { status: 400 }
          );
        }
        recommendations = await getSimilarProducts(productId, limit);
        break;

      case 'popular':
        recommendations = await getPopularProducts(limit);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid recommendation type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
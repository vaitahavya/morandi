import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  description?: string;
}

interface RecommendationParams {
  productId?: string;
  type?: 'personalized' | 'similar' | 'popular' | 'product';
  limit?: number;
}

// API function
async function fetchRecommendations(params: RecommendationParams) {
  const searchParams = new URLSearchParams();
  
  if (params.productId) {
    searchParams.append('productId', params.productId);
  }
  if (params.type) {
    searchParams.append('type', params.type);
  }
  if (params.limit) {
    searchParams.append('limit', params.limit.toString());
  }

  const response = await fetch(`/api/recommendations?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error('Failed to fetch recommendations');
  }
  
  const data = await response.json();
  return data.recommendations || [];
}

// Get product recommendations
export function useProductRecommendations(productId: string, limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.recommendations.product(productId, undefined, limit),
    queryFn: () => fetchRecommendations({ productId, type: 'product', limit }),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get personalized recommendations
export function usePersonalizedRecommendations(userId: string, limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.recommendations.personalized(userId, limit),
    queryFn: () => fetchRecommendations({ type: 'personalized', limit }),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get similar products
export function useSimilarProducts(productId: string, limit: number = 5) {
  return useQuery({
    queryKey: queryKeys.recommendations.similar(productId, limit),
    queryFn: () => fetchRecommendations({ productId, type: 'similar', limit }),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Get popular products
export function usePopularProducts(limit: number = 10) {
  return useQuery({
    queryKey: queryKeys.recommendations.popular(limit),
    queryFn: () => fetchRecommendations({ type: 'popular', limit }),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Generic recommendations hook
export function useRecommendations(params: RecommendationParams) {
  return useQuery({
    queryKey: ['recommendations', params],
    queryFn: () => fetchRecommendations(params),
    enabled: !!(params.productId || params.type),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

import { useMemo } from 'react';
import { container } from '@/container/Container';
import { ProductService } from '@/services/ProductService';

export function useProductService(): ProductService {
  return useMemo(() => container.getProductService(), []);
}

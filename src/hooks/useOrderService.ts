import { useMemo } from 'react';
import { container } from '@/container/Container';
import { OrderService } from '@/services/OrderService';

export function useOrderService(): OrderService {
  return useMemo(() => container.getOrderService(), []);
}

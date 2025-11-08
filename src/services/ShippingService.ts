import {
  shippingRateRepository,
  CreateShippingRateInput,
  UpdateShippingRateInput,
  ShippingRateFilters,
  CalculatedShippingQuote,
  FindManyOptions,
  PaginatedResult,
} from '@/repositories';
import { ShippingRate } from '@prisma/client';

export interface ShippingQuoteResult extends CalculatedShippingQuote {
  effectiveCost: number;
}

export class ShippingService {
  async getQuoteByPincode(pincode: string, subtotal: number): Promise<ShippingQuoteResult | null> {
    if (!pincode || subtotal < 0) {
      return null;
    }

    const quote = await shippingRateRepository.findBestRateForPincode(pincode, subtotal);
    if (!quote) {
      return null;
    }

    return {
      ...quote,
      effectiveCost: quote.shippingCost,
    };
  }

  async listRates(
    filters?: ShippingRateFilters,
    options?: FindManyOptions,
  ): Promise<PaginatedResult<ShippingRate>> {
    return shippingRateRepository.findMany(filters, options);
  }

  async getRateById(id: string): Promise<ShippingRate | null> {
    if (!id) {
      throw new Error('Shipping rate id is required.');
    }

    return shippingRateRepository.findById(id);
  }

  async createRate(data: CreateShippingRateInput): Promise<ShippingRate> {
    if (data.pincode && data.pincodePrefix) {
      throw new Error('Specify either a full pincode or a prefix, not both.');
    }

    if (!data.pincode && !data.pincodePrefix && !data.zone) {
      throw new Error('Provide at least a pincode, prefix, or zone to target this shipping rate.');
    }

    if (data.baseCost < 0) {
      throw new Error('Base shipping cost must be zero or positive.');
    }

    return shippingRateRepository.create(data);
  }

  async updateRate(id: string, data: UpdateShippingRateInput): Promise<ShippingRate> {
    if (!id) {
      throw new Error('Shipping rate id is required.');
    }

    const existing = await shippingRateRepository.findById(id);
    if (!existing) {
      throw new Error('Shipping rate not found.');
    }

    if (data.pincode && data.pincodePrefix) {
      throw new Error('Specify either a full pincode or a prefix, not both.');
    }

    if (
      (data.pincode !== undefined || data.pincodePrefix !== undefined || data.zone !== undefined) &&
      !((data.pincode ?? existing.pincode) || (data.pincodePrefix ?? existing.pincodePrefix) || (data.zone ?? existing.zone))
    ) {
      throw new Error('Shipping rate must target at least a pincode, prefix, or zone.');
    }

    if (data.baseCost !== undefined && data.baseCost < 0) {
      throw new Error('Base shipping cost must be zero or positive.');
    }

    return shippingRateRepository.update(id, data);
  }

  async deleteRate(id: string): Promise<void> {
    if (!id) {
      throw new Error('Shipping rate id is required.');
    }

    await shippingRateRepository.delete(id);
  }
}

export const shippingService = new ShippingService();


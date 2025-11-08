import { PrismaClient, ShippingRate } from '@prisma/client';
import { BaseRepository, FindManyOptions, PaginatedResult } from './base/BaseRepository';

export interface CreateShippingRateInput {
  name?: string;
  pincode?: string;
  pincodePrefix?: string;
  zone?: string;
  baseCost: number;
  surcharge?: number;
  freeShippingThreshold?: number;
  estimatedDeliveryMin?: number;
  estimatedDeliveryMax?: number;
  isActive?: boolean;
  notes?: string;
}

export interface UpdateShippingRateInput extends Partial<CreateShippingRateInput> {}

export interface ShippingRateFilters {
  zone?: string;
  isActive?: boolean;
  search?: string;
}

export interface CalculatedShippingQuote {
  rate: ShippingRate;
  shippingCost: number;
  isFree: boolean;
  subtotal: number;
}

export interface IShippingRateRepository {
  create(data: CreateShippingRateInput): Promise<ShippingRate>;
  findById(id: string): Promise<ShippingRate | null>;
  findMany(filters?: ShippingRateFilters, options?: FindManyOptions): Promise<PaginatedResult<ShippingRate>>;
  update(id: string, data: UpdateShippingRateInput): Promise<ShippingRate>;
  delete(id: string): Promise<void>;
  findBestRateForPincode(pincode: string, subtotal: number): Promise<CalculatedShippingQuote | null>;
}

export class ShippingRateRepository
  extends BaseRepository<ShippingRate, CreateShippingRateInput, UpdateShippingRateInput, ShippingRateFilters>
  implements IShippingRateRepository
{
  async create(data: CreateShippingRateInput): Promise<ShippingRate> {
    return this.prisma.shippingRate.create({
      data: {
        name: data.name,
        pincode: data.pincode,
        pincodePrefix: data.pincodePrefix,
        zone: data.zone,
        baseCost: data.baseCost,
        surcharge: data.surcharge ?? 0,
        freeShippingThreshold: data.freeShippingThreshold,
        estimatedDeliveryMin: data.estimatedDeliveryMin,
        estimatedDeliveryMax: data.estimatedDeliveryMax,
        isActive: data.isActive ?? true,
        notes: data.notes,
      },
    });
  }

  async findById(id: string): Promise<ShippingRate | null> {
    return this.prisma.shippingRate.findUnique({
      where: { id },
    });
  }

  async findMany(
    filters: ShippingRateFilters = {},
    options: FindManyOptions = {},
  ): Promise<PaginatedResult<ShippingRate>> {
    const { page, limit, skip } = this.buildPaginationOptions(options);
    const orderBy = this.buildOrderBy(options.sortBy, options.sortOrder) ?? { updatedAt: 'desc' };

    const where: any = {};

    if (filters.zone) {
      where.zone = filters.zone;
    }

    if (filters.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters.search) {
      const searchTerm = filters.search.trim();
      where.OR = [
        { name: { contains: searchTerm, mode: 'insensitive' } },
        { zone: { contains: searchTerm, mode: 'insensitive' } },
        { pincode: { contains: searchTerm, mode: 'insensitive' } },
        { pincodePrefix: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const [rates, total] = await Promise.all([
      this.prisma.shippingRate.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.shippingRate.count({ where }),
    ]);

    return {
      data: rates,
      pagination: this.buildPaginationMeta(page, limit, total),
    };
  }

  async update(id: string, data: UpdateShippingRateInput): Promise<ShippingRate> {
    return this.prisma.shippingRate.update({
      where: { id },
      data: {
        ...data,
        surcharge: data.surcharge ?? undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shippingRate.delete({
      where: { id },
    });
  }

  async findBestRateForPincode(pincode: string, subtotal: number): Promise<CalculatedShippingQuote | null> {
    const normalized = (pincode || '').trim();
    if (!normalized) {
      return null;
    }

    const exactRate = await this.prisma.shippingRate.findFirst({
      where: {
        pincode: normalized,
        isActive: true,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (exactRate) {
      return this.buildQuote(exactRate, subtotal);
    }

    const prefixRates = await this.prisma.shippingRate.findMany({
      where: {
        isActive: true,
        NOT: {
          pincodePrefix: null,
        },
      },
    });

    const matchedPrefix = prefixRates
      .filter((rate) => rate.pincodePrefix && normalized.startsWith(rate.pincodePrefix))
      .sort((a, b) => (b.pincodePrefix?.length || 0) - (a.pincodePrefix?.length || 0))[0];

    if (matchedPrefix) {
      return this.buildQuote(matchedPrefix, subtotal);
    }

    // Fallback to zone-only or default rate
    const defaultRate = await this.prisma.shippingRate.findFirst({
      where: {
        isActive: true,
        pincode: null,
        pincodePrefix: null,
      },
      orderBy: { updatedAt: 'desc' },
    });

    if (defaultRate) {
      return this.buildQuote(defaultRate, subtotal);
    }

    return null;
  }

  private buildQuote(rate: ShippingRate, subtotal: number): CalculatedShippingQuote {
    const threshold = rate.freeShippingThreshold ?? undefined;
    const baseCost = rate.baseCost;
    const surcharge = rate.surcharge ?? 0;

    const qualifiesForFree =
      typeof threshold === 'number' && threshold >= 0 ? subtotal >= threshold : false;

    return {
      rate,
      subtotal,
      isFree: qualifiesForFree,
      shippingCost: qualifiesForFree ? 0 : Math.max(0, baseCost + surcharge),
    };
  }
}

export const shippingRateRepository = new ShippingRateRepository(new PrismaClient());


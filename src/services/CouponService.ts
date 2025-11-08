import { prisma } from '@/lib/db';
import { Coupon } from '@prisma/client';

export interface CouponValidationInput {
  code: string;
  subtotal: number;
  zone?: string | null;
}

export interface CouponValidationResult {
  coupon: Coupon;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

export class CouponService {
  async validateCoupon({
    code,
    subtotal,
    zone,
  }: CouponValidationInput): Promise<CouponValidationResult> {
    if (!code) {
      throw new Error('Coupon code is required');
    }

    if (subtotal <= 0) {
      throw new Error('Subtotal must be greater than zero');
    }

    const normalizedCode = code.toUpperCase().trim();
    const coupon = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (!coupon) {
      throw new Error('Coupon code is invalid');
    }

    if (!coupon.isActive) {
      throw new Error('Coupon is inactive');
    }

    const now = new Date();
    if (coupon.startDate && coupon.startDate > now) {
      throw new Error('Coupon is not yet active');
    }

    if (coupon.endDate && coupon.endDate < now) {
      throw new Error('Coupon has expired');
    }

    if (coupon.minimumAmount && subtotal < coupon.minimumAmount) {
      throw new Error(
        `Order subtotal must be at least ${coupon.minimumAmount} to use this coupon`,
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      throw new Error('Coupon usage limit reached');
    }

    if (coupon.appliesToZones) {
      try {
        const zones = JSON.parse(coupon.appliesToZones) as string[];
        if (Array.isArray(zones) && zones.length > 0) {
          if (!zone || !zones.map((z) => z.toLowerCase()).includes(zone.toLowerCase())) {
            throw new Error('Coupon does not apply to the selected shipping zone');
          }
        }
      } catch {
        // ignore parse errors, treat as no restriction
      }
    }

    let discountAmount = 0;
    if (coupon.type === 'percentage') {
      discountAmount = subtotal * (coupon.value / 100);
      if (coupon.maximumDiscount !== null && coupon.maximumDiscount !== undefined) {
        discountAmount = Math.min(discountAmount, coupon.maximumDiscount);
      }
    } else if (coupon.type === 'fixed_amount') {
      discountAmount = coupon.value;
    }

    discountAmount = Math.max(0, Math.min(discountAmount, subtotal));

    return {
      coupon,
      discountAmount,
      freeShipping: coupon.freeShipping,
      message: coupon.freeShipping
        ? 'Coupon applied with free shipping'
        : 'Coupon applied successfully',
    };
  }

  async incrementUsage(couponId: string): Promise<void> {
    await prisma.coupon.update({
      where: { id: couponId },
      data: {
        usedCount: {
          increment: 1,
        },
      },
    });
  }
}

export const couponService = new CouponService();


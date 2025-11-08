import { NextRequest, NextResponse } from 'next/server';
import { couponService } from '@/services';
import { CouponValidationInput } from '@/services/CouponService';

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as CouponValidationInput;
    const result = await couponService.validateCoupon({
      code: payload.code,
      subtotal: payload.subtotal,
      zone: payload.zone,
    });

    return NextResponse.json({
      success: true,
      data: {
        couponId: result.coupon.id,
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        discountAmount: result.discountAmount,
        freeShipping: result.freeShipping,
        minimumAmount: result.coupon.minimumAmount,
        maximumDiscount: result.coupon.maximumDiscount,
        usageLimit: result.coupon.usageLimit,
        usedCount: result.coupon.usedCount,
        appliesToZones: result.coupon.appliesToZones,
        message: result.message,
      },
    });
  } catch (error) {
    console.error('Error validating coupon:', error);
    const message = error instanceof Error ? error.message : 'Failed to validate coupon';
    const status = message === 'Coupon code is invalid' ? 404 : 400;
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}


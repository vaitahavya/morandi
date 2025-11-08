import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pincode = searchParams.get('pincode') || '';
    const subtotal = parseFloat(searchParams.get('subtotal') || '0');

    if (!pincode) {
      return NextResponse.json(
        { success: false, error: 'pincode query parameter is required' },
        { status: 400 },
      );
    }

    if (Number.isNaN(subtotal) || subtotal < 0) {
      return NextResponse.json(
        { success: false, error: 'subtotal must be a positive number' },
        { status: 400 },
      );
    }

    const quote = await shippingService.getQuoteByPincode(pincode, subtotal);
    if (!quote) {
      return NextResponse.json(
        { success: false, error: 'No shipping rate configured for this pincode' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        rateId: quote.rate.id,
        name: quote.rate.name,
        zone: quote.rate.zone,
        pincode: quote.rate.pincode,
        pincodePrefix: quote.rate.pincodePrefix,
        shippingCost: quote.effectiveCost,
        isFree: quote.isFree,
        freeShippingThreshold: quote.rate.freeShippingThreshold,
        estimatedDeliveryMin: quote.rate.estimatedDeliveryMin,
        estimatedDeliveryMax: quote.rate.estimatedDeliveryMax,
      },
    });
  } catch (error) {
    console.error('Error calculating shipping quote:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to calculate shipping quote',
      },
      { status: 500 },
    );
  }
}


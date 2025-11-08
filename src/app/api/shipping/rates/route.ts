import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/services';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const zone = searchParams.get('zone') || undefined;
    const isActiveParam = searchParams.get('isActive');
    const search = searchParams.get('search') || undefined;

    const isActive =
      isActiveParam === null
        ? undefined
        : isActiveParam === ''
        ? undefined
        : isActiveParam === 'true';

    const result = await shippingService.listRates(
      {
        zone,
        isActive,
        search,
      },
      {
        page,
        limit,
        sortBy: searchParams.get('sortBy') || 'updatedAt',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      },
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error fetching shipping rates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shipping rates',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();

    const rate = await shippingService.createRate({
      name: payload.name,
      pincode: payload.pincode,
      pincodePrefix: payload.pincodePrefix,
      zone: payload.zone,
      baseCost: Number(payload.baseCost ?? 0),
      surcharge: payload.surcharge !== undefined ? Number(payload.surcharge) : undefined,
      freeShippingThreshold:
        payload.freeShippingThreshold !== undefined ? Number(payload.freeShippingThreshold) : undefined,
      estimatedDeliveryMin:
        payload.estimatedDeliveryMin !== undefined ? Number(payload.estimatedDeliveryMin) : undefined,
      estimatedDeliveryMax:
        payload.estimatedDeliveryMax !== undefined ? Number(payload.estimatedDeliveryMax) : undefined,
      isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : undefined,
      notes: payload.notes,
    });

    return NextResponse.json(
      {
        success: true,
        data: rate,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    const message = error instanceof Error ? error.message : 'Failed to create shipping rate';
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 400 },
    );
  }
}


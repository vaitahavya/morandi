import { NextRequest, NextResponse } from 'next/server';
import { shippingService } from '@/services';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const rate = await shippingService.getRateById(params.id);
    if (!rate) {
      return NextResponse.json(
        { success: false, error: 'Shipping rate not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: rate,
    });
  } catch (error) {
    console.error('Error fetching shipping rate:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch shipping rate',
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const payload = await request.json();
    const updated = await shippingService.updateRate(params.id, {
      name: payload.name,
      pincode: payload.pincode,
      pincodePrefix: payload.pincodePrefix,
      zone: payload.zone,
      baseCost: payload.baseCost !== undefined ? Number(payload.baseCost) : undefined,
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

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    const message = error instanceof Error ? error.message : 'Failed to update shipping rate';
    const status = error instanceof Error ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await shippingService.deleteRate(params.id);
    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    const message = error instanceof Error ? error.message : 'Failed to delete shipping rate';
    const status = error instanceof Error ? 400 : 500;
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status },
    );
  }
}


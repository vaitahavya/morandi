import { NextRequest, NextResponse } from 'next/server';
import { returnRepository } from '@/repositories';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const returnId = params.id;

    // Fetch return details with related data
    const returnData = await returnRepository.findById(returnId);

    if (!returnData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Return not found' 
      }, { status: 404 });
    }

    // Note: ReturnStatusHistory relation not defined in Returns model

    return NextResponse.json({
      success: true,
      data: returnData
    });

  } catch (error) {
    console.error('Error fetching return details:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const returnId = params.id;
    const body = await request.json();
    
    const {
      status,
      adminNotes,
      refundAmount,
      refundMethod,
      processedBy,
      qcStatus,
      qcNotes,
      qcBy,
      trackingNumber,
      carrier,
      returnShippingCost,
      refundTransactionId,
      returnItems // Array of item updates
    } = body;

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'received', 'processed', 'refunded', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Invalid status' 
      }, { status: 400 });
    }

    // Fetch current return data
    const currentReturn = await returnRepository.findById(returnId);

    if (!currentReturn) {
      return NextResponse.json({ 
        success: false, 
        error: 'Return not found' 
      }, { status: 404 });
    }

    // Prepare update data (only fields that exist in schema)
    const updateData: any = {};

    if (status) updateData.status = status;
    if (adminNotes) updateData.notes = adminNotes;
    if (refundAmount) updateData.refundAmount = refundAmount;
    if (processedBy) updateData.processedBy = processedBy;
    if (qcBy) updateData.qcBy = qcBy;
    
    // Note: Many fields from request don't exist in schema:
    // refundMethod, qcStatus, qcNotes, trackingNumber, carrier, 
    // returnShippingCost, refundTransactionId, processed_at, refunded_at, qc_at

    // Update return
    const updatedReturn = await prisma.returns.update({
      where: { id: returnId },
      data: updateData,
    });

    // Update return items if provided
    if (returnItems && Array.isArray(returnItems)) {
      for (const item of returnItems) {
        if (item.id) {
          const itemUpdateData: any = {};
          
          if (item.conditionReceived) itemUpdateData.condition_received = item.conditionReceived;
          if (item.conditionNotes) itemUpdateData.condition_notes = item.conditionNotes;
          if (item.restockable !== undefined) itemUpdateData.restockable = item.restockable;
          if (item.totalRefundAmount) itemUpdateData.total_refund_amount = item.totalRefundAmount;

          if (Object.keys(itemUpdateData).length > 0) {
            itemUpdateData.updatedAt = new Date();
            
            await prisma.returnItem.update({
              where: { id: item.id },
              data: itemUpdateData,
            });
          }
        }
      }
    }

    // If status changed to 'approved', check if we need to generate return label
    if (status === 'approved' && currentReturn.status !== 'approved') {
      // TODO: Integrate with shipping provider to generate return label
      // This would typically involve calling a shipping API like FedEx, UPS, etc.
    }

    // If status changed to 'refunded', update order payment status if needed
    if (status === 'refunded' && currentReturn.status !== 'refunded') {
      // Check if this is a full refund
      const orderData = await prisma.order.findUnique({
        where: { id: currentReturn.orderId! },
        select: { total: true, paymentStatus: true },
      });

      if (orderData && updatedReturn.refundAmount && Number(updatedReturn.refundAmount) >= Number(orderData.total)) {
        // Full refund - update order payment status
        await prisma.order.update({
          where: { id: currentReturn.orderId! },
          data: { paymentStatus: 'refunded' },
        });
      } else if (orderData && updatedReturn.refundAmount && Number(updatedReturn.refundAmount) > 0) {
        // Partial refund
        await prisma.order.update({
          where: { id: currentReturn.orderId! },
          data: { paymentStatus: 'partially_refunded' },
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedReturn
    });

  } catch (error) {
    console.error('Error updating return:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const returnId = params.id;

    // Check if return exists and can be deleted
    const returnData = await prisma.returns.findUnique({
      where: { id: returnId },
      select: { status: true },
    });

    if (!returnData) {
      return NextResponse.json({ 
        success: false, 
        error: 'Return not found' 
      }, { status: 404 });
    }

    // Only allow deletion of pending or rejected returns
    if (!['pending', 'rejected'].includes(returnData.status || '')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Cannot delete return with current status' 
      }, { status: 400 });
    }

    // Delete return (this will cascade to return_items)
    await prisma.returns.delete({
      where: { id: returnId },
    });

    return NextResponse.json({
      success: true,
      message: 'Return deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting return:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
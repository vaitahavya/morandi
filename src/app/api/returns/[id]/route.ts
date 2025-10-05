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

    // Sort status history by date
    if (returnData.return_status_history) {
      returnData.return_status_history.sort((a, b) => 
        new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime()
      );
    }

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

    // Prepare update data
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    if (status) updateData.status = status;
    if (adminNotes) updateData.admin_notes = adminNotes;
    if (refundAmount) updateData.refund_amount = refundAmount;
    if (refundMethod) updateData.refund_method = refundMethod;
    if (processedBy) updateData.processed_by = processedBy;
    if (qcStatus) updateData.qc_status = qcStatus;
    if (qcNotes) updateData.qc_notes = qcNotes;
    if (qcBy) updateData.qc_by = qcBy;
    if (trackingNumber) updateData.tracking_number = trackingNumber;
    if (carrier) updateData.carrier = carrier;
    if (returnShippingCost) updateData.return_shipping_cost = returnShippingCost;
    if (refundTransactionId) updateData.refund_transaction_id = refundTransactionId;

    // Set timestamps based on status
    if (status === 'processed' && currentReturn.status !== 'processed') {
      updateData.processed_at = new Date().toISOString();
    }
    if (status === 'refunded' && currentReturn.status !== 'refunded') {
      updateData.refunded_at = new Date().toISOString();
    }
    if (qcStatus && currentReturn.qc_status !== qcStatus) {
      updateData.qc_at = new Date().toISOString();
    }

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
            itemUpdateData.updated_at = new Date();
            
            await prisma.return_items.update({
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
        where: { id: currentReturn.order_id! },
        select: { total: true, payment_status: true },
      });

      if (orderData && updatedReturn.refund_amount && Number(updatedReturn.refund_amount) >= Number(orderData.total)) {
        // Full refund - update order payment status
        await prisma.order.update({
          where: { id: currentReturn.order_id! },
          data: { payment_status: 'refunded' },
        });
      } else if (orderData && updatedReturn.refund_amount && Number(updatedReturn.refund_amount) > 0) {
        // Partial refund
        await prisma.order.update({
          where: { id: currentReturn.order_id! },
          data: { payment_status: 'partially_refunded' },
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

    // Delete return (this will cascade to return_items and return_status_history)
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
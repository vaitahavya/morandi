import { NextRequest, NextResponse } from 'next/server';
import { customerRepository } from '@/repositories';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { email: string } }
) {
  try {
    const customerEmail = decodeURIComponent(params.email);

    // Get customer details using repository
    const customer = await customerRepository.findByEmail(customerEmail);

    if (!customer) {
      return NextResponse.json({ success: false, error: 'Customer not found' }, { status: 404 });
    }

    // The customer repository already provides all the necessary data

    return NextResponse.json({
      success: true,
      data: customer
    });

  } catch (error) {
    console.error('Error in customer detail API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
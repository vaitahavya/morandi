import { NextRequest, NextResponse } from 'next/server';
import { customerRepository } from '@/repositories';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const segment = searchParams.get('segment') || '';
    const sortBy = searchParams.get('sortBy') || 'lastOrderDate';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const result = await customerRepository.findMany(
      { segment },
      { page, limit, sortBy, sortOrder: sortOrder as 'asc' | 'desc' }
    );

    return NextResponse.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Error in customers API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
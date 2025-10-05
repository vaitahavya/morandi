import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const isActive = searchParams.get('isActive') || '';
    const type = searchParams.get('type') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (isActive !== '') {
      where.is_active = isActive === 'true';
    }

    if (type) {
      where.type = type;
    }

    const [coupons, total] = await Promise.all([
      prisma.coupon.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
      prisma.coupon.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const allCoupons = await prisma.coupon.findMany({
      select: {
        is_active: true,
        type: true,
        usage_count: true,
        usage_limit: true,
      },
    });

    const stats = {
      totalCoupons: total,
      activeCoupons: allCoupons.filter(c => c.is_active).length,
      percentageCoupons: allCoupons.filter(c => c.type === 'percentage').length,
      fixedAmountCoupons: allCoupons.filter(c => c.type === 'fixed_amount').length,
      totalUsage: allCoupons.reduce((sum, c) => sum + (c.usage_count || 0), 0),
      avgUsage: allCoupons.length > 0 
        ? allCoupons.reduce((sum, c) => sum + (c.usage_count || 0), 0) / allCoupons.length 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: coupons,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats
    });

  } catch (error) {
    console.error('Error in coupons API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const {
      code,
      type,
      value,
      minimumAmount,
      usageLimit,
      userLimit,
      validFrom,
      validUntil,
      isActive = true,
      description
    } = body;

    // Validate required fields
    if (!code || !type || !value) {
      return NextResponse.json({ 
        success: false, 
        error: 'Code, type, and value are required' 
      }, { status: 400 });
    }

    // Validate type
    if (!['percentage', 'fixed_amount'].includes(type)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Type must be percentage or fixed_amount' 
      }, { status: 400 });
    }

    // Validate value
    if (type === 'percentage' && (value < 0 || value > 100)) {
      return NextResponse.json({ 
        success: false, 
        error: 'Percentage value must be between 0 and 100' 
      }, { status: 400 });
    }

    if (type === 'fixed_amount' && value <= 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Fixed amount value must be greater than 0' 
      }, { status: 400 });
    }

    // Check if code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      select: { id: true },
    });

    if (existingCoupon) {
      return NextResponse.json({ 
        success: false, 
        error: 'Coupon code already exists' 
      }, { status: 400 });
    }

    // Create coupon
    const newCoupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        value,
        minimum_amount: minimumAmount,
        usage_limit: usageLimit,
        user_limit: userLimit,
        valid_from: validFrom ? new Date(validFrom) : new Date(),
        valid_until: validUntil ? new Date(validUntil) : null,
        is_active: isActive,
        description
      },
    });

    return NextResponse.json({
      success: true,
      data: newCoupon
    });

  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 
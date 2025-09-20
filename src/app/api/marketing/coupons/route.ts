import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
    
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('coupons')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }

    if (type) {
      query = query.eq('type', type);
    }

    const { data: coupons, error: couponsError } = await query;
    
    if (couponsError) {
      console.error('Error fetching coupons:', couponsError);
      return NextResponse.json({ success: false, error: 'Failed to fetch coupons' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('coupons')
      .select('id', { count: 'exact', head: true });

    if (isActive !== '') {
      countQuery = countQuery.eq('is_active', isActive === 'true');
    }
    if (type) {
      countQuery = countQuery.eq('type', type);
    }

    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting coupons count:', countError);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const statsQuery = supabase
      .from('coupons')
      .select('is_active, type, usage_count, usage_limit');

    const { data: statsData } = await statsQuery;

    const stats = {
      totalCoupons: total,
      activeCoupons: statsData?.filter(c => c.is_active).length || 0,
      percentageCoupons: statsData?.filter(c => c.type === 'percentage').length || 0,
      fixedAmountCoupons: statsData?.filter(c => c.type === 'fixed_amount').length || 0,
      totalUsage: statsData?.reduce((sum, c) => sum + (c.usage_count || 0), 0) || 0,
      avgUsage: statsData && statsData.length > 0 
        ? statsData.reduce((sum, c) => sum + (c.usage_count || 0), 0) / statsData.length 
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
    const { data: existingCoupon, error: checkError } = await supabase
      .from('coupons')
      .select('id')
      .eq('code', code)
      .single();

    if (existingCoupon) {
      return NextResponse.json({ 
        success: false, 
        error: 'Coupon code already exists' 
      }, { status: 400 });
    }

    // Create coupon
    const couponData = {
      code: code.toUpperCase(),
      type,
      value,
      minimum_amount: minimumAmount,
      usage_limit: usageLimit,
      user_limit: userLimit,
      valid_from: validFrom || new Date().toISOString(),
      valid_until: validUntil,
      is_active: isActive,
      description
    };

    const { data: newCoupon, error: couponError } = await supabase
      .from('coupons')
      .insert(couponData)
      .select()
      .single();

    if (couponError) {
      console.error('Error creating coupon:', couponError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create coupon' 
      }, { status: 500 });
    }

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
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const position = searchParams.get('position') || '';
    const isActive = searchParams.get('isActive') || '';
    const sortBy = searchParams.get('sortBy') || 'priority';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build the query
    let query = supabase
      .from('banners')
      .select('*')
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (position) {
      query = query.eq('position', position);
    }

    if (isActive !== '') {
      query = query.eq('is_active', isActive === 'true');
    }

    const { data: banners, error: bannersError } = await query;
    
    if (bannersError) {
      console.error('Error fetching banners:', bannersError);
      return NextResponse.json({ success: false, error: 'Failed to fetch banners' }, { status: 500 });
    }

    // Get total count for pagination
    let countQuery = supabase
      .from('banners')
      .select('id', { count: 'exact', head: true });

    if (position) {
      countQuery = countQuery.eq('position', position);
    }
    if (isActive !== '') {
      countQuery = countQuery.eq('is_active', isActive === 'true');
    }

    const { count, error: countError } = await countQuery;
    
    if (countError) {
      console.error('Error getting banners count:', countError);
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const statsQuery = supabase
      .from('banners')
      .select('is_active, impressions, clicks');

    const { data: statsData } = await statsQuery;

    const stats = {
      totalBanners: total,
      activeBanners: statsData?.filter(b => b.is_active).length || 0,
      totalImpressions: statsData?.reduce((sum, b) => sum + (b.impressions || 0), 0) || 0,
      totalClicks: statsData?.reduce((sum, b) => sum + (b.clicks || 0), 0) || 0,
      avgClickRate: statsData && statsData.length > 0 
        ? (statsData.reduce((sum, b) => sum + (b.clicks || 0), 0) / statsData.reduce((sum, b) => sum + (b.impressions || 0), 1)) * 100 
        : 0
    };

    return NextResponse.json({
      success: true,
      data: banners,
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
    console.error('Error in banners API:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const body = await request.json();
    
    const {
      name,
      title,
      subtitle,
      description,
      imageUrl,
      mobileImageUrl,
      altText,
      buttonText,
      buttonUrl,
      externalLink = false,
      position = 'hero',
      priority = 0,
      isActive = true,
      startDate,
      endDate,
      targetAudience = [],
      targetPages = []
    } = body;

    // Validate required fields
    if (!name || !imageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Name and image URL are required' 
      }, { status: 400 });
    }

    // Create banner
    const bannerData = {
      name,
      title,
      subtitle,
      description,
      image_url: imageUrl,
      mobile_image_url: mobileImageUrl,
      alt_text: altText,
      button_text: buttonText,
      button_url: buttonUrl,
      external_link: externalLink,
      position,
      priority,
      is_active: isActive,
      start_date: startDate,
      end_date: endDate,
      target_audience: targetAudience,
      target_pages: targetPages
    };

    const { data: newBanner, error: bannerError } = await supabase
      .from('banners')
      .insert(bannerData)
      .select()
      .single();

    if (bannerError) {
      console.error('Error creating banner:', bannerError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to create banner' 
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: newBanner
    });

  } catch (error) {
    console.error('Error creating banner:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const position = searchParams.get('position') || '';
    const isActive = searchParams.get('isActive') || '';
    const sortBy = searchParams.get('sortBy') || 'priority';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    
    const skip = (page - 1) * limit;
    const where: any = {};

    // Apply filters
    if (position) {
      where.position = position;
    }

    if (isActive !== '') {
      where.is_active = isActive === 'true';
    }

    const [banners, total] = await Promise.all([
      prisma.banners.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
      prisma.banners.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const allBanners = await prisma.banners.findMany({
      select: {
        is_active: true,
        impressions: true,
        clicks: true,
      },
    });

    const stats = {
      totalBanners: total,
      activeBanners: allBanners.filter(b => b.is_active).length,
      totalImpressions: allBanners.reduce((sum, b) => sum + (b.impressions || 0), 0),
      totalClicks: allBanners.reduce((sum, b) => sum + (b.clicks || 0), 0),
      avgClickRate: allBanners.length > 0 
        ? (allBanners.reduce((sum, b) => sum + (b.clicks || 0), 0) / Math.max(allBanners.reduce((sum, b) => sum + (b.impressions || 0), 0), 1)) * 100 
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
    const newBanner = await prisma.banners.create({
      data: {
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
        start_date: startDate ? new Date(startDate) : null,
        end_date: endDate ? new Date(endDate) : null,
        target_audience: targetAudience,
        target_pages: targetPages
      },
    });

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
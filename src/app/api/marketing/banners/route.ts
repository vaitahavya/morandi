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
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' },
      }),
      prisma.banner.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Calculate summary stats
    const allBanners = await prisma.banner.findMany({
      select: {
        isActive: true,
      },
    });

    const stats = {
      totalBanners: total,
      activeBanners: allBanners.filter(b => b.isActive).length,
      totalImpressions: 0, // Field not in schema
      totalClicks: 0, // Field not in schema
      avgClickRate: 0 // Field not in schema
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
    if (!title || !imageUrl) {
      return NextResponse.json({ 
        success: false, 
        error: 'Title and image URL are required' 
      }, { status: 400 });
    }

    // Create banner
    const newBanner = await prisma.banner.create({
      data: {
        title,
        description,
        image: imageUrl,
        link: buttonUrl,
        position,
        isActive: isActive,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
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
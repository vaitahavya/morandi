import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/debug/db-check
 * Check which database is connected and verify admin user exists
 */
export async function GET() {
  const diagnostics: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    database: {
      urlConfigured: !!process.env.DATABASE_URL,
      urlPreview: process.env.DATABASE_URL 
        ? `${process.env.DATABASE_URL.split('@')[0]}@***` 
        : 'NOT SET',
      urlHost: process.env.DATABASE_URL?.includes('supabase') 
        ? 'Supabase (based on URL pattern)' 
        : process.env.DATABASE_URL?.includes('localhost')
        ? 'Local (localhost)'
        : 'Unknown',
      connected: false,
      error: null as string | null,
    },
    adminUser: {
      exists: false,
      email: null as string | null,
      role: null as string | null,
      error: null as string | null,
    },
    allUsers: {
      count: 0,
      emails: [] as string[],
      error: null as string | null,
    }
  };

  try {
    // Test database connection
    await prisma.$connect();
    diagnostics.database.connected = true;

    // Check if admin user exists
    try {
      const adminUser = await prisma.user.findUnique({
        where: { email: 'admin@morandi.com' },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          emailVerified: true,
          createdAt: true,
        }
      });

      if (adminUser) {
        diagnostics.adminUser.exists = true;
        diagnostics.adminUser.email = adminUser.email;
        diagnostics.adminUser.role = adminUser.role;
        diagnostics.adminUser.name = adminUser.name;
        diagnostics.adminUser.id = adminUser.id;
      } else {
        diagnostics.adminUser.exists = false;
        diagnostics.adminUser.error = 'Admin user not found in database';
      }
    } catch (error: any) {
      diagnostics.adminUser.error = error.message;
    }

    // List all users (limited to first 10)
    try {
      const users = await prisma.user.findMany({
        take: 10,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' }
      });

      diagnostics.allUsers.count = users.length;
      diagnostics.allUsers.emails = users.map(u => ({
        email: u.email,
        role: u.role,
        name: u.name,
        createdAt: u.createdAt
      }));

      // Get total count
      const totalUsers = await prisma.user.count();
      diagnostics.allUsers.totalCount = totalUsers;
    } catch (error: any) {
      diagnostics.allUsers.error = error.message;
    }

    // Get database info from connection string
    if (process.env.DATABASE_URL) {
      try {
        const dbUrl = process.env.DATABASE_URL;
        // Extract host from connection string
        const hostMatch = dbUrl.match(/@([^:]+)/);
        if (hostMatch) {
          diagnostics.database.host = hostMatch[1];
          
          // Determine database type
          if (hostMatch[1].includes('supabase')) {
            diagnostics.database.type = 'Supabase PostgreSQL';
          } else if (hostMatch[1].includes('localhost') || hostMatch[1].includes('127.0.0.1')) {
            diagnostics.database.type = 'Local PostgreSQL';
          } else {
            diagnostics.database.type = 'PostgreSQL (remote)';
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Database connection check completed',
      ...diagnostics,
    });

  } catch (error: any) {
    diagnostics.database.connected = false;
    diagnostics.database.error = error.message;

    return NextResponse.json({
      success: false,
      error: error.message,
      ...diagnostics,
    }, { status: 500 });
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      // Ignore disconnect errors
    }
  }
}










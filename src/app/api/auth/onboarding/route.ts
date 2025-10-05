import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { name, phone, preferences } = await request.json();

    // Update user profile
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone,
        updatedAt: new Date(),
      },
    });

    // Store preferences (you might want to create a separate preferences table)
    // For now, we'll store them in a JSON field or handle them as needed
    console.log('User preferences:', preferences);

    return NextResponse.json(
      { message: 'Onboarding completed successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

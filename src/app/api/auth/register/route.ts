import { NextRequest, NextResponse } from 'next/server';
import { userService } from '@/services';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Create user using service layer (includes all validation)
    const user = await userService.createUser({
      name,
      email,
      password,
      role: 'customer',
    });

    // Send welcome email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Morandi Lifestyle!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #333;">Welcome to Morandi Lifestyle!</h1>
            <p>Hi ${user.name},</p>
            <p>Thank you for joining our community! We're excited to have you with us.</p>
            <p>Start exploring our collection of comfortable maternity and baby apparel.</p>
            <a href="${process.env.NEXTAUTH_URL}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 20px 0;">Shop Now</a>
            <p>Best regards,<br>The Morandi Team</p>
          </div>
        `,
        type: 'welcome',
        userId: user.id,
      });
    } catch (emailError) {
      console.error('Welcome email error:', emailError);
      // Don't fail registration if email fails
    }

    return NextResponse.json(
      { 
        message: 'User created successfully',
        redirectUrl: '/auth/signup-success'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getOrderConfirmationEmail, getOrderShippedEmail, getProductRecommendationEmail } from '@/lib/email';
import { prisma } from '@/lib/db';
import { getPersonalizedRecommendations } from '@/lib/recommendations';

export async function POST(request: NextRequest) {
  try {
    const { type, userId, orderId, email } = await request.json();

    if (!type || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let emailData;

    switch (type) {
      case 'order_confirmation':
        if (!orderId) {
          return NextResponse.json(
            { error: 'Order ID required for order confirmation' },
            { status: 400 }
          );
        }

        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        });

        if (!order) {
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }

        const confirmationEmail = getOrderConfirmationEmail(order, order.user);
        emailData = {
          to: email,
          subject: confirmationEmail.subject,
          html: confirmationEmail.html,
          type: 'order_confirmation',
          userId: order.userId,
          orderId: orderId,
        };
        break;

      case 'order_shipped':
        if (!orderId) {
          return NextResponse.json(
            { error: 'Order ID required for shipping notification' },
            { status: 400 }
          );
        }

        const shippedOrder = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            user: true,
          },
        });

        if (!shippedOrder) {
          return NextResponse.json(
            { error: 'Order not found' },
            { status: 404 }
          );
        }

        const shippedEmail = getOrderShippedEmail(shippedOrder, shippedOrder.user);
        emailData = {
          to: email,
          subject: shippedEmail.subject,
          html: shippedEmail.html,
          type: 'order_shipped',
          userId: shippedOrder.userId,
          orderId: orderId,
        };
        break;

      case 'product_recommendation':
        if (!userId) {
          return NextResponse.json(
            { error: 'User ID required for product recommendations' },
            { status: 400 }
          );
        }

        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!user) {
          return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
          );
        }

        const recommendations = await getPersonalizedRecommendations(userId, 5);
        const recommendationEmail = getProductRecommendationEmail(user, recommendations);
        emailData = {
          to: email,
          subject: recommendationEmail.subject,
          html: recommendationEmail.html,
          type: 'product_recommendation',
          userId: userId,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json(
        { message: 'Email sent successfully' },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Email notification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 
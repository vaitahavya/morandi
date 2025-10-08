import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, getOrderConfirmationEmail, getOrderShippedEmail, getProductRecommendationEmail } from '@/lib/email';
import { prisma } from '@/lib/db';

// POST /api/notifications/send
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, recipient, orderId, userId, data } = body;

    if (!type || !recipient) {
      return NextResponse.json(
        { success: false, error: 'Type and recipient are required' },
        { status: 400 }
      );
    }

    let emailTemplate;
    let emailData = {
      to: recipient,
      userId: userId,
      orderId: orderId,
      type: type,
      subject: '',
      html: ''
    };

    switch (type) {
      case 'order_confirmation':
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: 'Order ID is required for order confirmation' },
            { status: 400 }
          );
        }

        // Fetch order details
        const order = await prisma.order.findUnique({
          where: { id: orderId },
          include: {
            order_items: {
              include: {
                products: true
              }
            }
          }
        });

        if (!order) {
          return NextResponse.json(
            { success: false, error: 'Order not found' },
            { status: 404 }
          );
        }

        const user = { name: data?.userName, email: recipient };
        emailTemplate = getOrderConfirmationEmail(order, user);
        break;

      case 'order_shipped':
        if (!orderId) {
          return NextResponse.json(
            { success: false, error: 'Order ID is required for shipping notification' },
            { status: 400 }
          );
        }

        const shippedOrder = await prisma.order.findUnique({
          where: { id: orderId }
        });

        if (!shippedOrder) {
          return NextResponse.json(
            { success: false, error: 'Order not found' },
            { status: 404 }
          );
        }

        const shippedUser = { name: data?.userName, email: recipient };
        emailTemplate = getOrderShippedEmail(shippedOrder, shippedUser);
        break;

      case 'product_recommendations':
        if (!data?.recommendations) {
          return NextResponse.json(
            { success: false, error: 'Recommendations data is required' },
            { status: 400 }
          );
        }

        const recUser = { name: data?.userName, email: recipient };
        emailTemplate = getProductRecommendationEmail(recUser, data.recommendations);
        break;

      case 'custom':
        if (!data?.subject || !data?.html) {
          return NextResponse.json(
            { success: false, error: 'Subject and HTML content are required for custom emails' },
            { status: 400 }
          );
        }

        emailTemplate = {
          subject: data.subject,
          html: data.html
        };
        break;

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid email type' },
          { status: 400 }
        );
    }

    // Update emailData with template content
    emailData.subject = emailTemplate.subject;
    emailData.html = emailTemplate.html;

    // Send the email
    const result = await sendEmail(emailData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        messageId: result.messageId,
        message: 'Email sent successfully'
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Email API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/notifications/send - Get email notification history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const orderId = searchParams.get('orderId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');

    const where: any = {};
    if (userId) where.userId = userId;
    if (orderId) where.orderId = orderId;
    if (type) where.type = type;

    const notifications = await prisma.emailNotification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: notifications,
      count: notifications.length
    });

  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}